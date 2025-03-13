import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints
export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  signup: async (email: string, password: string, displayName: string) => {
    const response = await api.post('/auth/signup', { email, password, displayName });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Premium endpoints
export const premium = {
  getStatus: async () => {
    const response = await api.get('/premium/status');
    return response.data;
  },
  upgrade: async (paymentMethodId: string) => {
    const response = await api.post('/premium/upgrade', { paymentMethodId });
    return response.data;
  },
  cancel: async () => {
    const response = await api.post('/premium/cancel');
    return response.data;
  },
  getSubscriptionDetails: async () => {
    const response = await api.get('/premium/subscription');
    return response.data;
  },
};

// Posts endpoints
export const posts = {
  getAll: async () => {
    const response = await api.get('/posts');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/posts', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
  getCategory: async (categorySlug: string) => {
    const response = await api.get(`/categories/${categorySlug}`);
    return response.data;
  },
  getTopics: async (params: {
    category?: string;
    subcategory?: string;
    sortBy?: 'latest' | 'popular';
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/topics', { params });
    return response.data;
  },
};

// Users endpoints
export const users = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Admin endpoints
export const admin = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getPosts: () => api.get('/admin/posts'),
  updateUserStatus: (userId: string, isActive: boolean) => api.patch(`/admin/users/${userId}/status`, { isActive }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings: any) => api.put('/admin/settings', settings),
};

export default api;