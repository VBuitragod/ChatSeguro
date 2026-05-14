import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api'; // <--- IMPORTANTE: Usamos tu instancia configurada

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Usamos API.post en lugar de axios.post directo
      // 2. Solo ponemos '/login' porque la baseURL ya tiene el resto
      const res = await API.post('/login', { email, password });
      
      // GUARDADO CRÍTICO
      localStorage.setItem('chat_token', res.data.token); 
      // Opcional: guardar datos del usuario para mostrar su nombre
      localStorage.setItem('chat_user', JSON.stringify(res.data.user));
      
      alert('¡Login exitoso!');
      navigate('/'); 
    } catch (err) {
      // Si el error es 401, el mensaje vendrá del backend
      const errorMsg = err.response?.data?.error || 'Servidor no responde';
      alert('Error en el login: ' + errorMsg);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">ChatSeguro - Login</h2>
        <input 
          className="w-full p-2 mb-4 border rounded" 
          type="email" 
          placeholder="Tu correo" 
          value={email} // Buena práctica: input controlado
          onChange={e => setEmail(e.target.value)} 
          required
        />
        <input 
          className="w-full p-2 mb-6 border rounded" 
          type="password" 
          placeholder="Tu contraseña" 
          value={password} // Buena práctica
          onChange={e => setPassword(e.target.value)} 
          required
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition" type="submit">
          Entrar
        </button>
        <p className="mt-4 text-sm text-center">
          ¿No tienes cuenta? <a href="/register" className="text-blue-500 hover:underline">Regístrate</a>
        </p>
      </form>
    </div>
  );
}