import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, User, MapPin } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { CALENDAR_EVENTS_MOCK } from '@/data/calendar-events-mock'

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
  green: '#4ade80',
  blue: '#60a5fa',
}

const EVENT_TYPE_COLORS = {
  showing: C.blue,
  meeting: C.gold,
  call: '#a78bfa',
  signing: C.green,
}

const EVENT_CHIP_BG: Record<keyof typeof EVENT_TYPE_COLORS, string> = {
  showing: 'rgba(96,165,250,0.18)',
  meeting: 'rgba(201,168,76,0.2)',
  call: 'rgba(167,139,250,0.2)',
  signing: 'rgba(74,222,128,0.16)',
}

const EVENT_TYPE_LABELS = {
  showing: 'Показ',
  meeting: 'Встреча',
  call: 'Звонок',
  signing: 'Подписание',
}

const today = new Date()
const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfWeek(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

/** Высота области — заполняет оставшееся пространство (хедер убран, кнопка назад ~40px) */
const VIEWPORT_H = 'calc(100vh - 40px)'

export function CalendarPage() {
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(fmt(today))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfWeek(year, month)

  const monthCells = useMemo(() => {
    const cells: (string | null)[] = []
    for (let i = 0; i < firstDow; i++) cells.push(null)
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(`${year}-${pad(month + 1)}-${pad(day)}`)
    }
    while (cells.length < 42) cells.push(null)
    return cells
  }, [year, month, firstDow, daysInMonth])

  const eventsForDate = (date: string) => CALENDAR_EVENTS_MOCK.filter(e => e.date === date)
  const selectedEvents = eventsForDate(selectedDate)

  function prevMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function nextMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }
  function goToday() {
    const t = new Date()
    setViewDate(new Date(t.getFullYear(), t.getMonth(), 1))
    setSelectedDate(fmt(t))
  }

  const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  function cellBackground(isSelected: boolean, isToday: boolean, isWeekend: boolean) {
    if (isSelected) return 'rgba(201,168,76,0.16)'
    if (isToday) return 'rgba(201,168,76,0.08)'
    if (isWeekend) return 'rgba(255,255,255,0.03)'
    return 'rgba(255,255,255,0.02)'
  }

  return (
    <DashboardShell topBack={{ label: 'Назад', route: '/dashboard' }}>
      <div
        style={{
          height: VIEWPORT_H,
          maxHeight: VIEWPORT_H,
          width: '100%',
          boxSizing: 'border-box',
          padding: '12px 16px 14px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Две колонки: сетка + выбранный день — на одну высоту экрана */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'row',
            gap: 14,
            alignItems: 'stretch',
            overflow: 'hidden',
          }}
        >
          {/* Левая: месяц */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                {MONTH_NAMES[month]} <span style={{ color: 'var(--gold)' }}>{year}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={prevMonth}
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(15,35,30,0.85)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    color: 'rgba(240,253,244,0.85)',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={goToday}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(201,168,76,0.14)',
                    border: '1px solid rgba(201,168,76,0.45)',
                    borderRadius: 8,
                    color: 'var(--gold)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Сегодня
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(15,35,30,0.85)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    color: 'rgba(240,253,244,0.85)',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 4,
                marginBottom: 6,
                flexShrink: 0,
              }}
            >
              {DAY_NAMES.map(d => (
                <div
                  key={d}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase' as const,
                    color: 'rgba(208,232,223,0.5)',
                    textAlign: 'center' as const,
                    padding: '4px 2px',
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Ровно 6 недель — строки делят высоту поровну */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(6, minmax(0, 1fr))',
                gap: 3,
              }}
            >
              {monthCells.map((date, i) => {
                if (!date) {
                  return <div key={`e-${i}`} style={{ minHeight: 0, borderRadius: 8, background: 'rgba(0,0,0,0.12)' }} />
                }
                const dayEvents = eventsForDate(date)
                const isToday = date === fmt(today)
                const isSelected = date === selectedDate
                const [, , d] = date.split('-')
                const weekday = new Date(`${date}T12:00:00`).getDay()
                const isWeekend = weekday === 0 || weekday === 6
                const show = dayEvents.slice(0, 2)

                return (
                  <div
                    key={date}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedDate(date)
                      }
                    }}
                    onClick={() => setSelectedDate(date)}
                    style={{
                      minHeight: 0,
                      minWidth: 0,
                      padding: '6px 5px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: cellBackground(isSelected, isToday, isWeekend),
                      border: `1px solid ${isSelected ? 'rgba(201,168,76,0.5)' : isToday ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.07)'}`,
                      transition: 'background 0.12s, border-color 0.12s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      overflow: 'hidden',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      if (!isSelected) el.style.background = 'rgba(201,168,76,0.07)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      el.style.background = cellBackground(isSelected, isToday, isWeekend)
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'flex-start',
                        minWidth: 22,
                        height: 22,
                        padding: '0 5px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: isToday ? 800 : 600,
                        color: isToday ? '#1a1400' : 'rgba(240,253,244,0.92)',
                        background: isToday ? 'var(--gold)' : 'transparent',
                        border: isToday ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        flexShrink: 0,
                      }}
                    >
                      {parseInt(d, 10)}
                    </span>
                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                      {show.map(ev => (
                        <div
                          key={ev.id}
                          title={`${ev.time} — ${ev.title}`}
                          style={{
                            fontSize: 9,
                            lineHeight: 1.25,
                            padding: '3px 5px',
                            borderRadius: 4,
                            borderLeft: `2px solid ${EVENT_TYPE_COLORS[ev.type]}`,
                            background: EVENT_CHIP_BG[ev.type],
                            color: 'rgba(240,253,244,0.95)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap' as const,
                          }}
                        >
                          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{ev.time}</span>{' '}
                          {ev.title}
                        </div>
                      ))}
                    </div>
                    {dayEvents.length > 2 && (
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(201,168,76,0.85)', flexShrink: 0 }}>
                        +{dayEvents.length - 2}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Правая: выбранный день — та же высота, скролл только у списка */}
          <aside
            style={{
              width: 300,
              maxWidth: '34vw',
              flexShrink: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(15,35,30,0.95)',
                border: '1px solid rgba(230,195,100,0.22)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase' as const,
                      color: 'rgba(201,168,76,0.85)',
                      marginBottom: 3,
                    }}
                  >
                    Выбранный день
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#f0fdf4', lineHeight: 1.25 }}>
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('ru-RU', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: 8,
                    color: 'var(--gold)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Plus size={13} /> Создать
                </button>
              </div>

              {selectedEvents.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20,
                    color: 'rgba(208,232,223,0.45)',
                    fontSize: 13,
                    textAlign: 'center',
                  }}
                >
                  На этот день событий нет
                </div>
              ) : (
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    padding: '6px 0',
                  }}
                >
                  {selectedEvents.map(ev => (
                    <div
                      key={ev.id}
                      style={{
                        padding: '10px 14px',
                        borderLeft: `3px solid ${EVENT_TYPE_COLORS[ev.type]}`,
                        marginBottom: 2,
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: 'rgba(0,17,13,0.2)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: EVENT_TYPE_COLORS[ev.type],
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase' as const,
                          }}
                        >
                          {EVENT_TYPE_LABELS[ev.type]}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: 'var(--gold)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            flexShrink: 0,
                          }}
                        >
                          <Clock size={12} /> {ev.time}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: '#f0fdf4', fontWeight: 600, marginBottom: 6, lineHeight: 1.35 }}>
                        {ev.title}
                      </div>
                      {ev.client && (
                        <div style={{ fontSize: 12, color: 'rgba(208,232,223,0.7)', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <User size={12} /> {ev.client}
                        </div>
                      )}
                      {ev.location && (
                        <div
                          style={{
                            fontSize: 12,
                            color: 'rgba(208,232,223,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            marginTop: 4,
                          }}
                        >
                          <MapPin size={12} /> {ev.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </DashboardShell>
  )
}
