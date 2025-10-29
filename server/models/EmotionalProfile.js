const mongoose = require('mongoose');

const emotionalProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Core Emotional Metrics
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  emotionalState: {
    primary: {
      type: String,
      enum: ['skeptical', 'confused', 'cautious', 'trusting', 'confident', 'anxious', 'curious'],
      default: 'skeptical'
    },
    intensity: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    }
  },
  
  // Trust Paradox Model Level
  trustLevel: {
    type: String,
    enum: ['awareness', 'engagement', 'empowerment', 'relationship'],
    default: 'awareness'
  },
  
  // Emotional Needs Analysis
  emotionalNeeds: {
    validation: { type: Number, min: 0, max: 10, default: 5 },
    control: { type: Number, min: 0, max: 10, default: 5 },
    transparency: { type: Number, min: 0, max: 10, default: 5 },
    recognition: { type: Number, min: 0, max: 10, default: 5 },
    safety: { type: Number, min: 0, max: 10, default: 5 }
  },
  
  // Behavioral Patterns
  interactionPatterns: {
    hesitationMarkers: [{
      timestamp: Date,
      action: String,
      hesitationDuration: Number, // milliseconds
      context: String
    }],
    
    engagementSignals: [{
      timestamp: Date,
      type: String, // 'click', 'scroll', 'dwell', 'share'
      intensity: Number,
      context: String
    }],
    
    optOutBehavior: [{
      timestamp: Date,
      feature: String,
      reason: String
    }]
  },
  
  // Communication Preferences
  communicationStyle: {
    preferredTone: {
      type: String,
      enum: ['professional', 'friendly', 'empathetic', 'direct', 'supportive'],
      default: 'professional'
    },
    transparencyLevel: {
      type: String,
      enum: ['minimal', 'moderate', 'high', 'maximum'],
      default: 'moderate'
    },
    aiComfortLevel: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    }
  },
  
  // Sentiment Analysis History
  sentimentHistory: [{
    timestamp: Date,
    source: String, // 'feedback', 'chat', 'email', 'review'
    content: String,
    sentiment: {
      polarity: Number, // -1 to 1
      subjectivity: Number, // 0 to 1
      emotions: {
        joy: Number,
        anger: Number,
        fear: Number,
        sadness: Number,
        surprise: Number,
        trust: Number,
        anticipation: Number,
        disgust: Number
      }
    },
    trustImpact: Number // -10 to 10
  }],
  
  // AI Interaction Metrics
  aiInteractions: {
    totalInteractions: { type: Number, default: 0 },
    positiveInteractions: { type: Number, default: 0 },
    negativeInteractions: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 },
    lastInteraction: Date,
    preferredFeatures: [String],
    avoidedFeatures: [String]
  },
  
  // Trust Building Progress
  trustJourney: [{
    timestamp: Date,
    stage: String,
    trustScore: Number,
    triggerEvent: String,
    notes: String
  }],
  
  // Predictive Insights
  predictions: {
    churnRisk: { type: Number, min: 0, max: 100, default: 50 },
    conversionProbability: { type: Number, min: 0, max: 100, default: 50 },
    recommendedActions: [String],
    nextBestAction: String,
    confidenceScore: Number
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastAnalyzed: Date,
  dataQuality: {
    completeness: Number, // 0-100%
    recency: Number, // days since last update
    reliability: Number // 0-100%
  }
});

// Indexes for performance
emotionalProfileSchema.index({ userId: 1 });
emotionalProfileSchema.index({ trustScore: -1 });
emotionalProfileSchema.index({ trustLevel: 1 });
emotionalProfileSchema.index({ 'predictions.churnRisk': -1 });
emotionalProfileSchema.index({ updatedAt: -1 });

// Update timestamp on save
emotionalProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods
emotionalProfileSchema.methods.updateTrustScore = function(delta, reason) {
  const oldScore = this.trustScore;
  this.trustScore = Math.max(0, Math.min(100, this.trustScore + delta));
  
  this.trustJourney.push({
    timestamp: new Date(),
    stage: this.trustLevel,
    trustScore: this.trustScore,
    triggerEvent: reason,
    notes: `Trust score changed from ${oldScore} to ${this.trustScore} (${delta > 0 ? '+' : ''}${delta})`
  });
  
  return this.save();
};

emotionalProfileSchema.methods.addSentimentData = function(source, content, sentiment) {
  this.sentimentHistory.push({
    timestamp: new Date(),
    source,
    content,
    sentiment,
    trustImpact: this.calculateTrustImpact(sentiment)
  });
  
  // Keep only last 100 entries
  if (this.sentimentHistory.length > 100) {
    this.sentimentHistory = this.sentimentHistory.slice(-100);
  }
  
  return this.save();
};

emotionalProfileSchema.methods.calculateTrustImpact = function(sentiment) {
  // Calculate trust impact based on sentiment
  const trustWeight = sentiment.emotions.trust * 5;
  const fearWeight = sentiment.emotions.fear * -3;
  const joyWeight = sentiment.emotions.joy * 2;
  const angerWeight = sentiment.emotions.anger * -4;
  
  return Math.max(-10, Math.min(10, trustWeight + fearWeight + joyWeight + angerWeight));
};

emotionalProfileSchema.methods.getRecommendations = function() {
  const recommendations = [];
  
  if (this.trustScore < 30) {
    recommendations.push('Focus on validation and transparency');
    recommendations.push('Reduce AI complexity');
    recommendations.push('Provide human support options');
  } else if (this.trustScore < 60) {
    recommendations.push('Gradually introduce AI features');
    recommendations.push('Explain AI decisions clearly');
    recommendations.push('Offer customization options');
  } else {
    recommendations.push('Leverage advanced AI features');
    recommendations.push('Encourage co-creation');
    recommendations.push('Build predictive experiences');
  }
  
  return recommendations;
};

module.exports = mongoose.model('EmotionalProfile', emotionalProfileSchema);