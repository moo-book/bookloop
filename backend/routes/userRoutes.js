// routes/userRoutes.js
import express from 'express';
import upload from '../middleware/upload.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  getPersonalProfile,
  updatePersonalProfile,
  updateReservedLocation      // NEW
} from '../controllers/userController.js';
import { verifyJWT } from '../middleware/authJWT.js';

const router = express.Router();

/* Public auth */
router.post('/register', registerUser);
router.post('/login',    loginUser);
router.post('/logout',   logoutUser);

/* Profile */
router.get('/:userId',  verifyJWT, getPersonalProfile);
router.put('/:userId',
  verifyJWT,
  upload.single('profilePicture'),
  updatePersonalProfile
);

/* Reserved location */
router.put('/:userId/location', verifyJWT, updateReservedLocation);

export default router;
