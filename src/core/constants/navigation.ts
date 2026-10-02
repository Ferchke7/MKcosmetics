export interface NavItem {
  label: string;
  href: string;
  isSpecial?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Каталог товаров', href: '#catalog', isSpecial: true },
  { label: 'Бьюти-Журнал', href: '#magazine' },
  { label: 'Новинки', href: '#latest-arrivals' },
  { label: 'Подбор ухода', href: '#skin-quiz' },
  { label: 'Доставка', href: '#delivery' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Контакты', href: '#contacts' },
];
