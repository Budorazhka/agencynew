import { CalendarClock, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CALENDAR_EVENTS_MOCK } from '@/data/calendar-events-mock'
import { cn } from '@/lib/utils'

export function formatWorkspaceDayShort(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

type TriggerProps = {
  dateIso: string
  className?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Кнопка «Мероприятия»; раскрытый список показывается снаружи (оверлей на виджет планов). */
export function WorkspaceDayEventsMenu({ dateIso, className, open, onOpenChange }: TriggerProps) {
  const events = CALENDAR_EVENTS_MOCK.filter((e) => e.date === dateIso)

  return (
    <div className={cn('flex flex-col', className)}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={cn(
          'flex w-full items-center justify-center gap-1.5 rounded-md border border-[color:var(--workspace-row-border)]',
          'bg-[var(--workspace-row-bg)]/80 px-2 py-1.5 text-left text-[10px] font-normal text-[color:var(--workspace-text)]',
          'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition-colors',
          'hover:border-[color:var(--hub-card-border-hover)] hover:bg-[var(--workspace-row-bg)]',
          open && 'border-[color:var(--hub-card-border-hover)] bg-[var(--nav-item-bg-active)]',
          'outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--gold)_35%,transparent)]',
        )}
      >
        <CalendarClock className="size-3.5 shrink-0 text-[color:var(--theme-accent-link-dim)]" strokeWidth={2} />
        <span className="min-w-0 flex-1 truncate">
          Мероприятия · {formatWorkspaceDayShort(dateIso)}
        </span>
        <span className="shrink-0 tabular-nums text-[10px] font-normal text-[color:var(--workspace-text-muted)]">
          {events.length}
        </span>
        <ChevronDown
          className={cn('size-3 shrink-0 text-[color:var(--workspace-text-dim)] transition-transform', open && 'rotate-180')}
        />
      </button>
    </div>
  )
}

type PanelProps = {
  dateIso: string
  className?: string
}

/** Содержимое полноэкранного (в пределах виджета планов) списка мероприятий дня. */
export function WorkspaceDayEventsPanel({ dateIso, className }: PanelProps) {
  const events = CALENDAR_EVENTS_MOCK.filter((e) => e.date === dateIso)

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2', className)}>
      {events.length === 0 ? (
        <p className="flex flex-1 items-center justify-center px-2 py-6 text-center text-[13px] text-[color:var(--workspace-text-dim)]">
          Нет мероприятий в этот день
        </p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)]/50 px-3 py-2"
            >
              <p className="text-[13px] font-normal leading-snug text-[color:var(--workspace-text)]">
                <span className="font-normal text-[color:var(--theme-accent-link)]">{ev.time}</span> · {ev.title}
              </p>
              {ev.client ? (
                <p className="mt-1 text-[11px] text-[color:var(--workspace-text-dim)]">{ev.client}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <Link
        to="/dashboard/calendar"
        className="mt-2 shrink-0 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)]/40 py-2 text-center text-[11px] font-normal uppercase tracking-wider text-[color:var(--theme-accent-link-dim)] transition-colors hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--theme-accent-link)]"
      >
        Полный календарь
      </Link>
    </div>
  )
}
