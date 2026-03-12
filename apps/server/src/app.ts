import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import workItemsRouter from './routes/workItems.js';
import timeLogsRouter from './routes/timeLogs.js';
import blockRecordsRouter from './routes/blockRecords.js';
import analyticsRouter from './routes/analytics.js';
import authRouter from './routes/auth.js';
import commentsRouter from './routes/comments.js';
import { requireAuth } from './middleware/auth.js';

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

  // OpenAPI spec for ChatGPT Custom GPT Actions
  app.get('/api/openapi.json', (_req: Request, res: Response) => {
    res.sendFile('openapi.json', { root: './public' });
  });

  // MCP server for Claude Desktop
  app.get('/api/mcp-server.js', (_req: Request, res: Response) => {
    res.sendFile('index.js', { root: '../mcp-server/dist' });
  });

  // API Routes
  app.use('/api/auth', authRouter);
  
  // Protected routes - require authentication
  app.use('/api/work-items', requireAuth, workItemsRouter);
  app.use('/api/work-items', requireAuth, commentsRouter); // Comments are nested under work-items
  app.use('/api/time-logs', requireAuth, timeLogsRouter);
  app.use('/api/block-records', requireAuth, blockRecordsRouter);
  app.use('/api/analytics', requireAuth, analyticsRouter);

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
