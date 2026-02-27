import { Request, Response, NextFunction } from 'express';
import { getCurrentUser, User } from '../services/AuthService.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User | null;
      userId?: string | null;
    }
  }
}

/**
 * Optional auth middleware - sets user if token provided, but doesn't require it
 * Use this for routes that work with or without auth
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = getCurrentUser(token);
    req.user = user;
    req.userId = user?.id || null;
  } else {
    req.user = null;
    req.userId = null;
  }
  
  next();
};

/**
 * Required auth middleware - returns 401 if no valid token
 * Use this for routes that require authentication
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  const user = getCurrentUser(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.user = user;
  req.userId = user.id;
  
  next();
};

/**
 * Admin auth middleware - requires specific email
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  const user = getCurrentUser(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  // Only allow specific admin email
  if (user.email !== 'admin@example.com') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  req.user = user;
  req.userId = user.id;
  
  next();
};
