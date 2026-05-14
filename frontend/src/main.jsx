import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // ¡Crucial para que Tailwind CSS funcione!

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode ayuda a encontrar problemas potenciales en la app durante el desarrollo
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);