import { config } from './config/env.js';
import app from './app.js';
import { connectDB } from './config/db.js';

connectDB()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB:', err.message);
    process.exit(1);
  });