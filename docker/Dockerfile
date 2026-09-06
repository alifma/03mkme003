# Build context is the project root (see docker-compose.yml: context: ..)
FROM node:22-alpine AS base
RUN corepack enable

# ---- deps: install with a frozen lockfile, cached separately from source ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `next build` imports every route module (including layouts) to determine
# which are static vs dynamic — that import chain reaches src/config/env.ts,
# which validates process.env and throws if anything required is missing.
# These placeholders exist ONLY to satisfy that validation at build time;
# they are never used to serve real requests. The actual values come from
# the container's runtime environment (env_file / environment: below),
# which override whatever's baked into the image here.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV AUTH_SECRET="build-time-placeholder-do-not-use-in-prod-0000"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"

RUN pnpm build

# ---- runner: minimal image, only the standalone output ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Pre-create the uploads dir owned by the runtime user. A named volume
# mounted here (see docker-compose.yml) inherits this ownership on first
# use, so `next` (uid 1001) can write uploads into it.
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

# .next/standalone doesn't include public/ or .next/static — copied in
# manually per Next.js's documented standalone output convention.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
