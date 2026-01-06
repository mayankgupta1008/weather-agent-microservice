# syntax=docker/dockerfile:1

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
COPY apps/web/package.json ./apps/web/
# Web usually doesn't need @weather-agent/shared since it's a frontend app, 
# but if it does, keep it here. Based on package.json, it's not listed, 
# but we follow the monorepo pattern for consistency.
COPY packages/shared/package.json ./packages/shared/

# Install dependencies using cache mount for pnpm store
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copy the actual source code
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

# Build the web application
RUN pnpm --filter web build

# Runtime stage: Serve with Nginx
FROM nginx:stable-alpine AS runtime

# Copy the built assets from the build stage
# Note: apps/web/dist is the default Vite build output
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

# Copy the custom Nginx configuration for SPA routing
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
