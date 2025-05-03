// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: String, required: true }, // Owner of the book/donation
  type: { 
    type: String,
    enum: ['book_request', 'donation_request', 'exchange_request'],
    default: 'book_request'
  },
  requester: { type: String, required: true }, // user who sends the request
  book: { type: String, required: true },      // the target item ID (your donation or your exchange book)
  message: { type: String, required: true },
  status: { type: String, enum: ['pending','accepted','denied'], default: 'pending' },
  read: { type: Boolean, default: false },

  // New fields to store extra data:
  requesterBook: { type: String }, // only used if type = 'exchange_request'
  reason: { type: String }         // only used if type = 'donation_request'
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
