import { useMemo, useState } from 'react'
import { BarChart3, Filter } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { TeamKpiPage, MOCK_KPI } from '@/components/team/TeamKpiPage'
import { MOCK_EMPLOYEES, ROLE_LABELS } from '@/data/personnel-mock'
import { formatUsdMillions } from '@/lib/format-currency'

const SELECT_CLASS =
  'rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]'

/**
 * ТЗ 12.5: полноэкранный отчёт по команде — фильтры периода/разреза, KPI-витрина и сводная таблица.
 */
export default function TeamReportPage() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [branchFilter, setBranchFilter] = useState<'all' | 'msk' | 'spb'>('all')

  const tableRows = useMemo(() => {
    return MOCK_EMPLOYEES.filter((e) => e.role !== 'owner').map((e) => {
      const k = MOCK_KPI[e.id] ?? { leadsMonth: 0, dealsMonth: 0, revenue: 0, plan: 0, activeTasks: 0 }
      const branch =
        e.id === 'emp-rop-spb' || e.managerId === 'emp-rop-spb' ? 'spb' : e.role === 'director' ? 'all' : 'msk'
      return { e, k, branch }
    })
  }, [])

  const filteredRows = useMemo(() => {
    if (branchFilter === 'all') return tableRows
    return tableRows.filter((r) => r.branch === branchFilter || r.e.role === 'director')
  }, [branchFilter, tableRows])

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="w-full space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Отчёт по команде</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Разрезы периода и офиса, карточная витрина KPI и агрегирующая таблица (шаблон под выгрузку и API).
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Разрез отчёта</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs text-[color:var(--app-text-muted)]">
                <span className="font-semibold text-[color:var(--workspace-text)]">Период</span>
                <select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)} className={SELECT_CLASS}>
                  <option value="month">Месяц</option>
                  <option value="quarter">Квартал</option>
                  <option value="year">Год</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-[color:var(--app-text-muted)]">
                <span className="font-semibold text-[color:var(--workspace-text)]">Офис / направление</span>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value as typeof branchFilter)}
                  className={SELECT_CLASS}
                >
                  <option value="all">Все</option>
                  <option value="msk">Москва и МО</option>
                  <option value="spb">Санкт-Петербург</option>
                </select>
              </label>
              <div className="flex items-end text-xs text-[color:var(--workspace-text-muted)]">
                Итоги таблицы ниже пересчитываются по выбранному разрезу; карточки — интерактивная витрина по той же выборке.
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Сводная таблица</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Сотрудник</th>
                    <th className="px-2 py-2">Роль</th>
                    <th className="px-2 py-2">План</th>
                    <th className="px-2 py-2">Лиды</th>
                    <th className="px-2 py-2">Сделки</th>
                    <th className="px-2 py-2">Выручка</th>
                    <th className="px-2 py-2">Задачи</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(({ e, k }) => (
                    <tr key={e.id} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{e.name}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{ROLE_LABELS[e.role]}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{k.plan}%</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{k.leadsMonth}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{k.dealsMonth}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{formatUsdMillions(k.revenue, 1)}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{k.activeTasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-[var(--hub-card-border)] bg-[var(--app-bg)]">
            <div className="border-b border-[var(--hub-card-border)] px-4 py-2">
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">KPI по сотрудникам</h2>
            </div>
            <TeamKpiPage embedded />
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
