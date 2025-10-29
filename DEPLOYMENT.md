# Botlace Platform Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [AWS Production Deployment](#aws-production-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring & Observability](#monitoring--observability)

---

## Prerequisites

### Required Tools
- **Node.js**: v20+ ([Download](https://nodejs.org/))
- **npm**: v10+ (comes with Node.js)
- **Docker**: v24+ ([Download](https://www.docker.com/))
- **Docker Compose**: v2+ (comes with Docker Desktop)
- **kubectl**: v1.28+ ([Install](https://kubernetes.io/docs/tasks/tools/))
- **AWS CLI**: v2+ ([Install](https://aws.amazon.com/cli/))
- **Terraform**: v1.6+ ([Install](https://www.terraform.io/))

### Optional Tools
- **Lens**: Kubernetes IDE ([Download](https://k8slens.dev/))
- **k9s**: Terminal-based K8s UI ([Install](https://k9scli.io/))
- **Postman**: API testing ([Download](https://www.postman.com/))

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/botlace-platform.git
cd botlace-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your local configuration
```

### 4. Start Infrastructure Services
```bash
docker-compose up -d postgres redis mongodb kafka elasticsearch
```

### 5. Run Database Migrations
```bash
npm run db:migrate
```

### 6. Start Microservices
```bash
# Start all services in development mode
npm run dev

# Or start individual services
npm run start:api-gateway
npm run start:clinical-ops
npm run start:scheduling
```

### 7. Access Services
- **API Gateway**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql
- **Frontend**: http://localhost:3100
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Kafka**: localhost:9093

---

## Docker Deployment

### Build All Services
```bash
docker-compose build
```

### Start All Services
```bash
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
```

### Stop Services
```bash
docker-compose down
```

### Clean Up (Remove Volumes)
```bash
docker-compose down -v
```

---

## Kubernetes Deployment

### 1. Set Up Kubernetes Cluster

#### Local (Minikube)
```bash
minikube start --cpus=4 --memory=8192
minikube addons enable ingress
```

#### AWS EKS
```bash
eksctl create cluster \
  --name botlace-prod \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.large \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 10 \
  --managed
```

### 2. Create Namespace
```bash
kubectl apply -f infrastructure/kubernetes/namespace.yaml
```

### 3. Create Secrets
```bash
kubectl create secret generic botlace-secrets \
  --from-literal=jwt-secret=your-jwt-secret \
  --from-literal=db-password=your-db-password \
  --from-literal=redis-url=redis://redis:6379 \
  --namespace=botlace
```

### 4. Deploy Services
```bash
# Deploy all services
kubectl apply -f infrastructure/kubernetes/

# Or deploy individually
kubectl apply -f infrastructure/kubernetes/api-gateway-deployment.yaml
```

### 5. Verify Deployment
```bash
kubectl get pods -n botlace
kubectl get services -n botlace
kubectl get ingress -n botlace
```

### 6. Access Services
```bash
# Port forward for local access
kubectl port-forward -n botlace service/api-gateway 3000:3000

# Get ingress URL
kubectl get ingress -n botlace
```

---

## AWS Production Deployment

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              CloudFront CDN                          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│          Application Load Balancer (ALB)             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         EKS Cluster (Multi-AZ)                       │
│  ┌───────────────┐  ┌───────────────┐               │
│  │  Namespace:    │  │  Namespace:    │              │
│  │  botlace       │  │  monitoring    │              │
│  └───────────────┘  └───────────────┘               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  RDS PostgreSQL │ ElastiCache Redis │ S3 Data Lake  │
└─────────────────────────────────────────────────────┘
```

### 1. Infrastructure as Code (Terraform)

#### Initialize Terraform
```bash
cd infrastructure/terraform
terraform init
```

#### Plan Deployment
```bash
terraform plan -var-file=prod.tfvars
```

#### Apply Infrastructure
```bash
terraform apply -var-file=prod.tfvars
```

### 2. Configure AWS Services

#### RDS PostgreSQL
```bash
# Create database
aws rds create-db-instance \
  --db-instance-identifier botlace-prod \
  --db-instance-class db.t3.large \
  --engine postgres \
  --engine-version 16.1 \
  --master-username botlace \
  --master-user-password <secure-password> \
  --allocated-storage 100 \
  --storage-encrypted \
  --multi-az \
  --vpc-security-group-ids sg-xxxxxx \
  --db-subnet-group-name botlace-db-subnet
```

#### ElastiCache Redis
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id botlace-redis-prod \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --security-group-ids sg-xxxxxx \
  --cache-subnet-group-name botlace-cache-subnet
```

#### S3 Data Lake
```bash
aws s3 mb s3://botlace-data-lake-prod
aws s3api put-bucket-encryption \
  --bucket botlace-data-lake-prod \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 3. Deploy to EKS

#### Update kubeconfig
```bash
aws eks update-kubeconfig --name botlace-prod --region us-east-1
```

#### Deploy Services
```bash
kubectl apply -f infrastructure/kubernetes/
```

#### Configure Auto-Scaling
```bash
# Install metrics server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Install cluster autoscaler
kubectl apply -f infrastructure/kubernetes/cluster-autoscaler.yaml
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker images
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker-compose build
          docker-compose push
      
      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --name botlace-prod --region us-east-1
      
      - name: Deploy to EKS
        run: |
          kubectl set image deployment/api-gateway \
            api-gateway=$ECR_REGISTRY/api-gateway:$IMAGE_TAG \
            -n botlace
          kubectl rollout status deployment/api-gateway -n botlace
```

### Manual Deployment

#### Build Images
```bash
docker build -t botlace/api-gateway:v1.0.0 ./backend/services/api-gateway
```

#### Push to ECR
```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag botlace/api-gateway:v1.0.0 \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/botlace/api-gateway:v1.0.0

docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/botlace/api-gateway:v1.0.0
```

#### Deploy to Kubernetes
```bash
kubectl set image deployment/api-gateway \
  api-gateway=<account-id>.dkr.ecr.us-east-1.amazonaws.com/botlace/api-gateway:v1.0.0 \
  -n botlace
```

---

## Monitoring & Observability

### 1. Install Prometheus & Grafana

```bash
# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Default credentials: admin / prom-operator
```

### 2. Install Datadog (Production)

```bash
# Add Datadog Helm repo
helm repo add datadog https://helm.datadoghq.com
helm repo update

# Install Datadog agent
helm install datadog-agent datadog/datadog \
  --set datadog.apiKey=$DD_API_KEY \
  --set datadog.appKey=$DD_APP_KEY \
  --namespace monitoring
```

### 3. Logging (ELK Stack)

```bash
# Install Elasticsearch
helm install elasticsearch elastic/elasticsearch \
  --namespace logging \
  --create-namespace

# Install Kibana
helm install kibana elastic/kibana --namespace logging

# Install Filebeat
kubectl apply -f infrastructure/kubernetes/filebeat.yaml
```

### 4. Distributed Tracing (Jaeger)

```bash
# Install Jaeger operator
kubectl create namespace observability
kubectl apply -f https://github.com/jaegertracing/jaeger-operator/releases/latest/download/jaeger-operator.yaml -n observability

# Deploy Jaeger instance
kubectl apply -f infrastructure/kubernetes/jaeger.yaml
```

---

## Troubleshooting

### Check Pod Logs
```bash
kubectl logs -f <pod-name> -n botlace
```

### Describe Pod
```bash
kubectl describe pod <pod-name> -n botlace
```

### Exec into Pod
```bash
kubectl exec -it <pod-name> -n botlace -- /bin/sh
```

### Check Service Endpoints
```bash
kubectl get endpoints -n botlace
```

### Database Connection Test
```bash
kubectl run -it --rm debug --image=postgres:16 --restart=Never -- \
  psql -h <db-host> -U botlace -d botlace
```

---

## Security Checklist

- [ ] All secrets stored in AWS Secrets Manager or Kubernetes Secrets
- [ ] TLS/SSL certificates configured via cert-manager
- [ ] Network policies configured for pod-to-pod communication
- [ ] RBAC rules configured for service accounts
- [ ] Database encryption at rest enabled
- [ ] Database encryption in transit (TLS) enabled
- [ ] VPC peering/private subnets configured
- [ ] Security groups with minimal required access
- [ ] WAF rules configured on ALB
- [ ] CloudTrail logging enabled
- [ ] GuardDuty threat detection enabled

---

## Performance Optimization

### Database Optimization
- Enable connection pooling (PgBouncer)
- Configure read replicas for heavy queries
- Optimize indexes based on query patterns
- Enable query caching in Redis

### API Optimization
- Enable GraphQL query complexity limits
- Implement DataLoader for N+1 query prevention
- Configure CDN for static assets
- Enable compression (gzip/brotli)

### Kubernetes Optimization
- Configure horizontal pod autoscaling (HPA)
- Set appropriate resource requests/limits
- Use node affinity for workload distribution
- Enable cluster autoscaling

---

## Backup & Disaster Recovery

### Database Backups
```bash
# Automated RDS snapshots (daily)
aws rds modify-db-instance \
  --db-instance-identifier botlace-prod \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00"
```

### Application State Backup
```bash
# Velero for Kubernetes backups
velero backup create botlace-backup \
  --include-namespaces botlace \
  --storage-location aws
```

### Restore Procedure
```bash
# Restore from RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier botlace-restore \
  --db-snapshot-identifier botlace-snapshot-20251029

# Restore Kubernetes resources
velero restore create --from-backup botlace-backup
```

---

## Support & Documentation

- **Technical Documentation**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **API Documentation**: https://api.botlace.ai/docs
- **Support Email**: support@botlace.ai
- **Slack Channel**: #botlace-engineering

---

**Last Updated**: 2025-10-29  
**Maintained by**: Botlace DevOps Team
