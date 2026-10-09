# syntax=docker/dockerfile:1

# ---- base: shared by all stages ---------------------------------------------
FROM node:24-alpine AS base
WORKDIR /app
# Prisma's schema engine (used by `migrate deploy`) needs OpenSSL on Alpine.
RUN apk add --no-cache openssl
# Keep the Prisma CLI from checking for updates (network calls, log noise).
ENV PRISMA_HIDE_UPDATE_MESSAGE=1 \
    CHECKPOINT_DISABLE=1

# ---- build: install everything, generate the Prisma client, compile ---------
FROM base AS build
# Dependencies first, so this layer is cached until the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# `prebuild` runs `prisma generate` before `nest build`.
RUN npm run build \
 && npm prune --omit=dev

# ---- runtime: production dependencies and build output only -----------------
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
# Migrations and the seed run on every start. The seed is TypeScript (run by
# tsx) and imports the generated client and the password helper from src.
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/prisma.config.ts ./
COPY --from=build --chown=node:node /app/src ./src
USER node
EXPOSE 4000
# Applies pending migrations, seeds (idempotent), then starts the API.
CMD ["npm", "run", "start:docker"]
