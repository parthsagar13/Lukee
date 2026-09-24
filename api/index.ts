/**
 * Vercel serverless entry — mounts the Express API without app.listen().
 * Static frontend is served from `dist/` via vercel.json outputDirectory.
 */
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { dbService } from '../src/db/dbService.js';
import apiRouter from '../src/routes/api.js';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.get('/health', async (_req, res) => {
  try {
    await dbService.ensureConnected();
    res.status(200).json({ status: 'ok', db: dbService.getDbStatus() });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      db: dbService.getDbStatus(),
      error: err instanceof Error ? err.message : 'Database unavailable',
    });
  }
});

// Wait for MongoDB before any API handler (fixes create vs list mismatch on Vercel)
app.use(async (_req, res, next) => {
  try {
    await dbService.ensureConnected();
    next();
  } catch (err) {
    console.error('[vercel] Database not ready:', err);
    res.status(503).json({
      error: err instanceof Error ? err.message : 'Database unavailable.',
      db: dbService.getDbStatus(),
    });
  }
});

app.use('/api', apiRouter);

export default app;
