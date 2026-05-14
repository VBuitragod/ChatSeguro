import axios from 'axios';

const API = axios.create({
  baseURL: 'https://chatseguro-backend.onrender.com'
});

// Este interceptor pega el token automáticamente en cada petición protegida
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('chat_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;