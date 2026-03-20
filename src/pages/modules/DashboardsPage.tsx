import ModuleHub from '@/components/ModuleHub'
import { BarChart2, TrendingUp, ZoomIn, Map, LayoutDashboard } from 'lucide-react'

export default function DashboardsPage() {
  return (
    <ModuleHub
      moduleIcon={<LayoutDashboard size={32} color="#c9a84c" />}
      moduleName="Дашборды"
      moduleDescription="Ролевая аналитика, KPI-виджеты, drill-down и сводные графики."
      sections={[
        {
          icon: <LayoutDashboard size={20} color="#c9a84c" />,
          title: 'Ролевой главный экран',
          description: 'Состав виджетов автоматически подстраивается под роль пользователя.',
          route: '/dashboard/overview',
        },
        {
          icon: <BarChart2 size={20} color="#c9a84c" />,
          title: 'KPI-виджеты',
          description: 'Продажи, маркетинг, финансы, SLA и активность команды.',
          route: '/dashboard/overview',
        },
        {
          icon: <ZoomIn size={20} color="#c9a84c" />,
          title: 'Drill-down аналитика',
          description: 'Переход из карточки показателя в детализацию по отделу, агенту или источнику.',
          route: '/dashboard/overview',
        },
        {
          icon: <Map size={20} color="#c9a84c" />,
          title: 'Сводные графики и тепловые карты',
          description: 'Динамика, рентабельность и загрузка команды в наглядном виде.',
          route: '/dashboard/overview',
        },
        {
          icon: <TrendingUp size={20} color="#c9a84c" />,
          title: 'Мои KPI',
          description: 'Личные показатели: выполнение плана, активность, конверсия.',
          route: '/dashboard/overview',
        },
      ]}
    />
  )
}
