import React from 'react'

interface RuntimeErrorBoundaryProps {
  children: React.ReactNode
}

interface RuntimeErrorBoundaryState {
  hasError: boolean
  message: string
}

export class RuntimeErrorBoundary extends React.Component<
  RuntimeErrorBoundaryProps,
  RuntimeErrorBoundaryState
> {
  state: RuntimeErrorBoundaryState = {
    hasError: false,
    message: '',
  }

  static getDerivedStateFromError(error: Error): RuntimeErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Unknown runtime error',
    }
  }

  componentDidCatch(error: Error) {
    console.error('RuntimeErrorBoundary caught error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="m-6 rounded-lg border border-rose-300 bg-rose-50 p-4 text-rose-900">
          <p className="text-sm font-semibold">Ошибка рендера страницы аналитики</p>
          <p className="mt-2 text-xs">{this.state.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}
