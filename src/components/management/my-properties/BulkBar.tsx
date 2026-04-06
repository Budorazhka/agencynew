import { Archive, Trash2 } from 'lucide-react'
import type { SaleStatus } from './types'

interface BulkBarProps {
  selectedCount: number
  onApply: (status: SaleStatus) => void
  onDeleteSelected: () => void
}

export function BulkBar({ selectedCount, onApply, onDeleteSelected }: BulkBarProps) {
  const hasSelection = selectedCount > 0

  if (!hasSelection) {
    return (
      <div className="flex items-center rounded-xl border border-[var(--green-border)] bg-[var(--green-deep)]/80 px-4 py-2.5 text-sm text-[color:var(--app-text-subtle)]">
        Отметьте объекты для массового управления
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[color:var(--hub-card-border)] bg-[var(--green-deep)] px-4 py-2.5 text-sm shadow-[inset_0_0_0_1px_rgba(201,168,76,0.06)]">
      <p className="font-semibold text-[color:var(--workspace-text)] min-w-0">
        Выбрано: {selectedCount} {selectedCount === 1 ? 'объект' : selectedCount < 5 ? 'объекта' : 'объектов'}
      </p>

      <div className="flex items-center gap-2 flex-wrap ml-auto">
        <span className="text-xs text-[color:var(--hub-stat-label)]">Назначить статус:</span>

        <button
          onClick={() => onApply('for_sale')}
          className="flex items-center gap-1.5 rounded-lg border border-[color:var(--hub-card-border)] bg-[rgba(0,0,0,0.2)] px-3 py-1.5 text-xs font-medium text-[color:var(--theme-accent-link-dim)] hover:bg-[var(--nav-item-bg-active)] hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--workspace-text)] transition-colors"
        >
          <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
          В продаже
        </button>

        <button
          onClick={() => onApply('booked')}
          className="flex items-center gap-1.5 rounded-lg border border-[color:var(--hub-card-border)] bg-[rgba(0,0,0,0.2)] px-3 py-1.5 text-xs font-medium text-[color:var(--theme-accent-link-dim)] hover:bg-[var(--nav-item-bg-active)] hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--workspace-text)] transition-colors"
        >
          <span className="size-2 rounded-full bg-amber-400 shrink-0" />
          Забронировано
        </button>

        <button
          onClick={() => onApply('sold')}
          className="flex items-center gap-1.5 rounded-lg border border-[color:var(--hub-card-border)] bg-[rgba(0,0,0,0.2)] px-3 py-1.5 text-xs font-medium text-[color:var(--theme-accent-link-dim)] hover:bg-[var(--nav-item-bg-active)] hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--workspace-text)] transition-colors"
        >
          <span className="size-2 rounded-full bg-orange-400 shrink-0" />
          Продано
        </button>

        <div className="w-px h-5 bg-[color:var(--hub-card-border)]" />

        <button
          onClick={() => onApply('archive')}
          className="flex items-center gap-1 rounded-lg border border-[color:var(--hub-card-border)] bg-[rgba(0,0,0,0.2)] px-3 py-1.5 text-xs font-medium text-[color:var(--theme-accent-icon-dim)] hover:text-[color:var(--theme-accent-link-dim)] hover:border-[color:var(--hub-card-border-hover)] transition-colors"
        >
          <Archive className="size-3.5" />
          Архивировать
        </button>

        <button
          onClick={onDeleteSelected}
          className="flex items-center gap-1 rounded-lg border border-red-500/25 bg-[rgba(0,0,0,0.2)] px-3 py-1.5 text-xs font-medium text-red-400/80 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300 transition-colors"
        >
          <Trash2 className="size-3.5" />
          Удалить
        </button>
      </div>
    </div>
  )
}
