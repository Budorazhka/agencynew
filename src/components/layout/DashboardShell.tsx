import { type ReactNode, useState, useRef, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useAgencyBranding } from '@/hooks/useAgencyBranding'
import { getNavItemsForRole } from '@/config/nav-items'
import { LogOut, User, Search, Users, Briefcase, CheckSquare, ArrowLeft } from 'lucide-react'
import { ROLE_LABEL } from '@/lib/permissions'
import { NotificationCenter } from './NotificationCenter'
import { CLIENTS_MOCK } from '@/data/clients-mock'
import { DEALS_MOCK } from '@/data/deals-mock'
import { TASKS_MOCK } from '@/data/tasks-mock'
import { STAGE_LABELS } from '@/types/deals'

interface DashboardShellProps {
  children: ReactNode
  /** Без левого меню — для вложенных экранов CRM (клиенты и т.п.) */
  hideSidebar?: boolean
  /** Кнопка слева в шапке (например «Назад» в CRM) */
  topBack?: { label: string; route: string }
}

type SearchResultItem = {
  id: string
  label: string
  sub: string
  category: 'client' | 'deal' | 'task'
  route: string
}

const CATEGORY_ICON = {
  client: Users,
  deal: Briefcase,
  task: CheckSquare,
} as const

const CATEGORY_COLOR = {
  client: '#60a5fa',
  deal: '#c9a84c',
  task: '#a78bfa',
} as const

const CATEGORY_LABEL = {
  client: 'Клиент',
  deal: 'Сделка',
  task: 'Задача',
} as const

const S = {
  root: {
    display: 'flex',
    height: '100vh',
    background: 'var(--app-bg)',
    overflow: 'hidden',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  sidebar: {
    width: 220,
    flexShrink: 0,
    background: 'var(--green-deep)',
    borderRight: '1px solid var(--green-border)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },

  sidebarLogo: {
    padding: '20px 20px 16px',
    borderBottom: '1px solid var(--green-border)',
  },
  sidebarLogoTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--gold)',
    letterSpacing: '0.04em',
    marginBottom: 2,
  },
  sidebarLogoSub: {
    fontSize: 9,
    fontWeight: 600,
    color: 'rgba(201,168,76,0.4)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
  },

  navScroll: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '8px 0',
  },

  navItem: (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 20px',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: active ? 700 : 500,
    letterSpacing: '0.08em',
    color: active ? 'var(--gold)' : 'var(--nav-item-text)',
    background: active ? 'var(--nav-item-bg-active)' : 'transparent',
    borderLeft: active ? '3px solid var(--gold)' : '3px solid transparent',
    transition: 'all 0.15s',
    textTransform: 'uppercase' as const,
    userSelect: 'none',
  }),

  sidebarFooter: {
    padding: '12px 16px',
    borderTop: '1px solid var(--green-border)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },

  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 4px',
  },

  userName: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--sidebar-user-name)',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },

  userRole: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: 'var(--gold)',
    textTransform: 'uppercase' as const,
  },

  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 4px',
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: 'var(--logout-muted)',
    textTransform: 'uppercase' as const,
    transition: 'color 0.15s',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left' as const,
  },

  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    background: 'var(--app-bg)',
  },

  topbar: {
    height: 52,
    flexShrink: 0,
    borderBottom: '1px solid var(--green-border)',
    background: 'var(--green-deep)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 20px',
  },

  searchWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--shell-search-bg)',
    border: '1px solid var(--shell-search-border)',
    borderRadius: 8,
    padding: '0 12px',
    height: 32,
    maxWidth: 360,
  },

  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: 12,
    color: 'var(--shell-search-fg)',
    fontFamily: 'inherit',
  },

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

  searchDropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    background: 'var(--dropdown-bg)',
    border: '1px solid var(--dropdown-border)',
    borderRadius: 10,
    boxShadow: 'var(--dropdown-shadow)',
    zIndex: 999,
    overflow: 'hidden',
    maxHeight: 360,
    overflowY: 'auto' as const,
  },

  searchResultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 14px',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },

  searchEmpty: {
    padding: '14px 16px',
    fontSize: 12,
    color: 'var(--dropdown-text-muted)',
    textAlign: 'center' as const,
  },
}

function shortDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return name
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[1][0]}.`
}

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function DashboardShell({ children, hideSidebar = true, topBack }: DashboardShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, logout } = useAuth()
  const branding = useAgencyBranding()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const navItems = currentUser ? getNavItemsForRole(currentUser.role) : []

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const searchResults = useMemo((): SearchResultItem[] => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 2) return []
    const results: SearchResultItem[] = []

    CLIENTS_MOCK.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.phone.includes(q)) {
        results.push({ id: c.id, label: c.name, sub: c.phone, category: 'client', route: `/dashboard/clients/${c.id}` })
      }
    })

    DEALS_MOCK.forEach(d => {
      if (d.clientName.toLowerCase().includes(q) || d.propertyAddress.toLowerCase().includes(q)) {
        results.push({ id: d.id, label: d.clientName, sub: `${STAGE_LABELS[d.stage]} · ${d.propertyAddress}`, category: 'deal', route: `/dashboard/deals/${d.id}` })
      }
    })

    TASKS_MOCK.forEach(t => {
      if (t.title.toLowerCase().includes(q)) {
        results.push({ id: t.id, label: t.title, sub: t.assignedToName || 'Без исполнителя', category: 'task', route: `/dashboard/tasks/my` })
      }
    })

    return results.slice(0, 8)
  }, [searchQuery])

  function go(route: string, external = false) {
    if (external) { window.open(route, '_blank'); return }
    navigate(route)
  }

  function isActive(route: string): boolean {
    if (route === '/dashboard/dashboards') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/'
    }
    return location.pathname.startsWith(route)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--app-bg)', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      {/* Minimal back button — no heavy header */}
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
