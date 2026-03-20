import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  // spinner — крутящийся кружок, dots — три точки, pulse — пульсирующий шар, skeleton — прямоугольник
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  className?: string
  children?: React.ReactNode
  text?: string
}

// Индикатор загрузки в нескольких вариантах. По умолчанию spinner.
export function Loading({
  size = 'md',
  variant = 'spinner',
  className,
  children,
  text
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-2',
    className
  )

  if (variant === 'skeleton') {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className={cn('bg-muted rounded', sizeClasses[size])} />
        {text && (
          <div className={cn(
            'mt-2 h-4 bg-muted rounded animate-pulse',
            size === 'sm' ? 'w-24' : size === 'md' ? 'w-32' : 'w-48'
          )} />
        )}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex gap-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 bg-primary rounded-full animate-bounce',
              size === 'sm' ? 'h-1.5 w-1.5' : size === 'md' ? 'h-2 w-2' : 'h-3 w-3'
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s',
              animationIterationCount: 'infinite'
            }}
          />
        ))}
        {text && <span className="text-sm text-muted-foreground ml-2">{text}</span>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('bg-primary rounded-full animate-pulse', sizeClasses[size])} />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
      {children}
    </div>
  )
}

// Скелетон для карточки с несколькими строками текста
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 animate-pulse', className)}>
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    </div>
  )
}

// Скелетон для таблицы — рисует rows строк по columns ячеек
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-muted rounded animate-pulse"
              style={{ width: `${Math.random() * 100 + 100}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Скелетон для списка элементов с аватаром и двумя строками текста
export function ListSkeleton({
  items = 3,
  className
}: {
  items?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
          <div className="w-10 h-10 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Полноэкранный оверлей поверх страницы на время загрузки
export function PageOverlay({
  text = 'Загрузка...',
  className
}: {
  text?: string
  className?: string
}) {
  return (
    <div className={cn(
      'fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center',
      className
    )}>
      <div className="bg-card border rounded-lg p-6 shadow-lg">
        <Loading size="lg" text={text} />
      </div>
    </div>
  )
}

// Кнопка с встроенным индикатором загрузки.
// Пока loading=true — содержимое скрыто, кнопка задизейблена.
export function LoadingButton({
  loading,
  children,
  className,
  ...props
}: {
  loading?: boolean
  children: React.ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        'relative transition-colors',
        loading && 'opacity-70 cursor-not-allowed',
        className
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loading size="sm" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
    </button>
  )
}
