import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { EmotionalDataLayer } from './src/layers/emotionalDataLayer.js';
import { EITranslator } from './src/layers/eiTranslator.js';
import { EmpathyEngine } from './src/layers/empathyEngine.js';
import { TrustDashboardAPI } from './src/api/trustDashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Initialize EIME layers
const emotionalDataLayer = new EmotionalDataLayer();
const eiTranslator = new EITranslator();
const empathyEngine = new EmpathyEngine();
const trustDashboard = new TrustDashboardAPI(emotionalDataLayer, eiTranslator, empathyEngine);

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'EIME Platform Online', version: '1.0.0' });
});

// Emotional Data Layer APIs
app.post('/api/analyze-sentiment', async (req, res) => {
  try {
    const { text, source, userId } = req.body;
    const result = await emotionalDataLayer.analyzeSentiment(text, source, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze-emotion', async (req, res) => {
  try {
    const { text, source, userId } = req.body;
    const result = await emotionalDataLayer.detectEmotions(text, source, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI-EI Translator APIs
app.post('/api/generate-emotional-profile', async (req, res) => {
  try {
    const { userId } = req.body;
    const profile = await eiTranslator.generateEmotionalProfile(userId);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/map-behavior-to-emotion', async (req, res) => {
  try {
    const { behaviors } = req.body;
    const mapping = await eiTranslator.mapBehaviorToEmotionalNeeds(behaviors);
    res.json(mapping);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Empathy Engine APIs
app.post('/api/recommend-tone', async (req, res) => {
  try {
    const { userId, context, trustScore } = req.body;
    const recommendation = await empathyEngine.recommendTone(userId, context, trustScore);
    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user-trust-score/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const score = await empathyEngine.calculateTrustScore(userId);
    res.json({ userId, trustScore: score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trust Dashboard APIs
app.get('/api/dashboard/overview', async (req, res) => {
  try {
    const overview = await trustDashboard.getOverview();
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const metrics = await trustDashboard.getTrustMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard/trust-loop', async (req, res) => {
  try {
    const loopData = await trustDashboard.getTrustLoopAnalytics();
    res.json(loopData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:userId/trust-paradox-level', async (req, res) => {
  try {
    const { userId } = req.params;
    const level = await trustDashboard.getTrustParadoxLevel(userId);
    res.json(level);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🧠 EIME Platform running on http://localhost:${PORT}`);
  console.log(`💡 Emotional Intelligence Beats Algorithms`);
});
