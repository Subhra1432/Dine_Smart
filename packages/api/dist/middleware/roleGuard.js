// ═══════════════════════════════════════════
// DineSmart OS — Role Guard Middleware
// ═══════════════════════════════════════════
export function requireRole(allowedRoles) {
    return (req, res, next) => {
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
//# sourceMappingURL=roleGuard.js.map