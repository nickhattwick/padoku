-- Migration: Add Teams feature
-- Version: 002
-- Date: 2026-03-12

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,  -- 6-char invite code
    owner_id TEXT NOT NULL,
    is_public INTEGER DEFAULT 0,  -- SQLite boolean
    max_members INTEGER DEFAULT 10,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),

    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Team membership
CREATE TABLE IF NOT EXISTS team_members (
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'pending', 'invited')),
    team_project_id TEXT,  -- User's local project that syncs with team
    joined_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),

    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_project_id) REFERENCES work_items(id) ON DELETE SET NULL
);

-- Shared work items (what's visible to team)
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
);

-- Add assignee to work items
ALTER TABLE work_items ADD COLUMN assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL;

-- Add user profile settings
ALTER TABLE users ADD COLUMN is_public INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN profile_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN display_name TEXT;  -- Public display name

-- Indexes for teams
CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(code);
CREATE INDEX IF NOT EXISTS idx_teams_public ON teams(is_public) WHERE is_public = 1;

-- Indexes for team members
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_project ON team_members(team_project_id);

-- Indexes for team work items
CREATE INDEX IF NOT EXISTS idx_team_work_items_team ON team_work_items(team_id);
CREATE INDEX IF NOT EXISTS idx_team_work_items_item ON team_work_items(work_item_id);

-- Index for assignees
CREATE INDEX IF NOT EXISTS idx_work_items_assignee ON work_items(assignee_id) WHERE assignee_id IS NOT NULL;

-- Index for user profiles
CREATE INDEX IF NOT EXISTS idx_users_profile_code ON users(profile_code) WHERE profile_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_public ON users(is_public) WHERE is_public = 1;

-- Trigger to update teams timestamp
CREATE TRIGGER IF NOT EXISTS update_teams_timestamp
AFTER UPDATE ON teams
BEGIN
    UPDATE teams SET updated_at = strftime('%s', 'now') * 1000 WHERE id = NEW.id;
END;
