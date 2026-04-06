import ModuleHub from '@/components/ModuleHub'
import { Wallet, BarChart3 } from 'lucide-react'

/**
 * Раздел 6.8 стартового ТЗ ALPHABASE.sale: Финансы — панель и отчёт.
 */
export default function FinanceHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Wallet size={32} color="#c9a84c" />}
      moduleName="Финансы"
      moduleDescription="Простой строгий финансовый контур: операции и отчётность (вёрстка под дальнейшее API)."
      sections={[
        {
          icon: <Wallet size={20} color="#c9a84c" />,
          title: 'Финансы',
          description: 'Панель управления: платежи, начисления, привязка к сделкам — табличный интерфейс.',
          route: '/dashboard/finance/panel',
        },
        {
          icon: <BarChart3 size={20} color="#c9a84c" />,
          title: 'Отчёт по финансам',
          description: 'Сводки и выгрузки по финансовому контуру агентства.',
          route: '/dashboard/finance/report',
        },
      ]}
    />
  )
}
