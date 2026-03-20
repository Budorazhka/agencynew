import { AlertTriangle, X } from 'lucide-react'

interface AlertBannerProps {
  count: number
  onActualize: () => void
  onClose: () => void
}

export function AlertBanner({ count, onActualize, onClose }: AlertBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle className="size-4 shrink-0 text-amber-500" />
      <p className="flex-1 text-sm text-amber-800">
        <span className="font-semibold">{count} объектов</span> требуют подтверждения актуальности
      </p>
      <button
        onClick={onActualize}
        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors underline underline-offset-2"
      >
        Актуализировать
      </button>
      <button
        onClick={onClose}
        className="ml-1 rounded p-0.5 text-amber-400 hover:text-amber-600 transition-colors"
        aria-label="Закрыть"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
