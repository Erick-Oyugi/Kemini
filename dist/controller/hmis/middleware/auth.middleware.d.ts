import type { UserRole } from '../config/user.js';
import type { NextFunction, Response } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        userId: string;
        role: UserRole;
        fullName: string;
    };
}
export declare const authenticateJWT: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authorizeRoles: (...allowedRoles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map