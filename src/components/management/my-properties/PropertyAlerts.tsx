import { cn } from '@/lib/utils'

export type AlertFilter =
  | 'up_to_date'
  | 'needs_attention'
  | 'needs_update'
  | 'draft'
  | 'archive'
  | null

interface Chip {
  key: Exclude<AlertFilter, null>
  label: string
  count: number
  colorClass: string
  activeClass: string
  dotClass: string
}

interface PropertyAlertsProps {
  upToDate: number
  needsAttention: number
  needsUpdate: number
  drafts: number
  archived: number
  activeFilter: AlertFilter
  onFilterChange: (f: AlertFilter) => void
}

export function PropertyAlerts({
  upToDate,
  needsAttention,
  needsUpdate,
  drafts,
  archived,
  activeFilter,
  onFilterChange,
}: PropertyAlertsProps) {
  const chips: Chip[] = [
    {
      key: 'up_to_date',
      label: 'Актуально',
      count: upToDate,
      colorClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
      activeClass: 'ring-2 ring-emerald-400/50 ring-offset-1',
      dotClass: 'bg-emerald-500',
    },
    {
      key: 'needs_attention',
      label: 'Требуют внимания',
      count: needsAttention,
      colorClass: 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
      activeClass: 'ring-2 ring-amber-400/50 ring-offset-1',
      dotClass: 'bg-amber-500',
    },
    {
      key: 'needs_update',
      label: 'Нужно обновить',
      count: needsUpdate,
      colorClass: 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20',
      activeClass: 'ring-2 ring-red-400/50 ring-offset-1',
      dotClass: 'bg-red-500',
    },
    {
      key: 'draft',
      label: 'Черновики',
      count: drafts,
      colorClass: 'border-[color:var(--hub-card-border)] bg-[var(--hub-action-hover)] text-[color:var(--hub-desc)] hover:bg-[var(--hub-tile-icon-bg)]',
      activeClass: 'ring-2 ring-[color-mix(in_srgb,var(--gold)_40%,transparent)] ring-offset-1',
      dotClass: 'bg-[color-mix(in_srgb,var(--gold)_50%,transparent)]',
    },
    {
      key: 'archive',
      label: 'В архиве',
      count: archived,
      colorClass: 'border-blue-500/25 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
      activeClass: 'ring-2 ring-blue-400/50 ring-offset-1',
      dotClass: 'bg-blue-400',
    },
  ]

  return (
    <div className="rounded-xl border border-[color:var(--gold)]/15 bg-[#0a1f1a] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(201,168,76,0.06)]">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="mr-1 shrink-0 text-xs font-semibold uppercase tracking-wide text-[color:var(--theme-accent-heading)]/80">
          Обзор:
        </span>
        {chips.map((chip) => {
          const isActive = activeFilter === chip.key
          return (
            <button
              key={chip.key}
              onClick={() => onFilterChange(isActive ? null : chip.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                chip.colorClass,
                isActive && chip.activeClass,
                chip.count === 0 && 'opacity-40 pointer-events-none',
              )}
            >
              <span className={cn('size-1.5 rounded-full shrink-0', chip.dotClass)} />
              {chip.count} {chip.label}
            </button>
          )
        })}
        {activeFilter && (
          <button
            onClick={() => onFilterChange(null)}
            className="text-xs text-[color:var(--hub-stat-label)] underline underline-offset-2 hover:text-[color:var(--app-text-muted)] transition-colors"
          >
            сбросить
          </button>
        )}
      </div>
    </div>
  )
}
