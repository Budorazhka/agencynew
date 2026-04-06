import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Briefcase, AlertTriangle, ChevronRight } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { DEALS_MOCK } from '@/data/deals-mock'
import { formatUsdMillions } from '@/lib/format-currency'
import { STAGE_LABELS, STAGE_ORDER, type Deal, type DealStage } from '@/types/deals'
import { useLeads } from '@/context/LeadsContext'
import { LEAD_STAGE_COLUMN, LEAD_STAGES } from '@/data/leads-mock'
import type { Lead } from '@/types/leads'

const STAGE_COLORS: Record<DealStage, string> = {
  showing:   '#60a5fa',
  deposit:   '#f87171',
  deal:      '#c9a84c',
}

const C = {
  text: 'var(--app-text)',
  textMuted: 'var(--app-text-muted)',
  textSubtle: 'var(--app-text-subtle)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
}

const DEALS_STORAGE_KEY = 'agency-new.deals.kanban'
const DEAL_STAGE_SET = new Set<DealStage>(STAGE_ORDER)

function safeDate(value?: string) {
  if (!value) return new Date().toISOString().split('T')[0]
  return value.split('T')[0]
}

function readDealsFromStorage(): Deal[] {
  if (typeof window === 'undefined') return DEALS_MOCK
  try {
    const raw = window.localStorage.getItem(DEALS_STORAGE_KEY)
    if (!raw) return DEALS_MOCK
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return DEALS_MOCK
    return parsed as Deal[]
  } catch {
    return DEALS_MOCK
  }
}

function stageFromLead(stageId: string): DealStage {
  if (DEAL_STAGE_SET.has(stageId as DealStage)) return stageId as DealStage
  return 'showing'
}

function createDealFromLead(lead: Lead, agentName?: string): Deal {
  const stage = stageFromLead(lead.stageId)
  const commission = Math.max(120000, Math.round((lead.commissionUsd ?? 1500) * 80))
  const price = Math.max(5500000, Math.round(commission / 0.02))
  const createdAt = safeDate(lead.createdAt)
  const updatedAt = safeDate(lead.updatedAt ?? lead.createdAt)
  const sourceLabel = lead.source === 'primary' ? 'Первичка' : lead.source === 'secondary' ? 'Вторичка' : lead.source === 'rent' ? 'Аренда' : 'Реклама'

  return {
    id: `deal-lead-${lead.id}`,
    sourceLeadId: lead.id,
    type: lead.source === 'secondary' ? 'secondary' : 'primary',
    stage,
    clientId: lead.id,
    clientName: lead.name ?? `Лид ${lead.id}`,
    propertyAddress: 'Адрес уточняется',
    propertyType: `${sourceLabel} · объект подбирается`,
    agentId: lead.managerId ?? 'unassigned',
    agentName: agentName ?? 'Не назначен',
    participants: [
      { role: 'agent', name: agentName ?? 'Не назначен', userId: lead.managerId ?? undefined },
      { role: 'buyer', name: lead.name ?? `Лид ${lead.id}` },
    ],
    price,
    commission,
    createdAt,
    updatedAt,
    checklist: [
      { id: `lead-${lead.id}-c1`, label: 'Лид переведен в этап сделки', done: true, required: true },
      { id: `lead-${lead.id}-c2`, label: 'Уточнить объект и финальные условия', done: false, required: true },
    ],
    notes: `Сделка создана из CRM-лида (${sourceLabel}).`,
  }
}

function formatPrice(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  return `${(n / 1000).toFixed(0)}K`
}

export function DealsKanbanPage() {
  const navigate = useNavigate()
  const { state, leadManagers } = useLeads()
  const [deals, setDeals] = useState<Deal[]>(readDealsFromStorage)
  const [isLeadPickerOpen, setIsLeadPickerOpen] = useState(false)

  const managerNameById = useMemo(() => {
    const map = new Map<string, string>()
    leadManagers.forEach(m => map.set(m.id, m.name))
    return map
  }, [leadManagers])

  const inProgressLeads = useMemo(
    () => state.leadPool.filter(lead => LEAD_STAGE_COLUMN[lead.stageId] === 'in_progress'),
    [state.leadPool],
  )

  const dealStageLeads = useMemo(
    () => inProgressLeads.filter(lead => DEAL_STAGE_SET.has(lead.stageId as DealStage)),
    [inProgressLeads],
  )

  const linkedLeadIds = useMemo(() => new Set(deals.map(d => d.sourceLeadId).filter(Boolean)), [deals])
  const selectableLeads = useMemo(
    () => inProgressLeads.filter(lead => !linkedLeadIds.has(lead.id)),
    [inProgressLeads, linkedLeadIds],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(DEALS_STORAGE_KEY, JSON.stringify(deals))
  }, [deals])

  useEffect(() => {
    setDeals(prev => {
      const knownLeadIds = new Set(prev.map(d => d.sourceLeadId).filter(Boolean))
      const autoDeals = dealStageLeads
        .filter(lead => !knownLeadIds.has(lead.id))
        .map(lead => createDealFromLead(lead, lead.managerId ? managerNameById.get(lead.managerId) : undefined))
      if (autoDeals.length === 0) return prev
      return [...prev, ...autoDeals]
    })
  }, [dealStageLeads, managerNameById])

  const dealsByStage = STAGE_ORDER.reduce<Record<DealStage, Deal[]>>((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage)
    return acc
  }, {} as Record<DealStage, Deal[]>)

  function advanceStage(dealId: string) {
    setDeals(prev => prev.map(d => {
      if (d.id !== dealId) return d
      const idx = STAGE_ORDER.indexOf(d.stage)
      if (idx < 0 || idx >= STAGE_ORDER.length - 1) return d
      const nextStage = STAGE_ORDER[idx + 1]
      // При переходе на deposit (выход на задаток) — автоматически создаём задачу юристу
      const lawyerTaskCreated = nextStage === 'deposit' ? true : d.lawyerTaskCreated
      if (nextStage === 'deposit' && !d.lawyerTaskCreated) {
        // В реальной системе — event trigger. Здесь: уведомление
        setTimeout(() => alert(`✅ Автозадача создана: Юрист — "Подготовить договор задатка" для ${d.clientName}`), 50)
      }
      return { ...d, stage: nextStage, lawyerTaskCreated, updatedAt: new Date().toISOString().split('T')[0] }
    }))
  }

  function createDealFromSelectedLead(lead: Lead) {
    const exists = deals.some(d => d.sourceLeadId === lead.id)
    if (exists) return
    const created = createDealFromLead(lead, lead.managerId ? managerNameById.get(lead.managerId) : undefined)
    setDeals(prev => [created, ...prev])
    setIsLeadPickerOpen(false)
  }

  return (
    <DashboardShell>
      <div
        style={{
          padding: '24px 28px 40px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          background: 'var(--app-bg)',
          minHeight: '100%',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>Сделки</div>
            <div style={{ fontSize: 13, color: C.textSubtle, marginTop: 4 }}>
              Канбан воронки · {deals.length} активных сделок
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, position: 'relative' as const }}>
            <button
              onClick={() => navigate('/dashboard/deals/report')}
              style={{
                padding: '9px 16px',
                background: 'var(--hub-card-bg)',
                border: '1px solid var(--hub-card-border)',
                borderRadius: 7,
                color: C.textMuted,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Отчёт
            </button>
            <button
              type="button"
              className="alphabase-section-primary"
              onClick={() => setIsLeadPickerOpen(v => !v)}
            >
              <Plus size={13} strokeWidth={2.5} /> Новая сделка
            </button>
            {isLeadPickerOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: 420,
                maxHeight: 360,
                overflowY: 'auto' as const,
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                zIndex: 30,
                boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
              }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textSubtle, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                  Выбери лида (этапы "в работе")
                </div>
                {selectableLeads.length === 0 && (
                  <div style={{ padding: '14px 12px', color: C.textSubtle, fontSize: 12 }}>
                    Нет лидов для создания сделки.
                  </div>
                )}
                {selectableLeads.map(lead => {
                  const stageName = LEAD_STAGES.find(s => s.id === lead.stageId)?.name ?? lead.stageId
                  return (
                    <button
                      key={lead.id}
                      onClick={() => createDealFromSelectedLead(lead)}
                      style={{
                        width: '100%',
                        textAlign: 'left' as const,
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `1px solid ${C.border}`,
                        padding: '10px 12px',
                        cursor: 'pointer',
                        color: C.text,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{lead.name ?? `Лид ${lead.id}`}</div>
                      <div style={{ fontSize: 11, color: C.textSubtle, marginTop: 3 }}>
                        Этап: {stageName} · Менеджер: {lead.managerId ? managerNameById.get(lead.managerId) ?? 'Не назначен' : 'Не назначен'}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Kanban board */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            width: '100%',
            overflowX: 'auto' as const,
            paddingBottom: 16,
            marginTop: 20,
            alignItems: 'stretch',
          }}
        >
          {STAGE_ORDER.map(stage => {
            const stageDealList = dealsByStage[stage] || []
            const stageColor = STAGE_COLORS[stage]
            const totalCommission = stageDealList.reduce((s, d) => s + d.commission, 0)

            return (
              <div
                key={stage}
                style={{
                  flex: '1 1 0%',
                  minWidth: 260,
                  maxWidth: '100%',
                }}
              >
                {/* Column header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: `${stageColor}12`,
                  border: `1px solid ${stageColor}30`,
                  borderRadius: '8px 8px 0 0',
                  borderBottom: 'none',
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: stageColor, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                      {STAGE_LABELS[stage]}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--app-text-subtle)', marginTop: 2 }}>
                      {stageDealList.length} сделок · {formatPrice(totalCommission)} комисс.
                    </div>
                  </div>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: `${stageColor}20`,
                    border: `1px solid ${stageColor}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: stageColor,
                  }}>
                    {stageDealList.length}
                  </div>
                </div>

                {/* Cards */}
                <div style={{
                  minHeight: 'clamp(200px, calc(100vh - 280px), 720px)',
                  background: 'var(--green-deep)',
                  border: `1px solid ${stageColor}20`,
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: 8,
                }}>
                  {stageDealList.map(deal => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      stageColor={stageColor}
                      onAdvance={() => advanceStage(deal.id)}
                      onClick={() => navigate(`/dashboard/deals/${deal.id}`)}
                    />
                  ))}
                  {stageDealList.length === 0 && (
                    <div style={{ padding: '20px 0', textAlign: 'center' as const, fontSize: 11, color: 'var(--app-text-subtle)' }}>
                      Пусто
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardShell>
  )
}

function DealCard({
  deal,
  stageColor,
  onAdvance,
  onClick,
}: {
  deal: Deal
  stageColor: string
  onAdvance: () => void
  onClick: () => void
}) {
  const C_local = {
    text: 'var(--app-text)',
    textSubtle: 'var(--app-text-subtle)',
    border: 'var(--green-border)',
    card: 'var(--green-card)',
    gold: 'var(--gold)',
  }

  const doneItems = deal.checklist.filter(c => c.done).length
  const totalItems = deal.checklist.length
  const checklistPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0
  return (
    <div
      style={{
        background: C_local.card,
        border: `1px solid ${C_local.border}`,
        borderRadius: 8,
        padding: '12px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = `${stageColor}50`)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = C_local.border)}
    >
      {/* Deal info */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C_local.text, marginBottom: 2 }}>
          {deal.clientName}
        </div>
        <div style={{ fontSize: 11, color: C_local.textSubtle }}>{deal.propertyAddress}</div>
        <div style={{ fontSize: 10, color: C_local.textSubtle }}>{deal.propertyType}</div>
      </div>

      {/* Price */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C_local.text }}>
          {formatUsdMillions(deal.price, 1)}
        </span>
        <span style={{ fontSize: 11, color: C_local.gold }}>
          +{(deal.commission / 1000).toFixed(0)}K комисс.
        </span>
      </div>

      {/* Checklist progress */}
      {totalItems > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 10, color: C_local.textSubtle }}>Чеклист</span>
            <span style={{ fontSize: 10, color: C_local.textSubtle }}>{doneItems}/{totalItems}</span>
          </div>
          <div style={{ height: 3, background: 'var(--hub-progress-track)', borderRadius: 2 }}>
            <div style={{
              height: '100%',
              width: `${checklistPct}%`,
              background: checklistPct === 100 ? '#4ade80' : stageColor,
              borderRadius: 2,
            }} />
          </div>
        </div>
      )}

      {/* Lawyer task badge */}
      {deal.lawyerTaskCreated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <AlertTriangle size={10} color="#fb923c" />
          <span style={{ fontSize: 10, color: '#fb923c' }}>Задача юристу создана</span>
        </div>
      )}

      {/* Agent */}
      <div style={{ fontSize: 10, color: C_local.textSubtle, marginBottom: 8 }}>
        {deal.agentName}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onClick() }}
          style={{
            flex: 1,
            padding: '6px 8px',
            background: 'var(--hub-tile-icon-bg)',
            border: '1px solid var(--hub-tile-icon-border)',
            borderRadius: 6,
            color: 'var(--app-text)',
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--nav-item-bg-active)'
            e.currentTarget.style.borderColor = 'var(--hub-card-border-hover)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--hub-tile-icon-bg)'
            e.currentTarget.style.borderColor = 'var(--hub-tile-icon-border)'
          }}
        >
          <Briefcase size={12} strokeWidth={2.25} color="var(--gold)" aria-hidden />
          Карточка
        </button>
        {deal.stage !== 'deal' && (
          <button
            onClick={e => { e.stopPropagation(); onAdvance() }}
            style={{
              flex: 1,
              padding: '5px 8px',
              background: `${stageColor}15`,
              border: `1px solid ${stageColor}40`,
              borderRadius: 5,
              color: stageColor,
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <ChevronRight size={10} /> Продвинуть
          </button>
        )}
      </div>
    </div>
  )
}
