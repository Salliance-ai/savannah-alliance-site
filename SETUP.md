# Botlace Platform - Setup Guide

## Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose (optional, for containerized deployment)
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)
- MongoDB 7+ (if not using Docker)

## Quick Start with Docker

1. **Clone and navigate to the project**:
```bash
cd /workspace
```

2. **Copy environment variables**:
```bash
cp .env.example .env
```

3. **Edit `.env` with your configuration** (optional for local dev)

4. **Start all services**:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- MongoDB on port 27017
- API Gateway on port 3000
- ACRE service on port 3001
- Frontend on port 5173

5. **Access the application**:
- Frontend: http://localhost:5173
- API Gateway: http://localhost:3000
- Health check: http://localhost:3000/health

## Manual Setup (Without Docker)

### 1. Install Dependencies

**Backend**:
```bash
cd backend
npm install
```

**Frontend**:
```bash
cd frontend
npm install
```

### 2. Set Up Databases

**PostgreSQL**:
```bash
# Create database
createdb botlace

# Or using psql
psql -U postgres
CREATE DATABASE botlace;
```

**Redis**:
```bash
# Start Redis server
redis-server
```

**MongoDB**:
```bash
# Start MongoDB
mongod
```

### 3. Configure Environment

Copy and edit `.env`:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Start Services

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

## Development Workflow

### Backend Development

1. **Service Structure**: Each service is in `backend/services/[service-name]/`
2. **Shared Code**: Common utilities, types, and middleware in `backend/shared/`
3. **API Gateway**: Routes requests to appropriate services in `backend/gateway/`

### Frontend Development

1. **Pages**: Main pages in `frontend/src/pages/`
2. **Components**: Reusable components in `frontend/src/components/`
3. **API Calls**: Use axios to call backend APIs (configured via Vite proxy)

### Testing

**Backend**:
```bash
cd backend
npm test
```

**Frontend**:
```bash
cd frontend
npm test
```

### Building for Production

**Backend**:
```bash
cd backend
npm run build
```

**Frontend**:
```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

## API Testing

### Using cURL

**Health Check**:
```bash
curl http://localhost:3000/health
```

**ACRE Reasoning** (requires authentication):
```bash
curl -X POST http://localhost:3000/api/v1/acre/reason \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "context": {
      "patientId": "pat_123",
      "clinicalData": {}
    },
    "task": "documentation"
  }'
```

### Using Postman

Import the API collection (to be created) or manually test endpoints.

## Database Migrations

Currently, the platform uses TypeScript types for data modeling. In production:

1. Use a migration tool like TypeORM, Prisma, or Knex.js
2. Set up database schema migrations
3. Seed initial data (tenants, providers, etc.)

## Environment Variables

Key environment variables:

- `NODE_ENV`: `development` | `production`
- `PORT`: API Gateway port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `MONGO_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `FHIR_SERVER_URL`: FHIR server endpoint
- `GHL_API_KEY`: GoHighLevel API key
- `EPIC_CLIENT_ID`, `EPIC_CLIENT_SECRET`: Epic integration credentials

## Common Issues

### Port Already in Use

If ports are already in use, modify:
- `docker-compose.yml` for Docker
- `.env` for manual setup
- `frontend/vite.config.ts` for frontend port

### Database Connection Errors

1. Verify database is running
2. Check connection strings in `.env`
3. Ensure databases are created
4. Verify credentials

### CORS Errors

Update `FRONTEND_URL` in `.env` and backend CORS settings if frontend runs on different port/domain.

## Next Steps

1. **Set up authentication**: Implement proper user registration and login
2. **Database persistence**: Add actual database queries (currently using simulations)
3. **ML Models**: Integrate real TensorFlow.js or Python ML models
4. **External integrations**: Configure Epic, ICANotes, Tebra, GHL credentials
5. **Testing**: Write comprehensive unit and integration tests
6. **CI/CD**: Set up continuous integration/deployment
7. **Monitoring**: Add logging, metrics, and alerting

## Production Deployment

See `ARCHITECTURE.md` for production considerations:

1. Use managed databases (AWS RDS, GCP Cloud SQL)
2. Set up load balancing
3. Configure SSL/TLS certificates
4. Implement proper secrets management
5. Set up monitoring and alerting
6. Configure backup and disaster recovery
7. Review and harden security settings

## Support

For issues and questions:
- Review `ARCHITECTURE.md` for system design
- Check service health endpoints: `/health` on each service
- Review logs in Docker containers: `docker-compose logs [service-name]`
