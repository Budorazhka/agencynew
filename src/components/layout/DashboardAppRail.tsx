import { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Settings, LogOut, PanelLeftClose, PanelLeft } from 'lucide-react'
import { useAgencyBranding } from '@/hooks/useAgencyBranding'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { useSidebarRail } from '@/context/SidebarRailContext'
import { useTheme } from '@/hooks/useTheme'
import {
  getVisibleDashboardRailItems,
  isDashboardRailItemActive,
  roleCanAccessSettingsHub,
} from '@/config/dashboard-rail'

const RAIL_EXPANDED_W = 'w-[260px]'
const RAIL_COLLAPSED_W = 'w-[72px]'
const RAIL_ICON = 'size-[22px] shrink-0'

export function DashboardAppRail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, logout } = useAuth()
  const branding = useAgencyBranding()
  const { railCollapsed, toggleRail } = useSidebarRail()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const railItems = useMemo(
    () => getVisibleDashboardRailItems(currentUser?.role ?? 'manager'),
    [currentUser?.role],
  )
  const canSettingsHub = roleCanAccessSettingsHub(currentUser?.role ?? 'manager')

  const productTitle = branding.name || 'Sovereign Analyst'
  const productSub = 'ALPHABASE.sale'

  const linkBase = cn(
    'group flex items-center font-sans text-[13px] font-semibold leading-snug tracking-tight transition-colors duration-150',
    railCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-4 py-2.5',
  )

  return (
    <aside
      className={cn(
        'z-50 flex h-screen min-h-0 shrink-0 flex-col border-r bg-[var(--rail-bg)] py-3 transition-[width] duration-200 ease-out',
        isLight
          ? 'border-[var(--green-border)] shadow-sm'
          : 'border-emerald-900/20 shadow-[inset_-1px_0_0_rgba(201,168,76,0.1),30px_0_30px_rgba(0,17,13,0.4)]',
        railCollapsed ? RAIL_COLLAPSED_W : RAIL_EXPANDED_W,
      )}
    >
      <div className={cn('shrink-0', railCollapsed ? 'mb-2 px-2' : 'mb-3 px-4')}>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={toggleRail}
            title={railCollapsed ? 'Развернуть меню' : 'Свернуть'}
            aria-expanded={!railCollapsed}
            className={cn(
              'flex items-center rounded-lg border px-2.5 py-2 transition-colors',
              isLight
                ? 'border-slate-200 bg-slate-100 text-slate-600 hover:border-[var(--gold)]/50 hover:text-slate-900'
                : 'border-emerald-900/30 bg-[var(--rail-surface)] text-emerald-100/75 hover:border-[color:var(--rail-active-border)] hover:text-[color:var(--rail-active-fg)]',
              railCollapsed ? 'justify-center' : 'gap-2.5',
            )}
          >
            {railCollapsed ? (
              <PanelLeft className={RAIL_ICON} strokeWidth={2} />
            ) : (
              <>
                <PanelLeftClose className="size-5 shrink-0" strokeWidth={2} />
                <span className="text-xs font-semibold">Свернуть</span>
              </>
            )}
          </button>

          {!railCollapsed ? (
            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--gold)]">
                <span className="text-sm font-extrabold text-[color:var(--hub-tile-icon-hover-fg)]">{productTitle.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold tracking-tight text-[color:var(--rail-product-title)]">
                  {productTitle}
                </h1>
                <p className="truncate text-[11px] font-medium uppercase tracking-wide text-[color:var(--app-text-muted)]">
                  {productSub}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center pt-0.5">
              <div
                className="flex size-9 items-center justify-center rounded-md bg-[var(--gold)]"
                title={productTitle}
              >
                <span className="text-xs font-extrabold text-[color:var(--hub-tile-icon-hover-fg)]">{productTitle.slice(0, 2).toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overflow-x-hidden px-0 overscroll-contain [-webkit-overflow-scrolling:touch]"
        aria-label="Разделы"
      >
        {railItems.map((item) => {
          const Icon = item.icon
          const active = isDashboardRailItemActive(location.pathname, item)
          return (
            <Link
              key={item.id}
              to={item.to}
              title={railCollapsed ? item.label : undefined}
              className={cn(
                linkBase,
                'relative overflow-hidden',
                active
                  ? cn(
                      'text-[color:var(--rail-active-fg)]',
                      isLight ? 'bg-[var(--nav-item-bg-active)]' : 'bg-emerald-900/35',
                    )
                  : cn(
                      isLight
                        ? 'text-[color:var(--nav-item-text)] hover:bg-slate-100 hover:text-slate-900'
                        : 'text-emerald-100/70 hover:bg-emerald-900/25 hover:text-emerald-50',
                    ),
              )}
            >
              {active ? (
                <span
                  className="pointer-events-none absolute top-0 bottom-0 left-0 z-[1] w-[3px] bg-[color:var(--rail-active-border)]"
                  aria-hidden
                />
              ) : null}
              <Icon className={cn(RAIL_ICON, 'relative z-[2] shrink-0')} strokeWidth={active ? 2.25 : 2} />
              {!railCollapsed && (
                <span className="relative z-[2] min-w-0 flex-1 truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={cn('mt-auto shrink-0 border-t pt-2', isLight ? 'border-[var(--green-border)]' : 'border-emerald-900/25', railCollapsed ? 'px-2' : 'px-4')}>
        {canSettingsHub && (
          <button
            type="button"
            onClick={() => navigate('/dashboard/settings-hub')}
            title="Настройки"
            className={cn(
              'flex w-full items-center rounded-lg py-2.5 font-sans text-[13px] font-semibold transition-colors',
              isLight
                ? 'text-[color:var(--nav-item-text)] hover:bg-slate-100 hover:text-slate-900'
                : 'text-emerald-100/70 hover:bg-emerald-900/25 hover:text-emerald-50',
              railCollapsed ? 'justify-center' : 'gap-3 px-1',
            )}
          >
            <Settings className={RAIL_ICON} strokeWidth={2} />
            {!railCollapsed && 'Настройки'}
          </button>
        )}

        <div className={cn('mt-2', railCollapsed ? 'flex justify-center' : '')}>
          <button
            type="button"
            title="Выйти"
            onClick={() => {
              logout()
              navigate('/')
            }}
            className={cn(
              'flex items-center rounded-md transition-colors hover:text-[color:var(--theme-accent-link)]',
              isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-emerald-100/45 hover:bg-emerald-900/25',
              railCollapsed ? 'justify-center p-1.5' : 'w-full gap-2 px-2 py-2 text-[13px] font-semibold',
            )}
          >
            <LogOut className="size-5" />
            {!railCollapsed && 'Выйти'}
          </button>
        </div>
      </div>
    </aside>
  )
}
