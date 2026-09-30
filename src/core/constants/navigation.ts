export interface NavItem {
  label: string;
  href: string;
  isSpecial?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Новинки в Telegram', href: '#telegram-feed', isSpecial: true },
  { label: 'Преимущества', href: '#features' },
  { label: 'Подбор ухода', href: '#skin-quiz' },
  { label: 'О бренде', href: '#about' },
  { label: 'Доставка', href: '#delivery' },
  { label: 'Отзывы', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Контакты', href: '#contacts' },
];
