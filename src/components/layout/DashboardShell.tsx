import { type ReactNode } from 'react'

interface DashboardShellProps {
  children: ReactNode
  /** Без левого меню — для вложенных экранов CRM (клиенты и т.п.) */
  hideSidebar?: boolean
}

const S = {
  main: {
    flex: 1,
    position: 'relative' as const,
    minHeight: 0,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    background: 'var(--app-bg)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--app-bg)', fontFamily: "'Montserrat', sans-serif", overflow: 'hidden' }}>
      <main style={S.main}>
        {children}
      </main>
    </div>
  )
}
