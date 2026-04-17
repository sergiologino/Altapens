# AI Changelog

## 2026-04-17
- **Бренд / донаты:** SVG-логотип «сердце в ладонях» — `apps/web/public/favicon.svg`, `brand-logo.svg`; верхняя полоса `AppTopBar` на всех экранах SPA; логотип в `ShellNav`; страницы `/donate`, `/donate/return` (paywall + возврат с ЮKassa); `payments-client`, контракты в `api-contracts`; лендинг — иконка, логотип в шапке, кнопка «Поддержать проект» на `NEXT_PUBLIC_APP_URL/donate`; Vitest `payments-contract.test.ts`
- **Backend / ЮKassa:** Flyway `V6__donation_payments.sql`; `app.yookassa.*`; модуль `modules/payments` — `POST /api/v1/payments/donations`, `GET .../donations/{id}/status`; Security permitAll для этих путей; интеграционный тест `DonationPaymentIntegrationTest`; `docker-compose.coolify.yml` — env для ЮKassa и `APP_PUBLIC_WEB_URL`; `DECISIONS.md` DEC-020; обновлены `domains/backend-auth-care.md`, `domains/frontend-web.md`, `domains/mobile-app.md`, `CURRENT_STATE.md`
- **Backend / push:** Flyway `V5__notification_send_log.sql`; Firebase Admin SDK (`com.google.firebase:firebase-admin`); `app.push.fcm.*` в `application.yml`; при включённом FCM — `FirebaseMessagingConfiguration`, `MissedMedicationSlotScanner`, `MissedMedicationPushService`, `CaregiverPushTargetService`, `NotificationDedupeService`, `MissedMedicationPushScheduler` (`@EnableScheduling`); триггер пропущенного приёма для курсов с `notify_on_missed` → FCM опекунам; обновлены `docs/push-notifications.md`, `RUN_LOCAL.md`, `CURRENT_STATE.md`, `DECISIONS.md` (DEC-019), `domains/backend-auth-care.md`

## 2026-04-16
- **Mobile (документация):** добавлен домен `docs/ai/domains/mobile-app.md`; обновлены `ARCHITECTURE.md`, `PROJECT_OVERVIEW.md`, `CURRENT_STATE.md`, `DECISIONS.md` (DEC-017: Capacitor, отдельный репозиторий, Android 12+); в `frontend-web.md` — ссылка на домен mobile
- **Mobile_version:** `minSdkVersion` поднят с 23 до **31** (Android 12+) в `android/variables.gradle`; в `RUN_MOBILE_LOCAL.md` — примечание про minSdk; в `README.md` — ссылка на `docs/ai/domains/mobile-app.md`
- **Push (регистрация токена):** backend — Flyway `V4__device_push_tokens.sql`, `POST /api/v1/notifications/devices`, `NotificationDeviceIntegrationTest`; `packages/api-contracts` — `registerDevicePushRequestSchema`; web — `@capacitor/core`, `@capacitor/push-notifications`, `shared/push/native-push.ts`, `NativePushBridge` в `AppProviders`; Mobile_version — зависимость `@capacitor/push-notifications`, `npx cap sync android`; обновлены `docs/push-notifications.md`, `domains/mobile-app.md`, `domains/backend-auth-care.md`, `DECISIONS.md` (DEC-018)

## 2026-04-15
- **Senior UI / голос:** главная — убран дублирующий блок «Как вы себя чувствуете?»; «Ближайшие дела» — вместо «слотов» формулировки с «приёмами», вёрстка строки (время отдельно от озвучки памятки); голос: сопоставление «Магний B6» с речью (латиница/кириллица у «6»), оптимистичное обновление кеша `senior-overview` после `recordMedicationIntake`
- **Голос (реплики):** `voice-natural-replies.ts` — вариативные тёплые фразы (в т.ч. после приёма лекарств с перечислением времён); `voice-route-prompts.ts` — несколько вариантов озвучки при смене экрана
- **Голос / лекарства:** при нераспознанном названии — ответ «не разобрала» и режим повтора (можно только название); ближайший по времени слот при нескольких приёмах в день; несколько времён в фразе («в 9 и в 14», «утром и днем», «два часа дня»); пакетная отметка и `voice-medication-resolve.ts`
- **Web:** напоминания о лекарствах для подопечного — браузерный `Notification` в минуту слота (при открытом приложении), настройки в «Профиль», дедупликация по дню; тесты `medication-reminder-logic.test.ts`; обновлены `docs/push-notifications.md`, `DECISIONS.md` (DEC-016)
- **Auth UI:** удалён блок «Демо-доступ» с тестовыми логинами; выравнивание форм входа/регистрации, стили `.auth-page` / `.auth-panel-sole`
- Прод-домены / деплой: CORS backend — `https://app.altapens.ru`; **Coolify + внешний Caddy:** Traefik у `web` переведён на `entrypoints=http` и правила `Host` под `*.localhost.sslip.io` (и публичные имена); TLS только на edge; в `docker/nginx.conf` для SPA — `altapens-web.localhost.sslip.io` в `server_name` (см. `DECISIONS.md` DEC-015)

## 2026-04-14
- **Landing:** добавлен `apps/landing` (Next.js 15 App Router) — маркетинговая главная с hero `landing_picture.webp`, адаптивная вёрстка, `sitemap.ts` / `robots.ts`, метаданные и JSON-LD для поисковиков и GEO; корневые скрипты `dev:landing`, `build:landing`; `convert-hero` для пересборки webp из `landing_source.png`
- **Landing (тексты и обзор):** упрощён язык для аудитории; убран видимый блок про SEO; обзор экранов с PNG-заглушками в `public/placeholders/`; маршруты `/dlya-pensionerov`, `/dlya-blizkih` с отдельным `metadata` (`seo-copy.ts`); скрытый GEO-текст `.geoHidden`; общий хедер/футер
- **Landing UX/Docker:** модальный просмотр иллюстраций (`LightboxImage`); иллюстрации на подстраницах; `docker/landing.Dockerfile`, сервис `landing` в compose (локально `:3081`), Coolify — отдельный host для лендинга
- **Web SEO:** `index.html` (ru, title/description/keywords/OG), `public/robots.txt` и `public/sitemap.xml`, `HelmetProvider` + `DocumentHead` с каноническими URL и `noindex` для кабинетов senior/caregiver; `apps/web/.env.example`
- **Яндекс.Метрика:** счётчик `108547150` в лендинге (`next/script`, опция `ssr`) и в веб-приложении; переменные отключения в `.env.example`

## 2026-04-10
- Отдельный проект **Mobile_version** (Capacitor 7): `lib/`, `scripts/`, `www/`, Vitest, CI workflow; сборка web из AltaPens через `build:web:mobile` (`--base ./`); скрипт в корневом `package.json` AltaPens

## 2026-04-09
- Frontend: голосовой режим senior — Web Speech API (`voice-tts`, `voice-stt`, `voice-intents` + Vitest), панель «Удерживайте и говорите», озвучка при смене экрана, команды: приём/пропуск/отложить лекарство (при API), чек-ин, давление в note, SOS; `AppShell` поддерживает `mainClassName`; в спеке зафиксировано отложенное подключение MCP

## 2026-04-08 (voice spec)
- Добавлена спецификация двустороннего голосового режима для senior: `docs/ai/specs/voice-mode-senior.md` (Web Speech API, интенты, интеграция с checkin/medications/SOS, этапы)

## 2026-04-08
- Backend: домен `medications` — Flyway `V2__medications.sql`, API `GET/POST /api/v1/care/medications`, `GET .../today-doses`, интеграционный тест `MedicationIntegrationTest`, демо-курс «Конкор» для Ивана в seed
- Backend: Flyway `V3__wellbeing_and_intakes.sql` — `wellbeing_checkins`, `medication_intakes`; `CareSeniorResolver`; `POST/GET /care/checkins`, `POST /care/medications/intake`, `GET /care/timeline`; `@Transactional(readOnly)` на чтение с ленивыми связями; расширен `MedicationIntegrationTest`
- Frontend: контракты zod для лекарств, расширен `care-client`, главная senior и история используют слоты с сервера; форма лекарств сохраняет через API с `?seniorUserId=` для опекуна; контракты и UI для чек-инов, приёма лекарств и ленты; обновлены AI-доки

## 2026-04-07 (вечер)
- Frontend: при настроенном backend (`VITE_API_BASE_URL` / same-origin) данные caregiver dashboard, списка подопечных и senior home берутся из care API; `care-client`, `care-dashboard`, `mock-care-data`, инвалидация кеша после login/register/accept invite; маршрут `/caregiver/seniors/:seniorId`; Vitest + `npm run test:web`; обновлены AI-доки

## 2026-04-07
- Backend: профиль Spring `dev` + `spring-boot-docker-compose` (`developmentOnly`) и `compose-dev-postgres.yml` на classpath — автозапуск PostgreSQL для локального `bootRun` без привязки к рабочей директории; по умолчанию `spring.docker.compose.enabled=false`, чтобы `local` и тесты не трогали Docker; тест `DevComposeFilePresenceTest`; обновлены `RUN_LOCAL.md` и AI-доки

## 2026-04-06
- Удалены из истории Git вендорные `tools/gradle-8.10.2` и `gradle-8.10.2-bin.zip` (лимиты размера GitHub); сборка backend — через Gradle Wrapper в `apps/backend`
- В `.gitignore` добавлены правила, чтобы локальный дистрибутив Gradle не попадал в коммиты; обновлён `docs/ai/CURRENT_STATE.md`

## 2026-03-19
- Инициализирована базовая AI-memory структура в `docs/ai/`
- Зафиксированы стартовые сведения о назначении проекта, архитектурном контуре и правилах ведения памяти
- Поднят frontend workspace с `apps/web` и shared-пакетами для токенов и типов
- Реализован первый web MVP-shell с отдельными интерфейсами для `senior` и `caregiver`, mock data layer и экраном настройки лекарств
- Добавлены auth-экраны, role-based route guards и persisted frontend session store
- Реализован invite flow: caregiver создает код, senior регистрируется по invite-code и попадает в свой профиль
- Добавлен `packages/api-contracts` и typed auth client для login/register/invite сценариев
- Auth и care-linking экраны переведены на React Query queries/mutations поверх adapter layer
- Поднят backend `apps/backend` на Spring Boot с Flyway, JPA, Security и первыми auth/care endpoints
- Добавлены миграции, demo seed data и integration tests для register/login/me/create-invite/accept-invite сценариев
- Frontend auth client получил HTTP adapter с fallback на local adapter через `VITE_API_BASE_URL`
- Добавлены `RUN_LOCAL.md` и опциональный `docker-compose.yml` для локального PostgreSQL
- Уточнены отступы и размеры кнопок в web UI; тексты экранов переведены на понятный русский без жаргона разработчиков
