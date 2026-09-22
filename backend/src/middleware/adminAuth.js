import jwt from 'jsonwebtoken';

export const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Admin authorization required' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'offerhut_super_secret_jwt_key_2026';

    try {
      const decoded = jwt.verify(token, secret);
      if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
        return res.status(403).json({ error: 'Access forbidden: Admin rights required' });
      }
      req.admin = decoded;
      next();
    } catch (jwtErr) {
      return res.status(401).json({ error: 'Invalid or expired admin session' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Admin verification error' });
  }
};
