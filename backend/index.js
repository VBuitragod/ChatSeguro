const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CONFIGURACIÓN DE VARIABLES
const PORT = process.env.PORT || 5000; 
const JWT_SECRET = process.env.JWT_SECRET || 'top_secret';
const MONGO_URI = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';

// Verificación de DB
if (!MONGO_URI) {
  console.log('❌ MONGO_URI no encontrada en .env');
  process.exit(1);
}

// Conexión a MongoDB Atlas
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado exitosamente a MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ Error crítico de conexión MongoDB:', err.message);
  });

// MODELOS
const { Schema } = mongoose;
const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// MIDDLEWARES
app.use(cors({
  origin: '*', // Permite que Vercel se conecte sin problemas
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autorización faltante' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = payload;
    next();
  });
}

// SOCKET.IO (Configurado para Render)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('📱 Nuevo cliente conectado:', socket.id);
  socket.on('join_room', (roomId) => socket.join(roomId));
  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({
        sender: data.senderId,
        receiver: data.receiverId,
        content: data.content
      });
      await newMessage.save();
      io.to(data.roomId).emit('receive_message', data);
    } catch (err) {
      console.error('❌ Error en socket:', err.message);
    }
  });
});

// RUTAS API
// Nota: Las rutas ahora son /api/login y /api/register (sin el /auth intermedio)
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Datos incompletos' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Usuario ya existe' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Registro exitoso' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Error en login' });
  }
});

app.get('/api/users', authenticateJWT, async (req, res) => {
  try {
    const users = await User.find({}, 'email _id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// DOCUMENTACIÓN SWAGGER
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'API ChatSeguro', version: '1.0.0' },
    servers: [{ url: 'https://chatseguro-backend.onrender.com' }]
  },
  apis: [] 
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// RUTA RAIZ (Para saber si el servidor despertó)
app.get('/', (req, res) => res.json({ message: 'Servidor ChatSeguro Activo 🚀' }));

// ARRANQUE DEL SERVIDOR
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});