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

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', apiRouter);

dbService.connect().catch((err) => {
  console.error('[vercel] Database connection error:', err);
});

export default app;
