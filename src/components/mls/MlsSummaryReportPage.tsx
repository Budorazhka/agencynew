import { useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, Filter, Network, TrendingUp } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type MlsSegment = 'secondary' | 'rent'

const SEGMENT_LABEL: Record<MlsSegment, string> = {
  secondary: 'Вторичка',
  rent: 'Аренда',
}

const WEEKLY_ROWS: Array<{
  week: string
  segment: MlsSegment
  newListings: number
  jointDeals: number
  partnerViews: number
  verifiedPct: number
  region: string
}> = [
  { week: 'Неделя 14', segment: 'secondary', newListings: 42, jointDeals: 11, partnerViews: 1860, verifiedPct: 94, region: 'Москва' },
  { week: 'Неделя 14', segment: 'rent', newListings: 28, jointDeals: 14, partnerViews: 920, verifiedPct: 88, region: 'Москва' },
  { week: 'Неделя 13', segment: 'secondary', newListings: 38, jointDeals: 9, partnerViews: 1710, verifiedPct: 91, region: 'Москва' },
  { week: 'Неделя 13', segment: 'rent', newListings: 31, jointDeals: 12, partnerViews: 880, verifiedPct: 86, region: 'Москва' },
  { week: 'Неделя 12', segment: 'secondary', newListings: 35, jointDeals: 10, partnerViews: 1590, verifiedPct: 89, region: 'МО' },
  { week: 'Неделя 12', segment: 'rent', newListings: 24, jointDeals: 11, partnerViews: 760, verifiedPct: 84, region: 'МО' },
  { week: 'Неделя 11', segment: 'secondary', newListings: 33, jointDeals: 8, partnerViews: 1480, verifiedPct: 87, region: 'МО' },
  { week: 'Неделя 11', segment: 'rent', newListings: 22, jointDeals: 9, partnerViews: 710, verifiedPct: 82, region: 'СПб' },
  { week: 'Неделя 10', segment: 'secondary', newListings: 40, jointDeals: 12, partnerViews: 1620, verifiedPct: 92, region: 'СПб' },
  { week: 'Неделя 10', segment: 'rent', newListings: 26, jointDeals: 10, partnerViews: 690, verifiedPct: 85, region: 'СПб' },
  { week: 'Неделя 9', segment: 'secondary', newListings: 36, jointDeals: 7, partnerViews: 1390, verifiedPct: 88, region: 'Регионы' },
  { week: 'Неделя 9', segment: 'rent', newListings: 20, jointDeals: 8, partnerViews: 540, verifiedPct: 80, region: 'Регионы' },
  { week: 'Неделя 8', segment: 'secondary', newListings: 34, jointDeals: 9, partnerViews: 1350, verifiedPct: 90, region: 'Москва' },
  { week: 'Неделя 8', segment: 'rent', newListings: 21, jointDeals: 9, partnerViews: 620, verifiedPct: 83, region: 'Москва' },
  { week: 'Неделя 7', segment: 'secondary', newListings: 31, jointDeals: 8, partnerViews: 1280, verifiedPct: 86, region: 'МО' },
  { week: 'Неделя 7', segment: 'rent', newListings: 19, jointDeals: 7, partnerViews: 590, verifiedPct: 81, region: 'МО' },
  { week: 'Неделя 6', segment: 'secondary', newListings: 29, jointDeals: 6, partnerViews: 1210, verifiedPct: 85, region: 'СПб' },
  { week: 'Неделя 6', segment: 'rent', newListings: 17, jointDeals: 7, partnerViews: 560, verifiedPct: 79, region: 'СПб' },
  { week: 'Неделя 5', segment: 'secondary', newListings: 32, jointDeals: 8, partnerViews: 1240, verifiedPct: 87, region: 'Регионы' },
  { week: 'Неделя 5', segment: 'rent', newListings: 18, jointDeals: 6, partnerViews: 510, verifiedPct: 78, region: 'Регионы' },
  { week: 'Неделя 4', segment: 'secondary', newListings: 27, jointDeals: 5, partnerViews: 1160, verifiedPct: 84, region: 'Москва' },
  { week: 'Неделя 4', segment: 'rent', newListings: 16, jointDeals: 6, partnerViews: 480, verifiedPct: 77, region: 'Москва' },
  { week: 'Неделя 3', segment: 'secondary', newListings: 30, jointDeals: 7, partnerViews: 1180, verifiedPct: 86, region: 'МО' },
  { week: 'Неделя 3', segment: 'rent', newListings: 15, jointDeals: 5, partnerViews: 450, verifiedPct: 76, region: 'МО' },
  { week: 'Неделя 2', segment: 'secondary', newListings: 28, jointDeals: 6, partnerViews: 1120, verifiedPct: 83, region: 'СПб' },
  { week: 'Неделя 2', segment: 'rent', newListings: 14, jointDeals: 5, partnerViews: 430, verifiedPct: 75, region: 'СПб' },
  { week: 'Неделя 1', segment: 'secondary', newListings: 25, jointDeals: 5, partnerViews: 1050, verifiedPct: 82, region: 'Регионы' },
  { week: 'Неделя 1', segment: 'rent', newListings: 13, jointDeals: 4, partnerViews: 400, verifiedPct: 74, region: 'Регионы' },
]

const PARTNER_ROWS: Array<{
  name: string
  segment: MlsSegment
  region: string
  listings30d: number
  deals90d: number
  activityScore: number
  daysSinceSync: number
}> = [
  { name: 'Альфа-недвижимость', segment: 'secondary', region: 'Москва', listings30d: 48, deals90d: 22, activityScore: 92, daysSinceSync: 1 },
  { name: 'Бета Партнёры', segment: 'rent', region: 'Москва', listings30d: 31, deals90d: 18, activityScore: 88, daysSinceSync: 2 },
  { name: 'Сити Экспресс', segment: 'secondary', region: 'МО', listings30d: 22, deals90d: 9, activityScore: 71, daysSinceSync: 4 },
  { name: 'Дом на час', segment: 'rent', region: 'МО', listings30d: 14, deals90d: 11, activityScore: 65, daysSinceSync: 6 },
  { name: 'Северный квартал', segment: 'secondary', region: 'СПб', listings30d: 18, deals90d: 5, activityScore: 58, daysSinceSync: 9 },
  { name: 'Лайт Рент', segment: 'rent', region: 'СПб', listings30d: 9, deals90d: 4, activityScore: 45, daysSinceSync: 14 },
  { name: 'Регион Плюс', segment: 'secondary', region: 'Регионы', listings30d: 11, deals90d: 3, activityScore: 42, daysSinceSync: 18 },
  { name: 'Юг Аренда', segment: 'rent', region: 'Регионы', listings30d: 6, deals90d: 2, activityScore: 33, daysSinceSync: 21 },
]

export default function MlsSummaryReportPage() {
  const [period, setPeriod] = useState<'4w' | '12w' | 'all'>('12w')
  const [segment, setSegment] = useState<'all' | MlsSegment>('all')
  const [region, setRegion] = useState<string>('all')

  const regionOptions = useMemo(() => Array.from(new Set(WEEKLY_ROWS.map((r) => r.region))), [])

  const filteredWeeks = useMemo(() => {
    let rows = [...WEEKLY_ROWS]
    if (period === '4w') rows = rows.slice(0, 8)
    else if (period === '12w') rows = rows.slice(0, 24)
    if (segment !== 'all') rows = rows.filter((r) => r.segment === segment)
    if (region !== 'all') rows = rows.filter((r) => r.region === region)
    return rows
  }, [period, region, segment])

  const filteredPartners = useMemo(() => {
    let rows = [...PARTNER_ROWS]
    if (segment !== 'all') rows = rows.filter((r) => r.segment === segment)
    if (region !== 'all') rows = rows.filter((r) => r.region === region)
    return rows
  }, [region, segment])

  const kpi = useMemo(() => {
    const newListings = filteredWeeks.reduce((s, r) => s + r.newListings, 0)
    const jointDeals = filteredWeeks.reduce((s, r) => s + r.jointDeals, 0)
    const partnerViews = filteredWeeks.reduce((s, r) => s + r.partnerViews, 0)
    const verifiedWeighted =
      filteredWeeks.length > 0
        ? Math.round(filteredWeeks.reduce((s, r) => s + r.verifiedPct * r.newListings, 0) / Math.max(1, newListings))
        : 0
    const uniquePartners = filteredPartners.length
    const avgActivity =
      uniquePartners > 0
        ? Math.round(filteredPartners.reduce((s, p) => s + p.activityScore, 0) / uniquePartners)
        : 0
    return { newListings, jointDeals, partnerViews, verifiedWeighted, uniquePartners, avgActivity }
  }, [filteredPartners, filteredWeeks])

  const segmentBreakdown = useMemo(() => {
    const bySeg = (s: MlsSegment) => {
      const w = filteredWeeks.filter((r) => r.segment === s)
      const nl = w.reduce((a, r) => a + r.newListings, 0)
      const jd = w.reduce((a, r) => a + r.jointDeals, 0)
      const pv = w.reduce((a, r) => a + r.partnerViews, 0)
      const ver = nl > 0 ? Math.round(w.reduce((a, r) => a + r.verifiedPct * r.newListings, 0) / nl) : 0
      const partners = filteredPartners.filter((p) => p.segment === s).length
      return { segment: s, newListings: nl, jointDeals: jd, partnerViews: pv, verifiedPct: ver, partners }
    }
    if (segment !== 'all') return [bySeg(segment)]
    return [bySeg('secondary'), bySeg('rent')]
  }, [filteredPartners, filteredWeeks, segment])

  const problematic = useMemo(
    () =>
      filteredPartners.filter((p) => p.activityScore < 60 || p.daysSinceSync > 7).sort((a, b) => a.activityScore - b.activityScore),
    [filteredPartners],
  )

  const dynamicsByWeek = useMemo(() => {
    const map = new Map<string, { newListings: number; jointDeals: number }>()
    filteredWeeks.forEach((r) => {
      const cur = map.get(r.week) ?? { newListings: 0, jointDeals: 0 }
      cur.newListings += r.newListings
      cur.jointDeals += r.jointDeals
      map.set(r.week, cur)
    })
    return [...map.entries()]
      .map(([week, v]) => ({ week, ...v }))
      .reverse()
  }, [filteredWeeks])

  const maxListings = Math.max(1, ...dynamicsByWeek.map((d) => d.newListings))

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="w-full space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Отчёт по MLS</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Сводка сети: новые объявления, совместные сделки, верификация и активность партнёров.
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
                <option value="4w">Период: 4 недели</option>
                <option value="12w">Период: 12 недель</option>
                <option value="all">Период: весь доступный</option>
              </select>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as 'all' | MlsSegment)}
                className="rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]"
              >
                <option value="all">Контур: все</option>
                <option value="secondary">Вторичка</option>
                <option value="rent">Аренда</option>
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
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Новые объявления</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.newListings}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Совместные сделки</p>
              <p className="text-xl font-bold text-emerald-300">{kpi.jointDeals}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Просмотры партнёрами</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.partnerViews.toLocaleString('ru-RU')}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Верификация (взв.)</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.verifiedWeighted}%</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Партнёров в выборке</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.uniquePartners}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Ср. активность</p>
              <p className={kpi.avgActivity >= 70 ? 'text-xl font-bold text-emerald-300' : 'text-xl font-bold text-amber-300'}>
                {kpi.avgActivity}
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Network className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Разрез по контурам</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Контур</th>
                    <th className="px-2 py-2">Новые</th>
                    <th className="px-2 py-2">Совм. сделки</th>
                    <th className="px-2 py-2">Просмотры</th>
                    <th className="px-2 py-2">Верификация</th>
                    <th className="px-2 py-2">Партнёры</th>
                  </tr>
                </thead>
                <tbody>
                  {segmentBreakdown.map((row) => (
                    <tr key={row.segment} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{SEGMENT_LABEL[row.segment]}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.newListings}</td>
                      <td className="px-2 py-2 text-emerald-300">{row.jointDeals}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.partnerViews.toLocaleString('ru-RU')}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.verifiedPct}%</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.partners}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Динамика по неделям</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Неделя</th>
                    <th className="px-2 py-2">Новые объявления</th>
                    <th className="px-2 py-2">Совместные сделки</th>
                    <th className="px-2 py-2 min-w-[200px]">Новые (график)</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicsByWeek.map((row) => (
                    <tr key={row.week} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.week}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.newListings}</td>
                      <td className="px-2 py-2 text-emerald-300">{row.jointDeals}</td>
                      <td className="px-2 py-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--workspace-row-border)]">
                          <div
                            className="h-full rounded-full bg-[color:var(--gold)]"
                            style={{ width: `${Math.round((row.newListings / maxListings) * 100)}%` }}
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
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Требуют внимания</h2>
              </div>
              {problematic.length === 0 ? (
                <p className="text-sm text-[color:var(--app-text-muted)]">Нет партнёров с низкой активностью в текущих фильтрах.</p>
              ) : (
                <ul className="space-y-2">
                  {problematic.map((p) => (
                    <li
                      key={p.name}
                      className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm"
                    >
                      <p className="font-medium text-[color:var(--workspace-text)]">{p.name}</p>
                      <p className="mt-0.5 text-xs text-[color:var(--workspace-text-muted)]">
                        {SEGMENT_LABEL[p.segment]} · {p.region} · активность {p.activityScore} · синхронизация {p.daysSinceSync} дн. назад
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Топ по активности</h2>
              </div>
              <ul className="space-y-2">
                {[...filteredPartners]
                  .sort((a, b) => b.activityScore - a.activityScore)
                  .slice(0, 5)
                  .map((p) => (
                    <li
                      key={p.name}
                      className="flex items-center justify-between rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm"
                    >
                      <span className="text-[color:var(--workspace-text)]">{p.name}</span>
                      <span className="text-emerald-300">{p.activityScore}</span>
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
