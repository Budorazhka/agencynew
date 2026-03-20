import { useMemo, useState } from 'react'
import { ChevronRight, User, UserPlus, Users } from 'lucide-react'
import { useLeads } from '@/context/LeadsContext'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import type { Lead, LeadSource } from '@/types/leads'
import { LEAD_STAGES } from '@/data/leads-mock'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LeadsSecretDistributionDialog } from '@/components/leads/LeadsSecretDistributionDialog'

/** Иконка игральных карт — переход в режим распределения */
function PlayingCardsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* задняя карта */}
      <rect x="3" y="1" width="15" height="21" rx="2.2" />
      {/* передняя карта */}
      <rect x="7" y="3" width="15" height="21" rx="2.2" />
      {/* масть (бубна) на уголке */}
      <path d="M19.5 8.5l1.5 2.5-1.5 2.5-1.5-2.5 1.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  )
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
  rent: 'Аренда',
  ad_campaigns: 'Рекламные кампании',
}

const SOURCE_CARD_CLASS: Record<LeadSource, string> = {
  primary: 'border-l-4 border-l-slate-400',
  secondary: 'border-l-4 border-l-slate-300',
  rent: 'border-l-4 border-l-slate-500',
  ad_campaigns: 'border-l-4 border-l-slate-600',
}

const CHANNEL_LABELS: Record<NonNullable<Lead['channel']>, string> = {
  form: 'Форма',
  ad: 'Реклама',
  partner: 'Партнёр',
  other: 'Другое',
}

type PendingAssign = { leadId: string; managerId: string; managerName: string }

export function LeadCloudTab() {
  const [openSource, setOpenSource] = useState<LeadSource | null>(null)
  const [openLeadId, setOpenLeadId] = useState<string | null>(null)
  const [secretDialogOpen, setSecretDialogOpen] = useState(false)
  const [pendingAssign, setPendingAssign] = useState<PendingAssign | null>(null)
  const { state, dispatch, leadsBySource, isAutoDistribution } = useLeads()
  const { leadPool, leadManagers, manualDistributorId } = state
  const { isDirectorOrAbove } = useRolePermissions()
  const canAssign = !isAutoDistribution || isDirectorOrAbove
  const openLead = openLeadId ? leadPool.find((l) => l.id === openLeadId) ?? null : null

  const unassignedLeads = useMemo(
    () => leadPool.filter((l) => !l.managerId),
    [leadPool]
  )
  const [assignAllToManagerId, setAssignAllToManagerId] = useState<string>('')

  const getStageName = (stageId: string) =>
    LEAD_STAGES.find((s) => s.id === stageId)?.name ?? stageId
  const getManagerName = (managerId: string | null) =>
    managerId ? leadManagers.find((m) => m.id === managerId)?.name ?? managerId : '—'

  const handleAssignAllUnassigned = () => {
    if (!assignAllToManagerId) return
    unassignedLeads.forEach((lead) => {
      dispatch({ type: 'ASSIGN_LEAD', leadId: lead.id, managerId: assignAllToManagerId })
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <p className="max-w-2xl text-sm text-slate-600">
          Все лиды попадают в единое облако. Разбивка по четырём типам аккаунтов.
          {manualDistributorId && (
            <span className="mt-2 block font-medium text-slate-800">
              Рукопашной режим: {getManagerName(manualDistributorId)}
            </span>
          )}
          {isAutoDistribution && (
            <span className="mt-2 block font-medium text-slate-700">
              Назначение по правилу «{state.distributionRule.type === 'round_robin' ? 'По кругу' : 'По загрузке'}». Новые лиды назначаются автоматически.
            </span>
          )}
        </p>
        <Button
          variant="outline"
          className="gap-2 shrink-0 border-[rgba(229,196,136,0.6)] bg-[rgba(68,43,18,0.5)] text-[#fcecc8] hover:border-[rgba(236,194,112,0.7)] hover:bg-[rgba(88,57,25,0.65)] hover:text-[#fff5e0]"
          onClick={() => setSecretDialogOpen(true)}
        >
          <PlayingCardsIcon className="size-5 shrink-0" />
          Режим распределения
        </Button>
      </div>

      <LeadsSecretDistributionDialog open={secretDialogOpen} onOpenChange={setSecretDialogOpen} />

      {/* Раздел неназначенных лидов: для ручного назначения */}
      <Card className="leads-card border-amber-200/60 bg-amber-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="section-title flex items-center gap-2">
            <UserPlus className="size-5 text-amber-700" />
            Неназначенные лиды
          </CardTitle>
          <p className="text-sm text-slate-600">
            {unassignedLeads.length === 0
              ? 'Все лиды назначены менеджерам. Сюда попадают новые лиды и те, с кого сняли назначение.'
              : !canAssign
                ? 'Назначение выполняется автоматически по правилу. Ручное назначение недоступно (доступно только директору для корректировки).'
                : manualDistributorId
                  ? 'Сюда попадают все лиды без менеджера. В ручном режиме выберите менеджера и назначьте.'
                  : 'Сюда попадают все лиды без менеджера (новые и снятые с назначения). Выберите, на кого назначить.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {unassignedLeads.length > 0 && (
            <>
              {canAssign && (
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[220px] flex-1 space-y-1.5">
                    <Label className="text-slate-700">Назначить на менеджера</Label>
                    <Select value={assignAllToManagerId} onValueChange={setAssignAllToManagerId}>
                      <SelectTrigger className="leads-select-trigger w-full">
                        <SelectValue placeholder="Выберите менеджера" />
                      </SelectTrigger>
                      <SelectContent className="leads-select-content">
                        {leadManagers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAssignAllUnassigned}
                    disabled={!assignAllToManagerId}
                    className="shrink-0"
                  >
                    Назначить все ({unassignedLeads.length}) на выбранного
                  </Button>
                </div>
              )}
              <ul className="space-y-2">
                {unassignedLeads.map((lead) => (
                  <li
                    key={lead.id}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2"
                  >
                    <span className="font-mono text-xs text-slate-500">{lead.id}</span>
                    <Badge variant="outline" className="text-xs">
                      {SOURCE_LABELS[lead.source]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {getStageName(lead.stageId)}
                    </Badge>
                    <span className="flex-1" />
                    {canAssign ? (
                      <Select
                        value="_none"
                        onValueChange={(v) => {
                          if (v !== '_none') {
                            const mgr = leadManagers.find((m) => m.id === v)
                            setPendingAssign({ leadId: lead.id, managerId: v, managerName: mgr?.name ?? v })
                          }
                        }}
                      >
                        <SelectTrigger className="leads-select-trigger h-8 w-[180px] border-slate-200">
                          <SelectValue placeholder="Назначить на..." />
                        </SelectTrigger>
                        <SelectContent className="leads-select-content">
                          <SelectItem value="_none">— Назначить на...</SelectItem>
                          {leadManagers
                            .filter((m) => m.sourceTypes.includes(lead.source))
                            .map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-slate-500">Назначение автоматически</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setOpenLeadId(lead.id)}
                    >
                      Карточка
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {(['primary', 'secondary', 'rent', 'ad_campaigns'] as LeadSource[]).map((source) => {
          const leads = leadsBySource(source)
          return (
            <Card
              key={source}
              className={`leads-card ${SOURCE_CARD_CLASS[source]} transition-shadow hover:shadow-md`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold">{SOURCE_LABELS[source]}</CardTitle>
                  <span className="text-2xl font-bold tabular-nums text-slate-800">
                    {leads.length}
                  </span>
                </div>
                <p className="text-sm text-slate-500">лидов</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {leads.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 py-4 text-center text-sm text-slate-500">
                    Нет лидов
                  </p>
                ) : (
                  <>
                    <ul className="space-y-2">
                      {leads.slice(0, 5).map((lead) => (
                        <LeadRow
                          key={lead.id}
                          lead={lead}
                          source={source}
                          getStageName={getStageName}
                          getManagerName={getManagerName}
                          onOpenCard={() => setOpenLeadId(lead.id)}
                        />
                      ))}
                    </ul>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      onClick={() => setOpenSource(source)}
                    >
                      <span>
                        {leads.length > 5
                          ? `Показать все ${leads.length} лидов`
                          : 'Открыть список'}
                      </span>
                      <ChevronRight className="size-4" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="leads-card border-slate-200 bg-slate-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Всего в облаке</CardTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-slate-800">{leadPool.length}</span>
            <span className="text-slate-600">лидов</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Сумма по всем типам аккаунтов (Первичка, Вторичка, Аренда, Рекламные кампании).
          </p>
        </CardContent>
      </Card>

      <Dialog open={openSource !== null} onOpenChange={() => setOpenSource(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-5" />
              {openSource !== null && (
                <>
                  {SOURCE_LABELS[openSource]} — {leadsBySource(openSource).length} лидов
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {openSource !== null && (
            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
              {leadsBySource(openSource).length === 0 ? (
                <p className="py-8 text-center text-slate-500">Нет лидов в этой очереди.</p>
              ) : (
                leadsBySource(openSource).map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    source={openSource}
                    getStageName={getStageName}
                    getManagerName={getManagerName}
                    onOpenCard={() => {
                      setOpenSource(null)
                      setOpenLeadId(lead.id)
                    }}
                  />
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Карточка лида: провалиться в детали, менеджер с полным именем */}
      <Dialog open={openLead !== null} onOpenChange={() => setOpenLeadId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="size-5" />
              Карточка лида
            </DialogTitle>
          </DialogHeader>
          {openLead && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium text-slate-500">ID</p>
                <p className="font-mono text-sm text-slate-900">{openLead.id}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-slate-600">Очередь</Label>
                  <p className="mt-1 font-medium">{SOURCE_LABELS[openLead.source]}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Канал</Label>
                  <p className="mt-1 font-medium">
                    {openLead.channel ? CHANNEL_LABELS[openLead.channel] : '—'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-slate-600">Дата поступления</Label>
                <p className="mt-1 text-sm text-slate-900">
                  {new Date(openLead.createdAt).toLocaleString('ru-RU')}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600">Стадия</Label>
                <p className="font-medium">{getStageName(openLead.stageId)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600">Менеджер</Label>
                {canAssign ? (
                  <Select
                    value={openLead.managerId ?? '_none'}
                    onValueChange={(v) => {
                      if (v === '_none') {
                        dispatch({ type: 'UNASSIGN_LEAD', leadId: openLead.id })
                      } else {
                        const mgr = leadManagers.find((m) => m.id === v)
                        setPendingAssign({ leadId: openLead.id, managerId: v, managerName: mgr?.name ?? v })
                      }
                    }}
                  >
                    <SelectTrigger className="w-full min-w-0 border-slate-200">
                      <SelectValue placeholder="Выберите менеджера" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">— Не назначен</SelectItem>
                      {leadManagers
                        .filter((m) => m.sourceTypes.includes(openLead.source))
                        .map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {getManagerName(openLead.managerId)}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingAssign} onOpenChange={(open) => { if (!open) setPendingAssign(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите передачу лида</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите передать лид{' '}
              <span className="font-semibold text-slate-800">{pendingAssign?.leadId}</span> менеджеру{' '}
              <span className="font-semibold text-slate-800">{pendingAssign?.managerName}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingAssign(null)}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingAssign) {
                  dispatch({ type: 'ASSIGN_LEAD', leadId: pendingAssign.leadId, managerId: pendingAssign.managerId })
                }
                setPendingAssign(null)
              }}
            >
              Передать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function LeadRow({
  lead,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- передаётся для единообразия вызова
  source: _source,
  getStageName,
  getManagerName,
  onOpenCard,
}: {
  lead: Lead
  source: LeadSource
  getStageName: (id: string) => string
  getManagerName: (id: string | null) => string
  onOpenCard: () => void
}) {
  const managerName = getManagerName(lead.managerId)
  return (
    <button
      type="button"
      onClick={onOpenCard}
      className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-left text-sm transition-colors hover:border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
    >
      <span className="font-mono text-xs text-slate-400">{lead.id}</span>
      <Badge variant="secondary" className="text-xs font-normal">
        {getStageName(lead.stageId)}
      </Badge>
      <span className="min-w-0 flex-1 truncate text-slate-700" title={managerName}>
        {managerName === '—' ? 'Не назначен' : managerName}
      </span>
      <ChevronRight className="size-4 shrink-0 text-slate-400" />
    </button>
  )
}
