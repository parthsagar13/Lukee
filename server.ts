import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbService } from './src/db/dbService.js';
import apiRouter from './src/routes/api.js';

dotenv.config();

const isProduction =
  process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 4000;

  // 1. Parse JSON body and support CORS
  app.use(express.json());
  app.use(cors({
    origin: '*',
    credentials: true
  }));

  // Health check for Railway / load balancers (respond before DB is ready)
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // 2. API Router
  app.use('/api', apiRouter);

  // 3. Vite middleware or static serving
  if (!isProduction) {
    console.log('Starting development server with Vite middleware...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Starting production server with static bundle serving...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) next(err);
      });
    });
  }

  // 4. Connect to database in background so the server starts quickly
  dbService.connect().catch((err) => {
    console.error('Database connection error:', err);
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lukee Jewels is shining on port ${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('Fatal error launching server:', err);
});
