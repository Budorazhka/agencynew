import { useEffect, useMemo, useState, type CSSProperties, type DragEvent, type ReactNode } from 'react'
import { Crown, Eye, EyeOff, Flame, LayoutGrid, List, RefreshCw, RotateCcw, Search, ShieldAlert, X } from 'lucide-react'
import { useLeads } from '@/context/LeadsContext'
import { LEAD_STAGES, LEAD_STAGE_COLUMN } from '@/data/leads-mock'
import type { Lead, LeadManager, LeadSource } from '@/types/leads'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import './leads-secret-table.css'

const SOURCE_LABELS: Record<LeadSource, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
  rent: 'Аренда',
  ad_campaigns: 'Рекламные кампании',
}

const CHANNEL_LABELS: Record<NonNullable<Lead['channel']>, string> = {
  form: 'Форма',
  ad: 'Реклама',
  partner: 'Партнер',
  other: 'Другое',
}

type DeckFilter = 'all' | 'hot' | 'budget_5000' | 'stale_2h'

const DECK_FILTER_OPTIONS: Array<{ value: DeckFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'hot', label: 'Горячие' },
  { value: 'budget_5000', label: 'Комиссия > $5 000' },
  { value: 'stale_2h', label: '2ч+' },
]

const STACK_ORDER = {
  tableBg: 0,
  tableOrnament: 1,
  cards: 2,
  dropHints: 3,
  hud: 4,
  modal: 5,
} as const

const STAGE_NAME_BY_ID = Object.fromEntries(LEAD_STAGES.map((stage) => [stage.id, stage.name]))
const SUCCESS_STAGE_NAMES = LEAD_STAGES
  .filter((stage) => LEAD_STAGE_COLUMN[stage.id] === 'success')
  .map((stage) => stage.name)
const NEW_STAGE_ID = 'new'
const MOBILE_QUERY = '(max-width: 1023px)'
const STALE_LEAD_THRESHOLD_MS = 2 * 60 * 60 * 1000
const VERY_STALE_LEAD_THRESHOLD_MS = 6 * 60 * 60 * 1000
const HOT_BUDGET_USD = 5_000
const HOT_HIGH_BUDGET_USD = 8_000
const HOT_MIN_SCORE = 2

const FINANCE_ROW_HINTS: Record<string, string> = {
  in_progress: 'Лиды в рабочих этапах воронки: от "Новый лид" до "Заключен договор".',
  success: 'Лиды в этапах успеха: "Золотой фонд", "Узнал как дела", "Взять рекомендацию", "Выявление потребности о новых сделках".',
  overdue: 'Лиды с просроченной задачей (task overdue). Требуют срочного внимания.',
  no_task: 'Лиды без активной задачи. Есть риск зависания без следующего шага.',
}

function HoverHint({
  label,
  hint,
  className,
  side = 'top',
}: {
  label: ReactNode
  hint: ReactNode
  className?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}) {
  return (
    <Tooltip delayDuration={120}>
      <TooltipTrigger asChild>
        <span className={cn('secret-help-trigger', className)}>{label}</span>
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={8} className="max-w-[340px] leading-relaxed">
        {hint}
      </TooltipContent>
    </Tooltip>
  )
}

function useMobileLayout() {
  const [isMobile, setIsMobile] = useState(
    () => (typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY).matches : false)
  )

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY)
    const update = (event: MediaQueryListEvent) => setIsMobile(event.matches)

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  return isMobile
}

function managerInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function getLoadTone(value: number, maxValue: number): 'free' | 'warm' | 'hot' {
  const normalized = value / Math.max(maxValue, 1)
  if (normalized < 0.4) return 'free'
  if (normalized < 0.75) return 'warm'
  return 'hot'
}

function formatLeadBudget(lead: Lead): string {
  if (typeof lead.commissionUsd !== 'number') return '—'
  return `$${lead.commissionUsd.toLocaleString('ru-RU')}`
}

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString('ru-RU')}`
}

function normalizePhone(value: string): string {
  return value.replace(/\D+/g, '')
}

function getLeadPhoneValue(lead: Lead): string {
  const dynamicLead = lead as Lead & {
    phone?: string
    phoneNumber?: string
    contactPhone?: string
  }
  return dynamicLead.phone ?? dynamicLead.phoneNumber ?? dynamicLead.contactPhone ?? ''
}

function getLeadChannelLabel(lead: Lead): string {
  return CHANNEL_LABELS[lead.channel ?? 'other']
}

function getLeadAgeMs(lead: Lead, nowTs: number): number | null {
  const createdAtMs = Date.parse(lead.createdAt)
  if (Number.isNaN(createdAtMs)) return null
  return Math.max(0, nowTs - createdAtMs)
}

function isLeadStale(lead: Lead, nowTs: number): boolean {
  const ageMs = getLeadAgeMs(lead, nowTs)
  return ageMs !== null && ageMs >= STALE_LEAD_THRESHOLD_MS
}

function getLeadHotScore(lead: Lead, nowTs: number): number {
  const ageMs = getLeadAgeMs(lead, nowTs)
  const budget = lead.commissionUsd ?? 0
  let score = 0

  if (budget >= HOT_HIGH_BUDGET_USD) score += 2
  else if (budget >= HOT_BUDGET_USD) score += 1

  if (lead.taskOverdue) score += 2

  if (ageMs !== null && ageMs >= VERY_STALE_LEAD_THRESHOLD_MS) score += 2
  else if (ageMs !== null && ageMs >= STALE_LEAD_THRESHOLD_MS) score += 1

  return score
}

function isHotLead(lead: Lead, nowTs: number): boolean {
  return getLeadHotScore(lead, nowTs) >= HOT_MIN_SCORE
}

function isProblemLead(lead: Lead, nowTs: number): boolean {
  if (lead.taskOverdue) return true
  if (LEAD_STAGE_COLUMN[lead.stageId] !== 'in_progress') return false
  if (lead.hasTask === false) return true
  return isLeadStale(lead, nowTs)
}

function getSeatStyle(index: number, total: number): CSSProperties {
  if (total <= 1) {
    return { left: '50%', top: '16%' }
  }

  const startDeg = -150
  const spreadDeg = 300
  const angleDeg = startDeg + (spreadDeg * index) / (total - 1)
  const angle = (angleDeg * Math.PI) / 180

  const x = 50 + 42 * Math.cos(angle)
  const y = 50 + 35 * Math.sin(angle)

  return {
    left: `${x}%`,
    top: `${y}%`,
  }
}

interface LeadsSecretDistributionDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
}

interface SessionMove {
  leadId: string
  prevManagerId: string | null
  nextManagerId: string
}

interface FinanceRow {
  key: string
  label: string
  leads: number
  budgetUsd: number
}

type ViewMode = 'table' | 'list'

export function LeadsSecretDistributionDialog({
  open,
  onOpenChange,
}: LeadsSecretDistributionDialogProps) {
  const { state, dispatch } = useLeads()
  const { leadPool, leadManagers } = state
  const isMobile = useMobileLayout()

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [preferredDeckLeadId, setPreferredDeckLeadId] = useState<string | null>(null)
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null)
  const [hoveredManagerId, setHoveredManagerId] = useState<string | null>(null)
  const [blockedManagerId, setBlockedManagerId] = useState<string | null>(null)
  const [dropSuccessManagerId, setDropSuccessManagerId] = useState<string | null>(null)
  const [sessionTouchedLeadIds, setSessionTouchedLeadIds] = useState<string[]>([])
  const [sessionMoves, setSessionMoves] = useState<SessionMove[]>([])
  const [showAllCards, setShowAllCards] = useState(false)
  const [deckFilter, setDeckFilter] = useState<DeckFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [nowTs, setNowTs] = useState(() => Date.now())
  const [drawerManagerId, setDrawerManagerId] = useState<string | null>(null)

  useEffect(() => {
    const timerId = window.setInterval(() => setNowTs(Date.now()), 60_000)
    return () => window.clearInterval(timerId)
  }, [])

  const allUnassignedNewLeads = useMemo(
    () => leadPool.filter((lead) => !lead.managerId && lead.stageId === NEW_STAGE_ID),
    [leadPool]
  )

  const unassignedNewLeads = useMemo(() => {
    if (deckFilter === 'all') return allUnassignedNewLeads
    if (deckFilter === 'hot') {
      return allUnassignedNewLeads.filter((lead) => isHotLead(lead, nowTs))
    }
    if (deckFilter === 'budget_5000') {
      return allUnassignedNewLeads.filter((lead) => (lead.commissionUsd ?? 0) > 5000)
    }
    return allUnassignedNewLeads.filter((lead) => isLeadStale(lead, nowTs))
  }, [allUnassignedNewLeads, deckFilter, nowTs])

  const hotLeadsCount = useMemo(
    () => allUnassignedNewLeads.filter((lead) => isHotLead(lead, nowTs)).length,
    [allUnassignedNewLeads, nowTs]
  )

  const allUnassignedLeadById = useMemo(() => {
    const map: Record<string, Lead> = {}
    allUnassignedNewLeads.forEach((lead) => {
      map[lead.id] = lead
    })
    return map
  }, [allUnassignedNewLeads])

  const trimmedSearch = searchQuery.trim()
  const normalizedSearch = trimmedSearch.toLowerCase()
  const normalizedSearchPhone = normalizePhone(trimmedSearch)

  const searchResults = useMemo(() => {
    if (!trimmedSearch) return []
    return allUnassignedNewLeads
      .filter((lead) => {
        const idMatch = lead.id.toLowerCase().includes(normalizedSearch)
        const nameMatch = (lead.name ?? '').toLowerCase().includes(normalizedSearch)
        const phoneValue = getLeadPhoneValue(lead)
        const phoneMatch =
          normalizedSearchPhone.length >= 3 &&
          normalizePhone(phoneValue).includes(normalizedSearchPhone)
        return idMatch || nameMatch || phoneMatch
      })
      .slice(0, 8)
  }, [allUnassignedNewLeads, normalizedSearch, normalizedSearchPhone, trimmedSearch])

  const managerById = useMemo(() => {
    const map: Record<string, LeadManager> = {}
    leadManagers.forEach((manager) => {
      map[manager.id] = manager
    })
    return map
  }, [leadManagers])

  const drawerManager = drawerManagerId ? managerById[drawerManagerId] ?? null : null

  const drawerLeads = useMemo(
    () => (drawerManagerId ? leadPool.filter((lead) => lead.managerId === drawerManagerId) : []),
    [drawerManagerId, leadPool]
  )

  const drawerOverdueLeadIds = useMemo(
    () => drawerLeads.filter((lead) => lead.taskOverdue).map((lead) => lead.id),
    [drawerLeads]
  )

  const drawerStageRows = useMemo(
    () =>
      LEAD_STAGES.map((stage) => ({
        stageId: stage.id,
        stageName: stage.name,
        count: drawerLeads.filter((lead) => lead.stageId === stage.id).length,
      })).filter((row) => row.count > 0),
    [drawerLeads]
  )

  const drawerFinanceRows = useMemo<FinanceRow[]>(() => {
    const inProgress = drawerLeads.filter((lead) => LEAD_STAGE_COLUMN[lead.stageId] === 'in_progress')
    const success = drawerLeads.filter((lead) => LEAD_STAGE_COLUMN[lead.stageId] === 'success')
    const overdue = drawerLeads.filter((lead) => Boolean(lead.taskOverdue))
    const noTask = drawerLeads.filter((lead) => lead.hasTask === false)

    const sumBudget = (leads: Lead[]) => leads.reduce((sum, lead) => sum + (lead.commissionUsd ?? 0), 0)

    return [
      { key: 'in_progress', label: 'В работе', leads: inProgress.length, budgetUsd: sumBudget(inProgress) },
      { key: 'success', label: 'Успех', leads: success.length, budgetUsd: sumBudget(success) },
      { key: 'overdue', label: 'Просроченные', leads: overdue.length, budgetUsd: sumBudget(overdue) },
      { key: 'no_task', label: 'Без задач', leads: noTask.length, budgetUsd: sumBudget(noTask) },
    ]
  }, [drawerLeads])

  const activeDeckLead =
    preferredDeckLeadId && allUnassignedLeadById[preferredDeckLeadId]
      ? allUnassignedLeadById[preferredDeckLeadId]
      : unassignedNewLeads[0] ?? null

  const hiddenDeckCount = Math.max(unassignedNewLeads.length - (activeDeckLead ? 1 : 0), 0)
  const visibleDeckLayerCount = Math.min(hiddenDeckCount, 5)
  const deckLayerStyles = useMemo<CSSProperties[]>(
    () =>
      Array.from({ length: visibleDeckLayerCount }, (_, index) => {
        const step = index + 1
        return {
          '--deck-layer-x': `${-(isMobile ? 11 : 15) * step}px`,
          '--deck-layer-y': `${(isMobile ? 1 : 2) * step}px`,
          '--deck-layer-opacity': `${Math.max(0.34, 0.9 - index * 0.11)}`,
          zIndex: Math.max(1, 9 - step),
        } as CSSProperties
      }),
    [isMobile, visibleDeckLayerCount]
  )

  const selectedLead =
    selectedLeadId && allUnassignedLeadById[selectedLeadId]
      ? allUnassignedLeadById[selectedLeadId]
      : activeDeckLead

  const draggedLead =
    draggedLeadId && allUnassignedLeadById[draggedLeadId]
      ? allUnassignedLeadById[draggedLeadId]
      : draggedLeadId && activeDeckLead?.id === draggedLeadId
        ? activeDeckLead
        : null

  const touchedLeadSet = useMemo(() => new Set(sessionTouchedLeadIds), [sessionTouchedLeadIds])
  const activeDeckFilterLabel = useMemo(
    () => DECK_FILTER_OPTIONS.find((option) => option.value === deckFilter)?.label ?? 'Все',
    [deckFilter]
  )

  const managerLoad = useMemo(() => {
    const map: Record<string, number> = {}
    leadManagers.forEach((manager) => {
      map[manager.id] = 0
    })
    leadPool.forEach((lead) => {
      if (lead.managerId && map[lead.managerId] !== undefined) {
        map[lead.managerId] += 1
      }
    })
    return map
  }, [leadManagers, leadPool])

  const managerInProgressLoad = useMemo(() => {
    const map: Record<string, number> = {}
    leadManagers.forEach((manager) => {
      map[manager.id] = 0
    })
    leadPool.forEach((lead) => {
      if (
        lead.managerId &&
        map[lead.managerId] !== undefined &&
        LEAD_STAGE_COLUMN[lead.stageId] === 'in_progress'
      ) {
        map[lead.managerId] += 1
      }
    })
    return map
  }, [leadManagers, leadPool])

  const managerProblemLoad = useMemo(() => {
    const map: Record<string, number> = {}
    leadManagers.forEach((manager) => {
      map[manager.id] = 0
    })
    leadPool.forEach((lead) => {
      if (lead.managerId && map[lead.managerId] !== undefined && isProblemLead(lead, nowTs)) {
        map[lead.managerId] += 1
      }
    })
    return map
  }, [leadManagers, leadPool, nowTs])

  const sessionAssignedByManager = useMemo(() => {
    const map: Record<string, number> = {}
    leadManagers.forEach((manager) => {
      map[manager.id] = 0
    })
    leadPool.forEach((lead) => {
      if (lead.managerId && touchedLeadSet.has(lead.id) && map[lead.managerId] !== undefined) {
        map[lead.managerId] += 1
      }
    })
    return map
  }, [leadManagers, leadPool, touchedLeadSet])

  const maxManagerInProgress = useMemo(() => {
    if (leadManagers.length === 0) return 1
    return Math.max(...leadManagers.map((manager) => managerInProgressLoad[manager.id] ?? 0), 1)
  }, [leadManagers, managerInProgressLoad])

  const resetTransientState = () => {
    setSelectedLeadId(null)
    setPreferredDeckLeadId(null)
    setDraggedLeadId(null)
    setHoveredManagerId(null)
    setBlockedManagerId(null)
    setDropSuccessManagerId(null)
  }

  const clearSessionOnClose = () => {
    resetTransientState()
    setShowAllCards(false)
    setDeckFilter('all')
    setViewMode('table')
    setSearchQuery('')
    setDrawerManagerId(null)
    setSessionTouchedLeadIds([])
    setSessionMoves([])
  }

  const pulseDropSuccess = (managerId: string) => {
    setDropSuccessManagerId(managerId)
    window.setTimeout(() => {
      setDropSuccessManagerId((current) => (current === managerId ? null : current))
    }, 420)
  }

  const assignLeadToManager = (lead: Lead, managerId: string) => {
    const manager = managerById[managerId]
    if (!manager || !manager.sourceTypes.includes(lead.source)) return false

    const prevManagerId = lead.managerId ?? null
    dispatch({ type: 'ASSIGN_LEAD', leadId: lead.id, managerId })
    setSessionMoves((prev) => [...prev, { leadId: lead.id, prevManagerId, nextManagerId: managerId }])
    setSessionTouchedLeadIds((prev) => (prev.includes(lead.id) ? prev : [...prev, lead.id]))

    if (selectedLeadId === lead.id) setSelectedLeadId(null)
    if (preferredDeckLeadId === lead.id) setPreferredDeckLeadId(null)
    if (draggedLeadId === lead.id) setDraggedLeadId(null)

    pulseDropSuccess(managerId)
    return true
  }

  const resetSession = () => {
    sessionTouchedLeadIds.forEach((leadId) => {
      dispatch({ type: 'UNASSIGN_LEAD', leadId })
    })
    setSessionTouchedLeadIds([])
    setSessionMoves([])
    resetTransientState()
  }

  const undoLastMove = () => {
    const lastMove = sessionMoves[sessionMoves.length - 1]
    if (!lastMove) return

    if (lastMove.prevManagerId) {
      dispatch({ type: 'ASSIGN_LEAD', leadId: lastMove.leadId, managerId: lastMove.prevManagerId })
    } else {
      dispatch({ type: 'UNASSIGN_LEAD', leadId: lastMove.leadId })
    }

    const nextMoves = sessionMoves.slice(0, -1)
    setSessionMoves(nextMoves)
    setSessionTouchedLeadIds(Array.from(new Set(nextMoves.map((move) => move.leadId))))
    setPreferredDeckLeadId(lastMove.leadId)
    setSelectedLeadId(lastMove.leadId)
    setDraggedLeadId(null)
    setHoveredManagerId(null)
    setBlockedManagerId(null)
  }

  const reclaimOverdueLeadsFromDrawerManager = () => {
    if (!drawerManagerId || drawerOverdueLeadIds.length === 0) return
    const overdueLeadIds = drawerOverdueLeadIds

    overdueLeadIds.forEach((leadId) => {
      dispatch({ type: 'UNASSIGN_LEAD', leadId })
    })

    const overdueSet = new Set(overdueLeadIds)
    setSessionMoves((prev) => prev.filter((move) => !overdueSet.has(move.leadId)))
    setSessionTouchedLeadIds((prev) => prev.filter((leadId) => !overdueSet.has(leadId)))
    setPreferredDeckLeadId(overdueLeadIds[0])
    setSelectedLeadId(overdueLeadIds[0])
  }

  const focusLeadFromQueue = (leadId: string) => {
    if (!allUnassignedLeadById[leadId]) return
    setDeckFilter('all')
    setPreferredDeckLeadId(leadId)
    setSelectedLeadId(leadId)
    setShowAllCards(true)
    setViewMode('table')
    setSearchQuery('')
  }

  const handleDeckDragStart = (event: DragEvent<HTMLButtonElement>) => {
    if (!activeDeckLead || isMobile) {
      event.preventDefault()
      return
    }
    setDraggedLeadId(activeDeckLead.id)
    setSelectedLeadId(activeDeckLead.id)
    setBlockedManagerId(null)
    setHoveredManagerId(null)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', activeDeckLead.id)
  }

  const handleDeckDragEnd = () => {
    setDraggedLeadId(null)
    setHoveredManagerId(null)
    setBlockedManagerId(null)
  }

  const handleManagerDragOver = (event: DragEvent<HTMLElement>, manager: LeadManager) => {
    const leadId = draggedLeadId || event.dataTransfer.getData('text/plain')
    const lead =
      allUnassignedLeadById[leadId] ??
      (activeDeckLead && activeDeckLead.id === leadId ? activeDeckLead : null)
    if (!lead) return

    if (!manager.sourceTypes.includes(lead.source)) {
      event.dataTransfer.dropEffect = 'none'
      setHoveredManagerId(null)
      setBlockedManagerId(manager.id)
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setHoveredManagerId(manager.id)
    setBlockedManagerId(null)
  }

  const handleManagerDragLeave = (managerId: string) => {
    if (hoveredManagerId === managerId) setHoveredManagerId(null)
    if (blockedManagerId === managerId) setBlockedManagerId(null)
  }

  const handleManagerDrop = (event: DragEvent<HTMLElement>, manager: LeadManager) => {
    event.preventDefault()
    const leadId = draggedLeadId || event.dataTransfer.getData('text/plain')
    const lead =
      allUnassignedLeadById[leadId] ??
      (activeDeckLead && activeDeckLead.id === leadId ? activeDeckLead : null)

    if (!lead) {
      setDraggedLeadId(null)
      setHoveredManagerId(null)
      setBlockedManagerId(null)
      return
    }

    if (!manager.sourceTypes.includes(lead.source)) {
      setBlockedManagerId(manager.id)
      return
    }

    assignLeadToManager(lead, manager.id)
    setDraggedLeadId(null)
    setHoveredManagerId(null)
    setBlockedManagerId(null)
  }

  const selectedLeadStage = selectedLead
    ? STAGE_NAME_BY_ID[selectedLead.stageId] ?? selectedLead.stageId
    : '—'

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) clearSessionOnClose()
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="secret-table-dialog !fixed !inset-0 !top-0 !left-0 !m-0 !h-screen !w-screen !max-w-none !translate-x-0 !translate-y-0 !rounded-none !border-0 !p-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Режим руководителя: управление потоком заявок</DialogTitle>
          <DialogDescription>
            Маршрутизация лидов: назначение заявок менеджерам по очередям и нагрузке.
          </DialogDescription>
        </DialogHeader>

        <div className="secret-table-root">
          <div className="secret-table-bg" style={{ zIndex: STACK_ORDER.tableBg }} />
          <div className="secret-table-ornament" style={{ zIndex: STACK_ORDER.tableOrnament }} />

          <div className="secret-table-shell" style={{ zIndex: STACK_ORDER.hud }}>
            <header className="secret-table-hud">
              <div className="secret-title">
                <span className="secret-title-icon">
                  <Crown className="size-4" />
                </span>
                <div>
                  <p className="secret-kicker">Режим руководителя</p>
                  <h2 className="secret-heading">Управление потоком заявок</h2>
                </div>
              </div>
              <div className="secret-hud-controls">
                <div className="secret-search-box">
                  <Search className="secret-search-icon size-4" />
                  <input
                    type="text"
                    className="secret-search-input"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Поиск по ID или телефону"
                  />
                  {trimmedSearch && (
                    <div className="secret-search-results">
                      {searchResults.length === 0 ? (
                        <p className="secret-search-empty">По запросу ничего не найдено.</p>
                      ) : (
                        searchResults.map((lead) => {
                          const leadPhone = getLeadPhoneValue(lead)
                          return (
                            <button
                              key={`search-${lead.id}`}
                              type="button"
                              className="secret-search-row"
                              onClick={() => focusLeadFromQueue(lead.id)}
                            >
                              <span>{lead.name ?? lead.id}</span>
                              <span className="secret-search-row-sub">
                                {lead.id}
                                {leadPhone ? ` · ${leadPhone}` : ''}
                              </span>
                            </button>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
                {!isMobile && (
                  <div className="secret-view-toggle">
                    <button
                      type="button"
                      className={cn('secret-view-btn', viewMode === 'table' && 'is-active')}
                      onClick={() => setViewMode('table')}
                    >
                      <LayoutGrid className="size-3.5" />
                      Стол
                    </button>
                    <button
                      type="button"
                      className={cn('secret-view-btn', viewMode === 'list' && 'is-active')}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="size-3.5" />
                      Список
                    </button>
                  </div>
                )}
              </div>
              <div className="secret-hud-meta">
                <HoverHint
                  className="secret-hud-metric"
                  label={
                    <>
                      <span className="secret-hud-dot is-queue" />
                      В очереди: {unassignedNewLeads.length}
                      {deckFilter !== 'all' ? ` / ${allUnassignedNewLeads.length}` : ''}
                    </>
                  }
                  hint="Первое число: лиды после текущего фильтра. Число после '/' — полный пул новых неназначенных лидов."
                />
                <HoverHint
                  className="secret-hud-metric"
                  label={
                    <>
                      <span className="secret-hud-dot is-hot" />
                      Горячие: {hotLeadsCount}
                    </>
                  }
                  hint={
                    <span className="block space-y-2">
                      <strong>Горячие лиды (score ≥ 2)</strong> — считаются по скору:
                      <ul className="list-disc pl-4 space-y-1 mt-1">
                        <li>Комиссия от $5 000 по сделке</li>
                        <li>2ч+ без разбора (лид давно в очереди)</li>
                        <li>Просрочка по задаче</li>
                      </ul>
                      Чем выше скор, тем приоритетнее лид для раздачи.
                    </span>
                  }
                />
                <HoverHint
                  className="secret-hud-metric"
                  label={
                    <>
                      <span className="secret-hud-dot is-filter" />
                      Фильтр: {activeDeckFilterLabel}
                    </>
                  }
                  hint="Текущий фильтр колоды. Меняет видимый список, но не удаляет лиды из общего пула."
                />
                <HoverHint
                  className="secret-hud-metric"
                  label={
                    <>
                      <span className="secret-hud-dot is-session" />
                      Назначено: {sessionTouchedLeadIds.length}
                    </>
                  }
                  hint="Сколько лидов назначено в текущем открытии стола. Эти же лиды затронет кнопка 'Сброс'."
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="secret-close-btn"
                onClick={() => {
                  clearSessionOnClose()
                  onOpenChange(false)
                }}
              >
                <X className="size-3.5" />
                Закрыть
              </Button>
            </header>

            {isMobile ? (
              <section className="secret-mobile-layout">
                <div className="secret-mobile-board">
                  <div className="secret-mobile-deck">
                    <div className="secret-deck-stack secret-deck-stack-mobile">
                      {deckLayerStyles.map((style, index) => (
                        <span
                          key={`mobile-deck-layer-${index}`}
                          className="secret-deck-layer"
                          style={style}
                        />
                      ))}
                      {activeDeckLead ? (
                        <button
                          type="button"
                          className={cn(
                            'secret-top-card is-open',
                            draggedLeadId === activeDeckLead.id && 'is-dragging',
                            isLeadStale(activeDeckLead, nowTs) && 'is-stale'
                          )}
                          onClick={() => setSelectedLeadId(activeDeckLead.id)}
                        >
                          <span className="secret-card-face secret-card-back">
                            <span className="secret-card-mark">LEAD POOL</span>
                            <span className="secret-card-suit">♠</span>
                            <span className="secret-card-count">{unassignedNewLeads.length}</span>
                          </span>
                          <span className="secret-card-face secret-card-front">
                            <span className="secret-card-front-id">{activeDeckLead.id}</span>
                            {isLeadStale(activeDeckLead, nowTs) && (
                              <span className="secret-card-stale-badge">
                                <Flame className="size-3" />
                                2ч+
                              </span>
                            )}
                            <span className="secret-card-front-name">{activeDeckLead.name ?? activeDeckLead.id}</span>
                            <div className="secret-card-front-facts">
                              <span>
                                <strong>Комиссия</strong>
                                {formatLeadBudget(activeDeckLead)}
                              </span>
                              <span>
                                <strong>Тип</strong>
                                {SOURCE_LABELS[activeDeckLead.source]}
                              </span>
                              <span>
                                <strong>Источник</strong>
                                {getLeadChannelLabel(activeDeckLead)}
                              </span>
                            </div>
                            <span className="secret-card-front-stage">Статус: {selectedLeadStage}</span>
                          </span>
                        </button>
                      ) : (
                        <div className="secret-top-card is-empty">
                          <span>Колода пуста</span>
                        </div>
                      )}
                    </div>
                    <p className="secret-deck-caption">Статус: Новый лид</p>
                    <div className="secret-deck-remaining-badge">
                      В очереди: {unassignedNewLeads.length}
                      {deckFilter !== 'all' ? ` / ${allUnassignedNewLeads.length}` : ''}
                    </div>
                    <div className="secret-deck-filters">
                      {DECK_FILTER_OPTIONS.map((option) => (
                        <button
                          key={`mobile-filter-${option.value}`}
                          type="button"
                          className={cn('secret-filter-chip', deckFilter === option.value && 'is-active')}
                          onClick={() => setDeckFilter(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div className="secret-mobile-actions">
                      <Button
                        type="button"
                        variant="outline"
                        className="secret-reveal-btn"
                        onClick={() => setShowAllCards((prev) => !prev)}
                      >
                        {showAllCards ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        {showAllCards ? 'Скрыть пул' : 'Пул лидов'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="secret-undo-btn"
                        disabled={sessionMoves.length === 0}
                        onClick={undoLastMove}
                      >
                        <RotateCcw className="size-4" />
                        Отменить
                      </Button>
                      <Button
                        type="button"
                        className="secret-reset-center"
                        disabled={sessionTouchedLeadIds.length === 0}
                        onClick={resetSession}
                      >
                        <RefreshCw className="size-4" />
                        Сброс
                      </Button>
                    </div>
                  </div>

                  {showAllCards && (
                    <div className="secret-mobile-all-list">
                      {unassignedNewLeads.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          className={cn(
                            'secret-all-list-item',
                            activeDeckLead?.id === lead.id && 'is-active'
                          )}
                          onClick={() => focusLeadFromQueue(lead.id)}
                        >
                          <span>{lead.name ?? lead.id}</span>
                          <span className="secret-all-list-side">
                            {isLeadStale(lead, nowTs) && (
                              <span className="secret-mini-chip is-stale">
                                <Flame className="size-3" />
                                2ч+
                              </span>
                            )}
                            {isHotLead(lead, nowTs) && (
                              <span className="secret-mini-chip is-hot">HOT</span>
                            )}
                            <span className="secret-all-list-meta">{SOURCE_LABELS[lead.source]}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="secret-mobile-managers">
                  {leadManagers.map((manager) => {
                    const canAssignSelected = selectedLead
                      ? manager.sourceTypes.includes(selectedLead.source)
                      : false
                    return (
                      <article key={manager.id} className="secret-mobile-manager">
                        <div className="secret-mobile-manager-head">
                          <span className="secret-seat-avatar">{managerInitials(manager.name) || 'M'}</span>
                          <div>
                            <p className="secret-seat-name">{manager.name}</p>
                            <p
                              className="secret-mobile-manager-metrics"
                              title='Проблемные: просрочка, нет задачи или лид "залежался". Всего: общий объем у менеджера.'
                            >
                              Проблемных: {managerProblemLoad[manager.id] ?? 0} · Всего: {managerLoad[manager.id] ?? 0}
                            </p>
                          </div>
                        </div>
                        <div className="secret-manager-sources">
                          {manager.sourceTypes.map((source) => (
                            <span key={`${manager.id}-${source}`} className="secret-source-chip">
                              {SOURCE_LABELS[source]}
                            </span>
                          ))}
                        </div>
                        <div className="secret-manager-actions">
                          <Button
                            type="button"
                            size="sm"
                            className="secret-assign-btn"
                            disabled={!selectedLead || !canAssignSelected}
                            onClick={() => {
                              if (selectedLead) assignLeadToManager(selectedLead, manager.id)
                            }}
                          >
                            Назначить в руку
                          </Button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ) : (
              <section className="secret-main-layout">
                {viewMode === 'table' ? (
                  <div className="secret-board-felt">
                  <div className="secret-seats-ring" style={{ zIndex: STACK_ORDER.dropHints }}>
                    {leadManagers.map((manager, index) => {
                      const style = getSeatStyle(index, leadManagers.length)
                      const hasDragged = Boolean(draggedLead)
                      const canAcceptDragged = draggedLead
                        ? manager.sourceTypes.includes(draggedLead.source)
                        : false
                      const managerInWork = managerInProgressLoad[manager.id] ?? 0
                      const managerProblem = managerProblemLoad[manager.id] ?? 0
                      const managerTotal = managerLoad[manager.id] ?? 0
                      const managerLoadTone = getLoadTone(managerInWork, maxManagerInProgress)
                      const managerLoadPercent = Math.max(
                        Math.round((managerInWork / Math.max(maxManagerInProgress, 1)) * 100),
                        managerInWork > 0 ? 12 : 6
                      )
                      return (
                        <article
                          key={manager.id}
                          className={cn(
                            'secret-seat',
                            drawerManagerId === manager.id && 'is-selected',
                            hasDragged && canAcceptDragged && 'is-ready',
                            hoveredManagerId === manager.id && 'is-hovered',
                            hasDragged && !canAcceptDragged && 'is-dimmed',
                            blockedManagerId === manager.id && 'is-blocked',
                            blockedManagerId === manager.id && 'is-blocked-pulse',
                            dropSuccessManagerId === manager.id && 'is-drop-success'
                          )}
                          style={style}
                          title={`Проблемные: ${managerProblem} (просрочка/без задачи/залежался) · Всего у менеджера: ${managerTotal}`}
                          role="button"
                          tabIndex={0}
                          onMouseEnter={() => setHoveredManagerId(manager.id)}
                          onMouseLeave={() => {
                            if (!draggedLead) setHoveredManagerId(null)
                          }}
                          onClick={() => {
                            if (!draggedLead) setDrawerManagerId(manager.id)
                          }}
                          onKeyDown={(event) => {
                            if ((event.key === 'Enter' || event.key === ' ') && !draggedLead) {
                              event.preventDefault()
                              setDrawerManagerId(manager.id)
                            }
                          }}
                          onDragOver={(event) => handleManagerDragOver(event, manager)}
                          onDragLeave={() => handleManagerDragLeave(manager.id)}
                          onDrop={(event) => handleManagerDrop(event, manager)}
                        >
                          <div className="secret-seat-head">
                            <span className="secret-seat-avatar">{managerInitials(manager.name) || 'M'}</span>
                            <div className="secret-seat-head-meta">
                              <p className="secret-seat-name">{manager.name}</p>
                              <div className="secret-seat-load">
                                <span
                                  className={cn('secret-seat-load-value', `is-${managerLoadTone}`)}
                                  title='Лиды в рабочих этапах воронки ("Новый лид" и далее до "Заключен договор").'
                                >
                                  В работе: {managerInWork}
                                </span>
                                <span className="secret-seat-load-bar">
                                  <span
                                    className={cn('secret-seat-load-fill', `is-${managerLoadTone}`)}
                                    style={{ width: `${Math.min(100, managerLoadPercent)}%` }}
                                  />
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className="secret-seat-hand-zone"
                          >
                            <span className="secret-seat-hand-label">РУКА</span>
                            <span className="secret-seat-hand-hint">
                              {draggedLead
                                ? canAcceptDragged
                                  ? 'Отпустите карту'
                                  : 'Нельзя по очереди'
                                : `Сеанс: ${sessionAssignedByManager[manager.id] ?? 0}`}
                            </span>
                          </div>

                          <div
                            className="secret-seat-metrics"
                            title='Проблемные: просрочка, нет задачи или лид старше порога. Всего: все лиды менеджера.'
                          >
                            Проблемных: {managerProblem} · Всего: {managerTotal}
                          </div>
                        </article>
                      )
                    })}
                  </div>

                  <div className="secret-felt-lead-summary" style={{ zIndex: STACK_ORDER.cards }}>
                    <div className="secret-felt-summary-inner">
                      <p className="secret-felt-summary-title">Сводка</p>
                      {selectedLead ? (
                        <div className="secret-felt-summary-body">
                          <p className="secret-felt-summary-name">{selectedLead.name ?? selectedLead.id}</p>
                          <p className="secret-felt-summary-sub">
                            {SOURCE_LABELS[selectedLead.source]} · {selectedLeadStage}
                          </p>
                          <p className="secret-felt-summary-sub">
                            Комиссия: {formatLeadBudget(selectedLead)} · {getLeadChannelLabel(selectedLead)}
                          </p>
                          <p className="secret-felt-summary-sub">ID: {selectedLead.id}</p>
                        </div>
                      ) : (
                        <p className="secret-felt-summary-empty">Выберите заявку из пула в центре.</p>
                      )}
                      <div className="secret-felt-summary-actions">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="secret-felt-undo-btn"
                          disabled={sessionMoves.length === 0}
                          onClick={undoLastMove}
                        >
                          <RotateCcw className="size-3.5" />
                          Отменить
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="secret-felt-reset-btn"
                          disabled={sessionTouchedLeadIds.length === 0}
                          onClick={resetSession}
                        >
                          <RefreshCw className="size-3.5" />
                          Сброс
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="secret-deck-pit" style={{ zIndex: STACK_ORDER.cards }}>
                    <div className="secret-deck-stack">
                      {deckLayerStyles.map((style, index) => (
                        <span
                          key={`desktop-deck-layer-${index}`}
                          className="secret-deck-layer"
                          style={style}
                        />
                      ))}
                      {activeDeckLead ? (
                        <button
                          type="button"
                          draggable
                          onDragStart={handleDeckDragStart}
                          onDragEnd={handleDeckDragEnd}
                          className={cn(
                            'secret-top-card is-open',
                            draggedLeadId === activeDeckLead.id && 'is-dragging',
                            isLeadStale(activeDeckLead, nowTs) && 'is-stale'
                          )}
                          onClick={() => setSelectedLeadId(activeDeckLead.id)}
                        >
                          <span className="secret-card-face secret-card-back">
                            <span className="secret-card-mark">LEAD POOL</span>
                            <span className="secret-card-suit">♠</span>
                            <span className="secret-card-count">{unassignedNewLeads.length}</span>
                          </span>
                          <span className="secret-card-face secret-card-front">
                            <span className="secret-card-front-id">{activeDeckLead.id}</span>
                            {isLeadStale(activeDeckLead, nowTs) && (
                              <span className="secret-card-stale-badge">
                                <Flame className="size-3" />
                                2ч+
                              </span>
                            )}
                            <span className="secret-card-front-name">{activeDeckLead.name ?? activeDeckLead.id}</span>
                            <div className="secret-card-front-facts">
                              <span>
                                <strong>Комиссия</strong>
                                {formatLeadBudget(activeDeckLead)}
                              </span>
                              <span>
                                <strong>Тип</strong>
                                {SOURCE_LABELS[activeDeckLead.source]}
                              </span>
                              <span>
                                <strong>Источник</strong>
                                {getLeadChannelLabel(activeDeckLead)}
                              </span>
                            </div>
                            <span className="secret-card-front-stage">
                              Статус: {STAGE_NAME_BY_ID[activeDeckLead.stageId] ?? activeDeckLead.stageId}
                            </span>
                          </span>
                        </button>
                      ) : (
                        <div className="secret-top-card is-empty">
                          <span>Новых лидов нет</span>
                        </div>
                      )}
                    </div>
                    <p className="secret-deck-caption">
                      Центральный пул · только «Новый лид»
                    </p>
                    <div className="secret-deck-remaining-badge">
                      В очереди: {unassignedNewLeads.length}
                      {deckFilter !== 'all' ? ` / ${allUnassignedNewLeads.length}` : ''}
                    </div>
                    <div className="secret-deck-filters">
                      {DECK_FILTER_OPTIONS.map((option) => (
                        <button
                          key={`desktop-filter-${option.value}`}
                          type="button"
                          className={cn('secret-filter-chip', deckFilter === option.value && 'is-active')}
                          onClick={() => setDeckFilter(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div className="secret-deck-actions">
                      <Button
                        type="button"
                        variant="outline"
                        className="secret-reveal-btn secret-reveal-btn-deck"
                        onClick={() => setShowAllCards((prev) => !prev)}
                      >
                        {showAllCards ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        {showAllCards ? 'Скрыть пул' : 'Пул лидов'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="secret-undo-btn"
                        disabled={sessionMoves.length === 0}
                        onClick={undoLastMove}
                      >
                        <RotateCcw className="size-4" />
                        Отменить ход
                      </Button>
                    </div>
                  </div>

                  </div>
                ) : (
                  <div className="secret-list-view">
                    <div className="secret-list-head">
                      <p className="secret-list-title">Пул лидов</p>
                      <span className="secret-list-count">
                        В очереди: {unassignedNewLeads.length}
                        {deckFilter !== 'all' ? ` / ${allUnassignedNewLeads.length}` : ''}
                      </span>
                    </div>
                    <div className="secret-list-table-wrap">
                      <table className="secret-list-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Клиент</th>
                            <th>Телефон</th>
                            <th>Тип</th>
                            <th>Комиссия</th>
                            <th>Метки</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {unassignedNewLeads.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="secret-list-empty">
                                По текущему фильтру заявок нет.
                              </td>
                            </tr>
                          ) : (
                            unassignedNewLeads.map((lead) => {
                              const leadPhone = getLeadPhoneValue(lead)
                              return (
                                <tr key={`list-${lead.id}`} className={cn(activeDeckLead?.id === lead.id && 'is-active')}>
                                  <td>{lead.id}</td>
                                  <td>{lead.name ?? lead.id}</td>
                                  <td>{leadPhone || '—'}</td>
                                  <td>{SOURCE_LABELS[lead.source]}</td>
                                  <td>{formatLeadBudget(lead)}</td>
                                  <td>
                                    <span className="secret-all-list-side">
                                      {isLeadStale(lead, nowTs) && (
                                        <span className="secret-mini-chip is-stale">
                                          <Flame className="size-3" />
                                          2ч+
                                        </span>
                                      )}
                                      {isHotLead(lead, nowTs) && (
                                        <span className="secret-mini-chip is-hot">HOT</span>
                                      )}
                                    </span>
                                  </td>
                                  <td>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="secret-list-focus-btn"
                                      onClick={() => focusLeadFromQueue(lead.id)}
                                    >
                                      В фокус
                                    </Button>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <aside className="secret-side-panel" style={{ zIndex: STACK_ORDER.modal }}>
                  <div className="secret-side-card">
                    <p className="secret-side-title">Правила</p>
                    <div className="secret-rule-line">
                      <Flame className="size-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Горячие (score ≥ {HOT_MIN_SCORE})</p>
                        <p className="text-sm opacity-90">
                          Комиссия от $${HOT_BUDGET_USD.toLocaleString('ru-RU')}, 2ч+ без разбора, просрочка по задаче. Чем выше скор, тем приоритетнее лид.
                        </p>
                      </div>
                    </div>
                    <p className="secret-rule-line">
                      <ShieldAlert className="size-4" />
                      В очереди только лиды со статусом «Новый лид».
                    </p>
                    <p className="secret-rule-line">
                      <ShieldAlert className="size-4" />
                      Назначение выполняется только по совместимой очереди менеджера.
                    </p>
                    <p className="secret-rule-line">
                      <RefreshCw className="size-4" />
                      Сброс откатывает только текущий сеанс.
                    </p>
                  </div>

                  {showAllCards && (
                    <div className="secret-side-card secret-all-list-card">
                      <p className="secret-side-title">Пул лидов</p>
                      <div className="secret-all-list">
                        {unassignedNewLeads.length === 0 ? (
                          <p className="secret-side-empty">В очереди нет новых лидов.</p>
                        ) : (
                          unassignedNewLeads.map((lead) => (
                            <button
                              key={lead.id}
                              type="button"
                              className={cn(
                                'secret-all-list-item',
                                activeDeckLead?.id === lead.id && 'is-active'
                              )}
                              onClick={() => focusLeadFromQueue(lead.id)}
                            >
                              <span>{lead.name ?? lead.id}</span>
                              <span className="secret-all-list-side">
                                {isLeadStale(lead, nowTs) && (
                                  <span className="secret-mini-chip is-stale">
                                    <Flame className="size-3" />
                                    2ч+
                                  </span>
                                )}
                                {isHotLead(lead, nowTs) && (
                                  <span className="secret-mini-chip is-hot">HOT</span>
                                )}
                                <span className="secret-all-list-meta">{SOURCE_LABELS[lead.source]}</span>
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </aside>
              </section>
            )}
          </div>

          {drawerManager && (
            <>
              <button
                type="button"
                className="secret-drawer-backdrop"
                style={{ zIndex: STACK_ORDER.modal + 1 }}
                onClick={() => setDrawerManagerId(null)}
                aria-label="Закрыть досье менеджера"
              />
              <aside className="secret-manager-drawer is-open" style={{ zIndex: STACK_ORDER.modal + 2 }}>
                <div className="secret-manager-drawer-head">
                  <div>
                    <p className="secret-manager-drawer-kicker">Досье менеджера</p>
                    <h3 className="secret-manager-drawer-title">{drawerManager.name}</h3>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="secret-manager-drawer-close"
                    onClick={() => setDrawerManagerId(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <section className="secret-manager-drawer-section">
                  <p className="secret-manager-drawer-section-title">Воронка статусов</p>
                  <div className="secret-manager-stage-chips">
                    {drawerStageRows.length === 0 ? (
                      <p className="secret-manager-drawer-empty">Нет активных лидов.</p>
                    ) : (
                      drawerStageRows.map((row) => (
                        <span key={`${drawerManager.id}-${row.stageId}`} className="secret-manager-stage-chip">
                          {row.stageName} ({row.count})
                        </span>
                      ))
                    )}
                  </div>
                </section>

                <section className="secret-manager-drawer-section">
                  <p className="secret-manager-drawer-section-title">Финансовая сводка</p>
                  <div className="secret-manager-finance-wrap">
                    <table className="secret-manager-finance-table">
                      <thead>
                        <tr>
                          <th>Срез</th>
                          <th>Лиды</th>
                          <th>Потенциал</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drawerFinanceRows.map((row) => (
                          <tr key={`${drawerManager.id}-${row.key}`}>
                            <td>
                              <HoverHint
                                className="secret-finance-row-hint"
                                label={row.label}
                                hint={FINANCE_ROW_HINTS[row.key] ?? row.label}
                              />
                            </td>
                            <td>{row.leads}</td>
                            <td>{formatUsd(row.budgetUsd)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="secret-manager-finance-note">
                    Успех: {SUCCESS_STAGE_NAMES.join(', ')}.
                  </p>
                </section>

                <section className="secret-manager-drawer-section secret-manager-drawer-cards-section">
                  <p className="secret-manager-drawer-section-title">Активные карты</p>
                  <div className="secret-manager-lead-cards">
                    {drawerLeads.length === 0 ? (
                      <p className="secret-manager-drawer-empty">У менеджера нет лидов в руке.</p>
                    ) : (
                      drawerLeads.map((lead) => (
                        <article
                          key={lead.id}
                          className={cn(
                            'secret-manager-lead-card',
                            isLeadStale(lead, nowTs) && 'is-stale'
                          )}
                        >
                          <div className="secret-manager-lead-top">
                            <span className="secret-manager-lead-name">{lead.name ?? lead.id}</span>
                            <span className="secret-manager-lead-budget">{formatLeadBudget(lead)}</span>
                          </div>
                          <p className="secret-manager-lead-sub">
                            {SOURCE_LABELS[lead.source]} · {STAGE_NAME_BY_ID[lead.stageId] ?? lead.stageId}
                          </p>
                          <p className="secret-manager-lead-sub">ID: {lead.id}</p>
                        </article>
                      ))
                    )}
                  </div>
                </section>

                <section className="secret-manager-drawer-section">
                  <Button
                    type="button"
                    className="secret-manager-drawer-action"
                    disabled={drawerOverdueLeadIds.length === 0}
                    onClick={reclaimOverdueLeadsFromDrawerManager}
                  >
                    Забрать просроченные лиды ({drawerOverdueLeadIds.length})
                  </Button>
                </section>
              </aside>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
