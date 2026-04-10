import { useMemo, useState } from 'react'
import { BarChart3, Filter, UserRound } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { MOCK_EMPLOYEES, ROLE_LABELS, type Employee } from '@/data/personnel-mock'
import { MOCK_KPI } from '@/components/team/TeamKpiPage'
import { formatUsdMillions } from '@/lib/format-currency'

const SELECT_CLASS =
  'rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]'

/** Расширенные показатели для шаблона отчёта по менеджеру (мок). */
const MANAGER_ACTIVITY_MOCK: Record<
  string,
  { callsWeek: number; meetingsWeek: number; showingsWeek: number; overdueTasks: number }
> = {
  'emp-mgr-1': { callsWeek: 42, meetingsWeek: 11, showingsWeek: 6, overdueTasks: 1 },
  'emp-mgr-2': { callsWeek: 28, meetingsWeek: 7, showingsWeek: 4, overdueTasks: 3 },
  'emp-mgr-3': { callsWeek: 35, meetingsWeek: 9, showingsWeek: 5, overdueTasks: 0 },
  'emp-mgr-4': { callsWeek: 51, meetingsWeek: 14, showingsWeek: 8, overdueTasks: 0 },
  'emp-mgr-5': { callsWeek: 22, meetingsWeek: 5, showingsWeek: 3, overdueTasks: 4 },
  'emp-mgr-6': { callsWeek: 31, meetingsWeek: 8, showingsWeek: 5, overdueTasks: 2 },
  'emp-rop-msk': { callsWeek: 18, meetingsWeek: 16, showingsWeek: 2, overdueTasks: 0 },
  'emp-rop-spb': { callsWeek: 15, meetingsWeek: 14, showingsWeek: 2, overdueTasks: 1 },
  'emp-director': { callsWeek: 12, meetingsWeek: 22, showingsWeek: 1, overdueTasks: 0 },
}

const WEEKLY_TREND_MOCK: Record<string, Array<{ label: string; planPct: number; deals: number; leads: number }>> = {
  default: [
    { label: 'Нед. 1', planPct: 78, deals: 1, leads: 12 },
    { label: 'Нед. 2', planPct: 92, deals: 2, leads: 15 },
    { label: 'Нед. 3', planPct: 65, deals: 0, leads: 9 },
    { label: 'Нед. 4', planPct: 88, deals: 2, leads: 14 },
  ],
}

function pickReportSubjects(): Employee[] {
  return MOCK_EMPLOYEES.filter((e) => e.role === 'manager' || e.role === 'rop' || e.role === 'director')
}

export default function ManagerReportView() {
  const subjects = useMemo(() => pickReportSubjects(), [])
  const [employeeId, setEmployeeId] = useState(subjects[0]?.id ?? '')
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month')

  const emp = useMemo(() => subjects.find((e) => e.id === employeeId) ?? subjects[0], [employeeId, subjects])
  const kpi = emp ? MOCK_KPI[emp.id] : null
  const act = emp ? MANAGER_ACTIVITY_MOCK[emp.id] ?? { callsWeek: 20, meetingsWeek: 6, showingsWeek: 3, overdueTasks: 1 } : null
  const trend = WEEKLY_TREND_MOCK.default

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="w-full space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Отчёт по менеджеру</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Сводка по выбранному сотруднику: план, сделки, активность и динамика (шаблон под API).
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Параметры отчёта</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs text-[color:var(--app-text-muted)]">
                <span className="font-semibold text-[color:var(--workspace-text)]">Сотрудник</span>
                <select value={emp?.id ?? ''} onChange={(e) => setEmployeeId(e.target.value)} className={SELECT_CLASS}>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {ROLE_LABELS[s.role]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-[color:var(--app-text-muted)]">
                <span className="font-semibold text-[color:var(--workspace-text)]">Период</span>
                <select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)} className={SELECT_CLASS}>
                  <option value="week">Текущая неделя</option>
                  <option value="month">Текущий месяц</option>
                  <option value="quarter">Квартал</option>
                </select>
              </label>
              <div className="flex items-end rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text-muted)]">
                Данные ниже — демо-наполнение; после интеграции API период и факты подтянутся из бэкенда.
              </div>
            </div>
          </section>

          {emp && kpi && act && (
            <>
              <section className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                  <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">План</p>
                  <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.plan}%</p>
                </div>
                <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                  <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Сделки (мес.)</p>
                  <p className="text-xl font-bold text-[color:var(--gold)]">{kpi.dealsMonth}</p>
                </div>
                <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                  <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Лиды (мес.)</p>
                  <p className="text-xl font-bold text-emerald-300">{kpi.leadsMonth}</p>
                </div>
                <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                  <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Выручка</p>
                  <p className="text-xl font-bold text-[color:var(--workspace-text)]">{formatUsdMillions(kpi.revenue, 1)}</p>
                </div>
                <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                  <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Задачи активные</p>
                  <p className="text-xl font-bold text-violet-300">{kpi.activeTasks}</p>
                </div>
                <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                  <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Просрочено задач</p>
                  <p className={`text-xl font-bold ${act.overdueTasks > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>{act.overdueTasks}</p>
                </div>
              </section>

              <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                <div className="mb-3 flex items-center gap-2">
                  <UserRound className="size-4 text-[color:var(--gold)]" />
                  <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Активность за неделю</h2>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2">
                    <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Звонки</p>
                    <p className="text-lg font-bold text-[color:var(--workspace-text)]">{act.callsWeek}</p>
                  </div>
                  <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2">
                    <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Встречи</p>
                    <p className="text-lg font-bold text-[color:var(--workspace-text)]">{act.meetingsWeek}</p>
                  </div>
                  <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2">
                    <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Показы</p>
                    <p className="text-lg font-bold text-[color:var(--workspace-text)]">{act.showingsWeek}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                <div className="mb-3 flex items-center gap-2">
                  <BarChart3 className="size-4 text-[color:var(--gold)]" />
                  <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Динамика по неделям (мок)</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                        <th className="px-2 py-2">Период</th>
                        <th className="px-2 py-2">План, %</th>
                        <th className="px-2 py-2">Сделки</th>
                        <th className="px-2 py-2">Лиды</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trend.map((row) => (
                        <tr key={row.label} className="border-b border-[color:var(--workspace-row-border)]">
                          <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{row.label}</td>
                          <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.planPct}%</td>
                          <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.deals}</td>
                          <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{row.leads}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
