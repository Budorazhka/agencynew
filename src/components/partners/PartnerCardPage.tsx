import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, Building2, Users, Wallet, TrendingUp } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { PARTNERS_MOCK } from '@/data/partners-mock'
import { PARTNER_TYPE_LABELS, PARTNER_STATUS_LABELS } from '@/types/partners'

import { FMT_USD as FMT } from '@/lib/format-currency'

const LEAD_STATUS_LABELS: Record<string, string> = {
  new:         'Новый',
  in_progress: 'В работе',
  qualified:   'Квалифицирован',
  won:         'Выиграли',
  lost:        'Проиграли',
}
const LEAD_STATUS_COLORS: Record<string, string> = {
  new:         '#22d3ee',
  in_progress: '#60a5fa',
  qualified:   '#a78bfa',
  won:         '#4ade80',
  lost:        '#ef4444',
}

type Tab = 'profile' | 'leads' | 'payouts'

const S = {
  page:  { padding: '28px 28px 48px', minHeight: '100vh', fontFamily: 'Inter, sans-serif' } as React.CSSProperties,
  gold:  'var(--gold)',
  white: 'rgba(255,255,255,0.85)',
  dim:   'rgba(255,255,255,0.4)',
  card:  { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' } as React.CSSProperties,
}

export function PartnerCardPage() {
  const { partnerId } = useParams<{ partnerId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('profile')

  const partner = PARTNERS_MOCK.find(p => p.id === partnerId)
  if (!partner) {
    return (
      <DashboardShell topBack={{ label: 'Назад', route: '/dashboard/partners/list' }}>
        <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Партнёр не найден</div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell topBack={{ label: 'Назад', route: '/dashboard/partners/list' }}>
      <div style={S.page}>
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard/partners/list')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: S.dim, fontSize: 12, marginBottom: 20 }}
        >
          <ArrowLeft size={14} />
          Все партнёры
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(242,207,141,0.12)', border: '1px solid rgba(242,207,141,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: S.gold,
          }}>
            {partner.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: S.gold }}>{partner.name}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#60a5fa', background: 'rgba(96,165,250,0.12)', padding: '3px 8px', borderRadius: 4,
              }}>
                {PARTNER_TYPE_LABELS[partner.type]}
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: partner.status === 'active' ? '#4ade80' : partner.status === 'pending' ? '#fb923c' : 'rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4,
              }}>
                {PARTNER_STATUS_LABELS[partner.status]}
              </span>
            </div>
            {partner.company && <div style={{ fontSize: 12, color: S.dim, marginBottom: 4 }}>{partner.company}</div>}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: S.dim }}>
                <Phone size={12} />{partner.phone}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: S.dim }}>
                <Mail size={12} />{partner.email}
              </span>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            {[
              { icon: Users, value: String(partner.leadsCount), label: 'Лидов', color: '#60a5fa' },
              { icon: TrendingUp, value: FMT.format(partner.commissionTotal), label: 'Комиссия', color: '#4ade80' },
              { icon: Wallet, value: FMT.format(partner.balance), label: 'Баланс', color: partner.balance > 0 ? '#4ade80' : S.dim },
            ].map(k => (
              <div key={k.label} style={{ ...S.card, textAlign: 'center', padding: '12px 16px' }}>
                <k.icon size={14} color={k.color} style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 9, color: S.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
          {([['profile','Профиль'],['leads','Переданные лиды'],['payouts','Начисления']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '8px 18px', fontSize: 11, fontWeight: tab === id ? 700 : 500,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              background: 'transparent', border: 'none',
              color: tab === id ? S.gold : S.dim,
              borderBottom: tab === id ? '2px solid var(--gold)' : '2px solid transparent',
              marginBottom: -1,
            }}>
              {label}
              {id === 'leads' && <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.6 }}>({partner.leads.length})</span>}
              {id === 'payouts' && <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.6 }}>({partner.payouts.length})</span>}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={S.card}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: S.dim, marginBottom: 12 }}>Контактные данные</div>
              {[
                { label: 'Имя / Компания', value: partner.company ?? partner.name },
                { label: 'Телефон', value: partner.phone },
                { label: 'Email', value: partner.email },
                { label: 'Тип партнёра', value: PARTNER_TYPE_LABELS[partner.type] },
                { label: 'Статус', value: PARTNER_STATUS_LABELS[partner.status] },
                { label: 'Дата регистрации', value: new Date(partner.registeredAt).toLocaleDateString('ru') },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 12, color: S.dim }}>{row.label}</span>
                  <span style={{ fontSize: 12, color: S.white, fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: S.dim, marginBottom: 12 }}>Финансовая сводка</div>
              {[
                { label: 'Всего передано лидов', value: partner.leadsCount, color: '#60a5fa' },
                { label: 'Комиссия всего', value: FMT.format(partner.commissionTotal), color: '#4ade80' },
                { label: 'Текущий баланс', value: FMT.format(partner.balance), color: partner.balance > 0 ? '#4ade80' : S.dim },
                { label: 'Выплат произведено', value: partner.payouts.length, color: S.white },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 12, color: S.dim }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads tab */}
        {tab === 'leads' && (
          <div style={S.card}>
            {partner.leads.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: S.dim, fontSize: 13 }}>Нет переданных лидов</div>
            )}
            {partner.leads.map((lead, i) => (
              <div key={lead.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: i < partner.leads.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: S.white }}>{lead.clientName}</div>
                  <div style={{ fontSize: 11, color: S.dim }}>{new Date(lead.transferredAt).toLocaleDateString('ru')}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {lead.commission != null && lead.commission > 0 && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>{FMT.format(lead.commission)}</span>
                  )}
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: LEAD_STATUS_COLORS[lead.status] ?? S.dim,
                    background: `${LEAD_STATUS_COLORS[lead.status] ?? 'rgba(255,255,255,0.1)'}18`,
                    padding: '3px 8px', borderRadius: 4,
                  }}>
                    {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payouts tab */}
        {tab === 'payouts' && (
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: S.dim }}>История выплат</span>
              <button style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
                color: '#4ade80', cursor: 'pointer', letterSpacing: '0.05em',
              }}>
                + Начислить
              </button>
            </div>
            {partner.payouts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: S.dim, fontSize: 13 }}>Нет выплат</div>
            )}
            {partner.payouts.map((payout, i) => (
              <div key={payout.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: i < partner.payouts.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: S.white }}>{FMT.format(payout.amount)}</div>
                  <div style={{ fontSize: 11, color: S.dim }}>
                    {new Date(payout.date).toLocaleDateString('ru')} · Сделка: {payout.dealId}
                  </div>
                  {payout.comment && <div style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>{payout.comment}</div>}
                </div>
                <Building2 size={14} color="rgba(255,255,255,0.2)" />
              </div>
            ))}
            {partner.payouts.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: S.dim }}>Итого выплачено</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#4ade80' }}>
                  {FMT.format(partner.payouts.reduce((s, p) => s + p.amount, 0))}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
