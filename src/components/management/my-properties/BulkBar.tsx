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
      <div className="flex items-center rounded-xl border border-[rgba(242,207,141,0.12)] bg-[rgba(0,0,0,0.15)] px-4 py-2.5 text-sm text-[rgba(242,207,141,0.55)]">
        Отметьте объекты для массового управления
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[rgba(242,207,141,0.25)] bg-[rgba(0,0,0,0.2)] px-4 py-2.5 text-sm">
      <p className="font-semibold text-[#fcecc8] min-w-0">
        Выбрано: {selectedCount} {selectedCount === 1 ? 'объект' : selectedCount < 5 ? 'объекта' : 'объектов'}
      </p>

      <div className="flex items-center gap-2 flex-wrap ml-auto">
        <span className="text-xs text-[rgba(242,207,141,0.62)]">Назначить статус:</span>

        <button
          onClick={() => onApply('for_sale')}
          className="flex items-center gap-1.5 rounded-lg border border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.2)] px-3 py-1.5 text-xs font-medium text-[rgba(242,207,141,0.85)] hover:bg-[rgba(242,207,141,0.1)] hover:border-[rgba(242,207,141,0.4)] hover:text-[#fcecc8] transition-colors"
        >
          <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
          В продаже
        </button>

        <button
          onClick={() => onApply('booked')}
          className="flex items-center gap-1.5 rounded-lg border border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.2)] px-3 py-1.5 text-xs font-medium text-[rgba(242,207,141,0.85)] hover:bg-[rgba(242,207,141,0.1)] hover:border-[rgba(242,207,141,0.4)] hover:text-[#fcecc8] transition-colors"
        >
          <span className="size-2 rounded-full bg-amber-400 shrink-0" />
          Забронировано
        </button>

        <button
          onClick={() => onApply('sold')}
          className="flex items-center gap-1.5 rounded-lg border border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.2)] px-3 py-1.5 text-xs font-medium text-[rgba(242,207,141,0.85)] hover:bg-[rgba(242,207,141,0.1)] hover:border-[rgba(242,207,141,0.4)] hover:text-[#fcecc8] transition-colors"
        >
          <span className="size-2 rounded-full bg-orange-400 shrink-0" />
          Продано
        </button>

        <div className="w-px h-5 bg-[rgba(242,207,141,0.15)]" />

        <button
          onClick={() => onApply('archive')}
          className="flex items-center gap-1 rounded-lg border border-[rgba(242,207,141,0.15)] bg-[rgba(0,0,0,0.2)] px-3 py-1.5 text-xs font-medium text-[rgba(242,207,141,0.5)] hover:text-[rgba(242,207,141,0.8)] hover:border-[rgba(242,207,141,0.3)] transition-colors"
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
