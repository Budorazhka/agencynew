import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Partner, City, Permission, PartnerRole } from '@/types/dashboard'
import type { Mailing } from '@/types/mailings'
import { cities as initialCities } from '@/data/mock'

interface DashboardState {
  cities: City[]
  mailings: Mailing[]
}

type Action =
  | { type: 'UPDATE_PERMISSIONS'; partnerId: string; cityId: string; permissions: Permission[] }
  | { type: 'UPDATE_ROLES'; partnerId: string; cityId: string; roles: PartnerRole[] }
  | { type: 'ADD_PARTNER'; cityId: string; partner: Partner }
  | { type: 'ADD_MAILING'; mailing: Mailing }
  | { type: 'CANCEL_SCHEDULED_MAILING'; mailingId: string }

function reducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case 'UPDATE_PERMISSIONS':
      return {
        ...state,
        cities: state.cities.map(city =>
          city.id === action.cityId
            ? {
                ...city,
                partners: city.partners.map(p =>
                  p.id === action.partnerId
                    ? { ...p, permissions: action.permissions }
                    : p
                ),
              }
            : city
        ),
      }
    case 'UPDATE_ROLES':
      return {
        ...state,
        cities: state.cities.map(city =>
          city.id === action.cityId
            ? {
                ...city,
                partners: city.partners.map(p =>
                  p.id === action.partnerId ? { ...p, roles: action.roles } : p
                ),
              }
            : city
        ),
      }
    case 'ADD_PARTNER':
      return {
        ...state,
        cities: state.cities.map(city =>
          city.id === action.cityId
            ? { ...city, partners: [...city.partners, action.partner] }
            : city
        ),
      }
    case 'ADD_MAILING':
      return {
        ...state,
        mailings: [action.mailing, ...state.mailings],
      }
    case 'CANCEL_SCHEDULED_MAILING':
      return {
        ...state,
        mailings: state.mailings.filter((m) => m.id !== action.mailingId),
      }
    default:
      return state
  }
}

const DashboardContext = createContext<{
  state: DashboardState
  dispatch: React.Dispatch<Action>
} | null>(null)

const initialState: DashboardState = {
  cities: initialCities,
  mailings: [],
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
