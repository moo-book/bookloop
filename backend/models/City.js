// models/City.js
import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],           // [lng, lat]
      index: '2dsphere'
    }
  }
});

export default mongoose.model('City', citySchema);
