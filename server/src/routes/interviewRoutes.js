import express from 'express';
import {
  startInterview,
  submitAnswer,
  finishInterview,
  getUserInterviews,
  getInterviewById,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/start', startInterview);
router.post('/reply', submitAnswer);
router.post('/finish', finishInterview);
router.get('/history', getUserInterviews);
router.get('/:id', getInterviewById);

export default router;