FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Build the source code
FROM base AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 botlace

COPY --from=deps --chown=botlace:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=botlace:nodejs /app/dist ./dist
COPY --from=builder --chown=botlace:nodejs /app/package.json ./package.json

USER botlace

EXPOSE 3000

CMD ["node", "dist/index.js"]
