import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Users, ChevronRight, Wallet } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { PARTNERS_MOCK } from '@/data/partners-mock'
import {
  PARTNER_TYPE_LABELS, PARTNER_STATUS_LABELS,
  type PartnerType, type PartnerStatus,
} from '@/types/partners'
import { FMT_USD as FMT } from '@/lib/format-currency'

const STATUS_COLORS: Record<PartnerStatus, string> = {
  active:  '#4ade80',
  inactive: '#94a3b8',
  pending: '#fb923c',
}

const TYPE_COLORS: Record<PartnerType, string> = {
  referral:     '#60a5fa',
  intermediary: '#a78bfa',
  owner:        'var(--gold-light)',
}

type FilterType = PartnerType | 'all'

const TABS: { id: FilterType; label: string }[] = [
  { id: 'all',          label: 'Все' },
  { id: 'referral',     label: 'Рефералы' },
  { id: 'intermediary', label: 'Посредники' },
  { id: 'owner',        label: 'Собственники' },
]

const S = {
  page: {
    padding: '28px 28px 48px',
    minHeight: '100vh',
    fontFamily: "'Montserrat', sans-serif",
    background: 'var(--app-bg)',
  } as React.CSSProperties,
  title: { fontSize: 22, fontWeight: 700, color: 'var(--theme-accent-heading)', marginBottom: 4 } as React.CSSProperties,
  sub: { fontSize: 12, color: 'var(--hub-desc)', letterSpacing: '0.06em', marginBottom: 24 } as React.CSSProperties,
}

export function PartnersListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<FilterType>('all')

  const filtered = useMemo(() => {
    return PARTNERS_MOCK.filter(p => {
      const matchType = tab === 'all' || p.type === tab
      const q = search.toLowerCase()
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.email.toLowerCase().includes(q)
      return matchType && matchSearch
    })
  }, [search, tab])

  const totalComm = PARTNERS_MOCK.reduce((s, p) => s + p.commissionTotal, 0)
  const totalBalance = PARTNERS_MOCK.reduce((s, p) => s + p.balance, 0)
  const totalLeads = PARTNERS_MOCK.reduce((s, p) => s + p.leadsCount, 0)

  return (
    <DashboardShell>
      <div style={S.page}>
        <div style={S.title}>Партнёры</div>
        <div style={S.sub}>Рефералы · Посредники · Собственники</div>

        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Всего партнёров', value: String(PARTNERS_MOCK.length), color: 'var(--gold)' },
            { label: 'Переданных лидов', value: String(totalLeads), color: '#60a5fa' },
            { label: 'Комиссия выплачена', value: FMT.format(totalComm), color: '#4ade80' },
          ].map(k => (
            <div key={k.label} style={{
              background: 'var(--hub-card-bg)',
              border: '1px solid var(--hub-card-border)',
              borderRadius: 12,
              padding: '16px 20px',
            }}>
              <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--app-text-subtle)', marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--shell-search-bg)', border: '1px solid var(--shell-search-border)',
            borderRadius: 8, padding: '0 12px', height: 36, flex: 1, maxWidth: 320,
          }}>
            <Search size={13} color="var(--app-text-subtle)" />
            <input
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: 'var(--shell-search-fg)', fontFamily: 'inherit' }}
              placeholder="Поиск по имени, телефону..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="alphabase-section-primary">
            <Plus size={12} strokeWidth={2.5} />
            Добавить партнёра
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid var(--divider-subtle)', paddingBottom: 0 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 16px', fontSize: 11, fontWeight: tab === t.id ? 700 : 500,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                background: 'transparent', border: 'none',
                color: tab === t.id ? 'var(--gold)' : 'var(--app-text-subtle)',
                borderBottom: tab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {t.label}
              {t.id !== 'all' && (
                <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.6 }}>
                  ({PARTNERS_MOCK.filter(p => p.type === t.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--app-text-subtle)', fontSize: 13 }}>
              Нет партнёров по заданным фильтрам
            </div>
          )}
          {filtered.map(partner => (
            <div
              key={partner.id}
              onClick={() => navigate(`/dashboard/partners/${partner.id}`)}
              style={{
                background: 'var(--hub-card-bg)',
                border: '1px solid var(--hub-card-border)',
                borderRadius: 12,
                padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 16,
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--hub-card-bg-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--hub-card-bg)' }}
            >
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: `${TYPE_COLORS[partner.type]}18`,
                border: `1px solid ${TYPE_COLORS[partner.type]}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: TYPE_COLORS[partner.type],
              }}>
                {partner.name[0]}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--app-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {partner.name}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: TYPE_COLORS[partner.type], background: `${TYPE_COLORS[partner.type]}18`,
                    padding: '2px 6px', borderRadius: 4,
                  }}>
                    {PARTNER_TYPE_LABELS[partner.type]}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: STATUS_COLORS[partner.status], background: `${STATUS_COLORS[partner.status]}18`,
                    padding: '2px 6px', borderRadius: 4,
                  }}>
                    {PARTNER_STATUS_LABELS[partner.status]}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--app-text-muted)' }}>{partner.phone} · {partner.email}</div>
              </div>

              {/* Metrics */}
              <div style={{ display: 'flex', gap: 24, flexShrink: 0, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                    <Users size={11} color="var(--app-text-subtle)" />
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#60a5fa' }}>{partner.leadsCount}</span>
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--app-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>лидов</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                    <Wallet size={11} color="var(--app-text-subtle)" />
                    <span style={{ fontSize: 15, fontWeight: 700, color: partner.balance > 0 ? '#4ade80' : 'var(--app-text-subtle)' }}>
                      {FMT.format(partner.balance)}
                    </span>
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--app-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>баланс</div>
                </div>
                <ChevronRight size={16} color="var(--app-text-subtle)" />
              </div>
            </div>
          ))}
        </div>

        {/* Balance summary */}
        {totalBalance > 0 && (
          <div style={{
            marginTop: 24, padding: '14px 20px', borderRadius: 12,
            background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Wallet size={16} color="#4ade80" />
            <span style={{ fontSize: 13, color: 'var(--app-text-muted)' }}>
              Общая задолженность по выплатам: <strong style={{ color: '#4ade80' }}>{FMT.format(totalBalance)}</strong>
            </span>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
