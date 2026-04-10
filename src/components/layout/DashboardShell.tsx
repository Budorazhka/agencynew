import { type CSSProperties, type ReactNode } from 'react'

interface DashboardShellProps {
  children: ReactNode
  /** Без левого меню — для вложенных экранов CRM (клиенты и т.п.) */
  hideSidebar?: boolean
  /**
   * По умолчанию скроллится вся колонка main.
   * `false` — без скролла на main: высота на весь экран, скролл только у вложенных блоков.
   */
  scrollMain?: boolean
}

export function DashboardShell({ children, scrollMain = true }: DashboardShellProps) {
  const overflowY: NonNullable<CSSProperties['overflowY']> = scrollMain ? 'auto' : 'hidden'
  const mainStyle: CSSProperties = {
    flex: 1,
    position: 'relative',
    minHeight: 0,
    overflowY,
    overflowX: 'hidden',
    background: 'var(--app-bg)',
    display: 'flex',
    flexDirection: 'column',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--app-bg)', fontFamily: "'Montserrat', sans-serif", overflow: 'hidden' }}>
      <main style={mainStyle}>
        {children}
      </main>
    </div>
  )
}
