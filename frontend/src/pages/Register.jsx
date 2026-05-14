import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register', formData);
      alert('Registro exitoso. Por favor inicia sesión.');
      navigate('/login');
    } catch (error) {
      console.error('Error en registro:', error);
      alert('Error al registrar usuario');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h2>
        <input 
          type="text" placeholder="Nombre" required
          className="w-full mb-4 p-2 border rounded"
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
        <input 
          type="email" placeholder="Correo electrónico" required
          className="w-full mb-4 p-2 border rounded"
          onChange={e => setFormData({...formData, email: e.target.value})}
        />
        <input 
          type="password" placeholder="Contraseña" required
          className="w-full mb-6 p-2 border rounded"
          onChange={e => setFormData({...formData, password: e.target.value})}
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Registrarse
        </button>
        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}