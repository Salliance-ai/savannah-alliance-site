/**
 * Botlace API Gateway
 * GraphQL Federation + REST API Entry Point
 */

import express, { Application } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import { createRateLimiter } from './middleware/rateLimiter';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { healthCheckRouter } from './routes/health';
import { webhookRouter } from './routes/webhooks';

dotenv.config();

const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Initialize Redis
const redis = new Redis(REDIS_URL);

// Initialize Express
const app: Application = express();

// Security & Performance Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(json({ limit: '10mb' }));

// Rate Limiting
const rateLimiter = createRateLimiter(redis);
app.use(rateLimiter);

// Health Check Routes (before auth)
app.use('/health', healthCheckRouter);

// Webhook Routes (custom auth)
app.use('/webhooks', webhookRouter);

// Apollo Gateway Configuration
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'clinical-ops', url: process.env.CLINICAL_OPS_SERVICE_URL || 'http://clinical-ops-service:3002/graphql' },
      { name: 'scheduling', url: process.env.SCHEDULING_SERVICE_URL || 'http://scheduling-service:3003/graphql' },
      { name: 'patient360', url: process.env.PATIENT360_SERVICE_URL || 'http://patient360-service:3004/graphql' },
      { name: 'marketops-crm', url: process.env.MARKETOPS_CRM_SERVICE_URL || 'http://marketops-crm-service:3005/graphql' },
      { name: 'revenue-ops', url: process.env.REVENUE_OPS_SERVICE_URL || 'http://revenue-ops-service:3006/graphql' },
      { name: 'enterprise-intelligence', url: process.env.ENTERPRISE_INTELLIGENCE_SERVICE_URL || 'http://enterprise-intelligence-service:3007/graphql' },
      { name: 'auth', url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001/graphql' },
    ],
  }),
});

// Initialize Apollo Server
async function startApolloServer() {
  const server = new ApolloServer({
    gateway,
    plugins: [
      // Add custom plugins here (logging, tracing, etc.)
    ],
  });

  await server.start();

  // GraphQL endpoint with authentication
  app.use(
    '/graphql',
    authMiddleware,
    expressMiddleware(server, {
      context: async ({ req }) => ({
        user: (req as any).user,
        organizationId: (req as any).organizationId,
        redis,
      }),
    })
  );

  console.log(`🚀 API Gateway ready at http://localhost:${PORT}/graphql`);
}

// REST API Routes
app.get('/', (req, res) => {
  res.json({
    service: 'Botlace API Gateway',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      graphql: '/graphql',
      health: '/health',
      webhooks: '/webhooks',
    },
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
startApolloServer().then(() => {
  app.listen(PORT, () => {
    console.log(`🏥 Botlace Platform API Gateway`);
    console.log(`📡 Server listening on port ${PORT}`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await redis.quit();
  process.exit(0);
});
