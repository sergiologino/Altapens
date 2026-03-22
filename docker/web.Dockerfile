# Сборка SPA из корня монорепозитория (workspaces)
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/api-contracts/package.json packages/api-contracts/package.json
COPY packages/design-tokens/package.json packages/design-tokens/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN npm ci

COPY apps/web apps/web
COPY packages/api-contracts packages/api-contracts
COPY packages/design-tokens packages/design-tokens
COPY packages/shared-types packages/shared-types

ARG VITE_API_SAME_ORIGIN=true
ENV VITE_API_SAME_ORIGIN=${VITE_API_SAME_ORIGIN}

RUN npm run build:web

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
