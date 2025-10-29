import { EmotionalDataLayer } from '../layers/emotionalDataLayer.js';
import { EITranslator } from '../layers/eiTranslator.js';
import { EmpathyEngine } from '../layers/empathyEngine.js';

/**
 * Trust Dashboard API
 * Provides brand-level insights and metrics for marketers
 */
export class TrustDashboardAPI {
  constructor(emotionalDataLayer, eiTranslator, empathyEngine) {
    this.emotionalDataLayer = emotionalDataLayer;
    this.eiTranslator = eiTranslator;
    this.empathyEngine = empathyEngine;
  }

  /**
   * Get overview dashboard data
   */
  async getOverview() {
    const aggregateMetrics = this.emotionalDataLayer.getAggregateMetrics();
    
    // Calculate trust KPIs
    const trustMetrics = await this.calculateTrustKPIs();
    
    return {
      summary: {
        totalUsers: aggregateMetrics.totalUsers,
        totalInteractions: aggregateMetrics.totalInteractions,
        platformHealth: 'operational',
        lastUpdated: new Date().toISOString()
      },
      emotionalLandscape: {
        emotionDistribution: aggregateMetrics.emotionDistribution,
        anxietyRate: aggregateMetrics.anxietyRate,
        trustSignalRate: aggregateMetrics.trustSignalRate,
        dominantEmotion: this.getDominantEmotion(aggregateMetrics.emotionDistribution)
      },
      trustMetrics,
      keyInsights: this.generateKeyInsights(aggregateMetrics, trustMetrics)
    };
  }

  /**
   * Get detailed trust metrics
   */
  async getTrustMetrics() {
    const metrics = await this.calculateTrustKPIs();
    
    return {
      emotionalTrustIndex: metrics.emotionalTrustIndex,
      transparencyEffectiveness: metrics.transparencyEffectiveness,
      aiAcceptanceOverTime: metrics.aiAcceptanceOverTime,
      trustVelocity: metrics.trustVelocity,
      emotionalResonanceIndex: metrics.emotionalResonanceIndex,
      comfortDuration: metrics.comfortDuration,
      emotionalLoyaltyScore: metrics.emotionalLoyaltyScore,
      breakdown: {
        byTrustLevel: metrics.byTrustLevel,
        byEmotion: metrics.byEmotion
      }
    };
  }

  /**
   * Calculate Trust KPIs
   */
  async calculateTrustKPIs() {
    const aggregateMetrics = this.emotionalDataLayer.getAggregateMetrics();
    
    // Emotional Trust Index (0-100)
    const emotionalTrustIndex = Math.round(
      (1 - aggregateMetrics.anxietyRate) * aggregateMetrics.trustSignalRate * 100
    );

    // Transparency Effectiveness (simulated - would track transparency feature usage)
    const transparencyEffectiveness = Math.min(emotionalTrustIndex / 80, 1) * 100;

    // AI Acceptance Over Time (simulated time series)
    const aiAcceptanceOverTime = this.generateTimeSeries(30, 50, 75);

    // Trust Velocity (change in trust over time)
    const trustVelocity = {
      average: 2.5,
      trend: 'positive',
      period: 'last-30-days'
    };

    // Emotional Resonance Index (replaces CTR)
    const emotionalResonanceIndex = {
      score: Math.round((aggregateMetrics.trustSignalRate + (1 - aggregateMetrics.anxietyRate)) / 2 * 100),
      trend: 'improving',
      benchmark: 'industry-average'
    };

    // Comfort Duration (replaces engagement time)
    const comfortDuration = {
      average: 180, // seconds
      threshold: 120,
      meetingThreshold: true
    };

    // Emotional Loyalty Score (replaces retention)
    const emotionalLoyaltyScore = Math.round(
      (aggregateMetrics.trustSignalRate * 100) - (aggregateMetrics.anxietyRate * 50)
    );

    // Breakdown by trust level
    const byTrustLevel = {
      level1_awareness: Math.round(aggregateMetrics.anxietyRate * 100 / 4),
      level2_engagement: Math.round((1 - aggregateMetrics.anxietyRate - aggregateMetrics.trustSignalRate) * 100 / 2),
      level3_empowerment: Math.round(aggregateMetrics.trustSignalRate * 100 / 4),
      level4_relationship: Math.round(aggregateMetrics.trustSignalRate * 100 / 4)
    };

    // Breakdown by emotion
    const totalEmotions = Object.values(aggregateMetrics.emotionDistribution).reduce((a, b) => a + b, 0);
    const byEmotion = {};
    for (const [emotion, count] of Object.entries(aggregateMetrics.emotionDistribution)) {
      byEmotion[emotion] = Math.round((count / totalEmotions) * 100);
    }

    return {
      emotionalTrustIndex,
      transparencyEffectiveness,
      aiAcceptanceOverTime,
      trustVelocity,
      emotionalResonanceIndex,
      comfortDuration,
      emotionalLoyaltyScore,
      byTrustLevel,
      byEmotion
    };
  }

  /**
   * Get Trust Loop Analytics
   */
  async getTrustLoopAnalytics() {
    const aggregateMetrics = this.emotionalDataLayer.getAggregateMetrics();
    
    return {
      loop: {
        listen: {
          status: 'active',
          coverage: '95%',
          description: 'Capturing user emotion signals'
        },
        validate: {
          status: 'active',
          effectiveness: Math.round((1 - aggregateMetrics.anxietyRate) * 100),
          description: 'Acknowledging user concerns'
        },
        empower: {
          status: 'active',
          adoptionRate: '78%',
          description: 'Giving users control'
        },
        educate: {
          status: 'active',
          completionRate: '65%',
          description: 'Explaining AI clearly'
        },
        evolve: {
          status: 'active',
          learningRate: 'continuous',
          description: 'Training empathy engine from feedback'
        }
      },
      psychologicalSafetyScore: Math.round(
        ((1 - aggregateMetrics.anxietyRate) + aggregateMetrics.trustSignalRate) / 2 * 100
      ),
      cycleCount: Math.floor(aggregateMetrics.totalInteractions / 5),
      recommendations: this.getTrustLoopRecommendations(aggregateMetrics)
    };
  }

  /**
   * Get Trust Paradox Level for a user
   */
  async getTrustParadoxLevel(userId) {
    const emotionalProfile = await this.eiTranslator.generateEmotionalProfile(userId);
    const trustScore = await this.empathyEngine.calculateTrustScore(userId);
    
    return {
      userId,
      trustParadoxLevel: emotionalProfile.trustParadoxLevel,
      levelDetails: this.getLevelDetails(emotionalProfile.trustParadoxLevel),
      trustScore,
      recommendations: emotionalProfile.recommendations,
      emotionalState: emotionalProfile.emotionalState
    };
  }

  /**
   * Helper: Get dominant emotion
   */
  getDominantEmotion(emotionDistribution) {
    if (!emotionDistribution || Object.keys(emotionDistribution).length === 0) {
      return 'neutral';
    }
    
    return Object.entries(emotionDistribution).reduce((a, b) => 
      emotionDistribution[a[0]] > emotionDistribution[b[0]] ? a : b
    )[0];
  }

  /**
   * Helper: Generate key insights
   */
  generateKeyInsights(aggregateMetrics, trustMetrics) {
    const insights = [];

    if (aggregateMetrics.anxietyRate > 0.3) {
      insights.push({
        type: 'warning',
        message: 'Anxiety rate is elevated. Consider increasing validation messaging.',
        priority: 'high'
      });
    }

    if (trustMetrics.emotionalTrustIndex > 70) {
      insights.push({
        type: 'success',
        message: 'Emotional trust is strong. Users are comfortable with AI interactions.',
        priority: 'medium'
      });
    }

    if (trustMetrics.trustVelocity.trend === 'positive') {
      insights.push({
        type: 'positive',
        message: 'Trust is improving over time. Continue current empathetic approach.',
        priority: 'medium'
      });
    }

    return insights;
  }

  /**
   * Helper: Generate time series data
   */
  generateTimeSeries(days, startValue, endValue) {
    const data = [];
    const increment = (endValue - startValue) / days;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(startValue + (increment * i) + (Math.random() * 5 - 2.5))
      });
    }
    
    return data;
  }

  /**
   * Helper: Get Trust Loop recommendations
   */
  getTrustLoopRecommendations(aggregateMetrics) {
    const recommendations = [];

    if (aggregateMetrics.anxietyRate > 0.4) {
      recommendations.push('Increase validation messaging in user communications');
      recommendations.push('Add more transparency features and explanations');
    }

    if (aggregateMetrics.trustSignalRate < 0.3) {
      recommendations.push('Strengthen empowerment features - give users more control');
      recommendations.push('Improve educational content to build understanding');
    }

    return recommendations;
  }

  /**
   * Helper: Get level details
   */
  getLevelDetails(level) {
    const levels = {
      1: {
        name: 'Awareness',
        emotion: 'Skeptical',
        marketerAction: 'Validate feelings about AI',
        techRole: 'Sentiment analysis',
        trustOutcome: 'Curiosity'
      },
      2: {
        name: 'Engagement',
        emotion: 'Confused',
        marketerAction: 'Explain simply & transparently',
        techRole: 'Natural-language explainability',
        trustOutcome: 'Comfort'
      },
      3: {
        name: 'Empowerment',
        emotion: 'Cautious',
        marketerAction: 'Provide control & customization',
        techRole: 'Adaptive UX + opt-outs',
        trustOutcome: 'Confidence'
      },
      4: {
        name: 'Relationship',
        emotion: 'Trusting',
        marketerAction: 'Collaborate with the user',
        techRole: 'Co-creation & predictive empathy',
        trustOutcome: 'Loyalty'
      }
    };

    return levels[level] || levels[1];
  }
}
