# AI Changelog

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
