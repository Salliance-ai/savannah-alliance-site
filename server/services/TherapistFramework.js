const EmotionAI = require('./EmotionAI');

/**
 * Therapist Framework - Implements the 4-pillar therapeutic approach for marketing
 * 1. Active Listening (Data Listening)
 * 2. Validation Before Solution
 * 3. Psychological Safety
 * 4. Meeting Users Where They Are
 */
class TherapistFramework {
  constructor() {
    this.emotionAI = new EmotionAI();
    
    // Therapeutic response templates organized by trust level and emotional state
    this.responseTemplates = {
      validation: {
        skeptical: [
          "I understand your hesitation about AI technology - it's completely natural to feel cautious.",
          "Your concerns about AI are valid, and many people share these feelings.",
          "It makes sense that you'd want to be careful when it comes to AI-powered tools."
        ],
        confused: [
          "I can see this might feel overwhelming - let me break this down in simpler terms.",
          "It's okay to feel confused - AI can seem complex, but we're here to make it clear.",
          "Your confusion is understandable - let's take this step by step."
        ],
        anxious: [
          "I notice you might be feeling anxious about this - that's completely understandable.",
          "It's natural to feel concerned about new technology - your feelings are valid.",
          "Many people feel anxious about AI at first - you're not alone in this."
        ],
        frustrated: [
          "I can sense your frustration, and I want to acknowledge that your experience matters.",
          "Your frustration is completely valid - let's work together to improve this.",
          "I hear that this has been frustrating for you - let's find a better way forward."
        ]
      },
      
      explanation: {
        low_trust: [
          "Here's exactly how this works, with complete transparency:",
          "Let me show you step-by-step what happens behind the scenes:",
          "I want to be completely open about how this process works:"
        ],
        medium_trust: [
          "Here's how this feature can help you:",
          "Let me explain the benefits you'll see:",
          "This is designed to make your experience better by:"
        ],
        high_trust: [
          "Based on your preferences, here's what I recommend:",
          "You might find this interesting:",
          "Here's a personalized suggestion for you:"
        ]
      },
      
      empowerment: {
        control_focused: [
          "You're in complete control - you can adjust or turn off any feature at any time.",
          "Here are all the ways you can customize this to work exactly how you want:",
          "You decide what level of AI assistance feels right for you."
        ],
        transparency_focused: [
          "Here's exactly what data we use and why:",
          "You can see all the factors that went into this recommendation:",
          "Complete transparency: here's how we arrived at this suggestion."
        ],
        safety_focused: [
          "Your privacy and security are our top priorities - here's how we protect you:",
          "We've built multiple safeguards to ensure your information stays secure:",
          "You can trust that your data is protected by industry-leading security measures."
        ]
      },
      
      collaboration: {
        co_creation: [
          "What would make this work better for you?",
          "How would you like to customize this experience?",
          "Let's work together to make this perfect for your needs."
        ],
        feedback_seeking: [
          "How does this feel to you?",
          "What's your experience been like so far?",
          "I'd love to hear your thoughts on this."
        ],
        partnership: [
          "We're partners in this - your input shapes how this works.",
          "Think of this as a collaboration between you and our AI.",
          "Together, we can create something that truly works for you."
        ]
      }
    };
    
    // Therapeutic techniques mapping
    this.techniques = {
      active_listening: this.implementActiveListening.bind(this),
      validation: this.implementValidation.bind(this),
      psychological_safety: this.implementPsychologicalSafety.bind(this),
      progressive_disclosure: this.implementProgressiveDisclosure.bind(this),
      empathetic_mirroring: this.implementEmpatheticMirroring.bind(this),
      collaborative_approach: this.implementCollaborativeApproach.bind(this)
    };
  }
  
  /**
   * Main method to generate therapeutic marketing response
   */
  async generateTherapeuticResponse(userInput, emotionalProfile, context = {}) {
    try {
      // Step 1: Active Listening - Analyze the emotional content
      const emotionalAnalysis = await this.emotionAI.analyzeEmotion(userInput, context.source || 'user_input');
      
      // Step 2: Determine therapeutic approach based on trust level and emotional state
      const approach = this.determineTherapeuticApproach(emotionalProfile, emotionalAnalysis);
      
      // Step 3: Generate response using therapeutic framework
      const response = await this.craftTherapeuticResponse(approach, emotionalProfile, emotionalAnalysis, context);
      
      // Step 4: Add safety and empowerment elements
      const enhancedResponse = this.addSafetyElements(response, emotionalProfile);
      
      return {
        response: enhancedResponse,
        approach,
        emotionalAnalysis,
        therapeuticTechniques: approach.techniques,
        trustImpact: this.predictTrustImpact(approach, emotionalProfile),
        recommendations: this.generateFollowUpRecommendations(emotionalProfile, emotionalAnalysis)
      };
      
    } catch (error) {
      console.error('Therapeutic response generation error:', error);
      return this.generateFallbackResponse(userInput, emotionalProfile);
    }
  }
  
  /**
   * Determine the best therapeutic approach based on user's emotional state and trust level
   */
  determineTherapeuticApproach(emotionalProfile, emotionalAnalysis) {
    const trustScore = emotionalProfile.trustScore;
    const primaryEmotion = emotionalProfile.emotionalState.primary;
    const trustLevel = emotionalProfile.trustLevel;
    
    const approach = {
      primaryTechnique: 'validation', // Always start with validation
      secondaryTechniques: [],
      tone: 'empathetic',
      transparencyLevel: 'moderate',
      controlLevel: 'medium',
      techniques: []
    };
    
    // Determine primary approach based on trust score
    if (trustScore < 30) {
      approach.primaryTechnique = 'validation';
      approach.secondaryTechniques = ['psychological_safety', 'progressive_disclosure'];
      approach.tone = 'highly_empathetic';
      approach.transparencyLevel = 'maximum';
      approach.controlLevel = 'high';
    } else if (trustScore < 60) {
      approach.primaryTechnique = 'empathetic_mirroring';
      approach.secondaryTechniques = ['validation', 'progressive_disclosure'];
      approach.tone = 'supportive';
      approach.transparencyLevel = 'high';
      approach.controlLevel = 'medium';
    } else {
      approach.primaryTechnique = 'collaborative_approach';
      approach.secondaryTechniques = ['empathetic_mirroring', 'active_listening'];
      approach.tone = 'partnership';
      approach.transparencyLevel = 'moderate';
      approach.controlLevel = 'low';
    }
    
    // Adjust based on emotional state
    if (primaryEmotion === 'anxious' || primaryEmotion === 'fearful') {
      approach.secondaryTechniques.unshift('psychological_safety');
      approach.controlLevel = 'high';
    }
    
    if (primaryEmotion === 'confused') {
      approach.secondaryTechniques.unshift('progressive_disclosure');
      approach.transparencyLevel = 'high';
    }
    
    if (primaryEmotion === 'frustrated' || primaryEmotion === 'angry') {
      approach.primaryTechnique = 'validation';
      approach.tone = 'highly_empathetic';
    }
    
    // Compile final techniques list
    approach.techniques = [approach.primaryTechnique, ...approach.secondaryTechniques];
    
    return approach;
  }
  
  /**
   * Craft therapeutic response using determined approach
   */
  async craftTherapeuticResponse(approach, emotionalProfile, emotionalAnalysis, context) {
    let response = {
      validation: '',
      explanation: '',
      empowerment: '',
      collaboration: '',
      nextSteps: []
    };
    
    // Apply each therapeutic technique
    for (const technique of approach.techniques) {
      if (this.techniques[technique]) {
        const techniqueResponse = await this.techniques[technique](
          emotionalProfile, 
          emotionalAnalysis, 
          approach, 
          context
        );
        
        // Merge technique responses
        Object.keys(techniqueResponse).forEach(key => {
          if (response[key] && typeof response[key] === 'string') {
            response[key] += techniqueResponse[key] ? ' ' + techniqueResponse[key] : '';
          } else if (Array.isArray(response[key])) {
            response[key] = [...response[key], ...(techniqueResponse[key] || [])];
          } else {
            response[key] = techniqueResponse[key] || response[key];
          }
        });
      }
    }
    
    return response;
  }
  
  /**
   * Therapeutic Technique Implementations
   */
  
  async implementActiveListening(emotionalProfile, emotionalAnalysis, approach, context) {
    const primaryEmotion = emotionalProfile.emotionalState.primary;
    const emotionIntensity = emotionalProfile.emotionalState.intensity;
    
    // Reflect back what we're hearing
    const reflection = this.generateEmotionalReflection(primaryEmotion, emotionIntensity, emotionalAnalysis);
    
    return {
      validation: reflection,
      nextSteps: ['Continue monitoring emotional signals', 'Adjust response based on feedback']
    };
  }
  
  async implementValidation(emotionalProfile, emotionalAnalysis, approach, context) {
    const primaryEmotion = emotionalProfile.emotionalState.primary;
    const validationTemplates = this.responseTemplates.validation[primaryEmotion] || 
                               this.responseTemplates.validation.skeptical;
    
    const validation = this.selectBestTemplate(validationTemplates, emotionalProfile);
    
    return {
      validation,
      nextSteps: ['Provide clear explanation after validation']
    };
  }
  
  async implementPsychologicalSafety(emotionalProfile, emotionalAnalysis, approach, context) {
    const safetyElements = [];
    
    if (emotionalProfile.emotionalNeeds.safety > 7) {
      safetyElements.push("Your privacy and security are completely protected.");
    }
    
    if (emotionalProfile.emotionalNeeds.control > 7) {
      safetyElements.push("You have full control over all AI features and can opt out at any time.");
    }
    
    safetyElements.push("There's no pressure - take your time to explore at your own pace.");
    
    return {
      empowerment: safetyElements.join(' '),
      nextSteps: ['Provide clear opt-out mechanisms', 'Show privacy controls']
    };
  }
  
  async implementProgressiveDisclosure(emotionalProfile, emotionalAnalysis, approach, context) {
    const trustScore = emotionalProfile.trustScore;
    let disclosureLevel;
    
    if (trustScore < 30) {
      disclosureLevel = 'basic';
    } else if (trustScore < 60) {
      disclosureLevel = 'intermediate';
    } else {
      disclosureLevel = 'advanced';
    }
    
    const explanation = this.generateProgressiveExplanation(disclosureLevel, context);
    
    return {
      explanation,
      nextSteps: [`Prepare ${disclosureLevel} level information`, 'Monitor comprehension']
    };
  }
  
  async implementEmpatheticMirroring(emotionalProfile, emotionalAnalysis, approach, context) {
    const mirroredResponse = this.generateEmpatheticMirror(
      emotionalAnalysis.emotions,
      emotionalProfile.communicationStyle.preferredTone
    );
    
    return {
      validation: mirroredResponse,
      nextSteps: ['Match user\'s communication style', 'Adjust tone based on response']
    };
  }
  
  async implementCollaborativeApproach(emotionalProfile, emotionalAnalysis, approach, context) {
    const collaborationTemplates = this.responseTemplates.collaboration.co_creation;
    const collaboration = this.selectBestTemplate(collaborationTemplates, emotionalProfile);
    
    return {
      collaboration,
      nextSteps: ['Invite user input', 'Implement user suggestions', 'Create partnership feeling']
    };
  }
  
  /**
   * Helper methods
   */
  
  generateEmotionalReflection(primaryEmotion, intensity, emotionalAnalysis) {
    const intensityWords = {
      1: 'slightly', 2: 'a bit', 3: 'somewhat', 4: 'moderately', 
      5: 'quite', 6: 'very', 7: 'really', 8: 'extremely', 9: 'incredibly', 10: 'overwhelmingly'
    };
    
    const intensityWord = intensityWords[Math.min(10, Math.max(1, intensity))] || 'somewhat';
    
    return `I can sense that you might be feeling ${intensityWord} ${primaryEmotion} about this.`;
  }
  
  selectBestTemplate(templates, emotionalProfile) {
    // Simple selection based on communication style preference
    // In a more advanced version, this could use ML to select the best template
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }
  
  generateProgressiveExplanation(level, context) {
    const explanations = {
      basic: "Here's what this does in simple terms: it helps make your experience more personalized and helpful.",
      intermediate: "This feature analyzes your preferences to provide better recommendations while keeping your data secure and giving you full control.",
      advanced: "Our AI uses advanced emotional intelligence algorithms to understand your needs and preferences, creating a personalized experience that adapts to your comfort level and builds trust through transparency."
    };
    
    return explanations[level] || explanations.basic;
  }
  
  generateEmpatheticMirror(emotions, preferredTone) {
    const dominantEmotion = Object.keys(emotions).reduce((a, b) => 
      emotions[a] > emotions[b] ? a : b
    );
    
    const mirrors = {
      trust: "I appreciate your openness to this experience.",
      fear: "I understand this might feel uncertain, and that's completely okay.",
      joy: "I'm glad this resonates with you!",
      sadness: "I can see this might be touching on something important to you.",
      anger: "I hear your frustration, and your feelings are completely valid.",
      surprise: "This might be different from what you expected.",
      anticipation: "I can sense your interest in learning more.",
      disgust: "I understand this might not feel right for you."
    };
    
    return mirrors[dominantEmotion] || "I want to understand your experience better.";
  }
  
  addSafetyElements(response, emotionalProfile) {
    const safetyAdditions = [];
    
    if (emotionalProfile.trustScore < 40) {
      safetyAdditions.push("Remember, you're in complete control of this experience.");
    }
    
    if (emotionalProfile.emotionalNeeds.transparency > 7) {
      safetyAdditions.push("I'm happy to explain any part of this in more detail.");
    }
    
    // Add safety elements to empowerment section
    if (safetyAdditions.length > 0) {
      response.empowerment += ' ' + safetyAdditions.join(' ');
    }
    
    return response;
  }
  
  predictTrustImpact(approach, emotionalProfile) {
    let impact = 0;
    
    // Positive impact factors
    if (approach.primaryTechnique === 'validation') impact += 2;
    if (approach.transparencyLevel === 'maximum') impact += 3;
    if (approach.controlLevel === 'high') impact += 2;
    
    // Adjust based on current trust level
    if (emotionalProfile.trustScore < 30) {
      impact *= 1.5; // Higher impact for low trust users
    }
    
    return Math.min(10, Math.max(-5, impact));
  }
  
  generateFollowUpRecommendations(emotionalProfile, emotionalAnalysis) {
    const recommendations = [];
    
    if (emotionalProfile.trustScore < 40) {
      recommendations.push({
        action: 'Follow up with transparency documentation',
        timing: 'within_24_hours',
        priority: 'high'
      });
    }
    
    if (emotionalAnalysis.hesitationMarkers.count > 2) {
      recommendations.push({
        action: 'Offer human support option',
        timing: 'immediate',
        priority: 'medium'
      });
    }
    
    if (emotionalProfile.emotionalState.primary === 'confused') {
      recommendations.push({
        action: 'Provide step-by-step tutorial',
        timing: 'next_interaction',
        priority: 'high'
      });
    }
    
    return recommendations;
  }
  
  generateFallbackResponse(userInput, emotionalProfile) {
    return {
      response: {
        validation: "I want to make sure I understand your needs correctly.",
        explanation: "Let me provide you with clear, helpful information.",
        empowerment: "You're in control of this experience.",
        collaboration: "How can I better assist you?",
        nextSteps: ['Gather more information', 'Provide basic support']
      },
      approach: { primaryTechnique: 'validation', techniques: ['validation'] },
      emotionalAnalysis: null,
      therapeuticTechniques: ['validation'],
      trustImpact: 1,
      recommendations: []
    };
  }
}

module.exports = TherapistFramework;