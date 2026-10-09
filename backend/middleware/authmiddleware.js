import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!process.env.JWT_SECRET) return res.status(503).json({ message: 'Authentication is not configured on this server' });
  if (authorization && authorization.startsWith('Bearer ')) {
    try {
      const token = authorization.slice(7).trim();
      if (!token) return res.status(401).json({ message: 'No token provided' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};
