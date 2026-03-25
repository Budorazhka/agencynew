/** Типы для модуля Задачи */

export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'overdue'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskEntityType = 'lead' | 'client' | 'deal' | 'property' | 'booking' | 'none'
export type TaskCategory = 'work' | 'personal'

export interface TaskSubtask {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  /** Кому назначена */
  assignedToId: string
  assignedToName: string
  /** Кто создал */
  createdByName: string
  /** Срок выполнения (дедлайн / окончание) */
  dueDate: string
  dueTime?: string
  /** Начало (планирование) */
  startDate?: string
  startTime?: string
  /** Рабочая / личная */
  taskCategory?: TaskCategory
  /** Метка цвета (#rrggbb или null) */
  colorHex?: string | null
  /** Напоминания: за сколько минут до начала */
  reminderOffsetsMinutes?: number[]
  subtasks?: TaskSubtask[]
  /** Имена прикреплённых файлов (демо, без загрузки на сервер) */
  attachmentFileNames?: string[]
  /** Привязка к сущности */
  entityType: TaskEntityType
  entityId?: string
  entityLabel?: string
  /** Автоматически создана триггером */
  isAutomatic: boolean
  /** Тип триггера если автоматическая */
  triggerType?: string
  createdAt: string
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending:     'Новая',
  in_progress: 'В работе',
  done:        'Выполнена',
  overdue:     'Просрочена',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low:      'Низкий',
  medium:   'Средний',
  high:     'Высокий',
  critical: 'Критичный',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low:      'rgba(255,255,255,0.4)',
  medium:   '#fb923c',
  high:     '#f87171',
  critical: '#e11d48',
}
