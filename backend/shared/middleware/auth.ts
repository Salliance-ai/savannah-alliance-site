import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Tenant, Provider } from '../types/index.js';

export interface AuthRequest extends Request {
  tenant?: Tenant;
  user?: {
    id: string;
    tenantId: string;
    role: string;
    providerId?: string;
  };
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'changeme';
  
  jwt.verify(token, jwtSecret, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = {
      id: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
      providerId: decoded.providerId,
    };

    next();
  });
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

export function requireTenantAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // In multi-tenant scenarios, verify tenant access
  const requestedTenantId = req.params.tenantId || req.body.tenantId;
  
  if (requestedTenantId && requestedTenantId !== req.user.tenantId) {
    res.status(403).json({ error: 'Access denied to this tenant' });
    return;
  }

  next();
}
