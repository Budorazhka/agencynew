/** События календаря (мок) — общие для полной страницы и виджета на рабочем столе */

export interface CalEvent {
  id: string
  date: string
  time: string
  type: 'showing' | 'meeting' | 'call' | 'signing'
  title: string
  client?: string
  location?: string
  agentId: string
  agentName: string
  dealId?: string
}

const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const today = new Date()

export const CALENDAR_EVENTS_MOCK: CalEvent[] = [
  {
    id: 'ev-1',
    date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate())),
    time: '11:00',
    type: 'showing',
    title: 'Показ ЖК Олимп, корп. 3',
    client: 'Иванов А.В.',
    location: 'ЖК Олимп, корп. 3',
    agentId: 'lm-1',
    agentName: 'Анна Первичкина',
    dealId: 'deal-1',
  },
  {
    id: 'ev-2',
    date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate())),
    time: '14:30',
    type: 'meeting',
    title: 'Встреча: переговоры по цене',
    client: 'Петров И.С.',
    location: 'Офис Садовая',
    agentId: 'lm-1',
    agentName: 'Анна Первичкина',
    dealId: 'deal-2',
  },
  {
    id: 'ev-3',
    date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)),
    time: '10:00',
    type: 'signing',
    title: 'Подписание договора задатка',
    client: 'Фролов Д.А.',
    location: 'Офис Садовая',
    agentId: 'lm-1',
    agentName: 'Анна Первичкина',
    dealId: 'deal-3',
  },
  {
    id: 'ev-4',
    date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
    time: '16:00',
    type: 'showing',
    title: 'Показ квартиры на Садовой',
    client: 'Кузнецова Н.В.',
    location: 'ул. Садовая, 12',
    agentId: 'u3',
    agentName: 'Дмитрий Коваль',
  },
  {
    id: 'ev-5',
    date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)),
    time: '09:30',
    type: 'call',
    title: 'Звонок: квалификация',
    client: 'Белова О.Н.',
    agentId: 'u3',
    agentName: 'Дмитрий Коваль',
  },
]
