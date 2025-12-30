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

# Setup environment variables
COPY .env.development .env
ENV NEXT_PUBLIC_API_URL="http://15.206.254.103:8002/api/v1"

# Build the application using the production environment
ENV NODE_ENV=production
RUN pnpm run build

FROM base AS runner
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.env ./

ENV NODE_ENV=production
ENV PORT=8110

EXPOSE 8110

CMD ["pnpm", "start"]