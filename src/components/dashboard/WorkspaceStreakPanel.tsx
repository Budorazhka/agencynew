import { Check, Flame, HelpCircle, Sparkles } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { DeskStreakMock } from '@/data/home-workspace-mock'

type Props = {
  streak: DeskStreakMock
  gamificationHint: string
  className?: string
  /** Компактный вид для блока рядом с календарём */
  compact?: boolean
}

export function WorkspaceStreakPanel({ streak, gamificationHint, className, compact = false }: Props) {
  const xpPct = streak.xpToday.goal > 0 ? Math.min(100, (streak.xpToday.current / streak.xpToday.goal) * 100) : 0

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col rounded-xl border border-[#f59e0b]/35',
        'bg-gradient-to-b from-[#f97316]/[0.18] via-[#ea580c]/[0.08] to-transparent',
        compact
          ? 'max-h-full overflow-hidden p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-2.5',
        className,
      )}
    >
      {compact ? (
        <div className="mb-0.5 flex items-center gap-1.5">
          <div className="relative flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#fb923c] to-[#ea580c] shadow shadow-orange-900/30">
            <Flame className="size-3.5 text-white" strokeWidth={2.2} fill="rgba(255,255,255,0.25)" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1 gap-y-0">
              <span className="text-base font-black tabular-nums leading-none text-[#fff7ed]">{streak.currentStreak}</span>
              <span className="text-[7px] font-bold uppercase text-orange-100/75">дн</span>
              <span className="text-[7px] text-orange-100/55">·</span>
              <span className="text-[7px] text-orange-100/65">
                рек. <span className="font-semibold text-orange-100">{streak.bestStreak}</span>
              </span>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="-ml-0.5 shrink-0 rounded p-px text-orange-200/70 outline-none hover:text-orange-100 focus-visible:ring-1 focus-visible:ring-[#fbbf24]/50"
                    aria-label="Что такое серия"
                  >
                    <HelpCircle className="size-2.5" strokeWidth={2} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] text-balance" sideOffset={4}>
                  Дни подряд с целями; круги — неделя, ниже — цель дня и бонусы.
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="line-clamp-1 text-[7px] leading-tight text-orange-50/80">{streak.streakTagline}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-1.5 flex items-start gap-1.5">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#fb923c] to-[#ea580c] shadow-md shadow-orange-900/25 sm:size-11">
              <Flame className="size-6 text-white" strokeWidth={2.2} fill="rgba(255,255,255,0.25)" />
              <Sparkles className="absolute -right-0.5 -top-0.5 size-3 text-amber-200" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-start gap-1">
                <p className="text-xl font-black tabular-nums leading-none tracking-tight text-[#fff7ed] sm:text-2xl">
                  {streak.currentStreak}
                </p>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 rounded p-0.5 text-orange-200/70 outline-none hover:text-orange-100 focus-visible:ring-2 focus-visible:ring-[#fbbf24]/50"
                      aria-label="Что такое серия"
                    >
                      <HelpCircle className="size-3.5" strokeWidth={2} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-balance" sideOffset={6}>
                    Дни подряд с выполненными целями. Неделя и шкала — наглядный прогресс; бонусы подсказывают, что
                    усилить.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="mt-0.5 text-[9px] font-bold uppercase leading-tight tracking-wide text-orange-100/85">
                дней серии
              </p>
              <p className="mt-0.5 text-[8px] leading-snug text-orange-100/65">
                Рекорд: <span className="font-semibold text-orange-100">{streak.bestStreak}</span>
              </p>
            </div>
          </div>

          <p className="mb-1.5 line-clamp-2 text-[9px] font-semibold leading-snug text-orange-50/90">{streak.streakTagline}</p>
        </>
      )}

      <div className={compact ? 'mb-0.5' : 'mb-1.5'}>
        <p className={cn('mb-0.5 font-bold uppercase tracking-wider text-orange-200/80', compact ? 'text-[6px]' : 'text-[8px]')}>
          Неделя
        </p>
        <div className="flex justify-between gap-px sm:gap-0.5">
          {streak.slots.map((s, i) => (
            <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-px">
              <div
                className={cn(
                  'flex items-center justify-center rounded-full border transition-colors',
                  compact ? 'size-5 border' : 'size-7 border-2 sm:size-8',
                  s.active
                    ? 'border-[#fbbf24] bg-gradient-to-b from-[#fbbf24] to-[#f59e0b] text-[#422006] shadow-md shadow-black/20'
                    : s.isToday
                      ? 'border-dashed border-[#fdba74] bg-[#f97316]/15 ring-1 ring-[#fb923c]/40 sm:ring-2'
                      : 'border-[rgba(255,237,213,0.2)] bg-black/10',
                )}
                title={s.weekday}
              >
                {s.active ? (
                  <Check className={compact ? 'size-2.5' : 'size-3.5 sm:size-4'} strokeWidth={2.75} />
                ) : (
                  <span
                    className={cn(
                      'font-bold text-orange-100/50',
                      compact ? 'text-[6px]' : 'text-[8px] sm:text-[9px]',
                    )}
                  >
                    {s.weekday[0]}
                  </span>
                )}
              </div>
              {!compact ? (
                <span className="text-[7px] font-semibold uppercase leading-none text-orange-100/55 sm:text-[8px]">
                  {s.weekday}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div
        className={cn(
          'rounded-lg border border-orange-400/25 bg-black/15',
          compact ? 'mb-0.5 px-1 py-px' : 'mb-1.5 px-1.5 py-1',
        )}
      >
        <div className="mb-px flex items-center justify-between gap-1">
          <span className={cn('font-bold uppercase tracking-wide text-orange-100/80', compact ? 'text-[7px]' : 'text-[9px]')}>
            Цель дня
          </span>
          <span className={cn('font-bold tabular-nums text-orange-50', compact ? 'text-[7px]' : 'text-[9px]')}>
            {streak.xpToday.current}/{streak.xpToday.goal}
          </span>
        </div>
        <div className={cn('overflow-hidden rounded-full bg-black/25', compact ? 'h-0.5' : 'h-2')}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#fde047] via-[#facc15] to-[#eab308]"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </div>

      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'min-h-0 cursor-default rounded-lg border border-[color:var(--hub-tile-icon-border)] bg-[rgba(0,0,0,0.12)] outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24]/40',
              compact ? 'px-1 py-0.5' : 'px-1.5 py-1.5',
            )}
            tabIndex={0}
          >
            <p
              className={cn('font-bold uppercase tracking-wider text-[#fde68a]/90', compact ? 'text-[6px]' : 'mb-0.5 text-[8px]')}
            >
              Бонусы
            </p>
            <p
              className={cn('leading-snug text-orange-50/90', compact ? 'line-clamp-1 text-[7px]' : 'line-clamp-3 text-[9px]')}
            >
              {gamificationHint}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[240px] text-balance" sideOffset={8}>
          Подсказка по активности и нормативам — что сделать сегодня, чтобы удержать серию и закрыть план.
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
