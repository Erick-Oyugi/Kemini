import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';


// Express endpoint to initiate M-Pesa STK Push
export const initiateMpesaStkPush = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { amount, phoneNumber } = req.body;
    const userId = req.user?.userId;

    if (!amount || !phoneNumber) {
      res.status(400).json({ success: false, message: 'Amount and Phone Number are required' });
      return;
    }

    // Format phone number to international format (e.g. 254712345678)
    const formattedPhone = phoneNumber.replace('+', '').trim();
    const checkoutRequestId = `ws_CO_${Date.now()}`;

    // 1. Send request to Safaricom Daraja API / Flutterwave / Paystack
    console.log(`Initiating STK Push of KES ${amount} to ${formattedPhone} for User ${userId}`);

    // Mock successful STK Push Dispatch
    res.status(200).json({
      success: true,
      message: 'STK Push prompt sent to your phone. Enter M-Pesa PIN to complete.',
      checkoutRequestId,
    });
  } catch (error) {
    console.error('STK Push Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process payment request' });
  }
};

// Callback endpoint registered with Safaricom / Payment Gateway
export const handleMpesaCallback = async (req: any, res: Response): Promise<void> => {
  try {
    const { Body } = req.body;
    
    if (Body.stkCallback.ResultCode === 0) {
      // Payment Successful!
      const metadata = Body.stkCallback.CallbackMetadata.Item;
      const amountPaid = metadata.find((i: any) => i.Name === 'Amount')?.Value;
      const mpesaReceipt = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;

      console.log(`✅ Payment received! KES ${amountPaid}, Receipt: ${mpesaReceipt}`);
      // UPDATE User Wallet Balance in Database (e.g. UPDATE users SET balance = balance + amount)
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(200).json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
};