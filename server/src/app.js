import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

const getCleanOrigin = (url) => {
  if (!url || url === '*') return '*';
  try {
    return new URL(url).origin;
  } catch {
    return url.replace(/\/+$/, '');
  }
};

const configuredClientUrl = getCleanOrigin(process.env.CLIENT_URL);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow local development servers
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true);
    }

    // Allow all Vercel production and preview deployment subdomains
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Allow explicit CLIENT_URL from Render environment variables
    if (configuredClientUrl && (configuredClientUrl === '*' || origin === configuredClientUrl)) {
      return callback(null, true);
    }

    console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
    return callback(new Error(`CORS blocked for origin: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'Prep Genius API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;