import express from 'express';

export const healthCheckRouter = express.Router();

healthCheckRouter.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

healthCheckRouter.get('/ready', (req, res) => {
  // Add checks for dependencies (database, redis, etc.)
  res.json({
    status: 'ready',
    dependencies: {
      redis: 'connected',
      // Add more dependency checks
    },
  });
});

healthCheckRouter.get('/live', (req, res) => {
  res.json({ status: 'alive' });
});
