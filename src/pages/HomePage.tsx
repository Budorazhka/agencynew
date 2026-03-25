import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Search, Plus, Check, Clock, MoreVertical, ChevronDown } from 'lucide-react'
import { getBranding } from '../store/agencyStore'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { NotificationCenter } from '@/components/layout/NotificationCenter'

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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <h2 className="mb-1 text-3xl font-extrabold tracking-tight text-white">
                    Добро пожаловать, {firstName}
                  </h2>
                  <p className="text-sm opacity-70">
                    {productTitle} — ваша сводка на сегодня.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/bookings')}
                    className={cn(
                      'inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors',
                      'border border-[#e6c364]/35 bg-[#0a1f1a] text-[#e6c364] hover:bg-[#0f231e] hover:border-[#e6c364]/55'
                    )}
                  >
                    Брони / Регистрации
                  </button>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* План на сегодня */}
              <section
                className={cn(
                  'flex flex-col rounded-xl bg-[#0a1f1a] p-6 transition-colors duration-300',
                  'shadow-[inset_0_0_0_1px_rgba(201,168,76,0.18)] hover:bg-[#0f231e]',
                )}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#e6c364]">
                    План на сегодня
                  </h3>
                  <MoreVertical className="size-4 text-[#e6c364]/40" />
                </div>
                <div className="flex flex-1 flex-col space-y-4">
                  <label className="group/item flex cursor-pointer items-center">
                    <div className="mr-4 flex size-5 items-center justify-center rounded-sm border border-[#e6c364] transition-colors group-hover/item:bg-[#e6c364]/10">
                      <Check className="size-3.5 text-[#e6c364]" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium">Звонок по объекту «Emerald Tower»</span>
                  </label>
                  <label className="group/item flex cursor-pointer items-center">
                    <div className="mr-4 flex size-5 items-center justify-center rounded-sm border border-[#e6c364]/30 transition-colors group-hover/item:border-[#e6c364]" />
                    <span className="text-sm font-medium opacity-70">Подготовка отчета для инвесторов</span>
                  </label>
                  <label className="group/item flex cursor-pointer items-center">
                    <div className="mr-4 flex size-5 items-center justify-center rounded-sm border border-[#e6c364]/30 transition-colors group-hover/item:border-[#e6c364]" />
                    <span className="text-sm font-medium opacity-70">Осмотр ЖК «Green Valley»</span>
                  </label>
                </div>
              </section>

              {/* Входящие лиды */}
              <section
                className={cn(
                  'flex flex-col rounded-xl bg-[#0a1f1a] p-6 transition-colors duration-300',
                  'shadow-[inset_0_0_0_1px_rgba(201,168,76,0.18)] hover:bg-[#0f231e]',
                )}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#e6c364]">
                    Входящие лиды
                  </h3>
                  <span className="rounded-full bg-[#e6c364]/10 px-2 py-0.5 text-[10px] font-bold text-[#e6c364]">
                    2 новых
                  </span>
                </div>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/leads/poker')}
                    className="flex w-full items-center justify-between rounded-lg border border-[#424846]/10 bg-[#00110d]/50 p-3 text-left transition-colors hover:border-[#e6c364]/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-emerald-800/40 text-xs font-bold text-emerald-200">
                        МК
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Михаил Котов</p>
                        <p className="text-[10px] uppercase tracking-tighter opacity-50">Покупка, Коммерция</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center justify-end gap-1 text-[10px] font-bold text-red-400">
                        <Clock className="size-3" />
                        14м SLA
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/leads/poker')}
                    className="flex w-full items-center justify-between rounded-lg border border-[#424846]/10 bg-[#00110d]/50 p-3 text-left transition-colors hover:border-[#e6c364]/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-emerald-800/40 text-xs font-bold text-emerald-200">
                        АБ
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Анна Белова</p>
                        <p className="text-[10px] uppercase tracking-tighter opacity-50">Аренда, Пентхаус</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center justify-end gap-1 text-[10px] font-bold text-[#e6c364]">
                        <Clock className="size-3" />
                        45м SLA
                      </p>
                    </div>
                  </button>
                </div>
              </section>

              {/* Мой прогресс */}
              <section
                className={cn(
                  'flex flex-col rounded-xl bg-[#0a1f1a] p-6 transition-colors duration-300',
                  'shadow-[inset_0_0_0_1px_rgba(201,168,76,0.18)] hover:bg-[#0f231e]',
                )}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#e6c364]">
                    Мой прогресс
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest opacity-50">KPI квартал</span>
                </div>
                <div className="mb-6 flex items-end gap-4">
                  <span className="text-6xl font-extrabold leading-none tracking-tighter text-white">75%</span>
                  <div className="mb-2">
                    <p className="text-xs font-medium text-emerald-300/90">+12% с пр. недели</p>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full border border-[#424846]/10 bg-[#00110d]">
                  <div
                    className="relative h-full w-[75%] rounded-full bg-gradient-to-r from-[#e6c364] to-[#9e8028]"
                    style={{ boxShadow: 'inset 0 0 8px rgba(255,255,255,0.15)' }}
                  />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="border-l border-[#e6c364]/20 p-3">
                    <p className="mb-1 text-[10px] uppercase opacity-50">Сделки</p>
                    <p className="text-lg font-bold">12 / 15</p>
                  </div>
                  <div className="border-l border-[#e6c364]/20 p-3">
                    <p className="mb-1 text-[10px] uppercase opacity-50">Выручка</p>
                    <p className="text-lg font-bold">4.2M ₽</p>
                  </div>
                </div>
              </section>

              {/* Уведомления */}
              <section
                className={cn(
                  'flex flex-col rounded-xl bg-[#0a1f1a] p-6 transition-colors duration-300',
                  'shadow-[inset_0_0_0_1px_rgba(201,168,76,0.18)] hover:bg-[#0f231e]',
                )}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#e6c364]">
                    Уведомления
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/info')}
                    className="text-[10px] font-bold uppercase tracking-wider text-[#e6c364]/60 transition-colors hover:text-[#e6c364]"
                  >
                    Все
                  </button>
                </div>
                <div className="max-h-[180px] space-y-4 overflow-y-auto pr-2">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 size-2 shrink-0 rounded-full bg-[#e6c364]" />
                    <div>
                      <p className="mb-1 text-sm leading-tight">
                        Объект <span className="text-[#e6c364]">«Park Plaza»</span> переведен в статус активных.
                      </p>
                      <p className="text-[10px] opacity-40">10 минут назад</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 size-2 shrink-0 rounded-full bg-emerald-700" />
                    <div>
                      <p className="mb-1 text-sm leading-tight">
                        Система: Ежедневный бэкап базы данных завершен успешно.
                      </p>
                      <p className="text-[10px] opacity-40">1 час назад</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 size-2 shrink-0 rounded-full bg-[#e6c364]" />
                    <div>
                      <p className="mb-1 text-sm leading-tight">
                        Новый комментарий от <span className="text-[#e6c364]">Ильи С.</span> по объекту River Side.
                      </p>
                      <p className="text-[10px] opacity-40">3 часа назад</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
    </div>
  )
}
