import { useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, Filter, TrendingUp, Users } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type PartnerRow = {
  name: string
  region: string
  listings: number
  deals90d: number
  verifiedPct: number
  avgDaysOnMarket: number
  coopDealPct: number
  daysSinceSync: number
  score: number
}

const PARTNERS: PartnerRow[] = [
  { name: 'Альфа-недвижимость', region: 'Москва', listings: 156, deals90d: 28, verifiedPct: 96, avgDaysOnMarket: 42, coopDealPct: 38, daysSinceSync: 1, score: 94 },
  { name: 'Сити Экспресс', region: 'МО', listings: 89, deals90d: 14, verifiedPct: 91, avgDaysOnMarket: 51, coopDealPct: 29, daysSinceSync: 3, score: 78 },
  { name: 'GeoPrime Realty', region: 'Москва', listings: 72, deals90d: 12, verifiedPct: 93, avgDaysOnMarket: 47, coopDealPct: 33, daysSinceSync: 2, score: 81 },
  { name: 'Северный квартал', region: 'СПб', listings: 64, deals90d: 9, verifiedPct: 88, avgDaysOnMarket: 58, coopDealPct: 22, daysSinceSync: 8, score: 62 },
  { name: 'Batumi Invest Brokers', region: 'Регионы', listings: 48, deals90d: 7, verifiedPct: 85, avgDaysOnMarket: 63, coopDealPct: 19, daysSinceSync: 5, score: 58 },
  { name: 'West Capital Homes', region: 'МО', listings: 41, deals90d: 5, verifiedPct: 82, avgDaysOnMarket: 71, coopDealPct: 14, daysSinceSync: 11, score: 48 },
  { name: 'Регион Плюс', region: 'Регионы', listings: 35, deals90d: 4, verifiedPct: 79, avgDaysOnMarket: 76, coopDealPct: 12, daysSinceSync: 16, score: 41 },
]

const WEEKLY: Array<{ week: string; newListings: number; deals: number; coopDeals: number }> = [
  { week: 'Неделя 14', newListings: 42, deals: 11, coopDeals: 4 },
  { week: 'Неделя 13', newListings: 38, deals: 9, coopDeals: 3 },
  { week: 'Неделя 12', newListings: 35, deals: 10, coopDeals: 3 },
  { week: 'Неделя 11', newListings: 33, deals: 8, coopDeals: 2 },
  { week: 'Неделя 10', newListings: 40, deals: 12, coopDeals: 5 },
  { week: 'Неделя 9', newListings: 36, deals: 7, coopDeals: 2 },
  { week: 'Неделя 8', newListings: 34, deals: 9, coopDeals: 3 },
  { week: 'Неделя 7', newListings: 31, deals: 8, coopDeals: 2 },
  { week: 'Неделя 6', newListings: 29, deals: 6, coopDeals: 2 },
  { week: 'Неделя 5', newListings: 32, deals: 8, coopDeals: 2 },
  { week: 'Неделя 4', newListings: 27, deals: 5, coopDeals: 1 },
  { week: 'Неделя 3', newListings: 30, deals: 7, coopDeals: 2 },
  { week: 'Неделя 2', newListings: 28, deals: 6, coopDeals: 2 },
  { week: 'Неделя 1', newListings: 25, deals: 5, coopDeals: 1 },
]

export default function MlsPartnersSecondaryReportPage() {
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
    const avgCoop =
      n > 0 ? Math.round(filteredPartners.reduce((s, p) => s + p.coopDealPct, 0) / n) : 0
    const conv = listings > 0 ? Math.round((deals / listings) * 1000) / 10 : 0
    return { n, listings, deals, verified, avgCoop, conv }
  }, [filteredPartners])

  const problematic = useMemo(
    () =>
      filteredPartners
        .filter((p) => p.score < 60 || p.daysSinceSync > 7 || p.coopDealPct < 18)
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
              Отчёт о работе MLS-партнёров по вторичному рынку
            </h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Объёмы, качество витрины, совместные сделки и синхронизация по партнёрам вторички.
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
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Объектов в сети</p>
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
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Ср. доля совм. сделок</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.avgCoop}%</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Конверсия в сделку</p>
              <p className="text-xl font-bold text-amber-300">{kpi.conv}%</p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Users className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Партнёры вторичного MLS</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Партнёр</th>
                    <th className="px-2 py-2">Регион</th>
                    <th className="px-2 py-2">Объектов</th>
                    <th className="px-2 py-2">Сделки 90д</th>
                    <th className="px-2 py-2">Вериф.</th>
                    <th className="px-2 py-2">Ср. дней в продаже</th>
                    <th className="px-2 py-2">Совм. сделки</th>
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
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{p.avgDaysOnMarket}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{p.coopDealPct}%</td>
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
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Динамика сети (вторичка)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Неделя</th>
                    <th className="px-2 py-2">Новые лоты</th>
                    <th className="px-2 py-2">Сделки</th>
                    <th className="px-2 py-2">Из них совместные</th>
                    <th className="px-2 py-2 min-w-[180px]">Новые лоты</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredWeeks].reverse().map((w) => (
                    <tr key={w.week} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{w.week}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{w.newListings}</td>
                      <td className="px-2 py-2 text-emerald-300">{w.deals}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{w.coopDeals}</td>
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
                        Индекс {p.score} · синхронизация {p.daysSinceSync} дн. · совм. сделки {p.coopDealPct}%
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
