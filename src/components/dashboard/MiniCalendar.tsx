import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CALENDAR_EVENTS_MOCK } from '@/data/calendar-events-mock'
import { cn } from '@/lib/utils'

const pad = (n: number) => String(n).padStart(2, '0')

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfWeek(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

const EVENT_DOT: Record<string, string> = {
  showing: 'bg-blue-400',
  meeting: 'bg-[#e6c364]',
  call: 'bg-violet-400',
  signing: 'bg-emerald-400',
}

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const DAY_NAMES = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

/** Компактный календарь для виджета рабочего стола. */
export function MiniCalendar() {
  const today = useMemo(() => new Date(), [])
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const todayStr = fmt(today)

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(todayStr)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfWeek(year, month)

  const cells = Array.from({ length: firstDow + daysInMonth }, (_, i) => {
    if (i < firstDow) return null
    const day = i - firstDow + 1
    return `${year}-${pad(month + 1)}-${pad(day)}`
  })

  const eventsForDate = (date: string) => CALENDAR_EVENTS_MOCK.filter(e => e.date === date)
  const selectedEvents = eventsForDate(selectedDate)

  function prevMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function nextMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }
  function goThisMonth() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(todayStr)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0 text-sm font-bold tracking-tight text-[color:var(--workspace-text)]">
          {MONTH_NAMES[month]} <span className="text-[#e6c364]">{year}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-md border border-[color:var(--hub-card-border)] bg-[var(--workspace-cal-nav-bg)] p-1.5 text-[color:var(--workspace-text-muted)] transition-colors hover:border-[#e6c364]/40 hover:text-[#e6c364]"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goThisMonth}
            className="rounded-md border border-[rgba(230,195,100,0.35)] bg-[rgba(230,195,100,0.08)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#e6c364]"
          >
            Сегодня
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-md border border-[color:var(--hub-card-border)] bg-[var(--workspace-cal-nav-bg)] p-1.5 text-[color:var(--workspace-text-muted)] transition-colors hover:border-[#e6c364]/40 hover:text-[#e6c364]"
            aria-label="Следующий месяц"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 border-b border-[color:var(--workspace-cal-day-row-border)] pb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[9px] font-semibold uppercase tracking-wider text-[color:var(--workspace-text-dim)]">
            {d}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 gap-0.5 pt-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="min-h-[52px]" />
          const dayEvents = eventsForDate(date)
          const isToday = date === todayStr
          const isSelected = date === selectedDate
          const [, , d] = date.split('-')
          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={cn(
                'flex min-h-[52px] flex-col items-stretch rounded-md border p-0.5 text-left transition-colors',
                isSelected
                  ? 'border-[rgba(230,195,100,0.45)] bg-[rgba(230,195,100,0.1)]'
                  : isToday
                    ? 'border-[rgba(230,195,100,0.25)] bg-[var(--workspace-cal-cell-fill)]'
                    : 'border-transparent hover:bg-[var(--workspace-cal-cell-fill)]',
              )}
            >
              <span
                className={cn(
                  'mb-0.5 flex size-6 items-center justify-center rounded-full text-[11px] font-medium',
                  isToday ? 'bg-[#e6c364] font-bold text-[#241a00]' : 'text-[color:var(--workspace-text)] opacity-85',
                )}
              >
                {parseInt(d, 10)}
              </span>
              <div className="flex flex-wrap gap-px">
                {dayEvents.slice(0, 4).map(ev => (
                  <span key={ev.id} className={cn('size-1.5 rounded-full', EVENT_DOT[ev.type] ?? 'bg-[var(--workspace-cal-dot-fallback)]')} title={`${ev.time} ${ev.title}`} />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-3 min-h-[72px] flex-shrink-0 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#e6c364]/80">
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })}
        </div>
        {selectedEvents.length === 0 ? (
          <p className="text-[11px] text-[color:var(--workspace-text-dim)]">Нет событий</p>
        ) : (
          <ul className="max-h-[56px] space-y-1 overflow-y-auto pr-1">
            {selectedEvents.map(ev => (
              <li key={ev.id} className="truncate text-[11px] leading-tight text-[color:var(--workspace-text-muted)]">
                <span className="text-[#e6c364]/90">{ev.time}</span> · {ev.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-2 text-right">
        <Link
          to="/dashboard/calendar"
          className="text-[10px] font-semibold uppercase tracking-wider text-[#e6c364]/70 underline-offset-2 hover:text-[#e6c364] hover:underline"
        >
          Полный календарь
        </Link>
      </div>
    </div>
  )
}
