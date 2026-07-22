export type UserRole = 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'CLAIMS_ADMIN' | 'SUPER_ADMIN';
export interface User {
    id: string;
    accountName: string;
    userId: string;
    passwordHash: string;
    role: UserRole;
    fullName: string;
}
export declare const mockUsers: User[];
//# sourceMappingURL=user.d.ts.map