import dotenv from 'dotenv';
dotenv.config();

const REQUIRED_ENV = [
  'MONGO_URI',
  'JWT_SECRET',
  'GEMINI_API_KEY',
  'SUPABASE_URL',
];

const missing = REQUIRED_ENV.filter((key) => !process.env[key] || process.env[key].trim() === '');

// Check for any valid Supabase secret key variant
const supabaseKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''
).trim();

if (!supabaseKey) {
  missing.push('SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY)');
}

if (missing.length > 0) {
  console.error('\n❌ [FATAL CONFIG ERROR] Missing required environment variables in server/.env:');
  missing.forEach((k) => console.error(`   - ${k}`));
  console.error('Please define these in your .env file before starting the server.\n');
  process.exit(1);
}

export const config = Object.freeze({
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  mongoUri: process.env.MONGO_URI.trim(),
  jwtSecret: process.env.JWT_SECRET.trim(),
  geminiApiKey: (process.env.RESUME_GEMINI_API_KEY || process.env.GEMINI_API_KEY).trim(),
  supabase: {
    url: process.env.SUPABASE_URL.trim(),
    key: supabaseKey,
    bucket: (process.env.SUPABASE_BUCKET || 'resumes').trim(),
  },
  judge0: {
    url: (process.env.JUDGE0_API_URL || 'https://ce.judge0.com').replace(/\/+$/, ''),
    key: process.env.JUDGE0_API_KEY || '',
  },
});