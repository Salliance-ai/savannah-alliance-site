const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { auditLogger } = require('./auditLogger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they're still active
    const user = await User.findById(decoded.user.id).populate('clinicId');
    
    if (!user || !user.isActive) {
      auditLogger.logAuthorization({
        userId: decoded.user.id,
        success: false,
        reason: 'user_inactive',
        endpoint: req.originalUrl,
        ip: req.ip
      });
      return res.status(401).json({ error: 'Access denied. User inactive.' });
    }

    // Check if user is locked
    if (user.isLocked) {
      auditLogger.logAuthorization({
        userId: user._id,
        success: false,
        reason: 'user_locked',
        endpoint: req.originalUrl,
        ip: req.ip
      });
      return res.status(423).json({ error: 'Account is temporarily locked.' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId._id,
      permissions: user.permissions
    };

    auditLogger.logAuthorization({
      userId: user._id,
      success: true,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip
    });

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    logger.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
};

module.exports = auth;