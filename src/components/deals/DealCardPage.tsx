import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckSquare, Square, AlertTriangle, User, Building2, Bookmark, Contact } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { LeadHistoryTimeline } from '@/components/leads/LeadHistoryTimeline'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { useLeads } from '@/context/LeadsContext'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import { DEALS_MOCK } from '@/data/deals-mock'
import { FMT_USD, formatUsdMillions, formatUsdThousands } from '@/lib/format-currency'
import { CLIENTS_MOCK } from '@/data/clients-mock'
import { STAGE_LABELS, STAGE_ORDER, type Deal } from '@/types/deals'

const STAGE_COLORS: Record<string, string> = {
  showing:   '#60a5fa',
  deposit:   '#f87171',
  deal:      '#c9a84c',
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

/** Как кнопка «Назад» на хабе CRM (ModuleHub) */
const S = {
  backToCrm: {
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
  } as CSSProperties,
}

type Tab = 'checklist' | 'participants' | 'finances' | 'history'
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

export function DealCardPage() {
  const { dealId } = useParams<{ dealId: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { isManager } = useRolePermissions()
  const { getLeadWithHistory, state: leadsState, dispatch, leadManagers } = useLeads()
  const [tab, setTab] = useState<Tab>('checklist')
  const [deals, setDeals] = useState<Deal[]>(readDealsSnapshot)
  const [transferConfirm, setTransferConfirm] = useState<{
    newManagerId: string | null
    newManagerName: string
  } | null>(null)

  const deal = deals.find(d => d.id === dealId)

  /** Связанный лид в CRM: sourceLeadId, clientId lead-* или клиент с convertedFromLeadId, если лид есть в пуле */
  const linkedLeadId = useMemo(() => {
    const d = deals.find(x => x.id === dealId)
    if (!d) return null
    if (d.sourceLeadId) return d.sourceLeadId
    if (d.clientId?.startsWith('lead-')) return d.clientId
    const client = CLIENTS_MOCK.find(c => c.id === d.clientId)
    const conv = client?.convertedFromLeadId
    if (conv && leadsState.leadPool.some(l => l.id === conv)) return conv
    return null
  }, [deals, dealId, leadsState.leadPool])

  const leadCrmPath = linkedLeadId
    ? `/dashboard/leads/poker?lead=${encodeURIComponent(linkedLeadId)}`
    : null

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(DEALS_STORAGE_KEY, JSON.stringify(deals))
    } catch {
      /* ignore */
    }
  }, [deals])

  if (!deal) {
    return (
      <DashboardShell topBack={{ label: 'Назад', route: '/dashboard/deals/kanban' }}>
        <div style={{ padding: 40, color: C.whiteLow }}>
          <button type="button" onClick={() => navigate('/dashboard/crm')} style={{ ...S.backToCrm, marginBottom: 16 }}>
            <ArrowLeft size={20} strokeWidth={2} />
            Назад
          </button>
          <div>Сделка не найдена.</div>
        </div>
      </DashboardShell>
    )
  }

  const stageColor = STAGE_COLORS[deal.stage] || C.gold
  const stageIdx = STAGE_ORDER.indexOf(deal.stage)

  function toggleChecklistItem(itemId: string) {
    setDeals(prev => prev.map(d => {
      if (d.id !== dealId) return d
      return {
        ...d,
        checklist: d.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c),
      }
    }))
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'checklist', label: 'Чеклист' },
    { key: 'participants', label: 'Участники' },
    { key: 'finances', label: 'Финансы' },
    { key: 'history', label: 'История' },
  ]

  const clientCrmPath =
    deal.clientId?.startsWith('cl-') ? `/dashboard/clients/${deal.clientId}` : null
  const linkedLead = linkedLeadId ? getLeadWithHistory(linkedLeadId) : null

  return (
    <DashboardShell topBack={{ label: 'Назад', route: '/dashboard/deals/kanban' }}>
      <div
        style={{
          padding: '24px 28px 40px',
          maxWidth: tab === 'history' && linkedLeadId ? 1024 : 900,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Назад — в хаб CRM (как на экране CRM) */}
        <div style={{ marginBottom: 20 }}>
          <button type="button" onClick={() => navigate('/dashboard/crm')} style={S.backToCrm}>
            <ArrowLeft size={20} strokeWidth={2} />
            Назад
          </button>
        </div>

        {/* Header */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.white }}>{deal.clientName}</div>
              <div style={{ fontSize: 13, color: C.whiteLow, marginTop: 3 }}>{deal.propertyAddress} · {deal.propertyType}</div>
              <div style={{ marginTop: 8 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: `${stageColor}18`,
                  border: `1px solid ${stageColor}44`,
                  color: stageColor,
                  letterSpacing: '0.06em',
                }}>
                  {STAGE_LABELS[deal.stage]}
                </span>
                {deal.lawyerTaskCreated && (
                  <span style={{
                    marginLeft: 8,
                    fontSize: 10,
                    padding: '4px 8px',
                    borderRadius: 20,
                    background: 'rgba(251,146,60,0.1)',
                    border: '1px solid rgba(251,146,60,0.3)',
                    color: '#fb923c',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <AlertTriangle size={10} /> Задача юристу создана
                  </span>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.white }}>{formatUsdMillions(deal.price, 1)}</div>
              <div style={{ fontSize: 12, color: C.gold }}>Комиссия: {formatUsdThousands(deal.commission)}</div>
              <div style={{ fontSize: 11, color: C.whiteLow, marginTop: 4 }}>Агент: {deal.agentName}</div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: C.whiteLow, marginBottom: 12, lineHeight: 1.45 }}>
            Редактировать чеклист и отмечать пункты — во вкладке «Чеклист» ниже. Данные сделки для демо хранятся в браузере (localStorage); начальный набор — в файле{' '}
            <code style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>src/data/deals-mock.ts</code>.
          </p>

          {/* Cross-module actions → CRM */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' as const, alignItems: 'center' }}>
            {clientCrmPath && (
              <button
                type="button"
                onClick={() => navigate(clientCrmPath)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.22)', color: '#60a5fa' }}
              >
                <User size={11} /> Клиент в CRM
              </button>
            )}
            {leadCrmPath && (
              <button
                type="button"
                onClick={() => navigate(leadCrmPath)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.28)', color: '#34d399' }}
              >
                <Contact size={11} /> Открыть полную карточку
              </button>
            )}
            {!clientCrmPath && (
              <button
                type="button"
                onClick={() => navigate(`/dashboard/clients/list?search=${encodeURIComponent(deal.clientName)}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.18)', color: '#93c5fd' }}
              >
                <User size={11} /> Найти в клиентах
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/dashboard/objects/list')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)', color: C.gold }}
            >
              <Building2 size={11} /> Объект в каталоге
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/bookings/client')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.22)', color: '#a78bfa' }}
            >
              <Bookmark size={11} /> Создать бронь
            </button>
          </div>

          {/* Stage progress */}
          <div style={{ display: 'flex', gap: 4 }}>
            {STAGE_ORDER.map((s, i) => (
              <div key={s} style={{ flex: 1 }}>
                <div style={{
                  height: 4,
                  borderRadius: 2,
                  background: i <= stageIdx ? STAGE_COLORS[s] || C.gold : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s',
                }} />
                <div style={{ fontSize: 9, color: i === stageIdx ? stageColor : C.whiteLow, marginTop: 4, textAlign: 'center' as const, letterSpacing: '0.04em' }}>
                  {STAGE_LABELS[s].split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: tab === t.key ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: tab === t.key ? C.gold : C.whiteLow,
              fontSize: 13,
              fontWeight: tab === t.key ? 700 : 400,
              cursor: 'pointer',
              borderBottom: tab === t.key ? '2px solid var(--gold)' : '2px solid transparent',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'checklist' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.whiteLow, marginBottom: 14 }}>
              Чеклист для перехода на следующий этап
            </div>
            {deal.checklist.map(item => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                }}
              >
                {item.done
                  ? <CheckSquare size={16} color={C.green} />
                  : <Square size={16} color={C.whiteLow} />
                }
                <span style={{ fontSize: 13, color: item.done ? C.whiteLow : C.white, textDecoration: item.done ? 'line-through' : 'none' }}>
                  {item.label}
                </span>
                {item.required && !item.done && (
                  <span style={{ fontSize: 10, color: '#f87171', marginLeft: 'auto' }}>обязательно</span>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'participants' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px' }}>
            {deal.participants.map((p, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < deal.participants.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div style={{ fontSize: 13, color: C.white }}>{p.name}</div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 20,
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  color: C.gold,
                }}>
                  {p.role === 'agent' ? 'Агент' : p.role === 'lawyer' ? 'Юрист' : p.role === 'buyer' ? 'Покупатель' : p.role === 'seller' ? 'Продавец' : 'РОП'}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'finances' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px' }}>
            {[
              { label: 'Стоимость объекта', value: formatUsdMillions(deal.price, 2), color: C.white },
              { label: 'Комиссия агентства', value: FMT_USD.format(deal.commission), color: C.gold },
              { label: 'Ставка комиссии', value: `${((deal.commission / deal.price) * 100).toFixed(1)}%`, color: C.gold },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <span style={{ fontSize: 13, color: C.whiteLow }}>{row.label}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'history' && (
          linkedLeadId ? (
            <>
              {/* Тот же каркас, что диалог «История» в LeadsCardTableView */}
              <div className="flex h-[90vh] max-h-[900px] w-full max-w-5xl flex-col overflow-hidden rounded-xl border-none bg-slate-50 p-0 shadow-2xl">
                <div className="flex shrink-0 flex-row items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold tracking-tight text-slate-900">Карточка лида</h3>
                    <p className="text-sm font-medium text-slate-500">
                      {linkedLead?.name ? linkedLead.name : 'Выберите лида'}
                    </p>
                  </div>

                  {linkedLead && !isManager && (
                    <div className="mr-8 flex items-center gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Передать:
                      </span>
                      <Select
                        value={linkedLead.managerId || 'unassigned'}
                        onValueChange={(val) => {
                          const newManagerId = val === 'unassigned' ? null : val
                          const newManagerName = newManagerId
                            ? (leadManagers.find(m => m.id === newManagerId)?.name ?? 'Неизвестный менеджер')
                            : ''
                          setTransferConfirm({ newManagerId, newManagerName })
                        }}
                      >
                        <SelectTrigger className="h-9 w-[220px] border-slate-200 bg-white text-sm">
                          <SelectValue placeholder="Выберите менеджера" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned" className="italic text-slate-500">
                            Выберите менеджера
                          </SelectItem>
                          {leadManagers.map(mgr => (
                            <SelectItem key={mgr.id} value={mgr.id}>
                              {mgr.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="min-h-0 flex-1 bg-slate-50/50">
                  <LeadHistoryTimeline leadId={linkedLeadId} initialInputType="comment" />
                </div>
              </div>

              <Dialog open={!!transferConfirm} onOpenChange={open => { if (!open) setTransferConfirm(null) }}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Передать лида?</DialogTitle>
                    <DialogDescription>
                      {transferConfirm && linkedLead && (
                        transferConfirm.newManagerId
                          ? (
                              <>
                                Вы уверены, что хотите передать лида{' '}
                                <strong>{linkedLead.name ?? linkedLead.id}</strong> менеджеру{' '}
                                <strong>{transferConfirm.newManagerName}</strong>?
                              </>
                            )
                          : (
                              <>
                                Вы уверены, что хотите снять назначение с лида{' '}
                                <strong>{linkedLead.name ?? linkedLead.id}</strong>?
                              </>
                            )
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setTransferConfirm(null)}>
                      Отмена
                    </Button>
                    <Button
                      onClick={() => {
                        if (!linkedLead || !transferConfirm) return
                        const authorId = currentUser?.id ?? 'lm-1'
                        const authorName = currentUser?.name ?? 'Текущий пользователь'
                        if (transferConfirm.newManagerId) {
                          dispatch({
                            type: 'ASSIGN_LEAD',
                            leadId: linkedLead.id,
                            managerId: transferConfirm.newManagerId,
                          })
                          dispatch({
                            type: 'ADD_LEAD_EVENT',
                            leadId: linkedLead.id,
                            event: {
                              id: `evt-${Date.now()}`,
                              type: 'assign',
                              timestamp: new Date().toISOString(),
                              authorId,
                              authorName,
                              payload: {
                                managerId: transferConfirm.newManagerId,
                                managerName: transferConfirm.newManagerName,
                              },
                            },
                          })
                        } else {
                          dispatch({ type: 'UNASSIGN_LEAD', leadId: linkedLead.id })
                        }
                        setTransferConfirm(null)
                      }}
                    >
                      Подтвердить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px 28px' }}>
              <p style={{ fontSize: 14, color: C.whiteMid, marginBottom: 16, lineHeight: 1.5 }}>
                Лента истории подтягивается из полной карточки лида, если сделка с ним связана.
                У этой сделки нет привязки к лиду — откройте полную карточку в разделе лидов или создайте сделку из неё.
              </p>
              <button
                type="button"
                onClick={() => navigate('/dashboard/leads/poker')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px solid ${C.gold}`,
                  background: 'rgba(201,168,76,0.12)',
                  color: C.gold,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: 24,
                }}
              >
                Открыть полную карточку
              </button>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.whiteLow, marginBottom: 10 }}>
                События по сделке (локально)
              </div>
              {[
                { date: deal.updatedAt, event: `Сделка на этапе: ${STAGE_LABELS[deal.stage]}` },
                { date: deal.createdAt, event: 'Сделка создана' },
              ].map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div style={{ fontSize: 11, color: C.whiteLow, width: 90, flexShrink: 0 }}>{h.date}</div>
                  <div style={{ fontSize: 13, color: C.whiteMid }}>{h.event}</div>
                </div>
              ))}
            </div>
          )
        )}

        {deal.notes && (
          <div style={{ marginTop: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.whiteLow, marginBottom: 6 }}>Заметки</div>
            <div style={{ fontSize: 13, color: C.whiteMid }}>{deal.notes}</div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
