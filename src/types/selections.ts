export type PropertyMarket = 'primary' | 'secondary' // новостройка / вторичка

export type SelectionStatus = 'draft' | 'sent' | 'viewed' | 'deal_created' | 'archived'

export const SELECTION_STATUS_LABELS: Record<SelectionStatus, string> = {
  draft: 'Черновик',
  sent: 'Отправлена',
  viewed: 'Просмотрена',
  deal_created: 'Сделка создана',
  archived: 'Архив',
}

export const SELECTION_STATUS_COLORS: Record<SelectionStatus, string> = {
  draft: '#6b7280',
  sent: '#3b82f6',
  viewed: '#f59e0b',
  deal_created: '#178b00',
  archived: '#4b5563',
}

export const MARKET_LABELS: Record<PropertyMarket, string> = {
  primary: 'Новостройка',
  secondary: 'Вторичка',
}

export const MARKET_COLORS: Record<PropertyMarket, string> = {
  primary: '#c9a84c',
  secondary: '#60a5fa',
}

export type SelectionProperty = {
  id: string
  propertyId: string
  address: string
  price: number
  rooms: number
  area: number
  floor: string
  market: PropertyMarket
  building?: string // ЖК для новостроек
  developer?: string
  imageUrl?: string
  /** Текстовое описание для отправки клиенту */
  description?: string
  liked?: boolean   // клиент лайкнул
  hidden?: boolean  // клиент скрыл
}

export type Selection = {
  id: string
  title: string
  clientId: string
  clientName: string
  clientPhone: string
  agentId: string
  agentName: string
  status: SelectionStatus
  properties: SelectionProperty[]
  portalUrl?: string
  budget?: number
  notes?: string
  createdAt: string
  sentAt?: string
  lastOpenedAt?: string
  viewCount: number
}
