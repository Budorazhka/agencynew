import { cn } from '@/lib/utils'

export type Scope = 'my' | 'all'

interface ScopeToggleProps {
  scope: Scope
  onChange: (s: Scope) => void
}

export function ScopeToggle({ scope, onChange }: ScopeToggleProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl border border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.2)] p-1 shadow-sm">
      <button
        onClick={() => onChange('my')}
        className={cn(
          'rounded-lg px-4 py-1.5 text-sm font-medium transition-all',
          scope === 'my'
            ? 'bg-[rgba(242,207,141,0.15)] text-[#fcecc8] shadow-sm border border-[rgba(242,207,141,0.3)]'
            : 'text-[rgba(242,207,141,0.5)] hover:text-[rgba(242,207,141,0.8)]',
        )}
      >
        Мои объекты
      </button>
      <button
        onClick={() => onChange('all')}
        className={cn(
          'rounded-lg px-4 py-1.5 text-sm font-medium transition-all',
          scope === 'all'
            ? 'bg-[rgba(242,207,141,0.15)] text-[#fcecc8] shadow-sm border border-[rgba(242,207,141,0.3)]'
            : 'text-[rgba(242,207,141,0.5)] hover:text-[rgba(242,207,141,0.8)]',
        )}
      >
        Все объекты агентства
      </button>
    </div>
  )
}
