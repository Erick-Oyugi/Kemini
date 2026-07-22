import bcrypt from 'bcryptjs';
// Pre-hashed variant of "Password123"
const MOCK_HASH = '$2a$10$X72K61kXFmB.x1dJ/b6e1eMv7XmP11h8CgqI92e3hR0l1m1o1p1q1';
export const mockUsers = [
    {
        id: 'usr_001',
        accountName: 'WeHealth Main Clinic',
        userId: 'dr_sterling',
        passwordHash: MOCK_HASH,
        role: 'DOCTOR',
        fullName: 'Dr. Alex @Esystems'
    },
    {
        id: 'usr_002',
        accountName: 'WeHealth Main Clinic',
        userId: 'nurse_amara',
        passwordHash: MOCK_HASH,
        role: 'NURSE',
        fullName: 'Nurse Amara @Esystems'
    },
    {
        id: 'usr_003',
        accountName: 'WeHealth Central Pharmacy',
        userId: 'ph_liam',
        passwordHash: MOCK_HASH,
        role: 'PHARMACIST',
        fullName: 'Pharmacist Liam @Esystems'
    },
    {
        id: 'usr_004',
        accountName: 'WeHealth Corporate Office',
        userId: 'admin_ethan',
        passwordHash: MOCK_HASH,
        role: 'CLAIMS_ADMIN',
        fullName: 'Ethan @Esystems (Claims Desk)'
    }
];
//# sourceMappingURL=user.js.map