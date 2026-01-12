#!/bin/bash

# ==============================================================================
# Weather Agent - Local Kind Cleanup Script
# ==============================================================================
# This script deletes all resources created by the deployment script.
# Usage: ./scripts/stop-local.sh
# ==============================================================================

echo "🛑 Stopping and cleaning up local Kubernetes resources..."

# Apply deletion recursively
echo "🔹 Deleting all project resources..."
kubectl delete -f k8s/ -R --ignore-not-found=true

# Optional: Delete cert-manager and ingress-nginx if you want a full sweep
echo "🔹 Deleting cert-manager..."
kubectl delete -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml --ignore-not-found=true

echo "🔹 Deleting Ingress Controller..."
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml --ignore-not-found=true

echo "✅ Cleanup completed successfully!"
echo "Current pod status:"
kubectl get pods
