import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  ExternalLink,
  List,
  Send,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function SelectionsHubPage() {
  const navigate = useNavigate()

  return (
    <div
      className="flex min-h-screen w-full flex-col bg-[var(--app-bg)] text-[color:var(--app-text)] antialiased"
      style={{ fontFamily: 'Inter, Montserrat, system-ui, sans-serif' }}
    >
      <header className="sticky top-0 z-40 w-full border-b border-[color:var(--divider-subtle)] bg-[color-mix(in_srgb,var(--app-bg)_92%,transparent)] backdrop-blur-md">
        <div className="flex h-14 w-full items-center justify-between px-5 md:px-8">
          <div className="flex min-w-0 items-center gap-4 md:gap-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard/crm')}
              className="flex shrink-0 items-center gap-2 border border-[#e6c364]/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#e6c364] transition-colors hover:bg-[#e6c364]/10"
            >
              <ArrowLeft className="size-3.5" strokeWidth={2} />
              Назад
            </button>
            <span className="hidden truncate text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c364] sm:inline">
              Подборки
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-4 md:gap-6">
            <button
              type="button"
              className="cursor-pointer text-[color:var(--app-text-muted)] transition-opacity hover:opacity-100"
              aria-label="Уведомления"
            >
              <Bell className="size-[22px] stroke-[1.5]" />
            </button>
            <button
              type="button"
              className="cursor-pointer text-[color:var(--app-text-muted)] transition-opacity hover:opacity-100"
              aria-label="Профиль"
            >
              <UserCircle className="size-[22px] stroke-[1.5]" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-1 flex-col">
        <div className="flex w-full flex-col gap-8 px-5 py-6 pb-10 md:gap-10 md:px-8 md:py-8 md:pb-12">
          <section className="w-full space-y-2">
            <h1 className="text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#e6c364] sm:text-4xl md:text-[44px] lg:text-[52px]">
              Подборки
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-[color:var(--hub-desc)]">
              Управление персональными коллекциями объектов недвижимости для ваших клиентов. Отслеживайте
              вовлечённость и конвертируйте просмотры в сделки.
            </p>
          </section>

          <section className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard/selections/list')}
              className="group flex min-h-[200px] cursor-pointer flex-col justify-between bg-[var(--green-card)] p-6 text-left transition-colors gold-inner-glow hover:bg-[var(--green-card-hover)] md:min-h-[220px] md:p-8"
            >
              <div className="flex items-start justify-between">
                <List className="size-9 text-[#e6c364]/40 md:size-10" strokeWidth={1.25} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)]">
                  Архив
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-[color:var(--app-text)] md:text-2xl">
                  Все подборки
                </h2>
                <p className="mt-1 text-xs text-[color:var(--app-text-subtle)]">Просмотр и редактирование активных коллекций</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard/selections/new')}
              className="group flex min-h-[200px] cursor-pointer flex-col justify-between bg-[var(--green-card)] p-6 text-left transition-colors gold-inner-glow hover:bg-[var(--green-card-hover)] md:min-h-[220px] md:p-8"
            >
              <div className="flex items-start justify-between">
                <Send className="size-9 text-[#e6c364] md:size-10" strokeWidth={1.35} />
                <ExternalLink className="size-5 text-[#e6c364]/40" strokeWidth={1.5} />
              </div>
              <div className="space-y-5 md:space-y-6">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-[color:var(--app-text)] md:text-2xl">
                    Создать подборку
                  </h2>
                  <p className="mt-1 text-xs text-[color:var(--app-text-subtle)]">Конфигуратор новых предложений для клиента</p>
                </div>
                <span className="inline-flex w-fit border border-[#e6c364]/40 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-[#e6c364] transition-all group-hover:bg-[#e6c364] group-hover:text-[#3d2e00] md:px-6">
                  Быстрый запуск
                </span>
              </div>
            </button>
          </section>

          <section className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] xl:gap-8">
            <div className="min-w-0 overflow-hidden bg-[var(--green-card)] gold-inner-glow">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--divider-subtle)] px-5 py-4 md:px-8 md:py-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c364]">
                  Последняя активность
                </h3>
                <span className="text-[10px] font-medium text-[color:var(--app-text-subtle)]">Обновлено 2 мин назад</span>
              </div>
              <div className="divide-y divide-[color:var(--divider-subtle)]">
                {[
                  {
                    id: 'sel-001',
                    title: 'ЖК «Reflection» — подборка для Анны С.',
                    sub: '4 объекта в коллекции • 14:20 сегодня',
                    status: 'Просмотрено',
                    dot: 'bg-[#b3cdbb]',
                    labelClass: 'text-[#b3cdbb]',
                  },
                  {
                    id: 'sel-002',
                    title: 'Вторичка: Пресненский вал — клиент ID 4920',
                    sub: '12 объектов в коллекции • Вчера, 18:45',
                    status: 'Новая',
                    dot: 'bg-[#e6c364]',
                    labelClass: 'text-[#e6c364]',
                  },
                  {
                    id: 'sel-003',
                    title: 'Бизнес-центры: инвестиции — Смирнов П.',
                    sub: '3 объекта в коллекции • 12 окт, 11:30',
                    status: 'Отправлено',
                    dot: 'bg-[#8c928f]',
                    labelClass: 'text-[#8c928f]',
                  },
                ].map(row => (
                  <button
                    key={row.title}
                    type="button"
                    onClick={() => navigate(`/dashboard/selections/${row.id}`)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--green-card-hover)] md:px-8 md:py-5"
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="block text-sm font-semibold text-[color:var(--app-text)]">{row.title}</span>
                      <span className="mt-0.5 block text-[11px] text-[color:var(--app-text-subtle)]">{row.sub}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 md:gap-6">
                      <div className="flex items-center gap-2">
                        <div className={cn('size-1.5 shrink-0 rounded-full', row.dot)} />
                        <span className={cn('text-[10px] font-bold uppercase tracking-wider', row.labelClass)}>
                          {row.status}
                        </span>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-[color:var(--app-text-subtle)]" strokeWidth={2} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex min-h-[280px] flex-col justify-between bg-[var(--green-card)] p-6 gold-inner-glow md:min-h-0 md:p-8">
              <div>
                <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c364] md:mb-8">
                  Статистика охвата
                </h3>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tighter text-[color:var(--app-text)] md:text-6xl">84%</span>
                  <span className="text-xs font-bold text-emerald-400">+12.4%</span>
                </div>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-widest text-[color:var(--app-text-subtle)]">
                  Конверсия в просмотр подборок
                </p>
              </div>
              <div className="mt-8 flex h-24 shrink-0 items-end gap-1.5 md:mt-12">
                {[40, 65, 55, 80, 70, 100].map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 rounded-t-[2px]',
                      i === 5 ? 'bg-[#e6c364]' : 'bg-[var(--header-avatar-bg)]',
                    )}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
