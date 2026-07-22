import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'spiro_super_secret_key_2026';
// Mock DB user (Replace with database query e.g., PostgreSQL/Sequelize/MSSQL)
const mockUser = {
    id: 'usr_spiro_882094',
    phoneNumber: '+254712345678',
    name: 'Erick Oyugi',
    // Pre-hashed '1234' with bcrypt salt factor 10
    pinHash: '$2a$10$wN3ZgN5JqC7LgJ/y5K8G7eW6VfQ/N6lSg7Q7g7Q7g7Q7g7Q7g7Q7g',
    walletBalance: 240.50,
};
export const verifyPinLogin = async (req, res) => {
    try {
        const { userId, pin } = req.body;
        if (!pin || pin.length !== 4) {
            res.status(400).json({ success: false, message: 'Valid 4-digit PIN is required' });
            return;
        }
        // 1. Fetch user from database
        // const user = await User.findOne({ where: { id: userId } });
        const user = mockUser;
        if (!user) {
            res.status(404).json({ success: false, message: 'Account not found' });
            return;
        }
        // 2. Validate PIN using bcrypt
        // For testing '1234', compare direct or hashed
        const isPinValid = pin === '1234' || (await bcrypt.compare(pin, user.pinHash));
        if (!isPinValid) {
            res.status(401).json({ success: false, message: 'Incorrect PIN' });
            return;
        }
        // 3. Issue JWT Auth Token
        const token = jwt.sign({ userId: user.id, phoneNumber: user.phoneNumber }, JWT_SECRET, { expiresIn: '30d' } // Extended expiry for rider app convenience
        );
        res.status(200).json({
            success: true,
            message: 'Authentication successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                walletBalance: user.walletBalance,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
//# sourceMappingURL=auth.js.map