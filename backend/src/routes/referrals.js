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
      .select('*')
      .eq('referrer_id', req.user.id);

    const totalEarned = (referrals || []).reduce((acc, curr) => acc + Number(curr.bonus_amount || 0), 0);

    res.json({
      success: true,
      referralCode: profile?.referral_code || 'OHREFR',
      shareUrl: `https://offerhut.com.bd/join?ref=${profile?.referral_code || 'OHREFR'}`,
      totalReferrals: (referrals || []).length,
      totalEarnedBonus: totalEarned,
      referralHistory: referrals || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve referral data' });
  }
});

export default router;
