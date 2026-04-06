# Frontend Web Domain

## Назначение
`apps/web` — демонстрационный и будущий production-контур web/frontend части Altacare с отдельными UX-потоками для `senior` и `caregiver`.

## Реализовано сейчас
- workspace-структура для фронтенда
- пакет `api-contracts` с zod-схемами auth/care DTO
- дизайн-токены в отдельном пакете
- shared типы доменной модели в отдельном пакете
- senior shell и caregiver shell
- mock/query data layer для проектирования UI без backend
- auth store и role guards
- typed auth client + query/mutation hooks
- HTTP adapter для auth/invite flow с fallback на local adapter через `VITE_API_BASE_URL`
- invite flow для caregiver -> senior
- senior-экраны: home, today, assistant, history, profile, SOS, anti-scam
- caregiver-экраны: dashboard, seniors, senior detail, invite create, medication form, events, AI, settings
- форма настройки лекарства на `React Hook Form + Zod`

## UX-принципы
- senior: один экран = одна задача, крупные кнопки, высокий контраст, крупный текст, при необходимости голос
- caregiver: чуть больше информации на экране, но без ощущения «надзора» и без канцелярита
- общий визуальный язык: тёплый, современный, без больничного ощущения
- пользовательские тексты и навигация — на разговорном русском, без IT-жаргона и без пугающих англицизмов (вместо «AI» — «помощник» / «умный помощник»)

## Ограничения сейчас
- основная часть UI-данных все еще идет через mock/query слой
- часть экранов все еще опирается на локальный persisted store как fallback/sync-слой
- realtime, notifications и persistence backend-уровня еще не подключены
- landing и mobile-контуры еще не начинались

## Следующие логичные шаги
- вынести больше UI-примитивов в reusable пакет
- перевести остальные caregiver/senior data flows с mock/query слоя на реальные backend API
- добавить централизованный frontend API client для care lists и detail endpoints
- подготовить landing и общую дизайн-систему для него
