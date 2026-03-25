import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { DEALS_MOCK } from '@/data/deals-mock'
import { formatUsdMillions, formatUsdThousands } from '@/lib/format-currency'
import { STAGE_LABELS, type Deal } from '@/types/deals'

const backToCrmBtn: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  height: 36,
  padding: '0 14px',
  background: 'rgba(201,168,76,0.1)',
  border: '1px solid rgba(201,168,76,0.35)',
  borderRadius: 10,
  color: '#e6c364',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.06em',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
  green: '#4ade80',
}

const DEALS_STORAGE_KEY = 'agency-new.deals.kanban'

function readDealsSnapshot(): Deal[] {
  if (typeof window === 'undefined') return DEALS_MOCK
  try {
    const raw = window.localStorage.getItem(DEALS_STORAGE_KEY)
    if (!raw) return DEALS_MOCK
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as Deal[]) : DEALS_MOCK
  } catch {
    return DEALS_MOCK
  }
}

export function DealsReportPage() {
  const navigate = useNavigate()
  const deals = readDealsSnapshot()

  const totalCommission = deals.reduce((s, d) => s + d.commission, 0)
  const successStages = new Set(['deal'])
  const successDeals = deals.filter(d => successStages.has(d.stage))
  const activeDeals = deals.filter(d => !successStages.has(d.stage))

  return (
    <DashboardShell>
      <div style={{ padding: '24px 28px 40px', maxWidth: 900 }}>
        <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => navigate('/dashboard/crm')} style={backToCrmBtn}>
            <ArrowLeft size={18} strokeWidth={2} />
            Назад
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/deals')}
            style={{ background: 'none', border: 'none', color: C.whiteLow, fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
          >
            К канбану сделок
          </button>
        </div>

        <div style={{ fontSize: 26, fontWeight: 700, color: C.white, marginBottom: 4 }}>Отчёт по сделкам</div>
        <div style={{ fontSize: 13, color: C.whiteLow, marginBottom: 28 }}>Сводная статистика и комиссии</div>

        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Всего сделок', value: deals.length.toString() },
            { label: 'Активных', value: activeDeals.length.toString(), color: '#60a5fa' },
            { label: 'Успешных', value: successDeals.length.toString(), color: C.green },
            { label: 'Общая комиссия', value: formatUsdMillions(totalCommission, 2), color: C.gold },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '18px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.whiteLow, marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color || C.white }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Deals table */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8 }}>
            {['Клиент / Объект', 'Этап', 'Цена', 'Комиссия'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: C.whiteLow }}>{h}</div>
            ))}
          </div>
          {deals.map((deal, i) => (
            <div
              key={deal.id}
              onClick={() => navigate(`/dashboard/deals/${deal.id}`)}
              style={{
                padding: '14px 20px',
                borderBottom: i < deals.length - 1 ? `1px solid ${C.border}` : 'none',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: 8,
                cursor: 'pointer',
                alignItems: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div>
                <div style={{ fontSize: 13, color: C.white, fontWeight: 500 }}>{deal.clientName}</div>
                <div style={{ fontSize: 11, color: C.whiteLow }}>{deal.propertyAddress}</div>
              </div>
              <div style={{ fontSize: 12, color: C.whiteMid }}>{STAGE_LABELS[deal.stage]}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.white }}>{formatUsdMillions(deal.price, 1)}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.gold }}>{formatUsdThousands(deal.commission)}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
