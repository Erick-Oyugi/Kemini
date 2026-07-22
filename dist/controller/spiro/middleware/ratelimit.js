import rateLimit from 'express-rate-limit';
export const pinLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute lockout window
    max: 5, // Allow max 5 failed attempts per IP
    message: {
        status: 429,
        message: 'Too many incorrect PIN attempts. Account locked for 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=ratelimit.js.map