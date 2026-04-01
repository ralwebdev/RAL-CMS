import express from 'express';
import { getAdmissions, createAdmission } from '../controllers/admissionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getAdmissions).post(protect, createAdmission);

export default router;
