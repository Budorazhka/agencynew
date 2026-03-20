import { createContext, useContext, useState, type ReactNode } from 'react'

export type MockScenario =
  | 'default'          // базовый набор данных
  | 'many-new-leads'   // много нераспределённых лидов
  | 'overdue-tasks'    // много просроченных задач
  | 'high-conversion'  // высокая конверсия в сделки
  | 'empty-pipeline'   // почти пустая воронка
  | 'stress-test'      // большой объём данных для проверки производительности

interface MockContextValue {
  scenario: MockScenario
  setScenario: (scenario: MockScenario) => void
  isLoading: boolean
  simulateNetworkDelay: (ms?: number) => Promise<void>
  simulateError: (errorType: 'network' | 'server' | 'timeout') => Promise<void>
}

const MockContext = createContext<MockContextValue | null>(null)

// Параметры каждого сценария: сколько лидов генерировать, какой процент новых,
// просроченных задач и какой коэффициент конверсии использовать.
export const MOCK_SCENARIOS: Record<MockScenario, {
  name: string
  description: string
  leadCount: number
  newLeadsPercentage: number
  overdueTasksPercentage: number
  conversionRate: number
}> = {
  default: {
    name: 'Стандартный сценарий',
    description: 'Базовый набор данных для демонстрации',
    leadCount: 120,
    newLeadsPercentage: 15,
    overdueTasksPercentage: 10,
    conversionRate: 0.15,
  },
  'many-new-leads': {
    name: 'Много новых лидов',
    description: 'Большое количество нераспределенных лидов',
    leadCount: 200,
    newLeadsPercentage: 40,
    overdueTasksPercentage: 5,
    conversionRate: 0.12,
  },
  'overdue-tasks': {
    name: 'Просроченные задачи',
    description: 'Много просроченных задач для тестирования',
    leadCount: 150,
    newLeadsPercentage: 10,
    overdueTasksPercentage: 35,
    conversionRate: 0.08,
  },
  'high-conversion': {
    name: 'Высокая конверсия',
    description: 'Хорошие показатели конверсии в сделки',
    leadCount: 100,
    newLeadsPercentage: 20,
    overdueTasksPercentage: 5,
    conversionRate: 0.35,
  },
  'empty-pipeline': {
    name: 'Пустая воронка',
    description: 'Минимальное количество лидов',
    leadCount: 20,
    newLeadsPercentage: 50,
    overdueTasksPercentage: 0,
    conversionRate: 0.25,
  },
  'stress-test': {
    name: 'Стресс-тест',
    description: 'Большой объем данных для тестирования производительности',
    leadCount: 1000,
    newLeadsPercentage: 25,
    overdueTasksPercentage: 15,
    conversionRate: 0.10,
  },
}

export function MockProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<MockScenario>('default')
  const [isLoading, setIsLoading] = useState(false)

  const simulateNetworkDelay = async (ms: number = 1000) => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, ms))
    setIsLoading(false)
  }

  const simulateError = async (errorType: 'network' | 'server' | 'timeout') => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    const errors = {
      network: new Error('Network error: Failed to fetch'),
      server: new Error('Server error: Internal server error'),
      timeout: new Error('Timeout: Request timed out'),
    }

    setIsLoading(false)
    throw errors[errorType]
  }

  return (
    <MockContext.Provider value={{
      scenario,
      setScenario,
      isLoading,
      simulateNetworkDelay,
      simulateError,
    }}>
      {children}
    </MockContext.Provider>
  )
}

export function useMock(): MockContextValue {
  const ctx = useContext(MockContext)
  if (!ctx) {
    throw new Error('useMock must be used within MockProvider')
  }
  return ctx
}

// Возвращает конфиг сценария по его ключу
export function getScenarioConfig(scenario: MockScenario) {
  return MOCK_SCENARIOS[scenario]
}

// Считает количество элементов как процент от общего числа, округляет до целого
export function calculateFromPercentage(total: number, percentage: number): number {
  return Math.round(total * (percentage / 100))
}

// Задержка перед resolve. Итоговое время = baseMs + случайное число от 0 до varianceMs.
export function createMockDelay(baseMs: number = 300, varianceMs: number = 200): Promise<void> {
  const delay = baseMs + Math.random() * varianceMs
  return new Promise(resolve => setTimeout(resolve, delay))
}
