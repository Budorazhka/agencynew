import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import { LeadsCardTableView } from './LeadsCardTableView'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Покерный стол лидов (CRM, п. 6.2 ТЗ) — в колонке контента рядом с rail, не скрывает меню. */
export function LeadsPokerPage() {
  const navigate = useNavigate()
  const { isMarketer } = useRolePermissions()
  const [selectedManagerId, setSelectedManagerId] = useState<string>('_all')

  if (isMarketer) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[#093b30] px-4 py-8">
        <div className="flex max-w-sm flex-col items-center gap-5 rounded-2xl border border-[color:var(--hub-card-border-hover)] bg-[rgba(18,45,36,0.95)] px-10 py-12 text-center shadow-lg">
          <div className="flex size-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--gold)_20%,transparent)] text-[color:var(--gold-light)]">
            <ShieldX className="size-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[color:var(--app-text)]">Нет доступа</h2>
            <p className="text-sm text-[#e8dcc4]">
              У вас нет прав для просмотра раздела «Контроль лидов».
            </p>
          </div>
          <Button
            onClick={() => navigate('/dashboard/leads')}
            className="rounded-full px-6 bg-[var(--gold)]/25 text-[color:var(--app-text)] hover:bg-[var(--gold)]/35"
          >
            К контролю лидов
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
      <LeadsCardTableView
        variant="page"
        selectedManagerId={selectedManagerId}
        onSelectedManagerIdChange={setSelectedManagerId}
      />
    </div>
  )
}
