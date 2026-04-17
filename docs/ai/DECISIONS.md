# Архитектурные решения

## DEC-001: `docs/ai/` — единственный источник AI-памяти
- Статус: Accepted
- Контекст: проекту нужна постоянная память, не зависящая от истории чата
- Решение: использовать файлы в `docs/ai/` как единственный источник истины для AI-контекста
- Последствия: перед каждой задачей необходимо читать файлы памяти; после изменений обновлять `CURRENT_STATE.md`, фиксировать решения и добавлять запись в `CHANGELOG_AI.md`

## DEC-002: Проект состоит из трех верхнеуровневых частей
- Статус: Accepted
- Контекст: на старте заранее определены backend, frontend и landing
- Решение: поддерживать архитектуру проекта вокруг этих трех контуров до появления новых подтвержденных требований
- Последствия: новые решения и доменные разрезы должны укладываться в эту базовую структуру или явно расширять ее

## DEC-003: Frontend стартует как workspace с выделенными пакетами
- Статус: Accepted
- Контекст: ТЗ требует архитектуру, пригодную для дальнейшего выноса логики в mobile-клиент и переиспользуемые слои
- Решение: запустить frontend в структуре `apps/web` + `packages/design-tokens` + `packages/shared-types`
- Последствия: theme/token слой и типы домена не должны зашиваться в UI-экран напрямую; дальнейшие shared-пакеты можно добавлять без перестройки основы

## DEC-004: Senior и caregiver получают разные UX-оболочки
- Статус: Accepted
- Контекст: в ТЗ явно заданы две разные аудитории с разной эргономикой, плотностью информации и tone of voice
- Решение: строить frontend не как одну универсальную панель, а как два отдельных shell/route-потока: `senior` и `caregiver`
- Последствия: senior UI остается предельно простым и крупным, caregiver UI может быть информационно плотнее; общие компоненты и токены должны поддерживать обе роли

## DEC-005: Auth и invite flow сначала обкатываются на frontend store
- Статус: Accepted
- Контекст: backend еще не реализован, но нужно быстро проверить UX для login/register, role routing и care-linking по invite-code
- Решение: временно реализовать auth session, invite records и care relationships через локальный persisted Zustand store с route guards
- Последствия: UX и контракты ролей уже проверяются в браузере; позже store должен быть адаптирован под backend API без слома экранов и маршрутов

## DEC-006: Перевод на backend идти через typed client layer
- Статус: Accepted
- Контекст: после проверки UX нужно уменьшить будущую стоимость перехода с локального store на реальный backend
- Решение: вынести auth/invite операции в `packages/api-contracts` и `shared/api/auth-client.ts`, а UI-экраны подключать через React Query hooks
- Последствия: экраны меньше зависят от конкретного источника данных; замена local adapter на HTTP adapter должна происходить без заметного переписывания форм, роутинга и экранов

## DEC-007: Для backend MVP выбран Flyway
- Статус: Accepted
- Контекст: на старте нужно быстро поднимать modular monolith с прозрачными SQL-миграциями под PostgreSQL
- Решение: использовать `Flyway` с SQL migration files вместо Liquibase
- Последствия: схема БД развивается через явные versioned SQL-файлы; изменения структуры удобно ревьюить вместе с кодом backend-модулей

## DEC-008: Backend стартует с auth и care_network
- Статус: Accepted
- Контекст: уже реализованный фронт зависит в первую очередь от login/register/me и invite/care-linking flow
- Решение: первой backend-реализацией закрыть `auth`, `users`, `profiles`, `care_network`, а остальные домены отложить на следующие этапы
- Последствия: frontend local auth adapter можно постепенно заменять на реальные `/api/v1/auth/*` и `/api/v1/care/*` endpoints без переделки senior/caregiver shell

## DEC-011: Курсы лекарств в БД и API под префиксом `/api/v1/care/medications`
- Статус: Accepted
- Контекст: нужен первый «реальный» домен после care_network; UI уже оперирует слотами приёма и формой курса
- Решение: таблица `medications` (FK на `senior_profiles`), текстовые поля расписания (`exact_times`, `days_of_week`) для простоты MVP; выдача «сегодняшних» слотов через разбор `exact_times`; доступ опекуна только при активной связи с подопечным (`seniorUserId` в query/body)
- Последствия: фиксация факта приёма вынесена в `medication_intakes` (см. DEC-012)

## DEC-012: Чек-ины, приёмы лекарств и лента — отдельные таблицы и общий доступ через `CareSeniorResolver`
- Статус: Accepted
- Контекст: UI уже показывает чек-ины и ленту как mock; нужно хранить факты без перегруза `medications`
- Решение: таблицы `wellbeing_checkins` (FK на `senior_profiles`, enum-состояние, `note`, `created_at`) и `medication_intakes` (FK на `medications`, дата в часовом поясе подопечного, индекс слота, статус enum, кто зафиксировал); единый `CareSeniorResolver` для правил senior/caregiver; объединённая лента строится в сервисе из чек-инов и intakes, сортировка по времени
- Последствия: лента опекуна на экране «События» при HTTP пока привязана к первому подопечному из `GET /care/seniors`; полноценный multi-senior feed — отдельная задача

## DEC-010: Care lists на фронте через отдельный HTTP-слой и маппинг в UI-модель
- Статус: Accepted
- Контекст: backend уже отдаёт `GET /care/seniors`, `GET /care/caregivers`, `GET /care/invites`, а UI ожидает богатые структуры (`CaregiverDashboard`, `SeniorOverview`) с полями, которых в API пока нет
- Решение: `apps/web/src/shared/api/care-client.ts` (fetch + zod из `api-contracts`), чистые функции в `care-dashboard.ts`, подстановка демо-фрагментов из `mock-care-data.ts` для отсутствующих доменов; переключение по тем же `VITE_*`, что и auth
- Последствия: при появлении medication/check-in API маппинг и контракты расширяются без смены маршрутов и оболочек senior/caregiver

## DEC-014: Яндекс.Метрика на лендинге и в web
- Статус: Accepted
- Контекст: нужна веб-аналитика без ожидания Google Tag
- Решение: общий счётчик `108547150`; лендинг — клиентский компонент + `next/script` (`afterInteractive`); SPA — вставка сниппета в `useEffect` с защитой от повторной вставки; отключение через `NEXT_PUBLIC_YANDEX_METRIKA_DISABLED` / `VITE_YANDEX_METRIKA_DISABLED`
- Последствия: Google Tag добавляется отдельно позже; при смене счётчика обновить константы по умолчанию или только env

## DEC-013: Лендинг на Next.js (App Router) с SSR/SSG для SEO
- Статус: Accepted
- Контекст: нужен отдельный маркетинговый контур с полноценной индексацией (sitemap, robots, метаданные, структурированные данные для GEO/ИИ-поиска), без смешения с SPA `apps/web`
- Решение: разместить лендинг в `apps/landing` на Next.js 15 с `metadata`, `app/sitemap.ts`, `app/robots.ts`, JSON-LD в `layout`; статические ассеты в `public/`; канонический origin через `NEXT_PUBLIC_SITE_URL`; ссылка в приложение через `NEXT_PUBLIC_APP_URL`
- Последствия: прод-сборка лендинга — `npm run build --workspace landing`; локально порт `3001` по умолчанию; шрифты Google: заголовки Fraunces (latin/latin-ext), текст Manrope с кириллицей

## DEC-015: Прод: TLS на внешнем прокси, Traefik Coolify — HTTP и Host под sslip
- Статус: Accepted
- Контекст: домашний сервер за динамическим IP; публичный вход — reverse proxy (напр. Caddy на VDS), до Coolify трафик идёт по HTTP с подменой `Host` на имена вида `*.localhost.sslip.io`, выданные Coolify
- Решение: не опираться в Traefik только на публичные `Host(`altapens.ru`)` / `app…` без sslip; один роутер на `entrypoints=http` с `Host`, включающим `altapens-web.localhost.sslip.io`, `altapens-land.localhost.sslip.io` и при необходимости публичные FQDN; в nginx у блока SPA добавить `altapens-web.localhost.sslip.io` в `server_name`, иначе запрос с подменённым Host попадает в `default_server` (лендинг)
- Последствия: выпуск TLS на стороне edge (Caddy); ACME на Traefik Coolify для этих имён не обязателен; смена схемы прокси — проверять согласованность `header_up Host` и правил Traefik/nginx

## DEC-016: Напоминания о лекарствах в web — сначала браузерные (Notification API)
- Статус: Accepted
- Контекст: полноценный push (FCM/Web Push с сервером) ещё не внедрён; пользователям нужны рабочие напоминания по слотам при открытом приложении
- Решение: для роли senior — запрос разрешения и опциональное включение в «Профиль»; планировщик на `setInterval` сравнивает локальное время со слотами из `useSeniorOverviewQuery`; показ `Notification` в начале минуты слота, дедупликация через `sessionStorage` на календарный день
- Последствия: без открытой вкладки напоминания не приходят; цепочка из `docs/push-notifications.md` остаётся следующим этапом; HTTPS или localhost обязательны для `Notification`

## DEC-009: Локальный PostgreSQL для разработки через профиль `dev`
- Статус: Accepted
- Контекст: разработчику нужен предсказуемый запуск backend без ручного создания БД и без коммита тяжёлого Gradle; корневой `docker compose` уже есть, но не покрывает сценарий «только JVM + Gradle из IDE»
- Решение: зависимость `spring-boot-docker-compose` в `developmentOnly`, compose-файл `apps/backend/src/main/resources/compose-dev-postgres.yml` (classpath, чтобы IDE/`bootRun` не зависели от рабочей директории), профиль Spring `dev` задаёт `spring.docker.compose.file` и `spring.docker.compose.enabled=true`, включает `spring.profiles.include=local`; в базовом `application.yml` интеграция Docker Compose по умолчанию **выключена**, чтобы профиль `local`, прод-сборка и тесты не запускали контейнеры
- Последствия: `bootRun`/IDE с `--spring.profiles.active=dev` поднимают Postgres при наличии Docker; без Docker по-прежнему используют `local` + свой Postgres или корневой `docker compose up -d postgres`

## DEC-017: Мобильный клиент — Capacitor-оболочка и отдельный репозиторий
- Статус: Accepted
- Контекст: нужен Android-клиент с тем же UX, что и web, без второй кодовой базы UI; разработка оболочки логично вынесена из монорепозитория AltaPens
- Решение: репозиторий `Mobile_version` (Capacitor 7): `prepare:www` собирает `apps/web` через корневой скрипт `build:web:mobile` (`--base ./`) и копирует артефакт в `www/`; нативные проекты — `cap sync`. Минимальная версия Android — **API 31** (Android 12+). Документация домена — `docs/ai/domains/mobile-app.md`
- Последствия: паритет функций с web достигается обновлением веб-клиента и повторной сборкой оболочки; push и отличия WebView от браузера учитываются отдельно (`docs/push-notifications.md`)

## DEC-018: Регистрация push-токенов устройств на backend
- Статус: Accepted
- Контекст: по `docs/push-notifications.md` нужно хранить FCM/APNs/Web-токены для будущей серверной доставки; клиенты уже могут получать токен (Capacitor / позже Web Push)
- Решение: таблица `device_push_tokens` (FK на `users`, уникальный `token`, поля `platform`, `created_at`, `updated_at`); endpoint `POST /api/v1/notifications/devices` с JWT, тело `{ platform, token }` (`android` | `ios` | `web`), upsert по `token`; модуль `modules/notifications`
- Последствия: ключи Firebase остаются вне репозитория; отправка FCM с сервера — см. DEC-019

## DEC-019: Отправка FCM с backend и дедупликация
- Статус: Accepted
- Контекст: после регистрации токенов нужна серверная доставка; продуктовый сценарий — пропущенный приём при `notify_on_missed`
- Решение: Firebase Admin SDK при `app.push.fcm.enabled=true`; ключ через `app.push.fcm.service-account-json-path` или `GOOGLE_APPLICATION_CREDENTIALS`; таблица `notification_send_log` с уникальным `dedupe_key`; планировщик Spring (`@Scheduled`) с интервалом из конфига; первая реализация триггера — «просрочен слот» по той же логике, что `today-doses`, уведомления только активным опекунам подопечного, только платформы `android`/`ios`
- Последствия: без включённого FCM и ключа приложение не инициализирует Firebase; очередь сообщений не вводилась — при масштабировании возможен вынесенный worker
