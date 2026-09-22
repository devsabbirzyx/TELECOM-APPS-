import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// 1. GET /api/profile
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const { data: wallet } = await supabaseAdmin
      .from('wallet')
      .select('balance')
      .eq('user_id', req.user.id)
      .single();

    res.json({
      success: true,
      profile: profile || {},
      walletBalance: Number(wallet?.balance || 0)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// 2. PATCH & PUT /api/profile
router.all('/', requireAuth, async (req, res) => {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { full_name, avatar_url, language_pref } = req.body;
    const updates = {};

    if (full_name !== undefined) updates.full_name = full_name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (language_pref !== undefined) updates.language_pref = language_pref;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, profile: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 3. POST /api/profile/push-token (Register Expo push token)
router.post('/push-token', requireAuth, async (req, res) => {
  try {
    const { push_token } = req.body;
    if (!push_token) return res.status(400).json({ error: 'push_token is required' });

    await supabaseAdmin
      .from('profiles')
      .update({ expo_push_token: push_token, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    res.json({ success: true, message: 'Push token registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save push token' });
  }
});

export default router;
