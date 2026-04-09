import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, Filter, Wallet } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type FinanceOp = {
  id: string
  date: string
  type: 'income' | 'expense'
  category: string
  amount: number
  note: string
  manager: string
  status: 'posted' | 'pending'
}

const OPS: FinanceOp[] = [
  { id: 'fo-1', date: '2026-04-07', type: 'income', category: 'Комиссия по сделке', amount: 312000, note: 'Сделка deal-12', manager: 'Анна Первичкина', status: 'posted' },
  { id: 'fo-2', date: '2026-04-06', type: 'expense', category: 'Маркетинг', amount: 118000, note: 'Трафик по лидам', manager: 'Дмитрий Коваль', status: 'posted' },
  { id: 'fo-3', date: '2026-04-06', type: 'income', category: 'Аванс партнёра', amount: 145000, note: 'Первичный рынок', manager: 'Анна Первичкина', status: 'pending' },
  { id: 'fo-4', date: '2026-04-05', type: 'expense', category: 'Операционные', amount: 51000, note: 'Офис и сервисы', manager: 'Лариса Морозова', status: 'posted' },
  { id: 'fo-5', date: '2026-04-05', type: 'income', category: 'Комиссия по сделке', amount: 286000, note: 'Сделка deal-6', manager: 'Дмитрий Коваль', status: 'posted' },
  { id: 'fo-6', date: '2026-04-04', type: 'expense', category: 'Выплаты агентам', amount: 164000, note: 'Период 01–31.03', manager: 'Анна Первичкина', status: 'posted' },
  { id: 'fo-7', date: '2026-04-04', type: 'income', category: 'Консультации', amount: 48000, note: 'Юр. сопровождение', manager: 'Лариса Морозова', status: 'posted' },
  { id: 'fo-8', date: '2026-04-03', type: 'expense', category: 'MLS и подписки', amount: 22000, note: 'Квартальное продление', manager: 'Дмитрий Коваль', status: 'posted' },
  { id: 'fo-9', date: '2026-04-03', type: 'income', category: 'Комиссия по сделке', amount: 198000, note: 'Аренда коммерция', manager: 'Анна Первичкина', status: 'pending' },
  { id: 'fo-10', date: '2026-04-02', type: 'expense', category: 'Обучение', amount: 36000, note: 'Курс для новичков', manager: 'Лариса Морозова', status: 'posted' },
  { id: 'fo-11', date: '2026-04-01', type: 'income', category: 'Комиссия по сделке', amount: 421000, note: 'Новостройка, эскроу', manager: 'Дмитрий Коваль', status: 'posted' },
  { id: 'fo-12', date: '2026-04-01', type: 'expense', category: 'Налоги и взносы', amount: 87000, note: 'Аванс по кварталу', manager: 'Анна Первичкина', status: 'pending' },
]

const money = new Intl.NumberFormat('ru-RU')

export default function FinancePanelPage() {
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [manager, setManager] = useState<string>('all')
  const [pendingOnly, setPendingOnly] = useState(false)

  const managerOptions = useMemo(() => Array.from(new Set(OPS.map((o) => o.manager))).sort(), [])

  const filtered = useMemo(() => {
    let rows = [...OPS]
    if (typeFilter !== 'all') rows = rows.filter((o) => o.type === typeFilter)
    if (manager !== 'all') rows = rows.filter((o) => o.manager === manager)
    if (pendingOnly) rows = rows.filter((o) => o.status === 'pending')
    return rows.sort((a, b) => b.date.localeCompare(a.date))
  }, [manager, pendingOnly, typeFilter])

  const kpi = useMemo(() => {
    const income = filtered.filter((o) => o.type === 'income').reduce((s, o) => s + o.amount, 0)
    const expense = filtered.filter((o) => o.type === 'expense').reduce((s, o) => s + o.amount, 0)
    const pendingIn = OPS.filter((o) => o.status === 'pending' && o.type === 'income').reduce((s, o) => s + o.amount, 0)
    const pendingOut = OPS.filter((o) => o.status === 'pending' && o.type === 'expense').reduce((s, o) => s + o.amount, 0)
    const postedIncome = OPS.filter((o) => o.type === 'income' && o.status === 'posted').reduce((s, o) => s + o.amount, 0)
    const postedExpense = OPS.filter((o) => o.type === 'expense' && o.status === 'posted').reduce((s, o) => s + o.amount, 0)
    return { income, expense, balance: income - expense, pendingIn, pendingOut, postedIncome, postedExpense }
  }, [filtered])

  const pendingQueue = useMemo(() => OPS.filter((o) => o.status === 'pending').sort((a, b) => b.date.localeCompare(a.date)), [])

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Панель управления финансами</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Операции, проводки и очередь на подтверждение в одном контуре.
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Тип: все операции</option>
                <option value="income">Только доходы</option>
                <option value="expense">Только расходы</option>
              </select>
              <select
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Ответственный: все</option>
                {managerOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]">
                <input type="checkbox" checked={pendingOnly} onChange={(e) => setPendingOnly(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
                Только ожидают проводки
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Доходы (фильтр)</p>
              <p className="text-xl font-bold text-emerald-400">{money.format(kpi.income)} $</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Расходы (фильтр)</p>
              <p className="text-xl font-bold text-red-400">{money.format(kpi.expense)} $</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Сальдо (фильтр)</p>
              <p className={kpi.balance >= 0 ? 'text-xl font-bold text-[color:var(--theme-accent-heading)]' : 'text-xl font-bold text-red-300'}>
                {money.format(kpi.balance)} $
              </p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">К проводке +</p>
              <p className="text-xl font-bold text-amber-300">{money.format(kpi.pendingIn)} $</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">К проводке −</p>
              <p className="text-xl font-bold text-amber-300">{money.format(kpi.pendingOut)} $</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Итого проведено</p>
              <p className="text-xs text-[color:var(--workspace-text-muted)]">
                +{money.format(kpi.postedIncome)} / −{money.format(kpi.postedExpense)} $
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Wallet className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Журнал операций</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Дата</th>
                    <th className="px-2 py-2">Тип</th>
                    <th className="px-2 py-2">Категория</th>
                    <th className="px-2 py-2">Сумма</th>
                    <th className="px-2 py-2">Ответственный</th>
                    <th className="px-2 py-2">Статус</th>
                    <th className="px-2 py-2">Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((op) => (
                    <tr key={op.id} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{op.date}</td>
                      <td className="px-2 py-2">
                        <span className="inline-flex items-center gap-1">
                          {op.type === 'income' ? (
                            <ArrowUpCircle className="size-3.5 text-emerald-300" />
                          ) : (
                            <ArrowDownCircle className="size-3.5 text-red-300" />
                          )}
                          <span className={op.type === 'income' ? 'text-emerald-300' : 'text-red-300'}>
                            {op.type === 'income' ? 'Доход' : 'Расход'}
                          </span>
                        </span>
                      </td>
                      <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{op.category}</td>
                      <td className={op.type === 'income' ? 'px-2 py-2 font-semibold text-emerald-300' : 'px-2 py-2 font-semibold text-red-300'}>
                        {op.type === 'income' ? '+' : '−'} {money.format(op.amount)} $
                      </td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{op.manager}</td>
                      <td className="px-2 py-2">
                        <span className={op.status === 'posted' ? 'text-[color:var(--workspace-text-muted)]' : 'text-amber-300'}>
                          {op.status === 'posted' ? 'Проведено' : 'Ожидает'}
                        </span>
                      </td>
                      <td className="max-w-[220px] truncate px-2 py-2 text-xs text-[color:var(--workspace-text-muted)]" title={op.note}>
                        {op.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Очередь на проводку</h2>
            </div>
            {pendingQueue.length === 0 ? (
              <p className="text-sm text-[color:var(--app-text-muted)]">Нет операций в статусе «ожидает».</p>
            ) : (
              <ul className="space-y-2">
                {pendingQueue.map((op) => (
                  <li
                    key={op.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-[color:var(--workspace-text)]">{op.category}</span>
                    <span className={op.type === 'income' ? 'text-emerald-300' : 'text-red-300'}>
                      {op.type === 'income' ? '+' : '−'} {money.format(op.amount)} $
                    </span>
                    <span className="text-xs text-[color:var(--workspace-text-muted)]">
                      {op.date} · {op.manager}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
