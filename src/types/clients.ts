/** Типы для модуля Клиенты */

export type ClientType = 'individual' | 'company'

export type ClientSegment =
  | 'active'       // Активный клиент
  | 'golden'       // Золотой фонд (совершил сделку)
  | 'deferred'     // Отложенный спрос
  | 'archived'     // Архив

/** Тип запроса клиента */
export type ClientRequestType = 'primary' | 'secondary' | 'rent' | 'commercial'

export const CLIENT_REQUEST_TYPE_LABEL: Record<ClientRequestType, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
  rent: 'Аренда',
  commercial: 'Коммерция',
}

export interface Client {
  id: string
  type: ClientType
  /** Полное имя (физлицо) или название компании */
  name: string
  /** Краткое имя для отображения */
  displayName: string
  /** Для физлица — имя (если заведено отдельно от поля name) */
  firstName?: string
  /** Для физлица — фамилия */
  lastName?: string
  phone: string
  email?: string
  /** ID ответственного менеджера */
  assignedAgentId: string
  assignedAgentName: string
  segment: ClientSegment
  /** Источник: откуда пришёл */
  source: string
  /** Дата создания записи */
  createdAt: string
  /** Дата последнего контакта */
  lastContactAt?: string
  /** ID лида, из которого был конвертирован */
  convertedFromLeadId?: string
  /** Описание/заметки */
  notes?: string
  /** Интересы / запрос */
  interests?: string
  /** Ориентир бюджета (текст) */
  budget?: string
  /** Первичка / вторичка / аренда */
  requestType?: ClientRequestType
  /** Количество связанных сделок */
  dealsCount: number
  /** Количество связанных задач */
  tasksCount: number
}
