import React from 'react'
import { type LucideIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

interface WidgetCardProps {
  title: string
  icon?: LucideIcon
  // Элемент справа от заголовка — например кнопка или бейдж
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bordered?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'elevated' | 'outlined'
  // Растянуть карточку на всю высоту контейнера
  fullHeight?: boolean
}

// Карточка-контейнер для виджетов. Имеет заголовок с иконкой и опциональное действие.
// Поддерживает felt и standard тему.
export function WidgetCard({
  title,
  icon: Icon,
  action,
  children,
  className,
  bordered = true,
  padding = 'md',
  variant = 'default',
  fullHeight = false
}: WidgetCardProps) {
  const { isFeltStyle } = useTheme()

  const cardClasses = cn(
    'rounded-xl transition-all duration-200',
    {
      'h-full': fullHeight,
      'border': bordered,
      'shadow-sm': variant === 'elevated',
      'border-2': variant === 'outlined',
    },
    isFeltStyle
      ? 'bg-[var(--felt-surface)] border-[var(--felt-border)]'
      : cn(
          'bg-card border-border',
          variant === 'outlined' && 'border-border/60'
        ),
    className
  )

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6'
  }[padding]

  const headerClasses = cn(
    'flex items-center justify-between mb-4',
    isFeltStyle
      ? 'text-[var(--felt-text-primary)]'
      : 'text-foreground'
  )

  const titleClasses = cn(
    'flex items-center gap-2 font-medium',
    isFeltStyle
      ? 'text-[var(--felt-text-secondary)]'
      : 'text-muted-foreground'
  )

  return (
    <div className={cardClasses}>
      {(title || Icon || action) && (
        <div className={headerClasses}>
          <div className={titleClasses}>
            {Icon && <Icon size={16} />}
            {title && <span>{title}</span>}
          </div>
          {action}
        </div>
      )}

      <div className={paddingClasses}>
        {children}
      </div>
    </div>
  )
}

// Версия карточки со стилями luxury-виджета (для главного экрана)
export function LuxuryWidgetCard({
  title,
  icon: Icon,
  action,
  children,
  className,
  ...props
}: WidgetCardProps) {
  return (
    <WidgetCard
      title={title}
      icon={Icon}
      action={action}
      className={cn('luxury-widget-card', className)}
      {...props}
    >
      {children}
    </WidgetCard>
  )
}

// Карточка с цветной левой полоской, для сайдбара
export function SidebarWidgetCard({
  title,
  icon: Icon,
  children,
  className
}: Omit<WidgetCardProps, 'action' | 'bordered' | 'padding' | 'variant' | 'fullHeight'>) {
  const { isFeltStyle } = useTheme()

  return (
    <WidgetCard
      title={title}
      icon={Icon}
      className={cn(
        'border-l-4 border-l-blue-500',
        isFeltStyle && 'border-l-[var(--felt-accent-gold)]',
        className
      )}
      bordered={false}
      padding="sm"
      variant="default"
    >
      {children}
    </WidgetCard>
  )
}

// Карточка, которую можно свернуть/развернуть кликом по стрелке в заголовке
export function CollapsibleWidgetCard({
  title,
  icon: Icon,
  action,
  children,
  className,
  defaultCollapsed = false,
  ...props
}: WidgetCardProps & {
  defaultCollapsed?: boolean
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  const toggleAction = (
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={cn(
        'p-1 rounded transition-colors',
        'hover:bg-muted/50',
        'text-muted-foreground hover:text-foreground'
      )}
    >
      <ChevronDown
        size={16}
        className={cn('transition-transform', isCollapsed && 'rotate-180')}
      />
    </button>
  )

  return (
    <WidgetCard
      title={title}
      icon={Icon}
      action={action || toggleAction}
      className={className}
      {...props}
    >
      {!isCollapsed && children}
    </WidgetCard>
  )
}

// Карточка с анимированными плейсхолдерами вместо содержимого — для состояния загрузки
export function LoadingWidgetCard({
  title,
  icon: Icon,
  className,
  ...props
}: Omit<WidgetCardProps, 'children' | 'action'>) {
  return (
    <WidgetCard
      title={title}
      icon={Icon}
      className={className}
      {...props}
    >
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
    </WidgetCard>
  )
}
