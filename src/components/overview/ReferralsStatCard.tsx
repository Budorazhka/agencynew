import { Users } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface ReferralsStatCardProps {
  valueL1: number
  valueL2: number
  trendPercentL1?: number
  trendPercentL2?: number
  trendLabel?: string
  className?: string
}

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

function TrendBadge({ trendPercent, size = 'sm' }: { trendPercent: number; size?: 'sm' | 'lg' }) {
  const isPositive = trendPercent > 0
  const isNegative = trendPercent < 0
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus
  const trendTextColor = isPositive
    ? 'text-emerald-600'
    : isNegative
      ? 'text-rose-600'
      : 'text-slate-500'
  const formatted = `${trendPercent > 0 ? '+' : ''}${trendPercent}%`

  return (
    <span
      className={cn(
        size === 'lg'
          ? 'inline-flex items-center gap-1.5 whitespace-nowrap text-[20px] font-bold leading-none'
          : 'inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold leading-none',
        trendTextColor
      )}
    >
      <TrendIcon className={cn(size === 'lg' ? 'size-5 stroke-[2.6px]' : 'size-3 stroke-[2.3px]', 'shrink-0')} />
      {formatted}
    </span>
  )
}

export function ReferralsStatCard({
  valueL1,
  valueL2,
  trendPercentL1,
  trendPercentL2,
  trendLabel,
  className,
}: ReferralsStatCardProps) {
  const cardContent = (
    <div className={cn('flex h-full min-h-[62px] flex-col items-center justify-center gap-1 text-center', className)}>
      <div className="flex min-w-0 items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
        <Users className="size-3.5 shrink-0 stroke-[2.1px] text-slate-400" />
        <span className="truncate">Рефералы L1 / L2</span>
      </div>

      <div className="flex min-w-0 items-end justify-center gap-3">
        <div className="flex min-w-0 flex-col items-center gap-0.5">
          <span className="text-[10px] font-semibold uppercase leading-none tracking-wide text-slate-500">L1</span>
          <span className="truncate text-[26px] font-semibold leading-none tracking-tight text-slate-900">
            {valueL1.toLocaleString('ru-RU')}
          </span>
        </div>

        <span className="h-8 w-px shrink-0 bg-slate-200" />

        <div className="flex min-w-0 flex-col items-center gap-0.5">
          <span className="text-[10px] font-semibold uppercase leading-none tracking-wide text-slate-500">L2</span>
          <span className="truncate text-[26px] font-semibold leading-none tracking-tight text-slate-900">
            {valueL2.toLocaleString('ru-RU')}
          </span>
        </div>
      </div>

      <p className="truncate text-[10px] font-medium leading-none text-slate-400">
        Добавлено рефералов
      </p>
    </div>
  )

  if (trendLabel && (typeof trendPercentL1 === 'number' || typeof trendPercentL2 === 'number')) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="block h-full w-full cursor-help">{cardContent}</div>
        </TooltipTrigger>
        <TooltipContent
          sideOffset={6}
          className="max-w-[220px] rounded-md border border-slate-200 bg-white px-2.5 py-2 text-center text-[11px] font-medium text-slate-900 shadow-md"
        >
          <div className="grid grid-cols-2 gap-3 border-b border-slate-200 pb-1.5">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold uppercase leading-none text-slate-500">L1</span>
              {typeof trendPercentL1 === 'number' ? (
                <TrendBadge trendPercent={trendPercentL1} size="lg" />
              ) : (
                <span className="text-[20px] font-bold leading-none text-slate-400">—</span>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold uppercase leading-none text-slate-500">L2</span>
              {typeof trendPercentL2 === 'number' ? (
                <TrendBadge trendPercent={trendPercentL2} size="lg" />
              ) : (
                <span className="text-[20px] font-bold leading-none text-slate-400">—</span>
              )}
            </div>
          </div>
          <p className="pt-1.5 text-[11px] leading-tight text-slate-500 select-none">{trendLabel}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return <div className="block h-full w-full">{cardContent}</div>
}
