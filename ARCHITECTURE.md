# Botlace Architecture Documentation

## System Architecture

### High-Level Overview

Botlace is built as a microservices architecture with a unified API gateway, enabling:
- **Scalability**: Each service can scale independently
- **Modularity**: Services can be developed, deployed, and maintained separately
- **Resilience**: Failure in one service doesn't cascade to others
- **Compliance**: HIPAA-grade security and auditing at every layer

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│              React Dashboard (Frontend)                       │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│              Authentication, Rate Limiting,                  │
│              Request Routing, Compliance Logging             │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│  ACRE Service  │  │ ClinicalOps    │  │  CareNav        │
│  (AI Reasoning)│  │  (Documentation)│  │  (Scheduling)   │
└───────────────┘  └─────────────────┘  └─────────────────┘
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│  Patient360   │  │  MarketOps     │  │  RevenueOps     │
│  (Profiles)   │  │  (GHL CRM)      │  │  (Billing)      │
└───────────────┘  └─────────────────┘  └─────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              Enterprise Intelligence                        │
│         (C-Suite Dashboard, KPIs, Insights)                 │
└─────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│            Integration Layer (FHIR APIs)                     │
│         Epic, ICANotes, Tebra, GHL, Stripe                  │
└─────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Data Layer                               │
│         PostgreSQL, Redis, MongoDB                          │
└─────────────────────────────────────────────────────────────┘
```

## Service Details

### 1. ACRE (AI Operating Layer)

**Purpose**: Medical-grade reasoning engine for all AI operations

**Key Features**:
- Evidence-based clinical decision support
- FHIR-compliant reasoning
- Compliance-aware recommendations
- Explainable AI outputs

**Endpoints**:
- `POST /api/v1/acre/reason` - Execute reasoning task
- `GET /api/v1/acre/health` - Health check

### 2. ClinicalOps AI

**Purpose**: Clinical documentation, coding, and treatment planning

**Key Features**:
- AI-generated clinical notes
- Automatic ICD-10 coding
- Treatment plan recommendations
- Follow-up appointment prediction

**Endpoints**:
- `POST /api/v1/clinicalops/documentation/generate`
- `POST /api/v1/clinicalops/coding/auto-code`
- `POST /api/v1/clinicalops/treatment-plan/generate`
- `POST /api/v1/clinicalops/follow-up/predict`

### 3. CareNav & Smart Scheduling

**Purpose**: Intelligent appointment management and patient routing

**Key Features**:
- AI-suggested appointment times
- No-show prediction
- Provider load balancing
- Adaptive patient routing

**Endpoints**:
- `POST /api/v1/carenav/appointments/suggest`
- `POST /api/v1/carenav/appointments/predict-no-show`
- `POST /api/v1/carenav/providers/balance-load`
- `POST /api/v1/carenav/routing/patient`
- `POST /api/v1/carenav/triage/assistant`

### 4. Patient360 Hub

**Purpose**: Unified patient profiles with 360-degree view

**Key Features**:
- Clinical, engagement, and behavioral metrics
- AI-generated care summaries
- Engagement scoring
- Churn prediction

**Endpoints**:
- `GET /api/v1/patient360/profile/:patientId`
- `POST /api/v1/patient360/summary/generate`
- `GET /api/v1/patient360/engagement/:patientId`
- `GET /api/v1/patient360/churn/:patientId`

### 5. MarketOps CRM (GHL-Powered)

**Purpose**: Marketing operations and lead management

**Key Features**:
- AI-driven lead scoring
- GoHighLevel integration
- LTV prediction
- Campaign-to-care mapping

**Endpoints**:
- `POST /api/v1/marketops/leads/score`
- `POST /api/v1/marketops/leads/sync-ghl`
- `POST /api/v1/marketops/leads/predict-ltv`
- `GET /api/v1/marketops/campaigns/:campaignId/map-to-care`

### 6. RevenueOps Dashboard

**Purpose**: Revenue cycle management and analytics

**Key Features**:
- Revenue metrics and forecasting
- Billing anomaly detection
- Integration with QuickBooks, Stripe, Athena
- Denial analysis

**Endpoints**:
- `GET /api/v1/revenueops/metrics`
- `GET /api/v1/revenueops/anomalies`
- `GET /api/v1/revenueops/forecast`
- `GET /api/v1/revenueops/analytics`
- `POST /api/v1/revenueops/sync-accounting`

### 7. Enterprise Intelligence

**Purpose**: C-suite dashboard and organizational insights

**Key Features**:
- Unified KPIs across all modules
- Organizational learning
- Compliance dashboard
- AI explainability logs

**Endpoints**:
- `GET /api/v1/intelligence/kpis`
- `GET /api/v1/intelligence/insights`
- `GET /api/v1/intelligence/compliance`
- `GET /api/v1/intelligence/ai-explainability`

### 8. FHIR Integration Service

**Purpose**: Connect with Epic, ICANotes, Tebra, and other FHIR-compliant systems

**Key Features**:
- FHIR R4 compliant APIs
- Provider-specific authentication
- Federated AI learning (privacy-preserving)
- Bidirectional data sync

**Endpoints**:
- `GET /api/v1/integrations/fhir/test/:provider`
- `POST /api/v1/integrations/fhir/connect/epic`
- `POST /api/v1/integrations/fhir/connect/icanotes`
- `POST /api/v1/integrations/fhir/connect/tebra`
- `POST /api/v1/integrations/fhir/patients/sync`
- `GET /api/v1/integrations/fhir/federated/:dataType`

## Data Models

### Core Entities

- **Tenant**: Multi-tenant organization (clinic, hospital)
- **Provider**: Healthcare provider (doctor, nurse, etc.)
- **Patient**: Patient record with PHI
- **ClinicalNote**: Clinical documentation
- **Appointment**: Scheduled appointments
- **MarketOpsLead**: Marketing lead
- **RevenueMetrics**: Financial metrics

## Security & Compliance

### HIPAA Compliance

- All PHI access is logged via `hipaaAuditLog` middleware
- Encryption at rest and in transit
- Role-based access control (RBAC)
- Audit trails for all operations

### Authentication

- JWT-based authentication
- Multi-tenant isolation
- Role-based permissions (admin, executive, compliance, provider)

### Rate Limiting

- 100 requests per minute per user/IP
- Configurable per endpoint

## Deployment

### Docker Compose

The platform can be deployed using Docker Compose with:
- PostgreSQL (primary database)
- Redis (caching)
- MongoDB (AI logs and audit trails)
- Multiple service containers

### Production Considerations

1. **Database**: Use managed PostgreSQL (AWS RDS, GCP Cloud SQL)
2. **Caching**: Redis cluster for high availability
3. **Message Queue**: Add RabbitMQ/Kafka for async processing
4. **Monitoring**: Integrate Prometheus, Grafana, ELK stack
5. **Load Balancing**: Nginx or AWS ALB in front of API Gateway
6. **SSL/TLS**: HTTPS everywhere
7. **Secrets Management**: AWS Secrets Manager, HashiCorp Vault

## AI/ML Integration

### Current Implementation

- Simulated AI reasoning and predictions
- Evidence-based recommendations
- Pattern recognition for anomalies

### Production Enhancements

1. **TensorFlow.js Models**: Deploy clinical decision support models
2. **Python ML Pipeline**: Separate service for complex ML operations
3. **Federated Learning**: Privacy-preserving model training across tenants
4. **Continuous Learning**: Models improve from aggregate outcomes

## Scalability

### Horizontal Scaling

Each microservice can scale independently based on load:
- ACRE service: Scale based on reasoning requests
- ClinicalOps: Scale based on documentation generation
- CareNav: Scale based on scheduling volume

### Database Scaling

- Read replicas for reporting/analytics
- Partitioning by tenant_id for large scale
- Caching layer (Redis) for frequent queries

## Integration Points

### External Systems

1. **Epic**: OAuth2 + FHIR R4
2. **ICANotes**: API key authentication
3. **Tebra**: API key authentication
4. **GoHighLevel**: REST API + webhooks
5. **Stripe/QuickBooks/Athena**: OAuth + API integration

### Data Flow

1. **Marketing → Care**: GHL lead → Botlace → Scheduling → EHR
2. **Clinical → Revenue**: Documentation → Coding → Billing
3. **Operations → Intelligence**: All modules → Unified KPIs

## Next Steps

1. Implement actual ML models (replace simulations)
2. Add comprehensive test coverage
3. Implement real database persistence
4. Set up CI/CD pipeline
5. Add monitoring and alerting
6. Implement federated learning infrastructure
7. Expand FHIR integration depth
8. Add more external system integrations
