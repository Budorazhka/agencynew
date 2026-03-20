import {
  type UserRole,
  type AccountType,
  type PermissionAction,
  ROLE_PERMISSIONS,
  PERMISSION_DENIED_REASON,
} from '@/types/auth'

/**
 * Проверяет, может ли пользователь с данной ролью выполнить действие.
 */
export function canDo(action: PermissionAction, role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].includes(action)
}

/**
 * Возвращает объект для использования в кнопках.
 * Поведение при отсутствии прав: элемент виден, но disabled + тултип с reason
 * (не скрываем кнопку — только задизейбливаем с подсказкой «Нет доступа» / PERMISSION_DENIED_REASON).
 */
export function usePermissionProps(
  action: PermissionAction,
  role: UserRole,
): { allowed: boolean; reason: string } {
  const allowed = canDo(action, role)
  return {
    allowed,
    reason: allowed ? '' : PERMISSION_DENIED_REASON[action],
  }
}

/** Ярлык: минимальная роль для отображения в UI */
export const ROLE_LABEL: Record<UserRole, string> = {
  owner: 'Собственник',
  director: 'Директор',
  rop: 'РОП',
  marketer: 'Маркетолог',
  manager: 'Менеджер',
}

/** Цвет бейджа роли */
export const ROLE_COLOR: Record<UserRole, string> = {
  owner: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  director: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  rop: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  marketer: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  manager: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
}

/** Подпись типа кабинета для маршрутизации и UI */
export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  agency: 'Агентство',
  developer: 'Застройщик',
  realtor: 'Риэлтор',
  internal: 'Внутренние сотрудники',
}
