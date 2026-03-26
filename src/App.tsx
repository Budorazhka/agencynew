import { Outlet, useLocation } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { SidebarRailProvider } from '@/context/SidebarRailContext'
import { DashboardAppRail } from '@/components/layout/DashboardAppRail'

export default function App() {
  const { isFeltStyle } = useTheme()
  const location = useLocation()
  const isPokerFullscreen = location.pathname === '/dashboard/leads/poker'
  if (isPokerFullscreen) {
    return (
      <div
        className={cn(
          'flex min-h-screen bg-[var(--app-bg)] text-[color:var(--app-text)]',
          isFeltStyle ? 'app-theme-felt' : '',
        )}
      >
        <main className="flex-1 overflow-hidden p-0">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <SidebarRailProvider>
      <div
        className={cn(
          'flex h-screen min-h-0 overflow-hidden bg-[var(--app-bg)] text-[color:var(--app-text)]',
          isFeltStyle ? 'app-theme-felt' : '',
        )}
      >
        <DashboardAppRail />
        <main className="relative min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden flex flex-col bg-[var(--app-bg)] p-0 text-[color:var(--app-text)]">
          <Outlet />
        </main>
      </div>
    </SidebarRailProvider>
  )
}
