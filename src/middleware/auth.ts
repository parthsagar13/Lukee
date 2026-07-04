import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'lukee-jewels-ultra-luxury-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  adminId?: string;
  adminEmail?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. Unauthorized credentials.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    req.adminId = decoded.id;
    req.adminEmail = decoded.email;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Session expired or token is invalid. Please log in again.' });
  }
}
