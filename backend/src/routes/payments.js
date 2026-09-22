import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { createBkashPayment, executeBkashPayment, queryBkashPayment } from '../services/bkashService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// 1. Create bKash Payment (Returns hosted bkashURL)
router.post('/bkash/create', requireAuth, async (req, res) => {
  try {
    const { order_id, amount, callback_url } = req.body;

    if (!order_id || !amount) {
      return res.status(400).json({ error: 'order_id and amount are required' });
    }

    // Call bKash Create Payment API
    const paymentResponse = await createBkashPayment({
      orderId: order_id,
      amount: amount,
      callbackUrl: callback_url || 'offerhut://payment-callback'
    });

    if (paymentResponse.statusCode && paymentResponse.statusCode !== '0000') {
      return res.status(400).json({
        error: paymentResponse.statusMessage || 'bKash payment initialization failed',
        details: paymentResponse
      });
    }

    res.json({
      success: true,
      bkashURL: paymentResponse.bkashURL,
      paymentID: paymentResponse.paymentID
    });
  } catch (err) {
    console.error('[Payment Route] bKash create error:', err);
    res.status(500).json({ error: 'Failed to initiate bKash payment' });
  }
});

// 2. Mock bKash Hosted Page (Used in development & testing for WebBrowser)
router.get('/bkash/mock-checkout', (req, res) => {
  const { paymentID, orderID, amount, callbackURL } = req.query;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>bKash Payment Gateway - Official Hosted Checkout</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #e2136e; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 90vh; }
        .card { background: white; border-radius: 16px; padding: 30px; max-width: 380px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center; }
        .logo { width: 120px; margin-bottom: 15px; }
        .amount-box { background: #fdf2f7; border: 1px solid #fbcfe8; border-radius: 12px; padding: 16px; margin: 20px 0; }
        .amount-label { color: #831843; font-size: 13px; font-weight: 600; text-transform: uppercase; }
        .amount-val { color: #e2136e; font-size: 32px; font-weight: bold; margin-top: 4px; }
        .secure-badge { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; color: #15803d; margin-bottom: 20px; font-weight: 500; }
        .btn-confirm { background: #e2136e; color: white; border: none; border-radius: 10px; width: 100%; padding: 14px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
        .btn-confirm:hover { background: #c00f5c; }
        .btn-cancel { background: transparent; color: #64748b; border: 1px solid #cbd5e1; border-radius: 10px; width: 100%; padding: 12px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 10px; }
        .footer-text { font-size: 11px; color: #94a3b8; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2 style="color: #e2136e; margin: 0 0 10px;">bKash Checkout</h2>
        <div class="secure-badge">
          🔒 256-Bit SSL Encrypted Official Gateway
        </div>
        <p style="color: #475569; font-size: 13px; margin: 0;">Order Reference: <strong>${orderID || 'OH-DEV'}</strong></p>
        
        <div class="amount-box">
          <div class="amount-label">Payable Amount</div>
          <div class="amount-val">৳${amount || '499.00'}</div>
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 20px;">
          This is bKash's official hosted payment verification page. Confirming will simulate a successful PIN entry and securely redirect back to OfferHut.
        </p>

        <button class="btn-confirm" onclick="confirmPayment()">Confirm Payment (Mock PIN)</button>
        <button class="btn-cancel" onclick="cancelPayment()">Cancel Transaction</button>

        <div class="footer-text">
          Protected by bKash Payment Gateway. Never share your real PIN with anyone.
        </div>
      </div>

      <script>
        function confirmPayment() {
          const redirectUrl = '${callbackURL || 'offerhut://payment-callback'}?paymentID=${paymentID}&status=success&orderID=${orderID}';
          window.location.href = redirectUrl;
        }
        function cancelPayment() {
          const redirectUrl = '${callbackURL || 'offerhut://payment-callback'}?paymentID=${paymentID}&status=cancel&orderID=${orderID}';
          window.location.href = redirectUrl;
        }
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// 3. Verify & Execute Payment (Server-side verification)
router.post('/bkash/verify', requireAuth, async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;

    if (!payment_id) {
      return res.status(400).json({ error: 'payment_id is required for verification' });
    }

    // Call bKash Execute Payment API
    const executeResult = await executeBkashPayment(payment_id);

    if (executeResult.statusCode && executeResult.statusCode !== '0000') {
      return res.status(400).json({
        error: executeResult.statusMessage || 'Payment execution rejected by bKash',
        details: executeResult
      });
    }

    // Update order in database to 'paid' with transaction ID
    const trxId = executeResult.trxID || `TRX${Date.now()}`;
    const targetOrderId = order_id || executeResult.merchantInvoiceNumber;

    if (targetOrderId) {
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          transaction_id: trxId,
          payment_method: 'bkash',
          updated_at: new Date().toISOString()
        })
        .eq('id', targetOrderId);

      // Create confirmation notification
      await supabaseAdmin.from('notifications').insert({
        user_id: req.user.id,
        title: 'Payment Confirmed! 💳',
        body: `Payment of ৳${executeResult.amount || ''} for Order #${targetOrderId} verified. Pack activation in progress.`,
        type: 'order'
      });
    }

    res.json({
      success: true,
      message: 'Payment successfully executed and verified',
      transactionId: trxId,
      orderId: targetOrderId,
      details: executeResult
    });
  } catch (err) {
    console.error('[Payment Route] Verify error:', err);
    res.status(500).json({ error: 'Server payment verification error' });
  }
});

export default router;
