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
COPY packages/shared/package.json ./packages/shared/

# Install dependencies using cache mount for pnpm store
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copy the actual source code
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

# Build the web application
RUN pnpm --filter web build

# Runtime stage - Use Nginx to serve static assets
FROM nginx:alpine AS runtime

# Copy built assets to Nginx's public directory
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Nginx starts automatically in the foreground by default
CMD ["nginx", "-g", "daemon off;"]
