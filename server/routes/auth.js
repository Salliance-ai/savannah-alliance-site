const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const logger = require('../utils/logger');
const { auditLogger } = require('../middleware/auditLogger');

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Login endpoint
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email).populate('clinicId');
    if (!user) {
      auditLogger.logAuthentication({
        email,
        success: false,
        reason: 'user_not_found',
        ip: req.ip
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      auditLogger.logAuthentication({
        userId: user._id,
        email,
        success: false,
        reason: 'account_locked',
        ip: req.ip
      });
      return res.status(423).json({ error: 'Account is temporarily locked' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      auditLogger.logAuthentication({
        userId: user._id,
        email,
        success: false,
        reason: 'invalid_password',
        ip: req.ip
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if clinic is active
    if (!user.clinicId || user.clinicId.status !== 'active') {
      auditLogger.logAuthentication({
        userId: user._id,
        email,
        success: false,
        reason: 'clinic_inactive',
        ip: req.ip
      });
      return res.status(403).json({ error: 'Clinic is not active' });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId._id,
        permissions: user.permissions
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    auditLogger.logAuthentication({
      userId: user._id,
      email,
      success: true,
      ip: req.ip
    });

    logger.logHealthcareEvent('USER_LOGIN', null, {
      userId: user._id,
      clinicId: user.clinicId._id,
      role: user.role
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.getDecryptedProfile(),
        clinicId: user.clinicId._id,
        clinicName: user.clinicId.name,
        permissions: user.permissions,
        preferences: user.preferences
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Register endpoint (for clinic setup)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('clinicName').isLength({ min: 2 }),
  body('firstName').isLength({ min: 1 }),
  body('lastName').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, clinicName, firstName, lastName, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create clinic first
    const clinic = new Clinic({
      name: clinicName,
      contactInfo: {
        email,
        phone,
        address
      },
      subscription: {
        tier: 'starter',
        status: 'trial',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        maxProviders: 5,
        maxPatients: 1000
      },
      status: 'pending'
    });

    await clinic.save();

    // Create admin user
    const user = new User({
      email,
      password,
      role: 'admin',
      clinicId: clinic._id,
      profile: {
        firstName,
        lastName,
        phone
      },
      permissions: [
        { module: 'admin', actions: ['read', 'write', 'delete', 'admin'] },
        { module: 'clinical', actions: ['read', 'write', 'delete'] },
        { module: 'scheduling', actions: ['read', 'write', 'delete'] },
        { module: 'billing', actions: ['read', 'write', 'delete'] },
        { module: 'marketing', actions: ['read', 'write', 'delete'] },
        { module: 'analytics', actions: ['read', 'write'] }
      ],
      createdBy: null // Self-created
    });

    await user.save();

    // Update clinic with created by
    clinic.createdBy = user._id;
    clinic.status = 'active';
    await clinic.save();

    auditLogger.logAuthentication({
      userId: user._id,
      email,
      success: true,
      action: 'register',
      ip: req.ip
    });

    logger.logHealthcareEvent('CLINIC_REGISTERED', null, {
      clinicId: clinic._id,
      userId: user._id,
      clinicName
    });

    res.status(201).json({
      message: 'Registration successful',
      clinic: {
        id: clinic._id,
        name: clinic.name,
        status: clinic.status,
        subscription: clinic.subscription
      },
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    // In a more sophisticated setup, you might maintain a blacklist of tokens
    // For now, we'll just log the logout event
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        auditLogger.logAuthentication({
          userId: decoded.user.id,
          email: decoded.user.email,
          success: true,
          action: 'logout',
          ip: req.ip
        });

        logger.logHealthcareEvent('USER_LOGOUT', null, {
          userId: decoded.user.id,
          clinicId: decoded.user.clinicId
        });
      } catch (error) {
        // Token might be invalid, but that's okay for logout
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify current token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get updated user data
    const user = await User.findById(decoded.user.id).populate('clinicId');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Check clinic status
    if (!user.clinicId || user.clinicId.status !== 'active') {
      return res.status(403).json({ error: 'Clinic is not active' });
    }

    // Generate new token
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId._id,
        permissions: user.permissions
      }
    };

    const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    res.json({
      token: newToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.getDecryptedProfile(),
        clinicId: user.clinicId._id,
        clinicName: user.clinicId.name,
        permissions: user.permissions,
        preferences: user.preferences
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    logger.error('Token refresh error:', error);
    res.status(500).json({ error: 'Server error during token refresh' });
  }
});

// Password reset request
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findByEmail(email);

    // Always return success to prevent email enumeration
    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    if (user) {
      // Generate reset token (in production, this would be sent via email)
      const resetToken = jwt.sign(
        { userId: user._id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      auditLogger.logSecurityEvent({
        userId: user._id,
        event: 'password_reset_requested',
        ip: req.ip
      });

      logger.logHealthcareEvent('PASSWORD_RESET_REQUESTED', null, {
        userId: user._id,
        email: user.email
      });

      // In production, send email with reset link
      // await sendPasswordResetEmail(user.email, resetToken);
    }

  } catch (error) {
    logger.error('Password reset request error:', error);
    res.status(500).json({ error: 'Server error processing password reset request' });
  }
});

// Password reset
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password
    user.password = password;
    await user.save();

    auditLogger.logSecurityEvent({
      userId: user._id,
      event: 'password_reset_completed',
      ip: req.ip
    });

    logger.logHealthcareEvent('PASSWORD_RESET_COMPLETED', null, {
      userId: user._id
    });

    res.json({ message: 'Password reset successful' });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Reset token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    logger.error('Password reset error:', error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

// Change password (authenticated)
router.post('/change-password', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      auditLogger.logSecurityEvent({
        userId: user._id,
        event: 'password_change_failed',
        reason: 'invalid_current_password',
        ip: req.ip
      });
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    auditLogger.logSecurityEvent({
      userId: user._id,
      event: 'password_changed',
      ip: req.ip
    });

    logger.logHealthcareEvent('PASSWORD_CHANGED', null, {
      userId: user._id
    });

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    logger.error('Password change error:', error);
    res.status(500).json({ error: 'Server error during password change' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id)
      .populate('clinicId', 'name status subscription')
      .select('-password -mfaSecret');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.getDecryptedProfile(),
      clinicId: user.clinicId._id,
      clinicName: user.clinicId.name,
      permissions: user.permissions,
      preferences: user.preferences,
      lastLogin: user.lastLogin,
      isActive: user.isActive
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

module.exports = router;