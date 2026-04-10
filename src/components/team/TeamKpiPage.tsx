import { useMemo, useState } from 'react'
import { Phone, Mail, TrendingUp, Target, Users, Briefcase, Search, AlertTriangle } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { MOCK_EMPLOYEES, ROLE_LABELS, type Employee } from '@/data/personnel-mock'
import { formatUsdMillions } from '@/lib/format-currency'

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
}

const ROLE_ACCENT: Record<string, string> = {
  owner:    'var(--gold-light)',
  director: '#7ec8e3',
  rop:      '#fb923c',
  manager:  '#4ade80',
}

/** Моковые KPI по сотрудникам (для отчёта по команде и карточек). */
export const MOCK_KPI: Record<string, { leadsMonth: number; dealsMonth: number; revenue: number; plan: number; activeTasks: number }> = {
  'emp-owner':    { leadsMonth: 0,  dealsMonth: 0,  revenue: 0,          plan: 100, activeTasks: 3  },
  'emp-director': { leadsMonth: 2,  dealsMonth: 1,  revenue: 12_500_000, plan: 95,  activeTasks: 7  },
  'emp-rop-msk':  { leadsMonth: 8,  dealsMonth: 3,  revenue: 37_000_000, plan: 87,  activeTasks: 12 },
  'emp-rop-spb':  { leadsMonth: 5,  dealsMonth: 2,  revenue: 22_000_000, plan: 74,  activeTasks: 9  },
  'emp-mgr-1':    { leadsMonth: 14, dealsMonth: 2,  revenue: 18_400_000, plan: 92,  activeTasks: 5  },
  'emp-mgr-2':    { leadsMonth: 11, dealsMonth: 1,  revenue: 9_200_000,  plan: 61,  activeTasks: 8  },
  'emp-mgr-3':    { leadsMonth: 9,  dealsMonth: 2,  revenue: 11_000_000, plan: 78,  activeTasks: 4  },
  'emp-mgr-4':    { leadsMonth: 13, dealsMonth: 3,  revenue: 21_500_000, plan: 107, activeTasks: 6  },
  'emp-mgr-5':    { leadsMonth: 7,  dealsMonth: 1,  revenue: 8_700_000,  plan: 58,  activeTasks: 10 },
  'emp-mgr-6':    { leadsMonth: 10, dealsMonth: 2,  revenue: 14_300_000, plan: 83,  activeTasks: 3  },
}

type FilterRole = 'all' | 'director' | 'rop' | 'manager'

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function PlanBar({ pct }: { pct: number }) {
  const color = pct >= 100 ? '#4ade80' : pct >= 75 ? C.gold : pct >= 50 ? '#fb923c' : '#ef4444'
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: C.whiteLow }}>Выполнение плана</span>
        <span style={{ fontSize: 10, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: 2, background: color, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

function KpiCard({ emp }: { emp: Employee }) {
  const kpi = MOCK_KPI[emp.id] || { leadsMonth: 0, dealsMonth: 0, revenue: 0, plan: 0, activeTasks: 0 }
  const accent = ROLE_ACCENT[emp.role] || C.gold

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: '16px 18px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: `${accent}1a`,
          border: `2px solid ${accent}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: accent, flexShrink: 0,
        }}>
          {getInitials(emp.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.white, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
          <div style={{ fontSize: 10, color: C.whiteLow }}>{emp.position}</div>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
          padding: '3px 8px', borderRadius: 20,
          background: `${accent}18`, border: `1px solid ${accent}44`, color: accent, flexShrink: 0,
        }}>
          {ROLE_LABELS[emp.role as keyof typeof ROLE_LABELS] || emp.role}
        </span>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { icon: Users,    label: 'Лиды',    value: kpi.leadsMonth,  color: '#60a5fa' },
          { icon: Briefcase,label: 'Сделки',  value: kpi.dealsMonth,  color: C.gold   },
          { icon: TrendingUp,label: 'Выручка', value: kpi.revenue > 0 ? `${(kpi.revenue/1_000_000).toFixed(1)}M` : '—', color: '#4ade80' },
          { icon: Target,   label: 'Задачи',  value: kpi.activeTasks, color: '#a78bfa' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 7, padding: '7px 8px', textAlign: 'center' }}>
            <Icon size={12} color={color} style={{ marginBottom: 3 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 9, color: C.whiteLow }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Plan bar */}
      {emp.role !== 'owner' && <PlanBar pct={kpi.plan} />}

      {/* Contacts */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        {emp.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.whiteLow }}>
            <Phone size={9} /> {emp.phone}
          </div>
        )}
        {emp.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.whiteLow }}>
            <Mail size={9} /> {emp.email}
          </div>
        )}
      </div>
    </div>
  )
}

const FILTER_TABS: { key: FilterRole; label: string }[] = [
  { key: 'all',      label: 'Все' },
  { key: 'director', label: 'Директор' },
  { key: 'rop',      label: 'РОП' },
  { key: 'manager',  label: 'Менеджеры' },
]

type TeamKpiPageProps = { embedded?: boolean }

export function TeamKpiPage({ embedded = false }: TeamKpiPageProps) {
  const [filter, setFilter] = useState<FilterRole>('all')
  const [search, setSearch] = useState('')

  const employees = useMemo(() => {
    const q = search.trim().toLowerCase()
    return MOCK_EMPLOYEES.filter((e) => {
      const roleOk = filter === 'all' ? e.role !== 'owner' : e.role === filter
      if (!roleOk) return false
      if (!q) return true
      return (
        e.name.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        (e.email?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [filter, search])

  const strip = useMemo(() => {
    const nonOwner = employees.filter((e) => e.role !== 'owner')
    const totalRevenue = nonOwner.reduce((s, e) => s + (MOCK_KPI[e.id]?.revenue || 0), 0)
    const totalDeals = nonOwner.reduce((s, e) => s + (MOCK_KPI[e.id]?.dealsMonth || 0), 0)
    const plans = nonOwner.map((e) => MOCK_KPI[e.id]?.plan ?? 0)
    const avgPlan = plans.length ? Math.round(plans.reduce((a, b) => a + b, 0) / plans.length) : 0
    const overplan = nonOwner.filter((e) => (MOCK_KPI[e.id]?.plan || 0) >= 100).length
    return { totalRevenue, totalDeals, avgPlan, overplan, nonOwnerCount: nonOwner.length }
  }, [employees])

  const needAttention = useMemo(
    () =>
      employees
        .filter((e) => {
          if (e.role === 'owner') return false
          const k = MOCK_KPI[e.id]
          if (!k) return false
          return k.plan < 65 || k.activeTasks >= 10
        })
        .slice(0, 6),
    [employees],
  )

  const inner = (
      <div style={{ padding: embedded ? '0' : '24px 28px 40px', width: '100%', maxWidth: 'none' }}>
        <div style={{ marginBottom: embedded ? 16 : 20 }}>
          {embedded ? (
            <div style={{ fontSize: 13, fontWeight: 600, color: C.whiteMid }}>
              Карточки сотрудников по текущим фильтрам отчёта
            </div>
          ) : (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 4 }}>KPI команды</div>
              <div style={{ fontSize: 12, color: C.whiteLow }}>Показатели за текущий месяц · сводка по текущей выдаче</div>
            </>
          )}
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Выручка (не owner)</p>
            <p className="text-xl font-bold text-emerald-300">{formatUsdMillions(strip.totalRevenue, 1)}</p>
          </div>
          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Сделок за месяц</p>
            <p className="text-xl font-bold text-[color:var(--gold)]">{strip.totalDeals}</p>
          </div>
          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Ср. план</p>
            <p className={`text-xl font-bold ${strip.avgPlan >= 80 ? 'text-emerald-300' : 'text-orange-300'}`}>{strip.avgPlan}%</p>
          </div>
          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">≥100% плана</p>
            <p className="text-xl font-bold text-violet-300">
              {strip.overplan}
              <span className="text-sm font-normal text-[color:var(--app-text-subtle)]"> / {strip.nonOwnerCount}</span>
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div
            className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] px-3"
            style={{ minWidth: 200 }}
          >
            <Search className="size-3.5 shrink-0 text-[color:var(--app-text-subtle)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, должности, email..."
              className="min-w-0 flex-1 appearance-none border-0 bg-[var(--hub-card-bg)] text-xs text-[color:var(--workspace-text)] outline-none [color-scheme:dark] placeholder:text-[color:var(--app-text-subtle)]"
            />
          </div>
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {FILTER_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilter(t.key)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: filter === t.key ? 'rgba(201,168,76,0.1)' : 'transparent',
                  color: filter === t.key ? C.gold : C.whiteLow,
                  fontSize: 12,
                  fontWeight: filter === t.key ? 700 : 400,
                  borderBottom: filter === t.key ? '2px solid var(--gold)' : '2px solid transparent',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {needAttention.length > 0 && (
          <div className="mb-5 rounded-xl border border-orange-500/30 bg-orange-500/[0.07] p-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-orange-200">
              <AlertTriangle className="size-3.5 shrink-0" />
              Нужно внимание
            </div>
            <ul className="m-0 list-none space-y-1.5 p-0">
              {needAttention.map((e) => {
                const k = MOCK_KPI[e.id]!
                const bits: string[] = []
                if (k.plan < 65) bits.push(`план ${k.plan}%`)
                if (k.activeTasks >= 10) bits.push(`задач ${k.activeTasks}`)
                return (
                  <li
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-[color:var(--workspace-text)]">{e.name}</span>
                    <span className="text-[10px] text-[color:var(--app-text-subtle)]">{bits.join(' · ')}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {employees.map((emp) => (
            <KpiCard key={emp.id} emp={emp} />
          ))}
        </div>

        {employees.length === 0 && (
          <div className="py-16 text-center text-sm text-[color:var(--app-text-subtle)]">Никого не нашли по фильтрам</div>
        )}
      </div>
  )

  if (embedded) return inner
  return <DashboardShell>{inner}</DashboardShell>
}
