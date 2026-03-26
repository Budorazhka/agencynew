import {
  Settings,
  Users,
  Handshake,
  Building2,
  BookMarked,
  Briefcase,
  CheckSquare,
  CalendarDays,
  GraduationCap,
  Bell,
  UserCog,
  LayoutDashboard,
  Store,
  Scale,
  ShoppingCart,
  FolderOpen,
} from 'lucide-react'
import type { UserRole } from '@/types/auth'

export interface NavItem {
  label: string
  icon: typeof Users
  route: string
  external?: boolean
  /** Роли, которым виден этот пункт. Если undefined — виден всем */
  roles?: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Маркетплейс',
    icon: Store,
    route: 'https://baza.sale',
    external: true,
    // Партнёр видит только маркетплейс (витрина) + дашборд
  },
  {
    label: 'CRM',
    icon: Users,
    route: '/dashboard/crm',
    roles: ['owner', 'director', 'rop', 'manager', 'lawyer', 'procurement_head'],
  },
  {
    label: 'Дашборды',
    icon: LayoutDashboard,
    route: '/dashboard/dashboards',
  },
  {
    label: 'Лиды',
    icon: UserCog,
    route: '/dashboard/leads/poker',
    roles: ['owner', 'director', 'rop', 'manager', 'marketer'],
  },
  {
    label: 'Клиенты',
    icon: Users,
    route: '/dashboard/clients',
    roles: ['owner', 'director', 'rop', 'manager', 'lawyer'],
  },
  {
    label: 'Объекты',
    icon: Building2,
    route: '/dashboard/objects',
    roles: ['owner', 'director', 'rop', 'manager', 'procurement_head'],
  },
  {
    label: 'Подборки',
    icon: FolderOpen,
    route: '/dashboard/selections',
    roles: ['owner', 'director', 'rop', 'manager'],
  },
  {
    label: 'Брони',
    icon: BookMarked,
    route: '/dashboard/bookings',
    roles: ['owner', 'director', 'rop', 'manager', 'lawyer'],
  },
  {
    label: 'Сделки',
    icon: Briefcase,
    route: '/dashboard/deals',
    roles: ['owner', 'director', 'rop', 'manager', 'lawyer'],
  },
  {
    label: 'Задачи',
    icon: CheckSquare,
    route: '/dashboard/tasks',
    roles: ['owner', 'director', 'rop', 'manager', 'lawyer', 'procurement_head'],
  },
  {
    label: 'Календарь',
    icon: CalendarDays,
    route: '/dashboard/calendar',
    roles: ['owner', 'director', 'rop', 'manager', 'lawyer'],
  },
  {
    label: 'Партнёры',
    icon: Handshake,
    route: '/dashboard/partners',
    roles: ['owner', 'director', 'rop'],
  },
  {
    label: 'Закупка',
    icon: ShoppingCart,
    route: '/dashboard/objects',
    roles: ['procurement_head'],
  },
  {
    label: 'Юр. задачи',
    icon: Scale,
    route: '/dashboard/tasks',
    roles: ['lawyer'],
  },
  {
    label: 'Команда',
    icon: Users,
    route: '/dashboard/team',
    roles: ['owner', 'director', 'rop'],
  },
  {
    label: 'Обучение',
    icon: GraduationCap,
    route: '/dashboard/learning',
  },
  {
    label: 'Инфо',
    icon: Bell,
    route: '/dashboard/info',
  },
  {
    label: 'Настройки',
    icon: Settings,
    route: '/dashboard/settings-hub',
    roles: ['owner', 'director'],
  },
]

/** Фильтр пунктов навигации по роли пользователя */
export function getNavItemsForRole(role: UserRole): NavItem[] {
  // Убираем дубли (Закупка и Юр.задачи — специфичные замены общих)
  // Для партнёра — только базовый набор
  if (role === 'partner') {
    return NAV_ITEMS.filter(item =>
      item.label === 'Маркетплейс' ||
      item.label === 'Дашборды' ||
      item.label === 'Инфо'
    )
  }

  return NAV_ITEMS.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(role)
  }).filter(item => {
    // Убираем специфичные пункты, которые дублируют общие для других ролей
    if (item.label === 'Закупка' && role !== 'procurement_head') return false
    if (item.label === 'Юр. задачи' && role !== 'lawyer') return false
    return true
  })
}
