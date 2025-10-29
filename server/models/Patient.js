const mongoose = require('mongoose');
const { encryptPHI, decryptPHI, hashForIndex } = require('../utils/encryption');

const patientSchema = new mongoose.Schema({
  // Encrypted PHI
  personalInfo: {
    type: mongoose.Schema.Types.Mixed, // Encrypted patient data
    required: true
  },
  
  // Searchable hashed identifiers (for duplicate detection without exposing PHI)
  emailHash: String,
  phoneHash: String,
  ssnHash: String,
  
  // Non-PHI identifiers
  patientId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Clinical Information
  conditions: [{
    code: String,
    system: String,
    display: String,
    clinicalStatus: String,
    verificationStatus: String,
    onsetDate: Date,
    recordedDate: Date,
    severity: String,
    notes: String
  }],
  
  allergies: [{
    substance: String,
    reaction: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'life-threatening']
    },
    onsetDate: Date,
    notes: String
  }],
  
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued'],
      default: 'active'
    },
    notes: String
  }],
  
  vitals: [{
    date: Date,
    height: Number, // cm
    weight: Number, // kg
    bmi: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number, // Celsius
    respiratoryRate: Number,
    oxygenSaturation: Number,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Care Team
  primaryProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  careTeam: [{
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    startDate: Date,
    endDate: Date
  }],
  
  // Organization
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  
  // Insurance Information (encrypted)
  insurance: {
    type: mongoose.Schema.Types.Mixed // Encrypted insurance data
  },
  
  // Emergency Contacts (encrypted)
  emergencyContacts: {
    type: mongoose.Schema.Types.Mixed // Encrypted emergency contact data
  },
  
  // Care Preferences
  preferences: {
    communicationMethod: {
      type: String,
      enum: ['email', 'phone', 'sms', 'portal'],
      default: 'email'
    },
    language: {
      type: String,
      default: 'en'
    },
    appointmentReminders: {
      type: Boolean,
      default: true
    },
    healthReminders: {
      type: Boolean,
      default: true
    }
  },
  
  // Risk Assessment
  riskScore: {
    overall: Number,
    cardiovascular: Number,
    diabetes: Number,
    lastCalculated: Date,
    factors: [String]
  },
  
  // Engagement Metrics
  engagement: {
    portalLogins: { type: Number, default: 0 },
    appointmentAdherence: { type: Number, default: 0 },
    medicationAdherence: { type: Number, default: 0 },
    lastPortalLogin: Date,
    communicationPreference: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'deceased', 'transferred'],
    default: 'active'
  },
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
patientSchema.index({ patientId: 1 });
patientSchema.index({ clinicId: 1 });
patientSchema.index({ primaryProvider: 1 });
patientSchema.index({ emailHash: 1 });
patientSchema.index({ phoneHash: 1 });
patientSchema.index({ status: 1 });
patientSchema.index({ 'riskScore.overall': -1 });

// Pre-save middleware
patientSchema.pre('save', function(next) {
  // Encrypt PHI before saving
  if (this.isModified('personalInfo')) {
    this.personalInfo = encryptPHI(this.personalInfo);
  }
  
  if (this.isModified('insurance') && this.insurance) {
    this.insurance = encryptPHI(this.insurance);
  }
  
  if (this.isModified('emergencyContacts') && this.emergencyContacts) {
    this.emergencyContacts = encryptPHI(this.emergencyContacts);
  }
  
  // Create searchable hashes
  const decryptedInfo = this.getDecryptedPersonalInfo();
  if (decryptedInfo.email) {
    this.emailHash = hashForIndex(decryptedInfo.email.toLowerCase());
  }
  if (decryptedInfo.phone) {
    this.phoneHash = hashForIndex(decryptedInfo.phone);
  }
  if (decryptedInfo.ssn) {
    this.ssnHash = hashForIndex(decryptedInfo.ssn);
  }
  
  next();
});

// Instance methods
patientSchema.methods.getDecryptedPersonalInfo = function() {
  if (!this.personalInfo) return {};
  return decryptPHI(this.personalInfo);
};

patientSchema.methods.getDecryptedInsurance = function() {
  if (!this.insurance) return {};
  return decryptPHI(this.insurance);
};

patientSchema.methods.getDecryptedEmergencyContacts = function() {
  if (!this.emergencyContacts) return [];
  return decryptPHI(this.emergencyContacts);
};

patientSchema.methods.calculateAge = function() {
  const personalInfo = this.getDecryptedPersonalInfo();
  if (!personalInfo.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

patientSchema.methods.getLatestVitals = function() {
  if (!this.vitals || this.vitals.length === 0) return null;
  return this.vitals.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};

patientSchema.methods.getActiveConditions = function() {
  return this.conditions.filter(condition => 
    condition.clinicalStatus === 'active' || 
    condition.clinicalStatus === 'recurrence'
  );
};

patientSchema.methods.getActiveMedications = function() {
  return this.medications.filter(med => med.status === 'active');
};

patientSchema.methods.calculateBMI = function(height, weight) {
  if (!height || !weight) return null;
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

// Static methods
patientSchema.statics.findByEmail = function(email, clinicId) {
  const emailHash = hashForIndex(email.toLowerCase());
  return this.findOne({ emailHash, clinicId });
};

patientSchema.statics.findByPhone = function(phone, clinicId) {
  const phoneHash = hashForIndex(phone);
  return this.findOne({ phoneHash, clinicId });
};

patientSchema.statics.findBySSN = function(ssn, clinicId) {
  const ssnHash = hashForIndex(ssn);
  return this.findOne({ ssnHash, clinicId });
};

patientSchema.statics.getHighRiskPatients = function(clinicId, threshold = 70) {
  return this.find({
    clinicId: clinicId,
    'riskScore.overall': { $gte: threshold },
    status: 'active'
  }).populate('primaryProvider', 'profile');
};

patientSchema.statics.getPatientsByProvider = function(providerId) {
  return this.find({
    primaryProvider: providerId,
    status: 'active'
  }).select('-personalInfo -insurance -emergencyContacts');
};

// Virtual for full name (requires decryption)
patientSchema.virtual('fullName').get(function() {
  const personalInfo = this.getDecryptedPersonalInfo();
  return `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim();
});

// Middleware for audit logging
patientSchema.post('save', function(doc) {
  const logger = require('../utils/logger');
  logger.logHealthcareEvent('PATIENT_UPDATED', doc._id, {
    clinicId: doc.clinicId,
    primaryProvider: doc.primaryProvider
  });
});

patientSchema.post('findOneAndUpdate', function(doc) {
  if (doc) {
    const logger = require('../utils/logger');
    logger.logHealthcareEvent('PATIENT_MODIFIED', doc._id, {
      clinicId: doc.clinicId
    });
  }
});

module.exports = mongoose.model('Patient', patientSchema);