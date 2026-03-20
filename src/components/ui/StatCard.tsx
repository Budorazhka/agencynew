import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

interface StatCardProps {
  icon: LucideIcon
  title: string
  // Каждая строка — значение слева, метка справа
  rows: Array<{
    value: string | number
    label: string
  }>
  // CSS-класс для акцентного цвета (обычно цвет верхней рамки)
  accentClass?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'minimal'
}

// Карточка статистики с иконкой, заголовком и несколькими строками значений.
// Поддерживает felt и standard тему, три размера и три варианта отображения.
export function StatCard({
  icon: Icon,
  title,
  rows,
  accentClass = '',
  className,
  size = 'md',
  variant = 'default'
}: StatCardProps) {
  const { isFeltStyle } = useTheme()

  const baseClasses = cn(
    'rounded-xl border transition-all duration-200',
    {
      'p-4': size === 'sm',
      'p-5': size === 'md',
      'p-6': size === 'lg',
    },
    isFeltStyle
      ? 'bg-[var(--felt-surface)] border-[var(--felt-border)]'
      : 'bg-card border-border',
    className
  )

  const headerClasses = cn(
    'flex items-center gap-2 mb-3',
    isFeltStyle
      ? 'text-[var(--felt-text-secondary)]'
      : 'text-muted-foreground'
  )

  const dividerClasses = cn(
    'h-px mb-3',
    isFeltStyle
      ? 'bg-[var(--felt-border)]'
      : 'bg-border'
  )

  const rowClasses = cn(
    'flex justify-between items-center',
    {
      'py-1': size === 'sm',
      'py-2': size === 'md',
      'py-3': size === 'lg',
    }
  )

  const valueClasses = cn(
    'font-semibold',
    {
      'text-sm': size === 'sm',
      'text-base': size === 'md',
      'text-lg': size === 'lg',
    },
    isFeltStyle
      ? 'text-[var(--felt-text-primary)]'
      : 'text-foreground'
  )

  const labelClasses = cn(
    {
      'text-xs': size === 'sm',
      'text-sm': size === 'md',
      'text-base': size === 'lg',
    },
    isFeltStyle
      ? 'text-[var(--felt-text-muted)]'
      : 'text-muted-foreground'
  )

  // Минималистичный вариант — одна строка без рамки
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        <div className={cn('flex items-center gap-2', isFeltStyle && 'text-[var(--felt-text-secondary)]')}>
          <Icon size={16} />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className={cn('text-right', isFeltStyle && 'text-[var(--felt-text-primary)]')}>
          {rows[0]?.value}
          <div className="text-xs opacity-70">{rows[0]?.label}</div>
        </div>
      </div>
    )
  }

  // Компактный вариант — заголовок и первое значение в одну строку
  if (variant === 'compact') {
    return (
      <div className={cn(baseClasses)}>
        <div className="flex items-center justify-between">
          <div className={cn('flex items-center gap-2', isFeltStyle && 'text-[var(--felt-text-secondary)]')}>
            <Icon size={14} />
            <span className="text-sm font-medium">{title}</span>
          </div>
          <div className={cn('text-sm font-semibold', isFeltStyle && 'text-[var(--felt-text-primary)]')}>
            {rows[0]?.value}
          </div>
        </div>
        {rows.length > 1 && (
          <div className={cn('text-xs mt-1', isFeltStyle && 'text-[var(--felt-text-muted)]')}>
            {rows[1]?.label}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(baseClasses, accentClass)}>
      <div className={headerClasses}>
        <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
        <span className={cn(
          'font-medium',
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
        )}>
          {title}
        </span>
      </div>

      <div className={dividerClasses} />

      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className={rowClasses}>
            <span className={valueClasses}>{row.value}</span>
            <span className={labelClasses}>{row.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Версия с luxury-классами для главного экрана
export function LuxuryStatCard({
  icon: Icon,
  title,
  rows,
  accentClass = '',
  className
}: Omit<StatCardProps, 'size' | 'variant'>) {
  return (
    <StatCard
      icon={Icon}
      title={title}
      rows={rows}
      accentClass={accentClass}
      className={cn('luxury-stat-card', className)}
      size="md"
      variant="default"
    />
  )
}

// Компактная карточка для сайдбара — одно значение с подписью
export function SidebarStatCard({
  icon: Icon,
  title,
  value,
  label,
  className
}: {
  icon: LucideIcon
  title: string
  value: string | number
  label: string
  className?: string
}) {
  const { isFeltStyle } = useTheme()

  return (
    <div className={cn(
      'p-3 rounded-lg border transition-colors',
      isFeltStyle
        ? 'bg-[var(--felt-surface)] border-[var(--felt-border)] hover:bg-[var(--felt-hover-bg)]'
        : 'bg-muted/30 border-border hover:bg-muted/50',
      className
    )}>
      <div className={cn('flex items-center gap-2 mb-2 text-xs', isFeltStyle && 'text-[var(--felt-text-muted)]')}>
        <Icon size={12} />
        <span>{title}</span>
      </div>
      <div className={cn('font-semibold text-sm', isFeltStyle && 'text-[var(--felt-text-primary)]')}>
        {value}
      </div>
      <div className={cn('text-xs opacity-70', isFeltStyle && 'text-[var(--felt-text-muted)]')}>
        {label}
      </div>
    </div>
  )
}
