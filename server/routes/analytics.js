const express = require('express');
const router = express.Router();
const EmotionalProfile = require('../models/EmotionalProfile');
const auth = require('../middleware/auth');

/**
 * @route GET /api/analytics/overview
 * @desc Get comprehensive analytics overview
 * @access Private (Admin)
 */
router.get('/overview', auth, async (req, res) => {
  try {
    const { timeRange = '30d', segment } = req.query;
    
    // Calculate time range
    const now = new Date();
    const timeRangeMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    };
    
    const startDate = new Date(now.getTime() - (timeRangeMs[timeRange] || timeRangeMs['30d']));
    
    // Get all profiles
    let query = {};
    if (segment) {
      switch (segment) {
        case 'high_trust':
          query.trustScore = { $gte: 70 };
          break;
        case 'medium_trust':
          query.trustScore = { $gte: 40, $lt: 70 };
          break;
        case 'low_trust':
          query.trustScore = { $lt: 40 };
          break;
        case 'high_risk':
          query['predictions.churnRisk'] = { $gte: 70 };
          break;
      }
    }
    
    const profiles = await EmotionalProfile.find(query);
    
    // Calculate comprehensive analytics
    const analytics = {
      // Executive Summary
      summary: {
        totalUsers: profiles.length,
        averageTrustScore: calculateAverage(profiles.map(p => p.trustScore)),
        trustTrend: calculateTrustTrend(profiles, startDate),
        emotionalHealthScore: calculateEmotionalHealthScore(profiles),
        aiAcceptanceRate: calculateAIAcceptanceRate(profiles)
      },
      
      // Trust Metrics (New KPIs from EIME™)
      trustMetrics: {
        emotionalTrustIndex: calculateEmotionalTrustIndex(profiles),
        transparencyEffectiveness: calculateTransparencyEffectiveness(profiles),
        aiAcceptanceOverTime: calculateAIAcceptanceOverTime(profiles, startDate),
        psychologicalSafetyScore: calculatePsychologicalSafetyScore(profiles)
      },
      
      // Emotional Intelligence Metrics
      emotionalMetrics: {
        emotionalResonanceIndex: calculateEmotionalResonanceIndex(profiles),
        trustVelocity: calculateTrustVelocity(profiles),
        comfortDuration: calculateComfortDuration(profiles),
        emotionalLoyaltyScore: calculateEmotionalLoyaltyScore(profiles)
      },
      
      // Behavioral Analytics
      behavioralAnalytics: {
        engagementPatterns: analyzeEngagementPatterns(profiles),
        hesitationAnalysis: analyzeHesitationPatterns(profiles),
        interactionQuality: analyzeInteractionQuality(profiles),
        featureAdoption: analyzeFeatureAdoption(profiles)
      },
      
      // Segmentation Analysis
      segmentation: {
        trustLevelDistribution: calculateTrustDistribution(profiles),
        emotionalStateDistribution: calculateEmotionalDistribution(profiles),
        trustParadoxLevels: calculateTrustParadoxDistribution(profiles),
        riskSegmentation: calculateRiskSegmentation(profiles)
      },
      
      // Predictive Analytics
      predictions: {
        churnRiskAnalysis: analyzeChurnRisk(profiles),
        upsellOpportunities: identifyUpsellOpportunities(profiles),
        advocacyPotential: calculateAdvocacyPotential(profiles),
        trustDeclineAlerts: identifyTrustDeclineAlerts(profiles)
      },
      
      // Therapeutic Framework Effectiveness
      therapeuticEffectiveness: {
        validationSuccess: calculateValidationSuccess(profiles),
        empathyResonance: calculateEmpathyResonance(profiles),
        psychologicalSafetyImpact: calculatePsychologicalSafetyImpact(profiles),
        collaborativeEngagement: calculateCollaborativeEngagement(profiles)
      }
    };
    
    res.json({
      success: true,
      analytics,
      timeRange,
      segment,
      generatedAt: new Date().toISOString(),
      dataPoints: profiles.length
    });
    
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ 
      error: 'Failed to generate analytics overview',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/analytics/trust-journey
 * @desc Analyze trust journey patterns across users
 * @access Private (Admin)
 */
router.get('/trust-journey', auth, async (req, res) => {
  try {
    const { cohort, timeRange = '90d' } = req.query;
    
    const profiles = await EmotionalProfile.find({});
    
    const journeyAnalysis = {
      // Trust Paradox Model Analysis
      trustParadoxProgression: analyzeTrustParadoxProgression(profiles),
      
      // Journey Stage Analysis
      stageAnalysis: {
        awareness: analyzeAwarenessStage(profiles),
        engagement: analyzeEngagementStage(profiles),
        empowerment: analyzeEmpowermentStage(profiles),
        relationship: analyzeRelationshipStage(profiles)
      },
      
      // Conversion Funnel
      trustFunnel: calculateTrustFunnel(profiles),
      
      // Journey Velocity
      journeyVelocity: calculateJourneyVelocity(profiles),
      
      // Drop-off Analysis
      dropOffAnalysis: analyzeDropOffPoints(profiles),
      
      // Success Patterns
      successPatterns: identifySuccessPatterns(profiles)
    };
    
    res.json({
      success: true,
      journeyAnalysis,
      cohort,
      timeRange
    });
    
  } catch (error) {
    console.error('Trust journey analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze trust journey',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/analytics/emotional-intelligence
 * @desc Get emotional intelligence effectiveness metrics
 * @access Private (Admin)
 */
router.get('/emotional-intelligence', auth, async (req, res) => {
  try {
    const profiles = await EmotionalProfile.find({});
    
    const eiAnalytics = {
      // Emotion Detection Accuracy
      emotionDetection: {
        accuracy: calculateEmotionDetectionAccuracy(profiles),
        coverage: calculateEmotionCoverage(profiles),
        sensitivity: calculateEmotionSensitivity(profiles)
      },
      
      // Therapeutic Response Effectiveness
      therapeuticEffectiveness: {
        validationImpact: calculateValidationImpact(profiles),
        empathyResonance: calculateEmpathyResonance(profiles),
        safetyBuilding: calculateSafetyBuilding(profiles),
        collaborationSuccess: calculateCollaborationSuccess(profiles)
      },
      
      // Emotional Journey Mapping
      emotionalJourneys: mapEmotionalJourneys(profiles),
      
      // AI-Human Trust Bridge
      trustBridge: {
        aiAcceptanceProgression: calculateAIAcceptanceProgression(profiles),
        humanizationEffectiveness: calculateHumanizationEffectiveness(profiles),
        empathyGapReduction: calculateEmpathyGapReduction(profiles)
      }
    };
    
    res.json({
      success: true,
      eiAnalytics
    });
    
  } catch (error) {
    console.error('EI analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to generate EI analytics',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/analytics/recommendations
 * @desc Get AI-powered recommendations for improving emotional intelligence
 * @access Private (Admin)
 */
router.get('/recommendations', auth, async (req, res) => {
  try {
    const profiles = await EmotionalProfile.find({});
    
    const recommendations = {
      // Strategic Recommendations
      strategic: generateStrategicRecommendations(profiles),
      
      // Tactical Improvements
      tactical: generateTacticalRecommendations(profiles),
      
      // Individual User Actions
      userActions: generateUserActionRecommendations(profiles),
      
      // Platform Optimizations
      platformOptimizations: generatePlatformOptimizations(profiles),
      
      // Content Strategy
      contentStrategy: generateContentStrategy(profiles)
    };
    
    res.json({
      success: true,
      recommendations
    });
    
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      message: error.message 
    });
  }
});

// Helper Functions

function calculateAverage(values) {
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
}

function calculateTrustTrend(profiles, startDate) {
  const recentProfiles = profiles.filter(p => 
    p.trustJourney.some(entry => entry.timestamp >= startDate)
  );
  
  if (recentProfiles.length === 0) return 'no_data';
  
  let increasing = 0;
  let decreasing = 0;
  
  recentProfiles.forEach(profile => {
    const recentJourney = profile.trustJourney
      .filter(entry => entry.timestamp >= startDate)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    if (recentJourney.length >= 2) {
      const first = recentJourney[0].trustScore;
      const last = recentJourney[recentJourney.length - 1].trustScore;
      
      if (last > first) increasing++;
      else if (last < first) decreasing++;
    }
  });
  
  if (increasing > decreasing) return 'increasing';
  if (decreasing > increasing) return 'decreasing';
  return 'stable';
}

function calculateEmotionalHealthScore(profiles) {
  if (profiles.length === 0) return 0;
  
  const healthFactors = profiles.map(profile => {
    const trustScore = profile.trustScore;
    const emotionalStability = calculateEmotionalStability(profile);
    const engagementQuality = calculateEngagementQuality(profile);
    
    return (trustScore * 0.4) + (emotionalStability * 0.3) + (engagementQuality * 0.3);
  });
  
  return calculateAverage(healthFactors);
}

function calculateAIAcceptanceRate(profiles) {
  if (profiles.length === 0) return 0;
  
  const acceptanceScores = profiles.map(profile => {
    const totalInteractions = profile.aiInteractions.totalInteractions;
    const positiveRatio = totalInteractions > 0 ? 
      profile.aiInteractions.positiveInteractions / totalInteractions : 0;
    
    return (profile.trustScore * 0.6) + (positiveRatio * 40);
  });
  
  return calculateAverage(acceptanceScores);
}

function calculateEmotionalTrustIndex(profiles) {
  // EIME™ specific metric combining trust and emotional resonance
  return profiles.map(profile => {
    const trustScore = profile.trustScore;
    const emotionalResonance = calculateIndividualEmotionalResonance(profile);
    const therapeuticAlignment = calculateTherapeuticAlignment(profile);
    
    return (trustScore * 0.5) + (emotionalResonance * 0.3) + (therapeuticAlignment * 0.2);
  }).reduce((sum, score) => sum + score, 0) / Math.max(1, profiles.length);
}

function calculateTransparencyEffectiveness(profiles) {
  const transparencyProfiles = profiles.filter(p => 
    p.communicationStyle.transparencyLevel === 'high' || 
    p.communicationStyle.transparencyLevel === 'maximum'
  );
  
  if (transparencyProfiles.length === 0) return 0;
  
  return calculateAverage(transparencyProfiles.map(p => p.trustScore));
}

function calculateAIAcceptanceOverTime(profiles, startDate) {
  const timeSeriesData = [];
  const dayMs = 24 * 60 * 60 * 1000;
  
  for (let date = new Date(startDate); date <= new Date(); date.setTime(date.getTime() + dayMs)) {
    const dayProfiles = profiles.filter(p => 
      p.aiInteractions.lastInteraction && 
      p.aiInteractions.lastInteraction.toDateString() === date.toDateString()
    );
    
    if (dayProfiles.length > 0) {
      const avgAcceptance = calculateAverage(dayProfiles.map(p => 
        p.aiInteractions.totalInteractions > 0 ? 
          (p.aiInteractions.positiveInteractions / p.aiInteractions.totalInteractions) * 100 : 0
      ));
      
      timeSeriesData.push({
        date: date.toISOString().split('T')[0],
        acceptance: avgAcceptance,
        userCount: dayProfiles.length
      });
    }
  }
  
  return timeSeriesData;
}

function calculatePsychologicalSafetyScore(profiles) {
  return profiles.map(profile => {
    const safetyIndicators = [
      profile.emotionalNeeds.safety,
      profile.trustScore / 10,
      10 - (profile.interactionPatterns.hesitationMarkers.length || 0),
      profile.aiInteractions.totalInteractions > 0 ? 
        (profile.aiInteractions.positiveInteractions / profile.aiInteractions.totalInteractions) * 10 : 5
    ];
    
    return calculateAverage(safetyIndicators);
  }).reduce((sum, score) => sum + score, 0) / Math.max(1, profiles.length);
}

function calculateEmotionalResonanceIndex(profiles) {
  return profiles.map(profile => {
    const recentSentiments = profile.sentimentHistory.slice(-10);
    if (recentSentiments.length === 0) return 50;
    
    const positiveCount = recentSentiments.filter(s => s.sentiment.polarity > 0.1).length;
    return (positiveCount / recentSentiments.length) * 100;
  }).reduce((sum, score) => sum + score, 0) / Math.max(1, profiles.length);
}

function calculateTrustVelocity(profiles) {
  const velocities = profiles.map(profile => {
    const journey = profile.trustJourney;
    if (journey.length < 2) return 0;
    
    const recent = journey.slice(-5);
    const timeSpan = recent[recent.length - 1].timestamp - recent[0].timestamp;
    const scoreChange = recent[recent.length - 1].trustScore - recent[0].trustScore;
    
    return timeSpan > 0 ? (scoreChange / (timeSpan / (24 * 60 * 60 * 1000))) : 0;
  });
  
  return calculateAverage(velocities);
}

function calculateComfortDuration(profiles) {
  const durations = profiles.map(profile => {
    const signals = profile.interactionPatterns.engagementSignals;
    if (signals.length === 0) return 0;
    
    return signals.reduce((sum, signal) => sum + (signal.intensity * 1000), 0) / signals.length;
  });
  
  return calculateAverage(durations);
}

function calculateEmotionalLoyaltyScore(profiles) {
  return profiles.map(profile => {
    const trustScore = profile.trustScore;
    const interactionCount = profile.aiInteractions.totalInteractions;
    const positiveRatio = interactionCount > 0 ? 
      profile.aiInteractions.positiveInteractions / interactionCount : 0;
    
    return (trustScore * 0.4) + (positiveRatio * 40) + (Math.min(interactionCount, 50) * 0.2);
  }).reduce((sum, score) => sum + score, 0) / Math.max(1, profiles.length);
}

// Additional helper functions would continue here...
// For brevity, I'll include a few key ones:

function analyzeEngagementPatterns(profiles) {
  const patterns = {
    highEngagement: profiles.filter(p => calculateEngagementScore(p) > 7).length,
    mediumEngagement: profiles.filter(p => {
      const score = calculateEngagementScore(p);
      return score >= 4 && score <= 7;
    }).length,
    lowEngagement: profiles.filter(p => calculateEngagementScore(p) < 4).length
  };
  
  return {
    distribution: patterns,
    trends: analyzeEngagementTrends(profiles)
  };
}

function calculateEngagementScore(profile) {
  const signals = profile.interactionPatterns.engagementSignals;
  if (signals.length === 0) return 0;
  
  return signals.reduce((sum, s) => sum + s.intensity, 0) / signals.length;
}

function analyzeHesitationPatterns(profiles) {
  const hesitationData = profiles.map(profile => ({
    userId: profile.userId,
    hesitationCount: profile.interactionPatterns.hesitationMarkers.length,
    avgHesitationDuration: calculateAverage(
      profile.interactionPatterns.hesitationMarkers.map(h => h.hesitationDuration)
    ),
    commonTriggers: getCommonHesitationTriggers(profile.interactionPatterns.hesitationMarkers)
  }));
  
  return {
    overallHesitationRate: calculateAverage(hesitationData.map(d => d.hesitationCount)),
    avgHesitationDuration: calculateAverage(hesitationData.map(d => d.avgHesitationDuration)),
    commonTriggers: aggregateHesitationTriggers(hesitationData)
  };
}

function getCommonHesitationTriggers(hesitationMarkers) {
  const triggers = {};
  hesitationMarkers.forEach(marker => {
    triggers[marker.context] = (triggers[marker.context] || 0) + 1;
  });
  
  return Object.entries(triggers)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([trigger, count]) => ({ trigger, count }));
}

function calculateEmotionalStability(profile) {
  const sentiments = profile.sentimentHistory.slice(-10);
  if (sentiments.length < 3) return 5; // Default neutral
  
  const polarities = sentiments.map(s => s.sentiment.polarity);
  const variance = calculateVariance(polarities);
  
  // Convert variance to stability score (lower variance = higher stability)
  return Math.max(0, Math.min(10, 10 - (variance * 10)));
}

function calculateVariance(values) {
  if (values.length === 0) return 0;
  const mean = calculateAverage(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return calculateAverage(squaredDiffs);
}

function calculateEngagementQuality(profile) {
  const totalInteractions = profile.aiInteractions.totalInteractions;
  if (totalInteractions === 0) return 5; // Default neutral
  
  const positiveRatio = profile.aiInteractions.positiveInteractions / totalInteractions;
  const engagementSignals = profile.interactionPatterns.engagementSignals;
  const avgIntensity = engagementSignals.length > 0 ? 
    calculateAverage(engagementSignals.map(s => s.intensity)) : 5;
  
  return (positiveRatio * 5) + (avgIntensity * 0.5);
}

// Placeholder functions for remaining analytics
function calculateIndividualEmotionalResonance(profile) {
  // Implementation for individual emotional resonance calculation
  return 50; // Placeholder
}

function calculateTherapeuticAlignment(profile) {
  // Implementation for therapeutic alignment calculation
  return 50; // Placeholder
}

function analyzeTrustParadoxProgression(profiles) {
  // Implementation for trust paradox progression analysis
  return {}; // Placeholder
}

function analyzeAwarenessStage(profiles) {
  return profiles.filter(p => p.trustLevel === 'awareness').length;
}

function analyzeEngagementStage(profiles) {
  return profiles.filter(p => p.trustLevel === 'engagement').length;
}

function analyzeEmpowermentStage(profiles) {
  return profiles.filter(p => p.trustLevel === 'empowerment').length;
}

function analyzeRelationshipStage(profiles) {
  return profiles.filter(p => p.trustLevel === 'relationship').length;
}

function calculateTrustFunnel(profiles) {
  return {
    awareness: profiles.filter(p => p.trustLevel === 'awareness').length,
    engagement: profiles.filter(p => p.trustLevel === 'engagement').length,
    empowerment: profiles.filter(p => p.trustLevel === 'empowerment').length,
    relationship: profiles.filter(p => p.trustLevel === 'relationship').length
  };
}

function calculateJourneyVelocity(profiles) {
  // Implementation for journey velocity calculation
  return 0; // Placeholder
}

function analyzeDropOffPoints(profiles) {
  // Implementation for drop-off analysis
  return []; // Placeholder
}

function identifySuccessPatterns(profiles) {
  // Implementation for success pattern identification
  return []; // Placeholder
}

function calculateTrustDistribution(profiles) {
  return {
    high: profiles.filter(p => p.trustScore >= 70).length,
    medium: profiles.filter(p => p.trustScore >= 40 && p.trustScore < 70).length,
    low: profiles.filter(p => p.trustScore < 40).length
  };
}

function calculateEmotionalDistribution(profiles) {
  const distribution = {};
  profiles.forEach(profile => {
    const emotion = profile.emotionalState.primary;
    distribution[emotion] = (distribution[emotion] || 0) + 1;
  });
  return distribution;
}

function calculateTrustParadoxDistribution(profiles) {
  return {
    awareness: profiles.filter(p => p.trustLevel === 'awareness').length,
    engagement: profiles.filter(p => p.trustLevel === 'engagement').length,
    empowerment: profiles.filter(p => p.trustLevel === 'empowerment').length,
    relationship: profiles.filter(p => p.trustLevel === 'relationship').length
  };
}

function calculateRiskSegmentation(profiles) {
  return {
    high_risk: profiles.filter(p => p.predictions.churnRisk >= 70).length,
    medium_risk: profiles.filter(p => p.predictions.churnRisk >= 40 && p.predictions.churnRisk < 70).length,
    low_risk: profiles.filter(p => p.predictions.churnRisk < 40).length
  };
}

// Additional placeholder functions for comprehensive analytics
function analyzeChurnRisk(profiles) { return {}; }
function identifyUpsellOpportunities(profiles) { return []; }
function calculateAdvocacyPotential(profiles) { return 0; }
function identifyTrustDeclineAlerts(profiles) { return []; }
function calculateValidationSuccess(profiles) { return 0; }
function calculateEmpathyResonance(profiles) { return 0; }
function calculatePsychologicalSafetyImpact(profiles) { return 0; }
function calculateCollaborativeEngagement(profiles) { return 0; }
function calculateEmotionDetectionAccuracy(profiles) { return 0; }
function calculateEmotionCoverage(profiles) { return 0; }
function calculateEmotionSensitivity(profiles) { return 0; }
function calculateValidationImpact(profiles) { return 0; }
function calculateSafetyBuilding(profiles) { return 0; }
function calculateCollaborationSuccess(profiles) { return 0; }
function mapEmotionalJourneys(profiles) { return []; }
function calculateAIAcceptanceProgression(profiles) { return 0; }
function calculateHumanizationEffectiveness(profiles) { return 0; }
function calculateEmpathyGapReduction(profiles) { return 0; }
function generateStrategicRecommendations(profiles) { return []; }
function generateTacticalRecommendations(profiles) { return []; }
function generateUserActionRecommendations(profiles) { return []; }
function generatePlatformOptimizations(profiles) { return []; }
function generateContentStrategy(profiles) { return []; }
function analyzeEngagementTrends(profiles) { return {}; }
function aggregateHesitationTriggers(hesitationData) { return []; }

module.exports = router;