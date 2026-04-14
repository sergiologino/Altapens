# Архитектура

## Контуры системы
- `backend` — единый backend/API и бизнес-логика
- `frontend` — основное пользовательское приложение
- `landing` — маркетинговый лендинг

## Базовое взаимодействие
- `frontend` получает данные и выполняет действия через `backend`
- `landing` презентует продукт и ведет пользователя в основное приложение
- Детальная архитектура будет уточняться по мере появления технического задания и структуры репозитория

## Текущее состояние
На текущем этапе создан frontend-контур в формате workspace/monorepo:

- `apps/backend` — Spring Boot modular monolith backend
- `apps/web` — React + TypeScript + Vite приложение
- `apps/landing` — Next.js (App Router) маркетинговый лендинг, отдельная сборка и деплой
- `packages/api-contracts` — типизированные frontend-ready контракты для auth/care flows
- `packages/design-tokens` — централизованные токены темы, типографики, теней, motion и layering
- `packages/shared-types` — общие типы фронтовой доменной модели

## Frontend-архитектура
- `apps/web` построен вокруг двух отдельных UX-профилей: `senior` и `caregiver`
- senior UI проектируется mobile-first, с крупными CTA, высокой читаемостью и подготовкой к voice-first сценариям
- caregiver UI проектируется как более плотная, но дружелюбная панель заботы
- данные пока подаются через mock/query слой, чтобы разрабатывать UX независимо от backend на старте
- auth-слой и care-linking пока реализованы на frontend через локальный store и route guards, чтобы обкатать UX до подключения backend API
- auth/invite flows уже пропущены через отдельный typed API client и React Query hooks, поэтому later switch на HTTP backend должен затронуть в основном adapter layer

## Backend-архитектура
- `apps/backend` строится как modular monolith на `Spring Boot + JPA + PostgreSQL + Flyway`
- backend-срез включает модули `auth`, `users`, `profiles`, `care_network`, `medications`, а также `common/security`, `common/errors`, `common/config`
- миграции ведутся через `Flyway` SQL-файлами в `apps/backend/src/main/resources/db/migration`
- для локальной разработки профиль `dev` может поднимать PostgreSQL через `spring-boot-docker-compose` и ресурс `compose-dev-postgres.yml` (см. `RUN_LOCAL.md`); интеграция Docker Compose в базовом конфиге по умолчанию отключена
- frontend должен интегрироваться с backend через `/api/v1/auth/*` и `/api/v1/care/*`, сохраняя контракты из `packages/api-contracts`
