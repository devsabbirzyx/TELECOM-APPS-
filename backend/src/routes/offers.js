import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Fallback seed offers
const fallbackOffers = [
  { id: '1', operator_id: 'gp', title: 'GP 50 GB Monthly Dhamaka', data_amount: '50 GB', minutes: 0, sms_count: 0, price: 499.00, regular_price: 599.00, validity_days: 30, is_active: true, is_drive_offer: false, discount_percent: 16, cashback_amount: 20.00, category: 'internet', badge_text: 'POPULAR' },
  { id: '2', operator_id: 'gp', title: 'GP 30 GB + 800 Mins Mega Combo', data_amount: '30 GB', minutes: 800, sms_count: 100, price: 649.00, regular_price: 799.00, validity_days: 30, is_active: true, is_drive_offer: true, discount_percent: 18, cashback_amount: 120.00, flash_sale_ends_at: new Date(Date.now() + 86400000).toISOString(), category: 'combo', badge_text: 'MEGA DRIVE' },
  { id: '3', operator_id: 'robi', title: 'Robi 40 GB + 900 Mins Hot Drive', data_amount: '40 GB', minutes: 900, sms_count: 200, price: 598.00, regular_price: 749.00, validity_days: 30, is_active: true, is_drive_offer: true, discount_percent: 20, cashback_amount: 150.00, flash_sale_ends_at: new Date(Date.now() + 64800000).toISOString(), category: 'combo', badge_text: 'HOT DRIVE' },
  { id: '4', operator_id: 'banglalink', title: 'Banglalink 45 GB + 750 Mins Power Pack', data_amount: '45 GB', minutes: 750, sms_count: 0, price: 549.00, regular_price: 699.00, validity_days: 30, is_active: true, is_drive_offer: true, discount_percent: 21, cashback_amount: 130.00, flash_sale_ends_at: new Date(Date.now() + 43200000).toISOString(), category: 'combo', badge_text: 'FLASH SALE' },
  { id: '5', operator_id: 'airtel', title: 'Airtel 55 GB + 850 Mins Super Drive', data_amount: '55 GB', minutes: 850, sms_count: 100, price: 568.00, regular_price: 698.00, validity_days: 30, is_active: true, is_drive_offer: true, discount_percent: 18, cashback_amount: 140.00, flash_sale_ends_at: new Date(Date.now() + 108000000).toISOString(), category: 'combo', badge_text: 'SUPER DRIVE' },
  { id: '6', operator_id: 'teletalk', title: 'Teletalk Bornomala 30 GB Pack', data_amount: '30 GB', minutes: 0, sms_count: 0, price: 290.00, regular_price: 350.00, validity_days: 30, is_active: true, is_drive_offer: false, discount_percent: 17, cashback_amount: 10.00, category: 'internet', badge_text: 'STUDENT' }
];

// 1. GET /api/offers (Filtered list)
router.get('/', async (req, res) => {
  try {
    const { operator_id, category, is_drive_offer, sort, search } = req.query;

    let query = supabase
      .from('offers')
      .select('*, operators(id, name, logo_url, color_hex)')
      .eq('is_active', true);

    if (operator_id) {
      query = query.eq('operator_id', operator_id);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (is_drive_offer !== undefined) {
      query = query.eq('is_drive_offer', is_drive_offer === 'true');
    }
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Sorting
    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (sort === 'cashback_desc') query = query.order('cashback_amount', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      let filtered = [...fallbackOffers];
      if (operator_id) filtered = filtered.filter(o => o.operator_id === operator_id);
      if (category && category !== 'all') filtered = filtered.filter(o => o.category === category);
      if (is_drive_offer !== undefined) filtered = filtered.filter(o => o.is_drive_offer === (is_drive_offer === 'true'));
      return res.json({ success: true, data: filtered });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: true, data: fallbackOffers });
  }
});

// 2. GET /api/offers/popular (Popular Home Grid)
router.get('/popular', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*, operators(id, name, logo_url, color_hex)')
      .eq('is_active', true)
      .limit(6);

    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: fallbackOffers.slice(0, 4) });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: true, data: fallbackOffers.slice(0, 4) });
  }
});

// 3. GET /api/offers/drive (Drive Offers with countdowns)
router.get('/drive', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*, operators(id, name, logo_url, color_hex)')
      .eq('is_active', true)
      .eq('is_drive_offer', true)
      .order('cashback_amount', { ascending: false });

    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: fallbackOffers.filter(o => o.is_drive_offer) });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: true, data: fallbackOffers.filter(o => o.is_drive_offer) });
  }
});

// 4. GET /api/offers/:id (Single offer details)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('offers')
      .select('*, operators(id, name, logo_url, color_hex, prefix_codes)')
      .eq('id', id)
      .single();

    if (error || !data) {
      const fallback = fallbackOffers.find(o => o.id === id) || fallbackOffers[0];
      return res.json({ success: true, data: fallback });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve offer details' });
  }
});

// 5. GET /api/offers/free-claim-status (Get 10GB free offer claim & countdown state)
router.get('/free-claim-status', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check user's claim record
    let { data: claim, error } = await supabaseAdmin
      .from('free_offer_claims')
      .select('*')
      .eq('user_id', userId)
      .eq('offer_key', '10gb_free')
      .maybeSingle();

    // If no record exists, create initial locked record
    if (!claim) {
      // Check if user has any paid/completed order
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .in('status', ['paid', 'processing', 'completed'])
        .limit(1)
        .maybeSingle();

      const initialStatus = order ? 'timer_active' : 'locked';
      const now = new Date();
      const unlocksAt = order ? new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString() : null;

      const { data: newClaim } = await supabaseAdmin
        .from('free_offer_claims')
        .insert({
          user_id: userId,
          offer_key: '10gb_free',
          status: initialStatus,
          required_order_id: order ? order.id : null,
          timer_started_at: order ? now.toISOString() : null,
          unlocks_at: unlocksAt,
        })
        .select('*')
        .single();

      claim = newClaim;
    }

    if (!claim) {
      return res.status(500).json({ error: 'Failed to retrieve claim status' });
    }

    // If timer_active, check if 12h elapsed
    let status = claim.status;
    let secondsRemaining = 0;

    if (status === 'timer_active' && claim.unlocks_at) {
      const unlockTime = new Date(claim.unlocks_at).getTime();
      const nowTime = Date.now();
      const diffSeconds = Math.floor((unlockTime - nowTime) / 1000);

      if (diffSeconds <= 0) {
        // Automatically transition to 'ready'
        status = 'ready';
        await supabaseAdmin
          .from('free_offer_claims')
          .update({ status: 'ready', updated_at: new Date().toISOString() })
          .eq('id', claim.id);
        claim.status = 'ready';
      } else {
        secondsRemaining = diffSeconds;
      }
    }

    res.json({
      success: true,
      claim: {
        id: claim.id,
        status: status,
        timer_started_at: claim.timer_started_at,
        unlocks_at: claim.unlocks_at,
        seconds_remaining: secondsRemaining,
        claimed_at: claim.claimed_at,
        can_claim: status === 'ready',
        required_pack_title: 'যেকোনো ইন্টারনেট বা ড্রাইভ প্যাক',
        offer_title: '10 GB Free Internet (All Operators)',
        description: '১২ ঘণ্টার ভেরিফিকেশন টাইমার সম্পন্ন হলে ১০ জিবি ফ্রি ইন্টারনেট সক্রিয় হবে।'
      }
    });
  } catch (err) {
    console.error('[Free Claim Status Error]:', err);
    res.status(500).json({ error: 'Failed to retrieve claim status' });
  }
});

// 6. POST /api/offers/start-free-claim (Trigger 12-hour timer after required purchase)
router.post('/start-free-claim', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id } = req.body;

    const { data: claim } = await supabaseAdmin
      .from('free_offer_claims')
      .select('*')
      .eq('user_id', userId)
      .eq('offer_key', '10gb_free')
      .maybeSingle();

    if (claim && (claim.status === 'timer_active' || claim.status === 'ready' || claim.status === 'claimed')) {
      // Prevent resetting running timer or duplicate claim!
      return res.json({
        success: true,
        message: 'টাইমার ইতিপূর্বে চালু করা হয়েছে।',
        claim
      });
    }

    // Verify order
    let targetOrderId = order_id;
    if (!targetOrderId) {
      const { data: latestOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .in('status', ['paid', 'processing', 'completed'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestOrder) {
        return res.status(400).json({
          error: '১০ জিবি ফ্রি ইন্টারনেট সক্রিয় করতে প্রথমে যেকোনো একটি অফার বা প্যাক কিনুন।'
        });
      }
      targetOrderId = latestOrder.id;
    }

    const now = new Date();
    const unlocksAt = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();

    const { data: updatedClaim, error } = await supabaseAdmin
      .from('free_offer_claims')
      .upsert({
        user_id: userId,
        offer_key: '10gb_free',
        status: 'timer_active',
        required_order_id: targetOrderId,
        timer_started_at: now.toISOString(),
        unlocks_at: unlocksAt,
        updated_at: now.toISOString()
      }, { onConflict: 'user_id, offer_key' })
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({
      success: true,
      message: '১২ ঘণ্টার কাউন্টডাউন শুরু হয়েছে!',
      claim: updatedClaim
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start free claim countdown' });
  }
});

// 7. POST /api/offers/claim-free-10gb (Final Claim after 12h countdown completes)
router.post('/claim-free-10gb', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipient_phone, operator_id } = req.body;

    const { data: claim, error } = await supabaseAdmin
      .from('free_offer_claims')
      .select('*')
      .eq('user_id', userId)
      .eq('offer_key', '10gb_free')
      .maybeSingle();

    if (error || !claim) {
      return res.status(400).json({ error: 'অফারটি খুঁজে পাওয়া যায়নি।' });
    }

    if (claim.status === 'claimed') {
      return res.status(400).json({ error: 'আপনি ইতিমধ্যে এই ১০ জিবি ফ্রি অফারটি ক্লেইম করেছেন।' });
    }

    // Verify time
    const nowTime = Date.now();
    const unlockTime = claim.unlocks_at ? new Date(claim.unlocks_at).getTime() : 0;

    if (claim.status !== 'ready' && nowTime < unlockTime) {
      const remainingMinutes = Math.ceil((unlockTime - nowTime) / (60 * 1000));
      return res.status(400).json({
        error: `১২ ঘণ্টার ভেরিফিকেশন এখনো সম্পন্ন হয়নি। বাকি সময়: ${Math.floor(remainingMinutes / 60)} ঘণ্টা ${remainingMinutes % 60} মিনিট।`
      });
    }

    // Mark as claimed
    const nowIso = new Date().toISOString();
    const { data: finalClaim, error: claimErr } = await supabaseAdmin
      .from('free_offer_claims')
      .update({
        status: 'claimed',
        claimed_at: nowIso,
        recipient_phone: recipient_phone || req.user.phone || null,
        operator_id: operator_id || null,
        updated_at: nowIso
      })
      .eq('id', claim.id)
      .select('*')
      .single();

    if (claimErr) return res.status(500).json({ error: claimErr.message });

    // Send congratulatory notification
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title: '১০ জিবি ফ্রি ইন্টারনেট সক্রিয়! 🎉',
      body: 'অভিনন্দন! আপনার ১০ জিবি ফ্রি ইন্টারনেট সফলভাবে ক্লেইম করা হয়েছে। এটি আপনার সিমে চালু হতে সর্বোচ্চ ১৫ মিনিট সময় লাগতে পারে।',
      type: 'offer'
    });

    res.json({
      success: true,
      message: '১০ জিবি ফ্রি ইন্টারনেট সফলভাবে ক্লেইম করা হয়েছে!',
      claim: finalClaim
    });
  } catch (err) {
    res.status(500).json({ error: 'Claim execution failed' });
  }
});

export default router;

