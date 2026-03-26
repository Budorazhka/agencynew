import { useEffect, useState } from 'react'
import { getBranding, type AgencyBranding } from '@/store/agencyStore'

/** Брендинг из localStorage; обновляется после saveBranding в этой же вкладке. */
export function useAgencyBranding(): AgencyBranding {
  const [branding, setBranding] = useState<AgencyBranding>(() => getBranding())

  useEffect(() => {
    const sync = () => setBranding(getBranding())
    window.addEventListener('agency-branding-updated', sync)
    return () => window.removeEventListener('agency-branding-updated', sync)
  }, [])

  return branding
}
