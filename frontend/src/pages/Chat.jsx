import { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { io } from 'socket.io-client';

const socket = io('https://chatseguro-backend.onrender.com');

export default function ChatPage() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('chat_user'));
  const scrollRef = useRef();

  useEffect(() => {
    // Cargar lista de usuarios
    const loadUsers = async () => {
      try {
        const res = await API.get('/users');
        setContacts(res.data.filter(u => u._id !== currentUser.id));
      } catch (err) { console.error(err); }
    };
    loadUsers();

    // Escuchar mensajes en tiempo real
    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => socket.off('receive_message');
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const data = {
      senderId: currentUser.id,
      receiverId: selectedContact._id,
      content: newMessage,
      roomId: [currentUser.id, selectedContact._id].sort().join('-')
    };

    socket.emit('send_message', data);
    setMessages(prev => [...prev, data]);
    setNewMessage('');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* PANEL LATERAL (Sidebar) */}
      <aside className="w-80 bg-indigo-900 text-white flex flex-col shadow-xl">
        <header className="p-5 border-b border-indigo-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold">
              {currentUser.email[0].toUpperCase()}
            </div>
            <span className="text-sm font-semibold truncate w-32">{currentUser.email}</span>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-xs transition">Salir</button>
        </header>

        <nav className="flex-1 overflow-y-auto">
          <div className="p-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Contactos</div>
          {contacts.map(u => (
            <div 
              key={u._id} 
              onClick={() => setSelectedContact(u)}
              className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-indigo-800 transition ${selectedContact?._id === u._id ? 'bg-indigo-800 border-l-4 border-emerald-400' : ''}`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-xl">{u.email[0].toUpperCase()}</div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-indigo-900 rounded-full"></div>
              </div>
              <span className="text-sm font-medium">{u.email.split('@')[0]}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* PANEL DE CHAT */}
      <main className="flex-1 flex flex-col bg-white">
        {selectedContact ? (
          <>
            <header className="p-4 border-b flex items-center gap-4 bg-white shadow-sm">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white">{selectedContact.email[0].toUpperCase()}</div>
              <div>
                <h3 className="font-bold text-gray-800">{selectedContact.email}</h3>
                <span className="text-xs text-emerald-500 font-bold">● En línea</span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-sm text-sm ${msg.senderId === currentUser.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border rounded-tl-none'}`}>
                    {msg.content}
                    <div className="text-[10px] mt-1 opacity-70 text-right">✓✓</div>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t flex items-center gap-3">
              <button type="button" className="text-2xl hover:bg-gray-100 p-2 rounded-full transition">📎</button>
              <input 
                type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..." 
                className="flex-1 p-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="submit" className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition">
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
            <span className="text-8xl mb-4">💬</span>
            <p className="text-xl font-medium">Selecciona un chat para empezar</p>
          </div>
        )}
      </main>
    </div>
  );
}