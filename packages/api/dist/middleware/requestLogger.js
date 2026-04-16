// ═══════════════════════════════════════════
// DineSmart OS — Request Logger Middleware
// ═══════════════════════════════════════════
import { logger } from '../config/logger.js';
export function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')?.substring(0, 100),
        };
        if (res.statusCode >= 400) {
            logger.warn('Request failed', logData);
        }
        else if (duration > 1000) {
            logger.warn('Slow request', logData);
        }
        else {
            logger.debug('Request completed', logData);
        }
    });
    next();
}
//# sourceMappingURL=requestLogger.js.map