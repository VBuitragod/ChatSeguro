import axios from 'axios';

const API = axios.create({
  // URL de tu backend en Render (Asegúrate de que no tenga espacios)
  baseURL: 'https://chatseguro-backend.onrender.com/api'
});

// Interceptor para seguridad (JWT)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('chat_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;