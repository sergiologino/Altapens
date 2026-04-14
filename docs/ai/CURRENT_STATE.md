# Текущее состояние

## Факты
- Проект `AltaPens` инициализирован как отдельный продукт в `E:\1_MyProjects\AltaCare\AltaPens`
- Создан базовый набор AI-memory файлов в `docs/ai/`
- Поднят frontend workspace с `apps/web`, `apps/landing`, `packages/api-contracts`, `packages/design-tokens` и `packages/shared-types`
- Поднят backend в `apps/backend` на `Spring Boot`
- `apps/web` реализован на `React + TypeScript + Vite`; для SEO: `index.html` и `public/robots.txt` / `public/sitemap.xml`, `react-helmet-async` (`DocumentHead` + таблица `shared/seo/app-seo.ts`), для маршрутов `/senior/*` и `/caregiver/*` — `noindex`; см. `apps/web/.env.example` (`VITE_PUBLIC_SITE_URL`)
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
  - `GET/POST /api/v1/care/medications`, `GET /api/v1/care/medications/today-doses`, `POST /api/v1/care/medications/intake` (курс, слоты на день, фиксация приёма по слоту)
  - `POST/GET /api/v1/care/checkins` (самочувствие подопечного; опекун — с `seniorUserId`)
  - `GET /api/v1/care/timeline` (объединённая лента чек-инов и приёмов лекарств; опекун — с `seniorUserId`)
- В backend добавлены Flyway миграции и JPA-модели для `users`, `user_roles`, `senior_profiles`, `caregiver_profiles`, `care_invites`, `care_relationships`, `medications`, `wellbeing_checkins`, `medication_intakes`
- В backend есть demo seed data для `Анна Смирнова` caregiver и `Иван Иванович` senior
- Frontend auth client умеет работать через HTTP adapter при наличии `VITE_API_BASE_URL`, сохраняя fallback на local adapter
- Реализованы базовые экраны и навигация для MVP-потоков:
  - senior: home, today, assistant, history, profile, SOS, anti-scam quick actions
  - caregiver: dashboard, seniors list, senior detail, invite create, medication form, events, AI, settings
- Подключены `TanStack Query`, `Zustand`, `React Hook Form`, `Zod`
- При `VITE_API_BASE_URL` (или same-origin): care API для **сети заботы**, **лекарств** (в т.ч. фиксация приёма), **чек-инов самочувствия** и **ленты событий** (для опекуна — по первому подопечному из списка); история приёмов на экране «История» по-прежнему совпадает со слотами на сегодня до отдельного API истории; auth/invite-flow — typed client + локальный store
- Backend integration tests на `auth` и `care_network` проходят на H2 test-profile
- Дизайн-система использует кастомные theme tokens, парную типографику, многослойные тени и отдельные роли по visual tone
- Сборка `npm run build:web` и unit-тесты `npm run test:web` (Vitest, маппинг care-dashboard) проходят успешно
- **Лендинг:** `apps/landing` — Next.js 15 (App Router), SSR/SSG для главной; hero `public/landing_picture.webp`; SEO: `metadata` (title, description, keywords, Open Graph, Twitter), `app/sitemap.ts`, `app/robots.ts`, JSON-LD (Organization, WebSite, SoftwareApplication); Яндекс.Метрика — `components/YandexMetrika.tsx`; переменные см. `apps/landing/.env.example`; скрипты корня: `dev:landing`, `build:landing`; опционально `npm run convert-hero` в workspace landing при наличии `landing_source.png` для пересборки webp
- Сборка и тесты backend: из `apps/backend` через Gradle Wrapper (`gradlew` / `gradlew.bat`), дистрибутив Gradle в репозиторий не коммитится
- Runtime backend требует PostgreSQL `altacare`: профиль **`local`** — подключение к уже запущенной БД; профиль **`dev`** — автозапуск PostgreSQL в Docker через `spring-boot-docker-compose` и `compose-dev-postgres.yml` на classpath (см. `RUN_LOCAL.md`); интеграционные тесты по-прежнему на H2
- В корне репозитория: `RUN_LOCAL.md`, корневой `docker-compose.yml` (полный стек или только postgres); для JVM из IDE — профиль `dev` и compose-файл в `apps/backend/src/main/resources/`

## Планируемое (спецификации)
- **Голосовой режим senior (двусторонний):** реализован базовый контур в `apps/web/src/features/voice/` (TTS/STT, парсер фраз `voice-intents`, панель `SeniorVoiceShell` в layout senior); подробности и этапы расширения — `docs/ai/specs/voice-mode-senior.md`. **MCP/внешние источники** — позже, после стабилизации голоса (см. §11 той же спецификации).
- **Аналитика:** Яндекс.Метрика (счётчик `108547150`) подключена в `apps/landing` (`YandexMetrika`) и в `apps/web` (`shared/analytics/YandexMetrika`); отключение локально: `NEXT_PUBLIC_YANDEX_METRIKA_DISABLED` / `VITE_YANDEX_METRIKA_DISABLED`. Google Tag — позже, когда будет готов счётчик.

## Что поддерживать в актуальном состоянии
- фактическую структуру backend/frontend/landing
- реализованные пользовательские сценарии
- текущие ограничения и незавершенные участки
