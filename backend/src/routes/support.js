import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Fallback FAQs
const fallbackFaqs = [
  { id: '1', question: 'অফারহুট থেকে অফার কিনলে সিম প্যাক কতক্ষণে সক্রিয় হয়?', answer: 'সাধারণত পেমেন্ট সম্পন্ন হওয়ার ৩ থেকে ১৫ মিনিটের মধ্যে সংশ্লিষ্ট অপারেটর থেকে অফারটি সরাসরি আপনার সিম নম্বরে চালু হয়ে যায়।', category: 'General' },
  { id: '2', question: 'ড্রাইভ অফার (Drive Offer) কী এবং এতে ক্যাশব্যাক কীভাবে পাওয়া যায়?', answer: 'ড্রাইভ অফার হলো নির্দিষ্ট অপারেটরের বিশেষ ছাড়যুক্ত বান্ডেল অফার। অফার সফল হওয়ার সাথে সাথে ক্যাশব্যাক ওয়ালেটে জমা হয়।', category: 'Drive Offers' },
  { id: '3', question: 'পেমেন্ট কেটে নেওয়া হয়েছে কিন্তু অফার চালু না হলে কী করব?', answer: 'যদি ১৫ মিনিটের মধ্যে অফার চালু না হয়, তবে আমাদের লাইভ চ্যাটে অর্ডার আইডি দিন। আমাদের টিম দ্রুত যাচাই করে অ্যাক্টিভ বা রিফান্ড করবে।', category: 'Payment' }
];

// 1. GET /api/support/faqs (Public)
router.get('/faqs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: fallbackFaqs });
    }
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: true, data: fallbackFaqs });
  }
});

// 2. GET /api/support/messages (Authenticated user's live chat history)
router.get('/messages', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('support_messages')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// 3. POST /api/support/messages (Send user message)
router.post('/messages', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('support_messages')
      .insert({
        user_id: req.user.id,
        message: message.trim(),
        sender_type: 'user'
      })
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
