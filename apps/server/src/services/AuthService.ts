import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { getDb, saveDatabase, assignWorkItemsToUser } from '../db/database.js';

// Environment variables (will be set in .env)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-jwt-secret-change-me';
const JWT_EXPIRES_IN = '7d';

// Google OAuth client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  google_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: number;
  created_at: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  sessionId: string;
}

/**
 * Verify Google ID token and extract user info
 */
export const verifyGoogleToken = async (idToken: string): Promise<{
  email: string;
  name: string;
  picture: string;
  googleId: string;
} | null> => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return null;
    }

    return {
      email: payload.email,
      name: payload.name || '',
      picture: payload.picture || '',
      googleId: payload.sub,
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    return null;
  }
};

/**
 * Find user by email
 */
export const findUserByEmail = (email: string): User | null => {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  stmt.bind([email]);
  
  if (stmt.step()) {
    const user = stmt.getAsObject() as User;
    stmt.free();
    return user;
  }
  
  stmt.free();
  return null;
};

/**
 * Find user by ID
 */
export const findUserById = (id: string): User | null => {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  stmt.bind([id]);
  
  if (stmt.step()) {
    const user = stmt.getAsObject() as User;
    stmt.free();
    return user;
  }
  
  stmt.free();
  return null;
};

/**
 * Create a new user
 */
export const createUser = (data: {
  email: string;
  name: string;
  picture: string;
  googleId: string;
}): User => {
  const db = getDb();
  const id = randomUUID();
  const now = Date.now();
  
  const stmt = db.prepare(`
    INSERT INTO users (id, email, name, picture, google_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([id, data.email, data.name, data.picture, data.googleId, now, now]);
  stmt.free();
  
  saveDatabase();
  
  return {
    id,
    email: data.email,
    name: data.name,
    picture: data.picture,
    google_id: data.googleId,
    created_at: now,
    updated_at: now,
  };
};

/**
 * Update user info (on subsequent logins)
 */
export const updateUser = (id: string, data: {
  name?: string;
  picture?: string;
}): void => {
  const db = getDb();
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.picture !== undefined) {
    updates.push('picture = ?');
    values.push(data.picture);
  }
  
  if (updates.length > 0) {
    values.push(id);
    const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(values);
    stmt.free();
    saveDatabase();
  }
};

/**
 * Create a session for a user
 */
export const createSession = (userId: string): Session => {
  const db = getDb();
  const id = randomUUID();
  const now = Date.now();
  const expiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days
  
  const stmt = db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run([id, userId, expiresAt, now]);
  stmt.free();
  
  saveDatabase();
  
  return {
    id,
    user_id: userId,
    expires_at: expiresAt,
    created_at: now,
  };
};

/**
 * Find valid session by ID
 */
export const findValidSession = (sessionId: string): Session | null => {
  const db = getDb();
  const now = Date.now();
  const stmt = db.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > ?');
  stmt.bind([sessionId, now]);
  
  if (stmt.step()) {
    const session = stmt.getAsObject() as Session;
    stmt.free();
    return session;
  }
  
  stmt.free();
  return null;
};

/**
 * Delete session (logout)
 */
export const deleteSession = (sessionId: string): void => {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  stmt.run([sessionId]);
  stmt.free();
  saveDatabase();
};

/**
 * Delete all sessions for a user
 */
export const deleteUserSessions = (userId: string): void => {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?');
  stmt.run([userId]);
  stmt.free();
  saveDatabase();
};

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = (): number => {
  const db = getDb();
  const now = Date.now();
  const stmt = db.prepare('DELETE FROM sessions WHERE expires_at < ?');
  stmt.run([now]);
  stmt.free();
  saveDatabase();
  
  // Get count of deleted
  const result = db.exec('SELECT changes()');
  return result[0]?.values[0]?.[0] as number || 0;
};

/**
 * Generate JWT token for a session
 */
export const generateToken = (user: User, session: Session): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    sessionId: session.id,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

/**
 * Complete login flow: verify Google token, create/update user, create session
 */
export const loginWithGoogle = async (googleIdToken: string): Promise<{
  user: User;
  token: string;
  isNewUser: boolean;
} | null> => {
  // Verify Google token
  const googleUser = await verifyGoogleToken(googleIdToken);
  if (!googleUser) {
    return null;
  }
  
  // Find or create user
  let user = findUserByEmail(googleUser.email);
  let isNewUser = false;
  
  if (user) {
    // Update user info
    updateUser(user.id, {
      name: googleUser.name,
      picture: googleUser.picture,
    });
    user = findUserById(user.id)!;
  } else {
    // Create new user
    user = createUser(googleUser);
    isNewUser = true;
  }
  
  // Create session
  const session = createSession(user.id);
  
  // Generate JWT
  const token = generateToken(user, session);
  
  return { user, token, isNewUser };
};

/**
 * Get current user from token
 */
export const getCurrentUser = (token: string): User | null => {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }
  
  // Verify session is still valid
  const session = findValidSession(payload.sessionId);
  if (!session) {
    return null;
  }
  
  return findUserById(payload.userId);
};

/**
 * Migrate existing work items to a user
 */
export const migrateWorkItemsToUser = (userId: string): number => {
  return assignWorkItemsToUser('', userId);
};

/**
 * Get Google Client ID for frontend
 */
export const getGoogleClientId = (): string => {
  return GOOGLE_CLIENT_ID;
};
