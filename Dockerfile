FROM node:20-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN apt update -y && apt install -y ca-certificates
RUN npm install -g pnpm@10.12.4

FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Env vars come from Coolify: build args at build time, container env at runtime.
# next is called directly because the package scripts wrap it in env-cmd, which would
# load .env.development over the Coolify values.

# Build the application using the production environment
ENV NODE_ENV=production
RUN pnpm exec next build

FROM base AS runner
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

ENV NODE_ENV=production
ENV PORT=8110

EXPOSE 8110

CMD ["pnpm", "exec", "next", "start"]