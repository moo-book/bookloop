// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// load .env
dotenv.config();

// parse allowed client origins from env
const CLIENT_URLS = (process.env.CLIENT_URLS || '')
  .split(',')
  .map(u => u.trim())
  .filter(Boolean);

if (!CLIENT_URLS.length) {
  console.error('❌ No CLIENT_URLS defined! Set CLIENT_URLS to your front-end domains.');
  process.exit(1);
}

// CORS options for Express
const corsOptions = {
  origin: (incomingOrigin, callback) => {
    // allow requests with no origin (e.g. mobile apps, curl)
    if (!incomingOrigin || CLIENT_URLS.includes(incomingOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${incomingOrigin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// apply CORS to all routes and enable preflight
const app = express();
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));    // <-- allow preflight across the board

app.use(cookieParser());
app.use(express.json());

// serve uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routers
import userRoutes         from './routes/userRoutes.js';
import bookRoutes         from './routes/bookRoutes.js';
import donationRoutes     from './routes/donationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes         from './routes/chatRoutes.js';
import aiRoutes           from './routes/aiRoutes.js';

app.use('/api/users',         userRoutes);
app.use('/api/books',         bookRoutes);
app.use('/api/donations',     donationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat',          chatRoutes);
app.use('/api/ai',            aiRoutes);

app.get('/', (_req, res) => res.send('Backend is up'));

// error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.message.startsWith('Not allowed by CORS')) {
    return res.status(403).json({ message: err.message });
  }
  res.status(500).json({ message: err.message });
});

// connect DB & start HTTP + Socket.IO server
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const httpServer = createServer(app);

    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: CLIENT_URLS,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
      }
    });

    io.on('connection', socket => {
      console.log('Socket connected:', socket.id);
      socket.on('join-chat', id => socket.join(id));
      socket.on('send-message', data => {
        io.to(data.chatId).emit('new-message', { ...data, timestamp: new Date() });
      });
      socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
    });

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => console.log(`🚀 Listening on ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connect error:', err);
    process.exit(1);
  });
