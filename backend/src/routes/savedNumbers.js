import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper: Auto-detect operator
const detectOperator = (phoneNumber) => {
  const clean = phoneNumber.replace(/[^0-9]/g, '');
  const prefix = clean.startsWith('880') ? clean.substring(2, 5) : clean.substring(0, 3);

  if (['017', '013'].includes(prefix)) return 'gp';
  if (['018'].includes(prefix)) return 'robi';
  if (['019', '014'].includes(prefix)) return 'banglalink';
  if (['016'].includes(prefix)) return 'airtel';
  if (['015'].includes(prefix)) return 'teletalk';
  return 'gp';
};

// 1. GET /api/saved-numbers
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('saved_numbers')
      .select('*, operators(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved numbers' });
  }
});

// 2. POST /api/saved-numbers
router.post('/', requireAuth, async (req, res) => {
  try {
    const { label, phone_number, operator_id } = req.body;

    if (!label || !phone_number) {
      return res.status(400).json({ error: 'Label and phone_number are required' });
    }

    const detectedOperator = operator_id || detectOperator(phone_number);

    const { data, error } = await supabaseAdmin
      .from('saved_numbers')
      .insert({
        user_id: req.user.id,
        label,
        phone_number,
        operator_id: detectedOperator
      })
      .select('*, operators(*)')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save number' });
  }
});

// 3. DELETE /api/saved-numbers/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('saved_numbers')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, message: 'Saved number deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete saved number' });
  }
});

export default router;
