import { useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, Filter, Megaphone, TrendingUp } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { useLeads } from '@/context/LeadsContext'
import { LEAD_STAGE_COLUMN } from '@/data/leads-mock'
import type { Lead } from '@/types/leads'

const CHANNEL_LABELS: Record<NonNullable<Lead['channel']>, string> = {
  ad: 'Рекламные кампании',
  form: 'Формы сайта',
  partner: 'Партнерский канал',
  other: 'Прочее',
}

const CHANNEL_CPL: Record<NonNullable<Lead['channel']>, number> = {
  ad: 42,
  form: 18,
  partner: 24,
  other: 30,
}

function getIsoWeekKey(iso: string) {
  const d = new Date(iso)
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

export default function LeadsMarketingReportPage() {
  const { state } = useLeads()
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d')
  const [sourceFilter, setSourceFilter] = useState<'all' | Lead['source']>('all')
  const now = useMemo(() => Date.now(), [])

  const filtered = useMemo(() => {
    const base = state.leadPool.filter((lead) => lead.channel != null)
    const bySource = sourceFilter === 'all' ? base : base.filter((lead) => lead.source === sourceFilter)
    if (period === 'all') return bySource
    const days = period === '7d' ? 7 : 30
    const threshold = now - days * 24 * 60 * 60 * 1000
    return bySource.filter((lead) => new Date(lead.createdAt).getTime() >= threshold)
  }, [now, period, sourceFilter, state.leadPool])

  const channelRows = useMemo(() => {
    const map = new Map<NonNullable<Lead['channel']>, { leads: number; qualified: number; lost: number; cpl: number }>()
    filtered.forEach((lead) => {
      const channel = lead.channel as NonNullable<Lead['channel']>
      const prev = map.get(channel) ?? { leads: 0, qualified: 0, lost: 0, cpl: CHANNEL_CPL[channel] }
      prev.leads += 1
      if (LEAD_STAGE_COLUMN[lead.stageId] === 'success') prev.qualified += 1
      if (LEAD_STAGE_COLUMN[lead.stageId] === 'rejection') prev.lost += 1
      map.set(channel, prev)
    })
    return [...map.entries()]
      .map(([channel, value]) => {
        const conversion = value.leads > 0 ? Math.round((value.qualified / value.leads) * 100) : 0
        const quality = Math.max(1, Math.min(10, Number((conversion / 10 + (value.lost > value.qualified ? -1 : 1)).toFixed(1))))
        return {
          channel,
          label: CHANNEL_LABELS[channel],
          ...value,
          conversion,
          quality,
        }
      })
      .sort((a, b) => b.leads - a.leads)
  }, [filtered])

  const kpi = useMemo(() => {
    const leads = filtered.length
    const totalCost = channelRows.reduce((s, r) => s + r.leads * r.cpl, 0)
    const avgCpl = leads > 0 ? Math.round(totalCost / leads) : 0
    const avgQuality = channelRows.length > 0
      ? Number((channelRows.reduce((s, r) => s + r.quality, 0) / channelRows.length).toFixed(1))
      : 0
    const avgConversion = leads > 0
      ? Math.round((channelRows.reduce((s, r) => s + r.qualified, 0) / leads) * 100)
      : 0
    return { leads, avgCpl, avgQuality, avgConversion }
  }, [channelRows, filtered.length])

  const problematicChannels = useMemo(
    () => channelRows.filter((r) => r.cpl > kpi.avgCpl || r.quality < kpi.avgQuality).slice(0, 4),
    [channelRows, kpi.avgCpl, kpi.avgQuality],
  )

  const dynamics = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach((lead) => {
      const key = getIsoWeekKey(lead.createdAt)
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([week, count]) => ({ week, count }))
  }, [filtered])
  const maxDyn = Math.max(1, ...dynamics.map((d) => d.count))

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="w-full space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Маркетинговый отчёт по лидам</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">Эффективность каналов по объему, стоимости и качеству лидов.</p>
          </div>
          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <select value={period} onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | 'all')} className="rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]">
                <option value="7d">Период: 7 дней</option>
                <option value="30d">Период: 30 дней</option>
                <option value="all">Период: весь</option>
              </select>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as 'all' | Lead['source'])}
                className="rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] [color-scheme:dark]"
              >
                <option value="all">Источник: все</option>
                <option value="primary">Первичка</option>
                <option value="secondary">Вторичка</option>
                <option value="rent">Аренда</option>
                <option value="ad_campaigns">Реклама</option>
              </select>
            </div>
          </section>
          <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Лиды</p><p className="text-xl font-bold text-[color:var(--theme-accent-heading)]">{kpi.leads}</p></div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">CPL (средний)</p><p className="text-xl font-bold text-amber-300">${kpi.avgCpl}</p></div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Качество</p><p className="text-xl font-bold text-blue-300">{kpi.avgQuality}</p></div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3"><p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Конверсия</p><p className="text-xl font-bold text-emerald-300">{kpi.avgConversion}%</p></div>
          </section>
          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Каналы привлечения</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Канал</th>
                    <th className="px-2 py-2">Лиды</th>
                    <th className="px-2 py-2">CPL</th>
                    <th className="px-2 py-2">Квалифицировано</th>
                    <th className="px-2 py-2">Потери</th>
                    <th className="px-2 py-2">Конверсия</th>
                    <th className="px-2 py-2">Качество</th>
                  </tr>
                </thead>
                <tbody>
                  {channelRows.map((row) => (
                    <tr key={row.channel} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">
                        <span className="inline-flex items-center gap-1"><Megaphone className="size-3.5 text-[color:var(--gold)]" />{row.label}</span>
                      </td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{row.leads}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">${row.cpl}</td>
                      <td className="px-2 py-2 text-emerald-300">{row.qualified}</td>
                      <td className="px-2 py-2 text-red-300">{row.lost}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.conversion}%</td>
                      <td className="px-2 py-2 text-blue-300">{row.quality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-300" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Проблемные каналы</h2>
              </div>
              <div className="space-y-2">
                {problematicChannels.map((row) => (
                  <div key={row.channel} className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2">
                    <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{row.label}</p>
                    <p className="mt-1 text-xs text-[color:var(--workspace-text-muted)]">CPL: ${row.cpl} · Качество: {row.quality}</p>
                  </div>
                ))}
                {problematicChannels.length === 0 && <p className="text-sm text-[color:var(--workspace-text-muted)]">Проблемных каналов не найдено.</p>}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Динамика лидов</h2>
              </div>
              <div className="space-y-2">
                {dynamics.map((row) => (
                  <div key={row.week}>
                    <div className="mb-1 flex items-center justify-between text-xs text-[color:var(--workspace-text-muted)]">
                      <span>{row.week}</span>
                      <span>{row.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[rgba(255,255,255,0.07)]">
                      <div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${Math.round((row.count / maxDyn) * 100)}%` }} />
                    </div>
                  </div>
                ))}
                {dynamics.length === 0 && <p className="text-sm text-[color:var(--workspace-text-muted)]">Недостаточно данных для динамики.</p>}
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
