FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @x402/shared build
RUN pnpm --filter @x402/server build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV STORE_DRIVER=file
ENV STORE_FILE=/app/data/store.json
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 server
RUN mkdir -p /app/data && chown server:nodejs /app/data
COPY --from=builder --chown=server:nodejs /app/packages/server/dist ./dist
COPY --from=builder --chown=server:nodejs /app/packages/shared/dist ./shared/dist
COPY --from=deps --chown=server:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=server:nodejs /app/packages/server/package.json ./
USER server
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthz', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
CMD ["node", "dist/index.js"]

