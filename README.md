# 🌸 MK KOREA COSMETIC (`mkcosmet`)

Премиальный, высококонверсионный адаптивный лендинг для продажи корейской косметики с живым скраппингом Telegram-канала [`@mkcosmetkor`](https://t.me/mkcosmetkor), интеграцией Instagram [`@muhabbat.kim.mk`](https://www.instagram.com/muhabbat.kim.mk/), мультивалютностью и быстрым оформлением заказов в WhatsApp.

---

## 🚀 Быстрый запуск (Frontend + Backend одновременно одной командой)

### 1. Запуск в режиме разработки:
```bash
npm run dev
```
Эта команда одновременно запускает:
- **Backend API & Telegram Scraper** на `http://localhost:3001`
- **Frontend (Vite + React + Tailwind)** на `http://localhost:5173` (с настроенным проксированием `/api` к бэкенду)

### 2. Сборка и запуск в Production:
```bash
npm run build
npm start
```
Единый Node/Express сервер собирает и раздает оптимизированный фронтенд + API на одном порту.

---

## 🛠️ Архитектура проекта (Clean Architecture & Component Base)

```
c:\Users\ferda\Downloads\MK\
├── server/                      # Бэкенд на Node.js + Express
│   ├── services/
│   │   └── telegramScraper.ts   # Cheerio скраппер канала https://t.me/s/mkcosmetkor с кэшированием
│   └── index.ts                 # Express API эндпоинты (/api/telegram/feed, /api/health)
├── src/
│   ├── app/                     # Главное приложение и глобальные стили
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── core/                    # Ядро: константы, контакты, типы
│   │   ├── constants/
│   │   │   ├── brand.ts         # ⭐ Все контакты Мухаббат Ким (WhatsApp, TG, Inst, телефон)
│   │   │   ├── currencies.ts    # 🇰🇷 ₩, 🇷🇺 ₽, 🇺🇸 $, 🇪🇺 €, 🇰🇿 ₸, 🇺🇿 сум
│   │   │   └── navigation.ts    # Пункты меню
│   │   └── types/               # TypeScript интерфейсы
│   ├── services/                # Сервисы данных
│   │   ├── telegram/            # Клиентский сервис Telegram + резервный кэш
│   │   ├── product/             # Каталог корейской косметики и фильтры
│   │   └── storage/             # Хранилище корзины, избранного и валюты
│   ├── hooks/                   # Кастомные React хуки
│   │   ├── useTelegramFeed.ts   # Живая лента Telegram с поиском и тегами
│   │   ├── useProducts.ts       # Фильтрация и поиск по каталогу
│   │   ├── useCart.ts           # Корзина и генератор заказа в WhatsApp
│   │   ├── useWishlist.ts       # Избранное
│   │   ├── useCurrency.ts       # Конвертер и переключатель валют
│   │   └── useSkinQuiz.ts       # Диагностический квиз по подбору ухода
│   └── components/              # Компонентная база
│       ├── ui/                  # Атомарные элементы (Button, Badge, Card, Modal, Drawer, Input...)
│       ├── layout/              # Header, Navbar, CurrencySelector, MobileMenu, Footer, FloatingContact
│       ├── sections/            # Изолированные адаптивные секции
│       │   ├── Hero             # Главный экран с K-Beauty эстетикой
│       │   ├── Features         # Преимущества (100% оригинал из Сеула, доставка до двери)
│       │   ├── TelegramFeed     # Свежие посты и акции из @mkcosmetkor
│       │   ├── Products         # Каталог с фильтрами по типам кожи и брендам
│       │   ├── ConsultationQuiz # 3-шаговый тест «Подобрать уход»
│       │   ├── About            # О бренде и основателе Мухаббат Ким
│       │   ├── DeliveryInfo     # Международная доставка и сроки
│       │   ├── Reviews          # Отзывы постоянных покупателей
│       │   ├── FAQ              # Вопросы и ответы
│       │   └── Contact          # Контакты и форма обратной связи
│       └── modals/              # Быстрый заказ, быстрый просмотр товара, просмотр поста, корзина
```

---

## ⚙️ Как изменить контакты владельца

Все контактные данные вынесены в один файл:
👉 `src/core/constants/brand.ts`

```ts
export const BRAND_CONFIG = {
  brandName: 'MK KOREA COSMETIC',
  phone: '+821083905577', // Номер WhatsApp
  phoneDisplay: '+82 10 8390 5577',
  telegramChannel: '@mkcosmetkor',
  telegramChannelUrl: 'https://t.me/mkcosmetkor',
  instagramHandle: '@muhabbat.kim.mk',
  instagramUrl: 'https://www.instagram.com/muhabbat.kim.mk/',
  ...
};
```
Любые изменения здесь мгновенно обновляют ссылки во всех кнопках WhatsApp, Telegram, Instagram, плавающих кнопках и футере.

---

## 🚢 Деплой и Production окружение

### 🌐 Архитектура на прод-сервере
- **Прод-сервер**: `54.38.156.226` (пользователь `ferdavs`)
- **Директория**: `/home/ferdavs/mkcosmetics`
- **Docker контейнер**: `mkcosmetics` (порт `3001`, сеть `duda-shared`, `restart: unless-stopped`)
- **Реверс-прокси**: `outline-https-portal` (маршрутизирует `mkcosmetics.duda.uz` -> `http://mkcosmetics:3001`, SSL Let's Encrypt)
- **Персистентные данные**: директория `./data` монтируется в `/app/server/data` (в ней хранятся накопленные посты Telegram). **ВАЖНО**: данные никогда не затираются при деплоях.

---

## 🤖 CI/CD (GitHub Actions)

В репозитории настроен автоматический пайплайн [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Триггеры пайплайна:
1. `push` в ветку `main`
2. Ручной запуск через вкладку **Actions** (`workflow_dispatch`)
3. `concurrency` блокирует одновременные запуски для защиты от конфликтов деплоя.

### Схема работы:
1. **Job `build`**:
   - Node.js 22, `npm ci`, `npm run build`
   - Тестовый фоновый запуск сервера на порту 3101 и проверка эндпоинта `/api/health`
2. **Job `deploy`** (только при успешном `build`):
   - Авторизация по SSH с помощью `webfactory/ssh-agent`
   - Синхронизация измененных файлов через `rsync` (с обязательным исключением `data/`, `node_modules/`, `dist/`, `.git/`)
   - Пересборка и запуск контейнера: `docker compose up -d --build --remove-orphans`
   - Health-check на сервере `http://localhost:3001/api/health` (до 60 секунд) с выводом последних 100 строк логов в случае сбоя

### 🔑 Настройка секретов в GitHub:
Перейдите в **Settings -> Secrets and variables -> Actions** и добавьте следующие Repository / Environment Secrets:

| Секрет | Значение | Описание |
|---|---|---|
| `DEPLOY_HOST` | `54.38.156.226` | IP прод-сервера |
| `DEPLOY_USER` | `ferdavs` | SSH-пользователь |
| `DEPLOY_PATH` | `/home/ferdavs/mkcosmetics` | Путь к проекту на сервере |
| `DEPLOY_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Приватный SSH-ключ для деплоя |

#### Генерация отдельного SSH-ключа для GitHub Actions:
```bash
# 1. Сгенерировать ключ на локальном компьютере
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/mkcosmetics_deploy

# 2. Добавить публичный ключ на сервер
ssh-copy-id -i ~/.ssh/mkcosmetics_deploy.pub ferdavs@54.38.156.226
# Либо вручную скопировать содержимое mkcosmetics_deploy.pub в /home/ferdavs/.ssh/authorized_keys на сервере

# 3. Содержимое приватного ключа (~/.ssh/mkcosmetics_deploy) скопировать в секрет DEPLOY_SSH_KEY
```

---

## 🔧 Ручное обновление на сервере (Manual Update)

Если требуется обновить или перезапустить приложение вручную без GitHub Actions:

```bash
# 1. Подключение к серверу
ssh ferdavs@54.38.156.226

# 2. Переход в папку проекта
cd /home/ferdavs/mkcosmetics

# 3. Пересборка и перезапуск контейнера
docker compose up -d --build --remove-orphans

# 4. Проверка статуса и health-check
curl -s http://localhost:3001/api/health

# 5. Просмотр логов контейнера (в реальном времени)
docker compose logs -f --tail=100 mkcosmetics
```

