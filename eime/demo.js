/**
 * EIME Platform Demo Script
 * Populates the system with sample data for demonstration
 */

import { EmotionalDataLayer } from './src/layers/emotionalDataLayer.js';
import { EITranslator } from './src/layers/eiTranslator.js';
import { EmpathyEngine } from './src/layers/empathyEngine.js';

const emotionalDataLayer = new EmotionalDataLayer();
const eiTranslator = new EITranslator(emotionalDataLayer);
const empathyEngine = new EmpathyEngine(emotionalDataLayer, eiTranslator);

// Sample texts representing different emotional states
const sampleInteractions = [
  {
    userId: 'user1',
    texts: [
      "I'm not sure I trust AI recommendations. How does this work?",
      "This seems confusing. Can someone explain it to me?",
      "I need more control over what AI does."
    ]
  },
  {
    userId: 'user2',
    texts: [
      "This is interesting! Tell me more about how it works.",
      "I love how transparent this is about AI usage.",
      "The explanations are really helpful. Thank you!"
    ]
  },
  {
    userId: 'user3',
    texts: [
      "I'm worried about my data being used by AI.",
      "Can I opt out of AI features?",
      "I don't understand why AI is necessary here."
    ]
  },
  {
    userId: 'user4',
    texts: [
      "The AI suggestions are really helpful!",
      "I appreciate how personalized this feels.",
      "This has been working great for me. Love it!"
    ]
  }
];

async function runDemo() {
  console.log('🧠 EIME Platform Demo - Populating Sample Data\n');
  console.log('═'.repeat(60));

  // Process sample interactions
  for (const user of sampleInteractions) {
    console.log(`\n📊 Processing interactions for ${user.userId}...`);
    
    for (const text of user.texts) {
      await emotionalDataLayer.analyzeSentiment(
        text,
        'demo-interaction',
        user.userId
      );
    }

    // Generate emotional profile
    console.log(`\n✨ Generating emotional profile for ${user.userId}...`);
    const profile = await eiTranslator.generateEmotionalProfile(user.userId);
    
    console.log(`   Primary Emotion: ${profile.primaryEmotion}`);
    console.log(`   Trust Paradox Level: ${profile.trustParadoxLevel} - ${profile.trustLevelDescription}`);
    console.log(`   Emotional State: ${profile.emotionalState}`);
    
    // Get trust score
    const trustScore = await empathyEngine.calculateTrustScore(user.userId);
    console.log(`   Trust Score: ${Math.round(trustScore)}/100`);

    // Get recommendation
    const recommendation = await empathyEngine.recommendTone(
      user.userId,
      'demo-context',
      trustScore
    );
    
    console.log(`   Recommended Tone: ${recommendation.recommendation.tone}`);
    console.log(`   AI Intensity: ${recommendation.recommendation.aiIntensity}`);
  }

  // Show aggregate metrics
  console.log('\n' + '═'.repeat(60));
  console.log('\n📈 Aggregate Platform Metrics:\n');
  
  const metrics = emotionalDataLayer.getAggregateMetrics();
  console.log(`   Total Users: ${metrics.totalUsers}`);
  console.log(`   Total Interactions: ${metrics.totalInteractions}`);
  console.log(`   Anxiety Rate: ${(metrics.anxietyRate * 100).toFixed(1)}%`);
  console.log(`   Trust Signal Rate: ${(metrics.trustSignalRate * 100).toFixed(1)}%`);
  console.log(`   Emotion Distribution:`);
  
  for (const [emotion, count] of Object.entries(metrics.emotionDistribution)) {
    console.log(`     - ${emotion}: ${count}`);
  }

  console.log('\n✅ Demo complete! Start the server to view the dashboard.');
  console.log('   Run: npm start\n');
}

runDemo().catch(console.error);
