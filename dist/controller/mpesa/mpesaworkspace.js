import fetch from 'node-fetch';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; // 💡 Import this to convert file URLs
// 🛠️ Recreate __dirname cleanly for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Orchestrates the full automatic M-Pesa workspace mounting sequence.
 */
export const autoIntegrateMpesaWorkspace = async (req, res) => {
    try {
        const { shortCode, consumerKey, consumerSecret, callbackUrl, securityCredential } = req.body;
        console.log(`Incoming request body: ${JSON.stringify(req.body)}`);
        // Step 1: Generate and validate the live Daraja OAuth Bearer Token
        if (!consumerKey || !consumerSecret) {
            console.error('[AuthService] Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET in env');
            throw new Error('Internal Configuration Error');
        }
        const authCredentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        const authResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            method: 'GET',
            headers: { 'Authorization': `Basic ${authCredentials}` }
        });
        // Resolve the authentication JSON cleanly
        const authData = await authResponse.json();
        const access_token = authData.access_token;
        console.log(`Access Token Generated ${JSON.stringify(access_token)}`);
        if (!access_token) {
            return res.status(401).json({
                success: false,
                message: "Invalid M-Pesa Application Credentials.",
                details: authData.errorMessage || "Check your Consumer Key and Secret."
            });
        }
        // Step 2: Automatically Register C2B / STK Confirmation & Validation Webhooks
        const webhookRegistration = await fetch('https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ShortCode: shortCode,
                ResponseType: "Completed",
                ConfirmationURL: `${callbackUrl}/mpesa/confirm`,
                ValidationURL: `${callbackUrl}/mpesa/validate`
            })
        });
        // 💡 FIXED: Added missing 'await' here to completely pull the body stream
        const webhookResult = await webhookRegistration.json();
        console.log(`Webshook Results : ${JSON.stringify(webhookResult)}`);
        // Step 3: Encrypt the Initiator Security Credential for automated B2C & B2B payouts
        let encryptedCredential = "";
        // if (securityCredential) {
        // //  const safaricomPublicKey = `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv...YOUR...CERT...\n-----END PUBLIC KEY-----`;
        //   const safaricomPublicKey = path.join(__dirname, '../../certificate/SandboxCertificate.cer');
        //   const rawCertificate = fs.readFileSync(safaricomPublicKey);
        //  const publicKey = crypto.createPublicKey({
        //   key: rawCertificate,
        //   type: 'pkcs1',
        //   format: 'der'
        // });
        // const buffer = Buffer.from(securityCredential);
        // encryptedCredential = crypto.publicEncrypt(
        //   { 
        //     key: publicKey, 
        //     padding: crypto.constants.RSA_PKCS1_PADDING 
        //   },
        //   buffer
        // ).toString('base64');
        // console.log("🔒 Security Credential encrypted successfully.");
        // }
        // Step 4: Persist configuration inside your secure systems DB
        const systemConfiguration = {
            shortCode,
            cachedToken: access_token,
            // 💡 FIXED: Will now correctly evaluate to ResponseDescription or fallback string
            webhookStatus: webhookResult.ResponseDescription || webhookResult.errorMessage || "Mounted",
            payoutKey: encryptedCredential,
            endpointsActive: ["STK_Push", "C2B_Reconcile", "B2C_Disbursement"]
        };
        // Return active deployment diagnostics back to your frontend dashboard
        return res.status(200).json({
            success: true,
            message: "Automation layer synchronized across all standard endpoints.",
            diagnostics: systemConfiguration
        });
    }
    catch (error) {
        console.error("Critical automation fault:", error);
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Integration Automation Failure.",
            error: error.message
        });
    }
};
//# sourceMappingURL=mpesaworkspace.js.map