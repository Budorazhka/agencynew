import { useState } from 'react'
import { Settings, RefreshCw } from 'lucide-react'
import { useMock, MOCK_SCENARIOS } from '@/providers/MockProvider'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface MockScenarioSelectorProps {
  className?: string
  showDescription?: boolean
}

export function MockScenarioSelector({
  className,
  showDescription = true
}: MockScenarioSelectorProps) {
  const { scenario, setScenario, isLoading, simulateNetworkDelay } = useMock()
  const [isApplying, setIsApplying] = useState(false)

  const handleScenarioChange = async (newScenario: string) => {
    setIsApplying(true)
    try {
      setScenario(newScenario as any)
      // Имитируем задержку загрузки данных при смене сценария
      await simulateNetworkDelay(800)
    } finally {
      setIsApplying(false)
    }
  }

  const handleRefreshData = async () => {
    setIsApplying(true)
    try {
      await simulateNetworkDelay(500)
      window.location.reload()
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 bg-slate-50 rounded-lg border', className)}>
      <div className="flex items-center gap-2">
        <Settings className="size-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">Mock сценарий:</span>
      </div>

      <Select
        value={scenario}
        onValueChange={handleScenarioChange}
        disabled={isLoading || isApplying}
      >
        <SelectTrigger className="w-48 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(MOCK_SCENARIOS).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              <div className="flex flex-col">
                <span className="font-medium">{config.name}</span>
                {showDescription && (
                  <span className="text-xs text-slate-500">{config.description}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isLoading || isApplying}
            className="h-8 px-2"
          >
            <RefreshCw className={cn('size-3', isApplying && 'animate-spin')} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Обновить данные</p>
        </TooltipContent>
      </Tooltip>

      {(isLoading || isApplying) && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Загрузка...
        </div>
      )}

      {showDescription && (
        <div className="text-xs text-slate-600 ml-auto">
          {MOCK_SCENARIOS[scenario].description}
        </div>
      )}
    </div>
  )
}

// Компактный вариант — только выпадающий список без кнопки обновления и описания.
// Для встраивания в сайдбар или другие тесные места.
export function MockScenarioSelectorCompact() {
  const { scenario, setScenario } = useMock()

  return (
    <Select value={scenario} onValueChange={(value) => setScenario(value as any)}>
      <SelectTrigger className="w-32 h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(MOCK_SCENARIOS).map(([key, config]) => (
          <SelectItem key={key} value={key} className="text-xs">
            {config.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Информационный блок с числовыми показателями текущего сценария
export function MockScenarioInfo() {
  const { scenario } = useMock()
  const config = MOCK_SCENARIOS[scenario]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border">
      <div className="text-center">
        <div className="text-lg font-bold text-slate-900">{config.leadCount}</div>
        <div className="text-xs text-slate-600">Всего лидов</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-blue-600">{config.newLeadsPercentage}%</div>
        <div className="text-xs text-slate-600">Новые лиды</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-orange-600">{config.overdueTasksPercentage}%</div>
        <div className="text-xs text-slate-600">Просрочено</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">{Math.round(config.conversionRate * 100)}%</div>
        <div className="text-xs text-slate-600">Конверсия</div>
      </div>
    </div>
  )
}
