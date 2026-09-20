import { tg } from './telegram.js';

// Bo'sh base => so'rovlar Vite proxy orqali backendga ketadi (vite.config.js).
// Shu sabab ngrok'ni faqat 5173-portga ulash yetarli.
const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...options.headers,
  };

  if (tg?.initData) headers['X-Telegram-Init-Data'] = tg.initData;

  const res = await fetch(`${BASE}/api/client${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Xatolik (${res.status})`);
  }
  return data;
}

export const api = {
  init: () => request('/init'),

  products: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null),
    );
    return request(`/products?${query}`);
  },
  product: (id) => request(`/products/${id}`),

  favorites: () => request('/favorites'),
  toggleFavorite: (productId) => request(`/favorites/${productId}`, { method: 'POST' }),

  updateProfile: (body) => request('/profile', { method: 'POST', body: JSON.stringify(body) }),
  requestPhone: () => request('/request-phone', { method: 'POST' }),

  requestLocation: () => request('/request-location', { method: 'POST' }),
  myLocation: () => request('/location'),

  checkPromo: (code, subtotal) =>
    request('/promo/check', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),

  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  myOrders: () => request('/orders'),
  reorder: (id) => request(`/orders/${id}/reorder`, { method: 'POST' }),
};

/**
 * Admin panelda yuklangan rasm `/api/images/<id>` ko'rinishida saqlanadi.
 * Brauzer uni Vercel domeniga nisbatan izlab 404 olmasligi uchun
 * backend manzili qo'shiladi. Tashqi URL bo'lsa o'zgarishsiz qoladi.
 */
export function imageUrl(src) {
  if (!src) return '';
  return src.startsWith('/api/') ? `${BASE}${src}` : src;
}

export default api;
