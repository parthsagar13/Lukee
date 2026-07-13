import express from 'express';
import path from 'path';
import cors from 'cors';
import 'dotenv/config';
import { dbService } from './src/db/dbService.js';
import apiRouter from './src/routes/api.js';

const isProduction =
  process.env.NODE_ENV === 'production' ||
  Boolean(process.env.RAILWAY_ENVIRONMENT) ||
  Boolean(process.env.RENDER) ||
  Boolean(process.env.VERCEL);

/** Vercel runs Express as a serverless function (no app.listen). */
const isServerless = Boolean(process.env.VERCEL);

function createApp() {
  const app = express();

  console.log('[server] Initializing Express app...');

  app.use(express.json());
  app.use(cors({
    origin: '*',
    credentials: true
  }));
  console.log('[server] Middleware configured');

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api', apiRouter);
  console.log('[server] API routes configured');

  if (isProduction) {
    console.log('[server] Serving production static files from dist/...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) next(err);
      });
    });
    console.log('[server] Static file serving configured');
  }

  dbService.connect().catch((err) => {
    console.error('[server] Database connection error:', err);
  });

  return app;
}

async function attachViteDev(app: express.Express) {
  console.log('[server] Starting development server with Vite middleware...');
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
  console.log('[server] Vite middleware configured');
}

const app = createApp();

async function startServer() {
  const PORT = Number(process.env.PORT) || 4000;

  if (!isProduction) {
    await attachViteDev(app);
  }

  console.log('[server] Starting HTTP server on port', PORT);
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] Lukee Jewels is shining on port ${PORT} (${isProduction ? 'production' : 'development'})`);
  });

  server.on('error', (err) => {
    console.error('[server] Server error:', err);
    process.exit(1);
  });

  server.on('clientError', (_err, socket) => {
    console.error('[server] Client error');
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection]', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('[uncaughtException]', err);
    process.exit(1);
  });

  console.log('[server] All error handlers registered');
}

if (!isServerless) {
  console.log('[server] Starting application...');
  startServer().catch((err) => {
    console.error('[server] Fatal error launching server:', err);
    process.exit(1);
  });
}

export default app;
