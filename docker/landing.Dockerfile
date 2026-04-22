# SSR-лендинг Next.js (output: standalone) из корня монорепозитория
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/landing/package.json apps/landing/package.json

RUN npm ci

COPY apps/landing apps/landing

ARG NEXT_PUBLIC_SITE_URL=https://altapens.ru
ARG NEXT_PUBLIC_APP_URL=https://app.altapens.ru
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ESLINT_BUILD=1

RUN npm run build --workspace landing

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/landing/.next/standalone ./
COPY --from=builder /app/apps/landing/.next/static ./apps/landing/.next/static
COPY --from=builder /app/apps/landing/public ./apps/landing/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/landing/server.js"]
