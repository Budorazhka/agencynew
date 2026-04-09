import { useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, Filter, HandCoins, ReceiptText, TrendingUp } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type PartnerRow = {
  partner: string
  project: string
  region: string
  registrations: number
  bookings: number
  deals: number
}

const PARTNER_REPORT_ROWS: PartnerRow[] = [
  { partner: 'GeoPrime Realty', project: 'ЖК Олимп', region: 'Москва', registrations: 24, bookings: 11, deals: 5 },
  { partner: 'GeoPrime Realty', project: 'ЖК Самолёт Парк', region: 'Москва', registrations: 14, bookings: 7, deals: 3 },
  { partner: 'Batumi Invest Brokers', project: 'ЖК Бунинские луга', region: 'МО', registrations: 19, bookings: 8, deals: 4 },
  { partner: 'West Capital Homes', project: 'ЖК Олимп', region: 'Регионы', registrations: 9, bookings: 4, deals: 2 },
  { partner: 'Альфа Первичка', project: 'ЖК Олимп', region: 'Москва', registrations: 31, bookings: 14, deals: 8 },
  { partner: 'Альфа Первичка', project: 'ЖК Бунинские луга', region: 'МО', registrations: 12, bookings: 5, deals: 2 },
  { partner: 'Сити Партнёр', project: 'ЖК Самолёт Парк', region: 'Москва', registrations: 8, bookings: 3, deals: 1 },
]

const WEEKLY: Array<{ week: string; reg: number; book: number; deals: number }> = [
  { week: 'Неделя 14', reg: 22, book: 9, deals: 4 },
  { week: 'Неделя 13', reg: 18, book: 11, deals: 5 },
  { week: 'Неделя 12', reg: 25, book: 8, deals: 3 },
  { week: 'Неделя 11', reg: 19, book: 7, deals: 4 },
  { week: 'Неделя 10', reg: 21, book: 10, deals: 6 },
  { week: 'Неделя 9', reg: 16, book: 6, deals: 2 },
  { week: 'Неделя 8', reg: 14, book: 5, deals: 3 },
  { week: 'Неделя 7', reg: 17, book: 8, deals: 4 },
  { week: 'Неделя 6', reg: 12, book: 4, deals: 2 },
  { week: 'Неделя 5', reg: 20, book: 9, deals: 5 },
  { week: 'Неделя 4', reg: 15, book: 6, deals: 3 },
  { week: 'Неделя 3', reg: 13, book: 5, deals: 2 },
]

export default function PrimaryPartnersReportPage() {
  const [region, setRegion] = useState<string>('all')
  const [partner, setPartner] = useState<string>('all')
  const [period, setPeriod] = useState<'4w' | '12w' | 'all'>('12w')
  const [lowConvOnly, setLowConvOnly] = useState(false)

  const regionOptions = useMemo(() => Array.from(new Set(PARTNER_REPORT_ROWS.map((r) => r.region))), [])
  const partnerOptions = useMemo(() => Array.from(new Set(PARTNER_REPORT_ROWS.map((r) => r.partner))).sort(), [])

  const filteredRows = useMemo(() => {
    let rows = [...PARTNER_REPORT_ROWS]
    if (region !== 'all') rows = rows.filter((r) => r.region === region)
    if (partner !== 'all') rows = rows.filter((r) => r.partner === partner)
    if (lowConvOnly) {
      rows = rows.filter((r) => {
        const c = r.bookings > 0 ? r.deals / r.bookings : 0
        return c < 0.35
      })
    }
    return rows
  }, [lowConvOnly, partner, region])

  const filteredWeeks = useMemo(() => {
    if (period === '4w') return WEEKLY.slice(0, 4)
    if (period === '12w') return WEEKLY.slice(0, 12)
    return WEEKLY
  }, [period])

  const kpi = useMemo(() => {
    const registrations = filteredRows.reduce((s, r) => s + r.registrations, 0)
    const bookings = filteredRows.reduce((s, r) => s + r.bookings, 0)
    const deals = filteredRows.reduce((s, r) => s + r.deals, 0)
    const convBook = bookings > 0 ? Math.round((deals / bookings) * 100) : 0
    const convReg = registrations > 0 ? Math.round((deals / registrations) * 1000) / 10 : 0
    return { registrations, bookings, deals, convBook, convReg }
  }, [filteredRows])

  const problematic = useMemo(
    () =>
      filteredRows.filter((r) => {
        const c = r.bookings > 0 ? r.deals / r.bookings : 0
        return c < 0.4 && r.bookings >= 3
      }),
    [filteredRows],
  )

  const maxReg = Math.max(1, ...filteredWeeks.map((w) => w.reg))

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="w-full space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Отчёт о работе партнёров по первичному рынку</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Воронка регистрация → бронь → сделка по партнёрам и проектам, динамика недель.
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
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
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                className="rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]"
              >
                <option value="all">Партнёр: все</option>
                {partnerOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as '4w' | '12w' | 'all')}
                className="rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]"
              >
                <option value="4w">Динамика: 4 недели</option>
                <option value="12w">Динамика: 12 недель</option>
                <option value="all">Динамика: весь период</option>
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]">
                <input
                  type="checkbox"
                  checked={lowConvOnly}
                  onChange={(e) => setLowConvOnly(e.target.checked)}
                  className="size-4 appearance-none rounded border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] checked:border-[var(--gold)] checked:bg-[var(--gold)]"
                />
                Низкая конверсия бронь→сделка
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Регистрации</p>
              <p className="text-xl font-bold text-blue-400">{kpi.registrations}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Брони</p>
              <p className="text-xl font-bold text-amber-300">{kpi.bookings}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Сделки</p>
              <p className="text-xl font-bold text-emerald-400">{kpi.deals}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Бронь→сделка</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.convBook}%</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Рег→сделка</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.convReg}%</p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Детализация по партнёрам и проектам</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Партнёр</th>
                    <th className="px-2 py-2">Проект</th>
                    <th className="px-2 py-2">Регион</th>
                    <th className="px-2 py-2">Регистрации</th>
                    <th className="px-2 py-2">Брони</th>
                    <th className="px-2 py-2">Сделки</th>
                    <th className="px-2 py-2">Бронь→сделка</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const conversion = row.bookings > 0 ? Math.round((row.deals / row.bookings) * 100) : 0
                    return (
                      <tr key={`${row.partner}-${row.project}`} className="border-b border-[color:var(--workspace-row-border)]">
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.partner}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{row.project}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{row.region}</td>
                        <td className="px-2 py-2">
                          <span className="inline-flex items-center gap-1 text-blue-300">
                            <ReceiptText className="size-3.5" />
                            {row.registrations}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <span className="inline-flex items-center gap-1 text-amber-300">
                            <HandCoins className="size-3.5" />
                            {row.bookings}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-emerald-300">{row.deals}</td>
                        <td className={conversion >= 45 ? 'px-2 py-2 text-emerald-300' : 'px-2 py-2 text-amber-300'}>{conversion}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Динамика (агрегат сети)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Неделя</th>
                    <th className="px-2 py-2">Регистрации</th>
                    <th className="px-2 py-2">Брони</th>
                    <th className="px-2 py-2">Сделки</th>
                    <th className="px-2 py-2 min-w-[160px]">Регистрации</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredWeeks].reverse().map((w) => (
                    <tr key={w.week} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{w.week}</td>
                      <td className="px-2 py-2 text-blue-300">{w.reg}</td>
                      <td className="px-2 py-2 text-amber-300">{w.book}</td>
                      <td className="px-2 py-2 text-emerald-300">{w.deals}</td>
                      <td className="px-2 py-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--workspace-row-border)]">
                          <div
                            className="h-full rounded-full bg-[color:var(--gold)]"
                            style={{ width: `${Math.round((w.reg / maxReg) * 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Просадка конверсии</h2>
              </div>
              {problematic.length === 0 ? (
                <p className="text-sm text-[color:var(--app-text-muted)]">В выборке нет строк с низкой конверсией при достаточном числе броней.</p>
              ) : (
                <ul className="space-y-2">
                  {problematic.map((r) => {
                    const c = r.bookings > 0 ? Math.round((r.deals / r.bookings) * 100) : 0
                    return (
                      <li
                        key={`${r.partner}-${r.project}`}
                        className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]"
                      >
                        {r.partner} · {r.project} · конверсия {c}%
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Топ по сделкам</h2>
              </div>
              <ul className="space-y-2">
                {[...filteredRows]
                  .sort((a, b) => b.deals - a.deals)
                  .slice(0, 5)
                  .map((r) => (
                    <li
                      key={`${r.partner}-${r.project}`}
                      className="flex items-center justify-between rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm"
                    >
                      <span className="truncate text-[color:var(--workspace-text)]">
                        {r.partner} — {r.project}
                      </span>
                      <span className="shrink-0 text-emerald-300">{r.deals}</span>
                    </li>
                  ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
