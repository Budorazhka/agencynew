import { Outlet, useLocation } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

export default function App() {
  const { isFeltStyle } = useTheme()
  const location = useLocation()
  const isPokerFullscreen = location.pathname === '/dashboard/leads/poker'
  const isMainDashboard = location.pathname === '/dashboard' || location.pathname === '/dashboard/'

  return (
    <div
      className={cn('flex min-h-screen', isFeltStyle ? 'app-theme-felt' : '')}
      style={isFeltStyle ? undefined : { background: 'var(--green-bg)' }}
    >
      <main className={cn(
        'flex-1 overflow-auto',
        isPokerFullscreen ? 'p-0 overflow-hidden' :
        isMainDashboard ? 'p-0 flex flex-col' :
        'p-0'
      )}>
        <Outlet />
      </main>
    </div>
  )
}
