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
  memoryBooster,
  getNextAction,
  getRoadmap,
  getCommonTraps,
  compareConcepts,
  getFiveMinuteSprint,
  evaluateTeachBack
} from '../controllers/studyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all study routes
router.use(protect);

router.post('/generate', generate);
router.post('/', saveStudySession);
router.get('/', getStudyHistory);
router.get('/next-action', getNextAction);

router.get('/:id', getSingleStudySession);
router.delete('/:id', deleteStudySession);
router.get('/:id/roadmap', getRoadmap);
router.get('/:id/traps', getCommonTraps);
router.post('/:id/compare', compareConcepts);
router.post('/:id/sprint', getFiveMinuteSprint);
router.post('/:id/teach-back', evaluateTeachBack);
router.post('/:id/analyze', analyzeQuiz);
router.post('/:id/explain-mistake', explainMistake);
router.post('/:id/revision', targetedRevision);
router.post('/:id/memory-booster', memoryBooster);

export default router;
