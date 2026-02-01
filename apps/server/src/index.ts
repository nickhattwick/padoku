import { createApp } from './app.js';
import { initDatabase, closeDb } from './db/database.js';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './data/paddock.db';

async function start() {
  try {
    // Ensure data directory exists
    await mkdir(dirname(DB_PATH), { recursive: true });

    // Initialize database
    console.log('🗄️  Initializing database...');
    await initDatabase();

    // Create and start Express app
    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🏁 Paddock Server Running           ┃
┃                                       ┃
┃  Port: ${PORT}                         ┃
┃  API:  http://localhost:${PORT}/api    ┃
┃                                       ┃
┃  Run your laps. Beat your pace.      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
      `);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('\n🛑 Shutting down gracefully...');
      server.close(() => {
        closeDb();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
