import { createClient } from '@supabase/supabase-js';

// Supabase project config from backend / environment
export const SUPABASE_URL = 'https://jjtwmoalwodlrioeocyh.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqdHdtb2Fsd29kbHJpb2VvY3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MzI2ODgsImV4cCI6MjEwNTQwODY4OH0.15DyGo7WYx7Z9FaZZWMv1VjOeLO46ZeBuoUJf50Oojw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
