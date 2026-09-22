import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// 1. GET /api/notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Group by Today vs Earlier
    const now = new Date();
    const today = [];
    const earlier = [];

    (data || []).forEach(item => {
      const itemDate = new Date(item.created_at);
      const isToday = itemDate.toDateString() === now.toDateString();
      if (isToday) today.push(item);
      else earlier.push(item);
    });

    const unreadCount = (data || []).filter(n => !n.is_read).length;

    res.json({
      success: true,
      unreadCount,
      today,
      earlier,
      all: data || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// 2. PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', req.user.id);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// 3. PATCH /api/notifications/read-all
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id);

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

export default router;
