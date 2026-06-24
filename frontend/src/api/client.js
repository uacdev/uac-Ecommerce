import axios from 'axios';

const ADMIN_TOKEN_KEY = 'uac_admin_token';
const CUSTOMER_TOKEN_KEY = 'uac_customer_token';

export const getToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);
export const setToken = (token) => {
    if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
    else localStorage.removeItem(ADMIN_TOKEN_KEY);
};
export const clearToken = () => localStorage.removeItem(ADMIN_TOKEN_KEY);

export const getCustomerToken = () => localStorage.getItem(CUSTOMER_TOKEN_KEY);
export const setCustomerToken = (token) => {
    if (token) localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
    else localStorage.removeItem(CUSTOMER_TOKEN_KEY);
};
export const clearCustomerToken = () => localStorage.removeItem(CUSTOMER_TOKEN_KEY);

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const url = config.url || '';
    // Customer endpoints get the customer token; admin endpoints get the admin token.
    const isCustomerRoute = url.startsWith('/customer') || url.startsWith('customer');
    const token = isCustomerRoute ? getCustomerToken() : getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const status = error.response?.status;
        const isCustomerRoute = url.startsWith('/customer') || url.startsWith('customer');

        if (status === 401) {
            if (isCustomerRoute && getCustomerToken()) {
                clearCustomerToken();
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/account/login')) {
                    window.location.href = '/account/login';
                }
            } else if (!isCustomerRoute && getToken()) {
                clearToken();
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
                    window.location.href = '/admin/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    me: () => api.get('/auth/me'),
    changePassword: (currentPassword, newPassword) =>
        api.post('/auth/change-password', { currentPassword, newPassword }),
    requestPasswordReset: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword })
};

export const uploadApi = {
    image: (file) => {
        const fd = new FormData();
        fd.append('file', file);
        return api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
};

export const productApi = {
    getAll: () => api.get('/products'),
    create: (data) => api.post('/products', data),
    bulkCreate: (data) => api.post('/products/bulk', { products: data }),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    toggleStock: (id, status) => api.patch(`/products/${id}/stock`, { status }),
    subscribeRestock: (id, email) => api.post(`/products/${id}/notify-when-restocked`, { email }),
    salesSummary: () => api.get('/products/sales-summary'),
    getStats: (id) => api.get(`/products/${id}/stats`)
};

export const customerApi = {
    signup: (data) => api.post('/customer/auth/signup', data),
    login: (email, password) => api.post('/customer/auth/login', { email, password }),
    me: () => api.get('/customer/auth/me'),
    updateProfile: (data) => api.put('/customer/auth/profile', data),
    changePassword: (currentPassword, newPassword) =>
        api.post('/customer/auth/change-password', { currentPassword, newPassword }),
    requestPasswordReset: (email) => api.post('/customer/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => api.post('/customer/auth/reset-password', { token, newPassword }),
    myOrders: () => api.get('/customer/orders')
};

export const orderApi = {
    getAll: (params = {}) => api.get('/orders', { params }),
    create: (data) => api.post('/orders', data),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    updateDelivery: (id, data) => api.patch(`/orders/${id}/delivery`, data),
    selectDeliveryMethod: (id, deliveryMethod) => api.patch(`/orders/${id}/delivery-method`, { deliveryMethod }),
    delete: (id) => api.delete(`/orders/${id}`)
};

export const statsApi = {
    getKpis: () => api.get('/stats/kpis'),
    getSalesChart: (timeframe) => api.get(`/stats/sales-chart?timeframe=${timeframe}`),
    getBestSellers: () => api.get('/stats/best-sellers'),
    getCustomers: () => api.get('/stats/customers'),
    getCustomerOrders: (email) => api.get(`/stats/customers/${encodeURIComponent(email)}/orders`),
    getGeography: () => api.get('/stats/geography'),
    getRevenueByCategory: () => api.get('/stats/revenue-by-category'),
    getOrdersByHour: () => api.get('/stats/orders-by-hour'),
    getStatusFunnel: () => api.get('/stats/status-funnel'),
    getWebAnalytics: (days = 30) => api.get(`/stats/web-analytics?days=${days}`)
};

export const categoryApi = {
    getAll: () => api.get('/categories'),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
    getStats: (id) => api.get(`/categories/${id}/stats`)
};

export const deliveryApi = {
    getZones: () => api.get('/delivery/zones'),
    getStates: () => api.get('/delivery/states')
};

export const reviewApi = {
    getAll: (params = {}) => api.get('/reviews', { params }),
    create: (data) => api.post('/reviews', data),
    update: (id, data) => api.patch(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`)
};

export const notificationApi = {
    getAll: (params = {}) => api.get('/notifications', { params }),
    markRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.patch('/notifications/read-all')
};

export const adminApi = {
    getProfile: () => api.get('/admin/profile'),
    upsertProfile: (data) => api.put('/admin/profile', data)
};

export const searchApi = {
    query: (q, limit = 5) => api.get('/search', { params: { q, limit } })
};

export const trackingApi = {
    visit: (visitorId, path) => api.post('/track/visit', {
        visitorId,
        path,
        // Pass document.referrer explicitly — the HTTP Referer header isn't
        // always populated for SPA navigations or when COOP/COEP strips it.
        referrer: typeof document !== 'undefined' ? document.referrer || '' : ''
    }),
    startCheckout: (visitorId, email) => api.post('/track/checkout-start', { visitorId, email })
};

export const paymentApi = {
    initiate: (data) => api.post('/payment/initiate', data),
    verify: (reference) => api.post('/payment/verify', { reference }),
};

export default api;
