import { DashboardShell } from '@/components/layout/DashboardShell'
import { HOME_PROGRESS_MOCK, HOME_STREAK_MOCK } from '@/data/home-workspace-mock'
import { useAuth } from '@/context/AuthContext'

const DAY_STATUS_LABEL = { done: 'Выполнено', on_track: 'В плане', at_risk: 'В зоне риска' } as const
const DAY_STATUS_COLOR = { done: '#4ade80', on_track: '#60a5fa', at_risk: '#ef4444' } as const

const WEEKLY_HISTORY = [
  { day: 'Пн', dayPct: 88, kpis: { leads: 7, calls: 14, meetings: 3, tasks: 5 } },
  { day: 'Вт', dayPct: 72, kpis: { leads: 6, calls: 11, meetings: 2, tasks: 4 } },
  { day: 'Ср', dayPct: 95, kpis: { leads: 9, calls: 16, meetings: 4, tasks: 7 } },
  { day: 'Чт', dayPct: 81, kpis: { leads: 7, calls: 13, meetings: 3, tasks: 5 } },
  { day: 'Пт', dayPct: 62, kpis: { leads: 5, calls: 12, meetings: 2, tasks: 4 } },
]

function Bar({ pct, color, h = 'h-2' }: { pct: number; color: string; h?: string }) {
  return (
    <div className={`${h} w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]`}>
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  )
}

export function MyReportPage() {
  const p = HOME_PROGRESS_MOCK
  const streak = HOME_STREAK_MOCK
  const { currentUser } = useAuth()
  const name = currentUser?.name ?? 'Сотрудник'

  return (
    <DashboardShell>
      <div style={{ padding: '16px 28px 48px', width: '100%', maxWidth: 'none', fontFamily: "'Montserrat', sans-serif" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--theme-accent-heading)', marginBottom: 4 }}>
          Мой отчёт
        </h1>
        <p style={{ fontSize: 14, color: 'var(--app-text-muted)', marginBottom: 24 }}>
          {name} · сводка за текущую неделю
        </p>

        {/* ── Summary cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'План дня', value: `${p.dayPlanPercent}%`, sub: DAY_STATUS_LABEL[p.dayPlanStatus], color: DAY_STATUS_COLOR[p.dayPlanStatus], pct: p.dayPlanPercent, barColor: 'var(--gold)' },
            { label: 'План недели', value: `${p.weekPlanPercent}%`, sub: '', color: '', pct: p.weekPlanPercent, barColor: '#60a5fa' },
            { label: 'Выручка', value: p.revenue.currentLabel, sub: `/ ${p.revenue.planLabel}`, color: '', pct: p.revenue.percent, barColor: 'var(--gold)' },
            { label: 'Воронка', value: `${p.funnelProgress.percent}%`, sub: p.funnelProgress.subtitle, color: '', pct: p.funnelProgress.percent, barColor: '#34d399' },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                background: 'var(--hub-card-bg)',
                border: '1px solid var(--hub-card-border)',
                borderRadius: 10,
                padding: '14px 16px',
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--app-text-muted)', marginBottom: 6 }}>{c.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--app-text)', lineHeight: 1 }}>
                {c.value}
                {c.sub && <span style={{ fontSize: 12, fontWeight: 500, color: c.color || 'var(--app-text-muted)', marginLeft: 6 }}>{c.sub}</span>}
              </p>
              <div style={{ marginTop: 8 }}>
                <Bar pct={c.pct} color={c.barColor} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Activity KPIs ── */}
        <div style={{ background: 'var(--hub-card-bg)', border: '1px solid var(--hub-card-border)', borderRadius: 10, padding: '18px 20px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)', marginBottom: 14 }}>Нормативы активности — сегодня</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 20px' }}>
            {p.activityKpis.map((k) => {
              const pct = k.plan > 0 ? Math.round((k.current / k.plan) * 100) : 0
              return (
                <div key={k.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--app-text)', marginBottom: 4 }}>
                    <span>{k.label}</span>
                    <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{k.current}/{k.plan}</span>
                  </div>
                  <Bar pct={pct} color={pct >= 100 ? '#4ade80' : 'var(--gold)'} h="h-2.5" />
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Weekly history ── */}
        <div style={{ background: 'var(--hub-card-bg)', border: '1px solid var(--hub-card-border)', borderRadius: 10, padding: '18px 20px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)', marginBottom: 14 }}>История по дням недели</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--hub-card-border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 700, color: 'var(--app-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>День</th>
                <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 700, color: 'var(--app-text-muted)', fontSize: 11, textTransform: 'uppercase' }}>% плана</th>
                <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 700, color: 'var(--app-text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Лиды</th>
                <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 700, color: 'var(--app-text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Звонки</th>
                <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 700, color: 'var(--app-text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Встречи</th>
                <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 700, color: 'var(--app-text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Задачи</th>
              </tr>
            </thead>
            <tbody>
              {WEEKLY_HISTORY.map((d) => (
                <tr key={d.day} style={{ borderBottom: '1px solid var(--hub-card-border)' }}>
                  <td style={{ padding: '8px 0', fontWeight: 600, color: 'var(--app-text)' }}>{d.day}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <span style={{ fontWeight: 700, color: d.dayPct >= 80 ? '#4ade80' : d.dayPct >= 60 ? 'var(--gold)' : '#ef4444' }}>{d.dayPct}%</span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px', color: 'var(--app-text)' }}>{d.kpis.leads}</td>
                  <td style={{ textAlign: 'center', padding: '8px', color: 'var(--app-text)' }}>{d.kpis.calls}</td>
                  <td style={{ textAlign: 'center', padding: '8px', color: 'var(--app-text)' }}>{d.kpis.meetings}</td>
                  <td style={{ textAlign: 'center', padding: '8px', color: 'var(--app-text)' }}>{d.kpis.tasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Streak ── */}
        <div style={{ background: 'var(--hub-card-bg)', border: '1px solid var(--hub-card-border)', borderRadius: 10, padding: '18px 20px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)', marginBottom: 10 }}>Серия активности</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#fb923c' }}>{streak.currentStreak}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--app-text-muted)', marginLeft: 6 }}>дн. подряд</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--app-text-muted)' }}>
              Рекорд: <span style={{ fontWeight: 700, color: 'var(--app-text)' }}>{streak.bestStreak}</span> дн.
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {streak.slots.map((s, i) => (
                <div
                  key={i}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    background: s.active ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                    color: s.active ? '#422006' : 'var(--app-text-muted)',
                    border: s.isToday ? '2px dashed #fb923c' : '1px solid transparent',
                  }}
                >
                  {s.weekday.slice(0, 2)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
