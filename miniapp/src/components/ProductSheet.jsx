import { useEffect, useMemo, useState } from 'react';
import Img from './Img.jsx';
import { pick, money } from '../lib/i18n.js';
import { haptic } from '../lib/telegram.js';

const SIZE_TABLE = [
  { size: 'S', chest: '88–92', waist: '68–72', eu: '42–44' },
  { size: 'M', chest: '96–100', waist: '76–80', eu: '46–48' },
  { size: 'L', chest: '104–108', waist: '84–88', eu: '50–52' },
  { size: 'XL', chest: '112–116', waist: '92–96', eu: '54–56' },
  { size: 'XXL', chest: '120–124', waist: '100–104', eu: '58–60' },
];

export default function ProductSheet({ product, lang, currency, t, onClose, onAdd, isFavorite, onToggleFavorite }) {
  const [colorHex, setColorHex] = useState(null);
  const [size, setSize] = useState(null);
  const [showSizes, setShowSizes] = useState(false);

  const variants = product?.variants ?? [];

  const colors = useMemo(() => {
    const map = new Map();
    for (const v of variants) {
      if (!map.has(v.colorHex)) map.set(v.colorHex, v);
    }
    return [...map.values()];
  }, [variants]);

  const sizes = useMemo(() => {
    const seen = new Set();
    return variants
      .filter((v) => (colorHex ? v.colorHex === colorHex : true))
      .filter((v) => (seen.has(v.size) ? false : seen.add(v.size)));
  }, [variants, colorHex]);

  // Birinchi mavjud rang/o'lchamni avtomatik tanlaymiz
  useEffect(() => {
    const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
    setColorHex(firstAvailable?.colorHex ?? null);
    setSize(null);
    setShowSizes(false);
  }, [product?.id]);

  const selected = variants.find((v) => v.colorHex === colorHex && v.size === size) ?? null;
  const needsVariant = variants.length > 0;
  const canAdd = !needsVariant || Boolean(selected && selected.stock > 0);

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(100 - (product.price / product.oldPrice) * 100)
      : 0;

  const images = product.images?.length ? product.images : [null];
  const features = lang === 'ru' ? product.featuresRu : product.featuresUz;
  const material = pick(product, 'material', lang);

  const handleAdd = () => {
    haptic('success');
    onAdd({
      productId: product.id,
      variantId: selected?.id ?? null,
      nameUz: product.nameUz,
      nameRu: product.nameRu,
      image: product.images?.[0] ?? null,
      size: selected?.size ?? null,
      colorUz: selected?.colorUz ?? null,
      colorRu: selected?.colorRu ?? null,
      colorHex: selected?.colorHex ?? null,
      price: product.price,
    });
    onClose();
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />

        <div className="sheet-body">
          <div className="gallery">
            {images.map((src, i) => (
              <Img key={i} src={src} alt={pick(product, 'name', lang)} />
            ))}
          </div>

          {product.brand && <div className="brand">{product.brand}</div>}

          <h2>{pick(product, 'name', lang)}</h2>

          <div className="card-prices" style={{ marginTop: 8 }}>
            <span className={discount ? 'price-new' : 'price-plain'} style={{ fontSize: 19 }}>
              {money(product.price, currency)}
            </span>
            {discount > 0 && (
              <>
                <span className="price-old" style={{ fontSize: 14 }}>
                  {money(product.oldPrice, currency)}
                </span>
                <span className="card-badge" style={{ position: 'static' }}>
                  −{discount}%
                </span>
              </>
            )}
            <button
              style={{ marginLeft: 'auto', fontSize: 20 }}
              onClick={() => {
                haptic('light');
                onToggleFavorite(product.id);
              }}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          <p className="desc">{pick(product, 'desc', lang)}</p>

          {colors.length > 1 && (
            <>
              <div className="opt-label">
                <span>
                  {t('color')}
                  {colorHex && (
                    <span className="muted" style={{ fontWeight: 400 }}>
                      {' '}
                      · {pick(colors.find((c) => c.colorHex === colorHex), 'color', lang)}
                    </span>
                  )}
                </span>
              </div>
              <div className="colors">
                {colors.map((c) => (
                  <button
                    key={c.colorHex}
                    className={`color-btn ${colorHex === c.colorHex ? 'active' : ''}`}
                    style={{ background: c.colorHex }}
                    title={pick(c, 'color', lang)}
                    onClick={() => {
                      haptic('light');
                      setColorHex(c.colorHex);
                      setSize(null);
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {sizes.length > 0 && (
            <>
              <div className="opt-label">
                <span>{t('size')}</span>
                <button onClick={() => setShowSizes((v) => !v)}>{t('sizeGuide')}</button>
              </div>

              <div className="sizes">
                {sizes.map((v) => (
                  <button
                    key={v.id}
                    className={`size-btn ${size === v.size ? 'active' : ''}`}
                    disabled={v.stock === 0}
                    onClick={() => {
                      haptic('light');
                      setSize(v.size);
                    }}
                  >
                    {v.size}
                  </button>
                ))}
              </div>

              {selected && selected.stock > 0 && selected.stock <= 3 && (
                <div className="stock-note">
                  ⚡️ {selected.stock} {t('left')}
                </div>
              )}

              {showSizes && (
                <table className="size-table">
                  <thead>
                    <tr>
                      <th>{t('size')}</th>
                      <th>Ko‘krak (sm)</th>
                      <th>Bel (sm)</th>
                      <th>EU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_TABLE.map((row) => (
                      <tr key={row.size}>
                        <td style={{ fontWeight: 600 }}>{row.size}</td>
                        <td>{row.chest}</td>
                        <td>{row.waist}</td>
                        <td>{row.eu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {features?.length > 0 && (
            <>
              <div className="opt-label">
                <span>{t('composition')}</span>
              </div>
              <ul className="features">
                {features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
                {material && <li>{material}</li>}
              </ul>
            </>
          )}
        </div>

        <div className="sheet-cta">
          <button className="btn" disabled={!canAdd} onClick={handleAdd}>
            {canAdd
              ? `${t('addToCart')} — ${money(product.price, currency)}`
              : needsVariant && !size
                ? t('chooseSize')
                : t('outOfStock')}
          </button>
        </div>
      </div>
    </>
  );
}
