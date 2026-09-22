import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Fallback seed operators for development/offline
const fallbackOperators = [
  { id: 'gp', name: 'Grameenphone', prefix_codes: ['017', '013'], color_hex: '#00236F', logo_url: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=128&auto=format&fit=crop&q=80', is_active: true },
  { id: 'robi', name: 'Robi', prefix_codes: ['018'], color_hex: '#E11927', logo_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=128&auto=format&fit=crop&q=80', is_active: true },
  { id: 'banglalink', name: 'Banglalink', prefix_codes: ['019', '014'], color_hex: '#FF6600', logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80', is_active: true },
  { id: 'airtel', name: 'Airtel', prefix_codes: ['016'], color_hex: '#EE1D23', logo_url: 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=128&auto=format&fit=crop&q=80', is_active: true },
  { id: 'teletalk', name: 'Teletalk', prefix_codes: ['015'], color_hex: '#008000', logo_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=128&auto=format&fit=crop&q=80', is_active: true },
  { id: 'skitto', name: 'Skitto', prefix_codes: ['017', '013'], color_hex: '#552B7D', logo_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=128&auto=format&fit=crop&q=80', is_active: true }
];

// GET /api/operators
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('is_active', true);

    if (error || !data || data.length === 0) {
      return res.json({ success: true, data: fallbackOperators });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: true, data: fallbackOperators });
  }
});

export default router;
