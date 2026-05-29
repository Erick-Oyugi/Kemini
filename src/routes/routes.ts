import express from 'express'
import { autoIntegrateMpesaWorkspace } from '../controller/mpesa/mpesaworkspace.js'
import { handleSTKPushIntegration } from '../controller/mpesa/stkpush.js'

export const routes = express()

// routes.post('/mpesa', autoIntegrateMpesaWorkspace)
routes.post('/api/v1/integration/stk-push', handleSTKPushIntegration)
