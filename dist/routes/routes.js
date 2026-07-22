import express from 'express';
import { autoIntegrateMpesaWorkspace } from '../controller/mpesa/mpesaworkspace.js';
import { handleSTKPushIntegration } from '../controller/mpesa/stkpush.js';
import { googleAuthentication } from '../controller/authentication/google.js';
import { verifyPinLogin } from '../controller/spiro/authentication/auth.js';
import { pinLoginLimiter } from '../controller/spiro/middleware/ratelimit.js';
import { authenticateToken } from '../controller/spiro/middleware/auth.js';
import { getDashboardEnergyData } from '../controller/spiro/dashboard/dashboardController.js';
import { initiateMpesaStkPush } from '../controller/spiro/payments/payments.js';
import { getSwapStations } from '../controller/spiro/stations/stationController.js';
export const routes = express();
// routes.post('/mpesa', autoIntegrateMpesaWorkspace)
routes.post('/api/v1/integration/stk-push', handleSTKPushIntegration);
routes.post('/api/v1/auth/google', googleAuthentication);
routes.post('/api/v1/auth/spiro', pinLoginLimiter, verifyPinLogin);
routes.get('/api/v1/dashboard/spiro', authenticateToken, getDashboardEnergyData);
routes.post('/api/v1/stk-push/spiro', authenticateToken, initiateMpesaStkPush);
routes.get('/api/v1/stations/spiro', authenticateToken, getSwapStations);
//# sourceMappingURL=routes.js.map