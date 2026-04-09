import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, Filter, ShieldCheck } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type VerifyState = 'verified' | 'pending' | 'expired_docs' | 'suspended'

const STATE_LABEL: Record<VerifyState, string> = {
  verified: 'Проверен',
  pending: 'На проверке',
  expired_docs: 'Истекли документы',
  suspended: 'Приостановлен',
}

const PARTNERS: Array<{
  name: string
  region: string
  state: VerifyState
  lastCheck: string
  docExpires: string
  checklistOk: number
  checklistTotal: number
  incidents90d: number
}> = [
  { name: 'Альфа-недвижимость', region: 'Москва', state: 'verified', lastCheck: '02.04.2026', docExpires: '01.10.2026', checklistOk: 8, checklistTotal: 8, incidents90d: 0 },
  { name: 'GeoPrime Realty', region: 'Москва', state: 'verified', lastCheck: '28.03.2026', docExpires: '15.09.2026', checklistOk: 8, checklistTotal: 8, incidents90d: 1 },
  { name: 'Сити Экспресс', region: 'МО', state: 'pending', lastCheck: '30.03.2026', docExpires: '—', checklistOk: 5, checklistTotal: 8, incidents90d: 0 },
  { name: 'Batumi Invest Brokers', region: 'Регионы', state: 'pending', lastCheck: '25.03.2026', docExpires: '—', checklistOk: 4, checklistTotal: 8, incidents90d: 2 },
  { name: 'Северный квартал', region: 'СПб', state: 'expired_docs', lastCheck: '10.02.2026', docExpires: '01.03.2026', checklistOk: 6, checklistTotal: 8, incidents90d: 1 },
  { name: 'West Capital Homes', region: 'МО', state: 'verified', lastCheck: '01.04.2026', docExpires: '20.08.2026', checklistOk: 7, checklistTotal: 8, incidents90d: 0 },
  { name: 'Регион Плюс', region: 'Регионы', state: 'suspended', lastCheck: '15.01.2026', docExpires: '—', checklistOk: 3, checklistTotal: 8, incidents90d: 4 },
]

export default function MlsVerificationSecondaryPage() {
  const [region, setRegion] = useState<string>('all')
  const [stateFilter, setStateFilter] = useState<'all' | VerifyState>('all')
  const [incidentsOnly, setIncidentsOnly] = useState(false)

  const regionOptions = useMemo(() => Array.from(new Set(PARTNERS.map((p) => p.region))), [])

  const filtered = useMemo(() => {
    let rows = [...PARTNERS]
    if (region !== 'all') rows = rows.filter((p) => p.region === region)
    if (stateFilter !== 'all') rows = rows.filter((p) => p.state === stateFilter)
    if (incidentsOnly) rows = rows.filter((p) => p.incidents90d > 0)
    return rows
  }, [incidentsOnly, region, stateFilter])

  const kpi = useMemo(() => {
    const verified = PARTNERS.filter((p) => p.state === 'verified').length
    const pending = PARTNERS.filter((p) => p.state === 'pending').length
    const risk = PARTNERS.filter((p) => p.state === 'expired_docs' || p.state === 'suspended').length
    const avgChecklist =
      PARTNERS.length > 0
        ? Math.round((PARTNERS.reduce((s, p) => s + p.checklistOk / p.checklistTotal, 0) / PARTNERS.length) * 100)
        : 0
    return { total: PARTNERS.length, verified, pending, risk, avgChecklist }
  }, [])

  const queue = useMemo(() => PARTNERS.filter((p) => p.state === 'pending' || p.state === 'expired_docs').sort((a, b) => a.checklistOk - b.checklistOk), [])

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Верификация партнеров MLS вторичного рынка</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Статусы допуска, сроки документов и контрольный чек-лист по каждому партнёру.
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Регион: все</option>
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value as 'all' | VerifyState)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Статус: все</option>
                <option value="verified">Проверен</option>
                <option value="pending">На проверке</option>
                <option value="expired_docs">Истекли документы</option>
                <option value="suspended">Приостановлен</option>
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]">
                <input type="checkbox" checked={incidentsOnly} onChange={(e) => setIncidentsOnly(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
                Есть инциденты за 90 дн.
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">В реестре</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.total}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Проверены</p>
              <p className="text-xl font-bold text-emerald-300">{kpi.verified}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">В работе</p>
              <p className="text-xl font-bold text-amber-300">{kpi.pending}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Риск / стоп</p>
              <p className="text-xl font-bold text-red-300">{kpi.risk}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Ср. чек-лист</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.avgChecklist}%</p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Статусы партнёров</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Партнёр</th>
                    <th className="px-2 py-2">Регион</th>
                    <th className="px-2 py-2">Статус</th>
                    <th className="px-2 py-2">Последняя проверка</th>
                    <th className="px-2 py-2">Документы до</th>
                    <th className="px-2 py-2">Чек-лист</th>
                    <th className="px-2 py-2">Инциденты</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const ok = p.state === 'verified'
                    const bad = p.state === 'suspended'
                    return (
                      <tr key={p.name} className="border-b border-[color:var(--workspace-row-border)]">
                        <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{p.name}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{p.region}</td>
                        <td className="px-2 py-2">
                          <span
                            className={
                              ok
                                ? 'inline-flex items-center gap-1 text-emerald-300'
                                : bad
                                  ? 'inline-flex items-center gap-1 text-red-300'
                                  : 'inline-flex items-center gap-1 text-amber-300'
                            }
                          >
                            {ok ? <CheckCircle2 className="size-3.5" /> : bad ? <AlertTriangle className="size-3.5" /> : <Clock className="size-3.5" />}
                            {STATE_LABEL[p.state]}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{p.lastCheck}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{p.docExpires}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">
                          {p.checklistOk}/{p.checklistTotal}
                        </td>
                        <td className={p.incidents90d > 0 ? 'px-2 py-2 text-amber-300' : 'px-2 py-2 text-[color:var(--workspace-text-muted)]'}>
                          {p.incidents90d}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Очередь на решение</h2>
            </div>
            <p className="mb-2 text-xs text-[color:var(--app-text-muted)]">Партнёры со статусом «на проверке» или просроченными документами.</p>
            <ul className="space-y-2">
              {queue.map((p) => (
                <li
                  key={p.name}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm"
                >
                  <span className="font-medium text-[color:var(--workspace-text)]">{p.name}</span>
                  <span className="text-xs text-[color:var(--workspace-text-muted)]">
                    {STATE_LABEL[p.state]} · чек-лист {p.checklistOk}/{p.checklistTotal}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
