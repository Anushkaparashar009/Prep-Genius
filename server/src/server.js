import dotenv from 'dotenv';
dotenv.config();

// Verify mandatory environment secrets on startup
const REQUIRED_ENV = [
  'MONGO_URI',
  'JWT_SECRET',
  'GEMINI_API_KEY',
];

const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key] || process.env[key].trim() === '');
if (missingEnv.length > 0) {
  console.error(`\n❌ [FATAL CONFIG ERROR] Missing required environment variables in server/.env:`);
  missingEnv.forEach((key) => console.error(`   - ${key}`));
  console.error(`Please define them before starting the backend server.\n`);
  process.exit(1);
}

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB:', err.message);
    process.exit(1);
  });