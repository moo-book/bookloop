// routes/chatRoutes.js
import express from 'express';
import { getChatMessages, sendMessage, getUserChats, deleteChat } from '../controllers/chatController.js';
import { verifyJWT } from '../middleware/authJWT.js';

const router = express.Router();

router.get('/user', verifyJWT, getUserChats);
router.get('/session/:chatId', verifyJWT, getChatMessages);
router.post('/session/send', verifyJWT, sendMessage);
router.delete('/:chatId', verifyJWT, deleteChat);

export default router;
