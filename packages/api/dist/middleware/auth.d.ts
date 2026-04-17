import type { Request, Response, NextFunction } from 'express';
import type { JwtAccessPayload, JwtSuperAdminPayload } from '@dinesmart/shared';
declare global {
    namespace Express {
        interface Request {
            user?: JwtAccessPayload;
            superAdmin?: JwtSuperAdminPayload;
        }
    }
}
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
export declare function authenticateSuperAdmin(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map