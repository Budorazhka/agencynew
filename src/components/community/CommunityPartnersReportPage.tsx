import { useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, Filter, Network, TrendingUp, Users } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type Influence = 'high' | 'mid' | 'low'

const INFLUENCE_LABEL: Record<Influence, string> = {
  high: 'Высокое',
  mid: 'Среднее',
  low: 'Низкое',
}

const PARTNERS: Array<{
  name: string
  region: string
  eventsYtd: number
  postsYtd: number
  intros: number
  referrals: number
  activity: number
  influence: Influence
  lastEvent: string
}> = [
  { name: 'Альфа-недвижимость', region: 'Москва', eventsYtd: 9, postsYtd: 24, intros: 12, referrals: 8, activity: 91, influence: 'high', lastEvent: '2026-04-02' },
  { name: 'GeoPrime Realty', region: 'Москва', eventsYtd: 7, postsYtd: 18, intros: 9, referrals: 5, activity: 84, influence: 'high', lastEvent: '2026-03-30' },
  { name: 'ГК «Север»', region: 'МО', eventsYtd: 11, postsYtd: 14, intros: 6, referrals: 4, activity: 86, influence: 'high', lastEvent: '2026-04-01' },
  { name: 'Сити Экспресс', region: 'МО', eventsYtd: 6, postsYtd: 11, intros: 5, referrals: 3, activity: 72, influence: 'mid', lastEvent: '2026-03-22' },
  { name: 'Batumi Invest Brokers', region: 'Регионы', eventsYtd: 4, postsYtd: 7, intros: 3, referrals: 2, activity: 61, influence: 'mid', lastEvent: '2026-03-18' },
  { name: 'West Capital Homes', region: 'МО', eventsYtd: 3, postsYtd: 5, intros: 2, referrals: 1, activity: 54, influence: 'mid', lastEvent: '2026-03-10' },
  { name: 'MLS Club East', region: 'Регионы', eventsYtd: 2, postsYtd: 3, intros: 1, referrals: 0, activity: 38, influence: 'low', lastEvent: '2026-02-14' },
  { name: 'LegalPro', region: 'Москва', eventsYtd: 3, postsYtd: 8, intros: 4, referrals: 1, activity: 58, influence: 'low', lastEvent: '2026-03-05' },
]

const WEEKLY: Array<{ week: string; newPartners: number; eventRsvp: number; posts: number }> = [
  { week: 'Неделя 14', newPartners: 3, eventRsvp: 86, posts: 42 },
  { week: 'Неделя 13', newPartners: 2, eventRsvp: 78, posts: 38 },
  { week: 'Неделя 12', newPartners: 4, eventRsvp: 91, posts: 45 },
  { week: 'Неделя 11', newPartners: 1, eventRsvp: 72, posts: 33 },
  { week: 'Неделя 10', newPartners: 5, eventRsvp: 88, posts: 40 },
  { week: 'Неделя 9', newPartners: 2, eventRsvp: 65, posts: 29 },
  { week: 'Неделя 8', newPartners: 3, eventRsvp: 70, posts: 31 },
  { week: 'Неделя 7', newPartners: 2, eventRsvp: 68, posts: 28 },
  { week: 'Неделя 6', newPartners: 1, eventRsvp: 62, posts: 26 },
  { week: 'Неделя 5', newPartners: 4, eventRsvp: 80, posts: 35 },
  { week: 'Неделя 4', newPartners: 2, eventRsvp: 58, posts: 24 },
  { week: 'Неделя 3', newPartners: 3, eventRsvp: 74, posts: 30 },
]

export default function CommunityPartnersReportPage() {
  const [period, setPeriod] = useState<'4w' | '12w' | 'all'>('12w')
  const [region, setRegion] = useState<string>('all')
  const [influence, setInfluence] = useState<'all' | Influence>('all')
  const [weakOnly, setWeakOnly] = useState(false)

  const regionOptions = useMemo(() => Array.from(new Set(PARTNERS.map((p) => p.region))), [])

  const filteredPartners = useMemo(() => {
    let rows = [...PARTNERS]
    if (region !== 'all') rows = rows.filter((p) => p.region === region)
    if (influence !== 'all') rows = rows.filter((p) => p.influence === influence)
    if (weakOnly) rows = rows.filter((p) => p.activity < 60 || p.eventsYtd < 4)
    return rows
  }, [influence, region, weakOnly])

  const filteredWeeks = useMemo(() => {
    if (period === '4w') return WEEKLY.slice(0, 4)
    if (period === '12w') return WEEKLY.slice(0, 12)
    return WEEKLY
  }, [period])

  const kpi = useMemo(() => {
    const n = filteredPartners.length
    const events = filteredPartners.reduce((s, p) => s + p.eventsYtd, 0)
    const posts = filteredPartners.reduce((s, p) => s + p.postsYtd, 0)
    const referrals = filteredPartners.reduce((s, p) => s + p.referrals, 0)
    const avgAct = n > 0 ? Math.round(filteredPartners.reduce((s, p) => s + p.activity, 0) / n) : 0
    const intros = filteredPartners.reduce((s, p) => s + p.intros, 0)
    return { n, events, posts, referrals, avgAct, intros }
  }, [filteredPartners])

  const problematic = useMemo(
    () => filteredPartners.filter((p) => p.activity < 55 || p.eventsYtd < 3).sort((a, b) => a.activity - b.activity),
    [filteredPartners],
  )

  const maxRsvp = Math.max(1, ...filteredWeeks.map((w) => w.eventRsvp))

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="w-full space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Отчёт о формировании сообщества партнёров</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Вклад компаний в события, контент и рекомендации; динамика вовлечённости.
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
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
              <select
                value={influence}
                onChange={(e) => setInfluence(e.target.value as 'all' | Influence)}
                className="rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]"
              >
                <option value="all">Влияние: все уровни</option>
                <option value="high">Высокое</option>
                <option value="mid">Среднее</option>
                <option value="low">Низкое</option>
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]">
                <input
                  type="checkbox"
                  checked={weakOnly}
                  onChange={(e) => setWeakOnly(e.target.checked)}
                  className="size-4 appearance-none rounded border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] checked:border-[var(--gold)] checked:bg-[var(--gold)]"
                />
                Слабая активность
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Партнёров</p>
              <p className="text-xl font-bold text-[color:var(--theme-accent-heading)]">{kpi.n}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Визитов на события</p>
              <p className="text-xl font-bold text-emerald-400">{kpi.events}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Публикаций (YTD)</p>
              <p className="text-xl font-bold text-blue-400">{kpi.posts}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Интро / знакомства</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.intros}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Рефералы</p>
              <p className="text-xl font-bold text-amber-300">{kpi.referrals}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Ср. активность</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.avgAct}</p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Users className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Партнёры</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Компания</th>
                    <th className="px-2 py-2">Регион</th>
                    <th className="px-2 py-2">События</th>
                    <th className="px-2 py-2">Посты</th>
                    <th className="px-2 py-2">Интро</th>
                    <th className="px-2 py-2">Рефералы</th>
                    <th className="px-2 py-2">Активность</th>
                    <th className="px-2 py-2">Влияние</th>
                    <th className="px-2 py-2">Посл. событие</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners
                    .slice()
                    .sort((a, b) => b.activity - a.activity)
                    .map((row) => (
                      <tr key={row.name} className="border-b border-[color:var(--workspace-row-border)]">
                        <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{row.name}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{row.region}</td>
                        <td className="px-2 py-2">
                          <span className="inline-flex items-center gap-1 text-[color:var(--workspace-text)]">
                            <Network className="size-3.5 text-[color:var(--gold)]" />
                            {row.eventsYtd}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.postsYtd}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.intros}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.referrals}</td>
                        <td className={row.activity >= 70 ? 'px-2 py-2 text-blue-300' : 'px-2 py-2 text-amber-300'}>{row.activity}%</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{INFLUENCE_LABEL[row.influence]}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{row.lastEvent}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Динамика сообщества</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Неделя</th>
                    <th className="px-2 py-2">Новые партнёры</th>
                    <th className="px-2 py-2">RSVP на события</th>
                    <th className="px-2 py-2">Посты</th>
                    <th className="px-2 py-2 min-w-[180px]">RSVP</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredWeeks].reverse().map((w) => (
                    <tr key={w.week} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{w.week}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{w.newPartners}</td>
                      <td className="px-2 py-2 text-emerald-300">{w.eventRsvp}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{w.posts}</td>
                      <td className="px-2 py-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--workspace-row-border)]">
                          <div
                            className="h-full rounded-full bg-[color:var(--gold)]"
                            style={{ width: `${Math.round((w.eventRsvp / maxRsvp) * 100)}%` }}
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
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Отстают по вкладу</h2>
              </div>
              {problematic.length === 0 ? (
                <p className="text-sm text-[color:var(--app-text-muted)]">В выборке нет партнёров с критически низкой активностью.</p>
              ) : (
                <ul className="space-y-2">
                  {problematic.map((p) => (
                    <li
                      key={p.name}
                      className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]"
                    >
                      {p.name} · активность {p.activity}% · событий {p.eventsYtd}
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
                {filteredPartners
                  .slice()
                  .sort((a, b) => b.activity - a.activity)
                  .slice(0, 5)
                  .map((p) => (
                    <li
                      key={p.name}
                      className="flex items-center justify-between rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm"
                    >
                      <span className="text-[color:var(--workspace-text)]">{p.name}</span>
                      <span className="text-blue-300">{p.activity}%</span>
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
