import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/wallet
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

    res.json({
      success: true,
      balance: Number(wallet?.balance || 0),
      transactions: transactions || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve wallet details' });
  }
});

export default router;
