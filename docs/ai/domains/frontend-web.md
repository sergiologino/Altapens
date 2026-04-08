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
- `care-client` + маппинг в `care-dashboard.ts`: при backend списки подопечных/опекунов и сводка senior home из care API; `api-base.ts` — общий базовый URL
- Vitest: `npm run test:web`, тесты маппера care-dashboard
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
- курсы, слоты, фиксация приёма, чек-ины и лента (частично) — с API при подключённом backend; лента «События» у опекуна использует первого подопечного из списка; история приёмов на экране «История» пока совпадает со слотами на сегодня
- без backend URL экраны используют полностью локальный mock; persisted store остаётся для offline-демо auth/invite
- realtime, notifications и persistence backend-уровня еще не подключены
- landing и mobile-контуры еще не начинались

## Следующие логичные шаги
- вынести больше UI-примитивов в reusable пакет
- подключить к backend лекарства, чек-ины, события по мере готовности API
- расширить `care-client` и контракты под новые домены
- подготовить landing и общую дизайн-систему для него
