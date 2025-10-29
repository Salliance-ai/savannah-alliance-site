const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { multiTenantMiddleware, featureAccessMiddleware } = require('../middleware/multiTenant');
const aiEngine = require('../services/aiEngine');
const Patient = require('../models/Patient');
const User = require('../models/User');
const logger = require('../utils/logger');

// Apply middleware
router.use(auth);
router.use(multiTenantMiddleware());
router.use(featureAccessMiddleware('scheduling'));

// Appointment model (simplified for this example)
const appointmentSchema = {
  patientId: String,
  providerId: String,
  clinicId: String,
  appointmentType: String,
  scheduledDate: Date,
  duration: Number,
  status: String,
  reason: String,
  notes: String,
  priority: String,
  remindersSent: Number,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
};

// AI-powered smart scheduling
router.post('/smart-schedule', async (req, res) => {
  try {
    const { 
      patientId, 
      appointmentType, 
      preferredDates, 
      urgency = 'routine',
      reason 
    } = req.body;

    // Get patient data for context
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get available providers
    const providers = await User.getActiveProviders(req.clinicId);

    // Get patient preferences and history
    const patientHistory = {
      previousAppointments: [], // Would fetch from appointments collection
      preferredTimes: patient.preferences?.preferredAppointmentTimes || [],
      preferredProvider: patient.primaryProvider,
      riskScore: patient.riskScore?.overall || 0,
      conditions: patient.getActiveConditions()
    };

    // Use AI to optimize scheduling
    const schedulingRecommendations = await generateSmartScheduling({
      patient: {
        id: patientId,
        riskScore: patientHistory.riskScore,
        conditions: patientHistory.conditions,
        preferences: patient.preferences
      },
      appointmentType,
      urgency,
      reason,
      preferredDates,
      availableProviders: providers,
      clinicSettings: req.clinic.settings
    });

    res.json({
      recommendations: schedulingRecommendations,
      suggestedSlots: schedulingRecommendations.slots,
      providerRecommendations: schedulingRecommendations.providers,
      urgencyAssessment: schedulingRecommendations.urgencyAssessment
    });

  } catch (error) {
    logger.error('Error in smart scheduling:', error);
    res.status(500).json({ error: 'Failed to generate smart scheduling recommendations' });
  }
});

// Predictive appointment balancing
router.get('/balance-predictions', async (req, res) => {
  try {
    const { date, providerId } = req.query;
    
    const targetDate = new Date(date);
    const providers = providerId ? [providerId] : await User.getActiveProviders(req.clinicId);

    const predictions = await generateBalancePredictions(
      req.clinicId,
      targetDate,
      providers
    );

    res.json({
      date: targetDate,
      predictions,
      recommendations: generateBalanceRecommendations(predictions),
      optimalDistribution: calculateOptimalDistribution(predictions)
    });

  } catch (error) {
    logger.error('Error generating balance predictions:', error);
    res.status(500).json({ error: 'Failed to generate balance predictions' });
  }
});

// AI assistant for appointment triage
router.post('/triage-assistant', async (req, res) => {
  try {
    const { 
      patientId, 
      symptoms, 
      urgency, 
      patientDescription,
      vitalSigns 
    } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const triageData = {
      patient: {
        age: patient.calculateAge(),
        conditions: patient.getActiveConditions(),
        medications: patient.getActiveMedications(),
        allergies: patient.allergies,
        riskScore: patient.riskScore?.overall || 0
      },
      currentPresentation: {
        symptoms,
        urgency,
        description: patientDescription,
        vitalSigns
      }
    };

    const triageAssessment = await performAITriage(triageData);

    // Log triage for audit
    logger.logHealthcareEvent('AI_TRIAGE_PERFORMED', patientId, {
      urgencyLevel: triageAssessment.urgencyLevel,
      recommendedTimeframe: triageAssessment.timeframe,
      clinicId: req.clinicId
    });

    res.json({
      urgencyLevel: triageAssessment.urgencyLevel,
      recommendedTimeframe: triageAssessment.timeframe,
      suggestedAppointmentType: triageAssessment.appointmentType,
      providerSpecialty: triageAssessment.providerSpecialty,
      redFlags: triageAssessment.redFlags,
      reasoning: triageAssessment.reasoning,
      nextSteps: triageAssessment.nextSteps
    });

  } catch (error) {
    logger.error('Error in AI triage:', error);
    res.status(500).json({ error: 'Failed to perform AI triage' });
  }
});

// Predictive no-show prevention
router.get('/no-show-predictions/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    // This would fetch appointment from database
    const appointment = { /* appointment data */ };
    
    const patient = await Patient.findById(appointment.patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const noShowPrediction = await predictNoShowRisk({
      patient: {
        id: patient._id,
        engagement: patient.engagement,
        demographics: patient.getDecryptedPersonalInfo(),
        appointmentHistory: [] // Would fetch from appointments
      },
      appointment: {
        type: appointment.appointmentType,
        scheduledDate: appointment.scheduledDate,
        timeOfDay: new Date(appointment.scheduledDate).getHours(),
        dayOfWeek: new Date(appointment.scheduledDate).getDay(),
        leadTime: Math.floor((new Date(appointment.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24))
      },
      external: {
        weather: null, // Could integrate weather API
        holidays: null // Could check holiday calendar
      }
    });

    res.json({
      noShowRisk: noShowPrediction.risk,
      riskFactors: noShowPrediction.factors,
      interventions: noShowPrediction.recommendedInterventions,
      confidence: noShowPrediction.confidence
    });

  } catch (error) {
    logger.error('Error predicting no-show risk:', error);
    res.status(500).json({ error: 'Failed to predict no-show risk' });
  }
});

// Adaptive patient routing
router.post('/adaptive-routing', async (req, res) => {
  try {
    const { patientId, appointmentType, symptoms, urgency } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const providers = await User.getActiveProviders(req.clinicId);

    const routingRecommendation = await generateAdaptiveRouting({
      patient: {
        conditions: patient.getActiveConditions(),
        primaryProvider: patient.primaryProvider,
        preferences: patient.preferences,
        riskScore: patient.riskScore?.overall || 0
      },
      appointmentDetails: {
        type: appointmentType,
        symptoms,
        urgency
      },
      availableProviders: providers,
      clinicCapacity: await getClinicCapacity(req.clinicId)
    });

    res.json({
      recommendedProvider: routingRecommendation.provider,
      alternativeProviders: routingRecommendation.alternatives,
      reasoning: routingRecommendation.reasoning,
      expectedWaitTime: routingRecommendation.waitTime,
      qualityScore: routingRecommendation.qualityScore
    });

  } catch (error) {
    logger.error('Error in adaptive routing:', error);
    res.status(500).json({ error: 'Failed to generate adaptive routing' });
  }
});

// Appointment optimization analytics
router.get('/optimization-analytics', async (req, res) => {
  try {
    const { startDate, endDate, providerId } = req.query;

    const analytics = await generateOptimizationAnalytics(
      req.clinicId,
      new Date(startDate),
      new Date(endDate),
      providerId
    );

    res.json({
      utilizationRates: analytics.utilization,
      noShowRates: analytics.noShows,
      patientSatisfaction: analytics.satisfaction,
      providerEfficiency: analytics.efficiency,
      recommendations: analytics.recommendations,
      trends: analytics.trends
    });

  } catch (error) {
    logger.error('Error generating optimization analytics:', error);
    res.status(500).json({ error: 'Failed to generate optimization analytics' });
  }
});

// Helper functions
async function generateSmartScheduling(data) {
  const { patient, appointmentType, urgency, preferredDates, availableProviders, clinicSettings } = data;

  // AI-powered scheduling logic
  const urgencyScore = calculateUrgencyScore(urgency, patient.riskScore, patient.conditions);
  const providerScores = scoreProviders(availableProviders, patient, appointmentType);
  const timeSlots = generateOptimalTimeSlots(preferredDates, clinicSettings, urgencyScore);

  return {
    urgencyAssessment: {
      score: urgencyScore,
      level: getUrgencyLevel(urgencyScore),
      maxWaitDays: getMaxWaitDays(urgencyScore)
    },
    providers: providerScores.slice(0, 3), // Top 3 providers
    slots: timeSlots.slice(0, 5), // Top 5 time slots
    reasoning: generateSchedulingReasoning(urgencyScore, providerScores[0], timeSlots[0])
  };
}

function calculateUrgencyScore(urgency, riskScore, conditions) {
  let score = 0;
  
  // Base urgency
  const urgencyMap = { routine: 1, urgent: 3, emergency: 5 };
  score += urgencyMap[urgency] || 1;
  
  // Risk score factor
  score += (riskScore / 100) * 2;
  
  // Condition-based urgency
  const highUrgencyConditions = ['chest pain', 'shortness of breath', 'severe pain'];
  if (conditions.some(c => highUrgencyConditions.includes(c.display?.toLowerCase()))) {
    score += 2;
  }
  
  return Math.min(5, score);
}

function scoreProviders(providers, patient, appointmentType) {
  return providers.map(provider => {
    let score = 0;
    
    // Primary provider bonus
    if (provider._id.toString() === patient.primaryProvider?.toString()) {
      score += 3;
    }
    
    // Specialty match
    if (provider.specialties?.includes(getRequiredSpecialty(appointmentType))) {
      score += 2;
    }
    
    // Experience factor (mock)
    score += Math.random() * 2; // Would use actual experience data
    
    return {
      provider: provider,
      score: score,
      availability: 'high' // Would check actual availability
    };
  }).sort((a, b) => b.score - a.score);
}

function generateOptimalTimeSlots(preferredDates, clinicSettings, urgencyScore) {
  const slots = [];
  const businessHours = clinicSettings.businessHours;
  
  preferredDates.forEach(date => {
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(date).getDay()];
    const dayHours = businessHours[dayOfWeek];
    
    if (!dayHours.closed) {
      // Generate time slots based on appointment duration and buffer time
      const startHour = parseInt(dayHours.start.split(':')[0]);
      const endHour = parseInt(dayHours.end.split(':')[0]);
      
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push({
          datetime: new Date(date.setHours(hour, 0, 0, 0)),
          score: calculateTimeSlotScore(hour, urgencyScore),
          availability: 'available' // Would check actual availability
        });
      }
    }
  });
  
  return slots.sort((a, b) => b.score - a.score);
}

function calculateTimeSlotScore(hour, urgencyScore) {
  let score = 0;
  
  // Prefer morning slots for high urgency
  if (urgencyScore > 3 && hour < 12) {
    score += 2;
  }
  
  // Prefer afternoon for routine
  if (urgencyScore <= 2 && hour >= 14) {
    score += 1;
  }
  
  return score + Math.random(); // Add some randomness
}

async function performAITriage(triageData) {
  // This would use the AI engine for more sophisticated triage
  const { patient, currentPresentation } = triageData;
  
  let urgencyLevel = 1;
  let timeframe = '1-2 weeks';
  let appointmentType = 'routine';
  let redFlags = [];
  
  // Simple rule-based triage (would be AI-powered in production)
  if (currentPresentation.symptoms.includes('chest pain')) {
    urgencyLevel = 5;
    timeframe = 'immediate';
    appointmentType = 'emergency';
    redFlags.push('Chest pain requires immediate evaluation');
  } else if (patient.riskScore > 80) {
    urgencyLevel = 3;
    timeframe = '24-48 hours';
    appointmentType = 'urgent';
  }
  
  return {
    urgencyLevel,
    timeframe,
    appointmentType,
    providerSpecialty: getRequiredSpecialty(appointmentType),
    redFlags,
    reasoning: `Based on symptoms and patient risk profile (${patient.riskScore})`,
    nextSteps: generateNextSteps(urgencyLevel)
  };
}

async function predictNoShowRisk(data) {
  const { patient, appointment } = data;
  
  let risk = 0.1; // Base 10% risk
  const factors = [];
  
  // Historical no-show rate
  if (patient.engagement?.appointmentAdherence < 0.7) {
    risk += 0.3;
    factors.push('Low historical appointment adherence');
  }
  
  // Lead time factor
  if (appointment.leadTime > 14) {
    risk += 0.2;
    factors.push('Long lead time increases no-show risk');
  }
  
  // Time of day factor
  if (appointment.timeOfDay < 9 || appointment.timeOfDay > 16) {
    risk += 0.1;
    factors.push('Early morning or late afternoon appointments have higher no-show rates');
  }
  
  const interventions = [];
  if (risk > 0.3) {
    interventions.push('Send additional reminder 24 hours before');
    interventions.push('Call patient to confirm attendance');
  }
  
  return {
    risk: Math.min(0.9, risk),
    factors,
    recommendedInterventions: interventions,
    confidence: 0.75
  };
}

async function generateAdaptiveRouting(data) {
  const { patient, appointmentDetails, availableProviders } = data;
  
  // Score providers based on multiple factors
  const scoredProviders = availableProviders.map(provider => {
    let score = 0;
    
    // Primary provider preference
    if (provider._id.toString() === patient.primaryProvider?.toString()) {
      score += 5;
    }
    
    // Specialty match
    if (provider.specialties?.includes(getRequiredSpecialty(appointmentDetails.type))) {
      score += 3;
    }
    
    // Current workload (mock)
    score += Math.random() * 2;
    
    return { provider, score };
  }).sort((a, b) => b.score - a.score);
  
  return {
    provider: scoredProviders[0]?.provider,
    alternatives: scoredProviders.slice(1, 3).map(p => p.provider),
    reasoning: 'Selected based on specialty match and patient preference',
    waitTime: '15-30 minutes',
    qualityScore: 0.85
  };
}

async function generateBalancePredictions(clinicId, date, providers) {
  // Mock implementation - would analyze historical data and predict demand
  return providers.map(providerId => ({
    providerId,
    predictedDemand: Math.floor(Math.random() * 20) + 10,
    currentCapacity: 25,
    utilizationRate: Math.random() * 0.4 + 0.6,
    recommendedAdjustments: []
  }));
}

function generateBalanceRecommendations(predictions) {
  return predictions.map(p => {
    const recommendations = [];
    
    if (p.utilizationRate > 0.9) {
      recommendations.push('Consider extending hours or adding slots');
    } else if (p.utilizationRate < 0.6) {
      recommendations.push('Capacity available for additional appointments');
    }
    
    return { providerId: p.providerId, recommendations };
  });
}

function calculateOptimalDistribution(predictions) {
  const totalDemand = predictions.reduce((sum, p) => sum + p.predictedDemand, 0);
  const totalCapacity = predictions.reduce((sum, p) => sum + p.currentCapacity, 0);
  
  return {
    overallUtilization: totalDemand / totalCapacity,
    recommendations: totalDemand > totalCapacity * 0.85 ? 
      ['Consider increasing overall capacity'] : 
      ['Current capacity appears adequate']
  };
}

async function generateOptimizationAnalytics(clinicId, startDate, endDate, providerId) {
  // Mock analytics - would query actual appointment data
  return {
    utilization: {
      average: 0.78,
      byProvider: [{ providerId, rate: 0.82 }],
      trend: 'increasing'
    },
    noShows: {
      rate: 0.12,
      trend: 'stable',
      topReasons: ['forgot', 'scheduling conflict', 'illness']
    },
    satisfaction: {
      average: 4.2,
      waitTime: 4.0,
      scheduling: 4.3
    },
    efficiency: {
      averageAppointmentDuration: 28,
      onTimePerformance: 0.85,
      patientThroughput: 18
    },
    recommendations: [
      'Implement automated reminder system to reduce no-shows',
      'Consider adjusting appointment durations based on type'
    ],
    trends: {
      demandPattern: 'Higher demand on Mondays and Fridays',
      seasonality: 'Increased demand during flu season'
    }
  };
}

async function getClinicCapacity(clinicId) {
  // Mock capacity data
  return {
    totalSlots: 200,
    availableSlots: 45,
    utilizationRate: 0.775
  };
}

function getUrgencyLevel(score) {
  if (score >= 4) return 'emergency';
  if (score >= 3) return 'urgent';
  if (score >= 2) return 'semi-urgent';
  return 'routine';
}

function getMaxWaitDays(urgencyScore) {
  const waitDays = { 5: 0, 4: 1, 3: 3, 2: 7, 1: 14 };
  return waitDays[Math.floor(urgencyScore)] || 14;
}

function getRequiredSpecialty(appointmentType) {
  const specialtyMap = {
    'cardiology': 'cardiology',
    'dermatology': 'dermatology',
    'routine': 'family_medicine',
    'physical': 'family_medicine'
  };
  return specialtyMap[appointmentType] || 'family_medicine';
}

function generateSchedulingReasoning(urgencyScore, topProvider, topSlot) {
  return `Recommended based on urgency level ${getUrgencyLevel(urgencyScore)}, provider expertise match, and optimal time slot availability.`;
}

function generateNextSteps(urgencyLevel) {
  const steps = {
    5: ['Immediate medical attention required', 'Consider emergency department'],
    4: ['Schedule within 24 hours', 'Monitor symptoms closely'],
    3: ['Schedule within 2-3 days', 'Provide symptom management guidance'],
    2: ['Schedule within 1 week', 'Patient education materials'],
    1: ['Routine scheduling acceptable', 'Preventive care focus']
  };
  return steps[urgencyLevel] || steps[1];
}

module.exports = router;