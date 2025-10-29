const express = require('express');
const router = express.Router();
const EmotionAI = require('../services/EmotionAI');
const EmotionalProfile = require('../models/EmotionalProfile');
const auth = require('../middleware/auth');

const emotionAI = new EmotionAI();

/**
 * @route POST /api/emotion/analyze
 * @desc Analyze emotional content from text
 * @access Private
 */
router.post('/analyze', auth, async (req, res) => {
  try {
    const { text, source = 'manual', userId } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required for analysis' });
    }
    
    // Perform emotion analysis
    const analysis = await emotionAI.analyzeEmotion(text, source);
    
    // Update user's emotional profile if userId provided
    if (userId) {
      let profile = await EmotionalProfile.findOne({ userId });
      
      if (!profile) {
        profile = new EmotionalProfile({ userId });
      }
      
      // Add sentiment data to profile
      await profile.addSentimentData(source, text, analysis.sentiment);
      
      // Update trust score based on analysis
      const trustImpact = analysis.trustSignals.score;
      if (trustImpact !== 0) {
        await profile.updateTrustScore(trustImpact, `Emotion analysis: ${source}`);
      }
      
      // Update emotional state
      const primaryEmotion = Object.keys(analysis.emotions).reduce((a, b) => 
        analysis.emotions[a] > analysis.emotions[b] ? a : b
      );
      
      profile.emotionalState.primary = primaryEmotion;
      profile.emotionalState.intensity = Math.round(analysis.emotions[primaryEmotion] * 10);
      
      await profile.save();
    }
    
    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Emotion analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze emotion',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/emotion/profile/:userId
 * @desc Get emotional profile for a user
 * @access Private
 */
router.get('/profile/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    let profile = await EmotionalProfile.findOne({ userId }).populate('userId', 'name email');
    
    if (!profile) {
      // Create default profile
      profile = new EmotionalProfile({ userId });
      await profile.save();
    }
    
    // Get recommendations
    const recommendations = profile.getRecommendations();
    
    res.json({
      success: true,
      profile: {
        ...profile.toObject(),
        recommendations
      }
    });
    
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve emotional profile',
      message: error.message 
    });
  }
});

/**
 * @route PUT /api/emotion/profile/:userId/trust
 * @desc Update trust score for a user
 * @access Private
 */
router.put('/profile/:userId/trust', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { delta, reason } = req.body;
    
    if (typeof delta !== 'number') {
      return res.status(400).json({ error: 'Delta must be a number' });
    }
    
    let profile = await EmotionalProfile.findOne({ userId });
    
    if (!profile) {
      profile = new EmotionalProfile({ userId });
    }
    
    await profile.updateTrustScore(delta, reason || 'Manual update');
    
    res.json({
      success: true,
      newTrustScore: profile.trustScore,
      message: 'Trust score updated successfully'
    });
    
  } catch (error) {
    console.error('Trust score update error:', error);
    res.status(500).json({ 
      error: 'Failed to update trust score',
      message: error.message 
    });
  }
});

/**
 * @route POST /api/emotion/interaction
 * @desc Record user interaction for emotional analysis
 * @access Private
 */
router.post('/interaction', auth, async (req, res) => {
  try {
    const { 
      userId, 
      interactionType, 
      duration, 
      context, 
      sentiment,
      hesitationTime 
    } = req.body;
    
    let profile = await EmotionalProfile.findOne({ userId });
    
    if (!profile) {
      profile = new EmotionalProfile({ userId });
    }
    
    // Record interaction
    profile.aiInteractions.totalInteractions += 1;
    profile.aiInteractions.lastInteraction = new Date();
    
    if (duration) {
      const currentAvg = profile.aiInteractions.averageSessionDuration;
      const totalSessions = profile.aiInteractions.totalInteractions;
      profile.aiInteractions.averageSessionDuration = 
        (currentAvg * (totalSessions - 1) + duration) / totalSessions;
    }
    
    // Record engagement signals
    if (interactionType && duration) {
      profile.interactionPatterns.engagementSignals.push({
        timestamp: new Date(),
        type: interactionType,
        intensity: Math.min(10, duration / 1000), // Convert to intensity scale
        context: context || 'Unknown'
      });
    }
    
    // Record hesitation if detected
    if (hesitationTime && hesitationTime > 2000) { // More than 2 seconds
      profile.interactionPatterns.hesitationMarkers.push({
        timestamp: new Date(),
        action: interactionType || 'unknown',
        hesitationDuration: hesitationTime,
        context: context || 'Unknown'
      });
    }
    
    // Update sentiment if positive/negative
    if (sentiment) {
      if (sentiment > 0.5) {
        profile.aiInteractions.positiveInteractions += 1;
      } else if (sentiment < -0.5) {
        profile.aiInteractions.negativeInteractions += 1;
      }
    }
    
    await profile.save();
    
    res.json({
      success: true,
      message: 'Interaction recorded successfully',
      profileUpdate: {
        trustScore: profile.trustScore,
        totalInteractions: profile.aiInteractions.totalInteractions
      }
    });
    
  } catch (error) {
    console.error('Interaction recording error:', error);
    res.status(500).json({ 
      error: 'Failed to record interaction',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/emotion/insights/:userId
 * @desc Get emotional insights and recommendations for a user
 * @access Private
 */
router.get('/insights/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await EmotionalProfile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Emotional profile not found' });
    }
    
    // Calculate insights
    const insights = {
      trustTrend: profile.trustJourney.slice(-10).map(entry => ({
        date: entry.timestamp,
        score: entry.trustScore
      })),
      
      emotionalPattern: {
        dominant: profile.emotionalState.primary,
        intensity: profile.emotionalState.intensity,
        stability: profile.sentimentHistory.length > 5 ? 
          this.calculateEmotionalStability(profile.sentimentHistory) : 'insufficient_data'
      },
      
      engagementMetrics: {
        totalInteractions: profile.aiInteractions.totalInteractions,
        positiveRatio: profile.aiInteractions.totalInteractions > 0 ? 
          profile.aiInteractions.positiveInteractions / profile.aiInteractions.totalInteractions : 0,
        averageSessionDuration: profile.aiInteractions.averageSessionDuration
      },
      
      riskFactors: {
        churnRisk: profile.predictions.churnRisk,
        trustDecline: profile.trustJourney.length > 1 ? 
          profile.trustJourney[profile.trustJourney.length - 1].trustScore < 
          profile.trustJourney[profile.trustJourney.length - 2].trustScore : false,
        hesitationIncrease: profile.interactionPatterns.hesitationMarkers.length > 3
      },
      
      recommendations: profile.getRecommendations(),
      
      nextBestActions: this.generateNextBestActions(profile)
    };
    
    res.json({
      success: true,
      insights
    });
    
  } catch (error) {
    console.error('Insights generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate insights',
      message: error.message 
    });
  }
});

/**
 * Helper function to calculate emotional stability
 */
function calculateEmotionalStability(sentimentHistory) {
  if (sentimentHistory.length < 5) return 'insufficient_data';
  
  const recentSentiments = sentimentHistory.slice(-10).map(s => s.sentiment.polarity);
  const variance = this.calculateVariance(recentSentiments);
  
  if (variance < 0.1) return 'very_stable';
  if (variance < 0.3) return 'stable';
  if (variance < 0.6) return 'moderate';
  return 'unstable';
}

/**
 * Helper function to calculate variance
 */
function calculateVariance(values) {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Helper function to generate next best actions
 */
function generateNextBestActions(profile) {
  const actions = [];
  
  if (profile.trustScore < 40) {
    actions.push({
      action: 'Send empathetic validation message',
      priority: 'high',
      timing: 'immediate'
    });
  }
  
  if (profile.interactionPatterns.hesitationMarkers.length > 2) {
    actions.push({
      action: 'Offer human support option',
      priority: 'medium',
      timing: 'next_interaction'
    });
  }
  
  if (profile.trustScore > 70) {
    actions.push({
      action: 'Introduce advanced AI features',
      priority: 'low',
      timing: 'when_appropriate'
    });
  }
  
  return actions;
}

module.exports = router;