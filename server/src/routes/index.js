import express from 'express';
import authRoutes from './authRoutes.js';
import tutorRoutes from './tutorRoutes.js';
import problemRoutes from './problemRoutes.js';
import codeRoutes from './codeRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import interviewRoutes from './interviewRoutes.js';

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/tutor', tutorRoutes);
apiRouter.use('/problems', problemRoutes);
apiRouter.use('/code', codeRoutes);
apiRouter.use('/resume', resumeRoutes);
apiRouter.use('/interview', interviewRoutes);

export default apiRouter;