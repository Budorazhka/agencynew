import { useState } from 'react'
import { AlertTriangle, Info, Play, Timer } from 'lucide-react'
import { useMock, MOCK_SCENARIOS } from '@/providers/MockProvider'
import { Input } from '@/components/ui/input'
import { MockScenarioSelector, MockScenarioInfo } from '@/components/common/MockScenarioSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function MockSettingsTab() {
  const { scenario, isLoading, simulateError, simulateNetworkDelay } = useMock()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [delayMs, setDelayMs] = useState(1000)
  const [varianceMs, setVarianceMs] = useState(200)

  const handleTestError = async (errorType: 'network' | 'server' | 'timeout') => {
    try {
      await simulateError(errorType)
    } catch (error) {
      // Ошибка ожидается для демонстрации
      console.log(`Тестовая ошибка (${errorType}):`, error)
    }
  }

  const currentScenario = MOCK_SCENARIOS[scenario as keyof typeof MOCK_SCENARIOS]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Mock настройки</h2>
        <p className="text-muted-foreground">
          Управление сценариями тестовых данных и симуляция различных состояний системы
        </p>
      </div>

      {/* Выбор сценария */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Текущий сценарий
          </CardTitle>
          <CardDescription>
            Выберите сценарий для демонстрации различных состояний системы
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MockScenarioSelector />
          <MockScenarioInfo />
        </CardContent>
      </Card>

      {/* Информация о сценарии */}
      <Card>
        <CardHeader>
          <CardTitle>Информация о сценарии</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Название</Label>
              <p className="text-sm text-muted-foreground">{currentScenario.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Описание</Label>
              <p className="text-sm text-muted-foreground">{currentScenario.description}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Всего лидов</Label>
              <p className="text-sm text-muted-foreground">{currentScenario.leadCount}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Новые лиды</Label>
              <p className="text-sm text-muted-foreground">{currentScenario.newLeadsPercentage}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Тестирование ошибок */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Тестирование ошибок
          </CardTitle>
          <CardDescription>
            Симуляция различных типов ошибок для тестирования обработки
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestError('network')}
              disabled={isLoading}
            >
              Сетевая ошибка
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestError('server')}
              disabled={isLoading}
            >
              Ошибка сервера
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestError('timeout')}
              disabled={isLoading}
            >
              Таймаут
            </Button>
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-4 w-4 mt-0.5 text-blue-600" />
            <p className="text-sm text-blue-800">
              Эти кнопки симулируют ошибки для тестирования обработки исключений в приложении.
              Ошибки будут обработаны соответствующими Error Boundaries.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Расширенные настройки */}
      <Card>
        <CardHeader>
          <CardTitle>Расширенные настройки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="advanced-settings">Показать расширенные настройки</Label>
            <Switch
              id="advanced-settings"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
          </div>

          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="delay-ms" className="text-sm font-medium">Задержка сети (мс)</Label>
                  <p className="text-xs text-muted-foreground mb-1">
                    Базовая задержка для симуляции реальных условий
                  </p>
                  <Input
                    id="delay-ms"
                    type="number"
                    min={0}
                    max={10000}
                    step={100}
                    value={delayMs}
                    onChange={e => setDelayMs(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="variance-ms" className="text-sm font-medium">Вариативность (мс)</Label>
                  <p className="text-xs text-muted-foreground mb-1">
                    Случайное отклонение от базовой задержки
                  </p>
                  <Input
                    id="variance-ms"
                    type="number"
                    min={0}
                    max={5000}
                    step={50}
                    value={varianceMs}
                    onChange={e => setVarianceMs(Number(e.target.value))}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => simulateNetworkDelay(delayMs + Math.random() * varianceMs)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Timer className="w-4 h-4" />
                Симулировать задержку {delayMs}±{varianceMs} мс
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Статус системы */}
      <Card>
        <CardHeader>
          <CardTitle>Статус mock системы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            )} />
            <span className="text-sm">
              {isLoading ? 'Выполняется операция...' : 'Система готова'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
