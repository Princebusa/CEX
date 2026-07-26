FROM oven/bun:1.3.5 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/consumer/package.json ./apps/consumer/
COPY apps/client/package.json ./apps/client/
COPY apps/engine/package.json ./apps/engine/
COPY packages/db/package.json ./packages/db/
COPY packages/redis/package.json ./packages/redis/
COPY packages/comman/package.json ./packages/comman/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/prisma.config.ts ./packages/db/

ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN bun install --frozen-lockfile

FROM deps AS runner
COPY apps/engine ./apps/engine
COPY packages/redis ./packages/redis
COPY packages/comman ./packages/comman

WORKDIR /app/apps/engine

ENV NODE_ENV=production

CMD ["bun", "run", "index.ts"]
