import { useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { pick } from '../lib/i18n.js';
import { haptic } from '../lib/telegram.js';

const SORTS = [
  { key: 'new', label: 'sortNew' },
  { key: 'popular', label: 'sortPopular' },
  { key: 'cheap', label: 'sortCheap' },
  { key: 'expensive', label: 'sortExpensive' },
];

export default function Catalog({
  t,
  lang,
  settings,
  categories,
  products,
  favorites,
  loading,
  filters,
  onFilterChange,
  onOpenProduct,
  onQuickAdd,
  onToggleFavorite,
}) {
  const [searchDraft, setSearchDraft] = useState(filters.search || '');

  const submitSearch = (value) => {
    setSearchDraft(value);
    clearTimeout(window.__searchTimer);
    window.__searchTimer = setTimeout(() => onFilterChange({ search: value }), 350);
  };

  return (
    <div className="page">
      <div className="header">
        <h1>{t('catalog')}</h1>
      </div>

      <div className="search">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          value={searchDraft}
          onChange={(e) => submitSearch(e.target.value)}
          placeholder={t('search')}
        />
      </div>

      <div className="chips" style={{ marginTop: 14 }}>
        <button
          className={`chip ${!filters.category ? 'active' : ''}`}
          onClick={() => {
            haptic('light');
            onFilterChange({ category: '' });
          }}
        >
          {t('all')}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip ${String(filters.category) === String(c.id) ? 'active' : ''}`}
            onClick={() => {
              haptic('light');
              onFilterChange({ category: c.id });
            }}
          >
            {c.emoji} {pick(c, 'name', lang)}
          </button>
        ))}
      </div>

      <div className="chips" style={{ marginTop: 8 }}>
        {SORTS.map((s) => (
          <button
            key={s.key}
            className={`chip ${filters.sort === s.key ? 'active' : ''}`}
            onClick={() => {
              haptic('light');
              onFilterChange({ sort: s.key });
            }}
          >
            {t(s.label)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div className="empty">
          <div className="empty-ico">🔍</div>
          <h3>{t('nothingFound')}</h3>
          <p>{t('tryAnother')}</p>
        </div>
      ) : (
        <div className="grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              lang={lang}
              currency={settings.currency}
              isFavorite={favorites.has(p.id)}
              onOpen={onOpenProduct}
              onQuickAdd={onQuickAdd}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
