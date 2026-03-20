import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useLeads } from '@/context/LeadsContext'
import type { Lead, LeadSource } from '@/types/leads'
import { LEAD_STAGES } from '@/data/leads-mock'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

const CHANNEL_LABELS: Record<NonNullable<Lead['channel']>, string> = {
  form: 'Форма',
  ad: 'Реклама',
  partner: 'Партнёр',
  other: 'Другое',
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
  rent: 'Аренда',
  ad_campaigns: 'Рекламные кампании',
}

const CHANNEL_ORDER: NonNullable<Lead['channel']>[] = ['form', 'ad', 'partner', 'other']

export function LeadSourcesTab() {
  const { state } = useLeads()
  const { leadPool, leadManagers } = state
  const [openChannel, setOpenChannel] = useState<NonNullable<Lead['channel']> | null>(null)

  const stats = useMemo(() => {
    const byChannel: Record<NonNullable<Lead['channel']>, number> = {
      form: 0,
      ad: 0,
      partner: 0,
      other: 0,
    }
    let withoutChannel = 0
    leadPool.forEach((lead) => {
      if (lead.channel && byChannel[lead.channel] !== undefined) {
        byChannel[lead.channel]++
      } else {
        withoutChannel++
      }
    })
    return { byChannel, withoutChannel, total: leadPool.length }
  }, [leadPool])

  const leadsByOpenChannel = useMemo(() => {
    if (!openChannel) return []
    return leadPool
      .filter((l) => l.channel === openChannel)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [leadPool, openChannel])

  const total = stats.total
  const maxCount = Math.max(...Object.values(stats.byChannel), 1)

  const getStageName = (stageId: string) =>
    LEAD_STAGES.find((s) => s.id === stageId)?.name ?? stageId
  const getManagerName = (managerId: string | null) =>
    managerId ? leadManagers.find((m) => m.id === managerId)?.name ?? managerId : '—'

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-slate-600">
        Распределение лидов по источнику поступления: форма на сайте, реклама, партнёры и другие каналы.
        Нажмите на карточку источника, чтобы открыть список лидов и посмотреть их статус.
      </p>

      <Card className="leads-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Источник лидов</CardTitle>
          <p className="text-sm text-slate-600">
            Всего в облаке: <span className="font-medium tabular-nums">{total}</span> лидов
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CHANNEL_ORDER.map((channel) => {
              const count = stats.byChannel[channel]
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => setOpenChannel(channel)}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700">{CHANNEL_LABELS[channel]}</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{count}</p>
                      <p className="text-xs text-slate-500">{pct}% от общего</p>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-slate-400" />
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-500 transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
          {stats.withoutChannel > 0 && (
            <div className="rounded-lg border border-amber-200/60 bg-amber-50/30 px-3 py-2 text-sm text-slate-600">
              Лидов без указанного источника: <span className="font-medium">{stats.withoutChannel}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openChannel !== null} onOpenChange={(open) => !open && setOpenChannel(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {openChannel != null && (
                <>
                  {CHANNEL_LABELS[openChannel]} — {leadsByOpenChannel.length} лидов
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {openChannel != null && (
            <div className="max-h-[60vh] overflow-y-auto rounded-md border border-slate-200">
              {leadsByOpenChannel.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">Нет лидов по этому источнику.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 font-medium text-slate-700">
                    <tr>
                      <th className="px-3 py-2.5">ID</th>
                      <th className="px-3 py-2.5">Очередь</th>
                      <th className="px-3 py-2.5">Статус</th>
                      <th className="px-3 py-2.5">Менеджер</th>
                      <th className="px-3 py-2.5">Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadsByOpenChannel.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-slate-100 hover:bg-slate-50/80"
                      >
                        <td className="px-3 py-2 font-mono text-xs text-slate-600">{lead.id}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-xs font-normal">
                            {SOURCE_LABELS[lead.source]}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-slate-700">{getStageName(lead.stageId)}</td>
                        <td className="px-3 py-2 text-slate-700">{getManagerName(lead.managerId)}</td>
                        <td className="px-3 py-2 text-slate-600">
                          {new Date(lead.createdAt).toLocaleString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
