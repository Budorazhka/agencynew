import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import { LeadsCardTableView } from './LeadsCardTableView'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Покерный стол лидов — отдельная полноэкранная страница. */
export function LeadsPokerPage() {
  const navigate = useNavigate()
  const { isMarketer } = useRolePermissions()
  const [selectedManagerId, setSelectedManagerId] = useState<string>('_all')

  if (isMarketer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#093b30]">
        <div className="flex max-w-sm flex-col items-center gap-5 rounded-2xl border border-[rgba(242,207,141,0.3)] bg-[rgba(18,45,36,0.95)] px-10 py-12 text-center shadow-lg">
          <div className="flex size-14 items-center justify-center rounded-full bg-[rgba(242,207,141,0.2)] text-[#f2cf8d]">
            <ShieldX className="size-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[#fcecc8]">Нет доступа</h2>
            <p className="text-sm text-[#e8dcc4]">
              У вас нет прав для просмотра раздела «Контроль лидов».
            </p>
          </div>
          <Button
            onClick={() => navigate('/dashboard/leads')}
            className="rounded-full px-6 bg-[rgba(242,207,141,0.25)] text-[#fcecc8] hover:bg-[rgba(242,207,141,0.35)]"
          >
            К контролю лидов
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-10 flex h-screen w-full flex-col overflow-hidden bg-transparent">
      <LeadsCardTableView
        variant="page"
        selectedManagerId={selectedManagerId}
        onSelectedManagerIdChange={setSelectedManagerId}
        onBack={() => navigate('/dashboard/leads')}
      />
    </div>
  )
}
