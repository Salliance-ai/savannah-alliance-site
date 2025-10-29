const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { multiTenantMiddleware, usageLimitMiddleware } = require('../middleware/multiTenant');
const Patient = require('../models/Patient');
const aiEngine = require('../services/aiEngine');
const fhirService = require('../services/fhirService');
const ghlService = require('../services/ghlService');
const logger = require('../utils/logger');

// Apply middleware
router.use(auth);
router.use(multiTenantMiddleware());

// Patient360 unified profile
router.get('/:patientId/profile360', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findById(patientId)
      .populate('primaryProvider', 'profile specialties')
      .populate('careTeam.provider', 'profile specialties');

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Build comprehensive patient profile
    const profile360 = await buildPatient360Profile(patient, req.clinicId);

    logger.logHealthcareEvent('PATIENT_360_ACCESSED', patientId, {
      userId: req.user.id,
      clinicId: req.clinicId
    });

    res.json(profile360);
  } catch (error) {
    logger.error('Error fetching Patient360 profile:', error);
    res.status(500).json({ error: 'Failed to fetch patient profile' });
  }
});

// Create new patient
router.post('/', usageLimitMiddleware('patients'), async (req, res) => {
  try {
    const patientData = req.body;
    
    // Check for duplicates
    const existingPatient = await checkForDuplicates(patientData, req.clinicId);
    if (existingPatient) {
      return res.status(409).json({
        error: 'Potential duplicate patient found',
        existingPatient: {
          id: existingPatient._id,
          name: existingPatient.fullName,
          dateOfBirth: existingPatient.getDecryptedPersonalInfo().dateOfBirth
        }
      });
    }

    // Generate unique patient ID
    const patientId = await generatePatientId(req.clinicId);

    const patient = new Patient({
      patientId,
      clinicId: req.clinicId,
      personalInfo: {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        email: patientData.email,
        phone: patientData.phone,
        address: patientData.address,
        ssn: patientData.ssn,
        emergencyContact: patientData.emergencyContact
      },
      insurance: patientData.insurance,
      primaryProvider: patientData.primaryProvider,
      preferences: patientData.preferences || {},
      createdBy: req.user.id
    });

    await patient.save();

    // Update clinic usage
    await req.clinic.updateUsage('currentPatients', 1);

    // Create GHL contact if integration is enabled
    if (req.clinic.integrations.ghl.enabled) {
      try {
        await createGHLContact(patient, req.clinicId);
      } catch (ghlError) {
        logger.warn('Failed to create GHL contact:', ghlError);
        // Don't fail patient creation if GHL sync fails
      }
    }

    logger.logHealthcareEvent('PATIENT_CREATED', patient._id, {
      createdBy: req.user.id,
      clinicId: req.clinicId
    });

    res.status(201).json({
      id: patient._id,
      patientId: patient.patientId,
      message: 'Patient created successfully'
    });
  } catch (error) {
    logger.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// Update patient
router.put('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const updateData = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Update fields
    if (updateData.personalInfo) {
      const currentInfo = patient.getDecryptedPersonalInfo();
      patient.personalInfo = { ...currentInfo, ...updateData.personalInfo };
    }

    if (updateData.conditions) {
      patient.conditions = updateData.conditions;
    }

    if (updateData.medications) {
      patient.medications = updateData.medications;
    }

    if (updateData.allergies) {
      patient.allergies = updateData.allergies;
    }

    if (updateData.preferences) {
      patient.preferences = { ...patient.preferences, ...updateData.preferences };
    }

    patient.lastModifiedBy = req.user.id;
    await patient.save();

    // Sync with GHL if enabled
    if (req.clinic.integrations.ghl.enabled && patient.ghlContactId) {
      try {
        await syncPatientToGHL(patient, req.clinicId);
      } catch (ghlError) {
        logger.warn('Failed to sync patient to GHL:', ghlError);
      }
    }

    logger.logHealthcareEvent('PATIENT_UPDATED', patientId, {
      updatedBy: req.user.id,
      clinicId: req.clinicId
    });

    res.json({ message: 'Patient updated successfully' });
  } catch (error) {
    logger.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// Get patient list with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status = 'active',
      riskLevel,
      provider,
      sortBy = 'lastName',
      sortOrder = 'asc'
    } = req.query;

    const filter = { clinicId: req.clinicId, status };

    // Add provider filter
    if (provider) {
      filter.primaryProvider = provider;
    }

    // Add risk level filter
    if (riskLevel) {
      const riskRanges = {
        low: { $lt: 30 },
        medium: { $gte: 30, $lt: 70 },
        high: { $gte: 70 }
      };
      filter['riskScore.overall'] = riskRanges[riskLevel];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        { path: 'primaryProvider', select: 'profile' },
        { path: 'careTeam.provider', select: 'profile' }
      ],
      select: '-personalInfo -insurance -emergencyContacts' // Exclude PHI from list view
    };

    let patients;
    if (search) {
      // For search, we need to handle encrypted data differently
      patients = await searchPatients(search, filter, options);
    } else {
      patients = await Patient.paginate(filter, options);
    }

    // Add computed fields
    const enhancedPatients = patients.docs.map(patient => ({
      ...patient.toObject(),
      age: patient.calculateAge(),
      latestVitals: patient.getLatestVitals(),
      activeConditionsCount: patient.getActiveConditions().length,
      activeMedicationsCount: patient.getActiveMedications().length
    }));

    res.json({
      patients: enhancedPatients,
      pagination: {
        page: patients.page,
        pages: patients.pages,
        total: patients.total,
        limit: patients.limit
      }
    });
  } catch (error) {
    logger.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient analytics
router.get('/:patientId/analytics', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { timeframe = '1year' } = req.query;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const analytics = await generatePatientAnalytics(patient, timeframe);

    res.json(analytics);
  } catch (error) {
    logger.error('Error generating patient analytics:', error);
    res.status(500).json({ error: 'Failed to generate patient analytics' });
  }
});

// Patient engagement tracking
router.post('/:patientId/engagement', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { event, data } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Update engagement metrics
    const engagement = patient.engagement || {};
    
    switch (event) {
      case 'portal_login':
        engagement.portalLogins = (engagement.portalLogins || 0) + 1;
        engagement.lastPortalLogin = new Date();
        break;
      case 'appointment_completed':
        engagement.appointmentAdherence = calculateAppointmentAdherence(patient, data);
        break;
      case 'medication_taken':
        engagement.medicationAdherence = calculateMedicationAdherence(patient, data);
        break;
    }

    patient.engagement = engagement;
    await patient.save();

    // Generate engagement insights
    const insights = await generateEngagementInsights(patient);

    res.json({
      engagement: patient.engagement,
      insights
    });
  } catch (error) {
    logger.error('Error updating patient engagement:', error);
    res.status(500).json({ error: 'Failed to update patient engagement' });
  }
});

// AI-powered patient insights
router.get('/:patientId/ai-insights', async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const insights = await generateAIInsights(patient);

    res.json(insights);
  } catch (error) {
    logger.error('Error generating AI insights:', error);
    res.status(500).json({ error: 'Failed to generate AI insights' });
  }
});

// Care continuity tracking
router.get('/:patientId/care-continuity', async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId)
      .populate('careTeam.provider', 'profile specialties');

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const continuity = await analyzeCareContinity(patient);

    res.json(continuity);
  } catch (error) {
    logger.error('Error analyzing care continuity:', error);
    res.status(500).json({ error: 'Failed to analyze care continuity' });
  }
});

// Helper functions
async function buildPatient360Profile(patient, clinicId) {
  const personalInfo = patient.getDecryptedPersonalInfo();
  const insurance = patient.getDecryptedInsurance();
  const emergencyContacts = patient.getDecryptedEmergencyContacts();

  // Get recent clinical data
  const recentVitals = patient.vitals.slice(-10);
  const activeConditions = patient.getActiveConditions();
  const activeMedications = patient.getActiveMedications();

  // Calculate risk scores
  const riskAssessment = patient.riskScore || {};

  // Get care team information
  const careTeam = patient.careTeam.filter(member => !member.endDate);

  // Generate AI insights
  const aiInsights = await generatePatientAIInsights(patient);

  // Get appointment history (would query appointments collection)
  const appointmentHistory = []; // Mock data

  // Get billing information (would query billing collection)
  const billingInfo = {}; // Mock data

  return {
    // Basic Information
    id: patient._id,
    patientId: patient.patientId,
    personalInfo: {
      ...personalInfo,
      age: patient.calculateAge()
    },
    insurance,
    emergencyContacts,

    // Clinical Information
    conditions: activeConditions,
    medications: activeMedications,
    allergies: patient.allergies,
    vitals: {
      recent: recentVitals,
      latest: patient.getLatestVitals(),
      trends: analyzevitalTrends(recentVitals)
    },

    // Risk Assessment
    riskAssessment: {
      ...riskAssessment,
      lastUpdated: riskAssessment.lastCalculated,
      riskFactors: riskAssessment.factors || []
    },

    // Care Team
    careTeam: {
      primary: patient.primaryProvider,
      team: careTeam,
      coordinationScore: calculateCoordinationScore(careTeam)
    },

    // Engagement Metrics
    engagement: {
      ...patient.engagement,
      score: calculateEngagementScore(patient.engagement),
      trends: analyzeEngagementTrends(patient.engagement)
    },

    // AI Insights
    aiInsights,

    // Clinical Timeline
    timeline: buildClinicalTimeline(patient, appointmentHistory),

    // Quality Metrics
    qualityMetrics: calculatePatientQualityMetrics(patient),

    // Billing Summary
    billing: billingInfo,

    // Preferences and Communication
    preferences: patient.preferences,
    communicationHistory: [], // Would fetch from communications log

    // Status and Flags
    status: patient.status,
    flags: identifyPatientFlags(patient, aiInsights)
  };
}

async function checkForDuplicates(patientData, clinicId) {
  // Check by email
  if (patientData.email) {
    const emailDuplicate = await Patient.findByEmail(patientData.email, clinicId);
    if (emailDuplicate) return emailDuplicate;
  }

  // Check by phone
  if (patientData.phone) {
    const phoneDuplicate = await Patient.findByPhone(patientData.phone, clinicId);
    if (phoneDuplicate) return phoneDuplicate;
  }

  // Check by SSN
  if (patientData.ssn) {
    const ssnDuplicate = await Patient.findBySSN(patientData.ssn, clinicId);
    if (ssnDuplicate) return ssnDuplicate;
  }

  return null;
}

async function generatePatientId(clinicId) {
  // Generate unique patient ID (simple implementation)
  const count = await Patient.countDocuments({ clinicId });
  return `P${String(count + 1).padStart(6, '0')}`;
}

async function createGHLContact(patient, clinicId) {
  const personalInfo = patient.getDecryptedPersonalInfo();
  
  const contactData = {
    firstName: personalInfo.firstName,
    lastName: personalInfo.lastName,
    email: personalInfo.email,
    phone: personalInfo.phone,
    address: personalInfo.address,
    patientId: patient.patientId,
    riskScore: patient.riskScore?.overall || 0,
    tags: ['patient', 'new']
  };

  const ghlContact = await ghlService.createContact(clinicId, contactData);
  
  // Store GHL contact ID in patient record
  patient.ghlContactId = ghlContact.id;
  await patient.save();

  return ghlContact;
}

async function syncPatientToGHL(patient, clinicId) {
  if (!patient.ghlContactId) return;

  const personalInfo = patient.getDecryptedPersonalInfo();
  
  const updateData = {
    firstName: personalInfo.firstName,
    lastName: personalInfo.lastName,
    email: personalInfo.email,
    phone: personalInfo.phone,
    customFields: {
      riskScore: patient.riskScore?.overall || 0,
      lastAppointment: patient.lastAppointment,
      primaryProvider: patient.primaryProvider
    }
  };

  return await ghlService.updateContact(clinicId, patient.ghlContactId, updateData);
}

async function searchPatients(searchTerm, filter, options) {
  // Since personal info is encrypted, we need a different search strategy
  // This is a simplified implementation - in production, you'd use search indices
  
  // For now, search by patient ID or other non-encrypted fields
  const searchFilter = {
    ...filter,
    $or: [
      { patientId: { $regex: searchTerm, $options: 'i' } },
      // Add other searchable fields
    ]
  };

  return await Patient.paginate(searchFilter, options);
}

async function generatePatientAnalytics(patient, timeframe) {
  const analytics = {
    overview: {
      totalVisits: 0, // Would count from appointments
      lastVisit: null,
      nextAppointment: null,
      adherenceScore: patient.engagement?.appointmentAdherence || 0
    },
    vitals: {
      trends: analyzevitalTrends(patient.vitals),
      alerts: identifyVitalAlerts(patient.vitals)
    },
    conditions: {
      active: patient.getActiveConditions().length,
      managed: patient.conditions.filter(c => c.clinicalStatus === 'resolved').length,
      chronic: patient.conditions.filter(c => c.severity === 'chronic').length
    },
    medications: {
      active: patient.getActiveMedications().length,
      adherence: patient.engagement?.medicationAdherence || 0,
      interactions: [] // Would check for interactions
    },
    engagement: {
      portalUsage: patient.engagement?.portalLogins || 0,
      communicationPreference: patient.preferences?.communicationMethod || 'email',
      responseRate: 0.85 // Mock data
    },
    riskFactors: patient.riskScore?.factors || []
  };

  return analytics;
}

function calculateAppointmentAdherence(patient, appointmentData) {
  // Calculate appointment adherence based on show/no-show history
  // This is a simplified calculation
  return Math.random() * 0.3 + 0.7; // Mock: 70-100%
}

function calculateMedicationAdherence(patient, medicationData) {
  // Calculate medication adherence based on refill history, etc.
  return Math.random() * 0.3 + 0.7; // Mock: 70-100%
}

async function generateEngagementInsights(patient) {
  const engagement = patient.engagement || {};
  const insights = [];

  if (engagement.portalLogins < 2) {
    insights.push({
      type: 'low_portal_usage',
      message: 'Patient has low portal engagement',
      recommendation: 'Send portal tutorial and benefits information'
    });
  }

  if (engagement.appointmentAdherence < 0.8) {
    insights.push({
      type: 'appointment_adherence',
      message: 'Patient has missed recent appointments',
      recommendation: 'Implement reminder system and address barriers'
    });
  }

  return insights;
}

async function generateAIInsights(patient) {
  // Use AI engine to generate comprehensive patient insights
  const patientData = {
    demographics: {
      age: patient.calculateAge(),
      gender: patient.getDecryptedPersonalInfo().gender
    },
    conditions: patient.conditions,
    medications: patient.medications,
    vitals: patient.vitals,
    engagement: patient.engagement
  };

  try {
    const insights = await aiEngine.generatePatientInsights(patientData);
    return insights;
  } catch (error) {
    logger.error('Error generating AI insights:', error);
    return {
      summary: 'Unable to generate AI insights at this time',
      recommendations: [],
      riskFactors: []
    };
  }
}

async function generatePatientAIInsights(patient) {
  // Generate comprehensive AI insights for Patient360 view
  return await generateAIInsights(patient);
}

function analyzevitalTrends(vitals) {
  if (!vitals || vitals.length < 2) return {};

  const recent = vitals.slice(-5);
  const trends = {};

  // Analyze blood pressure trend
  if (recent.length >= 2) {
    const bpValues = recent.map(v => v.bloodPressure?.systolic).filter(Boolean);
    if (bpValues.length >= 2) {
      const trend = bpValues[bpValues.length - 1] - bpValues[0];
      trends.bloodPressure = trend > 5 ? 'increasing' : trend < -5 ? 'decreasing' : 'stable';
    }
  }

  // Analyze weight trend
  const weightValues = recent.map(v => v.weight).filter(Boolean);
  if (weightValues.length >= 2) {
    const trend = weightValues[weightValues.length - 1] - weightValues[0];
    trends.weight = trend > 2 ? 'increasing' : trend < -2 ? 'decreasing' : 'stable';
  }

  return trends;
}

function calculateCoordinationScore(careTeam) {
  // Calculate care coordination score based on team composition and communication
  if (careTeam.length <= 1) return 0.5;
  if (careTeam.length <= 3) return 0.75;
  return 0.9;
}

function calculateEngagementScore(engagement) {
  if (!engagement) return 0;
  
  let score = 0;
  score += Math.min(1, (engagement.portalLogins || 0) / 10) * 0.3;
  score += (engagement.appointmentAdherence || 0) * 0.4;
  score += (engagement.medicationAdherence || 0) * 0.3;
  
  return Math.round(score * 100);
}

function analyzeEngagementTrends(engagement) {
  // Analyze engagement trends over time
  return {
    portal: 'stable',
    appointments: 'improving',
    medication: 'stable'
  };
}

function buildClinicalTimeline(patient, appointmentHistory) {
  const timeline = [];

  // Add condition diagnoses
  patient.conditions.forEach(condition => {
    timeline.push({
      date: condition.recordedDate || condition.onsetDate,
      type: 'diagnosis',
      description: `Diagnosed with ${condition.display}`,
      severity: condition.severity
    });
  });

  // Add medication starts
  patient.medications.forEach(medication => {
    timeline.push({
      date: medication.startDate,
      type: 'medication',
      description: `Started ${medication.name}`,
      dosage: medication.dosage
    });
  });

  // Add appointments
  appointmentHistory.forEach(appointment => {
    timeline.push({
      date: appointment.date,
      type: 'appointment',
      description: appointment.reason,
      provider: appointment.provider
    });
  });

  return timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function calculatePatientQualityMetrics(patient) {
  return {
    careGaps: identifyCareGaps(patient),
    preventiveCare: assessPreventiveCare(patient),
    chronicCareManagement: assessChronicCare(patient)
  };
}

function identifyCareGaps(patient) {
  const gaps = [];
  const age = patient.calculateAge();
  
  // Example care gap identification
  if (age >= 50 && !hasRecentScreening(patient, 'colonoscopy')) {
    gaps.push({
      type: 'preventive_screening',
      description: 'Colonoscopy screening due',
      priority: 'medium'
    });
  }

  return gaps;
}

function hasRecentScreening(patient, screeningType) {
  // Check if patient has had recent screening
  // This would check against procedures/observations
  return false; // Mock implementation
}

function assessPreventiveCare(patient) {
  return {
    upToDate: 0.75,
    overdue: ['annual_physical', 'mammogram'],
    upcoming: ['flu_shot']
  };
}

function assessChronicCare(patient) {
  const chronicConditions = patient.conditions.filter(c => 
    ['diabetes', 'hypertension', 'heart_disease'].includes(c.code?.toLowerCase())
  );

  return {
    conditions: chronicConditions.length,
    managementScore: 0.8,
    lastReview: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  };
}

function identifyPatientFlags(patient, aiInsights) {
  const flags = [];

  if (patient.riskScore?.overall > 80) {
    flags.push({ type: 'high_risk', message: 'High-risk patient requiring close monitoring' });
  }

  if (patient.engagement?.appointmentAdherence < 0.6) {
    flags.push({ type: 'poor_adherence', message: 'Poor appointment adherence' });
  }

  if (aiInsights.riskFactors?.includes('medication_interaction')) {
    flags.push({ type: 'medication_alert', message: 'Potential medication interactions' });
  }

  return flags;
}

function identifyVitalAlerts(vitals) {
  const alerts = [];
  const latest = vitals[vitals.length - 1];

  if (latest?.bloodPressure?.systolic > 140) {
    alerts.push({
      type: 'hypertension',
      message: 'Elevated blood pressure detected',
      value: `${latest.bloodPressure.systolic}/${latest.bloodPressure.diastolic}`
    });
  }

  return alerts;
}

async function analyzeCareContinity(patient) {
  return {
    primaryProviderConsistency: 0.85,
    careTeamStability: 0.90,
    communicationEffectiveness: 0.78,
    recommendations: [
      'Maintain current primary provider relationship',
      'Consider care coordinator for complex conditions'
    ]
  };
}

module.exports = router;