import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { dbService } from './src/db/dbService.js';
import apiRouter from './src/routes/api.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Parse JSON body and support CORS
  app.use(express.json());
  app.use(cors({
    origin: '*',
    credentials: true
  }));

  // 2. Connect to Database (dynamic MongoDB / JSON fallback)
  await dbService.connect();

  // 3. API Router
  app.use('/api', apiRouter);

  // 4. Vite middleware or static serving
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting development server with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Starting production server with static bundle serving...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lukee Jewels is shining at http://localhost:${PORT}`);
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('[server] Error:', err);
    process.exit(1);
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
}

startServer().catch(err => {
  console.error('Fatal error launching server:', err);
  process.exit(1);
});

