import { Fragment, useMemo, useState } from 'react'
import { Bell, Filter, Mail, MessageSquare, Smartphone } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
}

type Channel = 'push' | 'email' | 'telegram' | 'sms'

type EventRow = {
  key: string
  label: string
  group: string
  channels: Partial<Record<Channel, boolean>>
}

const CHANNELS: { key: Channel; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'push',     label: 'Push',     icon: <Bell size={12} />,          color: '#60a5fa' },
  { key: 'email',    label: 'Email',    icon: <Mail size={12} />,          color: '#c9a84c' },
  { key: 'telegram', label: 'Telegram', icon: <MessageSquare size={12} />, color: '#22d3ee' },
  { key: 'sms',      label: 'SMS',      icon: <Smartphone size={12} />,    color: '#a78bfa' },
]

const INITIAL_EVENTS: EventRow[] = [
  // Лиды
  { key: 'new_lead',          label: 'Новый лид поступил',         group: 'Лиды',    channels: { push: true,  email: true,  telegram: true,  sms: false } },
  { key: 'lead_sla_breach',   label: 'Просрочен SLA (>15 мин)',    group: 'Лиды',    channels: { push: true,  email: false, telegram: true,  sms: true  } },
  { key: 'lead_assigned',     label: 'Лид назначен вам',           group: 'Лиды',    channels: { push: true,  email: true,  telegram: false, sms: false } },
  // Сделки
  { key: 'deal_stage_change', label: 'Сделка перешла на новый этап', group: 'Сделки', channels: { push: true,  email: true,  telegram: false, sms: false } },
  { key: 'deal_lawyer_task',  label: 'Создана задача юристу',       group: 'Сделки', channels: { push: true,  email: true,  telegram: true,  sms: false } },
  { key: 'deal_closed',       label: 'Сделка закрыта (успех)',      group: 'Сделки', channels: { push: true,  email: true,  telegram: true,  sms: true  } },
  // Задачи
  { key: 'task_assigned',     label: 'Задача назначена вам',        group: 'Задачи', channels: { push: true,  email: true,  telegram: false, sms: false } },
  { key: 'task_overdue',      label: 'Задача просрочена',           group: 'Задачи', channels: { push: true,  email: false, telegram: true,  sms: false } },
  { key: 'task_completed',    label: 'Задача выполнена',            group: 'Задачи', channels: { push: false, email: false, telegram: false, sms: false } },
  // Брони
  { key: 'booking_expiring',  label: 'Бронь истекает (24ч)',        group: 'Брони',  channels: { push: true,  email: true,  telegram: true,  sms: true  } },
  { key: 'booking_rejected',  label: 'Бронь отклонена',             group: 'Брони',  channels: { push: true,  email: true,  telegram: false, sms: false } },
  // Система
  { key: 'new_employee',      label: 'Новый сотрудник добавлен',    group: 'Система', channels: { push: false, email: true,  telegram: false, sms: false } },
  { key: 'daily_digest',      label: 'Ежедневная сводка (08:00)',   group: 'Система', channels: { push: false, email: true,  telegram: true,  sms: false } },
]

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item)
    acc[k] = acc[k] ? [...acc[k], item] : [item]
    return acc
  }, {} as Record<string, T[]>)
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36, height: 20, borderRadius: 10,
        background: on ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)',
        border: `1px solid ${on ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.15)'}`,
        cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 2, left: on ? 17 : 2,
        width: 14, height: 14, borderRadius: '50%',
        background: on ? '#4ade80' : 'rgba(255,255,255,0.3)',
        transition: 'left 0.2s, background 0.2s',
      }} />
    </button>
  )
}

const GROUP_OPTIONS = ['Лиды', 'Сделки', 'Задачи', 'Брони', 'Система']

export function NotificationsSettingsPage() {
  const [events, setEvents] = useState<EventRow[]>(INITIAL_EVENTS)
  const [saved, setSaved] = useState(false)
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter((e) => {
      if (groupFilter !== 'all' && e.group !== groupFilter) return false
      if (q && !e.label.toLowerCase().includes(q)) return false
      return true
    })
  }, [events, groupFilter, query])

  const kpi = useMemo(() => {
    const withPush = filteredEvents.filter((e) => e.channels.push).length
    const withSms = filteredEvents.filter((e) => e.channels.sms).length
    const anyChannel = filteredEvents.filter((e) => Object.values(e.channels).some(Boolean)).length
    return { total: filteredEvents.length, withPush, withSms, anyChannel }
  }, [filteredEvents])

  function toggle(eventKey: string, channel: Channel) {
    setEvents(prev => prev.map(e =>
      e.key === eventKey
        ? { ...e, channels: { ...e.channels, [channel]: !e.channels[channel] } }
        : e
    ))
  }

  function toggleAll(channel: Channel, value: boolean) {
    setEvents(prev => prev.map(e => ({ ...e, channels: { ...e.channels, [channel]: value } })))
  }

  const groups = groupBy(filteredEvents, (e) => e.group)

  return (
    <DashboardShell>
      <div style={{ padding: '24px 28px 48px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 4 }}>Настройки уведомлений</div>
          <div style={{ fontSize: 12, color: C.whiteLow }}>Управляйте каналами доставки для каждого типа события</div>
        </div>

        <div className="mx-auto mb-5 max-w-6xl space-y-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Событий в списке</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.total}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">С push</p>
              <p className="text-xl font-bold text-blue-300">{kpi.withPush}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">С SMS</p>
              <p className="text-xl font-bold text-amber-300">{kpi.withSms}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Хотя бы 1 канал</p>
              <p className="text-xl font-bold text-emerald-300">{kpi.anyChannel}</p>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-2 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <span className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтр таблицы</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)] sm:max-w-xs"
              >
                <option value="all">Все группы</option>
                {GROUP_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по названию события…"
                className="min-w-0 flex-1 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)] placeholder:text-[color:var(--app-text-subtle)]"
              />
            </div>
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 11, color: C.whiteLow, fontWeight: 600, width: '40%' }}>
                  Событие
                </th>
                {CHANNELS.map(ch => (
                  <th key={ch.key} style={{ padding: '14px 10px', textAlign: 'center', minWidth: 90 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: ch.color }}>
                        {ch.icon} {ch.label}
                      </div>
                      <div style={{ display: 'flex', gap: 4, fontSize: 9, color: C.whiteLow }}>
                        <button onClick={() => toggleAll(ch.key, true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4ade80', fontSize: 9, padding: '1px 4px' }}>всё</button>
                        <span>/</span>
                        <button onClick={() => toggleAll(ch.key, false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 9, padding: '1px 4px' }}>ничего</button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groups).map(([group, rows]) => (
                <Fragment key={group}>
                  <tr>
                    <td colSpan={5} style={{
                      padding: '10px 18px 6px', fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: C.gold, background: 'rgba(201,168,76,0.04)',
                      borderTop: `1px solid ${C.border}`,
                    }}>
                      {group}
                    </td>
                  </tr>
                  {rows.map((event, i) => (
                    <tr key={event.key} style={{ borderBottom: i < rows.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                      <td style={{ padding: '12px 18px', fontSize: 12, color: C.whiteMid }}>{event.label}</td>
                      {CHANNELS.map(ch => (
                        <td key={ch.key} style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Toggle on={!!event.channels[ch.key]} onClick={() => toggle(event.key, ch.key)} />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
            style={{
              padding: '10px 28px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: saved ? 'rgba(74,222,128,0.15)' : 'rgba(201,168,76,0.15)',
              border: `1px solid ${saved ? 'rgba(74,222,128,0.4)' : 'rgba(201,168,76,0.4)'}`,
              color: saved ? '#4ade80' : C.gold, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {saved ? '✓ Сохранено' : 'Сохранить настройки'}
          </button>
        </div>
      </div>
    </DashboardShell>
  )
}
