# Локальный запуск AltaPens (Windows 11)

Монорепозиторий: **frontend** (`apps/web`) + **backend** (`apps/backend`). Лендинг в этом документе не описан.

---

## Что должно быть установлено

| Компонент | Назначение |
|-----------|------------|
| **Node.js** (LTS) + **npm** | сборка и dev-сервер фронта |
| **JDK 17 или 21** | backend Spring Boot 3.4 |
| **Gradle** или **Gradle Wrapper** в `apps/backend` | сборка backend |
| **PostgreSQL** | база `altacare` (свой сервер или Docker из репозитория) |
| **IntelliJ IDEA** (опционально) | запуск/отладка backend |
| **Docker Desktop** (опционально) | один раз поднять **БД + backend + фронт** для проверки сценариев |

---

## 0. Весь стек в Docker (UI + API + PostgreSQL)

Одна команда — без отдельных виртуалок для каждого сервиса. Фронт отдаёт **nginx**, запросы к **`/api/*`** проксируются в Spring Boot; в браузере один origin (удобно для cookies/сессий в будущем и без возни с CORS).

Из **корня репозитория**:

```powershell
cd E:\1_MyProjects\AltaCare\AltaPens
docker compose up --build
```

| URL | Назначение |
|-----|------------|
| **http://localhost:3080** | Веб-приложение (сборка с `VITE_API_SAME_ORIGIN=true`, API через прокси) |
| **http://localhost:8090/swagger-ui/index.html** | Swagger UI (прямой порт backend) |
| **localhost:5432** | PostgreSQL (как и при `docker compose up -d postgres` только) |

Переменная **`JWT_SECRET`** (не короче 32 символов для реального JWT) можно задать при запуске:

```powershell
$env:JWT_SECRET="ваш-секрет-не-короче-32-символов-для-прода"
docker compose up --build
```

Файлы: **`docker-compose.yml`**, **`apps/backend/Dockerfile`**, **`docker/web.Dockerfile`**, **`docker/nginx.conf`**, **`/.dockerignore`**. Для продакшена позже разнесите сервисы и домены так же, как сейчас разнесены порты.

---

## 1. База данных PostgreSQL

### Вариант A — ваш установленный PostgreSQL

1. Создайте БД (имя по умолчанию в проекте — **`altacare`**). В **pgAdmin** или `psql`:

   ```sql
   CREATE DATABASE altacare;
   ```

   На Windows чаще всего достаточно этой команды; при необходимости задайте владельца:  
   `CREATE DATABASE altacare OWNER ваш_пользователь;`

2. Убедитесь, что пользователь и пароль совпадают с тем, что передадите в `DB_USERNAME` / `DB_PASSWORD` (см. ниже). По умолчанию в конфиге: `postgres` / `postgres`.

3. URL по умолчанию: `jdbc:postgresql://localhost:5432/altacare`. Если порт другой — укажите его в `DB_URL`.

### Вариант B — PostgreSQL в Docker (из корня репозитория)

```powershell
cd E:\1_MyProjects\AltaCare\AltaPens
docker compose up -d postgres
```

- БД **`altacare`**, пользователь **`postgres`**, пароль **`postgres`**, порт **`5432`**.
- Если у вас уже запущен Postgres на `5432`, либо остановите его, либо в `docker-compose.yml` замените проброс, например `"5433:5432"`, и задайте `DB_URL=jdbc:postgresql://localhost:5433/altacare`.

Схему создаёт **Flyway** при первом старте backend (миграции в `apps/backend/src/main/resources/db/migration`).

---

## 2. Backend (`apps/backend`)

### Переменные окружения (рекомендуется)

| Переменная | Пример | Описание |
|------------|--------|----------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/altacare` | JDBC URL |
| `DB_USERNAME` | `postgres` | пользователь БД |
| `DB_PASSWORD` | `ваш_пароль` | пароль БД |
| `JWT_SECRET` | строка ≥ 32 символов | секрет для JWT (в проде обязательно свой) |
| `SERVER_PORT` | `8080` | порт HTTP (по умолчанию 8080) |

Если переменные не заданы, используются значения из `application.yml` (URL и `postgres`/`postgres`).

### Запуск из PowerShell (Gradle)

Из каталога backend:

```powershell
cd E:\1_MyProjects\AltaCare\AltaPens\apps\backend

# если есть gradlew в проекте:
.\gradlew.bat bootRun --args="--spring.profiles.active=local"

# иначе — ваш установленный Gradle:
gradle bootRun --args="--spring.profiles.active=local"
```

Профиль **`local`** подключает `application-local.yml` (удобные настройки для разработки, например `show-sql`).

Проверка:

- Health: <http://localhost:8080/actuator/health>
- Swagger UI: <http://localhost:8080/swagger-ui/index.html>
- OpenAPI JSON: <http://localhost:8080/api-docs>

### Запуск из IntelliJ IDEA

1. **File → Open** → выберите папку `apps/backend` (или весь монорепозиторий).
2. Дождитесь импорта Gradle-проекта.
3. Найдите класс `ru.altacare.backend.BackendApplication`.
4. **Run → Edit Configurations →** добавьте **Spring Boot** (или **Application**):
   - **Main class:** `ru.altacare.backend.BackendApplication`
   - **Active profiles:** `local`
   - **Environment variables:** например  
     `DB_URL=jdbc:postgresql://localhost:5432/altacare;DB_USERNAME=postgres;DB_PASSWORD=postgres;JWT_SECRET=local-dev-secret-at-least-32-chars!!`
5. Запуск **Run** / **Debug**.

### Демо-пользователи (после успешного старта и миграций)

Создаются **CommandLineRunner**-ом при первом запуске (если пользователя ещё нет):

| Роль | Email | Пароль |
|------|-------|--------|
| caregiver | `anna@altacare.demo` | `demo1234` |
| senior | `ivan@altacare.demo` | `demo1234` |

Активный invite-код для сценариев: **`ALTA-CARE-2026`** (см. seed в backend).

---

## 3. Frontend (`apps/web`)

### Установка зависимостей (из корня монорепозитория)

```powershell
cd E:\1_MyProjects\AltaCare\AltaPens
npm install
```

### Подключение к реальному backend

Создайте файл **`apps/web/.env.local`** (не коммитьте секреты; `.env.local` обычно в `.gitignore`):

```env
VITE_API_BASE_URL=http://localhost:8080
```

Без этой переменной auth/invite остаются на **локальном in-memory adapter** (демо без backend).

### Запуск dev-сервера

```powershell
cd E:\1_MyProjects\AltaCare\AltaPens
npm run dev:web
```

По умолчанию Vite слушает порт из скрипта (часто **5173** или **4173** — смотрите вывод в консоли). Откройте указанный URL в браузере.

**CORS:** backend разрешает origin вида `http://localhost:*` и `http://127.0.0.1:*`. Запускайте фронт на `localhost` или `127.0.0.1`, чтобы запросы к API проходили.

### Маршруты, онбординг и подсказки

| Путь | Назначение |
|------|------------|
| **`/`** | Если есть сессия — редирект в кабинет роли (`/caregiver` или `/senior`). Если нет сессии и онбординг ещё не просмотрен по версии — **`/welcome`**, иначе **`/start`**. |
| **`/welcome`** | Полноэкранное знакомство (слайды): выгода приложения, безопасность, простота. После «Далее» / пропуска сохраняется отметка в браузере. |
| **`/welcome?replay=1`** | Тот же онбординг **без** сохранения «уже видел» (удобно для демо и ссылки «показать снова»). |
| **`/start`** | Портал: войти, регистрация, принять приглашение; ссылка на повтор онбординга. |
| **`/caregiver`**, **`/senior`** | После входа в соответствующей роли сверху контента может показываться блок **«Первые шаги»** (один раз на роль, пока не нажали «Понятно, скрыть»). |

**Где хранится состояние (локально в браузере):**

- Онбординг: ключ **`altapens-onboarding`** (zustand persist). Чтобы всем снова показать слайды после обновления продукта, в коде увеличивают **`APP_ONBOARDING_VERSION`** в `apps/web/src/app/store/onboarding-store.ts`.
- Подсказки после входа: **`altapens-in-app-tips`**. Повторный показ — увеличить **`APP_IN_APP_TIPS_VERSION`** в `apps/web/src/app/store/in-app-tips-store.ts`.
- Для ручного сброса при отладке можно очистить эти ключи в DevTools → Application → Local Storage.

Сценарии «кто кого приглашает» (опекун → подопечные → второй опекун) описаны в **`docs/ai/flows/registration-care-network.md`**.

---

## 4. Типичный порядок действий на один сеанс

1. Запустить PostgreSQL (сервис Windows или `docker compose up -d postgres`).
2. Запустить backend (`bootRun` или IDEA) с профилем **`local`** и верными `DB_*`.
3. Убедиться, что <http://localhost:8080/actuator/health> отвечает **UP**.
4. Создать `apps/web/.env.local` с `VITE_API_BASE_URL=http://localhost:8080`.
5. `npm run dev:web` и открыть URL фронта в браузере.

---

## 5. Сборка без запуска

```powershell
# Frontend
cd E:\1_MyProjects\AltaCare\AltaPens
npm run build:web

# Backend
cd E:\1_MyProjects\AltaCare\AltaPens\apps\backend
.\gradlew.bat build
# или: gradle build
```

Тесты backend (в т.ч. интеграционные на H2):

```powershell
cd E:\1_MyProjects\AltaCare\AltaPens\apps\backend
.\gradlew.bat test
```

---

## 6. Частые проблемы

| Симптом | Что проверить |
|---------|----------------|
| `database "altacare" does not exist` | Создать БД `CREATE DATABASE altacare;` |
| Порт 5432 занят | Другой порт в URL / в Docker, обновить `DB_URL` |
| CORS / сеть с фронта | Фронт на `localhost` или `127.0.0.1`, backend на `8080`, `VITE_API_BASE_URL` без завершающего `/` |
| 401 после логина | В ответе login есть `accessToken`; фронт сохраняет его в store — перезагрузите страницу только после успешного логина или проверьте, что `.env.local` подхватился (перезапуск `npm run dev:web`) |

---

## 7. Структура API (кратко)

- **Auth:** `/api/v1/auth/register`, `/login`, `/logout`, `/me`
- **Care network:** `/api/v1/care/invites`, `/care/invites/{code}`, `/care/invites/{code}/accept`, `/care/seniors`, `/care/caregivers`, `/care/relationships/{id}`

Подробнее — Swagger UI по адресу выше.
