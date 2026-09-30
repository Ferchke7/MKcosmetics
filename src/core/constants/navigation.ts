export interface NavItem {
  label: string;
  href: string;
  isSpecial?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Предложения', href: '#telegram-feed', isSpecial: true },
  { label: 'Подбор ухода', href: '#skin-quiz' },
  { label: 'Как заказать', href: '#delivery' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Контакты', href: '#contacts' },
];
