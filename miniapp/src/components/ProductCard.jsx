import { useState } from 'react';
import Img from './Img.jsx';
import { pick, money } from '../lib/i18n.js';
import { haptic } from '../lib/telegram.js';

export default function ProductCard({ product, lang, currency, onOpen, onQuickAdd, isFavorite, onToggleFavorite }) {
  const [added, setAdded] = useState(false);

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(100 - (product.price / product.oldPrice) * 100)
      : 0;

  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
  const soldOut = product.variants?.length > 0 && totalStock === 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (soldOut) return;
    haptic('medium');
    onQuickAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="card" onClick={() => onOpen(product)}>
      <div className="card-img">
        <Img src={product.images?.[0]} alt={pick(product, 'name', lang)} />

        {discount > 0 && <span className="card-badge">−{discount}%</span>}
        {!discount && product.isNew && <span className="card-badge dark">NEW</span>}

        <button
          className="card-fav"
          onClick={(e) => {
            e.stopPropagation();
            haptic('light');
            onToggleFavorite(product.id);
          }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>

        <button className={`card-add ${added ? 'done' : ''}`} onClick={handleAdd}>
          {added ? '✓' : '＋'}
        </button>
      </div>

      <div className="card-name">{pick(product, 'name', lang)}</div>

      <div className="card-prices">
        <span className={discount ? 'price-new' : 'price-plain'}>
          {money(product.price, currency)}
        </span>
        {discount > 0 && <span className="price-old">{money(product.oldPrice, currency)}</span>}
      </div>
    </div>
  );
}
