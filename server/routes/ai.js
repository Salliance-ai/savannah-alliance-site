const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { multiTenantMiddleware } = require('../middleware/multiTenant');
const aiEngine = require('../services/aiEngine');
const logger = require('../utils/logger');

// Apply middleware
router.use(auth);
router.use(multiTenantMiddleware());

// AI chat assistant endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Process AI chat request
    const response = await aiEngine.processChatMessage({
      message,
      context: {
        ...context,
        userId: req.user.id,
        clinicId: req.clinicId,
        userRole: req.user.role
      },
      sessionId
    });

    logger.logAIOperation('CHAT_INTERACTION', {
      userId: req.user.id,
      clinicId: req.clinicId,
      messageLength: message.length,
      responseLength: response.message.length
    });

    res.json(response);

  } catch (error) {
    logger.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process AI chat message' });
  }
});

// AI insights generation
router.post('/insights', async (req, res) => {
  try {
    const { type, data, parameters } = req.body;

    const insights = await aiEngine.generateInsights({
      type,
      data,
      parameters,
      context: {
        userId: req.user.id,
        clinicId: req.clinicId,
        userRole: req.user.role
      }
    });

    logger.logAIOperation('INSIGHTS_GENERATED', {
      type,
      userId: req.user.id,
      clinicId: req.clinicId,
      insightsCount: insights.length
    });

    res.json({ insights });

  } catch (error) {
    logger.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to generate AI insights' });
  }
});

module.exports = router;