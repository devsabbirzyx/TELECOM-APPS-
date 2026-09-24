import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/referrals
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('referral_code')
      .eq('id', req.user.id)
      .single();

    const { data: referrals } = await supabaseAdmin
      .from('referrals')
      .select('*, referred:referred_id(id, full_name, phone_number)')
      .eq('referrer_id', req.user.id)
      .order('created_at', { ascending: false });

    const totalEarned = (referrals || []).reduce((acc, curr) => acc + Number(curr.bonus_amount || 0), 0);
    const totalCount = (referrals || []).length;

    const referredUsers = (referrals || []).map(r => ({
      id: r.id,
      name: r.referred?.full_name || 'Friend',
      phone_number: r.referred?.phone_number ? r.referred.phone_number.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '017****0000',
      date: new Date(r.created_at).toISOString().split('T')[0],
      status: r.status || 'Completed',
      reward: Number(r.bonus_amount || 25),
    }));

    res.json({
      success: true,
      referral_code: profile?.referral_code || '',
      referralCode: profile?.referral_code || '',
      total_earned: totalEarned,
      totalEarnedBonus: totalEarned,
      total_referrals: totalCount,
      totalReferrals: totalCount,
      reward_per_referral: 25,
      referred_users: referredUsers,
      referralHistory: referrals || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve referral data' });
  }
});

export default router;
