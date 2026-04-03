import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface DashboardShellProps {
  children: ReactNode
  /** Без левого меню — для вложенных экранов CRM (клиенты и т.п.) */
  hideSidebar?: boolean
  /** Кнопка «Назад» по центру сверху */
  topBack?: { label: string; route: string }
}

const S = {
  topBackBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    height: 38,
    padding: '0 18px',
    background: 'rgba(201,168,76,0.1)',
    border: '1px solid rgba(201,168,76,0.35)',
    borderRadius: 10,
    color: 'var(--gold)',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    fontFamily: 'inherit',
  } as React.CSSProperties,

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

export function DashboardShell({ children, topBack }: DashboardShellProps) {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--app-bg)', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      {topBack && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 16px 0', flexShrink: 0 }}>
          <button
            type="button"
            style={S.topBackBtn}
            onClick={() => navigate(topBack.route)}
          >
            <ArrowLeft size={14} />
            {topBack.label}
          </button>
        </div>
      )}

      <main style={S.main}>
        {children}
      </main>
    </div>
  )
}
