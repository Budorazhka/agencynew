import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface DashboardPlaceholderProps {
  title: string
  description?: string
}

export function DashboardPlaceholder({ title, description }: DashboardPlaceholderProps) {
  const { currentUser } = useAuth()
  const useFeltStyle = currentUser?.accountType === 'internal'

  return (
    <div className="space-y-4">
      <div>
        <h1
          className={cn(
            'text-2xl font-bold tracking-tight',
            useFeltStyle ? 'text-[#fcecc8]' : 'text-slate-900',
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              'mt-1',
              useFeltStyle ? 'text-[#e8dcc4]/80' : 'text-slate-500',
            )}
          >
            {description}
          </p>
        )}
      </div>
      <div
        className={cn(
          'rounded-xl border py-12 text-center',
          useFeltStyle
            ? 'border-[rgba(242,207,141,0.3)] bg-[rgba(18,45,36,0.5)] text-[#e8dcc4]/90'
            : 'border-slate-200 bg-slate-50/80 text-slate-500',
        )}
      >
        <p className="text-sm font-medium">Раздел в разработке</p>
        <p className="mt-1 text-xs opacity-80">Скоро здесь появится функционал</p>
      </div>
    </div>
  )
}
