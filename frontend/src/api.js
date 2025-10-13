import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (item) => api.post('/cart', item),
  updateCartItem: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  removeFromCart: (id) => api.delete(`/cart/${id}`),
};

export const ordersAPI = {
  createOrder: () => api.post('/orders'),
  getOrders: () => api.get('/orders'),
};

export const dbAPI = {
  getDBView: () => api.get('/db-view'),
};

export default api;
