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
  /** Выполнение плана дня / недели (%) */
  dayPlanPercent: number
  weekPlanPercent: number
  /** Статус дневного плана для подписи */
  dayPlanStatus: 'done' | 'on_track' | 'at_risk'
  /** Ключевые активности: факт / план */
  activityKpis: { label: string; current: number; plan: number }[]
  /** Краткая подсказка по игровой механике / бонусам */
  gamificationHint: string
}

/** Неделя активности + серия (виджет «как в Duolingo») */
export interface DeskStreakWeekSlot {
  weekday: string
  /** Был заход / цель дня выполнена */
  active: boolean
  /** Текущий день */
  isToday?: boolean
}

export interface DeskStreakMock {
  /** Текущая серия дней подряд */
  currentStreak: number
  /** Лучшая серия (рекорд) */
  bestStreak: number
  slots: DeskStreakWeekSlot[]
  /** «Опыт» за сегодня — мини-цель дня */
  xpToday: { current: number; goal: number }
  /** Короткий драйв под огоньками */
  streakTagline: string
}

export const HOME_STREAK_MOCK: DeskStreakMock = {
  currentStreak: 14,
  bestStreak: 28,
  slots: [
    { weekday: 'пн', active: true },
    { weekday: 'вт', active: true },
    { weekday: 'ср', active: true },
    { weekday: 'чт', active: true },
    { weekday: 'пт', active: false, isToday: true },
    { weekday: 'сб', active: false },
    { weekday: 'вс', active: false },
  ],
  xpToday: { current: 32, goal: 50 },
  streakTagline: 'Не теряйте серию — выполните хотя бы одно целевое действие сегодня.',
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
  dayPlanPercent: 62,
  weekPlanPercent: 74,
  dayPlanStatus: 'on_track',
  activityKpis: [
    { label: 'Обработано лидов', current: 5, plan: 8 },
    { label: 'Звонки', current: 12, plan: 15 },
    { label: 'Касания', current: 18, plan: 22 },
    { label: 'Встречи', current: 2, plan: 3 },
    { label: 'Показы', current: 1, plan: 2 },
    { label: 'Закрыто задач', current: 4, plan: 6 },
  ],
  gamificationHint: '',
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
