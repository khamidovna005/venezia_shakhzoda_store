import { useEffect, useState } from 'react';
import ImageUploader from '../components/ImageUploader.jsx';
import { api } from '../lib/api.js';
import { useLang } from '../lib/lang.jsx';
import { pick } from '../lib/i18n.js';

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
  const { t, lang } = useLang();
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

  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiBusy, setAiBusy] = useState('');

  useEffect(() => {
    api.aiStatus().then((r) => setAiEnabled(r.enabled)).catch(() => setAiEnabled(false));
  }, []);

  /** Birinchi rasmga qarab butun kartochkani to'ldiradi */
  async function fillFromImage() {
    const firstImage = form.images.split('\n').map((s) => s.trim()).filter(Boolean)[0];
    if (!firstImage) return setError(t('aiNeedImage'));

    setError('');
    setAiBusy('product');
    try {
      const { product: p } = await api.aiProduct(firstImage);
      setForm((f) => ({
        ...f,
        nameUz: p.nameUz,
        nameRu: p.nameRu,
        descUz: p.descUz,
        descRu: p.descRu,
        featuresUz: (p.featuresUz || []).join('\n'),
        featuresRu: (p.featuresRu || []).join('\n'),
        materialUz: p.materialUz,
        materialRu: p.materialRu,
        categoryId: p.categoryId ?? f.categoryId,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setAiBusy('');
    }
  }

  /** O'zbekcha matnlardan ruschasini yozadi */
  async function fillRussian() {
    if (!form.nameUz.trim()) return setError(t('aiNeedUzName'));

    setError('');
    setAiBusy('translate');
    try {
      const { translation } = await api.aiTranslate({
        nameUz: form.nameUz,
        descUz: form.descUz,
        featuresUz: form.featuresUz.split('\n').filter(Boolean),
        materialUz: form.materialUz,
      });
      setForm((f) => ({
        ...f,
        nameRu: translation.nameRu,
        descRu: translation.descRu,
        featuresRu: (translation.featuresRu || []).join('\n'),
        materialRu: translation.materialRu,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setAiBusy('');
    }
  }

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

    if (!form.nameUz.trim()) return setError(t('errNeedName'));
    if (!form.categoryId) return setError(t('errNeedCategory'));
    if (!Number(form.price)) return setError(t('errNeedPrice'));

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
          <h2>{product ? t('formEdit') : t('formNew')}</h2>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert error">{error}</div>}

          <div className="form-grid">
            <div className="form-row">
              <label>{t('fNameUz')}</label>
              <input type="text" value={form.nameUz} onChange={set('nameUz')} />
            </div>
            <div className="form-row">
              <label>{t('fNameRu')}</label>
              <input type="text" value={form.nameRu} onChange={set('nameRu')} />
            </div>

            <div className="form-row">
              <label>{t('fCategory')}</label>
              <select value={form.categoryId} onChange={set('categoryId')}>
                <option value="">{t('fChoose')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {pick(c, 'name', lang)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>{t('fBrand')}</label>
              <input type="text" value={form.brand} onChange={set('brand')} />
            </div>

            <div className="form-row">
              <label>{t('fPrice')}</label>
              <input type="number" value={form.price} onChange={set('price')} />
            </div>
            <div className="form-row">
              <label>
                {t('fOldPrice')} <span className="hint">{t('fOldPriceHint')}</span>
              </label>
              <input type="number" value={form.oldPrice} onChange={set('oldPrice')} />
            </div>

            <div className="form-row full">
              <label>{t('fImages')}</label>
              <ImageUploader
                value={form.images}
                onChange={(images) => setForm((f) => ({ ...f, images }))}
              />
            </div>

            {aiEnabled && (
              <div className="form-row full">
                <div className="ai-bar">
                  <div className="ai-bar-text">
                    <b>{t('aiTitle')}</b>
                    <span className="hint">{t('aiHint')}</span>
                  </div>
                  <div className="ai-bar-actions">
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={fillFromImage}
                      disabled={Boolean(aiBusy)}
                    >
                      {aiBusy === 'product' ? t('aiWriting') : t('aiFromImage')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={fillRussian}
                      disabled={Boolean(aiBusy)}
                    >
                      {aiBusy === 'translate' ? t('aiTranslating') : t('aiRussian')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="form-row">
              <label>{t('fDescUz')}</label>
              <textarea value={form.descUz} onChange={set('descUz')} />
            </div>
            <div className="form-row">
              <label>{t('fDescRu')}</label>
              <textarea value={form.descRu} onChange={set('descRu')} />
            </div>

            <div className="form-row">
              <label>
                {t('fFeaturesUz')} <span className="hint">{t('fFeaturesHint')}</span>
              </label>
              <textarea value={form.featuresUz} onChange={set('featuresUz')} />
            </div>
            <div className="form-row">
              <label>{t('fFeaturesRu')}</label>
              <textarea value={form.featuresRu} onChange={set('featuresRu')} />
            </div>

            <div className="form-row">
              <label>{t('fMaterialUz')}</label>
              <input type="text" value={form.materialUz} onChange={set('materialUz')} />
            </div>
            <div className="form-row">
              <label>{t('fMaterialRu')}</label>
              <input type="text" value={form.materialRu} onChange={set('materialRu')} />
            </div>

            <div className="form-row full">
              <label>
                {t('fVariants')} <span className="hint">{t('fVariantsHint')}</span>
              </label>

              <div className="variant-row" style={{ marginBottom: 4 }}>
                <span className="hint">{t('fSize')}</span>
                <span className="hint">{t('fColorBoth')}</span>
                <span className="hint">{t('fColor')}</span>
                <span className="hint">{t('fCount')}</span>
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
                {t('fAddVariant')}
              </button>
            </div>

            <div className="form-row full">
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <label className="checkbox">
                  <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
                  {t('onSale')}
                </label>
                <label className="checkbox">
                  <input type="checkbox" checked={form.isNew} onChange={set('isNew')} />
                  {t('fIsNew')}
                </label>
                <label className="checkbox">
                  <input type="checkbox" checked={form.isHit} onChange={set('isHit')} />
                  {t('fIsHit')}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </form>
    </div>
  );
}
