import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -pin');
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: 'Invalid or expired token' }); }
}
