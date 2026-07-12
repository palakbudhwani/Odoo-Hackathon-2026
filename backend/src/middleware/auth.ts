import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export interface AuthRequest extends Request {
  userId?: number;
  roleId?: number;
  roleName?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = header.slice(7);
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    req.roleId = payload.roleId;
    req.roleName = payload.roleName;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(roleName: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.roleName || req.roleName !== roleName) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

export function requireAnyRole(...roleNames: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.roleName || !roleNames.includes(req.roleName)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
