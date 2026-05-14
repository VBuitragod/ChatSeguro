import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';

// Componente para proteger la ruta principal del chat
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('chat_token');
  // Si no hay token, redirige al login. Si hay, muestra el componente hijo (Chat)
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}