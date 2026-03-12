import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  loginWithGoogle,
  getCurrentUser,
  deleteSession,
  verifyToken,
  getGoogleClientId,
  migrateWorkItemsToUser,
  findUserByEmail,
  createSession,
  generateToken,
} from '../services/AuthService.js';

const router = Router();

// Allowlist of emails permitted to use Padoku
// Add emails here to grant access
const ALLOWED_EMAILS = new Set([
  'admin@example.com',
  'user@example.com',
]);

// Schema for Google login
const googleLoginSchema = z.object({
  idToken: z.string().min(1),
});

/**
 * GET /auth/config
 * Get OAuth configuration for frontend
 */
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    googleClientId: getGoogleClientId(),
  });
});

/**
 * POST /auth/google
 * Login with Google ID token
 */
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken } = googleLoginSchema.parse(req.body);

    const result = await loginWithGoogle(idToken);
    if (!result) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const { user, token, isNewUser } = result;

    // Check if email is in allowlist
    if (!ALLOWED_EMAILS.has(user.email)) {
      console.log(`🚫 Access denied for ${user.email} - not in allowlist`);
      return res.status(403).json({ error: 'Access denied. Contact admin for access.' });
    }

    // If this is admin@example.com, migrate existing items
    if (user.email === 'admin@example.com') {
      const migratedCount = migrateWorkItemsToUser(user.id);
      if (migratedCount > 0) {
        console.log(`📦 Migrated ${migratedCount} work items to ${user.email}`);
      }
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      token,
      isNewUser,
    });
  } catch (error) {
    console.error('Google login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request body', details: error.errors });
    }
    return res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /auth/me
 * Get current user from token
 */
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const user = getCurrentUser(token);

  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  });
});

/**
 * POST /auth/logout
 * Logout current session
 */
router.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ ok: true }); // Already logged out
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (payload) {
    deleteSession(payload.sessionId);
  }

  return res.json({ ok: true });
});

/**
 * POST /auth/migrate
 * Migrate existing work items to current user (admin only)
 */
router.post('/migrate', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const user = getCurrentUser(token);

  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Only allow admin@example.com to migrate
  if (user.email !== 'admin@example.com') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const migratedCount = migrateWorkItemsToUser(user.id);

  return res.json({
    ok: true,
    migratedCount,
    message: `Migrated ${migratedCount} work items to your account`,
  });
});

/**
 * GET /auth/dev-token
 * Development only - get a test token for API testing
 * Remove this in production!
 */
router.get('/dev-token', (_req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  const user = findUserByEmail('admin@example.com');
  if (!user) {
    return res.status(500).json({ error: 'Test user not found' });
  }

  const session = createSession(user.id);
  const token = generateToken(user, session);

  return res.json({ token, user: { id: user.id, email: user.email } });
});

export default router;
