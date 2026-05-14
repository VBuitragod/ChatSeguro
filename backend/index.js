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

// CORRECCIÓN 1: Definir PORT una sola vez al inicio
const PORT = process.env.PORT || 5000; 
const JWT_SECRET = process.env.JWT_SECRET || 'top_secret';
const MONGO_URI = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : '';

if (!MONGO_URI) {
  console.log('❌ MONGO_URI no encontrada en .env');
  process.exit(1);
}

// Conexión a MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado exitosamente a MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ Error crítico de conexión MongoDB:', err.message);
  });

// Esquemas (Igual que los tenías)
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

// CORRECCIÓN 2: CORS Dinámico para Producción
// Esto permite que localhost funcione en pruebas y tu URL de Vercel en el despliegue
app.use(cors({
  origin: '*', // En producción real aquí pondrías tu URL de Vercel
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

// CORRECCIÓN 3: Configuración de Socket.io para la nube
const io = new Server(server, {
  cors: {
    origin: "*", // Permite conexiones desde cualquier cliente desplegado
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('📱 Nuevo cliente conectado:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`👤 Usuario unido a sala: ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({
        sender: data.senderId,
        receiver: data.receiverId,
        content: data.content
      });
      await newMessage.save();
      // Emitir a la sala específica
      io.to(data.roomId).emit('receive_message', data);
    } catch (err) {
      console.error('❌ Error al guardar mensaje:', err.message);
    }
  });

  socket.on('disconnect', () => console.log('🔌 Usuario desconectado'));
});

// Rutas API (Iguales)
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y password requeridos' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Usuario ya existe' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' }); // Extendí el tiempo para pruebas
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

// CORRECCIÓN 4: Swagger dinámico para que no falle en Render
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { 
      title: 'API ChatSeguro', 
      version: '1.0.0',
      description: 'Documentación para Sistemas IV - Fase 5'
    },
    servers: [
        { url: `http://localhost:${PORT}`, description: 'Local' },
        { url: 'https://tu-app-en-render.onrender.com', description: 'Producción' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: [] 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => res.json({ message: 'Servidor ChatSeguro Activo 🚀' }));

// Iniciar servidor
server.listen(PORT, '0.0.0.0', () => { // Agregué '0.0.0.0' para que Render escuche correctamente
  console.log(`🚀 Servidor activo en puerto ${PORT}`);
});