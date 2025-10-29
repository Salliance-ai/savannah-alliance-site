const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // For demo purposes, we'll skip actual authentication
  // In production, implement proper JWT verification
  
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    // For demo, create a mock user
    req.user = {
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@eime.ai',
      role: 'admin'
    };
    return next();
  }

  try {
    // In production, verify the actual JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
    req.user = decoded;
    next();
  } catch (error) {
    // For demo, still allow access with mock user
    req.user = {
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@eime.ai',
      role: 'admin'
    };
    next();
  }
};

module.exports = auth;