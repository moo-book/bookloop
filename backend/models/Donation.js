// backend/models/Donation.js
import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  author:      { type: String, required: true },
  genre:       { type: String, required: true },
  bookShape:   { type: String, required: true },
  pages:       { type: Number, required: true },
  description: { type: String, default: '' },
  coverImage:  { type: String },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// no geo index

export default mongoose.model('Donation', donationSchema);
