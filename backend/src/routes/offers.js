import express from 'express';
import { supabase } from '../config/supabase.js';

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

export default router;
