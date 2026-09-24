import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper: Normalize Bangladesh phone
const normalizePhone = (phone) => {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('880')) clean = clean.substring(2);
  if (!clean.startsWith('0')) clean = '0' + clean;
  return clean;
};

// 1. GET /api/wallet (Full wallet overview)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data: wallet } = await supabaseAdmin
      .from('wallet')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    const { data: transactions } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    const { data: addMoneyRequests } = await supabaseAdmin
      .from('add_money_requests')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    res.json({
      success: true,
      balance: Number(wallet?.balance || 0),
      transactions: transactions || [],
      addMoneyRequests: addMoneyRequests || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve wallet details' });
  }
});

// 2. GET /api/wallet/balance
router.get('/balance', requireAuth, async (req, res) => {
  try {
    const { data: wallet } = await supabaseAdmin
      .from('wallet')
      .select('balance')
      .eq('user_id', req.user.id)
      .single();

    res.json({
      success: true,
      balance: Number(wallet?.balance || 0)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get wallet balance' });
  }
});

// 3. GET /api/wallet/transactions
router.get('/transactions', requireAuth, async (req, res) => {
  try {
    const { data: transactions } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    res.json({
      success: true,
      transactions: transactions || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// 4. GET /api/wallet/payment-methods (bKash & Nagad information)
router.get('/payment-methods', async (req, res) => {
  try {
    const { data: settings } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .in('key', ['bkash_number', 'nagad_number']);

    const bkashSetting = (settings || []).find(s => s.key === 'bkash_number');
    const nagadSetting = (settings || []).find(s => s.key === 'nagad_number');

    res.json({
      success: true,
      methods: [
        {
          id: 'bkash',
          name: 'bKash Online / Send Money',
          displayName: 'বিকাশ (bKash)',
          number: typeof bkashSetting?.value === 'string' ? bkashSetting.value.replace(/"/g, '') : '01711002233',
          type: 'Personal / Merchant',
          fee: '0%',
          instruction: 'বিকাশ অ্যাপ থেকে Send Money বা Payment করুন এবং প্রেরক নম্বর ও TrxID নিচে দিন।'
        },
        {
          id: 'nagad',
          name: 'Nagad Direct / Send Money',
          displayName: 'নগদ (Nagad)',
          number: typeof nagadSetting?.value === 'string' ? nagadSetting.value.replace(/"/g, '') : '01822003344',
          type: 'Personal / Merchant',
          fee: '0%',
          instruction: 'নগদ অ্যাপ থেকে Send Money বা Payment সম্পন্ন করে TrxID নিচে সাবমিট করুন।'
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load payment methods' });
  }
});

// 5. POST /api/wallet/add-money (Submit Add Money Request with TrxID)
router.post('/add-money', requireAuth, async (req, res) => {
  try {
    const { amount, payment_method, sender_number, transaction_id } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount < 10) {
      return res.status(400).json({ error: 'সর্বনিম্ন ১০ টাকা রিচার্জ বা অ্যাড মানি করতে হবে।' });
    }

    if (!payment_method || !['bkash', 'nagad'].includes(payment_method.toLowerCase())) {
      return res.status(400).json({ error: 'পেমেন্ট মাধ্যম হিসেবে bKash অথবা Nagad নির্বাচন করুন।' });
    }

    const cleanSender = normalizePhone(sender_number);
    if (!cleanSender || cleanSender.length !== 11) {
      return res.status(400).json({ error: 'প্রেরকের সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।' });
    }

    const cleanTrx = transaction_id ? transaction_id.trim().toUpperCase() : '';
    if (!cleanTrx || cleanTrx.length < 6) {
      return res.status(400).json({ error: 'সঠিক ট্রানজেকশন আইডি (TrxID) প্রদান করুন।' });
    }

    // Check duplicate pending or approved TrxID
    const { data: existingTrx } = await supabaseAdmin
      .from('add_money_requests')
      .select('id, status')
      .eq('transaction_id', cleanTrx)
      .in('status', ['pending', 'approved'])
      .maybeSingle();

    if (existingTrx) {
      return res.status(400).json({
        error: 'এই ট্রানজেকশন আইডি (TrxID) ইতিপূর্বে ব্যবহার করা হয়েছে বা প্রক্রিয়াধীন রয়েছে।'
      });
    }

    const requestId = `AM-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    const { data: newRequest, error: insertErr } = await supabaseAdmin
      .from('add_money_requests')
      .insert({
        id: requestId,
        user_id: req.user.id,
        amount: numAmount,
        payment_method: payment_method.toLowerCase(),
        sender_number: cleanSender,
        transaction_id: cleanTrx,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (insertErr) {
      return res.status(500).json({ error: insertErr.message || 'Add money request submission failed' });
    }

    // Insert pending user notification
    await supabaseAdmin.from('notifications').insert({
      user_id: req.user.id,
      title: 'অ্যাড মানি রিকোয়েস্ট জমা হয়েছে ⏳',
      body: `৳${numAmount} টাকার ${payment_method.toUpperCase()} রিকোয়েস্ট (TrxID: ${cleanTrx}) সফলভাবে জমা হয়েছে। যাচাই শেষে ব্যালেন্স যুক্ত হবে।`,
      type: 'wallet'
    });

    res.status(201).json({
      success: true,
      message: 'আপনার Add Money রিকোয়েস্ট সফলভাবে জমা হয়েছে। ভেরিফিকেশনের পর ব্যালেন্সে টাকা যুক্ত হবে।',
      request: newRequest
    });
  } catch (err) {
    console.error('[Add Money Error]:', err);
    res.status(500).json({ error: 'Add money request processing failed' });
  }
});

// 6. GET /api/wallet/add-money-requests (User's requests)
router.get('/add-money-requests', requireAuth, async (req, res) => {
  try {
    const { data: requests, error } = await supabaseAdmin
      .from('add_money_requests')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json({
      success: true,
      requests: requests || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch add money requests' });
  }
});

export default router;
