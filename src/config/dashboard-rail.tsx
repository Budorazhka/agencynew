import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  UserCog,
  CreditCard,
  Landmark,
  Building2,
  Building,
  Handshake,
  GraduationCap,
  Wallet,
  MessagesSquare,
} from 'lucide-react'
import type { UserRole } from '@/types/auth'

export type DashboardRailItem = {
  id: string
  label: string
  to: string
  icon: LucideIcon
  end?: true
  match?: (p: string) => boolean
}

/**
 * Полный список пунктов левого rail (ALPHABASE).
 * Видимость по ролям — {@link getVisibleDashboardRailItems} (матрица «Разделы» Excel).
 */
export const DASHBOARD_RAIL_ITEMS: DashboardRailItem[] = [
  { id: 'desk', label: 'Рабочий стол', to: '/dashboard', icon: LayoutDashboard, end: true },
  {
    id: 'crm',
    label: 'CRM',
    to: '/dashboard/crm',
    icon: CreditCard,
    match: (p) =>
      p.startsWith('/dashboard/crm') ||
      p.startsWith('/dashboard/leads/poker') ||
      p.startsWith('/dashboard/clients') ||
      p.startsWith('/dashboard/deals') ||
      p.startsWith('/dashboard/tasks'),
  },
  {
    id: 'leads',
    label: 'Лиды',
    to: '/dashboard/leads-hub',
    icon: UserCog,
    match: (p) =>
      p.startsWith('/dashboard/leads-hub') ||
      (p.startsWith('/dashboard/leads') && !p.startsWith('/dashboard/leads/poker')),
  },
  {
    id: 'newbuild',
    label: 'Новостройки',
    to: '/dashboard/new-buildings',
    icon: Landmark,
    match: (p) => p.startsWith('/dashboard/new-buildings') || p.startsWith('/dashboard/bookings'),
  },
  {
    id: 'secondary',
    label: 'Объекты вторичного рынка',
    to: '/dashboard/objects',
    icon: Building2,
    match: (p) => p.startsWith('/dashboard/objects'),
  },
  {
    id: 'mls',
    label: 'MLS',
    to: '/dashboard/mls',
    icon: Handshake,
    /** Каталог партнёров — `/dashboard/partners/*` (кроме MLM), контур «Сообщество». */
    match: (p) => p.startsWith('/dashboard/mls'),
  },
  {
    id: 'team',
    label: 'Команда',
    to: '/dashboard/team',
    icon: Building,
    match: (p) => p.startsWith('/dashboard/team'),
  },
  {
    id: 'learning',
    label: 'Обучение и база знаний',
    to: '/dashboard/learning',
    icon: GraduationCap,
    match: (p) => p.startsWith('/dashboard/learning') || p.startsWith('/dashboard/lms'),
  },
  { id: 'finance', label: 'Финансы', to: '/dashboard/finance', icon: Wallet, match: (p) => p.startsWith('/dashboard/finance') },
  {
    id: 'community',
    label: 'Сообщество',
    to: '/dashboard/community',
    icon: MessagesSquare,
    /** Хаб и все экраны под `/dashboard/partners/*` (в т.ч. MLM и каталог). */
    match: (p) =>
      p.startsWith('/dashboard/community') || p.startsWith('/dashboard/partners'),
  },
]

/**
 * Партнёрский риелтор — матрица «Разделы» Excel (строка «Партнёрский риелтор»):
 * рабочий стол, вторичка, новостройки, MLS, сообщество (MLM — с хаба «Сообщество»), CRM (О).
 * Остальные разделы у партнёра «—».
 */
const PARTNER_RAIL_IDS = new Set(['desk', 'crm', 'secondary', 'newbuild', 'mls', 'community'])

/**
 * Скрыть пункты rail для роли (id из {@link DASHBOARD_RAIL_ITEMS}).
 * Пусто = видит весь список (кроме partner — там только allow-list).
 */
const HIDE_RAIL_IDS_FOR_ROLE: Partial<Record<UserRole, string[]>> = {
  /** Команда —, Обучение —, Финансы — */
  marketer: ['team', 'learning', 'finance'],
  /** Лиды —, Команда —, Обучение —, Финансы —, Сообщество — */
  lawyer: ['leads', 'team', 'learning', 'finance', 'community'],
  /** Операционные разделы —; Команда П; Обучение П; Сообщество О (в т.ч. MLM-аналитика с хаба). */
  hr: ['leads', 'crm', 'newbuild', 'secondary', 'mls', 'finance'],
  /** Лиды —, Команда —, Обучение —, Сообщество — */
  finance: ['leads', 'team', 'learning', 'community'],
  /** Команда —, Обучение — */
  procurement_head: ['team', 'learning'],
}

/** Доступ к разделу MLS (видимость пункта rail = тот же флаг, что и у guard по `mls`). */
export function roleHasMlsSectionAccess(role: UserRole): boolean {
  if (role === 'partner') return true
  const hide = HIDE_RAIL_IDS_FOR_ROLE[role] ?? []
  return !hide.includes('mls')
}

export function getVisibleDashboardRailItems(role: UserRole): DashboardRailItem[] {
  if (role === 'partner') {
    return DASHBOARD_RAIL_ITEMS.filter((item) => PARTNER_RAIL_IDS.has(item.id))
  }
  const hide = new Set(HIDE_RAIL_IDS_FOR_ROLE[role] ?? [])
  return DASHBOARD_RAIL_ITEMS.filter((item) => !hide.has(item.id))
}

export function isDashboardRailItemActive(pathname: string, item: DashboardRailItem): boolean {
  if (item.end) {
    return (
      pathname === '/dashboard' ||
      pathname === '/dashboard/' ||
      pathname.startsWith('/dashboard/calendar')
    )
  }
  if (item.match) {
    return item.match(pathname)
  }
  return pathname.startsWith(item.to)
}

/**
 * Какой «раздел rail» соответствует URL. `null` — путь вне карты (настройки, старые модули, дашборды) — не блокируем по rail.
 */
export function getDashboardSectionIdForPath(pathname: string): string | null {
  if (pathname === '/dashboard' || pathname === '/dashboard/') return 'desk'
  /** Личный отчёт — часть контура рабочего стола (видимость как у «Рабочий стол»). */
  if (pathname === '/dashboard/my-report' || pathname.startsWith('/dashboard/my-report/')) return 'desk'
  /** Календарь — полный экран с виджета рабочего стола; тот же контур доступа, что «Рабочий стол». */
  if (pathname.startsWith('/dashboard/calendar')) return 'desk'
  for (const item of DASHBOARD_RAIL_ITEMS) {
    if (item.id === 'desk') continue
    if (item.match?.(pathname)) return item.id
  }
  return null
}

export function isDashboardPathBlockedForRole(pathname: string, role: UserRole): boolean {
  const section = getDashboardSectionIdForPath(pathname)
  if (section === null) return false
  const allowed = new Set(getVisibleDashboardRailItems(role).map((i) => i.id))
  if (allowed.has(section)) return false
  return true
}

/**
 * Раздел «Инфо» перенесён под `/dashboard/settings/info/*` — доступен всем ролям с доступом к дашборду,
 * не путать со служебным хабом настроек (owner / director / РОП).
 */
export function isDashboardInfoCenterPath(pathname: string): boolean {
  return pathname === '/dashboard/settings/info' || pathname.startsWith('/dashboard/settings/info/')
}

/** Хаб и вложенные страницы настроек (матрица «Настройки»: доступ только owner / director / РОП). */
export function isDashboardSettingsPath(pathname: string): boolean {
  if (isDashboardInfoCenterPath(pathname)) return false
  if (pathname === '/dashboard/settings-hub' || pathname.startsWith('/dashboard/settings-hub/')) return true
  if (pathname === '/dashboard/settings' || pathname.startsWith('/dashboard/settings/')) return true
  return false
}

/** Служебный маршрут после запрета по роли — всегда разрешён авторизованным пользователям. */
export function isDashboardAccessDeniedPath(pathname: string): boolean {
  return pathname === '/dashboard/access-denied'
}

/** П / ПР / О в строке «Настройки» Excel; у остальных ролей «—». */
export function roleCanAccessSettingsHub(role: UserRole): boolean {
  return role === 'owner' || role === 'director' || role === 'rop'
}

export function isDashboardRouteForbiddenForRole(pathname: string, role: UserRole): boolean {
  if (isDashboardAccessDeniedPath(pathname)) return false
  if (isDashboardSettingsPath(pathname) && !roleCanAccessSettingsHub(role)) return true
  return isDashboardPathBlockedForRole(pathname, role)
}

/** Удобная обёртка для UI (кнопки, ссылки): тот же контракт, что у `DashboardRouteGuard`. */
export function isDashboardPathAllowedForRole(pathname: string, role: UserRole): boolean {
  return !isDashboardRouteForbiddenForRole(pathname, role)
}
