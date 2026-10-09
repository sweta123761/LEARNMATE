import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { localStorage.removeItem('user'); }
  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

API.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('learnmate:unauthorized'));
  }
  return Promise.reject(error);
});

export default API;
