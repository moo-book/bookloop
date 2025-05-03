// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true           // always send/receive cookies
});

/* ───────── Global 401 handler ───────── */
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // remove any stale local auth
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      // send the user to login (but avoid infinite loop)
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
