import type { LucideIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  description?: string
  trendPercent?: number
  trendLabel?: string
  className?: string
}

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

export function StatCard({
  label,
  value,
  icon: Icon,
  description,
  trendPercent,
  trendLabel,
  className
}: StatCardProps) {
  const hasTrend = typeof trendPercent === 'number'
  const numericTrend = hasTrend ? trendPercent : 0
  const isPositive = numericTrend > 0
  const isNegative = numericTrend < 0

  const TrendIcon = isPositive ? TrendingUp : (isNegative ? TrendingDown : Minus)
  const trendTextColor = isPositive
    ? 'text-emerald-600'
    : isNegative
      ? 'text-rose-600'
      : 'text-slate-500'
  const formattedPercent = hasTrend ? `${numericTrend > 0 ? '+' : ''}${numericTrend}%` : null

  const cardContent = (
    <div className={cn('flex h-full min-h-[62px] flex-col items-center justify-center gap-1 text-center', className)}>
      <div className="flex min-w-0 items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
        <Icon className="size-3.5 shrink-0 stroke-[2.1px] text-slate-400" />
        <span className="truncate">{label}</span>
      </div>

      <div className="truncate text-[28px] font-semibold leading-none tracking-tight text-slate-900 sm:text-[30px]">
        {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
      </div>

      {description && (
        <p className="truncate text-[10px] font-medium leading-none text-slate-400">
          {description}
        </p>
      )}
    </div>
  )

  if (hasTrend && trendLabel && formattedPercent) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="block h-full w-full cursor-help">
            {cardContent}
          </div>
        </TooltipTrigger>
        <TooltipContent
          sideOffset={6}
          className="max-w-[220px] rounded-md border border-slate-200 bg-white px-2.5 py-2 text-center text-[11px] font-medium text-slate-900 shadow-md"
        >
          <div className="mb-1.5 flex items-center justify-center border-b border-slate-200 pb-1.5">
            <span className={cn('inline-flex items-center gap-1.5 text-[22px] font-bold leading-none', trendTextColor)}>
              <TrendIcon className="size-5 shrink-0 stroke-[2.5px]" />
              {formattedPercent}
            </span>
          </div>
          <p className="text-[11px] leading-tight text-slate-500 select-none">
            {trendLabel}
          </p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return <div className="block h-full w-full">{cardContent}</div>
}
