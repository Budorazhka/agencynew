import { cn } from '@/lib/utils'
import type { SaleStatus, ConditionState } from './types'

// ─── Sale Status ─────────────────────────────────────────────────────────────
// Dark-compatible felt theme colors

const saleStatusMap: Record<SaleStatus, { label: string; className: string }> = {
  for_sale:   { label: 'В продаже',     className: 'text-emerald-400 bg-emerald-500/12 border-emerald-500/30' },
  booked:     { label: 'Забронировано', className: 'text-amber-400  bg-amber-500/12  border-amber-500/30' },
  sold:       { label: 'Продано',       className: 'text-orange-400 bg-orange-500/12 border-orange-500/30' },
  moderation: { label: 'На модерации',  className: 'text-sky-300 bg-sky-500/12 border-sky-500/30' },
  draft:      { label: 'Черновик',      className: 'text-[rgba(242,207,141,0.5)] bg-[rgba(242,207,141,0.07)] border-[rgba(242,207,141,0.2)]' },
  archive:    { label: 'Архив',         className: 'text-blue-400   bg-transparent border-0' },
}

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  const cfg = saleStatusMap[status]
  if (status === 'archive') {
    return (
      <span className="text-sm font-medium text-blue-400 cursor-pointer hover:underline">
        {cfg.label}
      </span>
    )
  }
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
      cfg.className,
    )}>
      {cfg.label}
    </span>
  )
}

// ─── Condition State ──────────────────────────────────────────────────────────

const conditionMap: Record<ConditionState, { label: string; icon: string; className: string }> = {
  needs_update:    {
    label: 'Нужно обновить',
    icon: '↺',
    className: 'text-red-400 bg-red-500/12 border-red-500/30',
  },
  needs_attention: {
    label: 'Требует внимания',
    icon: '⚠',
    className: 'text-amber-400 bg-amber-500/12 border-amber-500/30',
  },
  up_to_date: {
    label: 'Актуально',
    icon: '✓',
    className: 'text-emerald-400 bg-emerald-500/12 border-emerald-500/30',
  },
}

export function ConditionBadge({ state }: { state: ConditionState }) {
  const cfg = conditionMap[state]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
      cfg.className,
    )}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}
