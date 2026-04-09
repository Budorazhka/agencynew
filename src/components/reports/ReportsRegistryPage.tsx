import { Link } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  CircleDollarSign,
  Network,
  UserRound,
  Users,
} from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type ReportCard = {
  title: string
  description: string
  route: string
}

type ReportGroup = {
  title: string
  icon: React.ReactNode
  cards: ReportCard[]
}

const REPORT_GROUPS: ReportGroup[] = [
  {
    title: 'Лиды',
    icon: <Users className="size-4 text-[color:var(--gold)]" />,
    cards: [
      {
        title: 'Общий отчет по лидам',
        description: 'Состояние входящего потока, SLA и конверсия.',
        route: '/dashboard/leads/report/general',
      },
      {
        title: 'Маркетинговый отчет по лидам',
        description: 'Каналы, CPL, качество и результативность трафика.',
        route: '/dashboard/leads/report/marketing',
      },
    ],
  },
  {
    title: 'CRM',
    icon: <BarChart3 className="size-4 text-[color:var(--gold)]" />,
    cards: [
      {
        title: 'Отчет по сделкам',
        description: 'Этапы, риски, закрытые и сорванные сделки.',
        route: '/dashboard/deals/report',
      },
      {
        title: 'Отчет по менеджеру',
        description: 'Личная результативность сотрудника и его активность.',
        route: '/dashboard/reports/manager',
      },
      {
        title: 'Отчет по команде',
        description: 'Сводная командная результативность и выполнение планов.',
        route: '/dashboard/reports/team',
      },
    ],
  },
  {
    title: 'Объекты',
    icon: <Building2 className="size-4 text-[color:var(--gold)]" />,
    cards: [
      {
        title: 'Отчет по объектам',
        description: 'Качество базы, активность и проблемные объекты.',
        route: '/dashboard/objects/report',
      },
    ],
  },
  {
    title: 'MLS',
    icon: <Network className="size-4 text-[color:var(--gold)]" />,
    cards: [
      {
        title: 'Отчет по MLS',
        description: 'Объекты, партнеры, сеть и совместные сделки.',
        route: '/dashboard/mls/reports/summary',
      },
      {
        title: 'Отчет о работе MLS-партнеров по вторичному рынку',
        description: 'Эффективность партнеров и активность по вторичке.',
        route: '/dashboard/mls/reports/partners-secondary',
      },
      {
        title: 'Отчет о работе MLS-партнеров по аренде',
        description: 'Показатели арендного MLS-контура.',
        route: '/dashboard/mls/reports/partners-rent',
      },
    ],
  },
  {
    title: 'Финансы',
    icon: <CircleDollarSign className="size-4 text-[color:var(--gold)]" />,
    cards: [
      {
        title: 'Отчет по финансам',
        description: 'Доходы, расходы, комиссии и выплаты.',
        route: '/dashboard/finance/report',
      },
    ],
  },
  {
    title: 'Сообщество',
    icon: <UserRound className="size-4 text-[color:var(--gold)]" />,
    cards: [
      {
        title: 'Отчет о работе партнеров по первичному рынку',
        description: 'Регистрации, брони и сделки партнерской сети первички.',
        route: '/dashboard/new-buildings/report-partners',
      },
      {
        title: 'Отчет о формировании сообщества партнеров',
        description: 'Рост, вовлеченность и активность экосистемы.',
        route: '/dashboard/community/report',
      },
    ],
  },
]

export default function ReportsRegistryPage() {
  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="w-full space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Реестр отчетов</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Единая витрина отчетности ALPHABASE.sale по разделам платформы.
            </p>
          </div>

          {REPORT_GROUPS.map((group) => (
            <section key={group.title} className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-3 flex items-center gap-2">
                {group.icon}
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">{group.title}</h2>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                {group.cards.map((card) => (
                  <Link
                    key={card.title}
                    to={card.route}
                    className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 transition-colors hover:border-[color:var(--gold)]/35"
                  >
                    <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{card.title}</p>
                    <p className="mt-1 text-xs text-[color:var(--workspace-text-muted)]">{card.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
