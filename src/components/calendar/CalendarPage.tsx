import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, User, MapPin } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
  green: '#4ade80',
  red: '#f87171',
  blue: '#60a5fa',
  orange: '#fb923c',
}

interface CalEvent {
  id: string
  date: string
  time: string
  type: 'showing' | 'meeting' | 'call' | 'signing'
  title: string
  client?: string
  location?: string
  agentId: string
  agentName: string
  dealId?: string
}

const EVENT_TYPE_COLORS = {
  showing: C.blue,
  meeting: C.gold,
  call:    '#a78bfa',
  signing: C.green,
}
const EVENT_TYPE_LABELS = {
  showing: 'Показ',
  meeting: 'Встреча',
  call:    'Звонок',
  signing: 'Подписание',
}

const today = new Date()
const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const EVENTS: CalEvent[] = [
  {
    id: 'ev-1',
    date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate())),
    time: '11:00',
    type: 'showing',
    title: 'Показ ЖК Олимп, корп. 3',
    client: 'Иванов А.В.',
    location: 'ЖК Олимп, корп. 3',
    agentId: 'lm-1',
    agentName: 'Анна Первичкина',
    dealId: 'deal-1',
  },
  {
    id: 'ev-2',
    date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate())),
    time: '14:30',
    type: 'meeting',
    title: 'Встреча: переговоры по цене',
    client: 'Петров И.С.',
    location: 'Офис Садовая',
    agentId: 'lm-1',
    agentName: 'Анна Первичкина',
    dealId: 'deal-2',
  },
  {
    id: 'ev-3',
    date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)),
    time: '10:00',
    type: 'signing',
    title: 'Подписание договора задатка',
    client: 'Фролов Д.А.',
    location: 'Офис Садовая',
    agentId: 'lm-1',
    agentName: 'Анна Первичкина',
    dealId: 'deal-3',
  },
  {
    id: 'ev-4',
    date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
    time: '16:00',
    type: 'showing',
    title: 'Показ квартиры на Садовой',
    client: 'Кузнецова Н.В.',
    location: 'ул. Садовая, 12',
    agentId: 'u3',
    agentName: 'Дмитрий Коваль',
  },
  {
    id: 'ev-5',
    date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)),
    time: '09:30',
    type: 'call',
    title: 'Звонок: квалификация',
    client: 'Белова О.Н.',
    agentId: 'u3',
    agentName: 'Дмитрий Коваль',
  },
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfWeek(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1 // Mon=0..Sun=6
}


export function CalendarPage() {
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(fmt(today))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfWeek(year, month)

  const cells = Array.from({ length: firstDow + daysInMonth }, (_, i) => {
    if (i < firstDow) return null
    const day = i - firstDow + 1
    return `${year}-${pad(month + 1)}-${pad(day)}`
  })

  const eventsForDate = (date: string) => EVENTS.filter(e => e.date === date)
  const selectedEvents = eventsForDate(selectedDate)

  function prevMonth() { setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function nextMonth() { setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }

  const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
  const DAY_NAMES = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

  return (
    <DashboardShell>
      <div style={{ padding: '24px 28px 40px', maxWidth: 1100, display: 'flex', gap: 20 }}>

        {/* Calendar grid */}
        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.white }}>
              {MONTH_NAMES[month]} {year}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={prevMonth}
                style={{ padding: '6px 10px', background: 'var(--green-card)', border: '1px solid var(--green-border)', borderRadius: 6, color: C.whiteLow, cursor: 'pointer' }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
                style={{ padding: '6px 12px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 6, color: C.gold, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
              >
                Сегодня
              </button>
              <button
                onClick={nextMonth}
                style={{ padding: '6px 10px', background: 'var(--green-card)', border: '1px solid var(--green-border)', borderRadius: 6, color: C.whiteLow, cursor: 'pointer' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Day names */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: C.whiteLow, textAlign: 'center' as const, padding: '4px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />
              const dayEvents = eventsForDate(date)
              const isToday = date === fmt(today)
              const isSelected = date === selectedDate
              const [, , d] = date.split('-')

              return (
                <div
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    minHeight: 60,
                    padding: '4px 6px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(201,168,76,0.12)' : isToday ? 'rgba(255,255,255,0.04)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(201,168,76,0.4)' : isToday ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div style={{
                    fontSize: 12,
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? C.gold : C.whiteMid,
                    marginBottom: 3,
                  }}>
                    {parseInt(d)}
                  </div>
                  {dayEvents.slice(0, 3).map(ev => (
                    <div
                      key={ev.id}
                      style={{
                        fontSize: 9,
                        padding: '1px 4px',
                        borderRadius: 3,
                        background: `${EVENT_TYPE_COLORS[ev.type]}20`,
                        color: EVENT_TYPE_COLORS[ev.type],
                        marginBottom: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                      }}
                    >
                      {ev.time} {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{ fontSize: 9, color: C.whiteLow }}>+{dayEvents.length - 3} ещё</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{
            background: 'var(--green-card)',
            border: '1px solid var(--green-border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--green-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </div>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: 5,
                color: C.gold,
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}>
                <Plus size={10} /> Создать
              </button>
            </div>

            {selectedEvents.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center' as const, color: C.whiteLow, fontSize: 12 }}>
                Событий нет
              </div>
            ) : (
              <div style={{ padding: '8px 0' }}>
                {selectedEvents.map(ev => (
                  <div key={ev.id} style={{
                    padding: '12px 16px',
                    borderLeft: `3px solid ${EVENT_TYPE_COLORS[ev.type]}`,
                    marginBottom: 4,
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: EVENT_TYPE_COLORS[ev.type], letterSpacing: '0.06em' }}>
                        {EVENT_TYPE_LABELS[ev.type]}
                      </span>
                      <span style={{ fontSize: 11, color: C.whiteLow, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} /> {ev.time}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: C.white, fontWeight: 500, marginBottom: 4 }}>{ev.title}</div>
                    {ev.client && (
                      <div style={{ fontSize: 11, color: C.whiteLow, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={10} /> {ev.client}
                      </div>
                    )}
                    {ev.location && (
                      <div style={{ fontSize: 11, color: C.whiteLow, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <MapPin size={10} /> {ev.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
