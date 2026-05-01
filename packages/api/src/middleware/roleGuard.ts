// ═══════════════════════════════════════════
// DineSmart OS — Role Guard Middleware
// ═══════════════════════════════════════════

import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@dinesmart/shared';

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}
