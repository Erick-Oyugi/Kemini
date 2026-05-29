
import axios from 'axios';
import type { Request, Response } from 'express';

interface STKPushPayload {
  environment: 'sandbox' | 'production';
  shortCode: string;
  callbackUrl: string;
  phoneNumber: string;
}

/**
 * Generates Safaricom Daraja compatible timestamp (YYYYMMDDHHmmss)
 */
const getDarajaTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Handles the compilation pipeline and executes the STK push vector
 */
export const handleSTKPushIntegration = async (req: Request, res: Response): Promise<void> => {
  const telemetryTimeline: string[] = [];
  
  try {
    const { 
      environment, 
      shortCode, 
      callbackUrl, 
      phoneNumber 
    } = req.body as STKPushPayload;

    console.log(`Incoming Request : ${req.body}`)

    // Fallback passkey for Sandbox testing if not appended, or use a placeholder secure key
    const passKey = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

    // 1. Determine Endpoint Environments
    const baseUrl = environment === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';

    telemetryTimeline.push("Initiating token credential resolution via Daraja...");

    console.log(`Selected Environment URL : ${baseUrl}`)

    // 2. Fetch OAuth Token from Safaricom API Gateway
    let oauthToken = '';
    try {

      const consumerKey = process.env.MPESA_CONSUMER_KEY || ''
      const consumerSecret = process.env.MPESA_CONSUMER_SECRET_KEY || ''
     // const authHeader = base64AuthString.startsWith('Basic ') ? base64AuthString : `Basic ${base64AuthString}`;
      const authCredentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
      const tokenResponse = await axios.get(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${authCredentials}` }
      });
      
      oauthToken = tokenResponse.data.access_token;
      telemetryTimeline.push("OAuth Identity Check: VERIFIED");
    } catch (tokenError: any) {
      telemetryTimeline.push("OAuth Identity Check: FAILED (Invalid key pair exchange)");
      res.status(401).json({
        success: false,
        telemetry: telemetryTimeline,
        error: "Authentication handshake rejected by Safaricom node."
      });
      return;
    }

    // 3. Build Cryptographic Passwords
    telemetryTimeline.push("Validating loop channel parameters...");
    const timestamp = getDarajaTimestamp();
    const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');

    // Clean phone numbers to standard country layout formatting (254...)
    let formattedPhone = phoneNumber.trim().replace('/+/g', '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `254${formattedPhone.substring(1)}`;
    }

    const stkRequestPayload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: "1", // Hardcoded safely to 1 KES for integration telemetry runs
      PartyA: formattedPhone,
      PartyB: shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: "ConsoleTestRun",
      TransactionDesc: "Daraja Telemetry Engine STK"
    };

    // 4. Trigger the Express Pipeline Request 
    telemetryTimeline.push("Registering secure loop webhook hooks...");
    
    const stkResponse = await axios.post(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`, 
      stkRequestPayload,
      { headers: { Authorization: `Bearer ${oauthToken}` } }
    );

    telemetryTimeline.push("Network pipeline mounted successfully.");

    // 5. Build Comprehensive Structural Telemetry Payload
    res.status(200).json({
      success: true,
      timestamp: new Date().toLocaleTimeString(),
      authHandshake: 'success',
      webhookRegistration: 'success',
      payoutStatus: 'skipped', // Skipped because STK is strictly an inbound pull collections channel
      darajaRaw: stkResponse.data,
      telemetryTimeline
    });

  } catch (error: any) {
    telemetryTimeline.push("Pipeline Compilation Execution: CRITICAL_FAILURE");
    res.status(500).json({
      success: false,
      telemetryTimeline,
      error: error.response?.data || error.message || "Internal Mesh routing anomalies discovered."
    });
  }
};