
import jwt from 'jsonwebtoken';
import type { UserRole } from '../config/user.js';
import type { NextFunction, Response } from 'express';


const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_hims_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
    role: UserRole;
    fullName: string;
  };
}

// 1. Verify token exists and is valid
export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader : any = req.headers;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or Expired Security Token' });
  }
};

// 2. Authorize based on strict role privileges
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Session Context Missing' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Your role [${req.user.role}] is unauthorized to view this dashboard workspace.` 
      });
    }

    next();
  };
};