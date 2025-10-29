import { EmotionalDataLayer } from './emotionalDataLayer.js';

/**
 * Layer 2: AI-EI Translator
 * Maps behavioral data → emotional needs
 * Generates a "User Emotional Profile" per customer
 */
export class EITranslator {
  constructor(emotionalDataLayer = null) {
    this.emotionalDataLayer = emotionalDataLayer || new EmotionalDataLayer();
    
    // Behavioral patterns to emotional needs mapping
    this.behaviorToEmotionMap = {
      // Clickstream behaviors
      'rapid-exit': { emotion: 'anxiety', needs: ['control', 'transparency'] },
      'hover-hesitation': { emotion: 'confusion', needs: ['clarity', 'guidance'] },
      'repeated-visit': { emotion: 'curiosity', needs: ['information', 'validation'] },
      'long-dwell': { emotion: 'engagement', needs: ['recognition', 'value'] },
      
      // Interaction behaviors
      'opt-out-click': { emotion: 'distrust', needs: ['respect', 'control'] },
      'multiple-questions': { emotion: 'confusion', needs: ['education', 'transparency'] },
      'feedback-negative': { emotion: 'frustration', needs: ['validation', 'solution'] },
      'feedback-positive': { emotion: 'trust', needs: ['continuation', 'deepening'] },
      
      // Engagement behaviors
      'high-engagement': { emotion: 'trust', needs: ['collaboration', 'empowerment'] },
      'low-engagement': { emotion: 'cautious', needs: ['safety', 'gradual-reveal'] },
      'active-customization': { emotion: 'empowerment', needs: ['control', 'recognition'] }
    };

    // Emotional needs taxonomy
    this.emotionalNeeds = {
      'fear-of-loss': ['control', 'transparency', 'safety'],
      'desire-for-control': ['customization', 'opt-out', 'choice'],
      'need-for-recognition': ['personalization', 'acknowledgment', 'value'],
      'desire-for-clarity': ['education', 'simple-explanation', 'transparency'],
      'need-for-trust': ['validation', 'consistency', 'benevolence']
    };
  }

  /**
   * Map behavioral data to emotional needs
   */
  async mapBehaviorToEmotionalNeeds(behaviors) {
    const emotionalNeeds = new Set();
    const detectedEmotions = [];
    const recommendations = [];

    for (const behavior of behaviors) {
      const behaviorType = behavior.type || behavior;
      const mapping = this.behaviorToEmotionMap[behaviorType];

      if (mapping) {
        detectedEmotions.push(mapping.emotion);
        mapping.needs.forEach(need => emotionalNeeds.add(need));

        recommendations.push({
          behavior: behaviorType,
          detectedEmotion: mapping.emotion,
          recommendedNeeds: mapping.needs,
          action: this.getActionForNeeds(mapping.needs)
        });
      }
    }

    return {
      detectedEmotions: [...new Set(detectedEmotions)],
      emotionalNeeds: Array.from(emotionalNeeds),
      recommendations,
      primaryEmotion: this.getPrimaryEmotion(detectedEmotions),
      suggestedApproach: this.suggestApproach(Array.from(emotionalNeeds))
    };
  }

  /**
   * Generate comprehensive emotional profile for a user
   */
  async generateEmotionalProfile(userId) {
    const userHistory = this.emotionalDataLayer.getUserEmotionalHistory(userId);
    
    if (!userHistory || userHistory.interactions.length === 0) {
      return {
        userId,
        profileLevel: 'insufficient-data',
        emotionalState: 'unknown',
        needs: [],
        recommendations: ['Need more interaction data to generate profile']
      };
    }

    // Analyze emotional patterns from history
    const emotionCounts = {};
    let totalSentiment = 0;
    const allDetectedNeeds = new Set();

    for (const interaction of userHistory.interactions) {
      // Count emotions
      for (const emotion of interaction.emotions || []) {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }

      totalSentiment += interaction.sentiment || 0;

      // Extract needs from anxiety/trust patterns
      if (interaction.anxietyMarker) {
        allDetectedNeeds.add('safety');
        allDetectedNeeds.add('transparency');
      }
      
      if (interaction.trustSignal) {
        allDetectedNeeds.add('continuation');
        allDetectedNeeds.add('empowerment');
      }
    }

    // Determine primary emotional state
    const primaryEmotion = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b, 'neutral'
    );

    // Calculate emotional stability
    const avgSentiment = totalSentiment / userHistory.interactions.length;
    const emotionalStability = this.calculateStability(userHistory.interactions);

    // Determine Trust Paradox Level
    const trustLevel = this.determineTrustParadoxLevel(
      userHistory,
      primaryEmotion,
      avgSentiment
    );

    return {
      userId,
      profileLevel: 'complete',
      primaryEmotion,
      emotionalState: this.categorizeEmotionalState(primaryEmotion, avgSentiment),
      emotionalNeeds: Array.from(allDetectedNeeds),
      emotionalStability,
      avgSentiment,
      trustParadoxLevel: trustLevel.level,
      trustLevelDescription: trustLevel.description,
      interactionCount: userHistory.interactions.length,
      recommendations: this.generateProfileRecommendations(
        primaryEmotion,
        Array.from(allDetectedNeeds),
        trustLevel.level
      ),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Determine Trust Paradox Level (1-4)
   */
  determineTrustParadoxLevel(userHistory, primaryEmotion, avgSentiment) {
    const anxietyRate = userHistory.anxietyMarkers.length / 
      Math.max(userHistory.interactions.length, 1);
    const trustRate = userHistory.trustSignals.length / 
      Math.max(userHistory.interactions.length, 1);

    // Level 4: Relationship (Trusting)
    if (trustRate > 0.5 && avgSentiment > 2 && anxietyRate < 0.1) {
      return {
        level: 4,
        description: 'Trusting - User shows high trust signals and low anxiety',
        userEmotion: 'Trusting',
        marketerAction: 'Collaborate with the user',
        techRole: 'Co-creation & predictive empathy',
        trustOutcome: 'Loyalty'
      };
    }

    // Level 3: Empowerment (Cautious)
    if (avgSentiment > 0 && anxietyRate < 0.3) {
      return {
        level: 3,
        description: 'Cautious - User is exploring but needs control',
        userEmotion: 'Cautious',
        marketerAction: 'Provide control & customization',
        techRole: 'Adaptive UX + opt-outs',
        trustOutcome: 'Confidence'
      };
    }

    // Level 2: Engagement (Confused)
    if (avgSentiment > -1 && anxietyRate < 0.5) {
      return {
        level: 2,
        description: 'Confused - User needs clarity and transparency',
        userEmotion: 'Confused',
        marketerAction: 'Explain simply & transparently',
        techRole: 'Natural-language explainability',
        trustOutcome: 'Comfort'
      };
    }

    // Level 1: Awareness (Skeptical)
    return {
      level: 1,
      description: 'Skeptical - User has concerns about AI',
      userEmotion: 'Skeptical',
      marketerAction: 'Validate feelings about AI',
      techRole: 'Sentiment analysis',
      trustOutcome: 'Curiosity'
    };
  }

  /**
   * Calculate emotional stability score
   */
  calculateStability(interactions) {
    if (interactions.length < 2) return 0.5;

    const sentiments = interactions.map(i => i.sentiment || 0);
    const mean = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sentiments.length;
    const stdDev = Math.sqrt(variance);

    // Normalize stability (lower stdDev = higher stability)
    return Math.max(0, Math.min(1, 1 - (stdDev / 5)));
  }

  /**
   * Categorize overall emotional state
   */
  categorizeEmotionalState(primaryEmotion, avgSentiment) {
    if (avgSentiment > 2) return 'positive';
    if (avgSentiment < -2) return 'negative';
    if (primaryEmotion === 'anxiety' || primaryEmotion === 'distrust') return 'cautious';
    if (primaryEmotion === 'trust' || primaryEmotion === 'curiosity') return 'engaged';
    return 'neutral';
  }

  /**
   * Get action recommendations for emotional needs
   */
  getActionForNeeds(needs) {
    const actionMap = {
      'control': 'Provide customization options',
      'transparency': 'Show clear explanations',
      'safety': 'Highlight security and privacy',
      'clarity': 'Simplify messaging',
      'guidance': 'Add tooltips and help',
      'information': 'Provide detailed resources',
      'validation': 'Acknowledge user concerns',
      'continuation': 'Continue with current approach',
      'education': 'Offer learning resources'
    };

    return needs.map(need => actionMap[need] || `Address ${need} need`).join(', ');
  }

  /**
   * Get primary emotion from list
   */
  getPrimaryEmotion(emotions) {
    if (emotions.length === 0) return 'neutral';
    
    const priority = ['anxiety', 'distrust', 'trust', 'curiosity', 'confusion', 'engagement'];
    for (const emotion of priority) {
      if (emotions.includes(emotion)) return emotion;
    }
    
    return emotions[0];
  }

  /**
   * Suggest approach based on emotional needs
   */
  suggestApproach(needs) {
    if (needs.includes('control') || needs.includes('safety')) {
      return 'Progressive disclosure with clear opt-outs';
    }
    
    if (needs.includes('clarity') || needs.includes('education')) {
      return 'Simple explanations with context';
    }
    
    if (needs.includes('continuation') || needs.includes('empowerment')) {
      return 'Collaborative engagement';
    }
    
    return 'Standard engagement with monitoring';
  }

  /**
   * Generate recommendations based on profile
   */
  generateProfileRecommendations(primaryEmotion, needs, trustLevel) {
    const recommendations = [];

    if (trustLevel <= 2) {
      recommendations.push('Use validation-first messaging');
      recommendations.push('Provide transparent AI explanations');
      recommendations.push('Offer clear opt-out options');
    }

    if (primaryEmotion === 'anxiety' || primaryEmotion === 'distrust') {
      recommendations.push('Acknowledge concerns before presenting solutions');
      recommendations.push('Highlight human oversight and control');
    }

    if (needs.includes('clarity') || needs.includes('education')) {
      recommendations.push('Simplify technical language');
      recommendations.push('Add progressive disclosure of features');
    }

    if (trustLevel >= 3) {
      recommendations.push('Enable advanced personalization');
      recommendations.push('Introduce collaborative features');
    }

    return recommendations;
  }
}
