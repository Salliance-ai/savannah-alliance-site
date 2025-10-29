const natural = require('natural');
const sentiment = require('sentiment');
const compromise = require('compromise');
const OpenAI = require('openai');

class EmotionAI {
  constructor() {
    this.sentimentAnalyzer = new sentiment();
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    
    // Initialize OpenAI if API key is provided
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    
    // Emotional keywords mapping
    this.emotionKeywords = {
      trust: ['trust', 'reliable', 'confident', 'secure', 'safe', 'dependable', 'honest'],
      fear: ['afraid', 'scared', 'worried', 'anxious', 'nervous', 'uncertain', 'doubt'],
      anger: ['angry', 'frustrated', 'annoyed', 'upset', 'mad', 'irritated', 'furious'],
      joy: ['happy', 'excited', 'pleased', 'satisfied', 'delighted', 'thrilled', 'glad'],
      sadness: ['sad', 'disappointed', 'unhappy', 'depressed', 'down', 'upset', 'discouraged'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected', 'wow'],
      anticipation: ['excited', 'eager', 'looking forward', 'anticipating', 'expecting'],
      disgust: ['disgusted', 'revolted', 'sick', 'appalled', 'repulsed']
    };
    
    // Trust indicators
    this.trustIndicators = {
      positive: ['transparent', 'clear', 'honest', 'open', 'reliable', 'consistent', 'helpful'],
      negative: ['confusing', 'hidden', 'unclear', 'suspicious', 'unreliable', 'inconsistent']
    };
    
    // Hesitation markers
    this.hesitationMarkers = [
      'not sure', 'maybe', 'perhaps', 'i think', 'i guess', 'probably', 'might be',
      'could be', 'seems like', 'appears to', 'i believe', 'i suppose'
    ];
  }
  
  /**
   * Analyze emotional content from text
   */
  async analyzeEmotion(text, source = 'unknown') {
    try {
      const analysis = {
        timestamp: new Date(),
        source,
        originalText: text,
        processedText: this.preprocessText(text),
        sentiment: this.analyzeSentiment(text),
        emotions: this.detectEmotions(text),
        trustSignals: this.analyzeTrustSignals(text),
        hesitationMarkers: this.detectHesitation(text),
        cognitiveLoad: this.assessCognitiveLoad(text),
        recommendations: []
      };
      
      // Enhanced analysis with OpenAI if available
      if (this.openai) {
        analysis.aiInsights = await this.getAIInsights(text);
      }
      
      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);
      
      return analysis;
    } catch (error) {
      console.error('Error in emotion analysis:', error);
      return this.getDefaultAnalysis(text, source);
    }
  }
  
  /**
   * Preprocess text for analysis
   */
  preprocessText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Analyze sentiment using multiple approaches
   */
  analyzeSentiment(text) {
    const basicSentiment = this.sentimentAnalyzer.analyze(text);
    const doc = compromise(text);
    
    return {
      polarity: basicSentiment.score / Math.max(1, Math.abs(basicSentiment.score)) || 0,
      intensity: Math.min(1, Math.abs(basicSentiment.score) / 10),
      confidence: this.calculateConfidence(basicSentiment),
      comparative: basicSentiment.comparative,
      tokens: basicSentiment.tokens,
      positive: basicSentiment.positive,
      negative: basicSentiment.negative
    };
  }
  
  /**
   * Detect specific emotions using keyword matching and NLP
   */
  detectEmotions(text) {
    const processedText = this.preprocessText(text);
    const tokens = this.tokenizer.tokenize(processedText);
    const emotions = {};
    
    // Initialize emotions
    Object.keys(this.emotionKeywords).forEach(emotion => {
      emotions[emotion] = 0;
    });
    
    // Count emotion keywords
    tokens.forEach(token => {
      const stemmed = this.stemmer.stem(token);
      
      Object.keys(this.emotionKeywords).forEach(emotion => {
        const keywords = this.emotionKeywords[emotion];
        if (keywords.some(keyword => 
          token.includes(keyword) || 
          stemmed.includes(this.stemmer.stem(keyword))
        )) {
          emotions[emotion] += 1;
        }
      });
    });
    
    // Normalize scores
    const maxScore = Math.max(...Object.values(emotions), 1);
    Object.keys(emotions).forEach(emotion => {
      emotions[emotion] = emotions[emotion] / maxScore;
    });
    
    return emotions;
  }
  
  /**
   * Analyze trust signals in text
   */
  analyzeTrustSignals(text) {
    const processedText = this.preprocessText(text);
    let trustScore = 0;
    const signals = { positive: [], negative: [] };
    
    // Check for positive trust indicators
    this.trustIndicators.positive.forEach(indicator => {
      if (processedText.includes(indicator)) {
        trustScore += 1;
        signals.positive.push(indicator);
      }
    });
    
    // Check for negative trust indicators
    this.trustIndicators.negative.forEach(indicator => {
      if (processedText.includes(indicator)) {
        trustScore -= 1;
        signals.negative.push(indicator);
      }
    });
    
    return {
      score: Math.max(-10, Math.min(10, trustScore)),
      signals,
      trustLevel: this.categorizeTrustLevel(trustScore)
    };
  }
  
  /**
   * Detect hesitation markers
   */
  detectHesitation(text) {
    const processedText = this.preprocessText(text);
    const detectedMarkers = [];
    
    this.hesitationMarkers.forEach(marker => {
      if (processedText.includes(marker)) {
        detectedMarkers.push(marker);
      }
    });
    
    return {
      count: detectedMarkers.length,
      markers: detectedMarkers,
      hesitationLevel: this.categorizeHesitationLevel(detectedMarkers.length)
    };
  }
  
  /**
   * Assess cognitive load of text
   */
  assessCognitiveLoad(text) {
    const doc = compromise(text);
    const sentences = doc.sentences().out('array');
    const words = doc.terms().out('array');
    
    const avgWordsPerSentence = words.length / Math.max(1, sentences.length);
    const complexWords = words.filter(word => word.length > 6).length;
    const complexityRatio = complexWords / Math.max(1, words.length);
    
    const cognitiveLoad = (avgWordsPerSentence * 0.1) + (complexityRatio * 10);
    
    return {
      score: Math.min(10, cognitiveLoad),
      level: this.categorizeCognitiveLoad(cognitiveLoad),
      metrics: {
        wordCount: words.length,
        sentenceCount: sentences.length,
        avgWordsPerSentence,
        complexWords,
        complexityRatio
      }
    };
  }
  
  /**
   * Get AI insights using OpenAI
   */
  async getAIInsights(text) {
    if (!this.openai) return null;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert in emotional intelligence and customer psychology. Analyze the following text for emotional state, trust indicators, and provide empathetic marketing recommendations. Respond in JSON format with: emotionalState, trustLevel, empathyRecommendations, and riskFactors.`
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      return null;
    }
  }
  
  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Trust-based recommendations
    if (analysis.trustSignals.score < -2) {
      recommendations.push({
        type: 'trust_building',
        priority: 'high',
        action: 'Focus on transparency and validation',
        reason: 'Low trust signals detected'
      });
    }
    
    // Hesitation-based recommendations
    if (analysis.hesitationMarkers.count > 2) {
      recommendations.push({
        type: 'reassurance',
        priority: 'medium',
        action: 'Provide clear explanations and support options',
        reason: 'High hesitation detected'
      });
    }
    
    // Emotion-based recommendations
    if (analysis.emotions.fear > 0.5) {
      recommendations.push({
        type: 'safety',
        priority: 'high',
        action: 'Emphasize security and control features',
        reason: 'Fear emotions detected'
      });
    }
    
    if (analysis.emotions.trust > 0.5) {
      recommendations.push({
        type: 'advancement',
        priority: 'low',
        action: 'Introduce advanced AI features',
        reason: 'High trust levels detected'
      });
    }
    
    // Cognitive load recommendations
    if (analysis.cognitiveLoad.score > 7) {
      recommendations.push({
        type: 'simplification',
        priority: 'medium',
        action: 'Simplify language and reduce complexity',
        reason: 'High cognitive load detected'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Helper methods for categorization
   */
  calculateConfidence(sentimentResult) {
    const wordCount = sentimentResult.tokens.length;
    const scoreIntensity = Math.abs(sentimentResult.score);
    return Math.min(1, (scoreIntensity + wordCount) / 20);
  }
  
  categorizeTrustLevel(score) {
    if (score >= 3) return 'high';
    if (score >= 0) return 'medium';
    if (score >= -2) return 'low';
    return 'very_low';
  }
  
  categorizeHesitationLevel(count) {
    if (count === 0) return 'none';
    if (count <= 2) return 'low';
    if (count <= 4) return 'medium';
    return 'high';
  }
  
  categorizeCognitiveLoad(score) {
    if (score <= 3) return 'low';
    if (score <= 6) return 'medium';
    return 'high';
  }
  
  /**
   * Default analysis for error cases
   */
  getDefaultAnalysis(text, source) {
    return {
      timestamp: new Date(),
      source,
      originalText: text,
      sentiment: { polarity: 0, intensity: 0, confidence: 0 },
      emotions: Object.keys(this.emotionKeywords).reduce((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {}),
      trustSignals: { score: 0, signals: { positive: [], negative: [] }, trustLevel: 'medium' },
      hesitationMarkers: { count: 0, markers: [], hesitationLevel: 'none' },
      cognitiveLoad: { score: 5, level: 'medium' },
      recommendations: [],
      error: 'Analysis failed, using default values'
    };
  }
}

module.exports = EmotionAI;