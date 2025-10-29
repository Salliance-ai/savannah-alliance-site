import { EmotionalDataLayer } from './emotionalDataLayer.js';
import { EITranslator } from './eiTranslator.js';

/**
 * Layer 3: Empathy Engine
 * Suggests tone, timing, and transparency level for each interaction
 * Adapts AI intensity based on user's trust score
 */
export class EmpathyEngine {
  constructor(emotionalDataLayer = null, eiTranslator = null) {
    this.emotionalDataLayer = emotionalDataLayer || new EmotionalDataLayer();
    this.eiTranslator = eiTranslator || new EITranslator(this.emotionalDataLayer);
    
    // Trust score thresholds
    this.trustThresholds = {
      low: 60,
      medium: 60,
      high: 80
    };

    // Tone recommendations based on trust level
    this.toneStyles = {
      low: {
        tone: 'warm, validating, transparent',
        style: 'human-first',
        messaging: 'We understand your concerns. Here\'s how we use AI transparently...',
        aiIntensity: 'minimal',
        features: ['human-support-visible', 'clear-explanations', 'opt-outs-prominent']
      },
      medium: {
        tone: 'friendly, educational, supportive',
        style: 'balanced',
        messaging: 'Let us explain how this works, and you\'re always in control...',
        aiIntensity: 'moderate',
        features: ['explain-recommendations', 'customization-options', 'progressive-disclosure']
      },
      high: {
        tone: 'collaborative, empowering, personalized',
        style: 'ai-enhanced',
        messaging: 'Based on your preferences, here\'s a personalized experience...',
        aiIntensity: 'high',
        features: ['personalized-assistant', 'predictive-suggestions', 'co-creation-tools']
      }
    };
  }

  /**
   * Calculate trust score for a user (0-100)
   */
  async calculateTrustScore(userId) {
    const userHistory = this.emotionalDataLayer.getUserEmotionalHistory(userId);
    
    if (!userHistory || userHistory.interactions.length === 0) {
      return 50; // Neutral/default trust score
    }

    let score = 50; // Start at neutral

    // Factors affecting trust score:
    
    // 1. Sentiment trend (40% weight)
    const sentiments = userHistory.interactions.map(i => i.sentiment || 0);
    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const sentimentScore = ((avgSentiment + 5) / 10) * 100; // Normalize -5 to +5 to 0-100
    score += (sentimentScore - 50) * 0.4;

    // 2. Trust signals vs anxiety markers (30% weight)
    const trustRate = userHistory.trustSignals.length / userHistory.interactions.length;
    const anxietyRate = userHistory.anxietyMarkers.length / userHistory.interactions.length;
    const trustBalance = (trustRate - anxietyRate) * 100;
    score += trustBalance * 0.3;

    // 3. Engagement consistency (20% weight)
    const engagementScore = Math.min(userHistory.interactions.length / 10, 1) * 100;
    score += (engagementScore - 50) * 0.2;

    // 4. Emotional stability (10% weight)
    const emotionalProfile = await this.eiTranslator.generateEmotionalProfile(userId);
    const stabilityScore = (emotionalProfile.emotionalStability || 0.5) * 100;
    score += (stabilityScore - 50) * 0.1;

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Recommend tone and messaging approach
   */
  async recommendTone(userId, context = 'general', trustScore = null) {
    if (!trustScore) {
      trustScore = await this.calculateTrustScore(userId);
    }

    // Get user's emotional profile for additional context
    const emotionalProfile = await this.eiTranslator.generateEmotionalProfile(userId);
    
    // Determine trust level
    let trustLevel;
    if (trustScore < this.trustThresholds.low) {
      trustLevel = 'low';
    } else if (trustScore < this.trustThresholds.high) {
      trustLevel = 'medium';
    } else {
      trustLevel = 'high';
    }

    // Get base tone style
    const baseTone = { ...this.toneStyles[trustLevel] };
    
    // Adapt based on emotional profile
    if (emotionalProfile.primaryEmotion === 'anxiety') {
      baseTone.messaging = `We notice you might have concerns. ${baseTone.messaging}`;
      baseTone.style = 'extra-gentle';
      baseTone.aiIntensity = 'minimal';
    }

    if (emotionalProfile.primaryEmotion === 'curiosity') {
      baseTone.messaging = `Great question! ${baseTone.messaging}`;
      baseTone.features.push('educational-content');
    }

    if (emotionalProfile.trustParadoxLevel <= 2) {
      // Add validation statements
      baseTone.preMessage = this.getValidationStatement(emotionalProfile.primaryEmotion);
    }

    return {
      userId,
      trustScore: Math.round(trustScore),
      trustLevel,
      context,
      recommendation: baseTone,
      emotionalContext: {
        primaryEmotion: emotionalProfile.primaryEmotion,
        trustParadoxLevel: emotionalProfile.trustParadoxLevel
      },
      suggestedMessaging: baseTone.messaging,
      aiFeaturesToShow: baseTone.features,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate validation statement based on emotion
   */
  getValidationStatement(emotion) {
    const validations = {
      anxiety: "It's completely normal to feel cautious about AI. We're here to address any concerns.",
      distrust: "Your skepticism is valid. Transparency matters to us, and we'll show you exactly how this works.",
      confusion: "This can feel complex at first. Let's break it down step by step.",
      curiosity: "Your interest shows you're thinking carefully about this. That's exactly what we appreciate.",
      cautious: "Taking your time is smart. We're here when you're ready to explore further."
    };

    return validations[emotion] || "We understand where you're coming from. Let's find what works for you.";
  }

  /**
   * Recommend timing for interactions
   */
  recommendTiming(userId, interactionType = 'message') {
    const userHistory = this.emotionalDataLayer.getUserEmotionalHistory(userId);
    const recentInteractions = userHistory.interactions.slice(-5);

    // Analyze recent patterns
    if (recentInteractions.length === 0) {
      return {
        optimalTime: 'anytime',
        urgency: 'low',
        frequency: 'normal'
      };
    }

    // Check if user is currently anxious
    const lastInteraction = recentInteractions[recentInteractions.length - 1];
    const hasRecentAnxiety = recentInteractions.some(i => i.anxietyMarker);

    if (hasRecentAnxiety) {
      return {
        optimalTime: 'wait',
        urgency: 'low',
        frequency: 'reduced',
        reason: 'User shows anxiety - give space before next contact'
      };
    }

    // Check engagement level
    const avgSentiment = recentInteractions.reduce((sum, i) => sum + (i.sentiment || 0), 0) / recentInteractions.length;

    if (avgSentiment > 2) {
      return {
        optimalTime: 'soon',
        urgency: 'medium',
        frequency: 'increased',
        reason: 'Positive engagement - capitalize on momentum'
      };
    }

    return {
      optimalTime: 'normal',
      urgency: 'normal',
      frequency: 'normal'
    };
  }

  /**
   * Generate AI explanation for recommendation
   */
  generateExplanation(userId, recommendation, trustScore) {
    const explanations = {
      low: {
        why: "We're being transparent and gentle because you're still learning about how we use AI.",
        what: "This approach prioritizes your comfort and understanding.",
        how: "You can always customize what AI handles and what you control."
      },
      medium: {
        why: "You've shown engagement, so we can gradually introduce more AI features.",
        what: "This balanced approach gives you control while leveraging helpful automation.",
        how: "Features are optional and explained clearly so you understand each step."
      },
      high: {
        why: "Your trust and engagement allow us to offer a fully personalized AI experience.",
        what: "This leverages your preferences to create a more efficient, tailored experience.",
        how: "AI adapts to your needs while you maintain full control at any time."
      }
    };

    const level = trustScore < this.trustThresholds.low ? 'low' : 
                  trustScore < this.trustThresholds.high ? 'medium' : 'high';

    return {
      ...explanations[level],
      trustScore,
      transparencyLevel: level,
      userCanControl: true
    };
  }

  /**
   * Get adaptive rollout logic
   */
  getAdaptiveRollout(userId) {
    return this.calculateTrustScore(userId).then(trustScore => {
      if (trustScore < 40) {
        return {
          aiIntensity: 0.2,
          features: ['basic-sentiment-analysis'],
          automationLevel: 'manual-with-suggestions'
        };
      } else if (trustScore < 60) {
        return {
          aiIntensity: 0.5,
          features: ['sentiment-analysis', 'basic-recommendations'],
          automationLevel: 'semi-automated'
        };
      } else if (trustScore < 80) {
        return {
          aiIntensity: 0.7,
          features: ['sentiment-analysis', 'recommendations', 'personalization'],
          automationLevel: 'mostly-automated'
        };
      } else {
        return {
          aiIntensity: 0.9,
          features: ['full-suite', 'predictive-analytics', 'co-creation'],
          automationLevel: 'fully-automated-with-controls'
        };
      }
    });
  }
}
