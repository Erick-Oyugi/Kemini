import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_hims_key_2026';
// 1. Verify token exists and is valid
export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: 'Invalid or Expired Security Token' });
    }
};
// 2. Authorize based on strict role privileges
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
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
//# sourceMappingURL=auth.middleware.js.map