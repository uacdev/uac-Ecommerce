import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor for Auth
api.interceptors.request.use((config) => {
    // Get token from Supabase session if needed
    const token = localStorage.getItem('supabase.auth.token'); // Or use the official supabase client to get session
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const productApi = {
    getAll: () => api.get('/products'),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    toggleStock: (id, status) => api.patch(`/products/${id}/stock`, { status })
};

export const orderApi = {
    getAll: () => api.get('/orders'),
    create: (data) => api.post('/orders', data),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    updateDelivery: (id, data) => api.patch(`/orders/${id}/delivery`, data)
};

export const statsApi = {
    getKpis: () => api.get('/stats/kpis'),
    getSalesChart: (timeframe) => api.get(`/stats/sales-chart?timeframe=${timeframe}`),
    getBestSellers: () => api.get('/stats/best-sellers'),
    getCustomers: () => api.get('/stats/customers')
};

export default api;
