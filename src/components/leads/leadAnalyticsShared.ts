export type CampaignStatus = 'active' | 'paused' | 'ended'

export type CampaignChannel =
  | 'Яндекс.Директ'
  | 'ВКонтакте'
  | 'myTarget'
  | 'Google'
  | 'Meta (Instagram/Facebook)'
  | 'TikTok'
  | 'Telegram Ads'
  | 'Другое'

export interface Campaign {
  id: string
  name: string
  channel: CampaignChannel
  budget: number
  spent: number
  impressions: number
  clicks: number
  leads: number
  status: CampaignStatus
  startDate: string
  endDate?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: 'ac1', name: 'Новостройки Москва — Поиск', channel: 'Яндекс.Директ', budget: 120_000, spent: 89_400, impressions: 124_000, clicks: 3_200, leads: 128, status: 'active', startDate: '2026-02-01', utmSource: 'yandex', utmMedium: 'cpc', utmCampaign: 'novostroyki-msk' },
  { id: 'ac2', name: 'ЖК Премьер — Ретаргет', channel: 'ВКонтакте', budget: 60_000, spent: 42_000, impressions: 87_000, clicks: 1_950, leads: 74, status: 'active', startDate: '2026-02-10', utmSource: 'vk', utmMedium: 'retarget', utmCampaign: 'jk-premier' },
  { id: 'ac3', name: 'Вторичка — Look-alike', channel: 'Meta (Instagram/Facebook)', budget: 55_000, spent: 38_200, impressions: 210_000, clicks: 4_100, leads: 96, status: 'active', startDate: '2026-02-05', utmSource: 'instagram', utmMedium: 'cpm', utmCampaign: 'vtorichka-ig' },
  { id: 'ac4', name: 'Сторис — Новостройки', channel: 'Meta (Instagram/Facebook)', budget: 40_000, spent: 28_600, impressions: 161_000, clicks: 2_980, leads: 61, status: 'paused', startDate: '2026-01-15', utmSource: 'instagram', utmMedium: 'stories', utmCampaign: 'novostroyki-stories' },
  { id: 'ac6', name: 'Брендовый — Google Ads', channel: 'Google', budget: 30_000, spent: 18_900, impressions: 33_000, clicks: 2_800, leads: 112, status: 'ended', startDate: '2025-12-01', endDate: '2026-01-31', utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'brand' },
]

export const CHANNELS: CampaignChannel[] = [
  'Яндекс.Директ',
  'ВКонтакте',
  'myTarget',
  'Meta (Instagram/Facebook)',
  'Google',
  'TikTok',
  'Telegram Ads',
  'Другое',
]

export const STATUS_LABEL: Record<CampaignStatus, string> = {
  active: 'Активна',
  paused: 'Пауза',
  ended: 'Завершена',
}

export const STATUS_COLOR: Record<CampaignStatus, string> = {
  active: 'border-emerald-500/35 bg-emerald-500/12 text-emerald-400',
  paused: 'border-amber-500/35 bg-amber-500/10 text-amber-400',
  ended: 'border-[rgba(242,207,141,0.2)] bg-[rgba(242,207,141,0.06)] text-[rgba(242,207,141,0.45)]',
}

export function formatDollars(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`
}

export function formatDollarsCompact(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000
    const formatted = Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1)
    return `$${formatted}M`
  }

  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}K`
  }

  return formatDollars(amount)
}

export function getCampaignSummary(campaigns: Campaign[]) {
  const totalImpressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0)
  const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0)
  const totalLeads = campaigns.reduce((sum, campaign) => sum + campaign.leads, 0)
  const totalSpent = campaigns.reduce((sum, campaign) => sum + campaign.spent, 0)
  const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0)
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === 'active').length

  return {
    totalImpressions,
    totalClicks,
    totalLeads,
    totalSpent,
    totalBudget,
    activeCampaigns,
    avgCtr: totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0,
    avgCpl: totalLeads > 0 ? Math.round(totalSpent / totalLeads) : 0,
    budgetUsedPct: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
  }
}
