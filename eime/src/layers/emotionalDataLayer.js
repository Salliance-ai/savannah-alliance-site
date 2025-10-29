import Sentiment from 'sentiment';

/**
 * Layer 1: Emotional Data Layer
 * Collects feedback, clickstream, NPS, chat, and voice sentiment.
 * Uses Affective Computing to detect trust signals and anxiety markers.
 */
export class EmotionalDataLayer {
  constructor() {
    this.sentiment = new Sentiment({
      extras: {
        'anxious': -2,
        'worried': -2,
        'distrust': -3,
        'skeptical': -2,
        'confused': -1,
        'cautious': -1,
        'trusting': 3,
        'confident': 2,
        'comfortable': 2,
        'curious': 1,
        'empowered': 3
      }
    });
    
    // In-memory storage (in production, use database)
    this.userData = new Map();
    this.emotionHistory = new Map();
    
    // Emotion detection patterns
    this.emotionPatterns = {
      anxiety: [
        /\b(anxious|worried|nervous|stress|concern|fear|hesitation|uncertain)\b/gi,
        /\b(don't trust|not sure|unsure|doubt|skeptical)\b/gi
      ],
      curiosity: [
        /\b(how|what|why|explain|understand|learn|curious|interesting)\b/gi
      ],
      confusion: [
        /\b(confused|unclear|don't understand|complicated|complex|lost)\b/gi
      ],
      trust: [
        /\b(trust|confident|believe|reliable|sure|comfortable|safe)\b/gi
      ],
      distrust: [
        /\b(distrust|suspicious|doubt|question|unreliable|risky|unsafe)\b/gi
      ]
    };
  }

  /**
   * Analyze sentiment from text input
   */
  async analyzeSentiment(text, source = 'unknown', userId = 'anonymous') {
    const sentimentResult = this.sentiment.analyze(text);
    
    // Determine emotion category
    const detectedEmotions = this.detectEmotions(text, source, userId);
    
    // Store in history
    if (!this.userData.has(userId)) {
      this.userData.set(userId, {
        userId,
        interactions: [],
        emotionalProfile: null,
        trustSignals: [],
        anxietyMarkers: []
      });
    }

    const userData = this.userData.get(userId);
    const interaction = {
      timestamp: new Date().toISOString(),
      text,
      source,
      sentiment: sentimentResult.score,
      comparative: sentimentResult.comparative,
      emotions: detectedEmotions.emotions,
      trustSignal: detectedEmotions.trustSignal,
      anxietyMarker: detectedEmotions.anxietyMarker
    };

    userData.interactions.push(interaction);
    
    if (detectedEmotions.trustSignal) {
      userData.trustSignals.push(interaction);
    }
    
    if (detectedEmotions.anxietyMarker) {
      userData.anxietyMarkers.push(interaction);
    }

    return {
      ...interaction,
      recommendation: this.generateRecommendation(detectedEmotions)
    };
  }

  /**
   * Detect specific emotions from text
   */
  detectEmotions(text, source = 'unknown', userId = 'anonymous') {
    const detected = {
      emotions: [],
      intensity: {},
      trustSignal: false,
      anxietyMarker: false,
      primaryEmotion: 'neutral'
    };

    // Check each emotion pattern
    for (const [emotion, patterns] of Object.entries(this.emotionPatterns)) {
      let matchCount = 0;
      for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
          matchCount += matches.length;
        }
      }
      
      if (matchCount > 0) {
        detected.emotions.push(emotion);
        detected.intensity[emotion] = Math.min(matchCount / 3, 1); // Normalize to 0-1
        
        if (emotion === 'anxiety' || emotion === 'distrust') {
          detected.anxietyMarker = true;
        }
        
        if (emotion === 'trust') {
          detected.trustSignal = true;
        }
      }
    }

    // Determine primary emotion
    if (detected.emotions.length > 0) {
      const maxIntensity = Math.max(...Object.values(detected.intensity));
      detected.primaryEmotion = Object.keys(detected.intensity).find(
        key => detected.intensity[key] === maxIntensity
      );
    }

    return detected;
  }

  /**
   * Generate recommendation based on detected emotions
   */
  generateRecommendation(detection) {
    if (detection.anxietyMarker) {
      return {
        action: 'validate',
        message: 'User shows anxiety markers - recommend validation messaging',
        priority: 'high'
      };
    }

    if (detection.trustSignal) {
      return {
        action: 'engage',
        message: 'Positive trust signals detected - can increase AI interaction',
        priority: 'medium'
      };
    }

    if (detection.emotions.includes('curiosity')) {
      return {
        action: 'educate',
        message: 'User is curious - provide clear explanations',
        priority: 'medium'
      };
    }

    return {
      action: 'monitor',
      message: 'Neutral sentiment - continue monitoring',
      priority: 'low'
    };
  }

  /**
   * Get user's emotional history
   */
  getUserEmotionalHistory(userId) {
    return this.userData.get(userId) || {
      userId,
      interactions: [],
      emotionalProfile: null,
      trustSignals: [],
      anxietyMarkers: []
    };
  }

  /**
   * Get aggregate emotional metrics
   */
  getAggregateMetrics() {
    const metrics = {
      totalUsers: this.userData.size,
      totalInteractions: 0,
      anxietyRate: 0,
      trustSignalRate: 0,
      emotionDistribution: {}
    };

    let anxietyCount = 0;
    let trustCount = 0;

    for (const userData of this.userData.values()) {
      metrics.totalInteractions += userData.interactions.length;
      anxietyCount += userData.anxietyMarkers.length;
      trustCount += userData.trustSignals.length;

      for (const interaction of userData.interactions) {
        for (const emotion of interaction.emotions || []) {
          metrics.emotionDistribution[emotion] = 
            (metrics.emotionDistribution[emotion] || 0) + 1;
        }
      }
    }

    if (metrics.totalInteractions > 0) {
      metrics.anxietyRate = anxietyCount / metrics.totalInteractions;
      metrics.trustSignalRate = trustCount / metrics.totalInteractions;
    }

    return metrics;
  }
}
