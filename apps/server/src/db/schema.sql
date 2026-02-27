-- Enable foreign keys and WAL mode for better performance
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    picture TEXT, -- Google profile picture URL
    google_id TEXT UNIQUE, -- Google's unique user ID
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Main Work Item table
-- Unified model for tasks, projects, epics, goals - everything
CREATE TABLE IF NOT EXISTS work_items (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- Owner of this work item (NULL for legacy items)
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK(status IN ('garage', 'on_track', 'pits', 'checkered')),
    parent_id TEXT,
    due_at INTEGER, -- Unix timestamp in milliseconds
    grid_points INTEGER, -- Fibonacci scale: 1, 2, 3, 5, 8, 13, 21
    is_goal INTEGER DEFAULT 0, -- SQLite boolean (0/1)
    goal_end_condition TEXT,
    goal_target INTEGER, -- Expected number of children for defined goals (null for open-ended)
    is_recurring_template INTEGER DEFAULT 0,
    recurrence_rule TEXT, -- JSON string for rrule
    position REAL NOT NULL DEFAULT 0, -- For ordering within status column (fractional indexing)
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES work_items(id) ON DELETE CASCADE
);

-- Time logs table
-- Tracks time spent on work items
CREATE TABLE IF NOT EXISTS time_logs (
    id TEXT PRIMARY KEY,
    work_item_id TEXT NOT NULL,
    start_time INTEGER NOT NULL, -- Unix timestamp in milliseconds
    end_time INTEGER, -- NULL if timer is active
    duration INTEGER, -- Milliseconds, calculated when ended
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),

    FOREIGN KEY (work_item_id) REFERENCES work_items(id) ON DELETE CASCADE
);

-- Block records table
-- Tracks when work items are blocked and why
CREATE TABLE IF NOT EXISTS block_records (
    id TEXT PRIMARY KEY,
    work_item_id TEXT NOT NULL,
    reason TEXT,
    blocked_by_work_item_id TEXT,
    start_time INTEGER NOT NULL, -- Unix timestamp in milliseconds
    end_time INTEGER, -- NULL if still blocked
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),

    FOREIGN KEY (work_item_id) REFERENCES work_items(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_by_work_item_id) REFERENCES work_items(id) ON DELETE SET NULL
);

-- Sessions table for auth tokens
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL, -- Unix timestamp in milliseconds
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
-- User queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Parent and status are the most common queries
CREATE INDEX IF NOT EXISTS idx_work_items_parent_id ON work_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_work_items_status ON work_items(status);
CREATE INDEX IF NOT EXISTS idx_work_items_parent_status ON work_items(parent_id, status);
CREATE INDEX IF NOT EXISTS idx_work_items_user_id ON work_items(user_id);

-- Due date queries for calendar view
CREATE INDEX IF NOT EXISTS idx_work_items_due_at ON work_items(due_at) WHERE due_at IS NOT NULL;

-- Time log queries
CREATE INDEX IF NOT EXISTS idx_time_logs_work_item ON time_logs(work_item_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_time_range ON time_logs(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_time_logs_active ON time_logs(end_time) WHERE end_time IS NULL;

-- Block record queries
CREATE INDEX IF NOT EXISTS idx_block_records_work_item ON block_records(work_item_id);

-- Session queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Trigger to update updated_at timestamp on work_items
CREATE TRIGGER IF NOT EXISTS update_work_items_timestamp
AFTER UPDATE ON work_items
BEGIN
    UPDATE work_items SET updated_at = strftime('%s', 'now') * 1000 WHERE id = NEW.id;
END;

-- Trigger to update updated_at timestamp on users
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = strftime('%s', 'now') * 1000 WHERE id = NEW.id;
END;
