import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, Phone, Users } from 'lucide-react'
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

function calendarCellIcon(type: string) {
  switch (type) {
    case 'showing':
      return <Eye className="size-3 text-blue-300" />
    case 'call':
      return <Phone className="size-3 text-violet-300" />
    case 'meeting':
      return <Users className="size-3 text-[color:var(--workspace-cal-meeting-dot)]" />
    default:
      return null
  }
}

const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]
const DAY_NAMES = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

const WEEK_SLOTS = 42

type MiniCalendarProps = {
  /**
   * `workspace` — плотная сетка на 6 недель, ячейки делят высоту (весь месяц в кадре).
   * `default` — прежний компактный вид с фиксированной минимальной высотой ячеек.
   */
  variant?: 'default' | 'workspace'
  /** Скрыть нижнюю ссылку «Полный календарь» (если ссылка снаружи) */
  hideFooterLink?: boolean
  /** Не показывать блок «События выбранного дня» под сеткой (например, меню снаружи) */
  hideDayPanel?: boolean
  /** Контролируемая выбранная дата `YYYY-MM-DD` */
  selectedDate?: string
  onSelectedDateChange?: (dateIso: string) => void
  /** Повторный выбор текущего календарного дня «сегодня» (вторая активация той же даты) */
  onTodayReactivate?: () => void
}

/** Компактный календарь для виджета рабочего стола. */
export function MiniCalendar({
  variant = 'default',
  hideFooterLink = false,
  hideDayPanel = false,
  selectedDate: selectedDateProp,
  onSelectedDateChange,
  onTodayReactivate,
}: MiniCalendarProps) {
  const isWorkspace = variant === 'workspace'
  const today = useMemo(() => new Date(), [])
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const todayStr = fmt(today)

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [uncontrolledSelected, setUncontrolledSelected] = useState(todayStr)
  const isSelControlled = selectedDateProp !== undefined
  const selectedDate = isSelControlled ? selectedDateProp : uncontrolledSelected

  function selectDate(dateIso: string) {
    const duplicateToday = dateIso === todayStr && selectedDate === dateIso
    if (!isSelControlled) setUncontrolledSelected(dateIso)
    onSelectedDateChange?.(dateIso)
    if (duplicateToday) onTodayReactivate?.()
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfWeek(year, month)

  const cellsBase: (string | null)[] = []
  for (let i = 0; i < firstDow; i++) cellsBase.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cellsBase.push(`${year}-${pad(month + 1)}-${pad(day)}`)
  }
  const cells: (string | null)[] = isWorkspace
    ? (() => {
        const c = [...cellsBase]
        while (c.length < WEEK_SLOTS) c.push(null)
        return c
      })()
    : cellsBase

  const eventsForDate = (date: string) => CALENDAR_EVENTS_MOCK.filter((e) => e.date === date)
  const selectedEvents = eventsForDate(selectedDate)

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }
  function goThisMonth() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
    selectDate(todayStr)
  }

  const cellMinH = isWorkspace ? '' : 'min-h-[56px]'
  const dayNumClass = isWorkspace
    ? 'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-normal leading-none'
    : 'flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium leading-none'
  const headerMonthClass = isWorkspace
    ? 'text-sm font-normal tracking-tight text-[color:var(--workspace-text)] sm:text-base'
    : 'text-sm font-bold tracking-tight text-[color:var(--workspace-text)]'
  const dowClass = isWorkspace
    ? 'text-center text-[11px] font-normal uppercase tracking-wider text-[color:var(--workspace-text-dim)]'
    : 'text-center text-[9px] font-semibold uppercase tracking-wider text-[color:var(--workspace-text-dim)]'

  return (
    <div
      className={cn(
        'flex flex-col',
        isWorkspace
          ? 'h-full min-h-0 w-full min-w-0 flex-1'
          : 'min-h-0 flex-1',
      )}
    >
      <div className={cn('flex shrink-0 items-center justify-between gap-1.5', isWorkspace ? 'mb-0.5' : 'mb-3')}>
        <div className={cn('min-w-0', headerMonthClass)}>
          {MONTH_NAMES[month]} <span className="text-[color:var(--workspace-cal-accent)]">{year}</span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={prevMonth}
            className={cn(
              'rounded-md border border-[color:var(--hub-card-border)] bg-[var(--workspace-cal-nav-bg)] text-[color:var(--workspace-text-muted)] transition-colors hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--theme-accent-link)]',
              isWorkspace ? 'p-0.5' : 'p-1',
            )}
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className={cn(isWorkspace ? 'size-3' : 'size-4')} />
          </button>
          <button
            type="button"
            onClick={goThisMonth}
            className={cn(
              'rounded-md border border-[color:var(--workspace-cal-chip-border)] bg-[var(--workspace-cal-chip-bg)] uppercase tracking-wider text-[color:var(--workspace-cal-chip-text)]',
              isWorkspace ? 'px-1.5 py-px text-[9px] font-normal' : 'px-2 py-0.5 text-[10px] font-bold',
            )}
          >
            Сегодня
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className={cn(
              'rounded-md border border-[color:var(--hub-card-border)] bg-[var(--workspace-cal-nav-bg)] text-[color:var(--workspace-text-muted)] transition-colors hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--theme-accent-link)]',
              isWorkspace ? 'p-0.5' : 'p-1',
            )}
            aria-label="Следующий месяц"
          >
            <ChevronRight className={cn(isWorkspace ? 'size-3' : 'size-4')} />
          </button>
        </div>
      </div>

      <div
        className={cn(
          'grid grid-cols-7 border-b border-[color:var(--workspace-cal-day-row-border)]',
          isWorkspace ? 'shrink-0 gap-0.5 pb-0.5' : 'gap-0.5 pb-0.5 pb-1',
        )}
      >
        {DAY_NAMES.map((d) => (
          <div key={d} className={dowClass}>
            {d}
          </div>
        ))}
      </div>

      <div
        className={cn(
          'grid min-h-0 grid-cols-7',
          isWorkspace
            ? 'flex-1 gap-0.5 pt-0.5 lg:min-h-0'
            : 'min-h-0 flex-1 gap-0.5 pt-1',
        )}
        style={isWorkspace ? { gridTemplateRows: 'repeat(6, minmax(0, 1fr))' } : undefined}
      >
        {cells.map((date, i) => {
          if (!date) {
            return (
              <div
                key={`e-${i}`}
                className={cn(
                  isWorkspace ? 'min-h-0 rounded-md' : 'min-h-[56px] rounded-md',
                )}
              />
            )
          }
          const dayEvents = eventsForDate(date)
          const isToday = date === todayStr
          const isSelected = date === selectedDate
          const [, , d] = date.split('-')
          return (
            <button
              key={date}
              type="button"
              onClick={() => selectDate(date)}
              className={cn(
                'grid min-h-0 border text-center transition-colors',
                isWorkspace
                  ? 'h-full min-h-0 w-full min-w-0 grid-rows-[1fr_auto] overflow-hidden rounded-lg border p-1'
                  : cn('grid grid-rows-[1fr_auto] rounded-md p-0.5', cellMinH),
                isSelected
                  ? 'border-[color:var(--hub-card-border-hover)] bg-[var(--hub-tile-icon-bg)]'
                  : isToday
                    ? 'border-[color:var(--hub-tile-icon-border)] bg-[var(--workspace-cal-cell-fill)]'
                    : 'border-transparent hover:bg-[var(--workspace-cal-cell-fill)]',
              )}
            >
              <span
                className={cn(
                  dayNumClass,
                  'place-self-center',
                  isToday
                    ? cn(
                        'bg-[color:var(--workspace-cal-today-bg)] text-[color:var(--workspace-cal-today-fg)]',
                        isWorkspace ? 'font-normal' : 'font-bold',
                      )
                    : 'text-[color:var(--workspace-text)] opacity-85',
                )}
              >
                {parseInt(d, 10)}
              </span>
              <div className="flex min-h-0 w-full flex-wrap content-end justify-center gap-0.5 self-end pb-px">
                {dayEvents
                  .map((ev) => ({ ev, icon: calendarCellIcon(ev.type) }))
                  .filter((x) => x.icon != null)
                  .slice(0, isWorkspace ? 3 : 4)
                  .map(({ ev, icon }) => (
                    <span
                      key={ev.id}
                      className="flex size-3.5 items-center justify-center"
                      title={`${ev.time} ${ev.title}`}
                    >
                      {icon}
                    </span>
                  ))}
              </div>
            </button>
          )
        })}
      </div>

      {!hideDayPanel ? (
        <div
          className={cn(
            'flex-shrink-0 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)]',
            isWorkspace ? 'mt-1.5 w-full p-2' : 'mt-3 min-h-[72px] p-2',
          )}
        >
          <div
            className={cn(
              'uppercase tracking-wider text-[color:var(--theme-accent-link-dim)]',
              isWorkspace ? 'mb-0.5 text-[10px] font-normal' : 'mb-1.5 text-[10px] font-bold',
            )}
          >
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('ru-RU', {
              weekday: 'short',
              day: 'numeric',
              month: 'long',
            })}
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-[10px] text-[color:var(--workspace-text-dim)]">Нет событий</p>
          ) : (
            <ul
              className={cn(
                'space-y-0.5',
                !isWorkspace && 'max-h-[56px] overflow-y-auto pr-0.5',
              )}
            >
              {(isWorkspace ? selectedEvents.slice(0, 2) : selectedEvents).map((ev) => (
                <li
                  key={ev.id}
                  className={cn(
                    'text-[color:var(--workspace-text-muted)]',
                    isWorkspace ? 'line-clamp-2 text-[10px] leading-snug' : 'truncate text-[11px] leading-tight',
                  )}
                >
                  <span className="text-[color:var(--theme-accent-link)]">{ev.time}</span> · {ev.title}
                </li>
              ))}
              {isWorkspace && selectedEvents.length > 2 ? (
                <li className="text-[9px] text-[color:var(--workspace-text-dim)]">
                  +ещё {selectedEvents.length - 2}
                </li>
              ) : null}
            </ul>
          )}
        </div>
      ) : null}

      {!hideFooterLink ? (
        <div className={cn(isWorkspace ? 'mt-1.5 text-center' : 'mt-2 text-right')}>
          <Link
            to="/dashboard/calendar"
            className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--theme-accent-link-dim)] underline-offset-2 hover:text-[color:var(--theme-accent-link)] hover:underline"
          >
            Полный календарь
          </Link>
        </div>
      ) : null}
    </div>
  )
}
