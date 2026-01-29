# WeatherMind

**AI-Orchestrated Weather Intelligence Platform**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5.svg)](https://kubernetes.io/)

A production-grade, cloud-native microservices platform that delivers personalized weather intelligence through AI-powered automation. Built with enterprise patterns used by companies like LinkedIn, Uber, and Klarna for their AI agent systems.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technical Highlights](#technical-highlights)
- [System Design](#system-design)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Key Engineering Decisions](#key-engineering-decisions)
- [Infrastructure](#infrastructure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [License](#license)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INGRESS (Nginx)                                 │
│                    SSL/TLS • Rate Limiting • Path Routing                    │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Web (React) │    │    Backend    │    │ Agent Service │
│   Vite + SPA  │    │  Express.js   │    │   LangGraph   │
│   Port 5173   │    │   Port 5001   │    │   Port 5002   │
└───────────────┘    └───────┬───────┘    └───────┬───────┘
                             │                     │
                             │     ┌───────────────┤
                             │     │               │
                             ▼     ▼               ▼
                      ┌─────────────────┐   ┌─────────────┐
                      │    MongoDB      │   │    Redis    │
                      │  (StatefulSet)  │   │   (Queue)   │
                      └─────────────────┘   └─────────────┘
                                                   │
                                                   ▼
                                          ┌───────────────┐
                                          │    BullMQ     │
                                          │  Job Worker   │
                                          └───────────────┘
```

### Data Flow

1. **User Request** → Nginx Ingress routes to appropriate service
2. **Authentication** → Backend validates session via BetterAuth
3. **Schedule Creation** → Job queued to Redis via BullMQ
4. **Scheduled Execution** → Worker invokes LangGraph agent
5. **AI Pipeline** → Fetch weather → Format email → Send via SMTP

---

## Technical Highlights

### Why This Architecture Matters

| Decision | Rationale | Industry Validation |
|----------|-----------|---------------------|
| **Monorepo with pnpm workspaces** | Single source of truth, shared code reuse, atomic commits | Google, Meta, Vercel use monorepos at scale |
| **LangGraph for AI agents** | Stateful workflows, error recovery, conditional routing | LinkedIn, Uber, Klarna use LangGraph in production |
| **Microservices separation** | Independent scaling, fault isolation, team autonomy | Standard for high-growth startups |
| **Kubernetes-first** | Cloud-agnostic, declarative infrastructure, auto-healing | 87% of organizations deploy K8s (2025) |
| **BullMQ + Redis** | Reliable job processing, automatic retries, cron scheduling | Production-grade queue used by enterprises |

### AI Agent Architecture (LangGraph)

Unlike simple API wrappers or linear chains, this system uses **graph-based orchestration**:

```
                    ┌──────────────────┐
                    │   START STATE    │
                    │  { city, email } │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ fetchWeatherNode │──── OpenWeatherMap API
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ formatEmailNode  │──── Template Engine
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  sendEmailNode   │──── Nodemailer + Gmail SMTP
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │       END        │
                    │  { result, logs }│
                    └──────────────────┘
```

**Key Capabilities:**
- **State Persistence**: Each node passes state to the next
- **Error Recovery**: Failed nodes can retry or route to fallback
- **Conditional Logic**: Graph can branch based on intermediate results
- **Observability**: Each step is logged for debugging

---

## System Design

### Authentication Flow

```
┌────────┐     ┌─────────┐     ┌───────────┐     ┌─────────┐
│ Client │────▶│ Backend │────▶│ BetterAuth│────▶│ MongoDB │
└────────┘     └─────────┘     └───────────┘     └─────────┘
     │              │                                  │
     │              │         Session Created          │
     │◀─────────────┼──────────────────────────────────┘
     │              │
     │  Set-Cookie: session_token
     │◀─────────────┘
```

**Security Features:**
- Session-based authentication with secure cookies
- OAuth 2.0 support (Google)
- Bearer token support for API clients
- Automatic session cleanup on user deletion

### Job Scheduling Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Backend   │───▶│    Redis    │───▶│   BullMQ    │───▶│   Worker    │
│  (Producer) │    │   (Queue)   │    │ (Scheduler) │    │ (Consumer)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                            │
                                            │ Cron: "0 17 * * *"
                                            │ (5 PM daily)
                                            ▼
                                    ┌─────────────┐
                                    │  LangGraph  │
                                    │    Agent    │
                                    └─────────────┘
```

**Reliability Features:**
- Automatic job retries on failure
- Dead letter queue for failed jobs
- Job deduplication by ID
- Graceful shutdown handling

---

## Technology Stack

### Core Services

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Runtime** | Node.js | 22.x | JavaScript runtime |
| **Language** | TypeScript | 5.9 | Type safety |
| **Package Manager** | pnpm | 10.x | Efficient monorepo management |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| Vite | 7.x | Build tool & dev server |
| TailwindCSS | 4.x | Utility-first styling |
| shadcn/ui | - | Component library |
| React Router | 7.x | Client-side routing |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Express | 5.x | HTTP framework |
| BetterAuth | 1.x | Authentication |
| Mongoose | 9.x | MongoDB ODM |
| Zod | 4.x | Runtime validation |
| Helmet | 8.x | Security headers |

### AI/Agent

| Technology | Version | Purpose |
|------------|---------|---------|
| LangGraph.js | 1.x | Agent orchestration |
| LangChain.js | 1.x | LLM tooling |
| BullMQ | 5.x | Job queue |
| Nodemailer | 7.x | Email delivery |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Kubernetes | Container orchestration |
| Nginx Ingress | API gateway & load balancing |
| Cert-Manager | SSL/TLS automation |
| Prometheus | Metrics collection |
| Grafana | Observability dashboards |
| Terraform | Infrastructure as Code |

### Data Layer

| Technology | Purpose |
|------------|---------|
| MongoDB | Primary database |
| Redis | Cache & job queue |

---

## Project Structure

```
weather-agent/
├── apps/                           # Application services
│   ├── backend/                    # Auth & API service (Express)
│   │   ├── src/
│   │   │   ├── index.ts           # Server entry point
│   │   │   ├── routes/            # API route definitions
│   │   │   └── controllers/       # Business logic
│   │   ├── Dockerfile.dev
│   │   └── Dockerfile.prod
│   │
│   ├── agent-service/              # AI agent service (LangGraph)
│   │   ├── src/
│   │   │   ├── agents/            # LangGraph workflows
│   │   │   │   ├── agent.ts       # Main agent graph
│   │   │   │   └── tools/         # Agent capabilities
│   │   │   └── workers/           # BullMQ job consumers
│   │   ├── Dockerfile.dev
│   │   └── Dockerfile.prod
│   │
│   ├── web/                        # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── pages/             # Route components
│   │   │   ├── components/        # Reusable UI
│   │   │   └── lib/               # Utilities & auth client
│   │   ├── nginx.conf             # Production server config
│   │   ├── Dockerfile.dev
│   │   └── Dockerfile.prod
│   │
│   └── mobile/                     # React Native app (Expo)
│       └── App.tsx
│
├── packages/                       # Shared internal packages
│   └── shared/                     # Cross-service utilities
│       ├── src/
│       │   ├── models/            # Mongoose schemas
│       │   ├── common/            # Middleware & configs
│       │   └── monitoring/        # Prometheus metrics
│       └── package.json
│
├── k8s/                            # Kubernetes manifests
│   ├── ingress.yaml               # Nginx ingress rules
│   ├── cert-manager-issuer.yaml   # Let's Encrypt config
│   ├── backend/                   # Backend deployment
│   ├── agent-service/             # Agent deployment
│   ├── web/                       # Frontend deployment
│   ├── mongodb/                   # Database StatefulSet
│   └── redis/                     # Cache StatefulSet
│
├── infra/                          # Infrastructure configs
│   ├── nginx/                     # Nginx proxy config
│   ├── prometheus/                # Metrics scraping
│   └── grafana/                   # Dashboard provisioning
│
├── terraform/                      # Cloud provisioning (IaC)
│   ├── main.tf
│   ├── variables.tf
│   └── output.tf
│
├── scripts/                        # Deployment utilities
│   ├── deploy-local.sh            # Local K8s setup
│   └── stop-local.sh
│
├── .github/
│   └── workflows/
│       └── deploy.yaml            # CI/CD pipeline
│
├── docker-compose.dev.yaml         # Local development
├── docker-compose.prod.yaml        # Production compose
├── pnpm-workspace.yaml             # Monorepo config
└── package.json                    # Root workspace
```

---

## Key Engineering Decisions

### 1. Why Microservices Over Monolith?

**Problem**: AI workloads have different scaling characteristics than web servers.

**Solution**: Separate `backend` (auth, light I/O) from `agent-service` (CPU-intensive AI).

**Result**: Scale AI processing independently without over-provisioning auth servers.

```yaml
# k8s/agent-service/hpa.yaml
spec:
  minReplicas: 1
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        targetAverageUtilization: 70
```

### 2. Why Self-Hosted Databases in K8s?

**Problem**: Managed databases (RDS, Atlas) cost $15-100+/month minimum.

**Solution**: Run MongoDB/Redis as StatefulSets with Persistent Volume Claims.

**Trade-off**: More operational overhead, but 100% cloud-agnostic and cost-effective for early stage.

**Migration Path**: Switch to managed services by changing one environment variable.

### 3. Why LangGraph Over Linear Chains?

**Problem**: Linear chains fail silently, can't recover from errors, no state between steps.

**Solution**: LangGraph provides graph-based execution with:
- State persistence between nodes
- Conditional routing based on results
- Built-in retry mechanisms
- Debugging via state inspection

### 4. Why BetterAuth Over Passport.js?

**Problem**: Passport.js requires significant boilerplate and doesn't handle modern auth patterns well.

**Solution**: BetterAuth provides:
- Built-in OAuth providers
- Session management out of the box
- Database adapters (MongoDB)
- Bearer token support for APIs

### 5. Why pnpm Over npm/yarn?

**Problem**: npm/yarn duplicate dependencies across packages, slow installs.

**Solution**: pnpm uses content-addressable storage with hard links.

**Result**: 60-80% reduction in disk usage, 3-5x faster installs.

---

## Infrastructure

### Development Environment

```bash
# Start all services with hot reload
pnpm dev:up

# Services available:
# - Web:          http://localhost:5173
# - Backend API:  http://localhost:5001
# - Agent API:    http://localhost:5002
# - Mongo Express: http://localhost:8081
```

### Production Environment (Kubernetes)

```bash
# Deploy to local Kind cluster
./scripts/deploy-local.sh

# Deploy to cloud (after Terraform provisioning)
kubectl apply -f k8s/
```

### Scaling Configuration

| Service | Min Replicas | Max Replicas | Scale Trigger |
|---------|--------------|--------------|---------------|
| Backend | 2 | 10 | CPU > 50% |
| Agent Service | 1 | 10 | CPU > 70% |
| Web | 2 | 5 | CPU > 50% |

---

## Getting Started

### Prerequisites

- Node.js 22.x
- pnpm 10.x (`corepack enable && corepack prepare pnpm@latest --activate`)
- Docker & Docker Compose
- kubectl (for K8s deployment)
- Kind (for local K8s cluster)

### Quick Start (Docker Compose)

```bash
# Clone repository
git clone https://github.com/your-username/weather-agent.git
cd weather-agent

# Copy environment files
cp .env.example .env
cp packages/shared/.env.example packages/shared/.env

# Start development environment
pnpm dev:up

# Open http://localhost:5173
```

### Environment Variables

```bash
# packages/shared/.env
MONGODB_URI=mongodb://user:root@mongodb:27017/weather-agent?authSource=admin
BETTER_AUTH_SECRET=<generate-random-string>
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<oauth-secret>
REDIS_HOST=redis
REDIS_PORT=6379

# apps/agent-service/.env
GMAIL_USER=<your-gmail>
GMAIL_PASSWORD=<app-password>
OPENWEATHER_API_KEY=<api-key>
```

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Create account |
| POST | `/api/auth/sign-in/email` | Login |
| GET | `/api/auth/get-session` | Get current session |
| POST | `/api/auth/sign-out` | Logout |

### Weather Schedule Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/schedule/create` | Create weather schedule | Required |
| DELETE | `/api/schedule/delete/:id` | Delete schedule | Required |

### Health & Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Backend health check |
| GET | `/api/metrics` | Prometheus metrics |
| GET | `/health` | Agent service health |

---

## Roadmap

### In Progress

- [ ] Dashboard UI implementation
- [ ] Mobile app (React Native/Expo)
- [ ] Multi-city weather schedules

### Planned

- [ ] Unit and integration test suites
- [ ] ESLint configuration for backend services
- [ ] Terraform cloud provisioning (EKS/GKE)
- [ ] GitHub Actions deployment pipeline
- [ ] OpenAPI documentation
- [ ] Multi-model LLM support (Ollama)
- [ ] Real-time notifications (WebSocket)

---

## Development

### Code Quality

```bash
# Lint web frontend
pnpm --filter web lint

# Build specific service
pnpm --filter backend build
pnpm --filter web build
```

### Adding a New Service

1. Create directory in `apps/`
2. Add to `pnpm-workspace.yaml`
3. Create Dockerfile.dev and Dockerfile.prod
4. Add to docker-compose files
5. Create K8s manifests in `k8s/`

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

## License

Distributed under the Apache 2.0 License. See [LICENSE](LICENSE) for details.

---

## Architecture Documentation

For detailed architectural decisions and infrastructure patterns, see:
- [ARCHITECTURE_DESIGN.md](ARCHITECTURE_DESIGN.md) - Infrastructure scaling guide
- [k8s/README.md](k8s/README.md) - Kubernetes deployment guide
- [k8s/INGRESS_GUIDE.md](k8s/INGRESS_GUIDE.md) - Ingress configuration

---

**Built for scale. Designed for production.**
