// src/api.js
import axios from 'axios';

/**
 * Netlify injects REACT_APP_API_URL at build time.
 * Fall back to localhost for dev.
 */
const BACKEND = (
  process.env.REACT_APP_API_URL || 'http://localhost:5000'
).replace(/\/$/, '');

const api = axios.create({
  baseURL: `${BACKEND}/api`,
  withCredentials: true,  // send cookies
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
