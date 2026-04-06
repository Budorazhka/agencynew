import { cn } from '@/lib/utils'

export function UrgentMarkIcon({ active, inactiveColor = '#475569' }: { active: boolean; inactiveColor?: string }) {
  const color = active ? '#ff3b30' : inactiveColor

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3.5 shrink-0"
      fill={active ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  )
}

export function ImportantMarkIcon({ active, inactiveColor = '#475569' }: { active: boolean; inactiveColor?: string }) {
  const color = active ? '#f2a900' : inactiveColor

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3.5 shrink-0"
      fill={active ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  )
}

type EisenhowerVariant = 'light' | 'dark'

/** Чипы срочности и важности (как в истории общения по лиду / модуле задач) */
export function EisenhowerChips({
  urgent,
  important,
  onChangeUrgent,
  onChangeImportant,
  readOnly,
  variant = 'light',
}: {
  urgent: boolean
  important: boolean
  onChangeUrgent?: (v: boolean) => void
  onChangeImportant?: (v: boolean) => void
  readOnly?: boolean
  variant?: EisenhowerVariant
}) {
  const isInteractive = !readOnly && (onChangeUrgent != null || onChangeImportant != null)
  const iconMuted = variant === 'dark' ? '#94a3b8' : '#475569'

  const styles =
    variant === 'dark'
      ? {
          urgentActive: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
          urgentInactive: 'bg-[var(--dropdown-hover)] text-[color:var(--app-text-muted)] border-[var(--green-border)]',
          importantActive: 'bg-amber-500/12 text-[color:var(--theme-accent-heading)] border-amber-500/35',
          importantInactive: 'bg-[var(--dropdown-hover)] text-[color:var(--app-text-muted)] border-[var(--green-border)]',
          group: 'border-[var(--green-border)] bg-[var(--green-deep)]',
          borderInner: 'border-[var(--green-border)]',
          neutral: 'bg-[var(--dropdown-hover)] text-[color:var(--app-text)]',
          faded: 'bg-transparent text-[color:var(--app-text-subtle)]',
        }
      : {
          urgentActive: 'bg-rose-50 text-[#ff3b30] border-rose-200',
          urgentInactive: 'bg-slate-100 text-slate-700 border-slate-200',
          importantActive: 'bg-amber-50 text-[#f2a900] border-amber-200',
          importantInactive: 'bg-slate-100 text-slate-700 border-slate-200',
          group: 'border-slate-200 bg-white shadow-sm',
          borderInner: 'border-slate-200',
          neutral: 'bg-slate-50 text-slate-700',
          faded: 'bg-white text-slate-500',
        }

  if (readOnly) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border',
            urgent ? styles.urgentActive : styles.urgentInactive,
          )}
        >
          <UrgentMarkIcon active={urgent} inactiveColor={iconMuted} />
          {urgent ? 'Срочно' : 'Не срочно'}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border',
            important ? styles.importantActive : styles.importantInactive,
          )}
        >
          <ImportantMarkIcon active={important} inactiveColor={iconMuted} />
          {important ? 'Важно' : 'Не важно'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className={cn('flex rounded-lg overflow-hidden border', styles.group)}>
        <button
          type="button"
          onClick={() => onChangeUrgent?.(true)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-r',
            styles.borderInner,
            urgent ? styles.urgentActive : styles.neutral,
            isInteractive && 'hover:opacity-90 cursor-pointer',
          )}
        >
          <UrgentMarkIcon active inactiveColor={iconMuted} />
          Срочно
        </button>
        <button
          type="button"
          onClick={() => onChangeUrgent?.(false)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
            !urgent ? styles.urgentInactive : styles.faded,
            isInteractive && 'hover:opacity-90 cursor-pointer',
          )}
        >
          <UrgentMarkIcon active={false} inactiveColor={iconMuted} />
          Не срочно
        </button>
      </div>
      <div className={cn('flex rounded-lg overflow-hidden border', styles.group)}>
        <button
          type="button"
          onClick={() => onChangeImportant?.(true)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-r',
            styles.borderInner,
            important ? styles.importantActive : styles.neutral,
            isInteractive && 'hover:opacity-90 cursor-pointer',
          )}
        >
          <ImportantMarkIcon active inactiveColor={iconMuted} />
          Важно
        </button>
        <button
          type="button"
          onClick={() => onChangeImportant?.(false)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
            !important ? styles.importantInactive : styles.faded,
            isInteractive && 'hover:opacity-90 cursor-pointer',
          )}
        >
          <ImportantMarkIcon active={false} inactiveColor={iconMuted} />
          Не важно
        </button>
      </div>
    </div>
  )
}
