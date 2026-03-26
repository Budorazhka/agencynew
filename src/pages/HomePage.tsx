import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Search, Plus, ChevronDown } from 'lucide-react'
import { useAgencyBranding } from '@/hooks/useAgencyBranding'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { NotificationCenter } from '@/components/layout/NotificationCenter'
import { DashboardWorkspace } from '@/components/dashboard/DashboardWorkspace'

const ADD_ACTIONS = [
  { label: 'Новый лид', route: '/dashboard/leads/poker' },
  { label: 'Новый клиент', route: '/dashboard/clients/list' },
  { label: 'Новая сделка', route: '/dashboard/deals' },
  { label: 'Новая задача', route: '/dashboard/tasks' },
  { label: 'Новая подборка', route: '/dashboard/selections/new' },
  { label: 'Новая бронь', route: '/dashboard/bookings' },
  { label: 'Событие в календаре', route: '/dashboard/calendar' },
  { label: 'Новый объект', route: '/dashboard/objects/list' },
] as const

export default function HomePage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const branding = useAgencyBranding()
  const [searchQuery, setSearchQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const addRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (addRef.current && !addRef.current.contains(e.target as Node)) setAddOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const userName = currentUser?.name ?? 'Пользователь'
  const firstName = userName.trim().split(/\s+/)[0] || userName
  const shortName = userName.split(' ').slice(0, 2).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'П'
  const productTitle = branding.name || 'Sovereign Analyst'

  return (
    <div className="flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)] font-[Inter,sans-serif] text-[color:var(--workspace-text)] antialiased">
        <header
          className={cn(
            'sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-[var(--green-border)]',
            'bg-[var(--app-bg)]/90 px-8 shadow-sm backdrop-blur-md',
          )}
        >
          <div className="flex w-full max-w-[400px] items-center rounded-lg border border-[var(--shell-search-border)] bg-[var(--shell-elevated-bg)] px-4 py-2">
            <Search className="mr-3 size-[18px] shrink-0 text-[color:var(--workspace-text-dim)]" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по клиентам, объектам..."
              className="w-full border-0 bg-transparent text-sm text-[color:var(--shell-search-fg)] placeholder:text-[color:var(--shell-search-ph)] focus:outline-none focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="relative" ref={addRef}>
              <button
                type="button"
                onClick={() => setAddOpen(o => !o)}
                className="flex items-center gap-2 rounded-sm bg-[#e6c364] px-4 py-1.5 text-sm font-medium text-[#3d2e00] transition-all hover:brightness-110 active:scale-95"
              >
                <Plus className="size-[18px]" />
                Добавить
                <ChevronDown className={cn('size-4 transition-transform', addOpen && 'rotate-180')} />
              </button>
              {addOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[220px] overflow-hidden rounded-lg border border-[var(--dropdown-border)] bg-[var(--dropdown-bg)] py-1 shadow-[var(--dropdown-shadow)]">
                  {ADD_ACTIONS.map(a => (
                    <button
                      key={a.label}
                      type="button"
                      className="block w-full px-4 py-2.5 text-left text-xs font-medium text-[color:var(--dropdown-text)] hover:bg-[var(--dropdown-hover)]"
                      onClick={() => {
                        navigate(a.route)
                        setAddOpen(false)
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-[color:var(--app-text-muted)]">
              <NotificationCenter />
              <button
                type="button"
                onClick={() => navigate('/dashboard/settings-hub')}
                className="transition-colors hover:text-[var(--gold)]"
                aria-label="Настройки"
              >
                <Settings className="size-[22px]" strokeWidth={1.5} />
              </button>
            </div>
            <div className="h-8 w-px bg-[var(--divider-subtle)]" />
            <div className="flex size-8 items-center justify-center rounded-full border border-[var(--header-avatar-border)] bg-[var(--header-avatar-bg)] text-[10px] font-bold text-[var(--gold)]">
              {shortName}
            </div>
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden p-4 lg:px-6 lg:py-5">
          <div className="flex h-full w-full min-w-0 flex-col">
            <header className="mb-3 shrink-0">
              <div className="min-w-0">
                <h2 className="mb-1 text-2xl font-extrabold tracking-tight text-[color:var(--app-text)]">
                  Добро пожаловать, {firstName}
                </h2>
                <p className="text-sm text-[color:var(--app-text-muted)]">
                  {productTitle} — ваша сводка на сегодня.
                </p>
              </div>
            </header>
            <div className="min-h-0 flex-1">
              <DashboardWorkspace />
            </div>
          </div>
        </main>
    </div>
  )
}
