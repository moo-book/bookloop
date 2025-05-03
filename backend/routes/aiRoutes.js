// routes/aiRoutes.js
import express from 'express';
import { handleDialogflow } from '../controllers/aiController.js';

const router = express.Router();

router.post('/recommend', handleDialogflow);

export default router;
