import ModuleHub from '@/components/ModuleHub'
import { Users, Radio, FileBarChart, LineChart, LayoutGrid, AlertCircle } from 'lucide-react'

/**
 * Раздел 6.3 стартового ТЗ ALPHABASE.sale: Лиды.
 * Вход из rail — сюда; канбан/покер — рабочая поверхность рядом с пунктами ТЗ.
 */
export default function LeadsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Users size={32} color="#c9a84c" />}
      moduleName="Лиды"
      moduleDescription="Скорость, приоритет, распределение и контроль обработки входящих обращений."
      sections={[
        {
          icon: <LayoutGrid size={20} color="#c9a84c" />,
          title: 'Панель: распределение лидов',
          description: 'Покерный стол: очередь, статусы и квалификация (маршрут ТЗ с режимом распределения).',
          route: '/dashboard/leads/poker?distribution=1',
        },
        {
          icon: <AlertCircle size={20} color="#f87171" />,
          title: 'Лиды с нарушением',
          description: 'Покерный стол с фильтром: просроченные задачи по лидам (SLA).',
          route: '/dashboard/leads/poker?violations=1',
        },
        {
          icon: <Radio size={20} color="#c9a84c" />,
          title: 'Источники лидов',
          description: 'Каналы, UTM, качество и объём по источникам.',
          route: '/dashboard/leads/sources',
        },
        {
          icon: <FileBarChart size={20} color="#c9a84c" />,
          title: 'Отчёт: общий отчёт по лидам',
          description: 'Сводная воронка и конверсии по лидам.',
          route: '/dashboard/leads/report/general',
        },
        {
          icon: <LineChart size={20} color="#c9a84c" />,
          title: 'Отчёт: маркетинговый отчёт по лидам',
          description: 'Эффективность рекламных и маркетинговых каналов.',
          route: '/dashboard/leads/report/marketing',
        },
      ]}
    />
  )
}
