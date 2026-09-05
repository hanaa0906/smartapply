import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for Bearer JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartapply_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking /api/auth/me during initial load
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('smartapply_token');
        localStorage.removeItem('smartapply_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
