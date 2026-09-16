import { useCallback, useEffect, useRef, useState } from 'react';

import api, { getToken, clearToken } from './lib/api.js';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Orders from './pages/Orders.jsx';
import Products from './pages/Products.jsx';
import Categories from './pages/Categories.jsx';
import Promos from './pages/Promos.jsx';
import Customers from './pages/Customers.jsx';

const NAV = [
  { key: 'dashboard', icon: '📊', label: 'Boshqaruv' },
  { key: 'orders', icon: '🧾', label: 'Buyurtmalar' },
  { key: 'products', icon: '👕', label: 'Mahsulotlar' },
  { key: 'categories', icon: '🏷', label: 'Kategoriyalar' },
  { key: 'promos', icon: '🎟', label: 'Promokodlar' },
  { key: 'customers', icon: '👥', label: 'Mijozlar' },
];

export default function App() {
  const [auth, setAuth] = useState({ status: 'checking' });
  const [shop, setShop] = useState({ shopName: 'Admin', currency: "so'm" });
  const [page, setPage] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);

  const toast = useCallback((message) => {
    setToastMsg(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 3200);
  }, []);

  /* ---------------- Kirish tekshiruvi ---------------- */
  useEffect(() => {
    if (!getToken()) {
      setAuth({ status: 'anon' });
      return;
    }

    api
      .me()
      .then((res) => {
        setShop({ shopName: res.shopName, currency: res.currency });
        setAuth({ status: 'ok' });
      })
      .catch(() => setAuth({ status: 'anon' }));
  }, []);

  /* ---------------- Sessiya tugasa, kirish oynasiga qaytamiz ---------------- */
  useEffect(() => {
    const onLogout = () => setAuth({ status: 'anon' });
    window.addEventListener('admin-logout', onLogout);
    return () => window.removeEventListener('admin-logout', onLogout);
  }, []);

  /* ---------------- Statistika (avtomatik yangilanadi) ---------------- */
  const loadStats = useCallback(() => {
    api
      .stats()
      .then((res) => setStats(res.stats))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (auth.status !== 'ok') return;
    loadStats();
    const timer = setInterval(loadStats, 15000);
    return () => clearInterval(timer);
  }, [auth.status, loadStats]);

  if (auth.status === 'checking') {
    return <div className="spinner" />;
  }

  if (auth.status === 'anon') {
    return (
      <Login
        onSuccess={(info) => {
          setShop(info);
          setAuth({ status: 'ok' });
        }}
      />
    );
  }

  const logout = () => {
    if (!confirm('Tizimdan chiqasizmi?')) return;
    clearToken();
    window.location.reload();
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          🛍 <span>{shop.shopName}</span>
        </div>

        {NAV.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${page === item.key ? 'active' : ''}`}
            onClick={() => setPage(item.key)}
          >
            <span>{item.icon}</span>
            <span className="label">{item.label}</span>
            {item.key === 'orders' && stats?.newOrders > 0 && (
              <span className="nav-count">{stats.newOrders}</span>
            )}
          </button>
        ))}

        <div className="sidebar-foot">
          <button className="nav-item" onClick={logout} style={{ padding: '8px 10px' }}>
            <span>🚪</span>
            <span className="label">Chiqish</span>
          </button>
        </div>
      </aside>

      <main className="main">
        {page === 'dashboard' && (
          <Dashboard
            stats={stats}
            currency={shop.currency}
            onGoOrders={() => setPage('orders')}
          />
        )}
        {page === 'orders' && (
          <Orders currency={shop.currency} toast={toast} onChanged={loadStats} />
        )}
        {page === 'products' && <Products currency={shop.currency} toast={toast} />}
        {page === 'categories' && <Categories toast={toast} />}
        {page === 'promos' && <Promos currency={shop.currency} toast={toast} />}
        {page === 'customers' && <Customers toast={toast} />}
      </main>

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
