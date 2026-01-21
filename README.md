# 🌤️ WeatherMind: Enterprise-Level Cloud-Native Microservices Platform

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20|%20TypeScript%20|%20React%20|%20K8s%20|%20Nginx-brightgreen)]()

An enterprise-grade, AI-orchestrated weather intelligence system built with a focus on **scalability**, **fault tolerance**, and **cloud-agnostic infrastructure**. This platform demonstrates elite Software Development Life Cycle (SDLC) practices, from local development to production-ready deployments.

---

## 🏗️ Architectural Excellence

This project isn't just a weather app; it's a blueprint for a **Production-Ready SaaS**.

## 📂 Project Structure

```
.
├── apps
│   ├── agent-service   # AI Weather Intelligence & Automation
│   ├── backend         # Authentication & User Management
│   ├── mobile          # React Native Mobile App
│   └── web             # React (Vite) Frontend
├── packages
│   └── shared          # Shared utilities, types, and schema
├── infra               # Infrastructure configuration & scripts
├── k8s                 # Kubernetes manifests for deployment
├── terraform           # Terraform scripts for cloud provisioning
├── docker-compose.dev.yaml   # Local development orchestration
├── docker-compose.prod.yaml  # Production orchestration
└── README.md
```

### 1. Monorepo & Microservices

Built with **Turborepo**, the codebase is split into independent services that share core logic through internal packages.

- **`apps/web`**: High-performance React (Vite) frontend.
- **`apps/backend`**: Authentication & User Management service (Express + BetterAuth).
- **`apps/agent-service`**: AI Weather Intelligence & Automation service.
- **`packages/shared`**: Shared DB models, auth middleware, and monitoring logic.

### 2. AI Agent Orchestration (LangGraph)

Unlike simple API wrappers, this system uses **LangGraph.js** to manage complex, stateful AI workflows.

- **Cycles & Logic**: The agent can reason, fetch data, format it, and handle errors autonomously.
- **Tools**: Custom tools for weather data extraction and email delivery.

### 3. Reliability & Scheduling

- **BullMQ + Redis**: Distributed job processing ensures that high-volume email tasks are queued and retried automatically.
- **Distributed Caching**: Redis acts as both a job queue and a session store.

---

## 🚀 Cloud-Native Infrastructure & Traffic Management

The project is designed to be **Cloud-Agnostic**, prioritizing portability and operational control.

- **Kubernetes (K8s)**: Complete manifest suite for Deployments, StatefulSets (MongoDB/Redis), and Services.
- **Nginx Ingress**: Acts as the API Gateway, handling path-based routing, SSL termination, and request rate limiting.
- **Cert-Manager**: Automated SSL/TLS certificate management via Let's Encrypt integration.
- **Observability**: Integrated **Prometheus** for metrics scraping and **Grafana** for real-time performance dashboards.

---

## 🛠️ Enterprise SDLC Workflow

Detailed implementation of professional software engineering standards:

1.  **Local Development**: Using **Kind (Kubernetes in Docker)** to mirror the production environment locally with dev-prod parity.
2.  **Containerization**: Multi-stage Docker builds to produce optimized, secure, and minimal production images.
3.  **Traffic Control**: Advanced Nginx configuration for service discovery and secure routing between microservices.
4.  **Security**: unified authentication layer via **BetterAuth** with secure session management and cross-service validation.

---

## 📘 Technical Design & Rationale

Strategic decisions behind the platform's architecture.

### Why Microservices for this system?

Separates concerns effectively. If the AI agent (LangGraph) becomes compute-intensive, we scale only `agent-service`. If user signups spike, we scale `backend`. It prevents a single point of failure and allows for independent deployment cycles.

### How is Data Consistency handled across services?

We use a **Shared Model Package** in our monorepo. This ensures all services are synchronized on the schema while maintaining separate logical collections to prevent tight coupling at the database level.

### Why host Databases in K8s instead of Managed Services initially?

For early-stage scaling, it's about **Cost vs. Portability**. Hosting in K8s (StatefulSets) is cost-effective and 100% cloud-agnostic. The architecture is designed to be "Managed-Ready"—the switch to RDS or Atlas is a simple environment variable change, but the core logic remains portable.

### What is the advantage of LangGraph over linear chains?

**Control and Error Recovery**. LangGraph allows for **Cycles** and **State Management**. Unlike linear chains, a graph can "loop back" if a tool result (like a weather fetch) is unsatisfactory or needs refinement, which is critical for reliable agentic behavior.

---

## 🔧 Tech Stack & Roadmap

| Layer          | Technologies                                  |
| :------------- | :-------------------------------------------- |
| **Frontend**   | React, Vite, TailwindCSS, Lucide Icons        |
| **AI/Agent**   | LangGraph.js, LangChain.js, OpenAI            |
| **Backend**    | Node.js, TypeScript, Express, BetterAuth, Zod |
| **Queues**     | BullMQ, Redis (IORedis)                       |
| **Database**   | MongoDB (Mongoose)                            |
| **Networking** | Nginx Ingress, Cert-Manager                   |
| **Monitoring** | Prometheus, Grafana                           |

### 🗺️ Future Roadmap

- [ ] **Infrastructure as Code**: Implementing **Terraform** for automated cloud resource provisioning (EKS/GKE).
- [ ] **CI/CD**: Enhancing GitHub Actions for full automated deployment validation.
- [ ] **Multi-model Agents**: Adding support for local LLMs (Ollama) to reduce external API dependency.

---

## 🛠️ Getting Started

### Prerequisites

- `pnpm` 8+
- `Docker` & `Kind` (for local K8s)
- `kubectl`

### Local Deployment (Production Mirror)

```bash
# Clone the repository
git clone https://github.com/your-username/weather-agent.git

# Run the automated local K8s deployment script
chmod +x scripts/deploy-local.sh
./scripts/deploy-local.sh
```

---

## 📄 License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.

---

**Built with ❤️ for Scalability and AI Excellence.**
