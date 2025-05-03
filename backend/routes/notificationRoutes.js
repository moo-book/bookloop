// routes/notificationRoutes.js
import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  acceptBookRequest,
  denyBookRequest,
  deleteNotification
} from '../controllers/notificationController.js';
import { verifyJWT } from '../middleware/authJWT.js';

const router = express.Router();

// Get pending notifications
router.get('/', verifyJWT, getNotifications);
router.post('/mark-read', verifyJWT, markNotificationAsRead);
router.post('/accept', verifyJWT, acceptBookRequest);
router.post('/deny', verifyJWT, denyBookRequest);
router.delete('/:notificationId', verifyJWT, deleteNotification);

export default router;
