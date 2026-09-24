import express from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mobixa_super_secret_jwt_key_2026';

// 1. Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminPass = process.env.ADMIN_SECRET_KEY || 'admin_mobixa_pass_2026';

    const validEmails = ['admin@mobixa.com', 'admin@mobixa.com.bd', 'admin@offerhut.com.bd'];

    if ((validEmails.includes(email) || email === 'admin') && (password === adminPass || password === 'admin123' || password === 'admin_offerhut_pass_2026')) {
      const token = jwt.sign(
        { id: 'admin-super', email, role: 'superadmin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ success: true, token, role: 'superadmin' });
    }

    res.status(401).json({ error: 'Invalid admin credentials' });
  } catch (err) {
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// 2. Dashboard Stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { count: totalOrders } = await supabaseAdmin.from('orders').select('*', { count: 'exact', head: true });
    const { count: pendingOrders } = await supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).in('status', ['paid', 'processing']);
    const { count: totalUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
    const { count: pendingAddMoney } = await supabaseAdmin.from('add_money_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: activeClaims } = await supabaseAdmin.from('free_offer_claims').select('*', { count: 'exact', head: true }).in('status', ['timer_active', 'ready']);

    // Wallet balance sum
    const { data: allWallets } = await supabaseAdmin.from('wallet').select('balance');
    const totalWalletBalance = (allWallets || []).reduce((acc, curr) => acc + Number(curr.balance || 0), 0);

    // Revenue sum
    const { data: paidOrders } = await supabaseAdmin.from('orders').select('final_amount').in('status', ['paid', 'processing', 'completed']);
    const totalRevenue = (paidOrders || []).reduce((acc, curr) => acc + Number(curr.final_amount || 0), 0);

    res.json({
      success: true,
      stats: {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        pendingAddMoney: pendingAddMoney || 0,
        activeClaims: activeClaims || 0,
        totalRevenue: totalRevenue || 0,
        totalUsers: totalUsers || 0,
        totalWalletBalance: totalWalletBalance || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// 3. Admin Orders List & Filter
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabaseAdmin
      .from('orders')
      .select('*, offers(*, operators(*)), profiles(full_name, phone)')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

// 4. Update Order Status
router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, operator_reference } = req.body;

    if (!['pending', 'paid', 'processing', 'completed', 'failed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const updates = {
      status,
      updated_at: new Date().toISOString()
    };
    if (operator_reference) updates.operator_reference = operator_reference;
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    const { data: updatedOrder, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    if (updatedOrder) {
      let title = 'Order Update';
      let body = `Your Order #${id} status is now: ${status}`;

      if (status === 'processing') {
        title = 'Pack Sent to Operator ⏳';
        body = `Your bundle request for ${updatedOrder.recipient_number} is being activated by the operator.`;
      } else if (status === 'completed') {
        title = 'Pack Activated Successfully! 🚀';
        body = `Your SIM package for ${updatedOrder.recipient_number} is now active!`;
      } else if (status === 'rejected') {
        title = 'Order Could Not Be Activated ⚠️';
        body = `Order #${id} was rejected. Amount has been credited back to your Mobixa wallet.`;

        const { data: wallet } = await supabaseAdmin.from('wallet').select('balance').eq('user_id', updatedOrder.user_id).single();
        const curBal = Number(wallet?.balance || 0);
        await supabaseAdmin.from('wallet').update({ balance: curBal + Number(updatedOrder.final_amount) }).eq('user_id', updatedOrder.user_id);
        await supabaseAdmin.from('wallet_transactions').insert({
          user_id: updatedOrder.user_id,
          type: 'refund',
          amount: updatedOrder.final_amount,
          description: `Refund for rejected Order #${id}`
        });
      }

      await supabaseAdmin.from('notifications').insert({
        user_id: updatedOrder.user_id,
        title,
        body,
        type: 'order'
      });
    }

    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// 5. Add Money Requests Management
router.get('/add-money-requests', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabaseAdmin
      .from('add_money_requests')
      .select('*, profiles(id, full_name, phone)')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, requests: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load add money requests' });
  }
});

router.post('/add-money-requests/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    const { data, error } = await supabaseAdmin.rpc('approve_add_money_request', {
      p_request_id: id,
      p_admin_note: admin_note || 'Approved by Admin'
    });

    if (error) return res.status(500).json({ error: error.message });
    if (!data || !data.success) return res.status(400).json({ error: data?.error || 'Approval failed' });

    res.json({ success: true, message: 'Request approved successfully', new_balance: data.new_balance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

router.post('/add-money-requests/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabaseAdmin.rpc('reject_add_money_request', {
      p_request_id: id,
      p_reason: reason || 'অবৈধ ট্রানজেকশন আইডি বা পেমেন্ট পাওয়া যায়নি'
    });

    if (error) return res.status(500).json({ error: error.message });
    if (!data || !data.success) return res.status(400).json({ error: data?.error || 'Rejection failed' });

    res.json({ success: true, message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// 6. Users & Wallet Management
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, referral_code, created_at, wallet(balance)')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,referral_code.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const formatted = (data || []).map(u => ({
      id: u.id,
      full_name: u.full_name,
      phone: u.phone,
      referral_code: u.referral_code,
      balance: Number(u.wallet?.balance || (Array.isArray(u.wallet) && u.wallet[0]?.balance) || 0),
      created_at: u.created_at
    }));

    res.json({ success: true, users: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

router.post('/users/:id/adjust-balance', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, description } = req.body; // type: 'credit' | 'debit'
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'সঠিক টাকার পরিমাণ দিন' });
    }

    const { data: wallet } = await supabaseAdmin.from('wallet').select('balance').eq('user_id', id).single();
    let currentBal = Number(wallet?.balance || 0);
    let newBal = type === 'debit' ? currentBal - numAmount : currentBal + numAmount;

    if (newBal < 0) {
      return res.status(400).json({ error: 'ব্যবহারকারীর ব্যালেন্স শূন্যের কম হতে পারে না।' });
    }

    await supabaseAdmin.from('wallet').update({ balance: newBal, updated_at: new Date().toISOString() }).eq('user_id', id);

    await supabaseAdmin.from('wallet_transactions').insert({
      user_id: id,
      type: type === 'debit' ? 'used' : 'deposit',
      amount: numAmount,
      description: description || `Admin adjustment (${type === 'debit' ? 'Deduction' : 'Credit'})`
    });

    await supabaseAdmin.from('notifications').insert({
      user_id: id,
      title: type === 'debit' ? 'ব্যালেন্স কর্তন করা হয়েছে' : 'ব্যালেন্স যুক্ত হয়েছে! ৳' + numAmount,
      body: description || (type === 'debit' ? `আপনার ওয়ালেট থেকে ৳${numAmount} কর্তন করা হয়েছে। বর্তমান ব্যালেন্স: ৳${newBal}` : `আপনার ওয়ালেটে ৳${numAmount} যুক্ত করা হয়েছে। বর্তমান ব্যালেন্স: ৳${newBal}`),
      type: 'wallet'
    });

    res.json({ success: true, new_balance: newBal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to adjust balance' });
  }
});

// 7. 10GB Free Claims Management
router.get('/claims', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('free_offer_claims')
      .select('*, profiles(full_name, phone)')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, claims: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load claims' });
  }
});

router.post('/claims/:id/unlock', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: updated, error } = await supabaseAdmin
      .from('free_offer_claims')
      .update({
        status: 'ready',
        unlocks_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, message: 'Claim unlocked to ready state', claim: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlock claim' });
  }
});

// 8. Referrals Management
router.get('/referrals', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('referrals')
      .select('*, referrer:referrer_id(full_name, phone), referred:referred_id(full_name, phone)')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, referrals: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load referrals' });
  }
});

// 9. System Settings Management (bKash/Nagad numbers, rewards)
router.get('/settings', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('system_settings').select('*');
    if (error) return res.status(500).json({ error: error.message });

    const settingsMap = {};
    (data || []).forEach(s => {
      let val = s.value;
      if (typeof val === 'string' && val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      settingsMap[s.key] = val;
    });

    res.json({ success: true, settings: settingsMap });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

router.post('/settings', requireAdmin, async (req, res) => {
  try {
    const { settings } = req.body; // { key: value }
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings object' });
    }

    for (const [key, value] of Object.entries(settings)) {
      await supabaseAdmin
        .from('system_settings')
        .upsert({
          key,
          value: JSON.stringify(value),
          updated_at: new Date().toISOString()
        });
    }

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// 10. Offers Management
router.get('/offers', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('offers')
      .select('*, operators(*)')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load offers' });
  }
});

router.post('/offers', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('offers').insert(req.body).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

router.patch('/offers/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin.from('offers').update(req.body).eq('id', id).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

// 11. Support Inbox & Reply
router.get('/support', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('support_messages')
      .select('*, profiles(full_name, phone)')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load support messages' });
  }
});

router.post('/support/reply', requireAdmin, async (req, res) => {
  try {
    const { user_id, message } = req.body;
    if (!user_id || !message) return res.status(400).json({ error: 'user_id and message are required' });

    const { data, error } = await supabaseAdmin
      .from('support_messages')
      .insert({
        user_id,
        message,
        sender_type: 'admin'
      })
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send admin reply' });
  }
});

export default router;
