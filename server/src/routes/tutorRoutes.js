import express from 'express';
import {
  sendMessage,
  getTutorHistory,
  getUserSessions,
  getSessionById,
  deleteSession,
} from '../controllers/tutorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply JWT auth protection to all tutor routes
router.use(protect);

router.post('/chat', sendMessage);
router.get('/history/:problemId', getTutorHistory);
router.get('/sessions', getUserSessions);
router.get('/sessions/:id', getSessionById);
router.delete('/session/:problemId', deleteSession);
router.delete('/sessions/:id', deleteSession);

export default router;