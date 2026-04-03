import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const WORKSPACE_ADD_ACTIONS = [
  { label: 'Новый лид', route: '/dashboard/leads/poker' },
  { label: 'Новый клиент', route: '/dashboard/clients/list' },
  { label: 'Новая сделка', route: '/dashboard/deals' },
  { label: 'Новая задача', route: '/dashboard/tasks/new' },
  { label: 'Новая подборка', route: '/dashboard/selections/new' },
  { label: 'Новая бронь', route: '/dashboard/bookings' },
  { label: 'Событие в календаре', route: '/dashboard/calendar' },
  { label: 'Новый объект', route: '/dashboard/objects/list' },
] as const

type Props = {
  className?: string
  /** `header` — как в верхней панели; `fab` — плавающая кнопка, меню вверх */
  variant?: 'fab' | 'header'
}

export function WorkspaceAddButton({ className, variant = 'fab' }: Props) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isFab = variant === 'fab'

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 text-[#3d2e00] transition-all hover:brightness-110 active:scale-95',
          isFab
            ? 'rounded-full bg-[#e6c364] px-5 py-3 text-[15px] font-semibold shadow-lg'
            : 'rounded-sm bg-[#e6c364] px-4 py-1.5 text-[15px] font-medium',
        )}
      >
        <Plus className="size-5" strokeWidth={isFab ? 2.25 : 2} />
        Добавить
        {!isFab && (
          <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
        )}
      </button>
      {open && (
        <div
          className={cn(
            'absolute right-0 z-50 min-w-[220px] overflow-hidden rounded-lg border border-[var(--dropdown-border)] bg-[var(--dropdown-bg)] py-1 shadow-[var(--dropdown-shadow)]',
            isFab ? 'bottom-[calc(100%+10px)]' : 'top-[calc(100%+8px)]',
          )}
        >
          {WORKSPACE_ADD_ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              className="block w-full px-4 py-2.5 text-left text-[13px] font-medium text-[color:var(--dropdown-text)] hover:bg-[var(--dropdown-hover)]"
              onClick={() => {
                navigate(a.route)
                setOpen(false)
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
