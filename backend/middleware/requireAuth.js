// middleware/requireAuth.js
import mongoose from 'mongoose';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const { userId } = req.body; // or req.query if you prefer
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Not logged in or invalid user ID' });
    }
    // Check if user actually exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'No such user' });
    }
    // user is valid
    req.user = user; // attach the user doc if you want
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
