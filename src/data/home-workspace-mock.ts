/** Метрики «Мой прогресс» на рабочем столе (мок) */

export interface HomeProgressMetrics {
  /** План по выручке: факт / план, % */
  revenue: { currentLabel: string; planLabel: string; percent: number }
  /**
   * Движение по воронке от «Новый лид» к сделке (не в отказ):
   * объём этапов в сторону продажи / целевой охват
   */
  funnelProgress: { percent: number; subtitle: string }
  /** Лидов за сегодня */
  leadsToday: { count: number; plan: number }
}

export const HOME_PROGRESS_MOCK: HomeProgressMetrics = {
  revenue: {
    currentLabel: '$4.2M',
    planLabel: '$6M',
    percent: 70,
  },
  funnelProgress: {
    percent: 68,
    subtitle: 'от «Новый лид» к сделке (без отказов)',
  },
  leadsToday: {
    count: 5,
    plan: 8,
  },
}

export interface DashboardNotifPreview {
  id: string
  type: 'alert' | 'success' | 'info' | 'auto'
  title: string
  body: string
  time: string
}

export const DASHBOARD_NOTIFICATIONS_PREVIEW: DashboardNotifPreview[] = [
  {
    id: 'n1',
    type: 'alert',
    title: 'Просрочен SLA — лид без контакта',
    body: 'Иванов А.В. ждёт ответа уже 48 часов',
    time: '18 мин назад',
  },
  {
    id: 'n2',
    type: 'auto',
    title: 'Автозадача создана',
    body: 'Юрист: «Подготовить договор задатка» — Фролов Д.А.',
    time: '1 час назад',
  },
  {
    id: 'n3',
    type: 'alert',
    title: 'Бронь истекает через 12 часов',
    body: 'Фролов Д.А. — пр. Мира, 88.',
    time: '2 часа назад',
  },
  {
    id: 'n4',
    type: 'info',
    title: 'Клиент открыл подборку',
    body: 'Петров И.С. просматривал подборку 5 минут назад',
    time: '5 мин назад',
  },
]
