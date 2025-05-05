import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  verifyOTP: (otpData) => api.post('/auth/verify-otp', otpData)
};

// Transaction services
export const transactionApi = {
  getTransactions: () => api.get('/transactions'),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  createTransaction: (transactionData) => api.post('/transactions', transactionData),
  updateTransaction: (id, transactionData) => api.put(`/transactions/${id}`, transactionData),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),
  verifyConsent: (id) => api.put(`/transactions/${id}/consent`),
  signDocument: (id) => api.put(`/transactions/${id}/sign`),
  approveByAdmin: (id) => api.put(`/transactions/${id}/approve`),
  confirmPayment: (id) => api.put(`/transactions/${id}/confirm-payment`),
  finalizeTransaction: (id, data) => api.put(`/transactions/${id}/finalize`, data)
};

export default api;