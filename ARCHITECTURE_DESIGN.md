# Architecture Design Document

**WeatherMind - AI-Orchestrated Weather Intelligence Platform**

This document explains the architectural decisions, infrastructure patterns, and scaling strategies used in this project. It serves as both a technical reference and a guide for understanding the "why" behind each decision.

---

## Table of Contents

- [Infrastructure Philosophy](#infrastructure-philosophy)
- [Three Stages of Startup Infrastructure](#three-stages-of-startup-infrastructure)
- [Cloud Agnosticism Strategy](#cloud-agnosticism-strategy)
- [Scaling Architecture](#scaling-architecture)
- [Data Layer Design](#data-layer-design)
- [Cost Optimization](#cost-optimization)
- [Trade-off Analysis](#trade-off-analysis)

---

## Infrastructure Philosophy

This project follows the principle of **progressive complexity**: start simple, add complexity only when justified by real requirements.

### Core Principles

1. **Cloud Agnostic First**: Use open standards (Kubernetes, MongoDB, Redis) over proprietary services
2. **Cost Conscious**: Optimize for early-stage constraints while maintaining production quality
3. **Operationally Simple**: Minimize moving parts until scale demands otherwise
4. **Migration Ready**: Design for easy transition to managed services when needed

---

## Three Stages of Startup Infrastructure

### Stage 1: Bootstrapper (Current)

**Goal**: Minimum cost, maximum learning, production-ready patterns.

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │   Backend   │ │   Agent     │ │     Web     │       │
│  │   (Pod)     │ │  Service    │ │   (Pod)     │       │
│  │             │ │   (Pod)     │ │             │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  ┌─────────────────────┐ ┌─────────────────────┐       │
│  │  MongoDB (Pod)      │ │   Redis (Pod)       │       │
│  │  StatefulSet + PVC  │ │  StatefulSet + PVC  │       │
│  └─────────────────────┘ └─────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

**Characteristics**:
- Databases run as Kubernetes pods (StatefulSets)
- Storage via Persistent Volume Claims (PVC)
- Single cluster deployment
- Manual backup scripts to S3

**Cost**: ~$0 additional (databases share node resources)

**Risk Mitigation**:
- Automated daily backups via `mongodump` to S3
- Persistent volumes survive pod restarts
- Infrastructure as Code enables 20-minute recovery

### Stage 2: Funded / Scaling

**Goal**: Stability over cost, reduce operational burden.

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │   Backend   │ │   Agent     │ │     Web     │       │
│  │  (Scaled)   │ │  (Scaled)   │ │  (Scaled)   │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
┌───────────────┐               ┌───────────────┐
│  MongoDB Atlas│               │  Redis Cloud  │
│   (Managed)   │               │   (Managed)   │
└───────────────┘               └───────────────┘
```

**When to Transition**:
- Engineering time spent on DB maintenance > cloud service cost
- Need for automatic failover and replication
- Compliance requirements demand managed services

**Cost**: $50-200/month for managed databases

### Stage 3: Enterprise / Multi-Cloud

**Goal**: Strict compliance, multi-region, vendor independence.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AWS (EKS)     │    │   GCP (GKE)     │    │  Azure (AKS)    │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │ Services  │  │    │  │ Services  │  │    │  │ Services  │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
              ┌─────┴─────┐           ┌─────┴─────┐
              │  MongoDB  │           │   Redis   │
              │   Atlas   │           │   Cloud   │
              │ (Global)  │           │ (Global)  │
              └───────────┘           └───────────┘
```

**Characteristics**:
- Vendor-agnostic managed services (Atlas, Redis Cloud work on any cloud)
- Same Kubernetes manifests deploy anywhere
- Global data replication

---

## Cloud Agnosticism Strategy

### Avoiding Vendor Lock-in

| Layer | Portable Choice | Proprietary Alternative |
|-------|-----------------|-------------------------|
| Compute | Kubernetes | AWS Lambda, Cloud Run |
| Database | MongoDB | DynamoDB, Cloud Spanner |
| Cache | Redis | ElastiCache (limited) |
| Queue | BullMQ + Redis | SQS, Cloud Tasks |
| Storage | S3-compatible | Proprietary buckets |

### Migration Checklist

To move from AWS to GCP (or any other provider):

1. **Compute**: `kubectl apply -f k8s/` on new cluster
2. **Database**: `mongodump` → restore to new location
3. **Cache**: Redis data is ephemeral (recreates on start)
4. **Secrets**: Update ConfigMaps/Secrets with new endpoints
5. **DNS**: Point domain to new Ingress IP

**Estimated migration time**: 2-4 hours for complete infrastructure move

---

## Scaling Architecture

### Application Tier (Automatic)

Kubernetes Horizontal Pod Autoscaler (HPA) manages application scaling:

```yaml
# Example: Backend HPA Configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
```

**Scaling Flow**:
```
Traffic Spike → CPU > 50% → HPA creates pods → Cluster Autoscaler adds nodes
```

| Component | Scaling Trigger | Min | Max |
|-----------|-----------------|-----|-----|
| Backend | CPU > 50% | 2 | 10 |
| Agent Service | CPU > 70% | 1 | 10 |
| Web | CPU > 50% | 2 | 5 |

### Data Tier (Manual in Stage 1)

**Self-Hosted MongoDB Scaling**:

| Scaling Type | Method | Downtime |
|--------------|--------|----------|
| Vertical (more RAM) | Edit YAML, restart pod | Yes |
| Read Replicas | Add replica set members | No |
| Sharding | Complex manual setup | Yes |

**Managed Service Scaling** (Stage 2+):
- Auto-scaling storage
- One-click vertical scaling
- Automatic sharding

---

## Data Layer Design

### Schema Design

```
┌─────────────────────────────────────────────────────────┐
│                       MongoDB                            │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │     Users       │    │      WeatherEmails          │ │
│  │  ─────────────  │    │  ─────────────────────────  │ │
│  │  _id            │◄───│  user (ref)                 │ │
│  │  name           │    │  city                       │ │
│  │  email          │    │  recipientEmail             │ │
│  │  password       │    │  createdAt                  │ │
│  │  weatherEmails[]│    │  updatedAt                  │ │
│  └─────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                        Redis                             │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   BullMQ Jobs   │    │     Session Cache           │ │
│  │  ─────────────  │    │  ─────────────────────────  │ │
│  │  weather-email- │    │  auth:session:<id>          │ │
│  │  queue          │    │                             │ │
│  │  - scheduled    │    │                             │ │
│  │  - active       │    │                             │ │
│  │  - completed    │    │                             │ │
│  └─────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User creates schedule
   └─→ Backend validates request
       └─→ Saves to MongoDB (WeatherEmail collection)
           └─→ Queues job to Redis (BullMQ)

2. Scheduled time arrives
   └─→ BullMQ triggers job
       └─→ Agent Service worker picks up job
           └─→ LangGraph agent executes:
               ├─→ Fetch weather (OpenWeatherMap)
               ├─→ Format email (template)
               └─→ Send email (Gmail SMTP)
```

---

## Cost Optimization

### Current Setup (Stage 1)

| Resource | Cost | Notes |
|----------|------|-------|
| Kubernetes Nodes | $50-100/mo | 2-3 nodes minimum |
| MongoDB | $0 | Runs on K8s nodes |
| Redis | $0 | Runs on K8s nodes |
| S3 Backups | ~$1/mo | Daily mongodump |
| Domain | ~$12/yr | weather-agent.com |
| **Total** | **~$55-105/mo** | |

### Stage 2 Comparison

| Resource | Cost | Notes |
|----------|------|-------|
| Kubernetes Nodes | $50-100/mo | Same |
| MongoDB Atlas | $57/mo | M10 cluster |
| Redis Cloud | $20/mo | Basic tier |
| **Total** | **~$130-180/mo** | +$75/mo for managed |

### When to Upgrade

**Upgrade to managed when**:
- Monthly engineering hours on DB ops > 5 hours
- Need automated failover (production SLA)
- Compliance requires managed services
- Data size exceeds comfortable self-management

---

## Trade-off Analysis

### Self-Hosted vs Managed Databases

| Factor | Self-Hosted (K8s Pods) | Managed (Atlas/Cloud) |
|--------|------------------------|------------------------|
| Cost | Low (~$0 extra) | High ($50-500+/mo) |
| Maintenance | You handle patching | Automated |
| Backups | Manual setup needed | Automatic |
| Scaling | Manual, may need downtime | One-click, no downtime |
| Recovery | Your responsibility | Point-in-time restore |
| 3 AM Alerts | You wake up | They handle it |
| Cloud Lock-in | None | Low (Atlas is multi-cloud) |

### The "3 AM Problem"

**Self-Hosted Reality**:
- Disk fills up at 3 AM → You wake up
- Node crashes → You troubleshoot
- Replication lag → You investigate

**Managed Reality**:
- Auto-scaling storage handles disk
- Automatic failover to replica
- Managed monitoring and alerts

**Recommendation**: Self-host until the operational burden justifies the cost of managed services.

---

## Backup Strategy

### Current Implementation

```bash
# Daily backup script (add to cron)
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
kubectl exec -it mongodb-0 -- mongodump --archive=/tmp/backup.gz --gzip
kubectl cp mongodb-0:/tmp/backup.gz ./backups/mongo_$TIMESTAMP.gz
aws s3 cp ./backups/mongo_$TIMESTAMP.gz s3://weather-agent-backups/
```

### Recovery Procedure

```bash
# Download latest backup
aws s3 cp s3://weather-agent-backups/mongo_latest.gz ./backup.gz

# Restore to MongoDB
kubectl cp ./backup.gz mongodb-0:/tmp/backup.gz
kubectl exec -it mongodb-0 -- mongorestore --archive=/tmp/backup.gz --gzip
```

**Recovery Time Objective (RTO)**: ~30 minutes
**Recovery Point Objective (RPO)**: 24 hours (daily backups)

---

## Security Considerations

### Network Security

```
┌──────────────────────────────────────────────────────────┐
│                      Internet                             │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│               Ingress (Rate Limited)                      │
│            15 req/s per IP, SSL termination              │
└─────────────────────────┬────────────────────────────────┘
                          │
┌─────────────────────────┴────────────────────────────────┐
│                  ClusterIP Services                       │
│     (Internal only, not accessible from internet)        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Backend  │  │  Agent   │  │ MongoDB  │  │  Redis   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Security Measures Implemented

- **Network Policy**: Services communicate only via internal DNS
- **Rate Limiting**: 15 requests/second per IP at Ingress
- **TLS Termination**: HTTPS only, HTTP redirects to HTTPS
- **Security Headers**: Helmet.js on all Express services
- **Non-root Containers**: All images run as uid 1001
- **Secret Management**: Kubernetes Secrets (not in git)

---

## Monitoring Stack

### Components

```
┌─────────────────────────────────────────────────────────┐
│                     Grafana                              │
│                  (Dashboards)                            │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                    Prometheus                            │
│                 (Metrics Store)                          │
└─────────────────────────┬───────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Backend     │ │ Agent Service │ │  Ingress      │
│  /api/metrics │ │   /metrics    │ │  Controller   │
└───────────────┘ └───────────────┘ └───────────────┘
```

### Key Metrics

| Metric | Alert Threshold | Action |
|--------|-----------------|--------|
| CPU Usage | > 80% | Scale pods |
| Memory Usage | > 85% | Investigate leak |
| Request Latency | > 500ms p95 | Profile code |
| Error Rate | > 1% | Check logs |
| Queue Depth | > 100 jobs | Scale agent service |

---

## Conclusion

This architecture balances production-readiness with cost-effectiveness. Key takeaways:

1. **Start with self-hosted databases** — Move to managed when operational burden justifies cost
2. **Use Kubernetes from day one** — Provides consistent environment from local to production
3. **Maintain cloud agnosticism** — Use open standards to avoid lock-in
4. **Automate backups early** — Don't wait for data loss to implement recovery
5. **Monitor everything** — Visibility enables informed scaling decisions

The architecture is designed to grow with the project, with clear upgrade paths at each stage.
