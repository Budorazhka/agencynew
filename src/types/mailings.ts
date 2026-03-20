export type MailingScope = 'city' | 'country' | 'world'

export type MailingAudience = 'all_partners' | 'all_network' | 'selected'

export type MailingChannel = 'crm' | 'cabinet'

export interface MailingLink {
  url: string
  label?: string
}

export interface Mailing {
  id: string
  title: string
  body: string
  links: MailingLink[]
  imageUrl?: string
  fileUrl?: string
  fileName?: string
  channels: MailingChannel[]
  audience: MailingAudience
  scope: MailingScope
  selectedPartnerIds?: string[]
  scheduledAt?: string | null
  sentAt?: string | null
  createdAt: string
  createdBy?: string
  /** For "all_partners" + scope: which city/country was selected */
  scopeCityId?: string
  scopeCountryId?: string
}
