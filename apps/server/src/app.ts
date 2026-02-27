import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import workItemsRouter from './routes/workItems.js';
import timeLogsRouter from './routes/timeLogs.js';
import blockRecordsRouter from './routes/blockRecords.js';
import analyticsRouter from './routes/analytics.js';
import authRouter from './routes/auth.js';

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Request logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/work-items', workItemsRouter);
  app.use('/api/time-logs', timeLogsRouter);
  app.use('/api/block-records', blockRecordsRouter);
  app.use('/api/analytics', analyticsRouter);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  return app;
};
