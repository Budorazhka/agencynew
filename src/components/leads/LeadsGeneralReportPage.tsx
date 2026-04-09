import { useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, Filter, Users } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { useLeads } from '@/context/LeadsContext'
import { LEAD_STAGE_COLUMN, LEAD_STAGES } from '@/data/leads-mock'
import type { Lead, LeadSource } from '@/types/leads'

const SOURCE_LABELS: Record<LeadSource, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
  rent: 'Аренда',
  ad_campaigns: 'Реклама',
}

const STAGE_NAME_BY_ID = Object.fromEntries(LEAD_STAGES.map((s) => [s.id, s.name])) as Record<string, string>
const FILTER_SELECT_CLASS =
  "rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]"

function getIsoWeekKey(iso: string) {
  const d = new Date(iso)
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function leadStatusForFilter(lead: Lead): string {
  if (lead.status) return lead.status
  if (lead.stageId === 'new') return 'new'
  if (LEAD_STAGE_COLUMN[lead.stageId] === 'rejection') return 'lost'
  if (LEAD_STAGE_COLUMN[lead.stageId] === 'success') return 'qualified'
  return 'in_progress'
}

export default function LeadsGeneralReportPage() {
  const { state } = useLeads()
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d')
  const [employee, setEmployee] = useState<string>('all')
  const [team, setTeam] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [source, setSource] = useState<'all' | LeadSource>('all')

  const now = useMemo(() => Date.now(), [])
  const periodLeads = useMemo(() => {
    if (period === 'all') return state.leadPool
    const days = period === '7d' ? 7 : 30
    const threshold = now - days * 24 * 60 * 60 * 1000
    return state.leadPool.filter((l) => new Date(l.createdAt).getTime() >= threshold)
  }, [now, period, state.leadPool])

  const managerById = useMemo(
    () => Object.fromEntries(state.leadManagers.map((m) => [m.id, m])),
    [state.leadManagers],
  )

  const teamLabelByLead = (lead: Lead) => {
    if (!lead.managerId) return 'Без команды'
    const manager = managerById[lead.managerId]
    if (!manager?.sourceTypes.length) return 'Смешанная'
    return SOURCE_LABELS[manager.sourceTypes[0]]
  }

  const filtered = useMemo(() => {
    return periodLeads.filter((lead) => {
      if (employee !== 'all') {
        if (employee === 'unassigned' && lead.managerId !== null) return false
        if (employee !== 'unassigned' && lead.managerId !== employee) return false
      }
      if (team !== 'all' && teamLabelByLead(lead) !== team) return false
      if (status !== 'all' && leadStatusForFilter(lead) !== status) return false
      if (source !== 'all' && lead.source !== source) return false
      return true
    })
  }, [employee, periodLeads, source, status, team])

  const kpi = useMemo(() => {
    const total = filtered.length
    const newLeads = filtered.filter((l) => l.stageId === 'new').length
    const unassigned = filtered.filter((l) => l.managerId == null).length
    const slaBreaches = filtered.filter((l) => l.taskOverdue).length
    const success = filtered.filter((l) => LEAD_STAGE_COLUMN[l.stageId] === 'success').length
    const conversion = total > 0 ? Math.round((success / total) * 100) : 0
    return { total, newLeads, unassigned, slaBreaches, conversion }
  }, [filtered])

  const problematicLeads = useMemo(
    () => filtered.filter((l) => l.taskOverdue || l.managerId == null || LEAD_STAGE_COLUMN[l.stageId] === 'rejection').slice(0, 8),
    [filtered],
  )

  const dynamics = useMemo(() => {
    const map = new Map<string, number>()
    for (const lead of filtered) {
      const key = getIsoWeekKey(lead.createdAt)
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([week, count]) => ({ week, count }))
  }, [filtered])

  const maxDyn = Math.max(1, ...dynamics.map((d) => d.count))
  const teamOptions = useMemo(() => {
    return Array.from(new Set(state.leadPool.map((lead) => teamLabelByLead(lead))))
  }, [state.leadPool])

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="w-full space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Общий отчёт по лидам</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">Состояние потока лидов, SLA и потери на этапах.</p>
          </div>
          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
              <select value={period} onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | 'all')} className={FILTER_SELECT_CLASS}>
                <option value="7d">Период: 7 дней</option>
                <option value="30d">Период: 30 дней</option>
                <option value="all">Период: весь</option>
              </select>
              <select value={employee} onChange={(e) => setEmployee(e.target.value)} className={FILTER_SELECT_CLASS}>
                <option value="all">Сотрудник: все</option>
                <option value="unassigned">Без назначения</option>
                {state.leadManagers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select value={team} onChange={(e) => setTeam(e.target.value)} className={FILTER_SELECT_CLASS}>
                <option value="all">Команда: все</option>
                {teamOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={FILTER_SELECT_CLASS}>
                <option value="all">Статус: все</option>
                <option value="new">Новый</option>
                <option value="in_progress">В работе</option>
                <option value="qualified">Квалифицирован</option>
                <option value="lost">Потерян/отказ</option>
              </select>
              <select value={source} onChange={(e) => setSource(e.target.value as 'all' | LeadSource)} className={FILTER_SELECT_CLASS}>
                <option value="all">Источник: все</option>
                <option value="primary">Первичка</option>
                <option value="secondary">Вторичка</option>
                <option value="rent">Аренда</option>
                <option value="ad_campaigns">Реклама</option>
              </select>
            </div>
          </section>
          <section className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Лидов</p><p className="text-xl font-bold text-[color:var(--theme-accent-heading)]">{kpi.total}</p></div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Новые</p><p className="text-xl font-bold text-blue-300">{kpi.newLeads}</p></div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Без назначения</p><p className="text-xl font-bold text-amber-300">{kpi.unassigned}</p></div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">SLA нарушения</p><p className="text-xl font-bold text-red-300">{kpi.slaBreaches}</p></div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Конверсия</p><p className="text-xl font-bold text-emerald-300">{kpi.conversion}%</p></div>
          </section>
          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Таблица лидов</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Лид</th>
                    <th className="px-2 py-2">Источник</th>
                    <th className="px-2 py-2">Этап</th>
                    <th className="px-2 py-2">Ответственный</th>
                    <th className="px-2 py-2">SLA</th>
                    <th className="px-2 py-2">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 40).map((lead) => (
                    <tr key={lead.id} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{lead.name ?? lead.id}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{SOURCE_LABELS[lead.source]}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{STAGE_NAME_BY_ID[lead.stageId] ?? lead.stageId}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">
                        {lead.managerId ? (managerById[lead.managerId]?.name ?? lead.managerId) : 'Не назначен'}
                      </td>
                      <td className={lead.taskOverdue ? 'px-2 py-2 text-red-300' : 'px-2 py-2 text-emerald-300'}>
                        {lead.taskOverdue ? 'Нарушен' : 'OK'}
                      </td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{new Date(lead.createdAt).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-300" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Проблемные лиды</h2>
              </div>
              <div className="space-y-2">
                {problematicLeads.map((lead) => (
                  <div key={lead.id} className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2">
                    <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{lead.name ?? lead.id}</p>
                    <p className="mt-1 text-xs text-[color:var(--workspace-text-muted)]">
                      {lead.managerId == null ? 'Без назначения' : lead.taskOverdue ? 'Нарушен SLA' : 'Риск потери'}
                    </p>
                  </div>
                ))}
                {problematicLeads.length === 0 && <p className="text-sm text-[color:var(--workspace-text-muted)]">Проблемных лидов нет.</p>}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <Users className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Динамика потока</h2>
              </div>
              <div className="space-y-2">
                {dynamics.map((row) => (
                  <div key={row.week}>
                    <div className="mb-1 flex items-center justify-between text-xs text-[color:var(--workspace-text-muted)]">
                      <span>{row.week}</span>
                      <span>{row.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[rgba(255,255,255,0.07)]">
                      <div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${Math.round((row.count / maxDyn) * 100)}%` }} />
                    </div>
                  </div>
                ))}
                {dynamics.length === 0 && <p className="text-sm text-[color:var(--workspace-text-muted)]">Недостаточно данных для динамики.</p>}
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
