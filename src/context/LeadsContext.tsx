import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type {
  BuyerRegistration,
  DistributionRule,
  Lead,
  LeadEvent,
  LeadManager,
  LeadPartnerByEmail,
  LeadSource,
  LeadWithHistory,
} from '@/types/leads'

/** Для round_robin: следующий менеджер по кругу для данной очереди */
function getNextManagerIdRoundRobin(
  leadPool: Lead[],
  leadManagers: LeadManager[],
  source: LeadSource
): string | null {
  const managers = leadManagers
    .filter((m) => m.sourceTypes.includes(source))
    .sort((a, b) => a.id.localeCompare(b.id))
  if (managers.length === 0) return null
  const leadsInSource = leadPool.filter((l) => l.source === source)
  const index = leadsInSource.length % managers.length
  return managers[index].id
}

/** Для by_load: менеджер с наименьшей загрузкой по этой очереди */
function getNextManagerIdByLoad(
  leadPool: Lead[],
  leadManagers: LeadManager[],
  source: LeadSource
): string | null {
  const managers = leadManagers.filter((m) => m.sourceTypes.includes(source))
  if (managers.length === 0) return null
  const countByManager: Record<string, number> = {}
  managers.forEach((m) => { countByManager[m.id] = 0 })
  leadPool.filter((l) => l.source === source).forEach((l) => {
    if (l.managerId && countByManager[l.managerId] !== undefined) {
      countByManager[l.managerId]++
    }
  })
  let minId = managers[0].id
  let minCount = countByManager[minId] ?? 0
  managers.forEach((m) => {
    const c = countByManager[m.id] ?? 0
    if (c < minCount) {
      minCount = c
      minId = m.id
    }
  })
  return minId
}
import {
  DEFAULT_DISTRIBUTION_RULE,
  DEFAULT_MANUAL_DISTRIBUTOR_ID,
  INITIAL_LEAD_HISTORY,
  INITIAL_LEAD_MANAGERS,
  INITIAL_LEAD_PARTNERS,
  INITIAL_LEAD_POOL,
} from '@/data/leads-mock'

export interface LeadsState {
  leadPool: Lead[]
  distributionRule: DistributionRule
  manualDistributorId: string | null
  leadManagers: LeadManager[]
  leadPartners: LeadPartnerByEmail[]
  /** История событий по лидам: leadId → события */
  leadHistory: Record<string, LeadEvent[]>
  /** Регистрации покупателей по лидам: leadId → регистрации */
  leadRegistrations: Record<string, BuyerRegistration[]>
}

export type LeadsAction =
  | { type: 'ADD_LEAD'; lead: Lead }
  | { type: 'ASSIGN_LEAD'; leadId: string; managerId: string }
  | { type: 'UNASSIGN_LEAD'; leadId: string }
  | { type: 'UPDATE_LEAD_STAGE'; leadId: string; stageId: string; authorId?: string; authorName?: string; fromStageName?: string; toStageName?: string }
  | { type: 'SET_DISTRIBUTION_RULE'; rule: DistributionRule }
  | { type: 'SET_MANUAL_DISTRIBUTOR'; managerId: string | null }
  | { type: 'ADD_LEAD_MANAGER'; manager: LeadManager }
  | { type: 'REMOVE_LEAD_MANAGER'; managerId: string }
  | { type: 'UPDATE_LEAD_MANAGER'; managerId: string; patch: Partial<LeadManager> }
  | { type: 'ADD_LEAD_PARTNER'; partner: LeadPartnerByEmail }
  | { type: 'REMOVE_LEAD_PARTNER'; partnerId: string }
  | { type: 'UPDATE_LEAD_PARTNER'; partnerId: string; patch: Partial<LeadPartnerByEmail> }
  | { type: 'ADD_LEAD_EVENT'; leadId: string; event: LeadEvent }
  | { type: 'ADD_BUYER_REGISTRATION'; leadId: string; registration: BuyerRegistration }
  | { type: 'BULK_REASSIGN_LEADS'; fromManagerId: string; toManagerId: string }
  | { type: 'UPDATE_LEAD_MANAGER_SUBSTITUTE'; managerId: string; patch: { isUnavailable?: boolean; substituteId?: string | null } }
  | { type: 'DELETE_LEAD_EVENT'; leadId: string; eventId: string }
  | { type: 'EDIT_LEAD_EVENT'; leadId: string; eventId: string; patch: { taskName?: string; deadline?: string; eisenhowerUrgent?: boolean; eisenhowerImportant?: boolean } }

function leadsReducer(state: LeadsState, action: LeadsAction): LeadsState {
  switch (action.type) {
    case 'ADD_LEAD': {
      const lead = action.lead
      let managerId: string | null = lead.managerId ?? null
      const rule = state.distributionRule.type
      const noManualDistributor = state.manualDistributorId == null
      if (noManualDistributor && rule === 'round_robin') {
        managerId = getNextManagerIdRoundRobin(state.leadPool, state.leadManagers, lead.source)
      } else if (noManualDistributor && rule === 'by_load') {
        managerId = getNextManagerIdByLoad(state.leadPool, state.leadManagers, lead.source)
      }
      const newLead: Lead = { ...lead, managerId }
      return { ...state, leadPool: [newLead, ...state.leadPool] }
    }
    case 'ASSIGN_LEAD':
      return {
        ...state,
        leadPool: state.leadPool.map((l) =>
          l.id === action.leadId ? { ...l, managerId: action.managerId } : l
        ),
      }
    case 'UNASSIGN_LEAD':
      return {
        ...state,
        leadPool: state.leadPool.map((l) =>
          l.id === action.leadId ? { ...l, managerId: null } : l
        ),
      }
    case 'UPDATE_LEAD_STAGE': {
      const now = new Date().toISOString()
      const prevLead = state.leadPool.find((l) => l.id === action.leadId)
      const stageEvent: LeadEvent = {
        id: `evt-${Date.now()}`,
        type: 'stage_change',
        timestamp: now,
        authorId: action.authorId ?? 'system',
        authorName: action.authorName ?? 'Система',
        payload: {
          fromStage: prevLead?.stageId,
          fromStageName: action.fromStageName,
          toStage: action.stageId,
          toStageName: action.toStageName,
        },
      }
      const prevHistory = state.leadHistory[action.leadId] ?? []
      return {
        ...state,
        leadPool: state.leadPool.map((l) =>
          l.id === action.leadId
            ? { ...l, stageId: action.stageId, updatedAt: now }
            : l
        ),
        leadHistory: {
          ...state.leadHistory,
          [action.leadId]: [...prevHistory, stageEvent],
        },
      }
    }
    case 'SET_DISTRIBUTION_RULE':
      return { ...state, distributionRule: action.rule }
    case 'SET_MANUAL_DISTRIBUTOR':
      return { ...state, manualDistributorId: action.managerId }
    case 'ADD_LEAD_MANAGER':
      return { ...state, leadManagers: [...state.leadManagers, action.manager] }
    case 'REMOVE_LEAD_MANAGER':
      return {
        ...state,
        leadManagers: state.leadManagers.filter((m) => m.id !== action.managerId),
        manualDistributorId:
          state.manualDistributorId === action.managerId ? null : state.manualDistributorId,
      }
    case 'UPDATE_LEAD_MANAGER':
      return {
        ...state,
        leadManagers: state.leadManagers.map((m) =>
          m.id === action.managerId ? { ...m, ...action.patch } : m
        ),
      }
    case 'ADD_LEAD_PARTNER':
      return { ...state, leadPartners: [...state.leadPartners, action.partner] }
    case 'REMOVE_LEAD_PARTNER':
      return {
        ...state,
        leadPartners: state.leadPartners.filter((p) => p.id !== action.partnerId),
      }
    case 'UPDATE_LEAD_PARTNER':
      return {
        ...state,
        leadPartners: state.leadPartners.map((p) =>
          p.id === action.partnerId ? { ...p, ...action.patch } : p
        ),
      }
    case 'ADD_LEAD_EVENT': {
      const prev = state.leadHistory[action.leadId] ?? []
      return {
        ...state,
        leadHistory: { ...state.leadHistory, [action.leadId]: [...prev, action.event] },
      }
    }
    case 'DELETE_LEAD_EVENT': {
      const prev = state.leadHistory[action.leadId] ?? []
      return {
        ...state,
        leadHistory: {
          ...state.leadHistory,
          [action.leadId]: prev.filter((evt) => evt.id !== action.eventId),
        },
      }
    }
    case 'EDIT_LEAD_EVENT': {
      const prev = state.leadHistory[action.leadId] ?? []
      return {
        ...state,
        leadHistory: {
          ...state.leadHistory,
          [action.leadId]: prev.map((evt) =>
            evt.id === action.eventId
              ? { ...evt, payload: { ...evt.payload, ...action.patch } as LeadEvent['payload'] }
              : evt
          ),
        },
      }
    }
    case 'ADD_BUYER_REGISTRATION': {
      const prev = state.leadRegistrations[action.leadId] ?? []
      return {
        ...state,
        leadRegistrations: {
          ...state.leadRegistrations,
          [action.leadId]: [...prev, action.registration],
        },
      }
    }
    case 'BULK_REASSIGN_LEADS':
      return {
        ...state,
        leadPool: state.leadPool.map((l) =>
          l.managerId === action.fromManagerId
            ? { ...l, managerId: action.toManagerId }
            : l
        ),
      }
    case 'UPDATE_LEAD_MANAGER_SUBSTITUTE':
      return {
        ...state,
        leadManagers: state.leadManagers.map((m) =>
          m.id === action.managerId ? { ...m, ...action.patch } : m
        ),
      }
    default:
      return state
  }
}

const initialState: LeadsState = {
  leadPool: INITIAL_LEAD_POOL,
  distributionRule: DEFAULT_DISTRIBUTION_RULE,
  manualDistributorId: DEFAULT_MANUAL_DISTRIBUTOR_ID,
  leadManagers: INITIAL_LEAD_MANAGERS,
  leadPartners: INITIAL_LEAD_PARTNERS,
  leadHistory: INITIAL_LEAD_HISTORY,
  leadRegistrations: {},
}

type LeadsContextValue = {
  state: LeadsState
  dispatch: React.Dispatch<LeadsAction>
  leadManagers: LeadManager[]
  /** Лиды по источнику (очереди) */
  leadsBySource: (source: LeadSource) => Lead[]
  /** Идёт автоназначение (по кругу / по загрузке) без ручного распределителя */
  isAutoDistribution: boolean
  /** Получить лид с историей и регистрациями */
  getLeadWithHistory: (leadId: string) => LeadWithHistory | null
}

const LeadsContext = createContext<LeadsContextValue | null>(null)

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(leadsReducer, initialState)

  const leadsBySource = (source: LeadSource) =>
    state.leadPool.filter((l) => l.source === source)

  const isAutoDistribution =
    state.distributionRule.type !== 'manual' && state.manualDistributorId == null

  const getLeadWithHistory = (leadId: string): LeadWithHistory | null => {
    const lead = state.leadPool.find((l) => l.id === leadId)
    if (!lead) return null
    return {
      ...lead,
      history: state.leadHistory[leadId] ?? [],
      registrations: state.leadRegistrations[leadId] ?? [],
    }
  }

  return (
    <LeadsContext.Provider
      value={{
        state,
        dispatch,
        leadManagers: state.leadManagers,
        leadsBySource,
        isAutoDistribution,
        getLeadWithHistory,
      }}
    >
      {children}
    </LeadsContext.Provider>
  )
}

export function useLeads() {
  const ctx = useContext(LeadsContext)
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider')
  return ctx
}
