import { useState } from 'react'
import {
  BedDouble,
  RefreshCcw,
  AlertCircle,
  Info,
} from 'lucide-react'
import { useLeads } from '@/context/LeadsContext'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const SOURCE_LABEL: Record<string, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
  rent: 'Аренда',
  ad_campaigns: 'Реклама',
}

export function TeamManagementTab() {
  const { state, dispatch } = useLeads()
  const { leadManagers, leadPool } = state
  const { canTransferLeads, canSetSubstitute } = useRolePermissions()

  const [transferFromId, setTransferFromId] = useState<string | null>(null)
  const [transferToId, setTransferToId] = useState<string>('')
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false)

  function getLeadCount(managerId: string) {
    return leadPool.filter((l) => l.managerId === managerId).length
  }

  function getSubstituteName(substituteId: string | null | undefined) {
    if (!substituteId) return null
    return leadManagers.find((m) => m.id === substituteId)?.name ?? null
  }

  function toggleUnavailable(managerId: string, currentValue: boolean) {
    dispatch({
      type: 'UPDATE_LEAD_MANAGER_SUBSTITUTE',
      managerId,
      patch: { isUnavailable: !currentValue, substituteId: currentValue ? null : undefined },
    })
  }

  function setSubstitute(managerId: string, substituteId: string) {
    dispatch({
      type: 'UPDATE_LEAD_MANAGER_SUBSTITUTE',
      managerId,
      patch: { substituteId: substituteId || null },
    })
  }

  function openTransfer(managerId: string) {
    setTransferFromId(managerId)
    setTransferToId('')
    setTransferConfirmOpen(true)
  }

  function confirmTransfer() {
    if (!transferFromId || !transferToId) return
    dispatch({
      type: 'BULK_REASSIGN_LEADS',
      fromManagerId: transferFromId,
      toManagerId: transferToId,
    })
    setTransferConfirmOpen(false)
    setTransferFromId(null)
  }

  const transferFromManager = leadManagers.find((m) => m.id === transferFromId)
  const leadsToTransfer = transferFromId ? getLeadCount(transferFromId) : 0

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          Аккаунт принадлежит бизнесу. Смена имени и пароля — на стороне бэкенда.
          Здесь можно управлять назначением лидов и подменными дежурными.
        </p>
      </div>

      {/* Manager cards */}
      <div className="grid gap-3">
        {leadManagers.map((manager) => {
          const count = getLeadCount(manager.id)
          const substituteName = getSubstituteName(manager.substituteId)
          const isUnavailable = manager.isUnavailable ?? false

          return (
            <div
              key={manager.id}
              className={cn(
                'rounded-xl border p-4 transition-all',
                isUnavailable
                  ? 'border-amber-200 bg-amber-50/60 opacity-80'
                  : 'border-slate-200 bg-white',
              )}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                  isUnavailable
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-slate-100 text-slate-600',
                )}>
                  {manager.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900">{manager.name}</p>
                    {isUnavailable && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        <BedDouble className="w-3 h-3" />
                        Недоступен
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">@{manager.login}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {manager.sourceTypes.map((src) => (
                      <span
                        key={src}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {SOURCE_LABEL[src] ?? src}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats + actions */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900 leading-none">{count}</p>
                    <p className="text-xs text-slate-400">лидов</p>
                  </div>
                  <div className="flex gap-2">
                    {canSetSubstitute && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          'h-7 text-xs gap-1',
                          isUnavailable
                            ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                        )}
                        onClick={() => toggleUnavailable(manager.id, isUnavailable)}
                      >
                        <BedDouble className="w-3 h-3" />
                        {isUnavailable ? 'Вернуть' : 'Недоступен'}
                      </Button>
                    )}
                    {canTransferLeads && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => openTransfer(manager.id)}
                        disabled={count === 0}
                      >
                        <RefreshCcw className="w-3 h-3" />
                        Передать лиды
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Substitute picker — only if canSetSubstitute */}
              {isUnavailable && canSetSubstitute && (
                <div className="mt-3 flex items-center gap-3 rounded-lg bg-amber-100/60 px-3 py-2">
                  <BedDouble className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 shrink-0">Дежурный:</p>
                  <Select
                    value={manager.substituteId ?? ''}
                    onValueChange={(val) => setSubstitute(manager.id, val)}
                  >
                    <SelectTrigger className="h-7 flex-1 text-xs border-amber-200 bg-white">
                      <SelectValue placeholder="Выбрать дежурного" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadManagers
                        .filter((m) => m.id !== manager.id)
                        .map((m) => (
                          <SelectItem key={m.id} value={m.id} className="text-xs">
                            {m.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {substituteName && (
                    <p className="text-xs font-semibold text-amber-800 shrink-0">
                      → {substituteName}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Transfer confirmation dialog */}
      <Dialog open={transferConfirmOpen} onOpenChange={setTransferConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Передать все лиды
            </DialogTitle>
            <DialogDescription>
              Все {leadsToTransfer} лидов менеджера «{transferFromManager?.name}» будут переназначены выбранному менеджеру.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-slate-700">Кому передать:</p>
              <Select value={transferToId} onValueChange={setTransferToId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выбрать менеджера" />
                </SelectTrigger>
                <SelectContent>
                  {leadManagers
                    .filter((m) => m.id !== transferFromId)
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({getLeadCount(m.id)} лидов)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setTransferConfirmOpen(false)}
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={!transferToId}
                onClick={confirmTransfer}
              >
                Передать {leadsToTransfer} лидов
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
