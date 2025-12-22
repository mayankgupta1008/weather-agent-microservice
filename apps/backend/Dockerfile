FROM node:22-alpine

WORKDIR /app

COPY package.json  pnpm-lock.yaml pnpm-workspace.yaml ./

COPY apps/backend/package.json ./apps/backend/

COPY packages/*/package.json ./packages/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY apps/backend ./apps/backend

COPY packages ./packages

EXPOSE 5002

CMD ["pnpm", "--filter", "backend", "run", "dev"]
