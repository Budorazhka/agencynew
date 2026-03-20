import type { PortalUser } from '@/types/leads'
import { CURRENT_PORTAL_USER_ID, PORTAL_USERS } from '@/data/leads-mock'

/** Текущий пользователь портала (мок) */
export function getCurrentPortalUser(): PortalUser | null {
  return PORTAL_USERS.find((u) => u.id === CURRENT_PORTAL_USER_ID) ?? null
}

/** Есть ли у текущего пользователя доступ к админке лидов; открытый доступ (без проверки роли) */
export function hasLeadAdminAccess(): boolean {
  return true
}

/** Является ли текущий пользователь директором (полный доступ) */
export function isLeadAdminDirector(): boolean {
  const user = getCurrentPortalUser()
  return user?.leadAdminRole === 'director'
}
