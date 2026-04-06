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

## Контракты и интеграция
- backend ориентируется на DTO-контракты из `packages/api-contracts`
- frontend может переключать auth/invite flow на HTTP adapter через `VITE_API_BASE_URL`
- текущие endpoints публикуются под `/api/v1/auth/*` и `/api/v1/care/*`

## Ограничения сейчас
- основной runtime-профиль ожидает реальную PostgreSQL базу `altacare`
- отдельный in-memory dev-profile для ручного локального запуска еще не добавлен
- нет refresh-token/session blacklist логики
- нет medication/check-in/SOS/notifications/AI domain endpoints

## Следующие логичные шаги
- добавить dev-profile или docker-compose для локального PostgreSQL старта в один шаг
- перевести senior/caregiver data screens на реальные care endpoints вместо mock data
- реализовать следующие backend домены: medication, check-ins, SOS, notifications, anti-scam, ai_assistant
