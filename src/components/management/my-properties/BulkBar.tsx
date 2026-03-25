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
      <div className="flex items-center rounded-xl border border-emerald-900/35 bg-[#0a1f1a]/80 px-4 py-2.5 text-sm text-emerald-100/50">
        Отметьте объекты для массового управления
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e6c364]/20 bg-[#0a1f1a] px-4 py-2.5 text-sm shadow-[inset_0_0_0_1px_rgba(201,168,76,0.06)]">
      <p className="font-semibold text-[#d0e8df] min-w-0">
        Выбрано: {selectedCount} {selectedCount === 1 ? 'объект' : selectedCount < 5 ? 'объекта' : 'объектов'}
      </p>

      <div className="flex items-center gap-2 flex-wrap ml-auto">
        <span className="text-xs text-[rgba(230,195,100,0.62)]">Назначить статус:</span>

        <button
          onClick={() => onApply('for_sale')}
          className="flex items-center gap-1.5 rounded-lg border border-[rgba(230,195,100,0.2)] bg-[rgba(0,0,0,0.2)] px-3 py-1.5 text-xs font-medium text-[rgba(230,195,100,0.85)] hover:bg-[rgba(230,195,100,0.1)] hover:border-[rgba(230,195,100,0.4)] hover:text-[#d0e8df] transition-colors"
        >
          <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
          В продаже
        </button>

        <button
          onClick={() => onApply('booked')}
          className="flex items-center gap-1.5 rounded-lg border border-[rgba(230,195,100,0.2)] bg-[rgba(0,0,0,0.2)] px-3 py-1.5 text-xs font-medium text-[rgba(230,195,100,0.85)] hover:bg-[rgba(230,195,100,0.1)] hover:border-[rgba(230,195,100,0.4)] hover:text-[#d0e8df] transition-colors"
        >
          <span className="size-2 rounded-full bg-amber-400 shrink-0" />
          Забронировано
        </button>

        <button
          onClick={() => onApply('sold')}
          className="flex items-center gap-1.5 rounded-lg border border-[rgba(230,195,100,0.2)] bg-[rgba(0,0,0,0.2)] px-3 py-1.5 text-xs font-medium text-[rgba(230,195,100,0.85)] hover:bg-[rgba(230,195,100,0.1)] hover:border-[rgba(230,195,100,0.4)] hover:text-[#d0e8df] transition-colors"
        >
          <span className="size-2 rounded-full bg-orange-400 shrink-0" />
          Продано
        </button>

        <div className="w-px h-5 bg-[rgba(230,195,100,0.15)]" />

        <button
          onClick={() => onApply('archive')}
          className="flex items-center gap-1 rounded-lg border border-[rgba(230,195,100,0.15)] bg-[rgba(0,0,0,0.2)] px-3 py-1.5 text-xs font-medium text-[rgba(230,195,100,0.5)] hover:text-[rgba(230,195,100,0.8)] hover:border-[rgba(230,195,100,0.3)] transition-colors"
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
