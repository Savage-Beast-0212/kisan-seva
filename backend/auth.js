const jwt = require('jsonwebtoken');
const SECRET = 'replace-this-with-a-long-random-string'; // must match index.js exactly

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1]; // expects "Bearer <token>"
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // attaches { userId, role } to the request
    next(); // token is valid, let the request continue
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied for your role' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };