import { ChevronLeft } from 'lucide-react'
import { useDashboardBack } from '@/hooks/useDashboardBack'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

type Variant = 'header' | 'felt'

/**
 * Универсальная «Назад» (скрыта на `/dashboard`). Не ренерится, если вернуться некуда.
 */
export function DashboardBackButton({
  variant = 'header',
  className,
}: {
  variant?: Variant
  className?: string
}) {
  const back = useDashboardBack()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  if (!back) return null

  if (variant === 'felt') {
    return (
      <button
        type="button"
        onClick={back.goBack}
        className={cn(
          'inline-flex shrink-0 items-center gap-1 rounded-lg border border-[rgba(241,208,146,0.35)] bg-[rgba(22,15,8,0.75)] px-2 py-1 text-[11px] font-semibold text-[rgba(247,232,198,0.9)] transition-colors hover:bg-[rgba(51,35,18,0.66)] hover:text-[#fff1cb]',
          className,
        )}
        aria-label="Назад"
      >
        <ChevronLeft className="size-3.5 shrink-0 opacity-90" strokeWidth={2.25} />
        <span className="hidden sm:inline">Назад</span>
      </button>
    )
  }

  const btn = cn(
    'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors sm:gap-2 sm:px-3',
    isLight
      ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
      : 'text-emerald-100/85 hover:bg-emerald-900/35 hover:text-emerald-50',
  )

  return (
    <button type="button" onClick={back.goBack} className={cn(btn, className)} aria-label="Назад">
      <ChevronLeft className="size-[18px] shrink-0 opacity-90" strokeWidth={2} />
      <span className="max-w-[8rem] truncate sm:max-w-none">Назад</span>
    </button>
  )
}
