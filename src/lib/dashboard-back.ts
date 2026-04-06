/**
 * Единая логика «Назад» в дашборде: кроме корня `/dashboard` всегда есть предсказуемая цель.
 * Порталы модалок не влияют — ориентируемся на pathname + search + state.
 */

export type DashboardBackNavigation = { pathname: string; search?: string }

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/'
  return pathname.replace(/\/+$/, '') || '/'
}

export function isDashboardHomePath(pathname: string): boolean {
  return normalizePath(pathname) === '/dashboard'
}

function safeExplicitBackTo(state: unknown): DashboardBackNavigation | null {
  if (!state || typeof state !== 'object') return null
  const rec = state as { backTo?: unknown; backSearch?: unknown }
  if (typeof rec.backTo !== 'string' || !rec.backTo.startsWith('/dashboard')) return null
  const search =
    typeof rec.backSearch === 'string' && rec.backSearch.startsWith('?') ? rec.backSearch : undefined
  return { pathname: rec.backTo, search }
}

function stripLastSegment(normalized: string): string {
  const parts = normalized.split('/').filter(Boolean)
  if (parts.length <= 1) return '/dashboard'
  parts.pop()
  return `/${parts.join('/')}`
}

/**
 * Цель навигации «Назад» или null только для главной `/dashboard`.
 */
export function resolveDashboardBackNavigation(
  pathname: string,
  search: string,
  state: unknown,
): DashboardBackNavigation | null {
  const p = normalizePath(pathname)
  if (p === '/dashboard') return null

  const explicit = safeExplicitBackTo(state)
  if (explicit) return explicit

  if (p === '/dashboard/access-denied') {
    return { pathname: '/dashboard' }
  }

  /** Покерный стол открывается из хаба CRM (п. 6.2 ТЗ) — «Назад» на плитки, не на /dashboard/leads. */
  if (p === '/dashboard/leads/poker') {
    return { pathname: '/dashboard/crm' }
  }

  /** Клиенты / сделки / задачи — контур CRM, не отдельные разделы rail. */
  if (
    p.startsWith('/dashboard/clients') ||
    p.startsWith('/dashboard/deals') ||
    p.startsWith('/dashboard/tasks')
  ) {
    return { pathname: '/dashboard/crm' }
  }

  /** Модуль броней — в контуре «Новостройки», отдельного пункта rail нет. */
  if (p.startsWith('/dashboard/bookings')) {
    return { pathname: '/dashboard/new-buildings' }
  }

  /** Полный календарь открывают с виджета рабочего стола. */
  if (p.startsWith('/dashboard/calendar')) {
    return { pathname: '/dashboard' }
  }

  /** MLM-аналитика — из хаба «Сообщество». */
  if (p.startsWith('/dashboard/partners/mlm')) {
    return { pathname: '/dashboard/community' }
  }

  /** Каталог партнёров (без MLM) — контур «Сообщество». */
  if (p.startsWith('/dashboard/partners') && !p.startsWith('/dashboard/partners/mlm')) {
    return { pathname: '/dashboard/community' }
  }

  const q = search && search.startsWith('?') ? search : search ? `?${search}` : ''

  const testMatch = p.match(/^\/dashboard\/lms\/test\/([^/]+)$/)
  if (testMatch) {
    const lessonId = testMatch[1]
    const courseId = new URLSearchParams(q || '?').get('courseId')
    if (courseId) {
      return {
        pathname: `/dashboard/lms/lesson/${lessonId}`,
        search: `?courseId=${encodeURIComponent(courseId)}`,
      }
    }
  }

  if (/^\/dashboard\/lms\/course\/[^/]+$/.test(p)) {
    return { pathname: '/dashboard/lms/browse', search: '?tab=courses' }
  }
  if (/^\/dashboard\/lms\/lesson\/[^/]+$/.test(p)) {
    const courseId = new URLSearchParams(q || '?').get('courseId')
    if (courseId) {
      return { pathname: `/dashboard/lms/course/${encodeURIComponent(courseId)}` }
    }
    return { pathname: '/dashboard/lms/browse' }
  }
  if (/^\/dashboard\/lms\/test\/[^/]+$/.test(p)) {
    return { pathname: '/dashboard/lms/browse' }
  }

  if (p === '/dashboard/lms/browse' || p === '/dashboard/lms/add') {
    return { pathname: '/dashboard/learning' }
  }

  if (p === '/dashboard/lms') {
    return { pathname: '/dashboard/learning' }
  }

  const parent = stripLastSegment(p)
  return { pathname: parent }
}
