const express = require('express');
const router = express.Router();
const EmotionalProfile = require('../models/EmotionalProfile');
const auth = require('../middleware/auth');

/**
 * @route GET /api/trust/dashboard/:userId
 * @desc Get trust dashboard data for a user
 * @access Private
 */
router.get('/dashboard/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = '30d' } = req.query;
    
    const profile = await EmotionalProfile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    // Calculate time range
    const now = new Date();
    const timeRangeMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    };
    
    const startDate = new Date(now.getTime() - (timeRangeMs[timeRange] || timeRangeMs['30d']));
    
    // Filter data by time range
    const filteredTrustJourney = profile.trustJourney.filter(
      entry => entry.timestamp >= startDate
    );
    
    const filteredSentimentHistory = profile.sentimentHistory.filter(
      entry => entry.timestamp >= startDate
    );
    
    const filteredEngagementSignals = profile.interactionPatterns.engagementSignals.filter(
      signal => signal.timestamp >= startDate
    );
    
    // Calculate trust metrics
    const trustMetrics = {
      // Current Trust Index
      currentTrustScore: profile.trustScore,
      trustLevel: profile.trustLevel,
      
      // Trust Velocity (change over time)
      trustVelocity: calculateTrustVelocity(filteredTrustJourney),
      
      // Emotional Resonance Index
      emotionalResonanceIndex: calculateEmotionalResonance(filteredSentimentHistory),
      
      // Comfort Duration
      comfortDuration: calculateComfortDuration(filteredEngagementSignals),
      
      // Emotional Loyalty Score
      emotionalLoyaltyScore: calculateEmotionalLoyalty(profile),
      
      // Trust Paradox Model Progress
      trustParadoxProgress: getTrustParadoxProgress(profile),
      
      // AI Acceptance Over Time
      aiAcceptanceOverTime: calculateAIAcceptance(profile, startDate)
    };
    
    // Generate trust insights
    const insights = {
      trustTrend: analyzeTrustTrend(filteredTrustJourney),
      emotionalStability: analyzeEmotionalStability(filteredSentimentHistory),
      engagementQuality: analyzeEngagementQuality(filteredEngagementSignals),
      riskFactors: identifyRiskFactors(profile),
      opportunities: identifyOpportunities(profile)
    };
    
    // Get recommendations
    const recommendations = generateTrustRecommendations(trustMetrics, insights, profile);
    
    res.json({
      success: true,
      dashboard: {
        metrics: trustMetrics,
        insights,
        recommendations,
        timeRange,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Trust dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to generate trust dashboard',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/trust/metrics/aggregate
 * @desc Get aggregated trust metrics across all users (for admin dashboard)
 * @access Private (Admin)
 */
router.get('/metrics/aggregate', auth, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Get all profiles
    const profiles = await EmotionalProfile.find({});
    
    if (profiles.length === 0) {
      return res.json({
        success: true,
        aggregate: {
          totalUsers: 0,
          averageTrustScore: 0,
          trustDistribution: {},
          emotionalDistribution: {},
          message: 'No user data available'
        }
      });
    }
    
    // Calculate aggregate metrics
    const aggregate = {
      totalUsers: profiles.length,
      
      // Average Trust Score
      averageTrustScore: profiles.reduce((sum, p) => sum + p.trustScore, 0) / profiles.length,
      
      // Trust Distribution
      trustDistribution: {
        high: profiles.filter(p => p.trustScore >= 70).length,
        medium: profiles.filter(p => p.trustScore >= 40 && p.trustScore < 70).length,
        low: profiles.filter(p => p.trustScore < 40).length
      },
      
      // Emotional State Distribution
      emotionalDistribution: profiles.reduce((dist, p) => {
        const emotion = p.emotionalState.primary;
        dist[emotion] = (dist[emotion] || 0) + 1;
        return dist;
      }, {}),
      
      // Trust Level Distribution
      trustLevelDistribution: profiles.reduce((dist, p) => {
        const level = p.trustLevel;
        dist[level] = (dist[level] || 0) + 1;
        return dist;
      }, {}),
      
      // Average AI Interactions
      averageInteractions: profiles.reduce((sum, p) => sum + p.aiInteractions.totalInteractions, 0) / profiles.length,
      
      // Churn Risk Distribution
      churnRiskDistribution: {
        high: profiles.filter(p => p.predictions.churnRisk >= 70).length,
        medium: profiles.filter(p => p.predictions.churnRisk >= 40 && p.predictions.churnRisk < 70).length,
        low: profiles.filter(p => p.predictions.churnRisk < 40).length
      },
      
      // Trust Trends
      trustTrends: calculateAggregateTrustTrends(profiles, timeRange)
    };
    
    res.json({
      success: true,
      aggregate,
      timeRange,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Aggregate metrics error:', error);
    res.status(500).json({ 
      error: 'Failed to generate aggregate metrics',
      message: error.message 
    });
  }
});

/**
 * @route POST /api/trust/feedback
 * @desc Record trust feedback from user
 * @access Private
 */
router.post('/feedback', auth, async (req, res) => {
  try {
    const { userId, trustRating, feedback, context } = req.body;
    
    if (!userId || typeof trustRating !== 'number') {
      return res.status(400).json({ error: 'userId and trustRating are required' });
    }
    
    let profile = await EmotionalProfile.findOne({ userId });
    
    if (!profile) {
      profile = new EmotionalProfile({ userId });
    }
    
    // Convert rating to trust score adjustment
    const currentScore = profile.trustScore;
    const targetScore = (trustRating / 5) * 100; // Assuming 1-5 rating scale
    const adjustment = (targetScore - currentScore) * 0.3; // Gradual adjustment
    
    // Update trust score
    await profile.updateTrustScore(adjustment, `User feedback: ${trustRating}/5 - ${context || 'General feedback'}`);
    
    // Add sentiment data if feedback text provided
    if (feedback) {
      const EmotionAI = require('../services/EmotionAI');
      const emotionAI = new EmotionAI();
      const analysis = await emotionAI.analyzeEmotion(feedback, 'feedback');
      
      await profile.addSentimentData('feedback', feedback, analysis.sentiment);
    }
    
    res.json({
      success: true,
      message: 'Trust feedback recorded successfully',
      newTrustScore: profile.trustScore,
      adjustment: Math.round(adjustment * 100) / 100
    });
    
  } catch (error) {
    console.error('Trust feedback error:', error);
    res.status(500).json({ 
      error: 'Failed to record trust feedback',
      message: error.message 
    });
  }
});

// Helper functions

function calculateTrustVelocity(trustJourney) {
  if (trustJourney.length < 2) return 0;
  
  const recent = trustJourney.slice(-5); // Last 5 entries
  if (recent.length < 2) return 0;
  
  const timeSpan = recent[recent.length - 1].timestamp - recent[0].timestamp;
  const scoreChange = recent[recent.length - 1].trustScore - recent[0].trustScore;
  
  // Return change per day
  return timeSpan > 0 ? (scoreChange / (timeSpan / (24 * 60 * 60 * 1000))) : 0;
}

function calculateEmotionalResonance(sentimentHistory) {
  if (sentimentHistory.length === 0) return 0;
  
  const positiveCount = sentimentHistory.filter(s => s.sentiment.polarity > 0.1).length;
  const totalCount = sentimentHistory.length;
  
  return (positiveCount / totalCount) * 100;
}

function calculateComfortDuration(engagementSignals) {
  if (engagementSignals.length === 0) return 0;
  
  const totalDuration = engagementSignals.reduce((sum, signal) => sum + (signal.intensity * 1000), 0);
  return totalDuration / engagementSignals.length;
}

function calculateEmotionalLoyalty(profile) {
  const trustScore = profile.trustScore;
  const interactionCount = profile.aiInteractions.totalInteractions;
  const positiveRatio = interactionCount > 0 ? 
    profile.aiInteractions.positiveInteractions / interactionCount : 0;
  
  return (trustScore * 0.4) + (positiveRatio * 40) + (Math.min(interactionCount, 50) * 0.2);
}

function getTrustParadoxProgress(profile) {
  const levels = ['awareness', 'engagement', 'empowerment', 'relationship'];
  const currentIndex = levels.indexOf(profile.trustLevel);
  
  return {
    currentLevel: profile.trustLevel,
    progress: ((currentIndex + 1) / levels.length) * 100,
    nextLevel: currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
  };
}

function calculateAIAcceptance(profile, startDate) {
  const recentInteractions = profile.aiInteractions.totalInteractions;
  const positiveRatio = recentInteractions > 0 ? 
    profile.aiInteractions.positiveInteractions / recentInteractions : 0;
  
  return {
    acceptanceScore: (positiveRatio * 100),
    interactionCount: recentInteractions,
    trend: profile.trustScore > 50 ? 'increasing' : 'stable'
  };
}

function analyzeTrustTrend(trustJourney) {
  if (trustJourney.length < 3) return 'insufficient_data';
  
  const recent = trustJourney.slice(-3);
  const scores = recent.map(entry => entry.trustScore);
  
  if (scores[2] > scores[1] && scores[1] > scores[0]) return 'increasing';
  if (scores[2] < scores[1] && scores[1] < scores[0]) return 'decreasing';
  return 'stable';
}

function analyzeEmotionalStability(sentimentHistory) {
  if (sentimentHistory.length < 5) return 'insufficient_data';
  
  const polarities = sentimentHistory.slice(-10).map(s => s.sentiment.polarity);
  const variance = calculateVariance(polarities);
  
  if (variance < 0.1) return 'very_stable';
  if (variance < 0.3) return 'stable';
  if (variance < 0.6) return 'moderate';
  return 'unstable';
}

function calculateVariance(values) {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

function analyzeEngagementQuality(engagementSignals) {
  if (engagementSignals.length === 0) return 'no_data';
  
  const avgIntensity = engagementSignals.reduce((sum, s) => sum + s.intensity, 0) / engagementSignals.length;
  
  if (avgIntensity >= 7) return 'high';
  if (avgIntensity >= 4) return 'medium';
  return 'low';
}

function identifyRiskFactors(profile) {
  const risks = [];
  
  if (profile.trustScore < 30) {
    risks.push({ type: 'low_trust', severity: 'high', description: 'Trust score below 30' });
  }
  
  if (profile.predictions.churnRisk > 70) {
    risks.push({ type: 'churn_risk', severity: 'high', description: 'High probability of churn' });
  }
  
  if (profile.interactionPatterns.hesitationMarkers.length > 5) {
    risks.push({ type: 'hesitation', severity: 'medium', description: 'Frequent hesitation detected' });
  }
  
  return risks;
}

function identifyOpportunities(profile) {
  const opportunities = [];
  
  if (profile.trustScore > 70) {
    opportunities.push({ type: 'upsell', description: 'High trust - ready for advanced features' });
  }
  
  if (profile.aiInteractions.positiveInteractions > profile.aiInteractions.negativeInteractions * 2) {
    opportunities.push({ type: 'advocacy', description: 'Positive experience - potential advocate' });
  }
  
  return opportunities;
}

function generateTrustRecommendations(metrics, insights, profile) {
  const recommendations = [];
  
  if (metrics.currentTrustScore < 40) {
    recommendations.push({
      priority: 'high',
      category: 'trust_building',
      action: 'Implement transparency initiatives',
      reason: 'Low trust score requires immediate attention'
    });
  }
  
  if (insights.trustTrend === 'decreasing') {
    recommendations.push({
      priority: 'high',
      category: 'retention',
      action: 'Proactive outreach with empathetic messaging',
      reason: 'Declining trust trend detected'
    });
  }
  
  if (metrics.emotionalResonanceIndex < 30) {
    recommendations.push({
      priority: 'medium',
      category: 'engagement',
      action: 'Adjust communication tone and frequency',
      reason: 'Low emotional resonance'
    });
  }
  
  return recommendations;
}

function calculateAggregateTrustTrends(profiles, timeRange) {
  // Simplified aggregate trend calculation
  const avgTrustScore = profiles.reduce((sum, p) => sum + p.trustScore, 0) / profiles.length;
  
  return {
    averageTrustScore: Math.round(avgTrustScore * 100) / 100,
    trend: avgTrustScore > 50 ? 'positive' : 'needs_attention',
    distribution: {
      high_trust: profiles.filter(p => p.trustScore >= 70).length,
      medium_trust: profiles.filter(p => p.trustScore >= 40 && p.trustScore < 70).length,
      low_trust: profiles.filter(p => p.trustScore < 40).length
    }
  };
}

module.exports = router;