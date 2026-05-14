import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/login', { email, password });
      
      // Guardamos Token y Datos del Usuario
      localStorage.setItem('chat_token', res.data.token); 
      localStorage.setItem('chat_user', JSON.stringify(res.data.user));
      
      navigate('/'); // Vamos al chat
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Servidor fuera de línea'));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">ChatSeguro</h2>
        <div className="space-y-4">
          <input 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
            type="email" placeholder="Correo electrónico" 
            onChange={e => setEmail(e.target.value)} required 
          />
          <input 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
            type="password" placeholder="Contraseña" 
            onChange={e => setPassword(e.target.value)} required 
          />
          <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition duration-300" type="submit">
            Entrar al Chat
          </button>
        </div>
        <p className="mt-6 text-center text-gray-600 text-sm">
          ¿Nuevo aquí? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Crea una cuenta</Link>
        </p>
      </form>
    </div>
  );
}