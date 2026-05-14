import { io } from 'socket.io-client';

const SOCKET_URL = 'https://chatseguro-backend.onrender.com'; // URL del backend

export const initSocket = () => {
  const token = localStorage.getItem('chat_token');
  return io(SOCKET_URL, {
    auth: { token }, // Validado por el backend antes de conectar
    reconnection: true, // Manejo de reconexiones automáticas
  });
};