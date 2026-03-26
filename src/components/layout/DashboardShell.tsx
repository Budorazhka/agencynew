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
    gap: 6,
    flexShrink: 0,
    height: 32,
    padding: '0 12px',
    background: 'rgba(201,168,76,0.1)',
    border: '1px solid rgba(201,168,76,0.35)',
    borderRadius: 8,
    color: 'var(--gold)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
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
    <div style={S.root}>
      {/* Sidebar */}
      {!hideSidebar && (
      <aside style={S.sidebar}>
        <div style={S.sidebarLogo}>
          {branding.logoDataUrl && (
            <img
              src={branding.logoDataUrl}
              alt="logo"
              style={{ height: 28, marginBottom: 6, objectFit: 'contain' }}
            />
          )}
          <div style={S.sidebarLogoTitle}>
            {branding.name || 'Estate Portal'}
          </div>
          <div style={S.sidebarLogoSub}>PropTech Platform</div>
        </div>

        <nav style={S.navScroll}>
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.route)
            return (
              <div
                key={item.label}
                style={S.navItem(active)}
                onClick={() => go(item.route, item.external)}
              >
                <Icon size={14} />
                {item.label}
              </div>
            )
          })}
        </nav>

        {/* Footer: user info + logout */}
        <div style={S.sidebarFooter}>
          {currentUser && (
            <div style={S.userRow}>
              <User size={14} color="var(--sidebar-icon-muted)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.userName}>{currentUser.name}</div>
                <div style={S.userRole}>{ROLE_LABEL[currentUser.role]}</div>
              </div>
            </div>
          )}
          <button
            style={S.logoutBtn}
            onClick={() => { logout(); navigate('/') }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--app-text-muted)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--logout-muted)')}
          >
            <LogOut size={12} />
            Выйти
          </button>
        </div>
      </aside>
      )}

      {/* Main content area */}
      <div style={S.content}>
        {/* Top bar */}
        {hideSidebar ? (
          <div
            style={{
              ...S.topbar,
              justifyContent: 'space-between',
              gap: 16,
              padding: '0 24px',
            }}
          >
            <div style={{ flexShrink: 0 }}>
              {topBack && (
                <button
                  type="button"
                  style={{
                    ...S.topBackBtn,
                    height: 36,
                    borderRadius: 10,
                  }}
                  onClick={() => navigate(topBack.route)}
                >
                  <ArrowLeft size={18} strokeWidth={2} />
                  {topBack.label}
                </button>
              )}
            </div>
            <div
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                minWidth: 0,
                padding: '0 16px',
              }}
            >
              <div
                ref={searchRef}
                style={{
                  width: '100%',
                  maxWidth: 720,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--shell-elevated-bg)',
                  border: '1px solid var(--shell-elevated-border)',
                  borderRadius: 12,
                  padding: '0 14px 0 44px',
                  height: 36,
                  position: 'relative',
                }}
              >
                <Search
                  size={20}
                  color="var(--shell-search-ph)"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  style={{
                    ...S.searchInput,
                    fontSize: 13,
                  }}
                  placeholder="Поиск по клиентам, сделкам, задачам..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                />
                {searchFocused && searchQuery.trim().length >= 2 && (
                  <div style={{ ...S.searchDropdown, left: 0, right: 0 }}>
                    {searchResults.length === 0 ? (
                      <div style={S.searchEmpty}>Ничего не найдено</div>
                    ) : searchResults.map(item => {
                      const Icon = CATEGORY_ICON[item.category]
                      const color = CATEGORY_COLOR[item.category]
                      return (
                        <div
                          key={item.id + item.category}
                          style={S.searchResultItem}
                          onMouseDown={() => { navigate(item.route); setSearchQuery(''); setSearchFocused(false) }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--dropdown-hover)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={13} color={color} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dropdown-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>
                            <div style={{ fontSize: 10, color: 'var(--dropdown-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</div>
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color, flexShrink: 0 }}>{CATEGORY_LABEL[item.category]}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
              <NotificationCenter />
              {currentUser && (
                <>
                  <div style={{ width: 1, height: 24, background: 'var(--divider-subtle)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--header-user-text)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {shortDisplayName(currentUser.name)}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#e6c364', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        {ROLE_LABEL[currentUser.role]}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--header-avatar-bg)',
                        border: '1px solid var(--header-avatar-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#e6c364',
                      }}
                    >
                      {userInitials(currentUser.name)}
                    </div>
                    <button
                      type="button"
                      title="Выйти"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 4,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: 'var(--app-text-muted)',
                      }}
                      onClick={() => { logout(); navigate('/') }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#b91c1c' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--app-text-muted)' }}
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={S.topbar}>
            {topBack && (
              <button
                type="button"
                style={S.topBackBtn}
                onClick={() => navigate(topBack.route)}
              >
                <ArrowLeft size={14} />
                {topBack.label}
              </button>
            )}
            <div
              ref={searchRef}
              style={{
                ...S.searchWrap,
                position: 'relative',
              }}
            >
              <Search size={13} color="var(--shell-search-ph)" />
              <input
                style={S.searchInput}
                placeholder="Поиск по клиентам, сделкам, задачам..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
              />
              {searchFocused && searchQuery.trim().length >= 2 && (
                <div style={S.searchDropdown}>
                  {searchResults.length === 0 ? (
                    <div style={S.searchEmpty}>Ничего не найдено</div>
                  ) : searchResults.map(item => {
                    const Icon = CATEGORY_ICON[item.category]
                    const color = CATEGORY_COLOR[item.category]
                    return (
                      <div
                        key={item.id + item.category}
                        style={S.searchResultItem}
                        onMouseDown={() => { navigate(item.route); setSearchQuery(''); setSearchFocused(false) }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--dropdown-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={13} color={color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dropdown-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>
                          <div style={{ fontSize: 10, color: 'var(--dropdown-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</div>
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color, flexShrink: 0 }}>{CATEGORY_LABEL[item.category]}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <NotificationCenter />
          </div>
        )}

        <main style={S.main}>
          {children}
        </main>
      </div>
    </div>
  )
}
