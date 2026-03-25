/** Типы для модуля Сделки */

export type DealStage =
  | 'showing'      // Показ
  | 'deposit'      // Задаток получен
  | 'deal'         // Заключен договор

export type DealType = 'primary' | 'secondary'

export interface DealParticipant {
  role: 'agent' | 'lawyer' | 'rop' | 'buyer' | 'seller'
  name: string
  userId?: string
}

export interface DealChecklistItem {
  id: string
  label: string
  done: boolean
  required: boolean
}

export interface Deal {
  id: string
  /** Связанный лид (если сделка создана из лида) */
  sourceLeadId?: string
  type: DealType
  stage: DealStage
  /** Клиент */
  clientId: string
  clientName: string
  /** Объект */
  propertyAddress: string
  propertyType: string
  /** Ответственный агент */
  agentId: string
  agentName: string
  /** Участники */
  participants: DealParticipant[]
  /** Сумма сделки */
  price: number
  /** Комиссия агентства */
  commission: number
  /** Дата создания */
  createdAt: string
  /** Дата последнего обновления */
  updatedAt: string
  /** Чеклист для текущего этапа */
  checklist: DealChecklistItem[]
  /** Автозадача юристу создана */
  lawyerTaskCreated?: boolean
  notes?: string
}

export const STAGE_LABELS: Record<DealStage, string> = {
  showing:   'Показ',
  deposit:   'Задаток получен',
  deal:      'Заключен договор',
}

export const STAGE_ORDER: DealStage[] = [
  'showing',
  'deposit',
  'deal',
]
