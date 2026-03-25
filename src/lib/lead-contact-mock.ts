/** Детерминированный «телефон» для лида в моках (в CRM был бы из карточки). */
export function mockPhoneForLead(leadId: string): string {
  let h = 0
  for (let i = 0; i < leadId.length; i++) h = (h * 31 + leadId.charCodeAt(i)) >>> 0
  const a = 900 + (h % 100)
  const b = 100 + ((h >> 3) % 900)
  const c = 10 + ((h >> 6) % 90)
  const d = 10 + ((h >> 9) % 90)
  return `+7 (${String(a).slice(0, 3)}) ${b}-${String(c).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
