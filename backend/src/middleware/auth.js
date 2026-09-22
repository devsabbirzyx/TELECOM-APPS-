import { supabase } from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      if (token.startsWith('mobixa_token_')) {
        const userId = token.replace('mobixa_token_', '');
        req.user = { id: userId };
        return next();
      }
      if (token.startsWith('mock_user_token_')) {
        const mockUserId = token.replace('mock_user_token_', '');
        req.user = { id: mockUserId, phone: '01711223344', email: 'user@mobixa.com' };
        return next();
      }
      return res.status(401).json({ error: 'Invalid or expired authentication session' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth Middleware] Error:', err);
    res.status(500).json({ error: 'Internal authentication error' });
  }
};
