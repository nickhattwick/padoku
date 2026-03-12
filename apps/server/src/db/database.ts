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
 * Runs migrations for schema updates
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

  // Run migrations FIRST (before schema, to add any missing columns)
  runMigrations();

  // Run schema to create any new tables/indexes
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  
  // Execute schema line by line, ignoring errors for already-existing objects
  const statements = schema.split(';').filter(s => s.trim());
  for (const stmt of statements) {
    try {
      if (stmt.trim()) {
        db.exec(stmt);
      }
    } catch (e) {
      // Ignore "already exists" errors
      const msg = (e as Error).message;
      if (!msg.includes('already exists') && !msg.includes('duplicate column')) {
        console.log(`Schema warning: ${msg}`);
      }
    }
  }

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
    db.exec("SELECT grid_points FROM work_items LIMIT 1");
  } catch {
    console.log('📦 Running migration: Adding grid_points column...');
    db.exec("ALTER TABLE work_items ADD COLUMN grid_points INTEGER");
    console.log('✅ Migration complete: grid_points column added');
  }

  // Migration 2: Add user_id column to work_items
  try {
    db.exec("SELECT user_id FROM work_items LIMIT 1");
  } catch {
    console.log('📦 Running migration: Adding user_id to work_items...');
    try {
      db.exec("ALTER TABLE work_items ADD COLUMN user_id TEXT");
      console.log('✅ Migration complete: user_id column added to work_items');
    } catch (e) {
      console.log('Note: user_id migration -', (e as Error).message);
    }
  }

  // Migration 3: Create users table (if not exists)
  try {
    db.exec("SELECT 1 FROM users LIMIT 1");
  } catch {
    console.log('📦 Running migration: Creating users table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        picture TEXT,
        google_id TEXT UNIQUE,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);
    console.log('✅ Migration complete: users table created');
  }

  // Migration 4: Create sessions table (if not exists)
  try {
    db.exec("SELECT 1 FROM sessions LIMIT 1");
  } catch {
    console.log('📦 Running migration: Creating sessions table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Migration complete: sessions table created');
  }

  // Migration 5: Create comments table (if not exists)
  try {
    db.exec("SELECT 1 FROM comments LIMIT 1");
  } catch {
    console.log('📦 Running migration: Creating comments table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        work_item_id TEXT NOT NULL,
        user_id TEXT,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (work_item_id) REFERENCES work_items(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Migration complete: comments table created');
  }

  // Migration 6: Add teams tables
  try {
    db.exec("SELECT 1 FROM teams LIMIT 1");
  } catch {
    console.log('📦 Running migration: Creating teams tables...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        owner_id TEXT NOT NULL,
        is_public INTEGER DEFAULT 0,
        max_members INTEGER DEFAULT 10,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS team_members (
        team_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'pending', 'invited')),
        team_project_id TEXT,
        joined_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        PRIMARY KEY (team_id, user_id),
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (team_project_id) REFERENCES work_items(id) ON DELETE SET NULL
      )
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS team_work_items (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        work_item_id TEXT NOT NULL,
        shared_by TEXT NOT NULL,
        shared_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        UNIQUE (team_id, work_item_id),
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (work_item_id) REFERENCES work_items(id) ON DELETE CASCADE,
        FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Migration complete: teams tables created');
  }

  // Migration 7: Add assignee_id to work_items
  try {
    db.exec("SELECT assignee_id FROM work_items LIMIT 1");
  } catch {
    console.log('📦 Running migration: Adding assignee_id to work_items...');
    db.exec("ALTER TABLE work_items ADD COLUMN assignee_id TEXT");
    console.log('✅ Migration complete: assignee_id column added');
  }

  // Migration 8: Add user profile fields
  try {
    db.exec("SELECT is_public FROM users LIMIT 1");
  } catch {
    console.log('📦 Running migration: Adding user profile fields...');
    try { db.exec("ALTER TABLE users ADD COLUMN is_public INTEGER DEFAULT 0"); } catch {}
    try { db.exec("ALTER TABLE users ADD COLUMN profile_code TEXT"); } catch {}
    try { db.exec("ALTER TABLE users ADD COLUMN display_name TEXT"); } catch {}
    console.log('✅ Migration complete: user profile fields added');
  }

  // Create indexes if they don't exist
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
    "CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)",
    "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)",
    "CREATE INDEX IF NOT EXISTS idx_work_items_user_id ON work_items(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_comments_work_item ON comments(work_item_id)",
    "CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id)",
    "CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(code)",
    "CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_team_work_items_team ON team_work_items(team_id)",
    "CREATE INDEX IF NOT EXISTS idx_work_items_assignee ON work_items(assignee_id)",
    "CREATE INDEX IF NOT EXISTS idx_users_profile_code ON users(profile_code)",
  ];

  for (const idx of indexes) {
    try {
      db.exec(idx);
    } catch {
      // Index might already exist
    }
  }
};

/**
 * Assign all existing work items to a user by email
 */
export const assignWorkItemsToUser = (_email: string, userId: string): number => {
  const stmt = db.prepare('UPDATE work_items SET user_id = ? WHERE user_id IS NULL');
  stmt.run([userId]);
  stmt.free();
  
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM work_items WHERE user_id = ?');
  countStmt.bind([userId]);
  countStmt.step();
  const result = countStmt.getAsObject() as { count: number };
  countStmt.free();
  
  saveDatabase();
  return result.count;
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
