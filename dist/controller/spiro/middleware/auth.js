import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'spiro_super_secret_key_2026';
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"
    if (!token) {
        res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        return;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
};
//# sourceMappingURL=auth.js.map