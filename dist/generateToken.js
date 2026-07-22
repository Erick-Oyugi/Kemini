// generateToken.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'spiro_super_secret_key_2026';
// Define the payload for your user
const userPayload = {
    userId: 'usr_spiro_882094',
    phoneNumber: '+254712345678',
    role: 'rider',
};
// Sign token with a 30-day expiration
const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });
console.log('\n================ SPIRO AUTH TOKEN ================');
console.log(token);
console.log('==================================================\n');
//# sourceMappingURL=generateToken.js.map