import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Building2,
  BookMarked,
  CalendarDays,
  CheckSquare,
  Building,
  GraduationCap,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { useAgencyBranding } from '@/hooks/useAgencyBranding'
import { useAuth } from '@/context/AuthContext'
import { ROLE_LABEL } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import { useSidebarRail } from '@/context/SidebarRailContext'
import { useTheme } from '@/hooks/useTheme'

const RAIL = [
  { label: 'Рабочий стол', to: '/dashboard', icon: LayoutDashboard, end: true },
  {
    label: 'CRM (Продажи)',
    to: '/dashboard/crm',
    icon: CreditCard,
    match: (p: string) =>
      p.startsWith('/dashboard/crm') ||
      p.startsWith('/dashboard/leads') ||
      p.startsWith('/dashboard/clients') ||
      p.startsWith('/dashboard/deals'),
  },
  {
    label: 'Аналитика',
    to: '/dashboard/dashboards',
    icon: BarChart3,
    match: (p: string) =>
      p.startsWith('/dashboard/dashboards') ||
      p.startsWith('/dashboard/overview'),
  },
  {
    label: 'Брони / Регистрации',
    to: '/dashboard/bookings',
    icon: BookMarked,
    match: (p: string) => p.startsWith('/dashboard/bookings'),
  },
  {
    label: 'База объектов',
    to: '/dashboard/objects',
    icon: Building2,
    match: (p: string) =>
      p.startsWith('/dashboard/objects') ||
      p.startsWith('/dashboard/selections') ||
      p.startsWith('/dashboard/marketplace'),
  },
  {
    label: 'Задачи',
    to: '/dashboard/tasks',
    icon: CheckSquare,
    match: (p: string) => p.startsWith('/dashboard/tasks'),
  },
  {
    label: 'Планирование',
    to: '/dashboard/calendar',
    icon: CalendarDays,
    match: (p: string) => p.startsWith('/dashboard/calendar'),
  },
  {
    label: 'Обучение',
    to: '/dashboard/lms',
    icon: GraduationCap,
    match: (p: string) => p.startsWith('/dashboard/lms') || p.startsWith('/dashboard/learning'),
  },
  {
    label: 'Команда',
    to: '/dashboard/team',
    icon: Building,
    match: (p: string) =>
      p.startsWith('/dashboard/team') ||
      p.startsWith('/dashboard/partners') ||
      p.startsWith('/dashboard/partners'),
  },
] as const

function isRailItemActive(pathname: string, item: (typeof RAIL)[number]): boolean {
  if ('end' in item && item.end) {
    return pathname === '/dashboard' || pathname === '/dashboard/'
  }
  if ('match' in item && item.match) {
    return item.match(pathname)
  }
  return pathname.startsWith(item.to)
}

const RAIL_EXPANDED_W = 'w-64' // 256px
const RAIL_COLLAPSED_W = 'w-[72px]' // 60–80px по ТЗ

export function DashboardAppRail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, logout } = useAuth()
  const branding = useAgencyBranding()
  const { railCollapsed, toggleRail } = useSidebarRail()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const userName = currentUser?.name ?? 'Пользователь'
  const shortName =
    userName
      .split(' ')
      .slice(0, 2)
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'П'
  const roleLabel = currentUser ? (ROLE_LABEL[currentUser.role] ?? currentUser.role) : 'Senior Associate'
  const displayLast = userName.split(' ')[1]?.[0]
    ? `${userName.split(' ')[0]} ${userName.split(' ')[1]![0]}.`
    : userName

  const productTitle = branding.name || 'Sovereign Analyst'
  const productSub = 'Elite PropTech'

  return (
    <aside
      className={cn(
        'z-50 flex h-screen shrink-0 flex-col border-r bg-[var(--rail-bg)] py-4 transition-[width] duration-200 ease-out',
        isLight
          ? 'border-[var(--green-border)] shadow-sm'
          : 'border-emerald-900/20 shadow-[inset_-1px_0_0_rgba(201,168,76,0.1),30px_0_30px_rgba(0,17,13,0.4)]',
        railCollapsed ? RAIL_COLLAPSED_W : RAIL_EXPANDED_W,
      )}
    >
      {/* Верх: логотип / бургер */}
      <div className={cn('mb-6 shrink-0', railCollapsed ? 'px-2' : 'px-6')}>
        <div className="flex flex-col items-stretch gap-2">
          <button
            type="button"
            onClick={toggleRail}
            title={railCollapsed ? 'Развернуть меню' : 'Свернуть до иконок'}
            aria-expanded={!railCollapsed}
            className={cn(
              'flex items-center rounded-md border p-2 transition-colors',
              isLight
                ? 'border-slate-200 bg-slate-100 text-slate-600 hover:border-[var(--gold)]/50 hover:text-slate-900'
                : 'border-emerald-900/30 bg-[var(--rail-surface)] text-emerald-100/70 hover:border-[#e6c364]/30 hover:text-[#e6c364]',
              railCollapsed ? 'justify-center' : 'gap-3',
            )}
          >
            {railCollapsed ? (
              <PanelLeft className="size-[18px] shrink-0" strokeWidth={2} />
            ) : (
              <>
                <PanelLeftClose className="size-[18px] shrink-0" strokeWidth={2} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Свернуть</span>
              </>
            )}
          </button>

          {!railCollapsed ? (
            <div className="flex items-center gap-3 pt-1">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-[#e6c364]">
                <span className="text-sm font-extrabold text-[#3d2e00]">
                  {productTitle.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold tracking-tight text-[#e6c364]">{productTitle}</h1>
                <p className="font-[Inter] text-[10px] uppercase tracking-widest text-[color:var(--app-text-muted)]">
                  {productSub}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center pt-1">
              <div
                className="flex size-9 items-center justify-center rounded-sm bg-[#e6c364]"
                title={productTitle}
              >
                <span className="text-xs font-extrabold text-[#3d2e00]">
                  {productTitle.slice(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex flex-1 flex-col space-y-1 overflow-y-auto px-0">
        {RAIL.map(item => {
          const Icon = item.icon
          const active = isRailItemActive(location.pathname, item)
          return (
            <Link
              key={item.to}
              to={item.to}
              title={railCollapsed ? item.label : undefined}
              className={cn(
                'group flex items-center font-[Inter] text-sm font-bold uppercase tracking-wide transition-all duration-200',
                railCollapsed ? 'justify-center px-0 py-3' : 'px-6 py-3',
                active
                  ? cn(
                      'translate-x-0 border-l-2 border-[#e6c364] text-[#e6c364] sm:translate-x-1',
                      isLight ? 'bg-[var(--nav-item-bg-active)]' : 'bg-emerald-900/30',
                    )
                  : cn(
                      'border-l-2 border-transparent',
                      isLight
                        ? 'text-[color:var(--nav-item-text)] hover:bg-slate-100 hover:text-slate-900'
                        : 'text-emerald-100/60 hover:bg-emerald-900/20 hover:text-emerald-50',
                    ),
              )}
            >
              <Icon
                className={cn('size-[18px] shrink-0', !railCollapsed && 'mr-4')}
                strokeWidth={active ? 2.25 : 1.75}
              />
              {!railCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={cn('mt-auto shrink-0', railCollapsed ? 'px-2' : 'px-6')}>
        <button
          type="button"
          onClick={() => navigate('/dashboard/settings-hub')}
          title="Настройки"
          className={cn(
            'flex w-full items-center py-3 font-[Inter] text-sm uppercase tracking-wide transition-colors',
            isLight
              ? 'text-[color:var(--nav-item-text)] hover:bg-slate-100 hover:text-slate-900'
              : 'text-emerald-100/60 hover:text-emerald-50',
            railCollapsed ? 'justify-center' : '',
          )}
        >
          <Settings className={cn('size-[18px] shrink-0', !railCollapsed && 'mr-4')} strokeWidth={1.75} />
          {!railCollapsed && 'Настройки'}
        </button>

        {!railCollapsed ? (
          <div
            className={cn(
              'mt-4 flex items-center gap-3 border-t pt-4',
              isLight ? 'border-[var(--green-border)]' : 'border-emerald-900/20',
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#e6c364]/20 bg-[var(--rail-surface)] text-[10px] font-bold text-[#e6c364]">
              {shortName}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-xs font-bold text-[color:var(--app-text)]">{displayLast}</p>
              <p className="truncate text-[10px] text-[color:var(--app-text-muted)]">{roleLabel}</p>
            </div>
            <button
              type="button"
              title="Выйти"
              onClick={() => {
                logout()
                navigate('/')
              }}
              className={cn(
                'shrink-0 hover:text-[#e6c364]',
                isLight ? 'text-slate-400' : 'text-emerald-100/40',
              )}
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div
            className={cn(
              'mt-2 flex flex-col items-center gap-2 border-t pt-3',
              isLight ? 'border-[var(--green-border)]' : 'border-emerald-900/20',
            )}
          >
            <div
              className="flex size-8 items-center justify-center rounded-full border border-[#e6c364]/20 bg-[var(--rail-surface)] text-[10px] font-bold text-[#e6c364]"
              title={`${displayLast} · ${roleLabel}`}
            >
              {shortName}
            </div>
            <button
              type="button"
              title="Выйти"
              onClick={() => {
                logout()
                navigate('/')
              }}
              className={cn('hover:text-[#e6c364]', isLight ? 'text-slate-400' : 'text-emerald-100/40')}
            >
              <LogOut className="size-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
