/**
 * Типы для подразделения «Контроль лидов»:
 * портальный пользователь (Директор/РОП), лид, облако, правило раздачи, менеджеры и пользователи с доступом к разделу (по email ЛК).
 */

/** Роль доступа к админке лидов */
export type LeadAdminRole = 'director' | 'rop'

/** Пользователь портала с доступом к разделу лидов */
export interface PortalUser {
  id: string
  email: string
  displayName: string
  /** Роль в админке лидов: директор (полный доступ) или РОП (ограниченный) */
  leadAdminRole: LeadAdminRole
}

/** Четыре типа аккаунтов/очередей для обработки лидов */
export type LeadSource =
  | 'primary'   // Первичка
  | 'secondary' // Вторичка
  | 'rent'      // Аренда
  | 'ad_campaigns' // Лиды с рекламными компаниями

/** Стадия лида в воронке (совместимо с FunnelStage) */
export type LeadStageId = string

export interface LeadStage {
  id: LeadStageId
  name: string
  order: number
}

/** Один лид в облаке */
export interface Lead {
  id: string
  source: LeadSource
  stageId: LeadStageId
  /** ID менеджера, которому назначен лид (если уже распределён) */
  managerId: string | null
  /** Дата поступления в облако (ISO) */
  createdAt: string
  /** Произвольный источник поступления: форма, реклама, партнёр */
  channel?: 'form' | 'ad' | 'partner' | 'other'
  /** Отображаемое имя (для карточного стола и поиска) */
  name?: string
  /** Дата последнего обновления / последней активности (ISO) */
  updatedAt?: string
  /** Назначена ли по лиду хотя бы одна задача — для метрики качества и подсветки карточки */
  hasTask?: boolean
  /** Есть просроченная задача по этому лиду */
  taskOverdue?: boolean
  /** Оценка потенциальной комиссии по сделке (USD) */
  commissionUsd?: number
  /** ID рекламной кампании (только для source === 'ad_campaigns') */
  campaignId?: string
}

/** Единое облако лидов — пул по всем типам */
export type LeadPool = Lead[]

/** Тип правила раздачи */
export type DistributionRuleType = 'round_robin' | 'by_load' | 'manual'

export interface DistributionRule {
  type: DistributionRuleType
  /** Для round_robin: порядок менеджеров по source (опционально). Для by_load: порог загрузки. */
  params?: Record<string, unknown>
}

/** ID пользователя-менеджера, который в рукопашном режиме распределяет лиды */
export type ManualDistributorId = string | null

/** Менеджер по лидам (аккаунт для обработки лидов) */
export interface LeadManager {
  id: string
  login: string
  name: string
  /** К каким очередям привязан (первичка, вторичка, аренда, рекламные кампании) */
  sourceTypes: LeadSource[]
  /** Недоступен (отпуск/больничный) */
  isUnavailable?: boolean
  /** ID подменного дежурного на время недоступности */
  substituteId?: string | null
}

/** Пользователь с доступом к разделу «Контроль лидов» — задаётся по email личного кабинета */
export interface LeadPartnerByEmail {
  id: string
  email: string
  /** К какой очереди привязан */
  sourceType: LeadSource
  /** Опционально город */
  cityId?: string
}

// ─── История лида ────────────────────────────────────────────────────────────

/** Тип события в истории лида */
export type LeadEventType =
  | 'created'             // Лид создан
  | 'stage_change'        // Смена стадии
  | 'comment'             // Комментарий менеджера
  | 'buyer_registration'  // Регистрация покупателя (акт осмотра)
  | 'call'                // Звонок (ручная отметка)
  | 'task'                // Базовое событие задачи (оставим для обратной совместимости)
  | 'task_created'        // Задача поставлена
  | 'task_completed'      // Задача выполна/закрыта
  | 'overdue'             // Просрочка задачи или этапа
  | 'assign'              // Смена менеджера

/** Кто поставил задачу (только РОП, директор, собственник) */
export type TaskSetByRole = 'rop' | 'director' | 'owner'

/** Одна запись в истории лида */
export interface LeadEvent {
  id: string
  type: LeadEventType
  timestamp: string
  authorId: string
  authorName: string
  payload: {
    comment?: string
    fromStage?: string
    fromStageName?: string
    toStage?: string
    toStageName?: string
    registrationData?: BuyerRegistration
    managerId?: string
    managerName?: string
    duration?: number // Длительность звонка (в секундах)
    deadline?: string // ISO дата для task_created или overdue
    taskName?: string // Название/описание задачи
    /** Кто поставил задачу (РОП/директор/собственник) — для отображения «Задача поставлена: РОП Иванов» */
    setByRole?: TaskSetByRole
    /** Матрица Эйзенхауэра: срочность и важность */
    eisenhowerUrgent?: boolean
    eisenhowerImportant?: boolean
  }
}

/** Акт осмотра / регистрация покупателя */
export interface BuyerRegistration {
  id: string
  clientName: string
  projectName: string    // ЖК / объект
  managerName: string
  developerName: string
  date: string           // ISO дата
}

/** Расширенный лид с историей (используется в панели деталей) */
export interface LeadWithHistory extends Lead {
  history: LeadEvent[]
  registrations: BuyerRegistration[]
}
