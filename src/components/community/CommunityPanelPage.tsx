import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarDays, Filter, MessageSquare, Radio, Users } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type MemberSegment = 'broker' | 'developer' | 'partner'
type CommunityRole = 'member' | 'expert' | 'moderator' | 'partner_admin'

const SEGMENT_LABEL: Record<MemberSegment, string> = {
  broker: 'Брокер',
  developer: 'Застройщик',
  partner: 'Партнёр-сервис',
}

const COMMUNITY_ROLE_LABEL: Record<CommunityRole, string> = {
  member: 'Участник',
  expert: 'Эксперт',
  moderator: 'Модератор',
  partner_admin: 'Админ компании',
}

const MEMBERS: Array<{
  id: string
  name: string
  segment: MemberSegment
  communityRole: CommunityRole
  /** Связка с контактом CRM (демо-идентификатор). */
  crmContactId: string
  company: string
  joined: string
  lastActiveDays: number
  eventsYtd: number
  engagement: number
}> = [
  { id: 'm1', name: 'Ирина Соколова', segment: 'broker', communityRole: 'moderator', crmContactId: 'crm-c-901', company: 'Альфа-недвижимость', joined: '2024-06-12', lastActiveDays: 1, eventsYtd: 9, engagement: 92 },
  { id: 'm2', name: 'Георгий Мамедов', segment: 'broker', communityRole: 'expert', crmContactId: 'crm-c-902', company: 'GeoPrime Realty', joined: '2025-01-20', lastActiveDays: 3, eventsYtd: 6, engagement: 78 },
  { id: 'm3', name: 'Елена Воронова', segment: 'developer', communityRole: 'partner_admin', crmContactId: 'crm-c-903', company: 'ГК «Север»', joined: '2023-11-02', lastActiveDays: 0, eventsYtd: 11, engagement: 88 },
  { id: 'm4', name: 'Олег Панин', segment: 'partner', communityRole: 'member', crmContactId: 'crm-c-904', company: 'LegalPro', joined: '2025-03-08', lastActiveDays: 14, eventsYtd: 2, engagement: 44 },
  { id: 'm5', name: 'Мария Ким', segment: 'broker', communityRole: 'member', crmContactId: 'crm-c-905', company: 'Сити Экспресс', joined: '2024-09-15', lastActiveDays: 2, eventsYtd: 7, engagement: 81 },
  { id: 'm6', name: 'Артём Зайцев', segment: 'partner', communityRole: 'expert', crmContactId: 'crm-c-906', company: 'Mortgage Hub', joined: '2024-02-01', lastActiveDays: 8, eventsYtd: 4, engagement: 62 },
  { id: 'm7', name: 'Дмитрий Новацкий', segment: 'broker', communityRole: 'member', crmContactId: '—', company: 'West Capital Homes', joined: '2025-02-28', lastActiveDays: 21, eventsYtd: 1, engagement: 38 },
]

const EVENTS: Array<{
  id: string
  title: string
  date: string
  format: 'online' | 'offline'
  city: string
  attendees: number
  capacity: number
  status: 'planned' | 'done'
}> = [
  { id: 'ev-1', title: 'Нетворкинг брокеров', date: '2026-04-12', format: 'offline', city: 'Москва', attendees: 38, capacity: 50, status: 'planned' },
  { id: 'ev-2', title: 'MLS круглый стол', date: '2026-04-16', format: 'online', city: '—', attendees: 24, capacity: 80, status: 'planned' },
  { id: 'ev-3', title: 'Партнёрский разбор кейсов', date: '2026-04-19', format: 'offline', city: 'СПб', attendees: 31, capacity: 40, status: 'planned' },
  { id: 'ev-4', title: 'Застройщики: совместные продажи', date: '2026-03-28', format: 'online', city: '—', attendees: 52, capacity: 60, status: 'done' },
]

const FEED: Array<{ id: string; text: string; time: string }> = [
  { id: 'f1', text: 'Ирина С. опубликовала кейс по сделке с эскроу', time: '2 ч назад' },
  { id: 'f2', text: 'Новая ветка: стандарты показов в ЖК', time: '5 ч назад' },
  { id: 'f3', text: 'Елена В. пригласила спикера на апрельский эфир', time: 'вчера' },
]

export default function CommunityPanelPage() {
  const [segment, setSegment] = useState<'all' | MemberSegment>('all')
  const [inactiveOnly, setInactiveOnly] = useState(false)
  const [eventFilter, setEventFilter] = useState<'all' | 'planned' | 'done'>('all')

  const filteredMembers = useMemo(() => {
    let rows = [...MEMBERS]
    if (segment !== 'all') rows = rows.filter((m) => m.segment === segment)
    if (inactiveOnly) rows = rows.filter((m) => m.lastActiveDays > 7 || m.engagement < 50)
    return rows
  }, [inactiveOnly, segment])

  const filteredEvents = useMemo(() => {
    if (eventFilter === 'all') return EVENTS
    return EVENTS.filter((e) => e.status === eventFilter)
  }, [eventFilter])

  const kpi = useMemo(() => {
    const total = filteredMembers.length
    const active7d = filteredMembers.filter((m) => m.lastActiveDays <= 7).length
    const planned = EVENTS.filter((e) => e.status === 'planned').length
    const avgEng =
      filteredMembers.length > 0
        ? Math.round(filteredMembers.reduce((s, m) => s + m.engagement, 0) / filteredMembers.length)
        : 0
    const atRisk = filteredMembers.filter((m) => m.lastActiveDays > 14 || m.engagement < 45).length
    return { total, active7d, planned, avgEng, atRisk }
  }, [filteredMembers])

  const lowEngagement = useMemo(
    () => MEMBERS.filter((m) => m.engagement < 55 || m.lastActiveDays > 10).sort((a, b) => a.engagement - b.engagement),
    [],
  )

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Панель управления сообществом</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Участники, вовлечённость, события и оперативная лента активности.
            </p>
            <p className="mt-2 rounded-md border border-[color:var(--workspace-row-border)] bg-[rgba(139,92,246,0.07)] px-3 py-2 text-xs leading-relaxed text-[color:var(--workspace-text-muted)]">
              Роли в сообществе и связь с CRM заданы в таблице ниже; обмен с боевым каталогом контактов включается на API.
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as 'all' | MemberSegment)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Сегмент: все</option>
                <option value="broker">Брокеры</option>
                <option value="developer">Застройщики</option>
                <option value="partner">Партнёры-сервисы</option>
              </select>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value as 'all' | 'planned' | 'done')}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">События: все</option>
                <option value="planned">Предстоящие</option>
                <option value="done">Прошедшие</option>
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]">
                <input type="checkbox" checked={inactiveOnly} onChange={(e) => setInactiveOnly(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
                Низкая активность / давно не заходили
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Участников</p>
              <p className="text-xl font-bold text-[color:var(--theme-accent-heading)]">{kpi.total}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Активны 7 дн.</p>
              <p className="text-xl font-bold text-emerald-400">{kpi.active7d}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Ср. вовлечённость</p>
              <p className="text-xl font-bold text-blue-400">{kpi.avgEng}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Событий впереди</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.planned}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">В зоне риска</p>
              <p className="text-xl font-bold text-amber-400">{kpi.atRisk}</p>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-3 flex items-center gap-2">
                <Users className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Участники</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                      <th className="px-2 py-2">Имя</th>
                      <th className="px-2 py-2">Сегмент</th>
                      <th className="px-2 py-2">Роль</th>
                      <th className="px-2 py-2">CRM</th>
                      <th className="px-2 py-2">Компания</th>
                      <th className="px-2 py-2">Активность</th>
                      <th className="px-2 py-2">События</th>
                      <th className="px-2 py-2">Индекс</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers
                      .slice()
                      .sort((a, b) => b.engagement - a.engagement)
                      .map((m) => (
                        <tr key={m.id} className="border-b border-[color:var(--workspace-row-border)]">
                          <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{m.name}</td>
                          <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{SEGMENT_LABEL[m.segment]}</td>
                          <td className="px-2 py-2 text-[color:var(--workspace-text)]">{COMMUNITY_ROLE_LABEL[m.communityRole]}</td>
                          <td className="px-2 py-2 font-mono text-[11px] text-[color:var(--workspace-text-muted)]">{m.crmContactId}</td>
                          <td className="px-2 py-2 text-[color:var(--workspace-text)]">{m.company}</td>
                          <td className={m.lastActiveDays > 7 ? 'px-2 py-2 text-amber-300' : 'px-2 py-2 text-[color:var(--workspace-text)]'}>
                            {m.lastActiveDays === 0 ? 'сегодня' : `${m.lastActiveDays} дн.`}
                          </td>
                          <td className="px-2 py-2 text-[color:var(--workspace-text)]">{m.eventsYtd}</td>
                          <td className={m.engagement >= 70 ? 'px-2 py-2 text-emerald-300' : 'px-2 py-2 text-amber-300'}>{m.engagement}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">События</h2>
              </div>
              <div className="space-y-2">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2">
                    <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{event.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[color:var(--workspace-text-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="size-3.5" />
                        {event.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Radio className="size-3.5" />
                        {event.format === 'online' ? 'Онлайн' : event.city}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" />
                        {event.attendees}/{event.capacity}
                      </span>
                      <span className={event.status === 'planned' ? 'text-blue-300' : 'text-[color:var(--app-text-subtle)]'}>
                        {event.status === 'planned' ? 'Запланировано' : 'Проведено'}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <MessageSquare className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Лента</h2>
              </div>
              <ul className="space-y-2">
                {FEED.map((f) => (
                  <li key={f.id} className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]">
                    {f.text}
                    <span className="mt-1 block text-xs text-[color:var(--workspace-text-muted)]">{f.time}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Нужен контакт</h2>
              </div>
              <p className="mb-2 text-xs text-[color:var(--app-text-muted)]">Низкий индекс или давно не появлялись в сообществе.</p>
              <ul className="space-y-2">
                {lowEngagement.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]"
                  >
                    {m.name} · {m.company} · индекс {m.engagement}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
