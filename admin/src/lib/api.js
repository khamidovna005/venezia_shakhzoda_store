const TOKEN_KEY = 'zb_admin_token';

// Bo'sh base => so'rovlar Vite proxy orqali backendga ketadi (vite.config.js).
// Vercel'ga deploy qilinganda proxy yo'q, shuning uchun VITE_API_URL kerak.
const BASE = import.meta.env.VITE_API_URL || '';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api/admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 || res.status === 403) {
    const hadToken = Boolean(getToken());
    clearToken();
    // Sessiya tugagan bo'lsa, App kirish oynasini qaytaradi
    if (hadToken) window.dispatchEvent(new Event('admin-logout'));
    throw new Error(data.error || 'Sessiya tugadi — qaytadan kiring');
  }
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Xatolik (${res.status})`);
  }
  return data;
}

const json = (method) => (path, body) =>
  request(path, { method, body: body ? JSON.stringify(body) : undefined });

export const api = {
  login: (login, password) => json('POST')('/login', { login, password }),
  me: () => request('/me'),
  stats: () => request('/stats'),

  orders: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
    );
    return request(`/orders?${query}`);
  },
  setOrderStatus: (id, status) => json('PATCH')(`/orders/${id}/status`, { status }),
  setPaymentStatus: (id, paymentStatus) => json('PATCH')(`/orders/${id}/payment`, { paymentStatus }),
  deleteOrder: (id) => json('DELETE')(`/orders/${id}`),

  products: () => request('/products'),
  createProduct: (body) => json('POST')('/products', body),
  updateProduct: (id, body) => json('PUT')(`/products/${id}`, body),
  deleteProduct: (id) => json('DELETE')(`/products/${id}`),

  categories: () => request('/categories'),
  createCategory: (body) => json('POST')('/categories', body),
  updateCategory: (id, body) => json('PUT')(`/categories/${id}`, body),
  deleteCategory: (id) => json('DELETE')(`/categories/${id}`),

  promos: () => request('/promos'),
  createPromo: (body) => json('POST')('/promos', body),
  updatePromo: (id, body) => json('PUT')(`/promos/${id}`, body),
  deletePromo: (id) => json('DELETE')(`/promos/${id}`),

  users: () => request('/users'),
  messageUser: (telegramId, text) => json('POST')('/users/message', { telegramId, text }),

  settings: () => request('/settings'),
  saveSettings: (body) => json('PUT')('/settings', body),
  changePassword: (currentPassword, newPassword) =>
    json('POST')('/settings/password', { currentPassword, newPassword }),

  upload: (dataUrl) => json('POST')('/upload', { dataUrl }),

  aiStatus: () => request('/ai/status'),
  aiProduct: (imageUrl) => json('POST')('/ai/product', { imageUrl }),
  aiTranslate: (body) => json('POST')('/ai/translate', body),
};

/**
 * Yuklangan rasm yo'li `/api/images/<id>` ko'rinishida saqlanadi.
 * Brauzer uni admin panel domeniga nisbatan izlamasligi uchun
 * backend manzili qo'shiladi. Tashqi URL bo'lsa — o'zgarishsiz qoladi.
 */
export function imageUrl(src) {
  if (!src) return '';
  return src.startsWith('/api/') ? `${BASE}${src}` : src;
}

export default api;
