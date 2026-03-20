import ModuleHub from '@/components/ModuleHub'
import { Calendar, Users, Plus, RefreshCw, DoorOpen, CalendarDays } from 'lucide-react'

export default function CalendarPage() {
  return (
    <ModuleHub
      moduleIcon={<CalendarDays size={32} color="#c9a84c" />}
      moduleName="Календарь"
      moduleDescription="Личный и командный календарь: встречи, показы, звонки, синхронизация с Google/Outlook."
      sections={[
        {
          icon: <Calendar size={20} color="#c9a84c" />,
          title: 'Личный календарь',
          description: 'Встречи, показы, звонки и подписания.',
          route: '/dashboard/calendar/personal',
          badge: 'soon',
        },
        {
          icon: <Users size={20} color="#c9a84c" />,
          title: 'Командный обзор',
          description: 'Сводный календарь для руководителя по своей команде.',
          route: '/dashboard/calendar/team',
          badge: 'soon',
        },
        {
          icon: <Plus size={20} color="#c9a84c" />,
          title: 'Создание события',
          description: 'Дата, слот, место, участники, тип события.',
          route: '/dashboard/calendar/new',
          badge: 'soon',
        },
        {
          icon: <RefreshCw size={20} color="#c9a84c" />,
          title: 'Синхронизация',
          description: 'Google Calendar и Outlook для синхронизации событий.',
          route: '/dashboard/calendar/sync',
          badge: 'soon',
        },
        {
          icon: <DoorOpen size={20} color="#c9a84c" />,
          title: 'Бронирование ресурсов',
          description: 'Переговорные комнаты и иные общие ресурсы.',
          route: '/dashboard/calendar/resources',
          badge: 'soon',
        },
      ]}
    />
  )
}
