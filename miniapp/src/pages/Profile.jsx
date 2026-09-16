import { useEffect, useState } from 'react';
import Img from '../components/Img.jsx';
import ProductCard from '../components/ProductCard.jsx';
import api from '../lib/api.js';
import { pick, money } from '../lib/i18n.js';
import { haptic } from '../lib/telegram.js';

function formatDate(value) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Profile({
  t,
  lang,
  settings,
  user,
  cart,
  favorites,
  favoriteProducts,
  onToggleFavorite,
  onOpenProduct,
  onQuickAdd,
  onChangeLang,
  onGoCart,
  toast,
}) {
  const [view, setView] = useState('menu'); // menu | orders | favorites
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (view !== 'orders') return;
    setLoading(true);
    api
      .myOrders()
      .then((res) => setOrders(res.orders))
      .catch((err) => toast(err.message))
      .finally(() => setLoading(false));
  }, [view, toast]);

  const reorder = async (orderId) => {
    haptic('medium');
    try {
      const { items, unavailable } = await api.reorder(orderId);
      if (items.length === 0) {
        toast(t('outOfStock'));
        return;
      }
      cart.addMany(items);
      toast(unavailable.length ? `${t('orderAdded')} (${unavailable.length} ✕)` : t('orderAdded'));
      onGoCart();
    } catch (err) {
      toast(err.message);
    }
  };

  /* ---------------- Buyurtmalar ---------------- */
  if (view === 'orders') {
    return (
      <div className="page">
        <div className="header">
          <h1>{t('myOrders')}</h1>
          <button className="link" onClick={() => setView('menu')}>
            ← {t('back')}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : orders.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">📦</div>
            <h3>{t('noOrders')}</h3>
          </div>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-top">
                <div>
                  <div className="order-no">{order.orderNo}</div>
                  <div className="order-date">{formatDate(order.createdAt)}</div>
                </div>
                <span className={`status ${order.status}`}>{t(order.status)}</span>
              </div>

              <div className="order-items">
                {order.items.map((item, i) => (
                  <Img key={i} src={item.image} alt="" />
                ))}
              </div>

              <div className="order-bottom">
                <span className="order-total">{money(order.total, settings.currency)}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => reorder(order.id)}>
                  {t('reorder')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  /* ---------------- Sevimlilar ---------------- */
  if (view === 'favorites') {
    return (
      <div className="page">
        <div className="header">
          <h1>{t('favorites')}</h1>
          <button className="link" onClick={() => setView('menu')}>
            ← {t('back')}
          </button>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">🤍</div>
            <h3>{t('noFavorites')}</h3>
          </div>
        ) : (
          <div className="grid">
            {favoriteProducts.map((p) => (
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

  /* ---------------- Menyu ---------------- */
  return (
    <div className="page">
      <div className="profile-head">
        <div className="avatar">{(user?.firstName || 'M').charAt(0).toUpperCase()}</div>
        <div>
          <h2>
            {user?.firstName} {user?.lastName || ''}
          </h2>
          <p className="muted" style={{ fontSize: 13 }}>
            {user?.phone || (user?.username ? `@${user.username}` : '')}
          </p>
        </div>
      </div>

      <div className="menu">
        <button className="menu-item" onClick={() => setView('orders')}>
          <span>{t('myOrders')}</span>
          <span className="chev">›</span>
        </button>

        <button className="menu-item" onClick={() => setView('favorites')}>
          <span>{t('favorites')}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {favorites.size > 0 && <span className="badge-count">{favorites.size}</span>}
            <span className="chev">›</span>
          </span>
        </button>

        <div className="menu-item">
          <span>{t('language')}</span>
          <div className="lang-switch">
            <button
              className={lang === 'uz' ? 'active' : ''}
              onClick={() => {
                haptic('light');
                onChangeLang('uz');
              }}
            >
              UZ
            </button>
            <button
              className={lang === 'ru' ? 'active' : ''}
              onClick={() => {
                haptic('light');
                onChangeLang('ru');
              }}
            >
              RU
            </button>
          </div>
        </div>
      </div>

      <div className="menu" style={{ marginTop: 14 }}>
        <div className="menu-item" style={{ display: 'block' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{t('contact')}</div>
          <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
            📞 +998 90 123 45 67
            <br />
            🕒 09:00 — 21:00
            <br />
            📍 Toshkent sh.
          </div>
        </div>
      </div>

      <p className="muted" style={{ textAlign: 'center', fontSize: 12, marginTop: 24 }}>
        {settings.shopName} · v1.0
      </p>
    </div>
  );
}
