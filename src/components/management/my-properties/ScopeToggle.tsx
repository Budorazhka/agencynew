import { cn } from '@/lib/utils'

export type Scope = 'my' | 'all'

interface ScopeToggleProps {
  scope: Scope
  onChange: (s: Scope) => void
}

export function ScopeToggle({ scope, onChange }: ScopeToggleProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl border border-[var(--green-border)] bg-[var(--green-deep)] p-1 shadow-sm">
      <button
        onClick={() => onChange('my')}
        className={cn(
          'rounded-lg px-4 py-1.5 text-sm font-medium transition-all',
          scope === 'my'
            ? 'border border-[color:var(--hub-card-border-hover)] bg-[var(--nav-item-bg-active)] text-[color:var(--workspace-text)] shadow-sm'
            : 'text-[color:var(--app-text-subtle)] hover:text-[color:var(--app-text)]',
        )}
      >
        Мои объекты
      </button>
      <button
        onClick={() => onChange('all')}
        className={cn(
          'rounded-lg px-4 py-1.5 text-sm font-medium transition-all',
          scope === 'all'
            ? 'border border-[color:var(--hub-card-border-hover)] bg-[var(--nav-item-bg-active)] text-[color:var(--workspace-text)] shadow-sm'
            : 'text-[color:var(--app-text-subtle)] hover:text-[color:var(--app-text)]',
        )}
      >
        Все объекты агентства
      </button>
    </div>
  )
}
