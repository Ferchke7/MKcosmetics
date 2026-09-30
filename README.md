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
