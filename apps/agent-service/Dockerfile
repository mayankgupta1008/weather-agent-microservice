FROM node:22-alpine

WORKDIR /app

COPY package.json  pnpm-lock.yaml pnpm-workspace.yaml ./

COPY apps/agent-service/package.json ./apps/agent-service/

COPY packages/*/package.json ./packages/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY apps/agent-service ./apps/agent-service

COPY packages ./packages

EXPOSE 5002

CMD ["pnpm", "--filter", "agent-service", "run", "dev"]
