# Weather Agent - Kubernetes Documentation

This directory contains all the Kubernetes manifests required to deploy the Weather Agent application in a production-ready state.

## 🚀 Quick Start (Local Development)

To build and deploy the entire stack to your local `kind` cluster, run:
```bash
./scripts/deploy-local.sh
```

To stop and remove all resources, run:
```bash
./scripts/stop-local.sh
```

## 🏗️ Architecture

The application is split into several microservices:

- **`web`**: Frontend React/Vite application served via Nginx.
- **`backend`**: Core API handling business logic and auth.
- **`agent-service`**: Background worker handling email notifications and jobs.
- **`mongodb`**: Primary database.
- **`redis`**: Job queue and caching layer.

## 🛠️ Manual Commands

If you need to run steps manually, use these commands:

### Build & Load Images

```bash
# Backend
docker build -t backend:local -f apps/backend/Dockerfile.prod .
kind load docker-image backend:local --name weather-agent

# Agent Service
docker build -t agent-service:local -f apps/agent-service/Dockerfile.prod .
kind load docker-image agent-service:local --name weather-agent

# Web
docker build -t web:local -f apps/web/Dockerfile.prod .
kind load docker-image web:local --name weather-agent
```

### Apply Resources

```bash
# Apply everything recursively
kubectl apply -f k8s/ -R
```

### Troubleshooting

```bash
# Check pod status
kubectl get pods

# View logs for a specific service
kubectl logs -l app=backend --tail=100

# Describe a failing pod
kubectl describe pod <pod-name>
```

## 🔒 Enterprise Features Implemented

- **Graceful Shutdown**: All services handle `SIGTERM` to ensure zero-downtime updates.
- **Resource Management**: CPU and Memory requests/limits defined for all pods.
- **Security**: Ingress-level rate limiting (15 rps) and security headers.
- **Structured Logging**: JSON logs in production mode.
- **SSL Readiness**: Automated certificate management with `cert-manager`.

## 🌐 Networking

The app is exposed via Ingress at `http://weather-agent.com`.
Ensure your `/etc/hosts` file contains:

```text
127.0.0.1 weather-agent.com
```
