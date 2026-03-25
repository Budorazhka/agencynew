import { useState } from 'react'
import { Phone, Mail, TrendingUp, Target, Users, Briefcase } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { MOCK_EMPLOYEES, ROLE_LABELS, type Employee } from '@/data/personnel-mock'

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
}

const ROLE_ACCENT: Record<string, string> = {
  owner:    '#f2cf8d',
  director: '#7ec8e3',
  rop:      '#fb923c',
  manager:  '#4ade80',
}

// Mock KPI per employee
const MOCK_KPI: Record<string, { leadsMonth: number; dealsMonth: number; revenue: number; plan: number; activeTasks: number }> = {
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

export function TeamKpiPage() {
  const [filter, setFilter] = useState<FilterRole>('all')

  const employees = MOCK_EMPLOYEES.filter(e =>
    filter === 'all' ? e.role !== 'owner' : e.role === filter
  )

  // Aggregate KPI for strip
  const managers = MOCK_EMPLOYEES.filter(e => e.role === 'manager')
  const totalRevenue = managers.reduce((s, e) => s + (MOCK_KPI[e.id]?.revenue || 0), 0)
  const avgPlan = Math.round(managers.reduce((s, e) => s + (MOCK_KPI[e.id]?.plan || 0), 0) / (managers.length || 1))
  const totalDeals = managers.reduce((s, e) => s + (MOCK_KPI[e.id]?.dealsMonth || 0), 0)
  const overplan = managers.filter(e => (MOCK_KPI[e.id]?.plan || 0) >= 100).length

  return (
    <DashboardShell>
      <div style={{ padding: '24px 28px 40px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 4 }}>KPI команды</div>
          <div style={{ fontSize: 12, color: C.whiteLow }}>Показатели за текущий месяц</div>
        </div>

        {/* Summary strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Выручка (менеджеры)', value: `${(totalRevenue / 1_000_000).toFixed(1)}M ₽`, color: '#4ade80' },
            { label: 'Сделок закрыто',      value: totalDeals,                                    color: C.gold   },
            { label: 'Ср. выполнение плана',value: `${avgPlan}%`,                                  color: avgPlan >= 80 ? '#4ade80' : '#fb923c' },
            { label: 'Перевыполнили план',  value: `${overplan} из ${managers.length}`,            color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: C.whiteLow, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
          {FILTER_TABS.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)} style={{
              padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: filter === t.key ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: filter === t.key ? C.gold : C.whiteLow,
              fontSize: 12, fontWeight: filter === t.key ? 700 : 400,
              borderBottom: filter === t.key ? '2px solid var(--gold)' : '2px solid transparent',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {employees.map(emp => (
            <KpiCard key={emp.id} emp={emp} />
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
