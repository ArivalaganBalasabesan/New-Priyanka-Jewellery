import api from './api';

// Auth
export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    verifyOtp: (data) => api.post('/auth/verify-otp', data),
    googleLogin: (data) => api.post('/auth/google-login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
};

// Users
export const userService = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
    deactivate: (id) => api.put(`/users/${id}/deactivate`),
    activate: (id) => api.put(`/users/${id}/activate`),
    resetPassword: (id, newPassword) => api.put(`/users/${id}/reset-password`, { newPassword }),
};

// Products
export const productService = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    restore: (id) => api.put(`/products/${id}/restore`),
};

// Customers
export const customerService = {
    getAll: (params) => api.get('/customers', { params }),
    getById: (id) => api.get(`/customers/${id}`),
    create: (data) => api.post('/customers', data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    deactivate: (id) => api.put(`/customers/${id}/deactivate`),
    activate: (id) => api.put(`/customers/${id}/activate`),
};

// Inventory
export const inventoryService = {
    getAll: (params) => api.get('/inventory', { params }),
    getByProduct: (id) => api.get(`/inventory/product/${id}`),
    addStock: (data) => api.post('/inventory/add-stock', data),
    updateStock: (data) => api.put('/inventory/update-stock', data),
    getLowStock: () => api.get('/inventory/low-stock'),
    remove: (id) => api.delete(`/inventory/${id}`),
    updateThreshold: (id, threshold) => api.put(`/inventory/threshold/${id}`, { threshold }),
};

// Sales
export const saleService = {
    getAll: (params) => api.get('/sales', { params }),
    getById: (id) => api.get(`/sales/${id}`),
    create: (data) => api.post('/sales', data),
    cancel: (id, reason) => api.put(`/sales/${id}/cancel`, { reason }),
    updatePayment: (id, paymentStatus) => api.put(`/sales/${id}/payment-status`, { paymentStatus }),
    getDaily: (date) => api.get('/sales/daily', { params: { date } }),
};

// Orders
export const orderService = {
    getMyOrders: () => api.get('/orders/my-orders'),
    getAll: (params) => api.get('/orders', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post('/orders', data),
    update: (id, data) => api.put(`/orders/${id}`, data),
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
    cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
    requestQuote: (data) => api.post('/orders/request-quote', data),
    uploadCustomImage: (data) => api.post('/orders/upload-image', data),
    markAsSeen: (id) => api.put(`/orders/${id}/seen`),
};

// Rates
export const rateService = {
    getMetalRates: () => api.get('/rates/metals'),
    getStoneRates: () => api.get('/rates/stones'),
    updateMetalRate: (data) => api.put('/rates/metals', data),
    updateStoneRate: (data) => api.put('/rates/stones', data),
    getPriceHistory: (params) => api.get('/rates/history', { params }),
    syncMarketRates: () => api.post('/rates/sync'),
};

// Reports
export const reportService = {
    getDashboard: () => api.get('/reports/dashboard'),
    getSalesReport: (params) => api.get('/reports/sales', { params }),
    getTopProducts: (limit) => api.get('/reports/top-products', { params: { limit } }),
    getInventoryReport: () => api.get('/reports/inventory'),
    getMonthlyRevenue: (year) => api.get('/reports/monthly-revenue', { params: { year } }),
};

// AI
export const aiService = {
    generate: (data) => api.post('/ai/generate', data),
    getMyDesigns: () => api.get('/ai/my-designs'),
};

// Payment
export const paymentService = {
    createCheckout: (data) => api.post('/payment/checkout', data),
    verifyPayment: (sessionId) => api.get(`/payment/verify/${sessionId}`),
    getHistory: () => api.get('/payment/history'),
};

// Pricing (Admin)
export const pricingService = {
    override: (data) => api.put('/pricing/override', data),
    updateNow: () => api.post('/pricing/update-now'),
};

// Analytics (Admin)
export const analyticsService = {
    getAnalytics: (params) => api.get('/analytics', { params }),
    generateSnapshot: (data) => api.post('/analytics/snapshot', data),
};
