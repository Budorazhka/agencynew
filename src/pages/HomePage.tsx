import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Search, Plus, ChevronDown } from 'lucide-react'
import { getBranding } from '../store/agencyStore'
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
  const branding = getBranding()
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
    <div className="flex h-screen min-h-0 flex-1 flex-col overflow-hidden bg-[#031712] font-[Inter,sans-serif] text-[#d0e8df] antialiased">
        <header
          className={cn(
            'sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-emerald-900/20',
            'bg-[#031712]/80 px-8 shadow-[0_1px_0_rgba(201,168,76,0.12)] backdrop-blur-md',
          )}
        >
          <div className="flex w-full max-w-[400px] items-center rounded-lg border border-[#424846]/15 bg-[#0a1f1a] px-4 py-2">
            <Search className="mr-3 size-[18px] shrink-0 text-[#d0e8df]/35" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по клиентам, объектам..."
              className="w-full border-0 bg-transparent text-sm text-[#d0e8df] placeholder:text-[#d0e8df]/50 focus:outline-none focus:ring-0"
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
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[220px] overflow-hidden rounded-lg border border-[#424846]/30 bg-[#0a1f1a] py-1 shadow-xl">
                  {ADD_ACTIONS.map(a => (
                    <button
                      key={a.label}
                      type="button"
                      className="block w-full px-4 py-2.5 text-left text-xs font-medium text-[#d0e8df] hover:bg-emerald-900/30"
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
            <div className="flex items-center gap-4 text-emerald-100/70">
              <NotificationCenter />
              <button
                type="button"
                onClick={() => navigate('/dashboard/settings-hub')}
                className="transition-colors hover:text-[#e6c364]"
                aria-label="Настройки"
              >
                <Settings className="size-[22px]" strokeWidth={1.5} />
              </button>
            </div>
            <div className="h-8 w-px bg-emerald-900/20" />
            <div className="flex size-8 items-center justify-center rounded-full border border-[#e6c364]/30 bg-[#0a1f1a] text-[10px] font-bold text-[#e6c364]">
              {shortName}
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            <header className="mb-10">
              <div className="min-w-0">
                <h2 className="mb-1 text-3xl font-extrabold tracking-tight text-white">
                  Добро пожаловать, {firstName}
                </h2>
                <p className="text-sm opacity-70">
                  {productTitle} — ваша сводка на сегодня.
                </p>
              </div>
            </header>

            <DashboardWorkspace />
          </div>
        </main>
    </div>
  )
}
