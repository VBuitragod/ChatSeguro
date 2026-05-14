import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Llamada a tu servidor Node.js
      const res = await axios.post('http://localhost:3000/api/login', { email, password });
      
      // GUARDADO CRÍTICO: Debe llamarse 'chat_token' como pide tu App.jsx
      localStorage.setItem('chat_token', res.data.token); 
      
      alert('¡Login exitoso!');
      navigate('/'); // Redirige al Chat (la ruta "/" protegida)
    } catch (err) {
      alert('Error en el login: ' + (err.response?.data?.error || 'Servidor no responde'));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">ChatSeguro - Login</h2>
        <input 
          className="w-full p-2 mb-4 border rounded" 
          type="email" 
          placeholder="Tu correo" 
          onChange={e => setEmail(e.target.value)} 
          required
        />
        <input 
          className="w-full p-2 mb-6 border rounded" 
          type="password" 
          placeholder="Tu contraseña" 
          onChange={e => setPassword(e.target.value)} 
          required
        />
        <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition" type="submit">
          Entrar
        </button>
        <p className="mt-4 text-sm text-center">
          ¿No tienes cuenta? <a href="/register" className="text-blue-500">Regístrate</a>
        </p>
      </form>
    </div>
  );
}