import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importamos para leer el ID del usuario

const socket = io('https://chatseguro-backend.onrender');

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Extraer datos del usuario al cargar
    const token = localStorage.getItem('chat_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserData(decoded);
      } catch (error) {
        console.error("Token inválido");
        navigate('/login');
      }
    }

    // 2. Escuchar mensajes
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.emit('join_room', 'general');

    return () => socket.off('receive_message');
  }, [navigate]);

  const sendMessage = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('chat_token');

    if (message.trim() && token && userData) {
      const messageData = {
        roomId: 'general',
        content: message,
        senderId: userData.id, // ID real de MongoDB extraído del Token
        receiverId: userData.id, // Temporalmente a ti mismo para probar la persistencia
      };

      console.log("Enviando mensaje:", messageData);
      socket.emit('send_message', messageData);
      setMessage('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_token');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <div>
          <h2 className="text-2xl font-bold text-blue-400">ChatSeguro 🔒</h2>
          <p className="text-xs text-gray-400">{userData?.email}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm transition">
          Cerrar Sesión
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-4 mb-4 shadow-inner flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center mt-10">No hay mensajes. Escribe algo para probar la DB.</p>
        )}
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex flex-col ${msg.senderId === userData?.id ? 'items-end' : 'items-start'}`}
          >
            <span className="text-[10px] text-gray-500 mb-1">
              {msg.senderId === userData?.id ? 'Tú' : 'Otro usuario'}
            </span>
            <div className={`p-3 rounded-2xl max-w-md w-fit ${
              msg.senderId === userData?.id 
                ? 'bg-blue-700 text-white rounded-tr-none' 
                : 'bg-gray-700 text-gray-200 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 bg-gray-800 p-2 rounded-full">
        <input
          type="text"
          className="flex-1 bg-transparent border-none px-4 py-1 focus:outline-none"
          placeholder="Escribe un mensaje..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center transition">
          🚀
        </button>
      </form>
    </div>
  );
}