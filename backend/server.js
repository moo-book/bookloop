// server.js  – patch‑don’t‑delete version
import express            from 'express';
import mongoose           from 'mongoose';
import cors               from 'cors';
import dotenv             from 'dotenv';
import path               from 'path';
import { fileURLToPath }  from 'url';
import { createServer }   from 'http';
import { Server }         from 'socket.io';
import cookieParser       from 'cookie-parser';

dotenv.config();

const app        = express();
const httpServer = createServer(app);
const io         = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ───── Mongo connect & fixer ─────
import Book      from './models/Book.js';
import Donation  from './models/Donation.js';

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test')
  .then(async () => {
    console.log('✅  MongoDB connected');

    // one‑time patcher
    const patchBadLocations = async (Model, label) => {
      const bad = await Model.find({
        $or: [
          { 'location.coordinates': { $exists: false } },
          { 'location.coordinates.1': { $exists: false } }
        ]
      });

      if (bad.length) {
        console.warn(`⚠️  Patching ${bad.length} ${label} docs with dummy coords`);
        for (const doc of bad) {
          doc.location = { type: 'Point', coordinates: [0, 0] };
          await doc.save();
        }
      }
    };

    await patchBadLocations(Book,     'Book');
    await patchBadLocations(Donation, 'Donation');

    await Book.syncIndexes();
    await Donation.syncIndexes();
    console.log('🔄  Geo indexes ready');
  })
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

// ───── Socket.IO ─────
io.on('connection', (socket) => {
  socket.on('join-chat', (chatId) => socket.join(chatId));
  socket.on('send-message', (d) =>
    io.to(d.chatId).emit('new-message', { ...d, timestamp: new Date() })
  );
});

// ───── Routes ─────
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

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀  Listening on ${PORT}`));
