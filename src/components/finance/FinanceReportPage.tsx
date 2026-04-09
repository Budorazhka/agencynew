import { useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, Filter, Landmark, TrendingUp } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

const money = new Intl.NumberFormat('ru-RU')

const REPORT_ROWS = [
  { period: 'Неделя 14', income: 612000, expense: 198000, commission: 286000, payouts: 154000, manager: 'Анна Первичкина', operationType: 'all' as const },
  { period: 'Неделя 13', income: 550000, expense: 221000, commission: 254000, payouts: 133000, manager: 'Дмитрий Коваль', operationType: 'all' as const },
  { period: 'Неделя 12', income: 479000, expense: 184000, commission: 219000, payouts: 121000, manager: 'Анна Первичкина', operationType: 'all' as const },
  { period: 'Неделя 11', income: 428000, expense: 176000, commission: 201000, payouts: 117000, manager: 'Лариса Морозова', operationType: 'all' as const },
]

export default function FinanceReportPage() {
  const [period, setPeriod] = useState<'12w' | '4w' | 'all'>('12w')
  const [operationType, setOperationType] = useState<'all' | 'income' | 'expense'>('all')
  const [manager, setManager] = useState<'all' | string>('all')

  const managerOptions = useMemo(() => Array.from(new Set(REPORT_ROWS.map((r) => r.manager))), [])

  const filtered = useMemo(() => {
    let rows = [...REPORT_ROWS]
    if (period === '4w') rows = rows.slice(0, 4)
    if (manager !== 'all') rows = rows.filter((r) => r.manager === manager)
    if (operationType === 'income') rows = rows.map((r) => ({ ...r, expense: 0, payouts: 0 }))
    if (operationType === 'expense') rows = rows.map((r) => ({ ...r, income: 0, commission: 0 }))
    return rows
  }, [manager, operationType, period])

  const kpi = useMemo(() => {
    const income = filtered.reduce((s, r) => s + r.income, 0)
    const expense = filtered.reduce((s, r) => s + r.expense, 0)
    const commission = filtered.reduce((s, r) => s + r.commission, 0)
    const payouts = filtered.reduce((s, r) => s + r.payouts, 0)
    const result = income - expense
    return { income, expense, commission, payouts, result }
  }, [filtered])

  const riskWeeks = useMemo(() => filtered.filter((r) => r.income - r.expense < 250000), [filtered])
  const maxIncome = Math.max(1, ...filtered.map((r) => r.income))

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="w-full space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Отчёт по финансам</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Сводка по доходам, расходам, комиссиям и выплатам в динамике.
            </p>
          </div>
          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <select value={period} onChange={(e) => setPeriod(e.target.value as '12w' | '4w' | 'all')} className="rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]">
                <option value="4w">Период: 4 недели</option>
                <option value="12w">Период: 12 недель</option>
                <option value="all">Период: весь</option>
              </select>
              <select value={operationType} onChange={(e) => setOperationType(e.target.value as 'all' | 'income' | 'expense')} className="rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]">
                <option value="all">Тип операции: все</option>
                <option value="income">Доходы</option>
                <option value="expense">Расходы</option>
              </select>
              <select value={manager} onChange={(e) => setManager(e.target.value)} className="rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]">
                <option value="all">Сотрудник: все</option>
                {managerOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </section>
          <section className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Доходы</p><p className="text-xl font-bold text-emerald-300">{money.format(kpi.income)} $</p></div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Расходы</p><p className="text-xl font-bold text-red-300">{money.format(kpi.expense)} $</p></div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Комиссии</p><p className="text-xl font-bold text-[color:var(--workspace-text)]">{money.format(kpi.commission)} $</p></div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Выплаты</p><p className="text-xl font-bold text-[color:var(--workspace-text)]">{money.format(kpi.payouts)} $</p></div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Результат</p><p className={kpi.result >= 0 ? 'text-xl font-bold text-emerald-300' : 'text-xl font-bold text-red-300'}>{money.format(kpi.result)} $</p></div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Финансовая динамика</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Период</th>
                    <th className="px-2 py-2">Доходы</th>
                    <th className="px-2 py-2">Расходы</th>
                    <th className="px-2 py-2">Комиссии</th>
                    <th className="px-2 py-2">Выплаты</th>
                    <th className="px-2 py-2">Результат</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const result = row.income - row.expense
                    return (
                      <tr key={row.period} className="border-b border-[color:var(--workspace-row-border)]">
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.period}</td>
                        <td className="px-2 py-2 text-emerald-300">{money.format(row.income)} $</td>
                        <td className="px-2 py-2 text-red-300">{money.format(row.expense)} $</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{money.format(row.commission)} $</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{money.format(row.payouts)} $</td>
                        <td className={result >= 0 ? 'px-2 py-2 text-emerald-300' : 'px-2 py-2 text-red-300'}>
                          {money.format(result)} $
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-300" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Рисковые периоды</h2>
              </div>
              <div className="space-y-2">
                {riskWeeks.map((row) => (
                  <div key={row.period} className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2">
                    <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{row.period}</p>
                    <p className="mt-1 text-xs text-[color:var(--workspace-text-muted)]">
                      Доход: {money.format(row.income)} $ · Расход: {money.format(row.expense)} $
                    </p>
                  </div>
                ))}
                {riskWeeks.length === 0 && <p className="text-sm text-[color:var(--workspace-text-muted)]">Рисковых периодов нет.</p>}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Тренд доходов</h2>
              </div>
              <div className="space-y-2">
                {filtered.map((row) => (
                  <div key={`${row.period}-bar`}>
                    <div className="mb-1 flex items-center justify-between text-xs text-[color:var(--workspace-text-muted)]">
                      <span>{row.period}</span>
                      <span>{money.format(row.income)} $</span>
                    </div>
                    <div className="h-2 rounded-full bg-[rgba(255,255,255,0.07)]">
                      <div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${Math.round((row.income / maxIncome) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-[color:var(--theme-accent-heading)]">
              <Landmark className="size-4 text-[color:var(--gold)]" />
              Комментарий
            </p>
            <p className="mt-2 text-sm text-[color:var(--workspace-text-muted)]">
              На текущем UI-этапе отчет показывает структуру таблицы и KPI-блоков; детализация по менеджерам/сделкам подключается после API.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
