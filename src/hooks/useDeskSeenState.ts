import { useCallback, useMemo, useState } from 'react'

const STORAGE_KEY = 'desk-seen-ids-v1'

export type DeskSeenKey = 'leads' | 'tasks' | 'notifs' | 'reminders' | 'news'

export type DeskSeen = Record<DeskSeenKey, string[]>

function parseSeen(raw: string | null): DeskSeen | null {
  if (!raw) return null
  try {
    const o = JSON.parse(raw) as unknown
    if (!o || typeof o !== 'object') return null
    const r = o as Record<string, unknown>
    return {
      leads: Array.isArray(r.leads) ? (r.leads as string[]) : [],
      tasks: Array.isArray(r.tasks) ? (r.tasks as string[]) : [],
      notifs: Array.isArray(r.notifs) ? (r.notifs as string[]) : [],
      reminders: Array.isArray(r.reminders) ? (r.reminders as string[]) : [],
      news: Array.isArray(r.news) ? (r.news as string[]) : [],
    }
  } catch {
    return null
  }
}

function saveSeen(s: DeskSeen) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* quota */
  }
}

/**
 * Первичное состояние «прочитано»: часть элементов считается уже просмотренной,
 * чтобы на демо у неактивных вкладок отображались метки «как в мессенджере».
 */
export function buildDeskBootstrapSeen(params: {
  /** ID лидов вкладки «Новые», от новых к старым */
  leadIdsNewestFirst: string[]
  /** ID задач, требующих внимания (просроченные и на сегодня), приоритет — сначала просроченные */
  taskAttentionIdsOrdered: string[]
  notifIds: string[]
  reminderIds: string[]
  /** ID новостей от новых к старым */
  newsIdsNewestFirst: string[]
}): DeskSeen {
  const {
    leadIdsNewestFirst,
    taskAttentionIdsOrdered,
    notifIds,
    reminderIds,
    newsIdsNewestFirst,
  } = params
  return {
    leads: leadIdsNewestFirst.slice(2),
    tasks: taskAttentionIdsOrdered.slice(1),
    notifs: notifIds.slice(2),
    reminders: reminderIds.slice(1),
    news: newsIdsNewestFirst.slice(1),
  }
}

export function countUnreadIds(allIds: string[], seenIds: string[]): number {
  const seen = new Set(seenIds)
  return allIds.filter((id) => !seen.has(id)).length
}

export function useDeskSeenState(bootstrap: DeskSeen) {
  const [seen, setSeen] = useState<DeskSeen>(() => {
    if (typeof window === 'undefined') return bootstrap
    const loaded = parseSeen(localStorage.getItem(STORAGE_KEY))
    if (loaded) return loaded
    saveSeen(bootstrap)
    return bootstrap
  })

  const markSeen = useCallback((key: DeskSeenKey, ids: string[]) => {
    setSeen((prev) => {
      const merged = [...new Set([...prev[key], ...ids])]
      const next = { ...prev, [key]: merged }
      saveSeen(next)
      return next
    })
  }, [])

  const unread = useMemo(
    () => ({
      leads: (ids: string[]) => countUnreadIds(ids, seen.leads),
      tasks: (ids: string[]) => countUnreadIds(ids, seen.tasks),
      notifs: (ids: string[]) => countUnreadIds(ids, seen.notifs),
      reminders: (ids: string[]) => countUnreadIds(ids, seen.reminders),
      news: (ids: string[]) => countUnreadIds(ids, seen.news),
    }),
    [seen],
  )

  return { seen, markSeen, unread }
}
