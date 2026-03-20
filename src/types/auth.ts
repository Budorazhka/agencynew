/**
 * Типы авторизации и ролевой модели платформы.
 * Иерархия: Собственник → Директор → РОП → Менеджер
 */

/** Роль пользователя в системе */
export type UserRole = 'owner' | 'director' | 'rop' | 'marketer' | 'manager'

/** Тип бизнес-аккаунта: четыре версии продукта — один вход, разные кабинеты */
export type AccountType = 'agency' | 'developer' | 'realtor' | 'internal'

/** Текущий авторизованный пользователь */
export interface CurrentUser {
  id: string
  name: string
  login: string
  role: UserRole
  accountType: AccountType
  companyId: string
  companyName: string
  avatarUrl?: string
}

/** Действия, доступность которых зависит от роли */
export type PermissionAction =
  | 'manage_team'           // Управление командой (добавить/удалить менеджера)
  | 'transfer_leads'        // Массовая передача лидов
  | 'change_distribution'   // Изменить правило раздачи лидов
  | 'view_all_leads'        // Видеть лиды всех менеджеров
  | 'view_network_analytics'// Аналитика всей сети
  | 'manage_partners'       // Управление партнёрами и городами
  | 'manage_mailings'       // Рассылки
  | 'export_data'           // Экспорт данных
  | 'add_lead_source'       // Добавить источник лидов
  | 'view_all_stages'       // Видеть все стадии воронки
  | 'set_substitute'        // Назначить подменного дежурного
  | 'view_lead_analytics'   // Аналитика лидов и рекламных кампаний
  | 'block_account'         // Блокировка аккаунтов сотрудников (только собственник)
  | 'manage_properties'     // Добавление, редактирование и удаление объектов недвижимости

/** Матрица прав: роль → список разрешённых действий */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  owner: [
    'manage_team',
    'transfer_leads',
    'change_distribution',
    'view_all_leads',
    'view_network_analytics',
    'manage_partners',
    'manage_mailings',
    'export_data',
    'add_lead_source',
    'view_all_stages',
    'set_substitute',
    'view_lead_analytics',
    'manage_properties',
    'block_account',
  ],
  director: [
    'manage_team',
    'transfer_leads',
    'change_distribution',
    'view_all_leads',
    'view_network_analytics',
    'manage_mailings',
    'export_data',
    'add_lead_source',
    'view_all_stages',
    'set_substitute',
    'view_lead_analytics',
    'manage_properties',
  ],
  rop: [
    'change_distribution',
    'view_all_leads',
    'view_all_stages',
    'set_substitute',
    'view_lead_analytics',
    'manage_properties',
  ],
  marketer: [
    'view_lead_analytics',
    'view_all_stages',
    'add_lead_source',
  ],
  manager: [
    'view_all_stages',
    'manage_properties',
  ],
}

/** Описания ограничений для тултипов */
export const PERMISSION_DENIED_REASON: Record<PermissionAction, string> = {
  manage_team: 'Доступно с уровня Директора',
  transfer_leads: 'Доступно с уровня Директора',
  change_distribution: 'Доступно с уровня РОПа',
  view_all_leads: 'Доступно с уровня РОПа',
  view_network_analytics: 'Доступно с уровня Директора',
  manage_partners: 'Только для Собственника',
  manage_mailings: 'Доступно с уровня Директора',
  export_data: 'Доступно с уровня Директора',
  add_lead_source: 'Доступно с уровня Директора',
  view_all_stages: 'Доступно всем',
  set_substitute: 'Доступно с уровня РОПа',
  view_lead_analytics: 'Доступно с уровня РОПа и для Маркетолога',
  block_account: 'Только для Собственника',
  manage_properties: 'Доступно с уровня Менеджера',
}
