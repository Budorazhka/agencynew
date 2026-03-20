import type { AccountType } from '@/types/auth'

/** Идентификатор блока для сопоставления с pathname */
export type DashboardBlockId =
  | 'product'   // Продукт / Обзор (для internal)
  | 'leads'
  | 'personnel'
  | 'training'
  | 'settings'

/** Цвет «драгоценного камня» на фишке карточки (CSS-значение или класс) */
export type GemColor = 'ruby' | 'sapphire' | 'emerald' | 'topaz' | 'opal' | 'amethyst'

export interface DashboardBlockConfig {
  id: DashboardBlockId
  label: string
  description?: string
  /** Подзаголовок в стиле «люкс» на главном экране (например «Элитная Недвижимость») */
  luxurySubtitle?: string
  route: string
  /** Иконка: имя из lucide-react (LayoutDashboard, Package, Users, GraduationCap, Settings) */
  icon: 'LayoutDashboard' | 'Package' | 'Users' | 'GraduationCap' | 'Settings'
  /** Цвет камня на фишке карточки */
  gemColor?: GemColor
  visible: boolean
}

/** Порядок один для всех. Для internal первый блок — Обзор, для остальных — Продукт. */
export const DASHBOARD_BLOCKS: Record<AccountType, DashboardBlockConfig[]> = {
  agency: [
    { id: 'product', label: 'Продукт', luxurySubtitle: 'Элитная Недвижимость', description: 'Квартиры и объекты', route: '/dashboard/product', icon: 'Package', gemColor: 'ruby', visible: true },
    { id: 'leads', label: 'Лиды', luxurySubtitle: 'Заявки VIP', description: 'Работа с заявками', route: '/dashboard/leads', icon: 'Users', gemColor: 'sapphire', visible: true },
    { id: 'personnel', label: 'Персонал', luxurySubtitle: 'Команда Мастеров', description: 'Команда и роли', route: '/dashboard/personnel', icon: 'Users', gemColor: 'emerald', visible: true },
    { id: 'training', label: 'Обучение', luxurySubtitle: 'Академия Дилеров', description: 'Курсы и материалы', route: '/dashboard/lms', icon: 'GraduationCap', gemColor: 'topaz', visible: true },
    { id: 'settings', label: 'Настройки', luxurySubtitle: 'Панель Управления', description: 'Профиль и кастомизация', route: '/dashboard/settings', icon: 'Settings', gemColor: 'amethyst', visible: true },
  ],
  developer: [
    { id: 'product', label: 'Продукт', luxurySubtitle: 'ЖК и новостройки', description: 'ЖК и новостройки', route: '/dashboard/product', icon: 'Package', gemColor: 'ruby', visible: true },
    { id: 'leads', label: 'Лиды', luxurySubtitle: 'Заявки VIP', description: 'Работа с заявками', route: '/dashboard/leads', icon: 'Users', gemColor: 'sapphire', visible: true },
    { id: 'personnel', label: 'Персонал', luxurySubtitle: 'Команда Мастеров', description: 'Команда и роли', route: '/dashboard/personnel', icon: 'Users', gemColor: 'emerald', visible: true },
    { id: 'training', label: 'Обучение', luxurySubtitle: 'Академия Дилеров', description: 'Курсы и материалы', route: '/dashboard/lms', icon: 'GraduationCap', gemColor: 'topaz', visible: true },
    { id: 'settings', label: 'Настройки', luxurySubtitle: 'Панель Управления', description: 'Профиль и кастомизация', route: '/dashboard/settings', icon: 'Settings', gemColor: 'amethyst', visible: true },
  ],
  realtor: [
    { id: 'product', label: 'Продукт', luxurySubtitle: 'Квартиры', description: 'Квартиры', route: '/dashboard/product', icon: 'Package', gemColor: 'ruby', visible: true },
    { id: 'leads', label: 'Лиды', luxurySubtitle: 'Заявки и клиенты', description: 'Заявки и клиенты', route: '/dashboard/leads', icon: 'Users', gemColor: 'sapphire', visible: true },
    { id: 'personnel', label: 'Персонал', luxurySubtitle: 'Профиль и команда', description: 'Профиль и команда', route: '/dashboard/personnel', icon: 'Users', gemColor: 'emerald', visible: true },
    { id: 'training', label: 'Обучение', luxurySubtitle: 'Обучение', description: 'Обучение', route: '/dashboard/lms', icon: 'GraduationCap', gemColor: 'topaz', visible: true },
    { id: 'settings', label: 'Настройки', luxurySubtitle: 'Настройки', description: 'Настройки', route: '/dashboard/settings', icon: 'Settings', gemColor: 'amethyst', visible: true },
  ],
  internal: [
    { id: 'product', label: 'Обзор', luxurySubtitle: 'Карта и МЛМ-аналитика', description: 'Карта и МЛМ-аналитика по сети', route: '/dashboard/overview', icon: 'LayoutDashboard', gemColor: 'ruby', visible: true },
    { id: 'leads', label: 'Лиды', luxurySubtitle: 'Заявки VIP', description: 'Контроль лидов', route: '/dashboard/leads', icon: 'Users', gemColor: 'sapphire', visible: true },
    { id: 'personnel', label: 'Персонал', luxurySubtitle: 'Команда Мастеров', description: 'Команда и доступы', route: '/dashboard/personnel', icon: 'Users', gemColor: 'emerald', visible: true },
    { id: 'training', label: 'Обучение', luxurySubtitle: 'Академия Дилеров', description: 'LMS', route: '/dashboard/lms', icon: 'GraduationCap', gemColor: 'topaz', visible: true },
    { id: 'settings', label: 'Настройки', luxurySubtitle: 'Панель Управления', description: 'Профиль и система', route: '/dashboard/settings', icon: 'Settings', gemColor: 'amethyst', visible: true },
  ],
}

export function getDashboardBlocks(accountType: AccountType): DashboardBlockConfig[] {
  return DASHBOARD_BLOCKS[accountType].filter((b) => b.visible)
}

/** По pathname определить id активного блока (для сайдбара) */
export function getActiveBlockId(pathname: string, accountType: AccountType): DashboardBlockId | null {
  const blocks = DASHBOARD_BLOCKS[accountType]
  if (pathname === '/dashboard' || pathname === '/dashboard/') return null
  for (const block of blocks) {
    if (pathname === block.route || pathname.startsWith(block.route + '/')) return block.id
  }
  if (pathname.startsWith('/dashboard/leads')) return 'leads'
  if (pathname.startsWith('/dashboard/lms')) return 'training'
  if (pathname.startsWith('/dashboard/overview')) return 'product'
  return null
}
