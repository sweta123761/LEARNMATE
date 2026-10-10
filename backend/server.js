import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

const app = express();

// Vercel preview deployments have their own origin, separate from the stable
// production domain. FRONTEND_URL can contain a comma-separated allowlist.
const frontendOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Requests without an Origin header (for example, server-to-server calls)
    // are not subject to browser CORS checks.
    if (!origin || frontendOrigins.length === 0 || frontendOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => res.send('LearnMate API Running'));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error(`[MongoDB] Request unavailable: ${error.message}`);
    res.status(503).json({ message: 'Database unavailable. Check the backend MONGO_URI and MongoDB network access.' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sessions', sessionRoutes);

app.use((error, req, res, next) => {
  if (error?.type === 'entity.parse.failed') return res.status(400).json({ message: 'Request body must contain valid JSON' });
  console.error(`[API] Unhandled request error: ${error.message}`);
  res.status(500).json({ message: 'Unexpected API error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
