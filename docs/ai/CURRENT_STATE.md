# Текущее состояние

## Факты
- Проект `AltaPens` инициализирован как отдельный продукт в `E:\1_MyProjects\AltaCare\AltaPens`
- Создан базовый набор AI-memory файлов в `docs/ai/`
- Поднят frontend workspace с `apps/web`, `packages/api-contracts`, `packages/design-tokens` и `packages/shared-types`
- Поднят backend в `apps/backend` на `Spring Boot`
- `apps/web` реализован на `React + TypeScript + Vite`
- Во frontend добавлены две отдельные оболочки интерфейса: `senior` и `caregiver`
- Добавлены auth-экраны: login, register, invite accept
- Добавлен role-aware routing с guard-ами для `senior` и `caregiver`
- Добавлен frontend invite flow:
  - caregiver может создать invite-code
  - новый senior может зарегистрироваться с invite-code
  - после принятия создается care relationship в локальном store
- Добавлен typed API-ready слой для auth/care flows:
  - `packages/api-contracts` содержит zod-схемы и DTO-контракты
  - `apps/web/src/shared/api/auth-client.ts` инкапсулирует login/register/invite операции
  - auth-страницы и invite-экран используют React Query mutations/queries вместо прямого вызова store-методов
- Реализован первый backend API-срез:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`
  - `POST /api/v1/care/invites`
  - `GET /api/v1/care/invites`
  - `GET /api/v1/care/invites/{code}`
  - `POST /api/v1/care/invites/{code}/accept`
  - `GET /api/v1/care/seniors`
  - `GET /api/v1/care/caregivers`
  - `GET /api/v1/care/relationships/{id}`
- В backend добавлены Flyway миграции и JPA-модели для `users`, `user_roles`, `senior_profiles`, `caregiver_profiles`, `care_invites`, `care_relationships`
- В backend есть demo seed data для `Анна Смирнова` caregiver и `Иван Иванович` senior
- Frontend auth client умеет работать через HTTP adapter при наличии `VITE_API_BASE_URL`, сохраняя fallback на local adapter
- Реализованы базовые экраны и навигация для MVP-потоков:
  - senior: home, today, assistant, history, profile, SOS, anti-scam quick actions
  - caregiver: dashboard, seniors list, senior detail, invite create, medication form, events, AI, settings
- Подключены `TanStack Query`, `Zustand`, `React Hook Form`, `Zod`
- Данные UI работают через mock API/query слой, а auth/invite-flow — через typed auth client с локальным persisted adapter-слоем
- Backend integration tests на `auth` и `care_network` проходят на H2 test-profile
- Дизайн-система использует кастомные theme tokens, парную типографику, многослойные тени и отдельные роли по visual tone
- Сборка `npm run build:web` проходит успешно
- Сборка и тесты backend: из `apps/backend` через Gradle Wrapper (`gradlew` / `gradlew.bat`), дистрибутив Gradle в репозиторий не коммитится
- Runtime backend в обычном профиле требует реальную PostgreSQL базу `altacare`; отдельный in-memory dev-profile пока не добавлен
- В корне репозитория добавлены `RUN_LOCAL.md` (инструкция локального запуска на Windows) и опциональный `docker-compose.yml` только для PostgreSQL

## Что поддерживать в актуальном состоянии
- фактическую структуру backend/frontend/landing
- реализованные пользовательские сценарии
- текущие ограничения и незавершенные участки
