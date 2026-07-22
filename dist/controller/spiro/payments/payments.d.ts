import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
export declare const initiateMpesaStkPush: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const handleMpesaCallback: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=payments.d.ts.map