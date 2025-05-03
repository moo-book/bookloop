// controllers/userController.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import City from '../models/City.js';

/* ───────── Register ───────── */
export const registerUser = async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body;
    if (!email || !username || !password || !confirmPassword)
      return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email is already used' });
    if (await User.findOne({ username }))
      return res.status(400).json({ message: 'Username is taken' });

    const newUser = new User({ email, username, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────── Login ───────── */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      message: 'Logged in successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────── Logout ───────── */
export const logoutUser = async (_req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Signed out successfully' });
};

/* ───────── Get profile ───────── */
export const getPersonalProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: 'Invalid user id' });

    const user = await User.findById(userId).populate('reservedLocation');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────── Basic profile update ───────── */
export const updatePersonalProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: 'Invalid user id' });

    const { username, quote } = req.body;
    const updateData = {};
    if (username) updateData.username = username;
    if (quote !== undefined) updateData.quote = quote;
    if (req.file) updateData.profilePicture = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ───────── Set / change reserved location ───────── */
export const updateReservedLocation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { cityId } = req.body;

    const city = await City.findById(cityId);
    if (!city) return res.status(400).json({ message: 'City not found' });

    const user = await User.findByIdAndUpdate(
      userId,
      {
        reservedLocation: city._id,
        reservedLocationName: city.name
      },
      { new: true }
    ).populate('reservedLocation');

    res.json({ message: 'Location updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
