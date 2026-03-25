export type PartnerType = 'referral' | 'intermediary' | 'owner'
export type PartnerStatus = 'active' | 'inactive' | 'pending'

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  referral:     'Реферал',
  intermediary: 'Посредник',
  owner:        'Собственник',
}

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  active:  'Активен',
  inactive:'Неактивен',
  pending: 'На проверке',
}

export interface PartnerLead {
  id: string
  clientName: string
  transferredAt: string  // ISO
  status: 'new' | 'in_progress' | 'qualified' | 'won' | 'lost'
  commission?: number
}

export interface PartnerPayout {
  id: string
  amount: number
  date: string  // ISO
  dealId: string
  comment?: string
}

export interface Partner {
  id: string
  name: string
  type: PartnerType
  status: PartnerStatus
  phone: string
  email: string
  company?: string
  leadsCount: number
  commissionTotal: number
  balance: number
  registeredAt: string  // ISO
  leads: PartnerLead[]
  payouts: PartnerPayout[]
}
