# Mobile (Capacitor) Domain

## Назначение
Нативная оболочка **Android** (и при необходимости **iOS**) для того же пользовательского приложения, что и `apps/web`: один SPA-бандл в WebView, без дублирования экранов на Flutter/React Native.

## Расположение репозитория
- Код оболочки и нативных проектов: `E:\1_MyProjects\AltaCare\Mobile_version` (рядом с монорепозиторием AltaPens или с переменной **`ALTA_PENS_ROOT`**).
- Исходники UI и бизнес-логики интерфейса — в **`AltaPens`** (`apps/web`, `packages/*`).

## Сборка и синхронизация
1. В корне **AltaPens**: `build:web:mobile` → `vite build` с `--base ./` → `apps/web/dist`.
2. В **Mobile_version**: `npm run prepare:www` вызывает сборку в AltaPens и копирует `dist` → `www/`.
3. `npx cap sync` обновляет проекты `android/` / `ios/`.

Подробности и запуск в Android Studio: `Mobile_version/README.md`, `Mobile_version/RUN_MOBILE_LOCAL.md`.

## Соответствие веб-приложению
- **Функциональность:** тот же маршрутизатор, senior/caregiver shell, auth, сеть заботы, лекарства, чек-ины, лента, голос (Web Speech API в WebView), SOS, донаты (`/donate`) и пр. — всё приходит из одной web-сборки.
- **Иконка приложения:** растровые `mipmap` в Android/iOS по-прежнему задаются в нативном проекте; графику для экспорта взять из `apps/web/public/brand-logo.svg` или `favicon.svg` (при необходимости конвертировать в PNG 192/512 и подставить через Android Studio / `@capacitor/assets`).
- **Backend:** URL API задаётся на этапе **сборки** веба (`VITE_API_BASE_URL` в `apps/web/.env.production` или CI), затем снова `prepare:www`.

## Ограничения и отличия от браузера
- Браузерные **Notification** (напоминания о лекарствах) в WebView ведут себя иначе, чем в Chrome. Для доставки вне открытого приложения используется **@capacitor/push-notifications**: после входа и выдачи разрешения токен отправляется на **`POST /api/v1/notifications/devices`**. Для реального FCM на Android нужны Firebase и `google-services.json` в проекте `android` (см. `docs/push-notifications.md`).
- **Отправка** уведомлений с backend (FCM HTTP v1, триггеры по слотам/SOS) — отдельный этап, не внедрён.
- Голос (микрофон/TTS) зависит от разрешений WebView и версии системы; при сбоях смотреть настройки приложения и документацию к эмулятору/устройству.

## Android
- **Минимальная версия:** API **31** (Android 12+) — см. `Mobile_version/android/variables.gradle` (`minSdkVersion`).
- **Целевая/compile SDK:** как в `variables.gradle` (актуальные значения синхронизированы с Capacitor).

## Что поддерживать в актуальном состоянии
- Версии Capacitor и скрипты `prepare:www` / пути к AltaPens.
- `minSdk` / `targetSdk` и заметные изменения в `AndroidManifest` или разрешениях.
- Расхождения по функциям относительно web (push, фоновые задачи) — здесь и в `CURRENT_STATE.md`.

## Следующие логичные шаги
- Настроить Firebase / **`google-services.json`** для стабильной выдачи FCM-токена на устройстве.
- Реализовать на backend **отправку** push (очередь + FCM HTTP v1) по `docs/push-notifications.md`.
- При необходимости: **Splash Screen**, **Status Bar**, **App Links** — точечно, без ломки web.
