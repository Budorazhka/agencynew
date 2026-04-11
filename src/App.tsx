import { useLocation } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { SidebarRailProvider } from '@/context/SidebarRailContext'
import { DashboardAppRail } from '@/components/layout/DashboardAppRail'
import { DashboardTopHeader } from '@/components/layout/DashboardTopHeader'
import { DashboardRouteGuard } from '@/components/layout/DashboardRouteGuard'

export default function App() {
  const { isFeltStyle } = useTheme()
  const location = useLocation()
  /** Покерный стол CRM заполняет колонку под шапкой без лишнего скролла оболочки. */
  const isPokerRoute = location.pathname === '/dashboard/leads/poker'
  const isNewBuildRegistrationsRoute = location.pathname === '/dashboard/new-buildings/registration'
  const isStretchRoute = isPokerRoute || isNewBuildRegistrationsRoute

  return (
    <SidebarRailProvider>
      <div
        className={cn(
          'flex h-screen min-h-0 flex-row overflow-hidden bg-[var(--app-bg)] text-[color:var(--app-text)]',
          isFeltStyle ? 'app-theme-felt' : '',
        )}
      >
        <DashboardAppRail />
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)] p-0 text-[color:var(--app-text)]">
          <DashboardTopHeader />
          <div
            className={cn(
              'relative min-h-0 flex-1 overflow-x-hidden',
              isStretchRoute ? 'flex min-h-0 flex-col overflow-hidden' : 'overflow-y-auto',
            )}
          >
            <DashboardRouteGuard />
          </div>
        </main>
      </div>
    </SidebarRailProvider>
  )
}
