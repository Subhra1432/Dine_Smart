import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@dinesmart/shared';
export declare function requireRole(allowedRoles: Role[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=roleGuard.d.ts.map