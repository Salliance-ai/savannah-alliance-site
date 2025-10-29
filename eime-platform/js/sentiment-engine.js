/**
 * EIME™ Sentiment Analysis & Emotion Detection Engine
 * Emotional Intelligence Marketing Engine - Core AI Layer
 */

class EmotionDetectionEngine {
    constructor() {
        this.emotionKeywords = {
            anxiety: ['worried', 'concerned', 'nervous', 'uncertain', 'hesitant', 'skeptical', 'afraid'],
            trust: ['confident', 'reliable', 'trustworthy', 'secure', 'safe', 'transparent'],
            curiosity: ['interested', 'wondering', 'curious', 'learning', 'exploring'],
            frustration: ['confused', 'difficult', 'complicated', 'unclear', 'hard to understand'],
            satisfaction: ['happy', 'pleased', 'satisfied', 'great', 'excellent', 'love'],
            distrust: ['suspicious', 'doubtful', 'unsure', 'misleading', 'deceptive']
        };

        this.trustScoreWeights = {
            anxiety: -10,
            distrust: -15,
            frustration: -8,
            curiosity: +5,
            trust: +12,
            satisfaction: +10
        };
    }

    /**
     * Analyze text for emotional content
     * @param {string} text - User input text
     * @returns {Object} Emotional analysis results
     */
    analyzeText(text) {
        const lowerText = text.toLowerCase();
        const emotions = {};
        let totalScore = 0;

        // Detect emotions
        for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
            const matches = keywords.filter(keyword => lowerText.includes(keyword));
            emotions[emotion] = {
                detected: matches.length > 0,
                matches: matches,
                intensity: matches.length
            };

            if (matches.length > 0) {
                totalScore += this.trustScoreWeights[emotion] * matches.length;
            }
        }

        // Calculate trust score (0-100)
        const baseTrustScore = 70; // Neutral starting point
        const trustScore = Math.max(0, Math.min(100, baseTrustScore + totalScore));

        // Determine primary emotion
        const primaryEmotion = this.getPrimaryEmotion(emotions);

        // Generate recommendation
        const recommendation = this.generateRecommendation(primaryEmotion, trustScore);

        return {
            emotions,
            trustScore,
            primaryEmotion,
            recommendation,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get the primary detected emotion
     */
    getPrimaryEmotion(emotions) {
        let maxIntensity = 0;
        let primary = 'neutral';

        for (const [emotion, data] of Object.entries(emotions)) {
            if (data.intensity > maxIntensity) {
                maxIntensity = data.intensity;
                primary = emotion;
            }
        }

        return primary;
    }

    /**
     * Generate marketing recommendation based on emotional state
     */
    generateRecommendation(emotion, trustScore) {
        const recommendations = {
            anxiety: {
                tone: 'Reassuring and validating',
                action: 'Acknowledge concerns before presenting solutions',
                message: 'Show transparency and provide clear explanations',
                example: '"We understand AI can feel overwhelming. Let\'s start with what matters to you."'
            },
            distrust: {
                tone: 'Transparent and evidence-based',
                action: 'Provide social proof and concrete examples',
                message: 'Lead with validation, show rather than tell',
                example: '"Many felt the same way initially. Here\'s how we earn trust step by step."'
            },
            frustration: {
                tone: 'Empathetic and simplifying',
                action: 'Break down complexity, offer guided support',
                message: 'Use plain language and visual aids',
                example: '"Let\'s make this simpler. Here\'s exactly what happens, step by step."'
            },
            curiosity: {
                tone: 'Educational and engaging',
                action: 'Provide detailed information and exploration options',
                message: 'Encourage discovery with interactive demos',
                example: '"Great question! Here\'s how it works behind the scenes..."'
            },
            trust: {
                tone: 'Collaborative and empowering',
                action: 'Offer advanced features and co-creation',
                message: 'Enable deeper customization and control',
                example: '"Ready to take it further? Let\'s customize this to your exact needs."'
            },
            satisfaction: {
                tone: 'Appreciative and growth-oriented',
                action: 'Request feedback and offer expansion',
                message: 'Strengthen relationship through testimonials',
                example: '"We\'re thrilled you\'re loving it! Would you share your experience?"'
            },
            neutral: {
                tone: 'Balanced and informative',
                action: 'Gauge interest with open-ended questions',
                message: 'Provide clear value propositions',
                example: '"What matters most to you in choosing a solution like this?"'
            }
        };

        const rec = recommendations[emotion] || recommendations.neutral;
        rec.trustScore = trustScore;
        rec.aiIntensity = trustScore > 80 ? 'high' : trustScore > 60 ? 'medium' : 'low';

        return rec;
    }

    /**
     * Calculate Emotional Resonance Index (ERI)
     */
    calculateERI(interactions) {
        if (!interactions || interactions.length === 0) return 0;

        const totalResonance = interactions.reduce((sum, interaction) => {
            const analysis = this.analyzeText(interaction.text);
            const positiveEmotions = ['trust', 'curiosity', 'satisfaction'];
            const emotionScore = positiveEmotions.reduce((score, emotion) => {
                return score + (analysis.emotions[emotion]?.intensity || 0);
            }, 0);
            return sum + emotionScore;
        }, 0);

        return Math.min(100, (totalResonance / interactions.length) * 10);
    }

    /**
     * Track Trust Velocity (change in trust over time)
     */
    calculateTrustVelocity(historicalScores) {
        if (historicalScores.length < 2) return 0;

        const recent = historicalScores.slice(-5);
        const older = historicalScores.slice(-10, -5);

        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.length > 0 
            ? older.reduce((a, b) => a + b, 0) / older.length 
            : recentAvg;

        return ((recentAvg - olderAvg) / olderAvg) * 100;
    }

    /**
     * Generate User Emotional Profile
     */
    generateEmotionalProfile(userInteractions) {
        const analyses = userInteractions.map(text => this.analyzeText(text));
        
        const emotionFrequency = {};
        const trustScores = analyses.map(a => a.trustScore);
        
        analyses.forEach(analysis => {
            const emotion = analysis.primaryEmotion;
            emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
        });

        const avgTrustScore = trustScores.reduce((a, b) => a + b, 0) / trustScores.length;
        const trustVelocity = this.calculateTrustVelocity(trustScores);

        return {
            userId: `user_${Date.now()}`,
            averageTrustScore: avgTrustScore.toFixed(1),
            trustVelocity: trustVelocity.toFixed(1),
            dominantEmotions: Object.entries(emotionFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([emotion, count]) => ({ emotion, count })),
            totalInteractions: userInteractions.length,
            comfortLevel: avgTrustScore > 80 ? 'high' : avgTrustScore > 60 ? 'medium' : 'developing',
            recommendedAIIntensity: avgTrustScore > 80 ? 'high' : avgTrustScore > 60 ? 'medium' : 'low',
            nextSteps: this.generateNextSteps(avgTrustScore, trustVelocity)
        };
    }

    /**
     * Generate personalized next steps based on user profile
     */
    generateNextSteps(trustScore, velocity) {
        if (trustScore < 50) {
            return [
                'Focus on validation messaging',
                'Show transparent explanations',
                'Provide human support options',
                'Limit AI automation initially'
            ];
        } else if (trustScore < 70) {
            return [
                'Gradually introduce AI features',
                'Provide "Explain This" widgets',
                'Offer customization controls',
                'Share success stories'
            ];
        } else {
            return [
                'Enable advanced AI features',
                'Offer co-creation opportunities',
                'Request user feedback',
                'Expand personalization depth'
            ];
        }
    }
}

// Therapist Framework Implementation
class TherapistFramework {
    constructor(emotionEngine) {
        this.emotionEngine = emotionEngine;
    }

    /**
     * Active Listening: Detect emotional signals
     */
    activeListening(userFeedback) {
        const analysis = this.emotionEngine.analyzeText(userFeedback);
        
        return {
            emotionalSignals: analysis.emotions,
            hiddenConcerns: this.detectHiddenConcerns(analysis),
            listeningResponse: this.craftListeningResponse(analysis)
        };
    }

    /**
     * Detect hidden concerns in user feedback
     */
    detectHiddenConcerns(analysis) {
        const concerns = [];
        
        if (analysis.emotions.anxiety?.detected) {
            concerns.push({
                type: 'fear_of_loss',
                message: 'User may fear losing control or privacy',
                action: 'Emphasize control features and data transparency'
            });
        }
        
        if (analysis.emotions.frustration?.detected) {
            concerns.push({
                type: 'cognitive_overload',
                message: 'User experiencing information overwhelm',
                action: 'Simplify interface and provide guided tutorials'
            });
        }
        
        if (analysis.emotions.distrust?.detected) {
            concerns.push({
                type: 'credibility_gap',
                message: 'User questioning legitimacy or intentions',
                action: 'Show social proof and third-party validations'
            });
        }
        
        return concerns;
    }

    /**
     * Craft empathetic listening response
     */
    craftListeningResponse(analysis) {
        const emotion = analysis.primaryEmotion;
        const templates = {
            anxiety: "I understand that AI can feel uncertain. Your concerns are completely valid.",
            distrust: "It's smart to be cautious. Let me show you exactly how we protect your interests.",
            frustration: "I hear that this feels complicated. Let's break it down together.",
            curiosity: "Great question! I love that you're digging deeper into how this works.",
            satisfaction: "I'm so glad this is working well for you!",
            trust: "Thank you for your confidence in us. Let's make this even better together."
        };
        
        return templates[emotion] || "I'm here to help. What would be most useful for you?";
    }

    /**
     * Validation Before Solution
     */
    validationBeforeSolution(userConcern) {
        const analysis = this.emotionEngine.analyzeText(userConcern);
        
        const validation = this.generateValidation(analysis.primaryEmotion);
        const solution = analysis.recommendation;
        
        return {
            step1_validate: validation,
            step2_acknowledge: "Your experience matters, and we take this seriously.",
            step3_solution: solution,
            step4_empower: "You're in control of how much AI assistance you want."
        };
    }

    /**
     * Generate validation statement
     */
    generateValidation(emotion) {
        const validations = {
            anxiety: "Many people feel uncertain about AI at first—that's completely normal.",
            distrust: "Skepticism about new technology is healthy and smart.",
            frustration: "When things feel unclear, it's frustrating. We get that.",
            curiosity: "Your curiosity shows you're engaged and thinking critically.",
            satisfaction: "We're grateful you're finding value in this.",
            trust: "Your trust means everything to us."
        };
        
        return validations[emotion] || "We hear you.";
    }

    /**
     * Psychological Safety: Build confidence through transparency
     */
    buildPsychologicalSafety(feature) {
        return {
            progressiveDisclosure: {
                level1: "Simple explanation in plain language",
                level2: "How it works under the hood",
                level3: "Technical details for power users"
            },
            transparencyWidget: {
                title: "How This Recommendation Works",
                explanation: `This suggestion is based on ${feature.dataPoints} similar user patterns.`,
                userControl: "You can always override or customize this.",
                optOut: "Don't want AI suggestions? You can turn this off anytime."
            },
            trustScore: {
                current: 78,
                factors: ["Transparent algorithms", "User control", "Privacy protection"],
                visualization: "Trust thermometer showing your comfort level"
            }
        };
    }

    /**
     * Meeting Users Where They Are: Adaptive AI intensity
     */
    adaptiveRollout(userProfile) {
        const comfort = userProfile.averageTrustScore;
        
        if (comfort < 60) {
            return {
                aiIntensity: 'low',
                features: ['Basic suggestions', 'Manual confirmation required', 'Human support prominent'],
                messaging: 'Human-first with AI assistance',
                pace: 'Gradual introduction'
            };
        } else if (comfort < 80) {
            return {
                aiIntensity: 'medium',
                features: ['Smart automation with transparency', 'Easy opt-outs', 'Explanation widgets'],
                messaging: 'AI-enhanced with full control',
                pace: 'Progressive feature unlock'
            };
        } else {
            return {
                aiIntensity: 'high',
                features: ['Advanced AI', 'Predictive features', 'Co-creation tools'],
                messaging: 'AI-powered collaboration',
                pace: 'Full platform access'
            };
        }
    }
}

// Emotional Trust Loop Implementation
class EmotionalTrustLoop {
    constructor(emotionEngine, therapistFramework) {
        this.emotionEngine = emotionEngine;
        this.therapist = therapistFramework;
        this.loopHistory = [];
    }

    /**
     * Execute complete trust loop cycle
     */
    executeCycle(userInput, userProfile) {
        const cycle = {
            timestamp: new Date().toISOString(),
            
            // 1. Listen
            listen: this.emotionEngine.analyzeText(userInput),
            
            // 2. Validate
            validate: this.therapist.validationBeforeSolution(userInput),
            
            // 3. Empower
            empower: this.generateEmpowermentOptions(userProfile),
            
            // 4. Educate
            educate: this.generateEducationalContent(userInput),
            
            // 5. Evolve
            evolve: this.updateEmpathyModel(userInput, userProfile)
        };
        
        this.loopHistory.push(cycle);
        return cycle;
    }

    /**
     * Generate empowerment options
     */
    generateEmpowermentOptions(userProfile) {
        return {
            customization: [
                { option: 'AI Suggestion Level', current: userProfile.recommendedAIIntensity },
                { option: 'Data Sharing Preferences', current: 'customizable' },
                { option: 'Communication Style', current: 'adaptive' }
            ],
            controls: [
                'Pause AI recommendations',
                'Request human review',
                'Export your data anytime',
                'Delete your profile'
            ],
            transparency: {
                dataUsage: 'See exactly how we use your data',
                algorithmExplainer: 'Understand our AI decisions',
                privacyDashboard: 'Manage all privacy settings'
            }
        };
    }

    /**
     * Generate educational content
     */
    generateEducationalContent(userInput) {
        const analysis = this.emotionEngine.analyzeText(userInput);
        
        return {
            explainer: `Here's how we're helping: ${analysis.recommendation.message}`,
            protection: 'Your data is encrypted, never sold, and you can delete it anytime.',
            personalization: `We've customized this experience based on your comfort level (${analysis.trustScore}/100).`,
            nextSteps: analysis.recommendation.example
        };
    }

    /**
     * Update empathy model with new learnings
     */
    updateEmpathyModel(userInput, userProfile) {
        const newInsight = {
            pattern: this.emotionEngine.getPrimaryEmotion(
                this.emotionEngine.analyzeText(userInput).emotions
            ),
            context: userProfile.comfortLevel,
            improvement: 'Model updated to better serve similar user states'
        };
        
        return {
            modelUpdated: true,
            newInsight,
            feedbackLoop: 'Your interaction helps us serve you and others better',
            psychologicalSafety: 'All learning is privacy-preserving and aggregated'
        };
    }

    /**
     * Get trust loop analytics
     */
    getLoopAnalytics() {
        if (this.loopHistory.length === 0) return null;
        
        const trustScores = this.loopHistory.map(cycle => cycle.listen.trustScore);
        const avgTrust = trustScores.reduce((a, b) => a + b, 0) / trustScores.length;
        const trustGrowth = trustScores[trustScores.length - 1] - trustScores[0];
        
        return {
            totalCycles: this.loopHistory.length,
            averageTrustScore: avgTrust.toFixed(1),
            trustGrowth: trustGrowth.toFixed(1),
            strengthScore: avgTrust > 80 ? 'Strong' : avgTrust > 60 ? 'Developing' : 'Building',
            recommendation: avgTrust > 80 
                ? 'User ready for advanced AI features'
                : avgTrust > 60
                ? 'Continue building trust with transparency'
                : 'Focus on validation and human support'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EmotionDetectionEngine,
        TherapistFramework,
        EmotionalTrustLoop
    };
}
