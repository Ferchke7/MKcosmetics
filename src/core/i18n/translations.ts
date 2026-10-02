export type Language = 'ru' | 'uz';

export interface Translations {
  // Navigation
  nav_home: string;
  nav_catalog: string;
  nav_delivery: string;
  nav_faq: string;
  nav_contact: string;
  nav_cart: string;
  nav_currency: string;
  nav_language: string;

  // Hero
  hero_tag: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_subtitle: string;
  hero_btn_catalog: string;
  hero_btn_contacts: string;

  // Top 10 Showcase
  showcase_badge: string;
  showcase_title: string;
  showcase_subtitle: string;
  showcase_all_btn: string;
  showcase_banner_badge: string;
  showcase_banner_title: string;
  showcase_banner_desc: string;
  showcase_banner_btn: string;

  // Catalog Page
  catalog_badge: string;
  catalog_title: string;
  catalog_subtitle: string;
  catalog_search_placeholder: string;
  catalog_all_brands: string;
  catalog_all_prices: string;
  catalog_under_30k: string;
  catalog_30k_60k: string;
  catalog_over_60k: string;
  catalog_sale_filter: string;
  catalog_with_price: string;
  catalog_sort_label: string;
  catalog_sort_popular: string;
  catalog_sort_newest: string;
  catalog_sort_discount: string;
  catalog_sort_price_asc: string;
  catalog_sort_price_desc: string;
  catalog_sort_name_asc: string;
  catalog_sort_oldest: string;
  catalog_active_filters: string;
  catalog_reset_all: string;
  catalog_showing: string;
  catalog_of: string;
  catalog_items: string;
  catalog_show_more: string;
  catalog_not_found_title: string;
  catalog_not_found_desc: string;
  catalog_show_all_btn: string;

  // Categories
  cat_all: string;
  cat_discount: string;
  cat_sets: string;
  cat_serums: string;
  cat_antiaging: string;
  cat_cleansing: string;
  cat_sun: string;
  cat_luxury: string;

  // Product Card & Details
  product_flight_badge: string;
  product_genuine_badge: string;
  product_add_cart: string;
  product_order_btn: string;
  product_quick_buy: string;
  product_quick_view: string;
  product_price_on_request: string;
  product_volume: string;
  product_active_ingredients: string;
  product_how_to_use: string;
  product_reviews: string;

  // Cart Drawer
  cart_title: string;
  cart_empty_title: string;
  cart_empty_desc: string;
  cart_total: string;
  cart_checkout_whatsapp: string;
  cart_clear: string;

  // Quick Order Modal
  order_modal_title: string;
  order_modal_selected: string;
  order_name: string;
  order_name_placeholder: string;
  order_city: string;
  order_city_placeholder: string;
  order_contact: string;
  order_contact_placeholder: string;
  order_comment: string;
  order_comment_placeholder: string;
  order_btn_whatsapp: string;
  order_disclaimer: string;
  order_success_title: string;
  order_success_desc: string;

  // Contact & Socials
  contact_badge: string;
  contact_title: string;
  contact_subtitle: string;
  contact_quick_question: string;
  contact_quick_question_desc: string;
  contact_your_question: string;
  contact_question_placeholder: string;
  contact_btn_send: string;

  // Footer & Visitor Counter
  footer_about_title: string;
  footer_about_desc: string;
  footer_social_title: string;
  visitor_stats_title: string;
  visitor_stats_badge: string;
  visitor_your_ip: string;
  visitor_total_visits: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  ru: {
    // Navigation
    nav_home: 'Главная',
    nav_catalog: 'Каталог',
    nav_delivery: 'Доставка',
    nav_faq: 'FAQ',
    nav_contact: 'Контакты',
    nav_cart: 'Корзина',
    nav_currency: 'Валюта',
    nav_language: 'Язык',

    // Hero
    hero_tag: 'MK KOREA COSMETIC',
    hero_title_1: 'Оригинальная корейская косметика',
    hero_title_2: 'напрямую из Сеула в 1 клик',
    hero_subtitle: 'Прямые поставки премиального корейского ухода. Выбирайте из более 250+ проверенных средств и оформляйте быстрый заказ с удобной доставкой.',
    hero_btn_catalog: 'Каталог товаров',
    hero_btn_contacts: 'Контакты и соцсети',

    // Top 10 Showcase
    showcase_badge: 'РЕЙТИНГ ПОПУЛЯРНОСТИ',
    showcase_title: 'ТОП-10 БЕСТСЕЛЛЕРОВ',
    showcase_subtitle: 'Самые востребованные оригинальные средства из Южной Кореи в режиме реального времени.',
    showcase_all_btn: 'ВЕСЬ КАТАЛОГ',
    showcase_banner_badge: 'PREMIUM K-BEAUTY SELECTION',
    showcase_banner_title: 'Более 250+ оригинальных товаров из Кореи',
    showcase_banner_desc: 'Быстрый поиск по брендам, фильтры по типам кожи, объему и эксклюзивным скидкам до 70%.',
    showcase_banner_btn: 'Перейти в полный каталог',

    // Catalog Page
    catalog_badge: 'SEOUL DIRECT • 100% ORIGINAL',
    catalog_title: 'КАТАЛОГ ТОВАРОВ',
    catalog_subtitle: 'Оригинальная корейская косметика напрямую из Сеула',
    catalog_search_placeholder: 'Поиск бренда, средства, типа кожи...',
    catalog_all_brands: 'Все бренды',
    catalog_all_prices: 'Все цены',
    catalog_under_30k: 'До 30,000 ₩',
    catalog_30k_60k: '30,000 ₩ — 60,000 ₩',
    catalog_over_60k: 'От 60,000 ₩',
    catalog_sale_filter: 'Скидки',
    catalog_with_price: 'С точной ценой',
    catalog_sort_label: 'Сортировка',
    catalog_sort_popular: 'По популярности',
    catalog_sort_newest: 'Сначала новые',
    catalog_sort_discount: 'По скидке %',
    catalog_sort_price_asc: 'Сначала недорогие',
    catalog_sort_price_desc: 'Сначала премиум',
    catalog_sort_name_asc: 'По алфавиту (А-Я)',
    catalog_sort_oldest: 'Сначала ранние',
    catalog_active_filters: 'Активные фильтры:',
    catalog_reset_all: 'Сбросить всё',
    catalog_showing: 'Показано',
    catalog_of: 'из',
    catalog_items: 'товаров',
    catalog_show_more: 'Показать еще',
    catalog_not_found_title: 'Товары не найдены',
    catalog_not_found_desc: 'Попробуйте изменить поисковый запрос, выбрать другой бренд или сбросить фильтры.',
    catalog_show_all_btn: 'Показать все товары',

    // Categories
    cat_all: 'Все товары',
    cat_discount: '🔥 Спецскидки',
    cat_sets: 'Наборы & Боксы',
    cat_serums: 'Сыворотки и эссенции',
    cat_antiaging: 'Лифтинг и упругость',
    cat_cleansing: 'Очищение и маски',
    cat_sun: 'SPF Защита',
    cat_luxury: 'Люкс бренды',

    // Product Card & Details
    product_flight_badge: 'Сеул • Прямой рейс',
    product_genuine_badge: '100% Оригинал',
    product_add_cart: 'В корзину',
    product_order_btn: 'Заказать',
    product_quick_buy: 'Купить в 1 клик',
    product_quick_view: 'Быстрый просмотр',
    product_price_on_request: 'Цена по запросу',
    product_volume: 'Объем:',
    product_active_ingredients: 'Активные компоненты:',
    product_how_to_use: 'Способ применения:',
    product_reviews: 'отзывов',

    // Cart Drawer
    cart_title: 'Ваша корзина',
    cart_empty_title: 'Корзина пока пуста',
    cart_empty_desc: 'Выберите понравившиеся товары из каталога для быстрого оформления',
    cart_total: 'Итого:',
    cart_checkout_whatsapp: 'Оформить через WhatsApp',
    cart_clear: 'Очистить корзину',

    // Quick Order Modal
    order_modal_title: 'Быстрый заказ косметики',
    order_modal_selected: 'Выбранный товар',
    order_name: 'Ваше имя',
    order_name_placeholder: 'Например, Анна',
    order_city: 'Город и страна доставки',
    order_city_placeholder: 'Например, Москва / Ташкент / Алматы',
    order_contact: 'Телефон / Telegram для связи',
    order_contact_placeholder: '+7 / +998 / @username',
    order_comment: 'Комментарий или вопрос (необязательно)',
    order_comment_placeholder: 'Укажите тип кожи или пожелание...',
    order_btn_whatsapp: 'Заказать через WhatsApp',
    order_disclaimer: 'WhatsApp откроется с подготовленным сообщением. Его нужно отправить в приложении.',
    order_success_title: 'Черновик сообщения готов',
    order_success_desc: 'Проверьте данные и нажмите «Отправить» в WhatsApp.',

    // Contact & Socials
    contact_badge: 'Контакты и Соцсети',
    contact_title: 'Мы всегда на связи',
    contact_subtitle: 'Свяжитесь с нами удобным способом для консультации, подбора ухода или оформления индивидуального заказа из Кореи.',
    contact_quick_question: 'Быстрый вопрос консультанту',
    contact_quick_question_desc: 'Напишите ваш вопрос, и мы ответим в WhatsApp',
    contact_your_question: 'Ваш вопрос',
    contact_question_placeholder: 'Напишите, какой товар вас интересует или задайте вопрос…',
    contact_btn_send: 'Отправить в WhatsApp',

    // Footer & Visitor Counter
    footer_about_title: 'О магазине',
    footer_about_desc: 'Прямые поставки 100% оригинальной сертифицированной корейской косметики напрямую из Сеула.',
    footer_social_title: 'Мы в соцсетях',
    visitor_stats_title: 'География покупателей',
    visitor_stats_badge: 'LIVE СТАТИСТИКА',
    visitor_your_ip: 'Ваш IP:',
    visitor_total_visits: 'Всего просмотров:',
  },

  uz: {
    // Navigation
    nav_home: 'Bosh sahifa',
    nav_catalog: 'Katalog',
    nav_delivery: 'Yetkazib berish',
    nav_faq: 'FAQ',
    nav_contact: 'Aloqa',
    nav_cart: 'Savatcha',
    nav_currency: 'Valyuta',
    nav_language: 'Til',

    // Hero
    hero_tag: 'MK KOREA COSMETIC',
    hero_title_1: 'Original Koreya kosmetikasi',
    hero_title_2: "to'g'ridan-to'g'ri Seuldan 1 bosishda",
    hero_subtitle: "Seuldan to'g'ridan-to'g'ri premium Koreya parvarish vositalari. 250+ dan ortiq original mahsulotlar va qulay yetkazib berish.",
    hero_btn_catalog: 'Mahsulotlar katalogi',
    hero_btn_contacts: 'Aloqa va ijtimoiy tarmoqlar',

    // Top 10 Showcase
    showcase_badge: 'OMMABOPLIK REYTINGI',
    showcase_title: 'TOP-10 ENG SOTILGANLAR',
    showcase_subtitle: 'Janubiy Koreyadan eng talabgir original mahsulotlar real vaqt rejimida.',
    showcase_all_btn: 'BARCHA MAHSULOTLAR',
    showcase_banner_badge: 'PREMIUM K-BEAUTY SELECTION',
    showcase_banner_title: "250+ dan ortiq original Koreya mahsulotlari",
    showcase_banner_desc: "Brendlar bo'yicha tezkor qidiruv, teri turlari, hajm va 70% gacha bo'lgan chegirmalar bo'yicha filtrlar.",
    showcase_banner_btn: "To'liq katalogga o'tish",

    // Catalog Page
    catalog_badge: 'SEOUL DIRECT • 100% ORIGINAL',
    catalog_title: 'MAHSULOTLAR KATALOGI',
    catalog_subtitle: "Original Koreya kosmetikasi to'g'ridan-to'g'ri Seuldan",
    catalog_search_placeholder: "Brend, mahsulot, teri turi bo'yicha qidiruv...",
    catalog_all_brands: 'Barcha brendlar',
    catalog_all_prices: 'Barcha narxlar',
    catalog_under_30k: '30,000 ₩ gacha',
    catalog_30k_60k: '30,000 ₩ — 60,000 ₩',
    catalog_over_60k: '60,000 ₩ dan yuqori',
    catalog_sale_filter: 'Chegirmalar',
    catalog_with_price: 'Aniq narx bilan',
    catalog_sort_label: 'Saralash',
    catalog_sort_popular: "Mashhurlik bo'yicha",
    catalog_sort_newest: 'Avval yangilari',
    catalog_sort_discount: "Chegirma % bo'yicha",
    catalog_sort_price_asc: 'Avval arzonlari',
    catalog_sort_price_desc: 'Avval qimmatlari',
    catalog_sort_name_asc: "Alifbo bo'yicha (A-Z)",
    catalog_sort_oldest: 'Avval dastlabkilari',
    catalog_active_filters: 'Faol filtrlar:',
    catalog_reset_all: 'Hammasini tozalash',
    catalog_showing: "Ko'rsatildi:",
    catalog_of: 'ta mahsulotdan',
    catalog_items: 'tasi',
    catalog_show_more: "Yana ko'rsatish",
    catalog_not_found_title: 'Mahsulotlar topilmadi',
    catalog_not_found_desc: "Qidiruv so'zini o'zgartirib ko'ring, boshqa brendni tanlang yoki filtrlarni tozalang.",
    catalog_show_all_btn: 'Barcha mahsulotlarni ko\'rsatish',

    // Categories
    cat_all: 'Barcha mahsulotlar',
    cat_discount: '🔥 Maxsus chegirmalar',
    cat_sets: 'To\'plamlar & Boxlar',
    cat_serums: 'Zardoblar va essensiyalar',
    cat_antiaging: 'Lifting va elastiklik',
    cat_cleansing: 'Tozalash va niqoblar',
    cat_sun: 'SPF Quyoshdan himoya',
    cat_luxury: 'Lyuks brendlar',

    // Product Card & Details
    product_flight_badge: "Seul • To'g'ridan-to'g'ri reys",
    product_genuine_badge: '100% Original',
    product_add_cart: 'Savatchaga',
    product_order_btn: 'Buyurtma berish',
    product_quick_buy: '1 bosishda xarid',
    product_quick_view: "Tez ko'rish",
    product_price_on_request: "Narx so'rov bo'yicha",
    product_volume: 'Hajmi:',
    product_active_ingredients: 'Faol moddalar:',
    product_how_to_use: "Qo'llash usuli:",
    product_reviews: 'ta sharh',

    // Cart Drawer
    cart_title: 'Sizning savatchangiz',
    cart_empty_title: "Savatcha hozircha bo'sh",
    cart_empty_desc: "Katalogdan o'zingizga yoqqan mahsulotlarni tanlang",
    cart_total: 'Jami:',
    cart_checkout_whatsapp: 'WhatsApp orqali rasmiylashtirish',
    cart_clear: 'Savatchani tozalash',

    // Quick Order Modal
    order_modal_title: 'Tezkor buyurtma berish',
    order_modal_selected: 'Tanlangan mahsulot',
    order_name: 'Ismingiz',
    order_name_placeholder: 'Masalan, Dilnoza',
    order_city: 'Yetkazib berish shahri va mamlakati',
    order_city_placeholder: 'Masalan, Toshkent / Samarqand / Moskva',
    order_contact: 'Telefon / Telegram aloqa uchun',
    order_contact_placeholder: '+998 90 ... / @username',
    order_comment: 'Izoh yoki savol (ixtiyoriy)',
    order_comment_placeholder: 'Teri turi yoki istaklaringizni yozing...',
    order_btn_whatsapp: 'WhatsApp orqali buyurtma berish',
    order_disclaimer: "WhatsApp tayyorlangan xabar bilan ochiladi. Uni ilova orqali yuborishingiz kerak.",
    order_success_title: 'Xabar qoralamasi tayyor',
    order_success_desc: "Ma'lumotlarni tekshiring va WhatsApp-da «Yuborish» tugmasini bosing.",

    // Contact & Socials
    contact_badge: 'Aloqa va Ijtimoiy tarmoqlar',
    contact_title: 'Biz doimo aloqadamiz',
    contact_subtitle: "Maslahat olish, parvarish vositalarini tanlash yoki Koreyadan buyurtma berish uchun biz bilan bog'laning.",
    contact_quick_question: 'Maslahatchiga tezkor savol',
    contact_quick_question_desc: "Savolingizni yozing, WhatsApp orqali tezda javob beramiz",
    contact_your_question: 'Savolingiz',
    contact_question_placeholder: 'Sizni qaysi mahsulot qiziqtirayotganini yozing yoki savol bering…',
    contact_btn_send: 'WhatsApp-ga yuborish',

    // Footer & Visitor Counter
    footer_about_title: "Do'kon haqida",
    footer_about_desc: "100% original sertifikatlangan Koreya kosmetikasini to'g'ridan-to'g'ri Seuldan yetkazib berish.",
    footer_social_title: 'Ijtimoiy tarmoqlarimiz',
    visitor_stats_title: 'Xaridorlar geografiyasi',
    visitor_stats_badge: 'LIVE STATISTIKA',
    visitor_your_ip: 'Sizning IP manzilingiz:',
    visitor_total_visits: "Jami ko'rishlar:",
  },
};
