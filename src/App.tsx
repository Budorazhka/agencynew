import { Outlet, useLocation } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { SidebarRailProvider } from '@/context/SidebarRailContext'
import { DashboardAppRail } from '@/components/layout/DashboardAppRail'

export default function App() {
  const { isFeltStyle, theme } = useTheme()
  const location = useLocation()
  const isPokerFullscreen = location.pathname === '/dashboard/leads/poker'
  const isLight = theme === 'light'

  if (isPokerFullscreen) {
    return (
      <div
        className={cn('flex min-h-screen', isFeltStyle ? 'app-theme-felt' : '')}
        style={isFeltStyle || isLight ? undefined : { background: '#031712' }}
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
        className={cn('flex h-screen min-h-0 overflow-hidden', isFeltStyle ? 'app-theme-felt' : '')}
        style={isFeltStyle || isLight ? undefined : { background: '#031712' }}
      >
        <DashboardAppRail />
        <main
          className={cn(
            'relative min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden flex flex-col p-0',
            !isLight && 'bg-[#031712]'
          )}
        >
          <Outlet />
        </main>
      </div>
    </SidebarRailProvider>
  )
}
