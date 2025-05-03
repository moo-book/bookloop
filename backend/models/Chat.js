// models/Chat.js
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }], // user IDs as strings
  bookTitle: { type: String, default: '' }, // so chat can reference the exchanged book's title
  messages: [
    {
      sender: { type: String, required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
