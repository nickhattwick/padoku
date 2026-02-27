import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DB_PATH || './data/paddock.db';

let db: SqlJsDatabase;
let SQL: any;

/**
 * Initialize the SQLite database using sql.js
 * Creates the database file if it doesn't exist
 * Runs the schema to create tables and indexes
 */
export const initDatabase = async (): Promise<SqlJsDatabase> => {
  // Initialize sql.js
  SQL = await initSqlJs();

  // Ensure data directory exists
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Load existing database or create new one
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log('✅ Database loaded from:', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('✅ New database created at:', DB_PATH);
  }

  // Run schema to create tables
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);

  // Run migrations
  runMigrations();

  // Save database to disk
  saveDatabase();

  console.log('✅ Database initialized successfully');

  return db;
};

/**
 * Run database migrations for schema updates
 */
const runMigrations = (): void => {
  // Migration 1: Add grid_points column
  try {
    const result = db.exec("SELECT grid_points FROM work_items LIMIT 1");
  } catch {
    console.log('📦 Running migration: Adding grid_points column...');
    db.exec("ALTER TABLE work_items ADD COLUMN grid_points INTEGER");
    console.log('✅ Migration complete: grid_points column added');
  }
};

/**
 * Get the database instance
 * Throws an error if database hasn't been initialized
 */
export const getDb = (): SqlJsDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

/**
 * Save the database to disk
 */
export const saveDatabase = (): void => {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(DB_PATH, buffer);
};

/**
 * Close the database connection
 */
export const closeDb = (): void => {
  if (db) {
    saveDatabase();
    db.close();
    console.log('🔌 Database connection closed and saved');
  }
};
