# Локальный запуск AltaPens (Windows 11)

Монорепозиторий: **frontend** (`apps/web`) + **backend** (`apps/backend`). Лендинг в этом документе не описан.

**Что добавлено в инструкцию:** раздел **«AI Integration Service (LLM)»** — отдельный Spring-проект, своя БД PostgreSQL, переменные окружения для БД/JWT/шифрования и опционально TTS; **ключи OpenAI и других провайдеров LLM** в клиент AltaPens не кладутся: они задаются **в админке AI Integration** (хранятся в БД в зашифрованном виде). Панель помощника в веб-приложении пока может работать на локальной логике (`life-advice`); подключение фронта к AI Integration — по мере интеграции.

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

## Десктоп: IntelliJ IDEA + локальный PostgreSQL (кратко)

Ниже — один рабочий сценарий: **PostgreSQL уже установлен локально**, БД **`altacare`** создана (см. раздел **«База данных PostgreSQL»** ниже), порт **5432**.

### Backend в IDEA

1. **File → Open** → каталог **`apps/backend`** (или весь монорепозиторий `AltaPens`).
2. Дождитесь импорта Gradle.
3. Откройте класс **`ru.altacare.backend.BackendApplication`**.
4. **Run → Edit Configurations** → Spring Boot (или Application):
   - **Main class:** `ru.altacare.backend.BackendApplication`
   - **Active profiles:** `local`  
     (профиль `dev` используйте, только если поднимаете Postgres через Docker Compose из проекта — см. раздел **«Backend»** ниже).
   - **Environment variables** (через `;` в Windows или отдельные поля):

     `DB_URL=jdbc:postgresql://localhost:5432/altacare;DB_USERNAME=postgres;DB_PASSWORD=postgres;JWT_SECRET=local-dev-secret-at-least-32-chars!!`

5. **Run** / **Debug**. Проверка: <http://localhost:8080/actuator/health> → **UP**.

**Если в конфигурации Spring Boot / Application нельзя выбрать `BackendApplication`:** Gradle-проект backend не подключён или не проиндексирован. Сделайте так: **File → Open** → укажите каталог **`AltaPens/apps/backend`** (как корень Gradle) *или* в уже открытом `AltaPens` — **File → New → Module from Existing Sources** → `apps/backend/build.gradle` → импорт Gradle. Дождитесь окончания **Load Gradle Project** и индексации. В конфигурации укажите **Use classpath of module:** `backend.main` (или модуль `backend`). Поле **Main class** можно **ввести вручную**: `ru.altacare.backend.BackendApplication` — IDEA запустит, даже если список «Browse» пустой. Убедитесь, что **Project SDK** и **Gradle JVM** — JDK **17+** (**File → Project Structure → Project**, **Settings → Build, Execution, Deployment → Build Tools → Gradle**).

### Frontend (десктопный браузер)

1. В корне **`AltaPens`** выполните `npm install` (один раз).
2. Файл **`apps/web/.env.local`**:

   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

3. Терминал в корне репозитория:

   ```powershell
   npm run dev:web
   ```

4. Откройте URL из вывода Vite (часто **http://localhost:5173**). CORS настроен под `localhost` / `127.0.0.1`.

### Переменные окружения (десктоп)

| Где задаётся | Переменная | Пример | Назначение |
|--------------|------------|--------|------------|
| IDEA / система / `.env` для JVM | `DB_URL` | `jdbc:postgresql://localhost:5432/altacare` | JDBC PostgreSQL |
| IDEA / система | `DB_USERNAME` | `postgres` | пользователь БД |
| IDEA / система | `DB_PASSWORD` | `postgres` | пароль БД |
| IDEA / система | `JWT_SECRET` | строка **не короче 32 символов** | подпись JWT |
| IDEA / система | `SERVER_PORT` | `8080` | порт HTTP backend (по умолчанию 8080) |
| **`apps/web/.env.local`** (Vite) | `VITE_API_BASE_URL` | `http://localhost:8080` | базовый URL API для фронта |

**LLM / OpenAI:** в **`apps/web/.env.local` секреты провайдеров не указываются** (Vite отдаёт env в браузер). Доступ к моделям идёт через сервис **AI Integration** (см. раздел **«AI Integration Service (LLM)»** ниже): ключи задаются там, в админке, после старта.

Если переменные для БД и JWT не заданы, подставляются значения из `application.yml` (для продакшена **обязательно** задать свой `JWT_SECRET`).

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

### Профиль `dev` — PostgreSQL в Docker одной командой (рекомендуется для быстрого старта)

Если установлен **Docker Desktop** (или иной Docker с CLI `docker compose`) и **порт 5432 свободен**, можно не поднимать Postgres вручную: Spring Boot сам выполнит `docker compose up` по файлу **`compose-dev-postgres.yml`** (лежит в `apps/backend/src/main/resources`, подключается через classpath — удобно и при запуске из корня монорепозитория в IDE) и дождётся готовности БД.

Из каталога **`apps/backend`**:

```powershell
cd E:\1_MyProjects\AltaCare\AltaPens\apps\backend
.\gradlew.bat bootRun --args="--spring.profiles.active=dev"
```

- Подмешивается профиль **`local`** (в т.ч. `show-sql` в консоли), плюс автозапуск контейнера.
- Остановка приложения (Ctrl+C) по умолчанию останавливает и контейнер Postgres для этого compose-проекта.
- Данные БД сохраняются в именованном Docker volume (`altapens_backend_dev_pgdata`).

**IntelliJ IDEA:** в конфигурации Spring Boot укажите **Active profiles:** `dev` (достаточно одного значения: `local` подключается автоматически).

Если Postgres на `5432` уже занят (локальный сервис Postgres и т.п.), используйте профиль **`local`** и свой `DB_URL` / другой проброс порта в Docker, как в разделе 1.

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

1. Запустить PostgreSQL **одним из способов:**  
   **A)** профиль **`dev`** и Docker (см. раздел 2 выше), или  
   **B)** `docker compose up -d postgres` из корня репозитория, или  
   **C)** свой локальный сервис PostgreSQL с созданной БД `altacare`.
2. Запустить backend (`bootRun` или IDEA) с профилем **`dev`** (если выбрали A) или **`local`** (если B/C) и при необходимости переменными `DB_*`.
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
| Порт 5432 занят | Другой порт в URL / в Docker, обновить `DB_URL`; не смешивайте профиль `dev` с уже запущенным Postgres на том же порту |
| Ошибка при старте с профилем `dev` про Docker / compose | Убедитесь, что Docker запущен; compose-файл подключается с classpath, отдельно задавать рабочую папку под `compose.yml` не требуется |
| CORS / сеть с фронта | Фронт на `localhost` или `127.0.0.1`, backend на `8080`, `VITE_API_BASE_URL` без завершающего `/` |
| 401 после логина | В ответе login есть `accessToken`; фронт сохраняет его в store — перезагрузите страницу только после успешного логина или проверьте, что `.env.local` подхватился (перезапуск `npm run dev:web`) |

---

## 7. Структура API (кратко)

- **Auth:** `/api/v1/auth/register`, `/login`, `/logout`, `/me`
- **Care network:** `/api/v1/care/invites`, `/care/invites/{code}`, `/care/invites/{code}/accept`, `/care/seniors`, `/care/caregivers`, `/care/relationships/{id}`
- **Medications / самочувствие / лента:** `/api/v1/care/medications`, `.../today-doses`, `.../intake`, `/care/checkins`, `/care/timeline`

Подробнее — Swagger UI по адресу выше.

---

## 8. Быстрый прогон для тестирования (API + голос senior)

**Цель:** поднять backend и фронт, войти как подопечный с демо-данными, проверить care API и **голосовой режим** (микрофон + озвучка).

### Предусловия

- Установлены Node.js, JDK 17+, Docker Desktop (удобно для профиля `dev`).
- Браузер: **Chrome** или **Edge** (лучшая поддержка Web Speech API для русского). Нужен **localhost** или **HTTPS**; для `npm run dev:web` достаточно `http://localhost:…`.

### Шаг 1 — Backend

```powershell
cd E:\1_MyProjects\AltaCare\AltaPens\apps\backend
.\gradlew.bat bootRun --args="--spring.profiles.active=dev"
```

Дождитесь старта и проверьте: <http://localhost:8080/actuator/health> → `UP`.

*(Если порт 5432 занят локальным Postgres — используйте профиль `local`, свой `DB_URL` и заранее поднятую БД `altacare`, см. разделы 1–2.)*

### Шаг 2 — Frontend

В корне репозитория создайте или проверьте **`apps/web/.env.local`**:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Установка зависимостей (один раз или после обновления):

```powershell
cd E:\1_MyProjects\AltaCare\AltaPens
npm install
npm run dev:web
```

Откройте в консоли указанный URL (часто **http://localhost:5173**). **Перезапустите** dev-сервер, если только что создали `.env.local`.

### Шаг 3 — Вход подопечного

1. Пройдите **`/start` → вход**, роль **Подопечный** (senior).
2. Учётные данные демо: **`ivan@altacare.demo`** / **`demo1234`**.

### Шаг 4 — Озвучка и микрофон

1. В меню откройте **«Профиль»** и включите **«Включить озвучку»** (если выключено).
2. Внизу экрана появится панель **«Удерживайте и говорите»**.
3. При смене раздела приложение **кратко озвучивает** подсказку по экрану.
4. При первом нажатии браузер запросит доступ к **микрофону** — разрешите.
5. **Удерживайте** кнопку, произнесите фразу, **отпустите**. Примеры (с подключённым API):
   - «я принял …» / название препарата из списка на сегодня;
   - «мне хорошо» / «нужна помощь» / «плохо»;
   - «давление 120 на 80»;
   - «позвони дочери» — переход к экрану SOS.
6. Если backend не подключён (`VITE_API_BASE_URL` пуст), запись приёма лекарств и чек-инов по голосу **не сохраняются** — приложение озвучит подсказку.

### Шаг 5 — Опекун (по желанию)

Выйдите или второй вкладкой: роль **Опекун**, **`anna@altacare.demo`** / **`demo1234`**. Проверьте подопечного, лекарства, ленту событий после действий подопечного.

### Альтернатива: один origin без CORS

Из корня репозитория:

```powershell
docker compose up --build
```

Откройте **http://localhost:3080** — фронт с прокси на API; переменная **`VITE_API_SAME_ORIGIN`** в образе уже учтена. Голос по-прежнему лучше проверять в Chrome/Edge.

### Чеклист неполадок (голос)

| Симптом | Действие |
|---------|----------|
| «Голосовой ввод недоступен» | Смените браузер на Chrome или Edge; проверьте HTTPS/localhost. |
| Нет запроса микрофона | Разрешите сайту доступ к микрофону в настройках браузера. |
| Речь не распознаётся | Говорите после нажатия кнопки чётко; язык распознавания — русский (`ru-RU`). |
| Команда «не поняла» | Назовите препарат так же, как в списке на сегодня; для пропуска скажите «пропустил …», затем «да» для подтверждения. |

---

## 9. AI Integration Service (LLM) — отдельный репозиторий

Для вызовов **chat / Whisper / встроенных сетей** используется проект **`noteapp-ai-integration`** (не входит в монорепозиторий AltaPens). Его можно поднять второй конфигурацией в IntelliJ IDEA и **отдельной базой** PostgreSQL на том же установленном Postgres (другая БД и при необходимости другой пользователь).

### PostgreSQL

1. Создайте БД, например **`ai_integration_db`** (имя по умолчанию в `application.yml` сервиса).
2. Создайте пользователя и выдайте права, **или** используйте своего пользователя и передайте его в `DB_USER` / `DB_PASSWORD`.
3. По умолчанию в шаблоне сервиса: `jdbc:postgresql://localhost:5432/ai_integration_db`, пользователь **`ai_admin`** / пароль **`ai_admin`** — задайте их в SQL, если хотите совпадать с дефолтами без env.

Пример (подстройте имена и пароли):

```sql
CREATE DATABASE ai_integration_db;
CREATE USER ai_admin WITH PASSWORD 'ai_admin';
GRANT ALL PRIVILEGES ON DATABASE ai_integration_db TO ai_admin;
-- при необходимости: права на схему public после первого подключения
```

### Запуск в IntelliJ IDEA

1. **File → Open** → каталог с клоном **`noteapp-ai-integration`** (корень Gradle-проекта).
2. Дождитесь импорта Gradle, JDK **17+**.
3. Main class: **`com.example.integration.NoteappAiIntegrationApplication`**.
4. **Environment variables** (Windows, в одной строке через `;`):

```text
DB_URL=jdbc:postgresql://localhost:5432/ai_integration_db;DB_USER=ai_admin;DB_PASSWORD=ai_admin;JWT_SECRET=local-ai-integration-jwt-secret-min-32-chars!!;ENCRYPTION_SECRET_KEY=change-this-to-32-byte-secret-key-in-production!!!!!;SERVER_PORT=8091
```

- **`JWT_SECRET`** — не короче 32 символов для нормальной работы JWT.
- **`ENCRYPTION_SECRET_KEY`** — секрет для AES-шифрования API-ключей провайдеров в БД (см. `EncryptionService` в репозитории интеграции). Для локалки можно взять значение по умолчанию из `application.yml`; для продакшена задайте свой длинный секрет и **не меняйте** его после того, как в БД уже сохранены ключи, иначе расшифровка перестанет работать.

Проверка: **http://localhost:8091/actuator/health** → **UP** (порт по умолчанию **8091**, см. `SERVER_PORT`).

### Переменные окружения, связанные с AI и TTS

| Переменная | Пример | Назначение |
|------------|--------|------------|
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | см. выше | Подключение к PostgreSQL |
| `JWT_SECRET` | строка ≥ 32 символов | JWT сервиса интеграции |
| `ENCRYPTION_SECRET_KEY` | см. `application.yml` / свой секрет | Шифрование ключей провайдеров в БД (не менять после записи ключей в БД) |
| `SERVER_PORT` | `8091` | HTTP-порт сервиса |
| `AI_REQUEST_TIMEOUT` | `60` | Таймаут запросов к нейросетям (сек.) |
| `AI_MAX_RETRIES` | `3` | Повторы |
| `AI_ENABLE_FALLBACK` | `true` | Fallback при rate limit (если настроен) |
| `AI_TTS_ENABLED` | `false` | Опционально: озвучка ответа чата через отдельный HTTP TTS (например Qwen в Docker) |
| `AI_TTS_BASE_URL` | `http://127.0.0.1:8000` | Базовый URL TTS, если `AI_TTS_ENABLED=true` |
| `AI_TTS_CONNECT_TIMEOUT_MS` | `5000` | Таймаут соединения с TTS |
| `AI_TTS_READ_TIMEOUT_MS` | `180000` | Таймаут чтения ответа TTS |

### Где задаются ключи доступа к OpenAI и другим LLM

**Не через `VITE_*` и не через отдельный файл в AltaPens.** После миграций Flyway в AI Integration в базе есть записи нейросетей; **ключи API (OpenAI, Whisper и т.д.) вносятся в админ-панели** сервиса интеграции и сохраняются **зашифрованными** (задайте стабильный **`ENCRYPTION_SECRET_KEY`** до сохранения ключей; смена секрета сделает старые записи нечитаемыми).

Подробности по развёртыванию и API — в **`README.md`** и **`QUICK_START.md`** репозитория `noteapp-ai-integration`.

### Связка с AltaPens

- **AltaCare / AltaPens** по-прежнему использует свой backend на **8080** и опционально **noteapp-ai-integration** на **8091** как отдельный микросервис.
- Типичный локальный порядок: поднять Postgres → при необходимости **две** БД (`altacare`, `ai_integration_db`) → запустить backend AltaPens → при работе с LLM запустить AI Integration → фронт AltaPens (`npm run dev:web`) с `VITE_API_BASE_URL=http://localhost:8080` до появления прокси/API к интеграции со стороны вашего backend.
