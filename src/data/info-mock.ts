export type NewsCategory = 'company' | 'market' | 'developer' | 'regulation'

export interface NewsArticle {
  id: string
  title: string
  body: string
  category: NewsCategory
  author: string
  publishedAt: string
  pinned?: boolean
  emoji: string
}

export interface Reminder {
  id: string
  title: string
  body?: string
  dueAt: string
  done: boolean
  priority: 'low' | 'medium' | 'high'
  entityType?: 'deal' | 'client' | 'task' | 'booking'
  entityLabel?: string
}

export const NEWS_MOCK: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Ключевая ставка снижена до 18% — влияние на ипотеку',
    body: 'ЦБ РФ принял решение снизить ключевую ставку с 19% до 18%. Это повлечёт снижение ипотечных ставок в ведущих банках на 0,5–1 п.п. в течение ближайших 2–4 недель. Ожидается рост спроса на вторичном рынке.',
    category: 'market',
    author: 'Аналитический отдел',
    publishedAt: '2026-03-21',
    pinned: true,
    emoji: '📉',
  },
  {
    id: 'news-2',
    title: 'Новый ЖК «Солнечный берег» открыт для бронирования',
    body: 'Застройщик ГК «РосСтрой» открыл продажи в ЖК «Солнечный берег» (Москва, СЗАО). Доступны 1–3к квартиры от $7.2M. Срок сдачи — Q3 2028. В системе добавлено 48 объектов в каталог.',
    category: 'developer',
    author: 'Отдел первички',
    publishedAt: '2026-03-20',
    emoji: '🏗️',
  },
  {
    id: 'news-3',
    title: 'Обновление регламента работы с лидами',
    body: 'С 25 марта вводится обязательная квалификация лида в течение 30 минут с момента поступления. Менеджеры, нарушающие SLA систематически (>3 раз в неделю), направляются на беседу с РОПом. Обновлённый регламент в LMS.',
    category: 'company',
    author: 'Директор Марина Петрова',
    publishedAt: '2026-03-19',
    pinned: true,
    emoji: '📋',
  },
  {
    id: 'news-4',
    title: 'Изменения в законодательстве: эскроу-счета с 2026',
    body: 'С 1 апреля 2026 расширяется обязательное применение эскроу-счетов. Все новостройки без исключения обязаны использовать механизм проектного финансирования. Юридический отдел подготовил памятку для агентов.',
    category: 'regulation',
    author: 'Юридический отдел',
    publishedAt: '2026-03-18',
    emoji: '⚖️',
  },
  {
    id: 'news-5',
    title: 'Итоги февраля: рекорд по сделкам в СПб',
    body: 'Санкт-Петербургский офис закрыл 18 сделок за февраль — лучший результат за 2 года. Топ-менеджер: Наталья Громова (5 сделок). Суммарная комиссия по офису — $2.1M. Поздравляем команду!',
    category: 'company',
    author: 'РОП — СПб, Сергей Литвинов',
    publishedAt: '2026-03-05',
    emoji: '🏆',
  },
  {
    id: 'news-6',
    title: 'Семинар по работе с возражениями — 28 марта',
    body: 'Приглашаем всех менеджеров на внутренний семинар «Работа с возражениями покупателей первички». Ведёт тренер Андрей Колесов. Формат — онлайн, 2 часа. Регистрация в LMS обязательна.',
    category: 'company',
    author: 'HR-отдел',
    publishedAt: '2026-03-15',
    emoji: '🎓',
  },
]

export const REMINDERS_MOCK: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Перезвонить Иванову по сделке',
    body: 'Клиент ждёт ответ по задатку — уточнить готовность документов',
    dueAt: '2026-03-22T11:00',
    done: false,
    priority: 'high',
    entityType: 'deal',
    entityLabel: 'Иванов А. · Мясницкая 22',
  },
  {
    id: 'rem-2',
    title: 'Истекает бронь по квартире №47',
    body: 'ЖК Солнечный берег, кв. 47 — срок брони заканчивается через 6 часов',
    dueAt: '2026-03-22T18:00',
    done: false,
    priority: 'high',
    entityType: 'booking',
    entityLabel: 'ЖК Солнечный берег · кв. 47',
  },
  {
    id: 'rem-3',
    title: 'Отправить КП клиенту Петровой',
    dueAt: '2026-03-22T14:00',
    done: false,
    priority: 'medium',
    entityType: 'client',
    entityLabel: 'Петрова М.И.',
  },
  {
    id: 'rem-4',
    title: 'Подготовить отчёт по сделкам за март',
    dueAt: '2026-03-31T18:00',
    done: false,
    priority: 'medium',
  },
  {
    id: 'rem-5',
    title: 'Встреча с партнёром — агентство НовоСтрой',
    body: 'Обсудить совместные показы на первичке в апреле',
    dueAt: '2026-03-25T10:00',
    done: false,
    priority: 'low',
  },
  {
    id: 'rem-6',
    title: 'Пройти тест по LMS — Скрипты продаж',
    dueAt: '2026-03-28T23:59',
    done: true,
    priority: 'low',
  },
]
