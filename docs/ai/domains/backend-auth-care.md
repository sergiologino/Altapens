# Backend Auth Care Domain

## Назначение
`apps/backend` — первый production-ready backend-контур AltaPens, который закрывает базовый auth и care-linking flow для frontend web приложения.

## Реализовано сейчас
- Spring Boot backend в `apps/backend`
- модули `auth`, `users`, `profiles`, `care_network`, `common`
- PostgreSQL-oriented конфигурация через `application.yml`
- Flyway migration `V1__init_auth_care.sql`
- JWT auth flow: `register`, `login`, `logout`, `me`
- care network flow: create invite, invite lookup, accept invite, seniors list, caregivers list, relationship detail
- JPA-модели для `users`, `user_roles`, `senior_profiles`, `caregiver_profiles`, `care_invites`, `care_relationships`
- demo seed data для `Анна Смирнова` caregiver и `Иван Иванович` senior
- integration tests на критические сценарии auth/invite flow
- модуль **medications** + **wellbeing_checkins** / **medication_intakes**: курсы и фиксация приёма по слоту на календарную дату в TZ подопечного; чек-ины самочувствия; `GET /care/timeline` объединяет события
- профиль **`dev`**: `spring-boot-docker-compose` + `compose-dev-postgres.yml` (classpath) — автозапуск PostgreSQL 16 при локальном `bootRun` (см. `RUN_LOCAL.md`)

## Контракты и интеграция
- backend ориентируется на DTO-контракты из `packages/api-contracts`
- frontend может переключать auth/invite flow на HTTP adapter через `VITE_API_BASE_URL`
- текущие endpoints публикуются под `/api/v1/auth/*` и `/api/v1/care/*`

## Ограничения сейчас
- основной runtime-профиль ожидает реальную PostgreSQL базу `altacare` (профиль `dev` поднимает её в Docker автоматически; отдельного in-memory H2 для «ручного» dev без Docker нет)
- нет refresh-token/session blacklist логики
- нет SOS/notifications/AI domain endpoints; история приёмов за прошлые дни без отдельного API — только «сегодня» и лента недавних intakes

## Следующие логичные шаги
- перевести senior/caregiver data screens на реальные care endpoints вместо mock data
- реализовать следующие backend домены: medication, check-ins, SOS, notifications, anti-scam, ai_assistant
