// backend/routes/bookRoutes.js
import express from 'express';
import upload from '../middleware/upload.js';
import {
  listExchangeBooksPaginated,
  getUserBooks,
  getLastThreeBooks,
  getSingleBook,
  addExchangeBook,
  updateExchangeBook,
  deleteUserBook,
  requestExchange,
  findNearestBooks
} from '../controllers/bookController.js';
import { verifyJWT } from '../middleware/authJWT.js';

const router = express.Router();

// Public list
router.get('/', listExchangeBooksPaginated);

// Nearest (requires login)
router.get('/nearest', verifyJWT, findNearestBooks);

// Owner-based gets (requires login)
router.get('/user/:userId', verifyJWT, getUserBooks);
router.get('/user/:userId/last-three', verifyJWT, getLastThreeBooks);

// Single book detail (requires login)
router.get('/:id', verifyJWT, getSingleBook);

// Create / Update / Delete / Request (all require login)
router.post('/', verifyJWT, upload.single('coverImage'), addExchangeBook);
router.put('/:id', verifyJWT, upload.single('coverImage'), updateExchangeBook);
router.delete('/:bookId', verifyJWT, deleteUserBook);
router.post('/request', verifyJWT, requestExchange);

export default router;
