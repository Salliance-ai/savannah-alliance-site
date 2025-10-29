const mongoose = require('mongoose');
const { encryptPHI, decryptPHI } = require('../utils/encryption');

const clinicSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Subscription Information
  subscription: {
    tier: {
      type: String,
      enum: ['starter', 'practice', 'enterprise'],
      required: true,
      default: 'starter'
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled', 'trial'],
      default: 'trial'
    },
    startDate: Date,
    endDate: Date,
    maxProviders: {
      type: Number,
      default: 5
    },
    maxPatients: {
      type: Number,
      default: 1000
    },
    features: [{
      name: String,
      enabled: Boolean,
      limit: Number
    }]
  },
  
  // Contact Information (encrypted)
  contactInfo: {
    type: mongoose.Schema.Types.Mixed // Encrypted contact data
  },
  
  // Configuration
  settings: {
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    businessHours: {
      monday: { start: String, end: String, closed: Boolean },
      tuesday: { start: String, end: String, closed: Boolean },
      wednesday: { start: String, end: String, closed: Boolean },
      thursday: { start: String, end: String, closed: Boolean },
      friday: { start: String, end: String, closed: Boolean },
      saturday: { start: String, end: String, closed: Boolean },
      sunday: { start: String, end: String, closed: Boolean }
    },
    appointmentDuration: {
      type: Number,
      default: 30 // minutes
    },
    bufferTime: {
      type: Number,
      default: 15 // minutes between appointments
    },
    autoConfirmAppointments: {
      type: Boolean,
      default: false
    },
    allowOnlineBooking: {
      type: Boolean,
      default: true
    }
  },
  
  // Integration Settings
  integrations: {
    epic: {
      enabled: Boolean,
      clientId: String,
      sandboxMode: { type: Boolean, default: true },
      lastSync: Date
    },
    tebra: {
      enabled: Boolean,
      apiKey: String,
      lastSync: Date
    },
    icanotes: {
      enabled: Boolean,
      apiKey: String,
      lastSync: Date
    },
    ghl: {
      enabled: Boolean,
      locationId: String,
      apiKey: String,
      webhookUrl: String,
      lastSync: Date
    },
    stripe: {
      enabled: Boolean,
      accountId: String,
      publishableKey: String
    },
    quickbooks: {
      enabled: Boolean,
      companyId: String,
      accessToken: String,
      refreshToken: String,
      lastSync: Date
    }
  },
  
  // Compliance Settings
  compliance: {
    hipaaCompliant: {
      type: Boolean,
      default: true
    },
    baaSigned: {
      type: Boolean,
      default: false
    },
    auditLogRetention: {
      type: Number,
      default: 2555 // 7 years in days
    },
    dataRetentionPolicy: {
      patientRecords: { type: Number, default: 2555 },
      auditLogs: { type: Number, default: 2555 },
      backups: { type: Number, default: 365 }
    },
    encryptionEnabled: {
      type: Boolean,
      default: true
    }
  },
  
  // Billing Information
  billing: {
    stripeCustomerId: String,
    subscriptionId: String,
    paymentMethodId: String,
    billingAddress: {
      type: mongoose.Schema.Types.Mixed // Encrypted billing address
    },
    invoices: [{
      invoiceId: String,
      amount: Number,
      status: String,
      dueDate: Date,
      paidDate: Date
    }]
  },
  
  // Usage Analytics
  usage: {
    currentProviders: { type: Number, default: 0 },
    currentPatients: { type: Number, default: 0 },
    monthlyAppointments: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 }, // in MB
    apiCalls: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  
  // AI Configuration
  aiSettings: {
    enableClinicalAI: { type: Boolean, default: true },
    enablePredictiveAnalytics: { type: Boolean, default: true },
    enableAutoDocumentation: { type: Boolean, default: true },
    enableRiskAssessment: { type: Boolean, default: true },
    aiModel: {
      type: String,
      enum: ['gpt-4', 'claude-3', 'hybrid'],
      default: 'hybrid'
    },
    customPrompts: [{
      name: String,
      prompt: String,
      category: String,
      enabled: Boolean
    }]
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending', 'cancelled'],
    default: 'pending'
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  onboardingSteps: [{
    step: String,
    completed: Boolean,
    completedAt: Date
  }]
}, {
  timestamps: true
});

// Indexes
clinicSchema.index({ status: 1 });
clinicSchema.index({ 'subscription.tier': 1 });
clinicSchema.index({ 'subscription.status': 1 });
clinicSchema.index({ createdAt: -1 });

// Pre-save middleware
clinicSchema.pre('save', function(next) {
  // Encrypt sensitive information
  if (this.isModified('contactInfo') && this.contactInfo) {
    this.contactInfo = encryptPHI(this.contactInfo);
  }
  
  if (this.isModified('billing.billingAddress') && this.billing.billingAddress) {
    this.billing.billingAddress = encryptPHI(this.billing.billingAddress);
  }
  
  next();
});

// Instance methods
clinicSchema.methods.getDecryptedContactInfo = function() {
  if (!this.contactInfo) return {};
  return decryptPHI(this.contactInfo);
};

clinicSchema.methods.getDecryptedBillingAddress = function() {
  if (!this.billing.billingAddress) return {};
  return decryptPHI(this.billing.billingAddress);
};

clinicSchema.methods.canAddProvider = function() {
  return this.usage.currentProviders < this.subscription.maxProviders;
};

clinicSchema.methods.canAddPatient = function() {
  return this.usage.currentPatients < this.subscription.maxPatients;
};

clinicSchema.methods.hasFeature = function(featureName) {
  const feature = this.subscription.features.find(f => f.name === featureName);
  return feature && feature.enabled;
};

clinicSchema.methods.isSubscriptionActive = function() {
  return this.subscription.status === 'active' && 
         (!this.subscription.endDate || this.subscription.endDate > new Date());
};

clinicSchema.methods.updateUsage = function(type, increment = 1) {
  const updates = {};
  updates[`usage.${type}`] = this.usage[type] + increment;
  
  // Reset monthly counters if needed
  const now = new Date();
  const lastReset = new Date(this.usage.lastReset);
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    updates['usage.monthlyAppointments'] = 0;
    updates['usage.apiCalls'] = 0;
    updates['usage.lastReset'] = now;
  }
  
  return this.updateOne({ $set: updates });
};

clinicSchema.methods.getSubscriptionLimits = function() {
  const tierLimits = {
    starter: {
      maxProviders: 5,
      maxPatients: 1000,
      maxStorage: 5000, // 5GB in MB
      maxApiCalls: 10000,
      features: ['clinical', 'scheduling', 'basic_analytics']
    },
    practice: {
      maxProviders: 25,
      maxPatients: 10000,
      maxStorage: 50000, // 50GB in MB
      maxApiCalls: 100000,
      features: ['clinical', 'scheduling', 'analytics', 'marketing', 'ghl_integration']
    },
    enterprise: {
      maxProviders: -1, // unlimited
      maxPatients: -1, // unlimited
      maxStorage: -1, // unlimited
      maxApiCalls: -1, // unlimited
      features: ['all']
    }
  };
  
  return tierLimits[this.subscription.tier] || tierLimits.starter;
};

// Static methods
clinicSchema.statics.findActiveSubscriptions = function() {
  return this.find({
    'subscription.status': 'active',
    status: 'active'
  });
};

clinicSchema.statics.findExpiringSoon = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'subscription.status': 'active',
    'subscription.endDate': { $lte: futureDate, $gte: new Date() }
  });
};

clinicSchema.statics.getUsageStats = function() {
  return this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$subscription.tier',
        count: { $sum: 1 },
        totalProviders: { $sum: '$usage.currentProviders' },
        totalPatients: { $sum: '$usage.currentPatients' },
        totalStorage: { $sum: '$usage.storageUsed' },
        avgProvidersPerClinic: { $avg: '$usage.currentProviders' },
        avgPatientsPerClinic: { $avg: '$usage.currentPatients' }
      }
    }
  ]);
};

// Virtual for subscription health
clinicSchema.virtual('subscriptionHealth').get(function() {
  const limits = this.getSubscriptionLimits();
  const usage = this.usage;
  
  const providerUsage = limits.maxProviders > 0 ? (usage.currentProviders / limits.maxProviders) * 100 : 0;
  const patientUsage = limits.maxPatients > 0 ? (usage.currentPatients / limits.maxPatients) * 100 : 0;
  const storageUsage = limits.maxStorage > 0 ? (usage.storageUsed / limits.maxStorage) * 100 : 0;
  
  return {
    providers: { usage: providerUsage, status: providerUsage > 90 ? 'warning' : 'ok' },
    patients: { usage: patientUsage, status: patientUsage > 90 ? 'warning' : 'ok' },
    storage: { usage: storageUsage, status: storageUsage > 90 ? 'warning' : 'ok' }
  };
});

// Middleware for logging
clinicSchema.post('save', function(doc) {
  const logger = require('../utils/logger');
  logger.info('CLINIC_UPDATED', {
    clinicId: doc._id,
    tier: doc.subscription.tier,
    status: doc.status
  });
});

module.exports = mongoose.model('Clinic', clinicSchema);