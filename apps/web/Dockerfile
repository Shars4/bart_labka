# syntax=docker/dockerfile:1

# ---- base -------------------------------------------------------------------
FROM node:24-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- build ------------------------------------------------------------------
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Baked into the prerendered static shell (absolute Open Graph URLs, footer
# link), so they are build arguments as well as runtime variables.
ARG SITE_URL=http://localhost:3000
ARG PUBLIC_API_DOCS_URL=http://localhost:4000/docs
ENV SITE_URL=$SITE_URL \
    PUBLIC_API_DOCS_URL=$PUBLIC_API_DOCS_URL
# The build never calls the API: every page that needs API data renders at
# request time.
RUN npm run build

# ---- runtime: the self-contained standalone server --------------------------
FROM base AS runtime
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
