// API Gateway - Central entry point for all Botlace services

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createRateLimiter } from '../shared/middleware/compliance.js';

// Import service routers
import acreRouter from '../services/acre/index.js';
import clinicalOpsRouter from '../services/clinicalops/index.js';
import careNavRouter from '../services/carenav/index.js';
import patient360Router from '../services/patient360/index.js';
import marketOpsRouter from '../services/marketops/index.js';
import revenueOpsRouter from '../services/revenueops/index.js';
import intelligenceRouter from '../services/intelligence/index.js';
import fhirRouter from '../services/integrations/fhir.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(createRateLimiter(60000, 100)); // 100 requests per minute

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Botlace API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Service routes
app.use('/api/v1/acre', acreRouter);
app.use('/api/v1/clinicalops', clinicalOpsRouter);
app.use('/api/v1/carenav', careNavRouter);
app.use('/api/v1/patient360', patient360Router);
app.use('/api/v1/marketops', marketOpsRouter);
app.use('/api/v1/revenueops', revenueOpsRouter);
app.use('/api/v1/intelligence', intelligenceRouter);
app.use('/api/v1/integrations/fhir', fhirRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Gateway Error]', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Botlace API Gateway running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 Services available at /api/v1/*`);
});

export default app;
