import express from 'express';
import upload from '../middleware/upload.js';
import { verifyJWT } from '../middleware/authJWT.js';
import {
  listDonationsPaginated,
  getUserDonations,
  getSingleDonation,
  addDonation,
  updateDonation,
  deleteDonation,
  requestDonation,
  findNearestDonations
} from '../controllers/donationController.js';

const router = express.Router();

router.get('/',                 listDonationsPaginated);
router.get('/nearest', verifyJWT, findNearestDonations);
router.get('/user/:userId', verifyJWT, getUserDonations);
router.get('/:id', verifyJWT, getSingleDonation);
router.post('/', verifyJWT, upload.single('coverImage'), addDonation);
router.put('/:id', verifyJWT, upload.single('coverImage'), updateDonation);
router.delete('/:donationId', verifyJWT, deleteDonation);
router.post('/request', verifyJWT, requestDonation);

export default router;
