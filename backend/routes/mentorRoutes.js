import express from 'express';
import { socraticMentor } from '../controllers/mentorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', socraticMentor);

export default router;
