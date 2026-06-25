import api from '@/lib/axios';

// Auth
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data: any) => api.put('/auth/password', data),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Business
export const businessAPI = {
  getProfile: () => api.get('/business'),
  updateProfile: (data: FormData | any) => {
    const isFormData = data instanceof FormData;
    return api.put('/business', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
  },
};

// Categories
export const categoryAPI = {
  getAll: (params?: any) => api.get('/categories', { params }),
  getOne: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Products
export const productAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getOne: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData | any) => {
    const isFormData = data instanceof FormData;
    return api.put(`/products/${id}`, data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
  },
  delete: (id: string) => api.delete(`/products/${id}`),
  deleteImage: (id: string, imageUrl: string) => api.delete(`/products/${id}/images`, { data: { imageUrl } }),
};

// Customers
export const customerAPI = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getOne: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

// Sales
export const saleAPI = {
  getAll: (params?: any) => api.get('/sales', { params }),
  getOne: (id: string) => api.get(`/sales/${id}`),
  create: (data: any) => api.post('/sales', data),
  updateStatus: (id: string, data: any) => api.patch(`/sales/${id}/status`, data),
};

// Inventory
export const inventoryAPI = {
  stockIn: (data: any) => api.post('/inventory/stock-in', data),
  stockOut: (data: any) => api.post('/inventory/stock-out', data),
  adjust: (data: any) => api.post('/inventory/adjust', data),
  getLogs: (params?: any) => api.get('/inventory/logs', { params }),
  getLowStock: () => api.get('/inventory/low-stock'),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getSalesChart: (params?: any) => api.get('/dashboard/charts/sales', { params }),
  getCategoryChart: () => api.get('/dashboard/charts/categories'),
};

// Reports
export const reportAPI = {
  getSales: (params?: any) => api.get('/reports/sales', { params }),
  getInventory: () => api.get('/reports/inventory'),
  getCustomers: () => api.get('/reports/customers'),
};
