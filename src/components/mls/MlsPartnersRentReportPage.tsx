import { useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, Filter, KeyRound, TrendingUp } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type PartnerRow = {
  name: string
  region: string
  listings: number
  deals90d: number
  avgLeaseMonths: number
  renewalPct: number
  verifiedPct: number
  daysSinceSync: number
  score: number
}

const PARTNERS: PartnerRow[] = [
  { name: 'Бета Партнёры', region: 'Москва', listings: 118, deals90d: 34, avgLeaseMonths: 11, renewalPct: 28, verifiedPct: 90, daysSinceSync: 2, score: 91 },
  { name: 'Дом на час', region: 'МО', listings: 76, deals90d: 19, avgLeaseMonths: 10, renewalPct: 22, verifiedPct: 86, daysSinceSync: 5, score: 74 },
  { name: 'GeoPrime Realty', region: 'Москва', listings: 62, deals90d: 15, avgLeaseMonths: 9, renewalPct: 24, verifiedPct: 88, daysSinceSync: 2, score: 79 },
  { name: 'Лайт Рент', region: 'СПб', listings: 44, deals90d: 11, avgLeaseMonths: 8, renewalPct: 18, verifiedPct: 82, daysSinceSync: 13, score: 55 },
  { name: 'Batumi Invest Brokers', region: 'Регионы', listings: 38, deals90d: 9, avgLeaseMonths: 7, renewalPct: 15, verifiedPct: 80, daysSinceSync: 6, score: 52 },
  { name: 'West Capital Homes', region: 'МО', listings: 33, deals90d: 7, avgLeaseMonths: 9, renewalPct: 14, verifiedPct: 78, daysSinceSync: 9, score: 47 },
  { name: 'Юг Аренда', region: 'Регионы', listings: 24, deals90d: 5, avgLeaseMonths: 6, renewalPct: 11, verifiedPct: 74, daysSinceSync: 19, score: 38 },
]

const WEEKLY: Array<{ week: string; newListings: number; deals: number; renewals: number }> = [
  { week: 'Неделя 14', newListings: 28, deals: 14, renewals: 4 },
  { week: 'Неделя 13', newListings: 31, deals: 12, renewals: 3 },
  { week: 'Неделя 12', newListings: 24, deals: 11, renewals: 3 },
  { week: 'Неделя 11', newListings: 22, deals: 9, renewals: 2 },
  { week: 'Неделя 10', newListings: 26, deals: 10, renewals: 4 },
  { week: 'Неделя 9', newListings: 20, deals: 8, renewals: 2 },
  { week: 'Неделя 8', newListings: 21, deals: 9, renewals: 3 },
  { week: 'Неделя 7', newListings: 19, deals: 7, renewals: 2 },
  { week: 'Неделя 6', newListings: 17, deals: 7, renewals: 2 },
  { week: 'Неделя 5', newListings: 18, deals: 6, renewals: 2 },
  { week: 'Неделя 4', newListings: 16, deals: 6, renewals: 1 },
  { week: 'Неделя 3', newListings: 15, deals: 5, renewals: 2 },
  { week: 'Неделя 2', newListings: 14, deals: 5, renewals: 1 },
  { week: 'Неделя 1', newListings: 13, deals: 4, renewals: 1 },
]

export default function MlsPartnersRentReportPage() {
  const [period, setPeriod] = useState<'4w' | '12w' | 'all'>('12w')
  const [region, setRegion] = useState<string>('all')
  const [riskOnly, setRiskOnly] = useState(false)

  const regionOptions = useMemo(() => Array.from(new Set(PARTNERS.map((p) => p.region))), [])

  const filteredPartners = useMemo(() => {
    let rows = [...PARTNERS]
    if (region !== 'all') rows = rows.filter((p) => p.region === region)
    if (riskOnly) rows = rows.filter((p) => p.score < 60 || p.daysSinceSync > 7)
    return rows
  }, [region, riskOnly])

  const filteredWeeks = useMemo(() => {
    if (period === '4w') return WEEKLY.slice(0, 4)
    if (period === '12w') return WEEKLY.slice(0, 12)
    return WEEKLY
  }, [period])

  const kpi = useMemo(() => {
    const n = filteredPartners.length
    const listings = filteredPartners.reduce((s, p) => s + p.listings, 0)
    const deals = filteredPartners.reduce((s, p) => s + p.deals90d, 0)
    const verified =
      listings > 0
        ? Math.round(filteredPartners.reduce((s, p) => s + p.verifiedPct * p.listings, 0) / listings)
        : 0
    const avgRenew =
      n > 0 ? Math.round(filteredPartners.reduce((s, p) => s + p.renewalPct, 0) / n) : 0
    const avgLease =
      n > 0 ? Math.round((filteredPartners.reduce((s, p) => s + p.avgLeaseMonths, 0) / n) * 10) / 10 : 0
    return { n, listings, deals, verified, avgRenew, avgLease }
  }, [filteredPartners])

  const problematic = useMemo(
    () =>
      filteredPartners
        .filter((p) => p.score < 60 || p.daysSinceSync > 7 || p.renewalPct < 16)
        .sort((a, b) => a.score - b.score),
    [filteredPartners],
  )

  const maxNew = Math.max(1, ...filteredWeeks.map((w) => w.newListings))

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="w-full space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">
              Отчёт о работе MLS-партнёров по аренде
            </h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Объявления, сделки, сроки договоров и продления в арендном контуре MLS.
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as '4w' | '12w' | 'all')}
                className="rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]"
              >
                <option value="4w">Динамика: 4 недели</option>
                <option value="12w">Динамика: 12 недель</option>
                <option value="all">Динамика: весь период</option>
              </select>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]"
              >
                <option value="all">Регион: все</option>
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]">
                <input
                  type="checkbox"
                  checked={riskOnly}
                  onChange={(e) => setRiskOnly(e.target.checked)}
                  className="size-4 appearance-none rounded border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] checked:border-[var(--gold)] checked:bg-[var(--gold)]"
                />
                Только рисковые партнёры
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Партнёров</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.n}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Объявлений</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.listings}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Сделок 90 дн.</p>
              <p className="text-xl font-bold text-emerald-300">{kpi.deals}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Верификация (взв.)</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.verified}%</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Ср. срок договора</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.avgLease} мес.</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Ср. продления</p>
              <p className="text-xl font-bold text-amber-300">{kpi.avgRenew}%</p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <KeyRound className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Партнёры арендного MLS</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Партнёр</th>
                    <th className="px-2 py-2">Регион</th>
                    <th className="px-2 py-2">Объявл.</th>
                    <th className="px-2 py-2">Сделки 90д</th>
                    <th className="px-2 py-2">Вериф.</th>
                    <th className="px-2 py-2">Ср. срок</th>
                    <th className="px-2 py-2">Продления</th>
                    <th className="px-2 py-2">Синхр.</th>
                    <th className="px-2 py-2">Индекс</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .map((p) => (
                      <tr key={p.name} className="border-b border-[color:var(--workspace-row-border)]">
                        <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{p.name}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{p.region}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{p.listings}</td>
                        <td className="px-2 py-2 text-emerald-300">{p.deals90d}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{p.verifiedPct}%</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{p.avgLeaseMonths} мес.</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{p.renewalPct}%</td>
                        <td className={p.daysSinceSync > 7 ? 'px-2 py-2 text-amber-300' : 'px-2 py-2 text-[color:var(--workspace-text)]'}>
                          {p.daysSinceSync} дн.
                        </td>
                        <td className={p.score >= 70 ? 'px-2 py-2 font-medium text-emerald-300' : 'px-2 py-2 font-medium text-amber-300'}>
                          {p.score}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Динамика сети (аренда)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Неделя</th>
                    <th className="px-2 py-2">Новые объявл.</th>
                    <th className="px-2 py-2">Сделки</th>
                    <th className="px-2 py-2">Продления</th>
                    <th className="px-2 py-2 min-w-[180px]">Новые объявл.</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredWeeks].reverse().map((w) => (
                    <tr key={w.week} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{w.week}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{w.newListings}</td>
                      <td className="px-2 py-2 text-emerald-300">{w.deals}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{w.renewals}</td>
                      <td className="px-2 py-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--workspace-row-border)]">
                          <div
                            className="h-full rounded-full bg-[color:var(--gold)]"
                            style={{ width: `${Math.round((w.newListings / maxNew) * 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Зоны внимания</h2>
              </div>
              {problematic.length === 0 ? (
                <p className="text-sm text-[color:var(--app-text-muted)]">В текущей выборке критичных отклонений нет.</p>
              ) : (
                <ul className="space-y-2">
                  {problematic.map((p) => (
                    <li
                      key={p.name}
                      className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm"
                    >
                      <p className="font-medium text-[color:var(--workspace-text)]">{p.name}</p>
                      <p className="mt-0.5 text-xs text-[color:var(--workspace-text-muted)]">
                        Индекс {p.score} · синхронизация {p.daysSinceSync} дн. · продления {p.renewalPct}%
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Топ по индексу</h2>
              </div>
              <ul className="space-y-2">
                {filteredPartners
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5)
                  .map((p) => (
                    <li
                      key={p.name}
                      className="flex items-center justify-between rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm"
                    >
                      <span className="text-[color:var(--workspace-text)]">{p.name}</span>
                      <span className="text-emerald-300">{p.score}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
