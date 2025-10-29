# Botlace Platform - Quick Start Guide
## Get Up and Running in 10 Minutes

---

## Prerequisites

Before you begin, ensure you have:
- ✅ **Node.js 20+** installed ([Download](https://nodejs.org/))
- ✅ **Docker Desktop** running ([Download](https://www.docker.com/))
- ✅ **Git** installed

---

## 🚀 5-Step Quick Start

### Step 1: Clone and Install
```bash
# Clone the repository
git clone https://github.com/your-org/botlace-platform.git
cd botlace-platform

# Install dependencies
npm install
```

### Step 2: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration (use defaults for local dev)
nano .env
```

### Step 3: Start Infrastructure
```bash
# Start PostgreSQL, Redis, MongoDB, Kafka, and Elasticsearch
docker-compose up -d postgres redis mongodb kafka zookeeper elasticsearch

# Wait 30 seconds for services to be ready
sleep 30

# Verify services are running
docker-compose ps
```

### Step 4: Initialize Database
```bash
# Run database migrations (once services are implemented)
# npm run db:migrate

# For now, database will auto-initialize
echo "Database ready for migrations"
```

### Step 5: Start Development Servers
```bash
# Start all microservices in development mode
npm run dev

# OR start individual services
npm run start:api-gateway
```

---

## 📍 Access Points

Once services are running, access them at:

| Service | URL | Description |
|---------|-----|-------------|
| **Landing Page** | http://localhost:3100 | Marketing website |
| **API Gateway** | http://localhost:3000 | REST API endpoint |
| **GraphQL Playground** | http://localhost:3000/graphql | GraphQL IDE |
| **Health Check** | http://localhost:3000/health | Service status |

### Database Access
```bash
# PostgreSQL
psql -h localhost -p 5432 -U botlace -d botlace
# Password: dev_password_change_in_prod

# Redis CLI
docker exec -it botlace-redis redis-cli

# MongoDB
docker exec -it botlace-mongodb mongosh -u botlace -p dev_password_change_in_prod
```

---

## 🧪 Quick Test

### Test API Gateway
```bash
# Health check
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "api-gateway",
#   "timestamp": "2025-10-29T10:00:00.000Z",
#   "uptime": 123.456
# }
```

### Test GraphQL (once running)
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

---

## 🛠️ Development Workflow

### Project Structure
```
botlace-platform/
├── backend/services/          # Microservices
│   ├── api-gateway/          # ✅ GraphQL Federation
│   ├── auth/                 # 📝 To implement
│   └── ...
├── backend/shared/           # Shared libraries
│   ├── types/                # ✅ FHIR types
│   └── ...
├── frontend/                 # React/Next.js app
└── infrastructure/           # Kubernetes & Terraform
```

### Common Commands

```bash
# Development
npm run dev                    # Start all services
npm run start:api-gateway      # Start single service
npm run build                  # Build all services

# Testing
npm run test                   # Run all tests
npm run lint                   # Lint code
npm run lint:fix               # Fix linting issues

# Docker
docker-compose up -d           # Start all containers
docker-compose logs -f         # View logs
docker-compose down            # Stop all containers
docker-compose down -v         # Stop and remove volumes

# Database
npm run db:migrate             # Run migrations
npm run db:seed                # Seed test data
```

---

## 📝 Next Steps for Developers

### 1. Implement Auth Service
```bash
cd backend/services/auth
# Implement:
# - User registration/login
# - JWT token generation
# - OAuth 2.0 providers
# - RBAC middleware
```

### 2. Build Clinical Ops Service
```bash
cd backend/services/clinical-ops
# Implement:
# - Clinical note generation (AI)
# - ICD-10 coding suggestions
# - Treatment plan support
# - FHIR resource management
```

### 3. Develop Frontend
```bash
cd frontend
# Implement:
# - Provider dashboard
# - Patient portal
# - Admin console
# - Executive dashboard
```

### 4. Integrate FHIR Connectors
```bash
cd backend/shared/fhir-integration
# Implement:
# - Epic SMART on FHIR
# - ICANotes API client
# - Tebra connector
# - Bidirectional sync engine
```

### 5. Build AI Engine
```bash
cd backend/shared/ai-engine
# Implement:
# - ClinicalBERT model loading
# - NER pipeline
# - ICD-10 classifier
# - Treatment plan generator
```

---

## 🐛 Troubleshooting

### Services Won't Start

**Problem**: Docker services failing to start

**Solution**:
```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Restart Docker Desktop

# Start fresh
docker-compose up -d
```

### Port Already in Use

**Problem**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3001 npm run start:api-gateway
```

### Database Connection Failed

**Problem**: `connection refused` to PostgreSQL

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### TypeScript Compilation Errors

**Problem**: Type errors when running services

**Solution**:
```bash
# Clean build artifacts
rm -rf dist/
rm -rf node_modules/

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

---

## 📚 Documentation Links

- **README**: [README.md](./README.md) - Full platform documentation
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical deep-dive
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- **Summary**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview

---

## 💡 Pro Tips

### Use VSCode Workspaces
```bash
# Open each service in its own VSCode window
code backend/services/api-gateway
code backend/services/clinical-ops
```

### Use Kubernetes Locally
```bash
# Start Minikube
minikube start

# Deploy to local cluster
kubectl apply -f infrastructure/kubernetes/

# Port forward services
kubectl port-forward -n botlace svc/api-gateway 3000:3000
```

### Debug with Chrome DevTools
```bash
# Start service in debug mode
node --inspect dist/index.js

# Open Chrome and navigate to:
# chrome://inspect
```

### Monitor Logs in Real-Time
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway

# With grep filter
docker-compose logs -f | grep ERROR
```

---

## 🤝 Getting Help

- **Slack**: #botlace-engineering
- **Email**: engineering@botlace.ai
- **Documentation**: https://docs.botlace.ai
- **GitHub Issues**: https://github.com/your-org/botlace-platform/issues

---

## ✅ Quick Checklist

Before starting development, ensure:
- [ ] Node.js 20+ installed
- [ ] Docker Desktop running
- [ ] All dependencies installed (`npm install`)
- [ ] Environment configured (`.env` file)
- [ ] Infrastructure services running (`docker-compose ps`)
- [ ] API Gateway accessible (http://localhost:3000/health)
- [ ] Documentation reviewed

---

**Ready to build the future of healthcare?** 🏥💡

Start coding and let's transform healthcare delivery together!

---

**Last Updated**: 2025-10-29  
**Version**: 1.0.0
