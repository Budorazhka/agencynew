import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { BentoGrid } from './BentoGrid'
import { WorldMap } from './WorldMap'
import { cities, cityMapPoints, countries } from '@/data/mock'
import { getNetworkAnalytics, type AnalyticsPeriod } from '@/lib/city-analytics'
import { TooltipProvider } from '@/components/ui/tooltip'

const PERIOD_OPTIONS: Array<{ value: AnalyticsPeriod; label: string }> = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'allTime', label: 'Все время' },
]

export function OverviewPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('week')

  // Агрегируем данные по всей сети динамически.
  const networkAnalytics = getNetworkAnalytics(cities, period)

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Header
            title="Панель управления"
            breadcrumbs={[{ label: 'Обзор' }]}
            countries={countries}
          />

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              {PERIOD_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setPeriod(item.value)}
                  className={
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors ' +
                    (item.value === period
                      ? 'bg-slate-900 text-white shadow'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <BentoGrid analytics={networkAnalytics} />
        <WorldMap cities={cityMapPoints} />
      </div>
    </TooltipProvider>
  )
}
