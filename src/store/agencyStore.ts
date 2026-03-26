// Simple agency branding store via localStorage
export interface AgencyBranding {
  name: string
  logoDataUrl: string | null
}

const KEY = 'agency_branding'

export function getBranding(): AgencyBranding {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as AgencyBranding
  } catch {}
  return { name: '', logoDataUrl: null }
}

export function saveBranding(data: AgencyBranding): void {
  localStorage.setItem(KEY, JSON.stringify(data))
  window.dispatchEvent(new Event('agency-branding-updated'))
}
