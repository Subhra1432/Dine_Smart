// ═══════════════════════════════════════════
// DineSmart OS — Authentication Middleware
// ═══════════════════════════════════════════
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function authenticate(req, res, next) {
    const token = req.cookies?.accessToken;
    if (!token) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
    }
    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
}
export function authenticateSuperAdmin(req, res, next) {
    const token = req.cookies?.superAdminToken;
    if (!token) {
        res.status(401).json({ success: false, error: 'Super admin authentication required' });
        return;
    }
    try {
        const decoded = jwt.verify(token, env.JWT_SUPERADMIN_SECRET);
        if (decoded.scope !== 'superadmin') {
            res.status(403).json({ success: false, error: 'Invalid scope' });
            return;
        }
        req.superAdmin = decoded;
        next();
    }
    catch {
        res.status(401).json({ success: false, error: 'Invalid or expired super admin token' });
    }
}
//# sourceMappingURL=auth.js.map