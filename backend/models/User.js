// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email:    { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    quote:    { type: String, default: '' },
    profilePicture: { type: String, default: '' },

    /* ───────── Reserved Location ───────── */
    reservedLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      default: null
    },
    reservedLocationName: { type: String, default: '' }
  },
  { timestamps: true }
);

/* ---------- password hashing ---------- */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model('User', userSchema);
