const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { multiTenantMiddleware, featureAccessMiddleware } = require('../middleware/multiTenant');
const aiEngine = require('../services/aiEngine');
const fhirService = require('../services/fhirService');
const Patient = require('../models/Patient');
const logger = require('../utils/logger');

// Apply middleware
router.use(auth);
router.use(multiTenantMiddleware());
router.use(featureAccessMiddleware('clinical'));

// AI-powered clinical documentation
router.post('/documentation/generate', async (req, res) => {
  try {
    const { patientId, encounterNotes, symptoms, vitalSigns } = req.body;

    // Get patient data
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Generate clinical summary using AI
    const patientData = {
      id: patient._id,
      personalInfo: patient.getDecryptedPersonalInfo(),
      conditions: patient.conditions,
      medications: patient.medications,
      allergies: patient.allergies,
      vitals: patient.vitals.slice(-5) // Last 5 vital readings
    };

    const clinicalSummary = await aiEngine.generateClinicalSummary(
      patientData,
      encounterNotes
    );

    // Suggest ICD-10 codes
    const icdSuggestions = await aiEngine.suggestICD10Codes(
      symptoms,
      clinicalSummary.assessment
    );

    // Generate treatment plan
    const treatmentPlan = await aiEngine.generateTreatmentPlan(
      clinicalSummary.assessment,
      patientData,
      null // Clinical guidelines would be passed here
    );

    const response = {
      clinicalSummary,
      icdSuggestions,
      treatmentPlan,
      generatedAt: new Date().toISOString(),
      providerId: req.user.id
    };

    logger.logHealthcareEvent('CLINICAL_DOCUMENTATION_GENERATED', patientId, {
      providerId: req.user.id,
      clinicId: req.clinicId
    });

    res.json(response);
  } catch (error) {
    logger.error('Error generating clinical documentation:', error);
    res.status(500).json({ error: 'Failed to generate clinical documentation' });
  }
});

// ICD-10 code suggestions
router.post('/icd10/suggest', async (req, res) => {
  try {
    const { symptoms, diagnosis, patientHistory } = req.body;

    const suggestions = await aiEngine.suggestICD10Codes(symptoms, diagnosis);

    // Enhance suggestions with patient-specific context
    const enhancedSuggestions = suggestions.map(suggestion => ({
      ...suggestion,
      relevanceScore: calculateRelevanceScore(suggestion, patientHistory),
      documentation: generateICDDocumentation(suggestion, symptoms)
    }));

    res.json({
      suggestions: enhancedSuggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error suggesting ICD-10 codes:', error);
    res.status(500).json({ error: 'Failed to suggest ICD-10 codes' });
  }
});

// Clinical decision support
router.post('/decision-support', async (req, res) => {
  try {
    const { patientId, clinicalQuestion, context } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientData = {
      demographics: {
        age: patient.calculateAge(),
        gender: patient.getDecryptedPersonalInfo().gender
      },
      conditions: patient.getActiveConditions(),
      medications: patient.getActiveMedications(),
      allergies: patient.allergies,
      vitals: patient.getLatestVitals()
    };

    // Use AI to provide clinical decision support
    const decisionSupport = await aiEngine.provideClinicalDecisionSupport(
      clinicalQuestion,
      patientData,
      context
    );

    res.json({
      recommendation: decisionSupport.recommendation,
      evidence: decisionSupport.evidence,
      alternatives: decisionSupport.alternatives,
      warnings: decisionSupport.warnings,
      confidence: decisionSupport.confidence,
      references: decisionSupport.references
    });
  } catch (error) {
    logger.error('Error providing clinical decision support:', error);
    res.status(500).json({ error: 'Failed to provide clinical decision support' });
  }
});

// Risk assessment
router.post('/risk-assessment/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { assessmentType } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientHistory = {
      conditions: patient.conditions,
      medications: patient.medications,
      familyHistory: patient.getDecryptedPersonalInfo().familyHistory || []
    };

    const vitalSigns = patient.getLatestVitals();
    const labResults = req.body.labResults || {};

    const riskAssessment = await aiEngine.predictPatientRisk(
      patientHistory,
      vitalSigns,
      labResults
    );

    // Update patient risk score
    await Patient.findByIdAndUpdate(patientId, {
      'riskScore.overall': riskAssessment.overallRisk,
      'riskScore.cardiovascular': riskAssessment.cardiovascularRisk,
      'riskScore.diabetes': riskAssessment.diabetesRisk,
      'riskScore.lastCalculated': new Date(),
      'riskScore.factors': riskAssessment.riskFactors
    });

    logger.logHealthcareEvent('RISK_ASSESSMENT_COMPLETED', patientId, {
      overallRisk: riskAssessment.overallRisk,
      providerId: req.user.id
    });

    res.json(riskAssessment);
  } catch (error) {
    logger.error('Error performing risk assessment:', error);
    res.status(500).json({ error: 'Failed to perform risk assessment' });
  }
});

// Clinical trends analysis
router.get('/trends/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { timeframe = '6months' } = req.query;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientData = {
      vitals: patient.vitals,
      labs: req.body.labResults || [],
      medications: patient.medications,
      appointments: req.body.appointments || []
    };

    const trends = await aiEngine.analyzeClinicalTrends(patientData, timeframe);

    res.json({
      trends,
      recommendations: generateTrendRecommendations(trends),
      alerts: identifyTrendAlerts(trends)
    });
  } catch (error) {
    logger.error('Error analyzing clinical trends:', error);
    res.status(500).json({ error: 'Failed to analyze clinical trends' });
  }
});

// Medication interaction checker
router.post('/medication-interactions', async (req, res) => {
  try {
    const { medications, newMedication, patientId } = req.body;

    const patient = patientId ? await Patient.findById(patientId) : null;
    const allergies = patient ? patient.allergies : [];

    const interactionCheck = await checkMedicationInteractions(
      medications,
      newMedication,
      allergies
    );

    res.json({
      interactions: interactionCheck.interactions,
      allergicReactions: interactionCheck.allergicReactions,
      contraindications: interactionCheck.contraindications,
      severity: interactionCheck.severity,
      recommendations: interactionCheck.recommendations
    });
  } catch (error) {
    logger.error('Error checking medication interactions:', error);
    res.status(500).json({ error: 'Failed to check medication interactions' });
  }
});

// Clinical quality metrics
router.get('/quality-metrics', async (req, res) => {
  try {
    const { startDate, endDate, providerId } = req.query;

    const metrics = await calculateQualityMetrics(
      req.clinicId,
      providerId,
      startDate,
      endDate
    );

    res.json({
      metrics,
      benchmarks: getQualityBenchmarks(),
      recommendations: generateQualityRecommendations(metrics)
    });
  } catch (error) {
    logger.error('Error calculating quality metrics:', error);
    res.status(500).json({ error: 'Failed to calculate quality metrics' });
  }
});

// FHIR integration endpoints
router.get('/fhir/patient/:fhirId', async (req, res) => {
  try {
    const { fhirId } = req.params;
    const { system = 'generic' } = req.query;

    const fhirPatient = await fhirService.getPatient(fhirId, system);
    
    res.json(fhirPatient);
  } catch (error) {
    logger.error('Error fetching FHIR patient:', error);
    res.status(500).json({ error: 'Failed to fetch FHIR patient data' });
  }
});

router.get('/fhir/observations/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { category, system = 'generic' } = req.query;

    const observations = await fhirService.getObservations(patientId, category, system);
    
    res.json(observations);
  } catch (error) {
    logger.error('Error fetching FHIR observations:', error);
    res.status(500).json({ error: 'Failed to fetch FHIR observations' });
  }
});

// Helper functions
function calculateRelevanceScore(suggestion, patientHistory) {
  let score = suggestion.confidence || 0.5;
  
  // Increase score if condition appears in patient history
  if (patientHistory.conditions?.some(c => c.code === suggestion.code)) {
    score += 0.2;
  }
  
  // Increase score based on symptom match
  if (suggestion.symptoms && patientHistory.currentSymptoms) {
    const matchingSymptoms = suggestion.symptoms.filter(s => 
      patientHistory.currentSymptoms.includes(s)
    );
    score += (matchingSymptoms.length / suggestion.symptoms.length) * 0.3;
  }
  
  return Math.min(1.0, score);
}

function generateICDDocumentation(suggestion, symptoms) {
  return {
    code: suggestion.code,
    description: suggestion.description,
    supportingSymptoms: symptoms.filter(s => 
      suggestion.relatedSymptoms?.includes(s)
    ),
    documentation: `Patient presents with ${symptoms.join(', ')} consistent with ${suggestion.description} (${suggestion.code})`
  };
}

async function checkMedicationInteractions(medications, newMedication, allergies) {
  // This would integrate with a medication interaction database
  // For now, returning mock data structure
  return {
    interactions: [],
    allergicReactions: [],
    contraindications: [],
    severity: 'low',
    recommendations: []
  };
}

async function calculateQualityMetrics(clinicId, providerId, startDate, endDate) {
  // Calculate clinical quality metrics
  const filter = { clinicId };
  if (providerId) filter.primaryProvider = providerId;
  
  const patients = await Patient.find(filter);
  
  return {
    totalPatients: patients.length,
    highRiskPatients: patients.filter(p => p.riskScore?.overall > 70).length,
    medicationAdherence: calculateMedicationAdherence(patients),
    appointmentAdherence: calculateAppointmentAdherence(patients),
    preventiveCareCompliance: calculatePreventiveCareCompliance(patients)
  };
}

function calculateMedicationAdherence(patients) {
  // Calculate average medication adherence
  const adherenceScores = patients.map(p => p.engagement?.medicationAdherence || 0);
  return adherenceScores.reduce((sum, score) => sum + score, 0) / adherenceScores.length;
}

function calculateAppointmentAdherence(patients) {
  // Calculate average appointment adherence
  const adherenceScores = patients.map(p => p.engagement?.appointmentAdherence || 0);
  return adherenceScores.reduce((sum, score) => sum + score, 0) / adherenceScores.length;
}

function calculatePreventiveCareCompliance(patients) {
  // Calculate preventive care compliance metrics
  return {
    annualPhysicals: 0.85,
    vaccinations: 0.92,
    screenings: 0.78
  };
}

function getQualityBenchmarks() {
  return {
    medicationAdherence: { target: 0.80, excellent: 0.90 },
    appointmentAdherence: { target: 0.85, excellent: 0.95 },
    preventiveCareCompliance: { target: 0.75, excellent: 0.85 }
  };
}

function generateQualityRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics.medicationAdherence < 0.80) {
    recommendations.push({
      type: 'medication_adherence',
      priority: 'high',
      suggestion: 'Implement medication reminder system and patient education program'
    });
  }
  
  if (metrics.appointmentAdherence < 0.85) {
    recommendations.push({
      type: 'appointment_adherence',
      priority: 'medium',
      suggestion: 'Enhance appointment reminder system and flexible scheduling options'
    });
  }
  
  return recommendations;
}

function generateTrendRecommendations(trends) {
  const recommendations = [];
  
  if (trends.vitalSigns.bloodPressure === 'increasing') {
    recommendations.push({
      type: 'vital_trend',
      priority: 'high',
      message: 'Blood pressure showing upward trend - consider medication adjustment'
    });
  }
  
  return recommendations;
}

function identifyTrendAlerts(trends) {
  const alerts = [];
  
  if (trends.labResults.hba1c === 'worsening') {
    alerts.push({
      type: 'lab_alert',
      severity: 'high',
      message: 'HbA1c levels worsening - immediate intervention required'
    });
  }
  
  return alerts;
}

module.exports = router;