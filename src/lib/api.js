const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4001/api/v1';

export function getAbsoluteImageUrl(url) {
  if (!url) return 'https://placehold.co/600x400?text=No+Image';
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_URL_ROOT || 'http://localhost:4001';
  return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}

export class ApiError extends Error {
  constructor(message, status, errorCode) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export async function apiFetch(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : {};

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Redirect to login page if we fail auth
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
    }
    throw new ApiError(
      body.message || `API Error: ${response.statusText}`,
      response.status,
      body.errorCode,
    );
  }

  return body.data;
}

export const api = {
  auth: {
    requestOtp: (mobileNumber) =>
      apiFetch('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ mobileNumber, intent: 'login' }),
      }),
    requestAdminOtp: (mobileNumber) =>
      apiFetch('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ mobileNumber, intent: 'admin_login' }),
      }),
    verifyOtp: (requestId, otp) =>
      apiFetch('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ requestId, otp }),
      }),
    resendOtp: (mobileNumber, intent) =>
      apiFetch('/auth/otp/resend', {
        method: 'POST',
        body: JSON.stringify({ mobileNumber, intent }),
      }),
    me: () => apiFetch('/auth/me'),
    register: (payload) =>
      apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  categories: {
    list: (params) =>
      apiFetch(`/categories${params ? `?${params}` : ''}`),
    getBySlug: async (slug) => {
      const response = await apiFetch(`/categories?limit=1&isActive=true`);
      return response.items?.find((item) => item.slug === slug) ?? null;
    },
  },
  products: {
    list: (params) =>
      apiFetch(`/products${params ? `?${params}` : ''}`),
    get: (id) => apiFetch(`/products/${id}`),
    bySlug: async (slug) => {
      const response = await apiFetch(`/products?slug=${encodeURIComponent(slug)}&limit=1`);
      return response.items?.[0] ?? null;
    },
  },
  search: {
    products: (q, params) =>
      apiFetch(`/search/products?q=${encodeURIComponent(q)}${params ? `&${params}` : ''}`),
    categories: (q) =>
      apiFetch(`/search/categories?q=${encodeURIComponent(q)}`),
    suggestions: (q) =>
      apiFetch(`/search/suggestions?q=${encodeURIComponent(q)}`),
  },
  cart: {
    get: () => apiFetch('/cart/me'),
    addItem: (productId, quantity) =>
      apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }),
    updateItem: (cartItemId, quantity) =>
      apiFetch(`/cart/items/${cartItemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      }),
    removeItem: (cartItemId) =>
      apiFetch(`/cart/items/${cartItemId}`, {
        method: 'DELETE',
      }),
    applyCoupon: (couponCode) =>
      apiFetch('/cart/coupons/apply', {
        method: 'POST',
        body: JSON.stringify({ couponCode }),
      }),
    removeCoupon: () =>
      apiFetch('/cart/coupons', {
        method: 'DELETE',
      }),
    clear: () =>
      apiFetch('/cart/clear', {
        method: 'POST',
      }),
  },
  coupons: {
    active: () => apiFetch('/coupons/active'),
  },
  checkout: {
    preview: (payload) =>
      apiFetch('/checkout/preview', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    placeOrder: (payload, idempotencyKey) =>
      apiFetch('/checkout/place-order', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify(payload),
      }),
  },
  orders: {
    list: (params) => apiFetch(`/orders${params ? `?${params}` : ''}`),
    get: (id) => apiFetch(`/orders/${id}`),
    cancel: (id, reason) =>
      apiFetch(`/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    reorder: (id) =>
      apiFetch(`/orders/${id}/reorder`, {
        method: 'POST',
      }),
    requestRefund: (id, payload) =>
      apiFetch(`/orders/${id}/refund`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
  reviews: {
    create: (payload) =>
      apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getProductReviews: (productId) =>
      apiFetch(`/products/${productId}/reviews`),
    update: (reviewId, payload) =>
      apiFetch(`/reviews/${reviewId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },
  stores: {
    list: (params) => apiFetch(`/stores${params ? `?${params}` : ''}`),
    serviceability: (pincode) =>
      apiFetch(`/stores/serviceability?pincode=${pincode}`),
    get: (id) => apiFetch(`/stores/${id}`),
  },
  baskets: {
    list: () => apiFetch('/baskets'),
    get: (slug) => apiFetch(`/baskets/${slug}`),
    addToCart: (basketId) =>
      apiFetch(`/baskets/${basketId}/add-to-cart`, {
        method: 'POST',
      }),
  },
  subscriptions: {
    list: (params) => apiFetch(`/subscriptions${params ? `?${params}` : ''}`),
    get: (id) => apiFetch(`/subscriptions/${id}`),
    create: (payload) =>
      apiFetch('/subscriptions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id, payload) =>
      apiFetch(`/subscriptions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    pause: (id, reason) =>
      apiFetch(`/subscriptions/${id}/pause`, {
        method: 'POST',
        body: JSON.stringify(reason ? { reason } : {}),
      }),
    resume: (id) =>
      apiFetch(`/subscriptions/${id}/resume`, {
        method: 'POST',
      }),
    skip: (id) =>
      apiFetch(`/subscriptions/${id}/skip`, {
        method: 'POST',
      }),
    cancel: (id, reason) =>
      apiFetch(`/subscriptions/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  },
  addresses: {
    list: () => apiFetch('/addresses'),
    create: (payload) =>
      apiFetch('/addresses', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id, payload) =>
      apiFetch(`/addresses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    remove: (id) =>
      apiFetch(`/addresses/${id}`, { method: 'DELETE' }),
    setDefault: (id) =>
      apiFetch(`/addresses/${id}/default`, { method: 'POST' }),
  },
  customers: {
    me: () => apiFetch('/customers/me'),
    accountStatus: () => apiFetch('/customers/me/account-status'),
    updateProfile: (payload) =>
      apiFetch('/customers/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },
  notifications: {
    list: (params) => apiFetch(`/notifications${params ? `?${params}` : ''}`),
    unreadCount: () => apiFetch('/notifications/unread-count'),
    markRead: (id) =>
      apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () =>
      apiFetch('/notifications/read-all', { method: 'PATCH' }),
    delete: (id) =>
      apiFetch(`/notifications/${id}`, { method: 'DELETE' }),
    getPreferences: () =>
      apiFetch('/notifications/preferences'),
    updatePreferences: (payload) =>
      apiFetch('/notifications/preferences', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },
};
