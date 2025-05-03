// server.js
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

// Allow multiple origins via CLIENT_URLS env var, fallback to localhost:
const CLIENT_URLS = (process.env.CLIENT_URLS || 'http://localhost:3000').split(',');

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URLS,
    methods: ['GET','POST'],
    credentials: true
  }
});

// --- Middleware ---
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl) or from our list
    if (!origin || CLIENT_URLS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

// --- Static uploads ---
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Connect & patch MongoDB ---
import Book     from './models/Book.js';
import Donation from './models/Donation.js';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ MongoDB connected to', MONGO_URI);

    // One-time patch for any docs missing proper geo coords
    for (const [Model, label] of [[Book,'Book'], [Donation,'Donation']]) {
      const bad = await Model.find({
        $or: [
          { 'location.coordinates': { $exists: false } },
          { 'location.coordinates.1': { $exists: false } }
        ]
      });
      if (bad.length) {
        console.warn(`⚠️ Patching ${bad.length} ${label} docs with dummy coords`);
        await Promise.all(bad.map(doc => {
          doc.location = { type: 'Point', coordinates: [0,0] };
          return doc.save();
        }));
      }
      await Model.syncIndexes();
    }
    console.log('🔄 Geo indexes ready');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// --- Socket.IO handlers ---
io.on('connection', socket => {
  socket.on('join-chat', chatId => socket.join(chatId));
  socket.on('send-message', data => {
    io.to(data.chatId).emit('new-message', { ...data, timestamp: new Date() });
  });
});

// --- API Routes ---
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

app.get('/', (_req, res) => {
  res.send('📚 BookLoop backend is up!');
});

// --- Global error handler ---
app.use((err, _req, res, _next) => {
  console.error('🔥 Uncaught error:', err.message || err);
  res.status(500).json({ message: err.message || 'Server error' });
});

// --- Start server ---
const PORT = parseInt(process.env.PORT, 10) || 5000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Listening on port ${PORT}, allowed origins: ${CLIENT_URLS.join(', ')}`)
);
