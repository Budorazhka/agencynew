/** Типы для модуля Брони / Регистрации */

export type BookingStatus = 'pending' | 'active' | 'rejected' | 'expired' | 'completed'
export type BookingType = 'client' | 'apartment'

/** Первичка — бронь по шахматке/ЖК; вторичка — лот из своей базы, сопоставление с лидом */
export type BookingPropertyMarket = 'primary' | 'secondary'

export interface Booking {
  id: string
  type: BookingType
  status: BookingStatus
  /** Клиент */
  clientId: string
  clientName: string
  /** Объект */
  propertyAddress: string
  propertyType?: string
  /** Девелопер (новостройки: бронь клиента и первичка у квартиры) */
  developerName?: string
  /**
   * Только для `type === 'apartment'`.
   * Первичка — процесс через шахматку ЖК; вторичка — вывод лота из своего списка и привязка к лиду.
   */
  propertyMarket?: BookingPropertyMarket
  /** Связь с лидом (актуально для вторички и перекрёстных экранов) */
  sourceLeadId?: string
  /** Новостройка: выбранный ЖК (id из каталога / API) */
  newBuildComplexId?: string
  /** Новостройка: выбранная квартира (для брони квартиры, id из шахматки / API) */
  newBuildApartmentId?: string
  /** Вторичка: лот из внутренней базы агентства */
  agencyLotId?: string
  /** ID сделки */
  dealId?: string
  /** Агент */
  agentId: string
  agentName: string
  /** Когда забронировано */
  bookedAt: string
  /** Срок действия брони (часы) */
  durationHours: number
  /** Когда истекает */
  expiresAt: string
  notes?: string
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   'Ожидание',
  active:    'Бронь активна',
  rejected:  'Отклонена',
  expired:   'Просрочена',
  completed: 'Завершена',
}

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending:   '#60a5fa',
  active:    '#4ade80',
  rejected:  '#f87171',
  expired:   'rgba(255,255,255,0.35)',
  completed: '#c9a84c',
}
