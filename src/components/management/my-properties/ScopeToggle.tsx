import { cn } from '@/lib/utils'

export type Scope = 'my' | 'all'

interface ScopeToggleProps {
  scope: Scope
  onChange: (s: Scope) => void
}

export function ScopeToggle({ scope, onChange }: ScopeToggleProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl border border-emerald-900/40 bg-[#0a1f1a] p-1 shadow-sm">
      <button
        onClick={() => onChange('my')}
        className={cn(
          'rounded-lg px-4 py-1.5 text-sm font-medium transition-all',
          scope === 'my'
            ? 'border border-[#e6c364]/35 bg-[#e6c364]/12 text-[#d0e8df] shadow-sm'
            : 'text-emerald-100/50 hover:text-emerald-100/85',
        )}
      >
        Мои объекты
      </button>
      <button
        onClick={() => onChange('all')}
        className={cn(
          'rounded-lg px-4 py-1.5 text-sm font-medium transition-all',
          scope === 'all'
            ? 'border border-[#e6c364]/35 bg-[#e6c364]/12 text-[#d0e8df] shadow-sm'
            : 'text-emerald-100/50 hover:text-emerald-100/85',
        )}
      >
        Все объекты агентства
      </button>
    </div>
  )
}
