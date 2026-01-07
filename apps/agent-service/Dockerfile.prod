# Base stage for shared environment variables and tools
FROM node:22-alpine AS base
RUN corepack enable
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

# Build stage
FROM base AS build
# Copy workspace configuration and lockfile first for better caching
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for the service and its local dependencies
COPY apps/agent-service/package.json ./apps/agent-service/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies using cache mount for pnpm store
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copy the actual source code
COPY apps/agent-service ./apps/agent-service
COPY packages/shared ./packages/shared

# Use pnpm deploy to create a pruned, standalone package for the agent-service
# This handles local workspace dependencies and creates a production-ready folder
RUN pnpm --filter agent-service deploy --legacy /prod

# Runtime stage
FROM node:22-alpine AS runtime
WORKDIR /app

# Fix Alpine-specific user/group creation (addgroup/adduser instead of groupadd/useradd)
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy from the deployed folder in the build stage
COPY --from=build --chown=appuser:appgroup /prod ./

ENV NODE_ENV=production

# Use the non-root user
USER appuser

EXPOSE 5002

# Run using tsx since there's no build script defined, but ideally this would be compiled JS
CMD ["npx", "tsx", "src/index.ts"]