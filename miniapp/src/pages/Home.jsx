import { StoryBar } from '../components/Stories.jsx';
import ProductCard from '../components/ProductCard.jsx';
import PromoBar from '../components/PromoBar.jsx';

export default function Home({
  t,
  lang,
  user,
  settings,
  stories,
  promos,
  products,
  favorites,
  onOpenStory,
  onOpenProduct,
  onQuickAdd,
  onToggleFavorite,
  onGoCatalog,
}) {
  const hits = products.filter((p) => p.isHit).slice(0, 4);
  const fresh = products.filter((p) => p.isNew).slice(0, 4);
  const initials = (user?.firstName || 'M').charAt(0).toUpperCase();

  const cardProps = {
    lang,
    currency: settings.currency,
    onOpen: onOpenProduct,
    onQuickAdd,
    onToggleFavorite,
  };

  return (
    <div className="page">
      <div className="header">
        <div>
          <h1>
            {t('hello')}, {user?.firstName} 👋
          </h1>
          <p>{t('welcomeText')}</p>
        </div>
        <div className="avatar">{initials}</div>
      </div>

      <StoryBar stories={stories} lang={lang} onOpen={onOpenStory} />

      <div className="hero">
        <h2>{t('newOrder')}</h2>
        <p>{t('heroSub')}</p>
        <button className="btn" onClick={onGoCatalog}>
          {t('catalog')} →
        </button>
      </div>

      <PromoBar promos={promos} lang={lang} currency={settings.currency} t={t} />

      {hits.length > 0 && (
        <div className="section">
          <div className="section-head">
            <span className="section-title">🔥 {t('hits')}</span>
            <button className="link" onClick={onGoCatalog}>
              {t('seeAll')}
            </button>
          </div>
          <div className="grid">
            {hits.map((p) => (
              <ProductCard key={p.id} product={p} isFavorite={favorites.has(p.id)} {...cardProps} />
            ))}
          </div>
        </div>
      )}

      {fresh.length > 0 && (
        <div className="section">
          <div className="section-head">
            <span className="section-title">✨ {t('newArrivals')}</span>
            <button className="link" onClick={onGoCatalog}>
              {t('seeAll')}
            </button>
          </div>
          <div className="grid">
            {fresh.map((p) => (
              <ProductCard key={p.id} product={p} isFavorite={favorites.has(p.id)} {...cardProps} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
