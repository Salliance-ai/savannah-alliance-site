const express = require('express');
const router = express.Router();
const TherapistFramework = require('../services/TherapistFramework');
const EmotionalProfile = require('../models/EmotionalProfile');
const auth = require('../middleware/auth');

const therapistFramework = new TherapistFramework();

/**
 * @route POST /api/ai/therapeutic-response
 * @desc Generate therapeutic marketing response using EIME™ framework
 * @access Private
 */
router.post('/therapeutic-response', auth, async (req, res) => {
  try {
    const { userInput, userId, context = {} } = req.body;
    
    if (!userInput) {
      return res.status(400).json({ error: 'User input is required' });
    }
    
    // Get or create emotional profile
    let emotionalProfile = await EmotionalProfile.findOne({ userId });
    if (!emotionalProfile) {
      emotionalProfile = new EmotionalProfile({ userId });
      await emotionalProfile.save();
    }
    
    // Generate therapeutic response
    const therapeuticResponse = await therapistFramework.generateTherapeuticResponse(
      userInput,
      emotionalProfile,
      context
    );
    
    // Update emotional profile based on interaction
    if (therapeuticResponse.emotionalAnalysis) {
      await emotionalProfile.addSentimentData(
        context.source || 'ai_interaction',
        userInput,
        therapeuticResponse.emotionalAnalysis.sentiment
      );
      
      // Update trust score based on predicted impact
      if (therapeuticResponse.trustImpact !== 0) {
        await emotionalProfile.updateTrustScore(
          therapeuticResponse.trustImpact,
          'AI therapeutic response interaction'
        );
      }
    }
    
    res.json({
      success: true,
      therapeuticResponse,
      updatedProfile: {
        trustScore: emotionalProfile.trustScore,
        emotionalState: emotionalProfile.emotionalState,
        trustLevel: emotionalProfile.trustLevel
      }
    });
    
  } catch (error) {
    console.error('Therapeutic response error:', error);
    res.status(500).json({ 
      error: 'Failed to generate therapeutic response',
      message: error.message 
    });
  }
});

/**
 * @route POST /api/ai/content-optimization
 * @desc Optimize marketing content for emotional intelligence
 * @access Private
 */
router.post('/content-optimization', auth, async (req, res) => {
  try {
    const { content, targetAudience, emotionalGoals, userId } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required for optimization' });
    }
    
    // Get user's emotional profile if provided
    let emotionalProfile = null;
    if (userId) {
      emotionalProfile = await EmotionalProfile.findOne({ userId });
    }
    
    // Analyze current content
    const contentAnalysis = await therapistFramework.emotionAI.analyzeEmotion(content, 'content_optimization');
    
    // Generate optimization recommendations
    const optimizations = generateContentOptimizations(
      content,
      contentAnalysis,
      targetAudience,
      emotionalGoals,
      emotionalProfile
    );
    
    res.json({
      success: true,
      originalContent: content,
      analysis: contentAnalysis,
      optimizations,
      recommendations: optimizations.recommendations
    });
    
  } catch (error) {
    console.error('Content optimization error:', error);
    res.status(500).json({ 
      error: 'Failed to optimize content',
      message: error.message 
    });
  }
});

/**
 * @route POST /api/ai/empathy-score
 * @desc Calculate empathy score for marketing content
 * @access Private
 */
router.post('/empathy-score', auth, async (req, res) => {
  try {
    const { content, context = {} } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required for empathy scoring' });
    }
    
    const empathyAnalysis = await calculateEmpathyScore(content, context);
    
    res.json({
      success: true,
      empathyScore: empathyAnalysis.score,
      breakdown: empathyAnalysis.breakdown,
      suggestions: empathyAnalysis.suggestions,
      analysis: empathyAnalysis
    });
    
  } catch (error) {
    console.error('Empathy score error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate empathy score',
      message: error.message 
    });
  }
});

/**
 * @route POST /api/ai/trust-prediction
 * @desc Predict trust impact of marketing message
 * @access Private
 */
router.post('/trust-prediction', auth, async (req, res) => {
  try {
    const { message, userId, targetTrustLevel } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required for trust prediction' });
    }
    
    // Get user's emotional profile
    let emotionalProfile = null;
    if (userId) {
      emotionalProfile = await EmotionalProfile.findOne({ userId });
    }
    
    const trustPrediction = await predictTrustImpact(message, emotionalProfile, targetTrustLevel);
    
    res.json({
      success: true,
      prediction: trustPrediction
    });
    
  } catch (error) {
    console.error('Trust prediction error:', error);
    res.status(500).json({ 
      error: 'Failed to predict trust impact',
      message: error.message 
    });
  }
});

/**
 * @route GET /api/ai/emotional-insights/:userId
 * @desc Get AI-powered emotional insights for a user
 * @access Private
 */
router.get('/emotional-insights/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const emotionalProfile = await EmotionalProfile.findOne({ userId });
    
    if (!emotionalProfile) {
      return res.status(404).json({ error: 'Emotional profile not found' });
    }
    
    const insights = await generateEmotionalInsights(emotionalProfile);
    
    res.json({
      success: true,
      insights
    });
    
  } catch (error) {
    console.error('Emotional insights error:', error);
    res.status(500).json({ 
      error: 'Failed to generate emotional insights',
      message: error.message 
    });
  }
});

// Helper functions

function generateContentOptimizations(content, analysis, targetAudience, emotionalGoals, emotionalProfile) {
  const optimizations = {
    emotionalTone: {
      current: analysis.emotions,
      recommended: calculateRecommendedTone(targetAudience, emotionalGoals),
      adjustments: []
    },
    trustSignals: {
      current: analysis.trustSignals.score,
      recommended: emotionalProfile ? Math.min(emotionalProfile.trustScore + 10, 100) : 70,
      improvements: []
    },
    cognitiveLoad: {
      current: analysis.cognitiveLoad.score,
      recommended: emotionalProfile ? 
        (emotionalProfile.trustScore < 40 ? 3 : 5) : 4,
      simplifications: []
    },
    recommendations: []
  };
  
  // Generate tone adjustments
  if (analysis.emotions.fear > 0.3 && !emotionalGoals?.includes('reassurance')) {
    optimizations.emotionalTone.adjustments.push({
      issue: 'High fear detected',
      solution: 'Add reassuring language and safety indicators'
    });
  }
  
  if (analysis.emotions.trust < 0.2) {
    optimizations.trustSignals.improvements.push({
      issue: 'Low trust signals',
      solution: 'Add transparency statements and credibility indicators'
    });
  }
  
  if (analysis.cognitiveLoad.score > 7) {
    optimizations.cognitiveLoad.simplifications.push({
      issue: 'High cognitive load',
      solution: 'Simplify language and break into shorter sentences'
    });
  }
  
  // Generate overall recommendations
  optimizations.recommendations = [
    ...optimizations.emotionalTone.adjustments,
    ...optimizations.trustSignals.improvements,
    ...optimizations.cognitiveLoad.simplifications
  ].map(item => ({
    category: 'content_optimization',
    priority: 'medium',
    action: item.solution,
    reason: item.issue
  }));
  
  return optimizations;
}

function calculateRecommendedTone(targetAudience, emotionalGoals) {
  const baseTone = {
    trust: 0.6,
    fear: 0.1,
    joy: 0.4,
    sadness: 0.1,
    anger: 0.05,
    surprise: 0.2,
    anticipation: 0.5,
    disgust: 0.05
  };
  
  // Adjust based on emotional goals
  if (emotionalGoals?.includes('reassurance')) {
    baseTone.trust += 0.2;
    baseTone.fear -= 0.05;
  }
  
  if (emotionalGoals?.includes('excitement')) {
    baseTone.joy += 0.3;
    baseTone.anticipation += 0.2;
  }
  
  if (emotionalGoals?.includes('urgency')) {
    baseTone.anticipation += 0.3;
    baseTone.surprise += 0.1;
  }
  
  return baseTone;
}

async function calculateEmpathyScore(content, context) {
  const emotionAI = therapistFramework.emotionAI;
  const analysis = await emotionAI.analyzeEmotion(content, 'empathy_scoring');
  
  // Calculate empathy components
  const validationScore = calculateValidationScore(content);
  const understandingScore = calculateUnderstandingScore(analysis);
  const supportScore = calculateSupportScore(content);
  const respectScore = calculateRespectScore(content, analysis);
  
  const totalScore = (validationScore + understandingScore + supportScore + respectScore) / 4;
  
  return {
    score: Math.round(totalScore * 100) / 100,
    breakdown: {
      validation: validationScore,
      understanding: understandingScore,
      support: supportScore,
      respect: respectScore
    },
    suggestions: generateEmpathySuggestions(totalScore, {
      validation: validationScore,
      understanding: understandingScore,
      support: supportScore,
      respect: respectScore
    }),
    analysis
  };
}

function calculateValidationScore(content) {
  const validationPhrases = [
    'understand', 'recognize', 'acknowledge', 'appreciate', 'valid', 'makes sense',
    'completely normal', 'natural to feel', 'many people', 'you\'re not alone'
  ];
  
  const lowerContent = content.toLowerCase();
  const matches = validationPhrases.filter(phrase => lowerContent.includes(phrase)).length;
  
  return Math.min(10, matches * 1.5);
}

function calculateUnderstandingScore(analysis) {
  // Higher score for content that shows emotional awareness
  const emotionAwareness = Object.values(analysis.emotions).reduce((sum, val) => sum + val, 0);
  const trustAwareness = Math.abs(analysis.trustSignals.score);
  
  return Math.min(10, (emotionAwareness * 2) + (trustAwareness * 0.5));
}

function calculateSupportScore(content) {
  const supportPhrases = [
    'help', 'support', 'assist', 'guide', 'together', 'partnership',
    'we\'re here', 'available', 'ready to', 'happy to'
  ];
  
  const lowerContent = content.toLowerCase();
  const matches = supportPhrases.filter(phrase => lowerContent.includes(phrase)).length;
  
  return Math.min(10, matches * 1.2);
}

function calculateRespectScore(content, analysis) {
  // Penalize for pushy or disrespectful language
  const pushyPhrases = ['must', 'should', 'need to', 'have to', 'required'];
  const respectfulPhrases = ['choice', 'option', 'prefer', 'comfortable', 'your decision'];
  
  const lowerContent = content.toLowerCase();
  const pushyCount = pushyPhrases.filter(phrase => lowerContent.includes(phrase)).length;
  const respectfulCount = respectfulPhrases.filter(phrase => lowerContent.includes(phrase)).length;
  
  let score = 7; // Base score
  score -= pushyCount * 1.5;
  score += respectfulCount * 1;
  
  return Math.max(0, Math.min(10, score));
}

function generateEmpathySuggestions(totalScore, breakdown) {
  const suggestions = [];
  
  if (breakdown.validation < 5) {
    suggestions.push({
      category: 'validation',
      suggestion: 'Add more validating language that acknowledges the user\'s feelings',
      example: 'I understand this might feel overwhelming...'
    });
  }
  
  if (breakdown.understanding < 5) {
    suggestions.push({
      category: 'understanding',
      suggestion: 'Show more emotional awareness and understanding of user concerns',
      example: 'Many people feel cautious about AI technology...'
    });
  }
  
  if (breakdown.support < 5) {
    suggestions.push({
      category: 'support',
      suggestion: 'Offer more supportive language and assistance',
      example: 'We\'re here to help you every step of the way...'
    });
  }
  
  if (breakdown.respect < 7) {
    suggestions.push({
      category: 'respect',
      suggestion: 'Use more respectful, choice-oriented language',
      example: 'You can choose what feels right for you...'
    });
  }
  
  return suggestions;
}

async function predictTrustImpact(message, emotionalProfile, targetTrustLevel) {
  const emotionAI = therapistFramework.emotionAI;
  const analysis = await emotionAI.analyzeEmotion(message, 'trust_prediction');
  
  let predictedImpact = 0;
  
  // Base impact from trust signals
  predictedImpact += analysis.trustSignals.score * 0.5;
  
  // Impact from emotional content
  predictedImpact += (analysis.emotions.trust - analysis.emotions.fear) * 3;
  
  // Adjust based on current trust level
  if (emotionalProfile) {
    const currentTrust = emotionalProfile.trustScore;
    
    // Higher impact for users with lower trust
    if (currentTrust < 30) {
      predictedImpact *= 1.5;
    } else if (currentTrust > 70) {
      predictedImpact *= 0.8;
    }
    
    // Consider user's emotional needs
    if (emotionalProfile.emotionalNeeds.transparency > 7 && analysis.trustSignals.score > 0) {
      predictedImpact += 2;
    }
    
    if (emotionalProfile.emotionalNeeds.control > 7 && message.toLowerCase().includes('control')) {
      predictedImpact += 1.5;
    }
  }
  
  return {
    predictedImpact: Math.round(predictedImpact * 100) / 100,
    confidence: calculatePredictionConfidence(analysis, emotionalProfile),
    factors: {
      trustSignals: analysis.trustSignals.score,
      emotionalBalance: analysis.emotions.trust - analysis.emotions.fear,
      cognitiveLoad: analysis.cognitiveLoad.score,
      personalAlignment: emotionalProfile ? calculatePersonalAlignment(message, emotionalProfile) : 0
    },
    recommendations: generateTrustOptimizationRecommendations(predictedImpact, analysis, emotionalProfile)
  };
}

function calculatePredictionConfidence(analysis, emotionalProfile) {
  let confidence = 0.5; // Base confidence
  
  // Higher confidence with more data
  if (emotionalProfile && emotionalProfile.sentimentHistory.length > 10) {
    confidence += 0.2;
  }
  
  // Higher confidence with clear emotional signals
  const maxEmotion = Math.max(...Object.values(analysis.emotions));
  if (maxEmotion > 0.5) {
    confidence += 0.2;
  }
  
  // Higher confidence with clear trust signals
  if (Math.abs(analysis.trustSignals.score) > 2) {
    confidence += 0.1;
  }
  
  return Math.min(1, confidence);
}

function calculatePersonalAlignment(message, emotionalProfile) {
  let alignment = 0;
  
  const lowerMessage = message.toLowerCase();
  
  // Check alignment with communication preferences
  if (emotionalProfile.communicationStyle.preferredTone === 'empathetic' && 
      lowerMessage.includes('understand')) {
    alignment += 1;
  }
  
  if (emotionalProfile.communicationStyle.transparencyLevel === 'high' && 
      lowerMessage.includes('transparent')) {
    alignment += 1;
  }
  
  // Check alignment with emotional needs
  if (emotionalProfile.emotionalNeeds.safety > 7 && lowerMessage.includes('safe')) {
    alignment += 0.5;
  }
  
  if (emotionalProfile.emotionalNeeds.control > 7 && lowerMessage.includes('control')) {
    alignment += 0.5;
  }
  
  return alignment;
}

function generateTrustOptimizationRecommendations(predictedImpact, analysis, emotionalProfile) {
  const recommendations = [];
  
  if (predictedImpact < 0) {
    recommendations.push({
      priority: 'high',
      action: 'Revise message to reduce fear-inducing language',
      reason: 'Negative trust impact predicted'
    });
  }
  
  if (analysis.cognitiveLoad.score > 7) {
    recommendations.push({
      priority: 'medium',
      action: 'Simplify language to reduce cognitive load',
      reason: 'High cognitive complexity detected'
    });
  }
  
  if (analysis.trustSignals.score < 0) {
    recommendations.push({
      priority: 'high',
      action: 'Add transparency and credibility indicators',
      reason: 'Negative trust signals detected'
    });
  }
  
  return recommendations;
}

async function generateEmotionalInsights(emotionalProfile) {
  const insights = {
    personalityProfile: {
      dominantEmotions: getDominantEmotions(emotionalProfile),
      communicationStyle: emotionalProfile.communicationStyle,
      trustJourney: analyzeTrustJourney(emotionalProfile.trustJourney),
      emotionalNeeds: emotionalProfile.emotionalNeeds
    },
    
    behavioralPatterns: {
      engagementStyle: analyzeEngagementStyle(emotionalProfile.interactionPatterns),
      hesitationTriggers: analyzeHesitationTriggers(emotionalProfile.interactionPatterns),
      preferredFeatures: emotionalProfile.aiInteractions.preferredFeatures,
      avoidedFeatures: emotionalProfile.aiInteractions.avoidedFeatures
    },
    
    marketingRecommendations: {
      optimalTiming: calculateOptimalTiming(emotionalProfile),
      messageFraming: recommendMessageFraming(emotionalProfile),
      channelPreferences: recommendChannels(emotionalProfile),
      contentTypes: recommendContentTypes(emotionalProfile)
    },
    
    riskAssessment: {
      churnRisk: emotionalProfile.predictions.churnRisk,
      trustDeclineRisk: calculateTrustDeclineRisk(emotionalProfile),
      engagementRisk: calculateEngagementRisk(emotionalProfile)
    },
    
    opportunities: {
      upsellReadiness: calculateUpsellReadiness(emotionalProfile),
      advocacyPotential: calculateAdvocacyPotential(emotionalProfile),
      collaborationOpportunities: identifyCollaborationOpportunities(emotionalProfile)
    }
  };
  
  return insights;
}

// Additional helper functions for insights generation
function getDominantEmotions(profile) {
  const recentSentiments = profile.sentimentHistory.slice(-10);
  if (recentSentiments.length === 0) return [];
  
  const emotionTotals = {};
  recentSentiments.forEach(sentiment => {
    Object.keys(sentiment.sentiment.emotions || {}).forEach(emotion => {
      emotionTotals[emotion] = (emotionTotals[emotion] || 0) + sentiment.sentiment.emotions[emotion];
    });
  });
  
  return Object.entries(emotionTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([emotion, score]) => ({ emotion, score: score / recentSentiments.length }));
}

function analyzeTrustJourney(trustJourney) {
  if (trustJourney.length < 2) return { trend: 'insufficient_data' };
  
  const recent = trustJourney.slice(-5);
  const trend = recent[recent.length - 1].trustScore > recent[0].trustScore ? 'increasing' : 'decreasing';
  const velocity = (recent[recent.length - 1].trustScore - recent[0].trustScore) / recent.length;
  
  return { trend, velocity, milestones: trustJourney.length };
}

function analyzeEngagementStyle(interactionPatterns) {
  const signals = interactionPatterns.engagementSignals;
  if (signals.length === 0) return 'unknown';
  
  const avgIntensity = signals.reduce((sum, s) => sum + s.intensity, 0) / signals.length;
  const avgDuration = signals.length; // Simplified
  
  if (avgIntensity > 7) return 'high_engagement';
  if (avgIntensity > 4) return 'moderate_engagement';
  return 'low_engagement';
}

function analyzeHesitationTriggers(interactionPatterns) {
  const hesitations = interactionPatterns.hesitationMarkers;
  const triggers = {};
  
  hesitations.forEach(h => {
    triggers[h.context] = (triggers[h.context] || 0) + 1;
  });
  
  return Object.entries(triggers)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([trigger, count]) => ({ trigger, count }));
}

function calculateOptimalTiming(profile) {
  // Simplified timing recommendation based on trust score and engagement patterns
  if (profile.trustScore > 70) return 'immediate';
  if (profile.trustScore > 40) return 'gradual';
  return 'careful_nurturing';
}

function recommendMessageFraming(profile) {
  const framing = [];
  
  if (profile.emotionalNeeds.validation > 7) {
    framing.push('validation_first');
  }
  
  if (profile.emotionalNeeds.transparency > 7) {
    framing.push('transparency_focused');
  }
  
  if (profile.emotionalNeeds.control > 7) {
    framing.push('empowerment_oriented');
  }
  
  return framing.length > 0 ? framing : ['balanced_approach'];
}

function recommendChannels(profile) {
  const channels = [];
  
  if (profile.trustScore > 60) {
    channels.push('email', 'in_app_messaging');
  } else {
    channels.push('human_support', 'educational_content');
  }
  
  return channels;
}

function recommendContentTypes(profile) {
  const types = [];
  
  if (profile.emotionalState.primary === 'confused') {
    types.push('tutorials', 'step_by_step_guides');
  }
  
  if (profile.trustScore < 40) {
    types.push('testimonials', 'transparency_reports');
  }
  
  if (profile.trustScore > 70) {
    types.push('advanced_features', 'collaboration_invites');
  }
  
  return types.length > 0 ? types : ['general_information'];
}

function calculateTrustDeclineRisk(profile) {
  const recentTrust = profile.trustJourney.slice(-3);
  if (recentTrust.length < 2) return 0;
  
  const isDecreasing = recentTrust[recentTrust.length - 1].trustScore < recentTrust[0].trustScore;
  return isDecreasing ? 70 : 20;
}

function calculateEngagementRisk(profile) {
  const recentEngagement = profile.interactionPatterns.engagementSignals.slice(-5);
  if (recentEngagement.length === 0) return 50;
  
  const avgIntensity = recentEngagement.reduce((sum, s) => sum + s.intensity, 0) / recentEngagement.length;
  return avgIntensity < 3 ? 80 : 20;
}

function calculateUpsellReadiness(profile) {
  if (profile.trustScore > 70 && profile.aiInteractions.positiveInteractions > 5) {
    return 85;
  }
  if (profile.trustScore > 50) {
    return 60;
  }
  return 25;
}

function calculateAdvocacyPotential(profile) {
  const positiveRatio = profile.aiInteractions.totalInteractions > 0 ? 
    profile.aiInteractions.positiveInteractions / profile.aiInteractions.totalInteractions : 0;
  
  return (profile.trustScore * 0.6) + (positiveRatio * 40);
}

function identifyCollaborationOpportunities(profile) {
  const opportunities = [];
  
  if (profile.trustScore > 60) {
    opportunities.push('feature_feedback', 'beta_testing');
  }
  
  if (profile.trustScore > 80) {
    opportunities.push('case_study_participation', 'advisory_board');
  }
  
  return opportunities;
}

module.exports = router;