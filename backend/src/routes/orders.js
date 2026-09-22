import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { generateOrderReceiptPdf } from '../services/pdfService.js';

const router = express.Router();

// 1. Create New Order (Checkout)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { offer_id, recipient_number, payment_method, use_wallet_balance } = req.body;

    if (!offer_id || !recipient_number) {
      return res.status(400).json({ error: 'offer_id and recipient_number are required' });
    }

    // Clean recipient phone
    const cleanNumber = recipient_number.replace(/[^0-9]/g, '');
    if (cleanNumber.length !== 11) {
      return res.status(400).json({ error: 'Recipient phone must be an 11-digit Bangladeshi number' });
    }

    // Fetch offer details
    const { data: offer, error: offerError } = await supabaseAdmin
      .from('offers')
      .select('*, operators(*)')
      .eq('id', offer_id)
      .single();

    const price = Number(offer?.price || 499.00);
    let walletDeducted = 0;
    let finalAmount = price;

    // Check wallet balance if user opted to use wallet
    if (use_wallet_balance) {
      const { data: wallet } = await supabaseAdmin
        .from('wallet')
        .select('balance')
        .eq('user_id', req.user.id)
        .single();

      const currentBalance = Number(wallet?.balance || 0);
      if (currentBalance > 0) {
        walletDeducted = Math.min(currentBalance, price);
        finalAmount = price - walletDeducted;

        // Deduct from wallet
        await supabaseAdmin
          .from('wallet')
          .update({ balance: currentBalance - walletDeducted, updated_at: new Date().toISOString() })
          .eq('user_id', req.user.id);

        // Record transaction
        await supabaseAdmin.from('wallet_transactions').insert({
          user_id: req.user.id,
          type: 'used',
          amount: walletDeducted,
          description: `Used for offer purchase (${offer?.title || 'Offer Bundle'})`
        });
      }
    }

    // Generate Order ID: OH-XXXXXX
    const orderId = `OH-${Math.floor(100000 + Math.random() * 900000)}`;

    // If finalAmount is 0 (fully paid by wallet), mark as 'paid' immediately
    const initialStatus = finalAmount === 0 ? 'paid' : 'pending';

    const { data: newOrder, error: orderCreateError } = await supabaseAdmin
      .from('orders')
      .insert({
        id: orderId,
        user_id: req.user.id,
        offer_id: offer_id,
        recipient_number: cleanNumber,
        amount: price,
        discount_applied: Number(offer?.discount_percent ? (offer.regular_price - offer.price) : 0),
        wallet_used: walletDeducted,
        final_amount: finalAmount,
        status: initialStatus,
        payment_method: payment_method || (finalAmount === 0 ? 'wallet' : 'bkash')
      })
      .select('*, offers(*, operators(*))')
      .single();

    if (orderCreateError) {
      return res.status(500).json({ error: 'Failed to create order in database', details: orderCreateError });
    }

    res.status(201).json({
      success: true,
      order: newOrder || {
        id: orderId,
        amount: price,
        final_amount: finalAmount,
        status: initialStatus,
        recipient_number: cleanNumber
      }
    });
  } catch (err) {
    console.error('[Orders Route] Create order error:', err);
    res.status(500).json({ error: 'Order creation failed' });
  }
});

// 2. Get User Orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select('*, offers(*, operators(*))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }

    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// 3. Get Order Details & Live Status Stepper
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, offers(*, operators(*))')
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Build live status stepper data
    const stepper = [
      {
        step: 1,
        title: 'Payment Verified',
        description: order.status !== 'pending' && order.status !== 'failed' 
          ? `Verified via ${order.payment_method?.toUpperCase()} (${order.transaction_id || 'ID Verified'})`
          : 'Awaiting payment confirmation',
        completed: order.status === 'paid' || order.status === 'processing' || order.status === 'completed',
        timestamp: order.created_at
      },
      {
        step: 2,
        title: 'Sent to Operator',
        description: order.status === 'processing' || order.status === 'completed'
          ? `Request dispatched to ${order.offers?.operators?.name || 'Operator'} system`
          : 'Pending dispatch',
        completed: order.status === 'processing' || order.status === 'completed',
        timestamp: order.status === 'processing' || order.status === 'completed' ? order.updated_at : null
      },
      {
        step: 3,
        title: 'Pack Activated',
        description: order.status === 'completed'
          ? 'Pack is now active on SIM bundle'
          : 'Processing activation with carrier',
        completed: order.status === 'completed',
        timestamp: order.completed_at
      }
    ];

    res.json({
      success: true,
      order,
      stepper
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// 4. Download PDF Receipt
router.get('/:id/receipt', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, offers(*, operators(*))')
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=OfferHut_Receipt_${order.id}.pdf`);

    generateOrderReceiptPdf(order, res);
  } catch (err) {
    console.error('[Receipt Route] PDF Error:', err);
    res.status(500).json({ error: 'Failed to generate receipt PDF' });
  }
});

export default router;
