# #!/bin/bash

# # ==============================================================================
# # Weather Agent - Local Kind Deployment Script
# # ==============================================================================
# # This script automates the build and deployment process for the Kind cluster.
# # Usage: ./scripts/deploy-local.sh
# # ==============================================================================

# set -e # Exit on error

# CLUSTER_NAME="weather-agent"

# echo "🚀 Starting Local Deployment to Kind cluster: $CLUSTER_NAME"

# # 1. Build Base/Shared if necessary (Assuming Dockerfile handles this)
# echo "📦 Building Docker Images..."

# echo "🔹 Building Backend..."
# docker build -t backend:local -f apps/backend/Dockerfile.prod .

# echo "🔹 Building Agent Service..."
# docker build -t agent-service:local -f apps/agent-service/Dockerfile.prod .

# echo "🔹 Building Web Frontend..."
# docker build -t web:local -f apps/web/Dockerfile.prod .

# # 2. Load Images into Kind
# echo "🚚 Loading images into Kind cluster..."
# kind load docker-image backend:local --name $CLUSTER_NAME
# kind load docker-image agent-service:local --name $CLUSTER_NAME
# kind load docker-image web:local --name $CLUSTER_NAME

# # 3. Apply Kubernetes Manifests
# echo "☸️ Applying Kubernetes Manifests..."

# # Install cert-manager if not present
# echo "🔹 Ensuring cert-manager is installed..."
# kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# # Wait for cert-manager to be ready
# echo "🔹 Waiting for cert-manager to be ready..."
# kubectl wait --namespace cert-manager \
#   --for=condition=ready pod \
#   --selector=app.kubernetes.io/instance=cert-manager \
#   --timeout=120s

# # Add stabilization delay for cert-manager webhook certificates to propagate
# echo "🔹 Stabilizing cert-manager webhook (20s)..."
# sleep 20

# # Install Ingress Controller if not present
# echo "🔹 Ensuring Ingress Controller is installed..."
# kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# # Wait for Ingress Controller to be ready (CRITICAL: must be ready before applying Ingress resource)
# echo "🔹 Waiting for Ingress Controller to be ready..."
# kubectl wait --namespace ingress-nginx \
#   --for=condition=ready pod \
#   --selector=app.kubernetes.io/component=controller \
#   --timeout=120s

# # Apply all project manifests recursively
# echo "🔹 Applying project resources..."
# kubectl apply -f k8s/ -R

# # Wait for all pods in default namespace to be ready
# echo "🔹 Waiting for application pods to be ready..."
# kubectl wait --for=condition=ready pod --all --timeout=300s

# # 4. Port Forwarding
# echo "🔌 Setting up Port Forwarding..."

# # Cleanup existing port-forward on 8080
# EXISTING_PID=$(lsof -t -i :8080 || true)
# if [ ! -z "$EXISTING_PID" ]; then
#     echo "🔹 Cleaning up existing port-forward (PID: $EXISTING_PID)..."
#     kill -9 $EXISTING_PID || true
# fi

# # Run port-forward in background
# echo "🔹 Starting port-forward to weather-agent.com:8080 in background..."
# kubectl port-forward service/ingress-nginx-controller -n ingress-nginx 8080:80

# echo "✅ Deployment completed successfully!"
# echo "-------------------------------------------------------"
# echo "🌐 App URL: http://weather-agent.com:8080"
# echo "🏥 Health:  http://weather-agent.com:8080/api/health"
# echo "-------------------------------------------------------"
# echo "Note: Port-forwarding is running in the background."
# echo "Run 'kubectl get pods' to check status."


set -e # Exit on error

CLUSTER_NAME="weather-agent"

if kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"; then
    echo "✓ Cluster '${CLUSTER_NAME}' already exists"
else
    echo "Creating cluster '${CLUSTER_NAME}'..."
    kind create cluster --name "${CLUSTER_NAME}"
    echo "✓ Cluster '${CLUSTER_NAME}' created successfully"
fi

docker build -t backend:local -f apps/backend/Dockerfile.prod .
docker build -t agent-service:local -f apps/agent-service/Dockerfile.prod .
docker build -t web:local -f apps/web/Dockerfile.prod .

kind load docker-image backend:local --name $CLUSTER_NAME
kind load docker-image agent-service:local --name $CLUSTER_NAME
kind load docker-image web:local --name $CLUSTER_NAME

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

kubectl apply -f k8s/ -R

EXISTING_PID=$(lsof -t -i :8080 || true)
if [ ! -z "$EXISTING_PID" ]; then
    echo "🔹 Cleaning up existing port-forward (PID: $EXISTING_PID)..."
    kill -9 $EXISTING_PID || true
fi

kubectl port-forward service/ingress-nginx-controller -n ingress-nginx 8080:80