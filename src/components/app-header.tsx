import { Link, useLocation, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { id: 'owner', label: 'Кабинет собственника' },
] as const

export function AnalyticsNavLinks({ className }: { className?: string }) {
  const location = useLocation()
  const { cityId } = useParams<{ cityId: string; partnerId: string }>()
  const activeId = 'owner'
  const basePath = cityId ? `/city/${cityId}/partner` : location.pathname

  return (
    <span className={cn('inline-flex max-w-full flex-wrap items-center justify-center gap-2', className)}>
      {navItems.map((item) => (
        <Link
          key={item.id}
          to={basePath}
          className={cn(
            'max-w-full rounded-lg border px-3 py-1.5 text-center text-sm leading-tight font-normal transition-colors sm:px-4 sm:py-2 sm:text-base sm:leading-normal',
            item.id === activeId
              ? 'border-primary/40 bg-secondary text-foreground shadow-sm hover:bg-secondary/80'
              : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {item.label}
        </Link>
      ))}
    </span>
  )
}
