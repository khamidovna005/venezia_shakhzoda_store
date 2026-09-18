import { useCallback, useEffect, useRef, useState } from 'react';

import api from './lib/api.js';
import { useCart } from './lib/cart.js';
import { createT, pick, money } from './lib/i18n.js';
import { tg, initTelegram, haptic, closeApp } from './lib/telegram.js';

import Onboarding from './pages/Onboarding.jsx';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import Cart from './pages/Cart.jsx';
import Profile from './pages/Profile.jsx';

import BottomNav from './components/BottomNav.jsx';
import ProductSheet from './components/ProductSheet.jsx';
import { StoryViewer } from './components/Stories.jsx';

const INTRO_KEY = 'zb_intro_done';

export default function App() {
  const [boot, setBoot] = useState({ status: 'loading', error: null });
  const [data, setData] = useState(null);
  const [lang, setLang] = useState('uz');

  const [tab, setTab] = useState('home');
  const [showIntro, setShowIntro] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [filters, setFilters] = useState({ category: '', search: '', sort: 'new' });

  const [favorites, setFavorites] = useState(new Set());
  const [favoriteProducts, setFavoriteProducts] = useState([]);

  const [sheetProduct, setSheetProduct] = useState(null);
  const [storyIndex, setStoryIndex] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const cart = useCart();
  const t = createT(lang);
  const toastTimer = useRef(null);

  /* ------------------------------------------------------------ */
  /*  Toast                                                        */
  /* ------------------------------------------------------------ */
  const toast = useCallback((message) => {
    setToastMsg(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2200);
  }, []);

  /* ------------------------------------------------------------ */
  /*  Boshlang'ich yuklash                                         */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    initTelegram();

    (async () => {
      try {
        const res = await api.init();
        setData(res);
        setLang(res.user.language === 'ru' ? 'ru' : 'uz');
        setShowIntro(!res.user.seenIntro && !localStorage.getItem(INTRO_KEY));
        setBoot({ status: 'ready', error: null });

        api
          .favorites()
          .then((fav) => {
            setFavoriteProducts(fav.products);
            setFavorites(new Set(fav.products.map((p) => p.id)));
          })
          .catch(() => {});
      } catch (err) {
        setBoot({ status: 'error', error: err.message });
      }
    })();
  }, []);

  /* ------------------------------------------------------------ */
  /*  Katalog yuklash                                              */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    if (boot.status !== 'ready') return;
    setProductsLoading(true);
    api
      .products(filters)
      .then((res) => setProducts(res.products))
      .catch((err) => toast(err.message))
      .finally(() => setProductsLoading(false));
  }, [filters, boot.status, toast]);

  /* ------------------------------------------------------------ */
  /*  Telegram "Orqaga" tugmasi                                    */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    if (!tg?.BackButton) return;
    const shouldShow = Boolean(sheetProduct) || tab !== 'home';

    const goBack = () => {
      if (sheetProduct) setSheetProduct(null);
      else setTab('home');
    };

    if (shouldShow) tg.BackButton.show();
    else tg.BackButton.hide();

    tg.BackButton.onClick(goBack);
    return () => tg.BackButton.offClick(goBack);
  }, [sheetProduct, tab]);

  /* ------------------------------------------------------------ */
  /*  Amallar                                                      */
  /* ------------------------------------------------------------ */
  const finishIntro = () => {
    localStorage.setItem(INTRO_KEY, '1');
    setShowIntro(false);
    api.updateProfile({ seenIntro: true }).catch(() => {});
  };

  const changeLang = (next) => {
    setLang(next);
    api.updateProfile({ language: next }).catch(() => {});
  };

  const toggleFavorite = async (productId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
    try {
      await api.toggleFavorite(productId);
      const fav = await api.favorites();
      setFavoriteProducts(fav.products);
      setFavorites(new Set(fav.products.map((p) => p.id)));
    } catch (err) {
      toast(err.message);
    }
  };

  /** Kartadagi ➕ — birinchi mavjud o'lcham/rangni avtomatik tanlaydi */
  const quickAdd = (product) => {
    const variant = product.variants?.find((v) => v.stock > 0) ?? null;

    if (product.variants?.length > 0 && !variant) {
      toast(t('outOfStock'));
      return;
    }

    cart.add({
      productId: product.id,
      variantId: variant?.id ?? null,
      nameUz: product.nameUz,
      nameRu: product.nameRu,
      image: product.images?.[0] ?? null,
      size: variant?.size ?? null,
      colorUz: variant?.colorUz ?? null,
      colorRu: variant?.colorRu ?? null,
      colorHex: variant?.colorHex ?? null,
      price: product.price,
    });

    toast(`${pick(product, 'name', lang)} — ${t('added')}`);
  };

  const addFromSheet = (item) => {
    cart.add(item);
    toast(`${pick(item, 'name', lang)} — ${t('added')}`);
  };

  /* ------------------------------------------------------------ */
  /*  Ekranlar                                                     */
  /* ------------------------------------------------------------ */
  if (boot.status === 'loading') {
    return (
      <div className="center-screen">
        <div>
          <div className="spinner" />
          <p className="muted">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (boot.status === 'error') {
    return (
      <div className="center-screen">
        <div>
          <div className="empty-ico">⚠️</div>
          <h3>Xatolik</h3>
          <p className="muted" style={{ margin: '8px 0 20px' }}>
            {boot.error}
          </p>
          <button className="btn" onClick={() => window.location.reload()}>
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return <Onboarding t={t} onFinish={finishIntro} />;
  }

  const { user, categories, stories, settings, upsell, promos } = data;

  const shared = {
    t,
    lang,
    settings,
    favorites,
    onOpenProduct: (product) => {
      haptic('light');
      setSheetProduct(product);
    },
    onQuickAdd: quickAdd,
    onToggleFavorite: toggleFavorite,
  };

  return (
    <div className="app">
      {tab === 'home' && (
        <Home
          {...shared}
          user={user}
          stories={stories}
          promos={promos}
          products={products}
          onOpenStory={setStoryIndex}
          onGoCatalog={() => setTab('catalog')}
        />
      )}

      {tab === 'catalog' && (
        <Catalog
          {...shared}
          categories={categories}
          products={products}
          loading={productsLoading}
          filters={filters}
          onFilterChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        />
      )}

      {tab === 'cart' && (
        <Cart
          t={t}
          lang={lang}
          settings={settings}
          user={user}
          cart={cart}
          upsell={upsell}
          toast={toast}
          onGoCatalog={() => setTab('catalog')}
          onSuccess={setSuccessOrder}
        />
      )}

      {tab === 'profile' && (
        <Profile
          {...shared}
          user={user}
          cart={cart}
          favoriteProducts={favoriteProducts}
          onChangeLang={changeLang}
          onGoCart={() => setTab('cart')}
          toast={toast}
        />
      )}

      <BottomNav tab={tab} onChange={setTab} cartCount={cart.count} t={t} />

      {sheetProduct && (
        <ProductSheet
          product={sheetProduct}
          lang={lang}
          currency={settings.currency}
          t={t}
          isFavorite={favorites.has(sheetProduct.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSheetProduct(null)}
          onAdd={addFromSheet}
        />
      )}

      {storyIndex !== null && stories.length > 0 && (
        <StoryViewer
          stories={stories}
          startIndex={storyIndex}
          lang={lang}
          onClose={() => setStoryIndex(null)}
        />
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}

      {successOrder && (
        <div className="success-screen">
          <div>
            <div className="success-ico">✓</div>
            <h2>{t('orderSuccess')}</h2>
            <p>{t('orderSuccessText')}</p>
            <p style={{ marginTop: 14, fontWeight: 650 }}>
              {successOrder.orderNo} · {money(successOrder.total, settings.currency)}
            </p>
            <button
              className="btn"
              style={{ marginTop: 26 }}
              onClick={() => {
                if (tg) closeApp();
                else {
                  setSuccessOrder(null);
                  setTab('home');
                }
              }}
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
