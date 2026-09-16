import { useState } from 'react';
import ImageUploader from '../components/ImageUploader.jsx';

const EMPTY = {
  nameUz: '',
  nameRu: '',
  descUz: '',
  descRu: '',
  featuresUz: '',
  featuresRu: '',
  images: '',
  price: '',
  oldPrice: '',
  brand: '',
  materialUz: '',
  materialRu: '',
  categoryId: '',
  isActive: true,
  isNew: false,
  isHit: false,
};

const toForm = (product) =>
  product
    ? {
        nameUz: product.nameUz,
        nameRu: product.nameRu,
        descUz: product.descUz,
        descRu: product.descRu,
        featuresUz: (product.featuresUz || []).join('\n'),
        featuresRu: (product.featuresRu || []).join('\n'),
        images: (product.images || []).join('\n'),
        price: product.price,
        oldPrice: product.oldPrice ?? '',
        brand: product.brand ?? '',
        materialUz: product.materialUz ?? '',
        materialRu: product.materialRu ?? '',
        categoryId: product.categoryId,
        isActive: product.isActive,
        isNew: product.isNew,
        isHit: product.isHit,
      }
    : EMPTY;

const NEW_VARIANT = { size: '', colorUz: '', colorRu: '', colorHex: '#000000', stock: 0 };

export default function ProductForm({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState(() => toForm(product));
  const [variants, setVariants] = useState(
    () =>
      product?.variants?.map((v) => ({
        size: v.size,
        colorUz: v.colorUz,
        colorRu: v.colorRu,
        colorHex: v.colorHex,
        stock: v.stock,
      })) ?? [{ ...NEW_VARIANT }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setVariant = (index, key, value) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [key]: value } : v)));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nameUz.trim()) return setError('Mahsulot nomini kiriting');
    if (!form.categoryId) return setError('Kategoriyani tanlang');
    if (!Number(form.price)) return setError('Narxni kiriting');

    setSaving(true);
    try {
      await onSave({
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        categoryId: Number(form.categoryId),
        variants: variants.filter((v) => v.size.trim()),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <h2>{product ? '✏️ Mahsulotni tahrirlash' : '➕ Yangi mahsulot'}</h2>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert error">{error}</div>}

          <div className="form-grid">
            <div className="form-row">
              <label>Nomi (UZ) *</label>
              <input type="text" value={form.nameUz} onChange={set('nameUz')} />
            </div>
            <div className="form-row">
              <label>Nomi (RU)</label>
              <input type="text" value={form.nameRu} onChange={set('nameRu')} />
            </div>

            <div className="form-row">
              <label>Kategoriya *</label>
              <select value={form.categoryId} onChange={set('categoryId')}>
                <option value="">— tanlang —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.nameUz}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Brend</label>
              <input type="text" value={form.brand} onChange={set('brand')} />
            </div>

            <div className="form-row">
              <label>Narxi (so'm) *</label>
              <input type="number" value={form.price} onChange={set('price')} />
            </div>
            <div className="form-row">
              <label>
                Eski narxi <span className="hint">— chegirma ko‘rsatish uchun</span>
              </label>
              <input type="number" value={form.oldPrice} onChange={set('oldPrice')} />
            </div>

            <div className="form-row full">
              <label>Rasmlar</label>
              <ImageUploader
                value={form.images}
                onChange={(images) => setForm((f) => ({ ...f, images }))}
              />
            </div>

            <div className="form-row">
              <label>Tavsif (UZ)</label>
              <textarea value={form.descUz} onChange={set('descUz')} />
            </div>
            <div className="form-row">
              <label>Tavsif (RU)</label>
              <textarea value={form.descRu} onChange={set('descRu')} />
            </div>

            <div className="form-row">
              <label>
                Xususiyatlari (UZ) <span className="hint">— har biri yangi qatordan</span>
              </label>
              <textarea value={form.featuresUz} onChange={set('featuresUz')} />
            </div>
            <div className="form-row">
              <label>Xususiyatlari (RU)</label>
              <textarea value={form.featuresRu} onChange={set('featuresRu')} />
            </div>

            <div className="form-row">
              <label>Mato (UZ)</label>
              <input type="text" value={form.materialUz} onChange={set('materialUz')} />
            </div>
            <div className="form-row">
              <label>Mato (RU)</label>
              <input type="text" value={form.materialRu} onChange={set('materialRu')} />
            </div>

            <div className="form-row full">
              <label>
                O‘lcham va rang variantlari{' '}
                <span className="hint">— ombordagi soni bilan</span>
              </label>

              <div className="variant-row" style={{ marginBottom: 4 }}>
                <span className="hint">O‘lcham</span>
                <span className="hint">Rang (UZ / RU)</span>
                <span className="hint">Rang</span>
                <span className="hint">Soni</span>
                <span />
              </div>

              {variants.map((v, i) => (
                <div className="variant-row" key={i}>
                  <input
                    type="text"
                    placeholder="M"
                    value={v.size}
                    onChange={(e) => setVariant(i, 'size', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Qora / Чёрный"
                    value={v.colorUz}
                    onChange={(e) => {
                      setVariant(i, 'colorUz', e.target.value);
                      if (!v.colorRu) setVariant(i, 'colorRu', e.target.value);
                    }}
                  />
                  <input
                    type="color"
                    value={v.colorHex}
                    onChange={(e) => setVariant(i, 'colorHex', e.target.value)}
                  />
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => setVariant(i, 'stock', Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 6, alignSelf: 'flex-start' }}
                onClick={() => setVariants([...variants, { ...NEW_VARIANT }])}
              >
                + Variant qo‘shish
              </button>
            </div>

            <div className="form-row full">
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <label className="checkbox">
                  <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
                  Sotuvda
                </label>
                <label className="checkbox">
                  <input type="checkbox" checked={form.isNew} onChange={set('isNew')} />
                  Yangi (NEW belgisi)
                </label>
                <label className="checkbox">
                  <input type="checkbox" checked={form.isHit} onChange={set('isHit')} />
                  Hit (bosh sahifada)
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Bekor qilish
          </button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}
