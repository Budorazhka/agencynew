import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModuleErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  moduleName?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ModuleErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

// Error boundary для отдельных разделов приложения.
// При ошибке внутри дочерних компонентов показывает fallback
// вместо того чтобы упасть всё приложение.
export class ModuleErrorBoundary extends Component<
  ModuleErrorBoundaryProps,
  ModuleErrorBoundaryState
> {
  constructor(props: ModuleErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ModuleErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    console.error(`ModuleErrorBoundary (${this.props.moduleName || 'unknown'}):`, { error, errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset)
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Ошибка загрузки модуля
            </h2>

            <p className="text-gray-600 mb-6">
              {this.props.moduleName && (
                <span className="font-medium">Модуль: {this.props.moduleName}</span>
              )}
              {this.props.moduleName && <br />}
              Произошла непредвиденная ошибка при загрузке этого раздела.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
              <div className="text-sm font-mono text-red-700 mb-2">
                {this.state.error.name}: {this.state.error.message}
              </div>
              {/* Стек ошибки показываем только в режиме разработки */}
              {import.meta.env.DEV && (
                <details className="text-xs text-gray-600">
                  <summary className="cursor-pointer font-medium mb-2">
                    Детали ошибки
                  </summary>
                  <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <div className="mt-2">
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Попробовать снова
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                На главную
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Создаёт объект с компонентом ErrorBoundary для использования в функциональных компонентах
export function useModuleErrorBoundary(
  moduleName: string,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return {
    ErrorBoundary: ({ children }: { children: ReactNode }) => (
      <ModuleErrorBoundary
        moduleName={moduleName}
        onError={onError}
        fallback={(error, reset) => (
          <ModuleErrorFallback
            error={error}
            onReset={reset}
            moduleName={moduleName}
          />
        )}
      >
        {children}
      </ModuleErrorBoundary>
    ),
  }
}

interface ModuleErrorFallbackProps {
  error: Error
  onReset: () => void
  moduleName: string
  variant?: 'compact' | 'full'
}

// Fallback-компонент для отображения вместо упавшего раздела.
// variant='compact' — маленький блок с кнопкой, подходит для виджетов.
// variant='full' — полноразмерный с текстом ошибки, подходит для страниц.
export function ModuleErrorFallback({
  error,
  onReset,
  moduleName,
  variant = 'full'
}: ModuleErrorFallbackProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-center p-8 border border-red-200 bg-red-50 rounded-lg">
        <div className="text-center">
          <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-sm text-red-800 font-medium">{moduleName} не загрузился</p>
          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            className="mt-2"
          >
            Обновить
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ошибка в модуле {moduleName}
        </h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={onReset}>Перезагрузить модуль</Button>
      </div>
    </div>
  )
}

// Готовые error boundary для каждого раздела — чтобы не писать moduleName каждый раз
export const LeadsErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ModuleErrorBoundary moduleName="Лиды">{children}</ModuleErrorBoundary>
)

export const DashboardErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ModuleErrorBoundary moduleName="Дашборд">{children}</ModuleErrorBoundary>
)

export const ProductErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ModuleErrorBoundary moduleName="Продукт">{children}</ModuleErrorBoundary>
)

export const PersonnelErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ModuleErrorBoundary moduleName="Персонал">{children}</ModuleErrorBoundary>
)

export const SettingsErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ModuleErrorBoundary moduleName="Настройки">{children}</ModuleErrorBoundary>
)
