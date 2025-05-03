// backend/server.js
import express           from 'express';
import mongoose          from 'mongoose';
import cors              from 'cors';
import dotenv            from 'dotenv';
import path              from 'path';
import { fileURLToPath } from 'url';
import { createServer }  from 'http';
import { Server }        from 'socket.io';
import cookieParser      from 'cookie-parser';

dotenv.config();

const app        = express();
const httpServer = createServer(app);

// ── Load allowed origins from env (comma-separated) ──
// e.g. CLIENT_URLS="http://localhost:3000,https://bookloop1.netlify.app"
const CLIENT_URLS = (process.env.CLIENT_URLS || '')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

if (!CLIENT_URLS.length) {
  console.error(
    '❌  No CLIENT_URLS defined! Please set CLIENT_URLS env var to your front-end domains.'
  );
  process.exit(1);
}

app.use(cookieParser());
app.use(express.json());

// ── CORS for REST API ──
app.use(
  cors({
    origin: CLIENT_URLS,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
);

// ── Serve uploads ──
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Socket.IO with identical CORS ──
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URLS,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ── MongoDB connect & geo-index patcher ──
import Book     from './models/Book.js';
import Donation from './models/Donation.js';

mongoose
  .connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/test')
  .then(async () => {
    console.log('✅  MongoDB connected');

    // Ensure geo indexes exist
    await Book.syncIndexes();
    await Donation.syncIndexes();
    console.log('🔄  Geo indexes ready');
  })
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

// ── Socket.IO events ──
io.on('connection', (socket) => {
  socket.on('join-chat', (chatId) => socket.join(chatId));
  socket.on('send-message', (data) =>
    io.to(data.chatId).emit('new-message', { ...data, timestamp: new Date() })
  );
});

// ── Routes ──
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

app.get('/', (_req, res) => res.send('Backend server is running…'));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀  Listening on port ${PORT}`));
