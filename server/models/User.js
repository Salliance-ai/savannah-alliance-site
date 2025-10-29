const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encryptPHI, decryptPHI } = require('../utils/encryption');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['admin', 'provider', 'nurse', 'front_desk', 'billing', 'marketing'],
    required: true
  },
  
  // Profile Information (encrypted)
  profile: {
    type: mongoose.Schema.Types.Mixed, // Will store encrypted PHI
    default: {}
  },
  
  // Organization/Clinic Association
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  
  // Permissions and Access
  permissions: [{
    module: {
      type: String,
      enum: ['clinical', 'scheduling', 'billing', 'marketing', 'analytics', 'admin']
    },
    actions: [{
      type: String,
      enum: ['read', 'write', 'delete', 'admin']
    }]
  }],
  
  // Professional Information
  licenseNumber: String,
  npiNumber: String,
  specialties: [String],
  
  // System Information
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // MFA
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: String,
  
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    dashboard: {
      layout: { type: String, default: 'default' },
      widgets: [String]
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.mfaSecret;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ clinicId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for account locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Encrypt profile information if modified
  if (this.isModified('profile') && this.profile) {
    this.profile = encryptPHI(this.profile);
  }
  
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

userSchema.methods.getDecryptedProfile = function() {
  if (!this.profile) return {};
  return decryptPHI(this.profile);
};

userSchema.methods.hasPermission = function(module, action) {
  if (this.role === 'admin') return true;
  
  const permission = this.permissions.find(p => p.module === module);
  return permission && permission.actions.includes(action);
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.getActiveProviders = function(clinicId) {
  return this.find({
    clinicId: clinicId,
    role: { $in: ['provider', 'nurse'] },
    isActive: true
  }).select('-password -mfaSecret');
};

// Middleware to log user activities
userSchema.post('save', function(doc) {
  const logger = require('../utils/logger');
  logger.logHealthcareEvent('USER_UPDATED', null, {
    userId: doc._id,
    role: doc.role,
    clinicId: doc.clinicId
  });
});

module.exports = mongoose.model('User', userSchema);