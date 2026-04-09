import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, Filter, ShieldCheck } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type VerifyState = 'cleared' | 'review' | 'blocked' | 'watchlist'

const STATE_LABEL: Record<VerifyState, string> = {
  cleared: 'Допущен',
  review: 'На модерации',
  blocked: 'Заблокирован',
  watchlist: 'Усиленный контроль',
}

const PARTNERS: Array<{
  name: string
  region: string
  state: VerifyState
  lastReview: string
  leaseTemplateOk: boolean
  depositPolicyOk: boolean
  openClaims: number
  notes: string
}> = [
  { name: 'Бета Партнёры', region: 'Москва', state: 'cleared', lastReview: '03.04.2026', leaseTemplateOk: true, depositPolicyOk: true, openClaims: 0, notes: '—' },
  { name: 'GeoPrime Realty', region: 'Москва', state: 'cleared', lastReview: '29.03.2026', leaseTemplateOk: true, depositPolicyOk: true, openClaims: 1, notes: 'Жалоба на описание' },
  { name: 'Дом на час', region: 'МО', state: 'review', lastReview: '31.03.2026', leaseTemplateOk: true, depositPolicyOk: false, openClaims: 0, notes: 'Уточнить залог' },
  { name: 'Batumi Invest Brokers', region: 'Регионы', state: 'review', lastReview: '27.03.2026', leaseTemplateOk: false, depositPolicyOk: true, openClaims: 2, notes: 'Шаблон договора' },
  { name: 'Лайт Рент', region: 'СПб', state: 'watchlist', lastReview: '12.03.2026', leaseTemplateOk: true, depositPolicyOk: true, openClaims: 3, notes: 'Повторные жалобы' },
  { name: 'West Capital Homes', region: 'МО', state: 'cleared', lastReview: '02.04.2026', leaseTemplateOk: true, depositPolicyOk: true, openClaims: 0, notes: '—' },
  { name: 'Юг Аренда', region: 'Регионы', state: 'blocked', lastReview: '18.02.2026', leaseTemplateOk: false, depositPolicyOk: false, openClaims: 5, notes: 'Нарушение политики' },
]

export default function MlsVerificationRentPage() {
  const [region, setRegion] = useState<string>('all')
  const [stateFilter, setStateFilter] = useState<'all' | VerifyState>('all')
  const [claimsOnly, setClaimsOnly] = useState(false)

  const regionOptions = useMemo(() => Array.from(new Set(PARTNERS.map((p) => p.region))), [])

  const filtered = useMemo(() => {
    let rows = [...PARTNERS]
    if (region !== 'all') rows = rows.filter((p) => p.region === region)
    if (stateFilter !== 'all') rows = rows.filter((p) => p.state === stateFilter)
    if (claimsOnly) rows = rows.filter((p) => p.openClaims > 0)
    return rows
  }, [claimsOnly, region, stateFilter])

  const kpi = useMemo(() => {
    const cleared = PARTNERS.filter((p) => p.state === 'cleared').length
    const review = PARTNERS.filter((p) => p.state === 'review').length
    const blocked = PARTNERS.filter((p) => p.state === 'blocked').length
    const watch = PARTNERS.filter((p) => p.state === 'watchlist').length
    const claims = PARTNERS.reduce((s, p) => s + p.openClaims, 0)
    return { total: PARTNERS.length, cleared, review, blocked, watch, claims }
  }, [])

  const actionNeeded = useMemo(
    () =>
      PARTNERS.filter((p) => p.state === 'review' || p.state === 'blocked' || p.openClaims >= 2).sort((a, b) => b.openClaims - a.openClaims),
    [],
  )

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Верификация партнеров MLS аренды</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Модерация арендного контура: шаблоны, залоги, открытые обращения.
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
                <option value="cleared">Допущен</option>
                <option value="review">На модерации</option>
                <option value="watchlist">Усиленный контроль</option>
                <option value="blocked">Заблокирован</option>
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]">
                <input type="checkbox" checked={claimsOnly} onChange={(e) => setClaimsOnly(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
                Есть открытые обращения
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">В реестре</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.total}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Допущены</p>
              <p className="text-xl font-bold text-emerald-300">{kpi.cleared}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">На модерации</p>
              <p className="text-xl font-bold text-amber-300">{kpi.review}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Контроль</p>
              <p className="text-xl font-bold text-amber-200">{kpi.watch}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Блок</p>
              <p className="text-xl font-bold text-red-300">{kpi.blocked}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Обращений</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.claims}</p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Реестр проверок</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Партнёр</th>
                    <th className="px-2 py-2">Регион</th>
                    <th className="px-2 py-2">Статус</th>
                    <th className="px-2 py-2">Последний разбор</th>
                    <th className="px-2 py-2">Шаблон</th>
                    <th className="px-2 py-2">Залог</th>
                    <th className="px-2 py-2">Обращения</th>
                    <th className="px-2 py-2">Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const ok = p.state === 'cleared'
                    const bad = p.state === 'blocked'
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
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{p.lastReview}</td>
                        <td className={p.leaseTemplateOk ? 'px-2 py-2 text-emerald-300' : 'px-2 py-2 text-amber-300'}>
                          {p.leaseTemplateOk ? 'Ок' : 'Нет'}
                        </td>
                        <td className={p.depositPolicyOk ? 'px-2 py-2 text-emerald-300' : 'px-2 py-2 text-amber-300'}>
                          {p.depositPolicyOk ? 'Ок' : 'Нет'}
                        </td>
                        <td className={p.openClaims > 0 ? 'px-2 py-2 text-amber-300' : 'px-2 py-2 text-[color:var(--workspace-text-muted)]'}>
                          {p.openClaims}
                        </td>
                        <td className="max-w-[200px] truncate px-2 py-2 text-xs text-[color:var(--workspace-text-muted)]" title={p.notes}>
                          {p.notes}
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
              <AlertTriangle className="size-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Приоритет разбора</h2>
            </div>
            <p className="mb-2 text-xs text-[color:var(--app-text-muted)]">Модерация, блокировки и партнёры с несколькими обращениями.</p>
            <ul className="space-y-2">
              {actionNeeded.map((p) => (
                <li
                  key={p.name}
                  className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="ml-2 text-xs text-[color:var(--workspace-text-muted)]">
                    {STATE_LABEL[p.state]} · обращений: {p.openClaims} · {p.notes}
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
