const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4001/api/v1';

export function getAbsoluteImageUrl(url) {
  if (!url) return 'https://placehold.co/600x400?text=No+Image';
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_URL_ROOT ||
                  import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') ||
                  'http://localhost:4001';
  return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}

export function resolveProductImage(product) {
  if (!product) return 'https://placehold.co/600x400?text=No+Image';
  
  // 1. primaryImageUrl
  if (product.primaryImageUrl) {
    return getAbsoluteImageUrl(product.primaryImageUrl);
  }
  
  // 2. first active image in productImages
  if (product.productImages && product.productImages.length > 0) {
    const activeImage = product.productImages.find(img => img.isActive !== false);
    if (activeImage) {
      return getAbsoluteImageUrl(activeImage.imageUrl);
    }
  }
  
  // 3. Fallback to product.image (for mock data compatibility)
  if (product.image) {
    return getAbsoluteImageUrl(product.image);
  }

  // 4. placeholder
  return 'https://placehold.co/600x400?text=No+Image';
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

function normalizeAddressPayload(payload = {}) {
  const normalized = {
    addressLabel: payload.addressLabel,
    recipientName: payload.recipientName ?? payload.fullName,
    recipientMobile: payload.recipientMobile ?? payload.mobileNumber,
    line1: payload.line1,
    line2: payload.line2,
    landmark: payload.landmark,
    city: payload.city,
    state: payload.state,
    pincode: payload.pincode,
    addressType: payload.addressType ? String(payload.addressType).toUpperCase() : undefined,
    isDefault: payload.isDefault,
  };

  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => value !== undefined),
  );
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
      const base = import.meta.env.BASE_URL || '/';
      const loginPath = (base.endsWith('/') ? base : base + '/') + 'login';
      if (window.location.pathname !== loginPath) {
        window.location.href = loginPath + '?redirect=' + encodeURIComponent(window.location.pathname);
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
    requestEmailOtp: (email) =>
      apiFetch('/auth/email/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email, intent: 'login' }),
      }),
    verifyEmailOtp: (email, otp) =>
      apiFetch('/auth/email/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
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
        body: JSON.stringify(normalizeAddressPayload(payload)),
      }),
    update: (id, payload) =>
      apiFetch(`/addresses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(normalizeAddressPayload(payload)),
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
