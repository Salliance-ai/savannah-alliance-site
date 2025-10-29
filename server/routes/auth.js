const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * @route POST /api/auth/login
 * @desc Demo login endpoint
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For demo purposes, accept any credentials
    const user = {
      id: 'demo-user-123',
      name: 'Dr. Sarah Chen',
      email: email || 'demo@eime.ai',
      role: 'admin'
    };
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 * @access Private
 */
router.get('/me', (req, res) => {
  // Return demo user info
  res.json({
    success: true,
    user: {
      id: 'demo-user-123',
      name: 'Dr. Sarah Chen',
      email: 'demo@eime.ai',
      role: 'admin'
    }
  });
});

module.exports = router;