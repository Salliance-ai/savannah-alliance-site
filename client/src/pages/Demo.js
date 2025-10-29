import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Brain,
  Heart,
  Shield,
  User,
  Bot,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

const Demo = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm EIME™, your Emotionally Intelligent Marketing Engine. I can analyze text for emotional content, generate empathetic responses, and help build trust. Try sending me a message!",
      timestamp: new Date(),
      analysis: null
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    trustScore: 50,
    emotionalState: 'neutral',
    trustLevel: 'awareness',
    interactionCount: 0
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeMessage = async (text) => {
    // Simulate API call to emotion analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock analysis based on keywords
    const analysis = {
      sentiment: {
        polarity: text.includes('bad') || text.includes('hate') ? -0.6 : 
                 text.includes('good') || text.includes('love') ? 0.8 : 0.2,
        confidence: 0.85
      },
      emotions: {
        trust: text.includes('trust') || text.includes('reliable') ? 0.8 : 0.3,
        fear: text.includes('scared') || text.includes('worried') ? 0.7 : 0.1,
        joy: text.includes('happy') || text.includes('excited') ? 0.9 : 0.4,
        anger: text.includes('angry') || text.includes('frustrated') ? 0.8 : 0.1,
        sadness: text.includes('sad') || text.includes('disappointed') ? 0.7 : 0.2,
        surprise: text.includes('surprised') || text.includes('wow') ? 0.8 : 0.3
      },
      trustSignals: {
        score: text.includes('transparent') || text.includes('honest') ? 5 : 
               text.includes('confusing') || text.includes('unclear') ? -3 : 0
      },
      hesitationMarkers: {
        count: (text.match(/maybe|perhaps|i think|not sure/gi) || []).length
      },
      cognitiveLoad: {
        score: Math.min(10, text.split(' ').length / 5)
      }
    };

    return analysis;
  };

  const generateTherapeuticResponse = (analysis, userMessage) => {
    const { emotions, trustSignals, sentiment } = analysis;
    
    let response = '';
    let recommendations = [];

    // Validation phase
    if (sentiment.polarity < -0.3) {
      response += "I can sense that you might be feeling frustrated or concerned about this. Your feelings are completely valid. ";
      recommendations.push({ type: 'validation', action: 'Acknowledge negative emotions' });
    } else if (emotions.fear > 0.5) {
      response += "I understand this might feel uncertain or overwhelming. It's completely natural to feel cautious. ";
      recommendations.push({ type: 'safety', action: 'Address fear with reassurance' });
    } else if (emotions.joy > 0.6) {
      response += "I can feel your positive energy! It's wonderful that you're feeling good about this. ";
      recommendations.push({ type: 'amplification', action: 'Amplify positive emotions' });
    } else {
      response += "Thank you for sharing that with me. I want to make sure I understand your perspective correctly. ";
      recommendations.push({ type: 'active_listening', action: 'Show active listening' });
    }

    // Explanation phase
    if (trustSignals.score < 0) {
      response += "Let me be completely transparent about how this works and what you can expect. ";
      recommendations.push({ type: 'transparency', action: 'Increase transparency' });
    } else {
      response += "Here's how I can help you with this: ";
    }

    // Empowerment phase
    response += "You're in complete control of this experience, and you can adjust or stop at any time. ";
    recommendations.push({ type: 'empowerment', action: 'Emphasize user control' });

    // Collaboration phase
    if (userProfile.trustScore > 60) {
      response += "What would work best for you in this situation?";
      recommendations.push({ type: 'collaboration', action: 'Invite user input' });
    } else {
      response += "How can I better support you with this?";
      recommendations.push({ type: 'support', action: 'Offer additional support' });
    }

    return { response, recommendations };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputText,
      timestamp: new Date(),
      analysis: null
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAnalyzing(true);

    // Analyze the message
    const analysis = await analyzeMessage(inputText);
    
    // Generate therapeutic response
    const { response, recommendations } = generateTherapeuticResponse(analysis, inputText);

    // Update user profile based on analysis
    const trustDelta = analysis.trustSignals.score + (analysis.sentiment.polarity * 5);
    const newTrustScore = Math.max(0, Math.min(100, userProfile.trustScore + trustDelta));
    
    const dominantEmotion = Object.keys(analysis.emotions).reduce((a, b) => 
      analysis.emotions[a] > analysis.emotions[b] ? a : b
    );

    setUserProfile(prev => ({
      ...prev,
      trustScore: newTrustScore,
      emotionalState: dominantEmotion,
      trustLevel: newTrustScore < 30 ? 'awareness' : 
                  newTrustScore < 60 ? 'engagement' :
                  newTrustScore < 80 ? 'empowerment' : 'relationship',
      interactionCount: prev.interactionCount + 1
    }));

    const aiMessage = {
      id: messages.length + 2,
      type: 'ai',
      content: response,
      timestamp: new Date(),
      analysis: {
        ...analysis,
        recommendations,
        trustImpact: trustDelta
      }
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsAnalyzing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      trust: 'text-trust-600 bg-trust-100',
      fear: 'text-red-600 bg-red-100',
      joy: 'text-yellow-600 bg-yellow-100',
      anger: 'text-red-600 bg-red-100',
      sadness: 'text-gray-600 bg-gray-100',
      surprise: 'text-purple-600 bg-purple-100'
    };
    return colors[emotion] || 'text-gray-600 bg-gray-100';
  };

  const getTrustLevelColor = (level) => {
    const colors = {
      awareness: 'text-yellow-600 bg-yellow-100',
      engagement: 'text-blue-600 bg-blue-100',
      empowerment: 'text-purple-600 bg-purple-100',
      relationship: 'text-trust-600 bg-trust-100'
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">
          EIME™ Interactive Demo
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Experience the power of emotionally intelligent AI. Send messages and watch how EIME™ 
          analyzes emotions, builds trust, and generates empathetic responses using our Therapist Framework.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* User Profile Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="trust-card sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Profile</h3>
              <User className="h-5 w-5 text-gray-400" />
            </div>
            
            {/* Trust Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Trust Score</span>
                <span className="text-lg font-bold text-trust-600">{userProfile.trustScore}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill progress-trust transition-all duration-1000" 
                  style={{ width: `${userProfile.trustScore}%` }}
                />
              </div>
            </div>

            {/* Emotional State */}
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-600 block mb-2">Emotional State</span>
              <span className={`emotion-indicator ${getEmotionColor(userProfile.emotionalState)}`}>
                {userProfile.emotionalState}
              </span>
            </div>

            {/* Trust Level */}
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-600 block mb-2">Trust Level</span>
              <span className={`trust-level-indicator ${getTrustLevelColor(userProfile.trustLevel)}`}>
                {userProfile.trustLevel}
              </span>
            </div>

            {/* Interaction Count */}
            <div className="text-sm text-gray-500">
              Interactions: {userProfile.interactionCount}
            </div>
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <div className="trust-card h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-empathy-500 rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">EIME™ Assistant</h3>
                  <p className="text-sm text-gray-500">Emotionally Intelligent AI</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-trust-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-500">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      message.type === 'user' ? 'user-message-bubble' : 'ai-assistant-bubble'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-gray-500' : 'text-white/70'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="ai-assistant-bubble">
                    <div className="flex items-center space-x-2">
                      <div className="loading-spinner h-4 w-4 border-white" />
                      <span className="text-sm">Analyzing emotions and generating response...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={2}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isAnalyzing}
                  className="btn-primary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analysis Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            {/* Latest Analysis */}
            {messages.length > 1 && messages[messages.length - 1].analysis && (
              <div className="trust-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="h-5 w-5 text-primary-600 mr-2" />
                  Latest Analysis
                </h3>
                
                {(() => {
                  const analysis = messages[messages.length - 1].analysis;
                  return (
                    <div className="space-y-4">
                      {/* Sentiment */}
                      <div>
                        <span className="text-sm font-medium text-gray-600 block mb-1">Sentiment</span>
                        <div className="flex items-center space-x-2">
                          <div className={`h-3 w-3 rounded-full ${
                            analysis.sentiment.polarity > 0.3 ? 'bg-trust-500' :
                            analysis.sentiment.polarity < -0.3 ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                          <span className="text-sm text-gray-700">
                            {analysis.sentiment.polarity > 0.3 ? 'Positive' :
                             analysis.sentiment.polarity < -0.3 ? 'Negative' : 'Neutral'}
                          </span>
                        </div>
                      </div>

                      {/* Top Emotions */}
                      <div>
                        <span className="text-sm font-medium text-gray-600 block mb-2">Top Emotions</span>
                        <div className="space-y-1">
                          {Object.entries(analysis.emotions)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 3)
                            .map(([emotion, score]) => (
                              <div key={emotion} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 capitalize">{emotion}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-empathy-500 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${score * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">{Math.round(score * 100)}%</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Trust Impact */}
                      <div>
                        <span className="text-sm font-medium text-gray-600 block mb-1">Trust Impact</span>
                        <div className="flex items-center space-x-2">
                          {analysis.trustImpact > 0 ? (
                            <TrendingUp className="h-4 w-4 text-trust-500" />
                          ) : analysis.trustImpact < 0 ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-gray-500" />
                          )}
                          <span className={`text-sm ${
                            analysis.trustImpact > 0 ? 'text-trust-600' :
                            analysis.trustImpact < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {analysis.trustImpact > 0 ? '+' : ''}{Math.round(analysis.trustImpact)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Recommendations */}
            {messages.length > 1 && messages[messages.length - 1].analysis?.recommendations && (
              <div className="trust-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {messages[messages.length - 1].analysis.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`h-2 w-2 rounded-full ${
                          rec.type === 'validation' ? 'bg-empathy-500' :
                          rec.type === 'safety' ? 'bg-trust-500' :
                          rec.type === 'transparency' ? 'bg-blue-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          {rec.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{rec.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="trust-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setInputText("I'm not sure if I can trust AI with my data")}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Express concern about AI</span>
                  </div>
                </button>
                <button
                  onClick={() => setInputText("This is amazing! I love how helpful this is.")}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-empathy-500" />
                    <span className="text-sm">Show positive emotion</span>
                  </div>
                </button>
                <button
                  onClick={() => setInputText("I'm confused about how this works")}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Express confusion</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Demo;