import type { Selection } from '@/types/selections'

const STORAGE_KEY = 'agency-new.selections.extra'

export function loadExtraSelections(): Selection[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as Selection[]) : []
  } catch {
    return []
  }
}

export function prependSelections(entries: Selection[]) {
  if (entries.length === 0) return
  try {
    const cur = loadExtraSelections()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...entries, ...cur]))
  } catch {
    /* ignore */
  }
}
