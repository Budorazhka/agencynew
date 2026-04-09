import { useMemo, useState } from 'react'
import { Building2, Users, Workflow } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type Branch = {
  id: string
  name: string
  city: string
  teams: string[]
  employees: number
  manager: string
}

const BRANCHES: Branch[] = [
  {
    id: 'br-1',
    name: 'Центральный офис',
    city: 'Тбилиси',
    teams: ['Первичный рынок', 'CRM-отдел'],
    employees: 24,
    manager: 'Анна Смирнова',
  },
  {
    id: 'br-2',
    name: 'Филиал Батуми',
    city: 'Батуми',
    teams: ['Вторичный рынок', 'Аренда'],
    employees: 14,
    manager: 'Дмитрий Волков',
  },
  {
    id: 'br-3',
    name: 'Филиал Кутаиси',
    city: 'Кутаиси',
    teams: ['Партнерская сеть'],
    employees: 7,
    manager: 'Лариса Морозова',
  },
]

export default function BranchesPage() {
  const [activeId, setActiveId] = useState(BRANCHES[0]?.id ?? '')
  const active = useMemo(() => BRANCHES.find((b) => b.id === activeId) ?? BRANCHES[0], [activeId])

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Филиалы</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Реестр филиалов, структура команд и базовая карточка филиала.
            </p>
          </div>

          <div className="grid min-h-[440px] grid-cols-1 gap-3 lg:grid-cols-[1.1fr_1fr]">
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <Building2 className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Список филиалов</h2>
              </div>
              <div className="space-y-2">
                {BRANCHES.map((branch) => (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setActiveId(branch.id)}
                    className="w-full rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-left transition-colors hover:border-[color:var(--gold)]/35"
                  >
                    <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{branch.name}</p>
                    <p className="text-xs text-[color:var(--workspace-text-muted)]">{branch.city}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <Workflow className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Карточка филиала</h2>
              </div>
              {active ? (
                <div className="space-y-3">
                  <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-3">
                    <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{active.name}</p>
                    <p className="mt-1 text-xs text-[color:var(--workspace-text-muted)]">{active.city}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
                      <p className="text-[11px] text-[color:var(--app-text-subtle)]">Руководитель</p>
                      <p className="mt-1 text-sm font-semibold text-[color:var(--workspace-text)]">{active.manager}</p>
                    </div>
                    <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
                      <p className="flex items-center gap-1 text-[11px] text-[color:var(--app-text-subtle)]">
                        <Users className="size-3.5" />
                        Сотрудники
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[color:var(--workspace-text)]">{active.employees}</p>
                    </div>
                  </div>

                  <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
                    <p className="text-[11px] text-[color:var(--app-text-subtle)]">Команды филиала</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {active.teams.map((team) => (
                        <span
                          key={team}
                          className="rounded-full border border-[var(--hub-card-border-hover)] px-2 py-0.5 text-xs text-[color:var(--theme-accent-heading)]"
                        >
                          {team}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
