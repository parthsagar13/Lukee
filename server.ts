import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { dbService } from './src/db/dbService.js';
import apiRouter from './src/routes/api.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log('[server] Initializing Express app...');

  // 1. Parse JSON body and support CORS
  app.use(express.json());
  app.use(cors({
    origin: '*',
    credentials: true
  }));
  console.log('[server] Middleware configured');

  // 2. Connect to Database (dynamic MongoDB / JSON fallback)
  console.log('[server] Connecting to database...');
  await dbService.connect();
  console.log('[server] Database connected');

  // 3. API Router
  console.log('[server] Setting up API routes...');
  app.use('/api', apiRouter);
  console.log('[server] API routes configured');

  // 4. Vite middleware or static serving
  if (process.env.NODE_ENV !== 'production') {
    console.log('[server] Starting development server with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[server] Starting production server with static bundle serving...');
    const distPath = path.join(process.cwd(), 'dist');
    console.log('[server] Serving static files from:', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      console.log('[server] Serving index.html for route:', req.path);
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
  console.log('[server] Static file serving configured');

  console.log('[server] Starting HTTP server on port', PORT);
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] Lukee Jewels is shining at http://localhost:${PORT}`);
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('[server] Server error:', err);
    process.exit(1);
  });

  server.on('clientError', (err, socket) => {
    console.error('[server] Client error:', err);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[unhandledRejection]', reason);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('[uncaughtException]', err);
    process.exit(1);
  });

  console.log('[server] All error handlers registered');
}

console.log('[server] Starting application...');
startServer().catch(err => {
  console.error('[server] Fatal error launching server:', err);
  process.exit(1);
});

