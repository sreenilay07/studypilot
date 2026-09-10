import express from 'express';
import {
  generate,
  saveStudySession,
  getStudyHistory,
  getSingleStudySession,
  deleteStudySession,
  analyzeQuiz,
  explainMistake,
  targetedRevision,
  memoryBooster
} from '../controllers/studyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all study routes
router.use(protect);

router.post('/generate', generate);
router.post('/', saveStudySession);
router.get('/', getStudyHistory);
router.get('/:id', getSingleStudySession);
router.delete('/:id', deleteStudySession);
router.post('/:id/analyze', analyzeQuiz);
router.post('/:id/explain-mistake', explainMistake);
router.post('/:id/revision', targetedRevision);
router.post('/:id/memory-booster', memoryBooster);

export default router;
