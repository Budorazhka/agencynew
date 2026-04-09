import { useMemo, useState } from 'react'
import { AlertTriangle, Clock3, Filter, Zap } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type TriggerModule = 'leads' | 'deals' | 'docs' | 'objects' | 'tasks'

const MODULE_LABEL: Record<TriggerModule, string> = {
  leads: 'Лиды',
  deals: 'Сделки',
  docs: 'Документы',
  objects: 'Объекты',
  tasks: 'Задачи',
}

const TRIGGERS: Array<{
  id: string
  name: string
  module: TriggerModule
  action: string
  sla: string
  active: boolean
  fires7d: number
  errors7d: number
}> = [
  { id: 'tr-1', name: 'Новый лид без назначения', module: 'leads', action: 'Создать задачу РОП', sla: '5 мин', active: true, fires7d: 38, errors7d: 0 },
  { id: 'tr-2', name: 'Просрочка документа', module: 'docs', action: 'Эскалация директору', sla: '1 час', active: true, fires7d: 12, errors7d: 1 },
  { id: 'tr-3', name: 'Объект без активности 14 дней', module: 'objects', action: 'Автозадача менеджеру', sla: '24 часа', active: true, fires7d: 22, errors7d: 0 },
  { id: 'tr-4', name: 'Сделка без этапа > 72ч', module: 'deals', action: 'Напоминание РОП', sla: '15 мин', active: true, fires7d: 15, errors7d: 0 },
  { id: 'tr-5', name: 'Истекает бронь первички', module: 'deals', action: 'Задача + пуш менеджеру', sla: '30 мин', active: true, fires7d: 9, errors7d: 2 },
  { id: 'tr-6', name: 'Повторный лид с того же телефона', module: 'leads', action: 'Объединить + уведомление', sla: '10 мин', active: false, fires7d: 0, errors7d: 0 },
  { id: 'tr-7', name: 'Задача просрочена', module: 'tasks', action: 'Эскалация на уровень выше', sla: '1 час', active: true, fires7d: 44, errors7d: 0 },
]

export default function AutomationTriggersPage() {
  const [moduleFilter, setModuleFilter] = useState<'all' | TriggerModule>('all')
  const [activeOnly, setActiveOnly] = useState(false)
  const [errorsOnly, setErrorsOnly] = useState(false)

  const filtered = useMemo(() => {
    let rows = [...TRIGGERS]
    if (moduleFilter !== 'all') rows = rows.filter((t) => t.module === moduleFilter)
    if (activeOnly) rows = rows.filter((t) => t.active)
    if (errorsOnly) rows = rows.filter((t) => t.errors7d > 0)
    return rows
  }, [activeOnly, errorsOnly, moduleFilter])

  const kpi = useMemo(() => {
    const active = filtered.filter((t) => t.active).length
    const fires = filtered.reduce((s, t) => s + t.fires7d, 0)
    const errors = filtered.reduce((s, t) => s + t.errors7d, 0)
    return { total: filtered.length, active, fires, errors }
  }, [filtered])

  const noisy = useMemo(() => TRIGGERS.filter((t) => t.active && t.fires7d > 25).sort((a, b) => b.fires7d - a.fires7d), [])

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Автозадачи и триггеры</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Правила запуска: модуль, действие, SLA и срабатывания за неделю.
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value as 'all' | TriggerModule)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Модуль: все</option>
                <option value="leads">Лиды</option>
                <option value="deals">Сделки</option>
                <option value="docs">Документы</option>
                <option value="objects">Объекты</option>
                <option value="tasks">Задачи</option>
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]">
                <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
                Только активные
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]">
                <input type="checkbox" checked={errorsOnly} onChange={(e) => setErrorsOnly(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
                Были ошибки за 7д
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">В выборке</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.total}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Активных</p>
              <p className="text-xl font-bold text-emerald-300">{kpi.active}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Срабатываний 7д</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.fires}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Ошибок 7д</p>
              <p className={kpi.errors > 0 ? 'text-xl font-bold text-amber-300' : 'text-xl font-bold text-[color:var(--workspace-text)]'}>{kpi.errors}</p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Реестр триггеров</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Событие</th>
                    <th className="px-2 py-2">Модуль</th>
                    <th className="px-2 py-2">Действие</th>
                    <th className="px-2 py-2">SLA</th>
                    <th className="px-2 py-2">Статус</th>
                    <th className="px-2 py-2">7д</th>
                    <th className="px-2 py-2">Ошибки</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{t.name}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{MODULE_LABEL[t.module]}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{t.action}</td>
                      <td className="px-2 py-2">
                        <span className="inline-flex items-center gap-1 text-[color:var(--workspace-text)]">
                          <Clock3 className="size-3.5 text-[color:var(--gold)]" />
                          {t.sla}
                        </span>
                      </td>
                      <td className={t.active ? 'px-2 py-2 text-emerald-300' : 'px-2 py-2 text-[color:var(--workspace-text-muted)]'}>
                        {t.active ? 'Активен' : 'Выкл'}
                      </td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{t.fires7d}</td>
                      <td className={t.errors7d > 0 ? 'px-2 py-2 text-amber-300' : 'px-2 py-2 text-[color:var(--workspace-text-muted)]'}>{t.errors7d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Ошибки и ретраи</h2>
              </div>
              <ul className="space-y-2">
                {TRIGGERS.filter((t) => t.errors7d > 0).map((t) => (
                  <li
                    key={t.id}
                    className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]"
                  >
                    {t.name} · ошибок: {t.errors7d}
                  </li>
                ))}
                {TRIGGERS.every((t) => t.errors7d === 0) && (
                  <p className="text-sm text-[color:var(--app-text-muted)]">Нет триггеров с ошибками в мок-данных.</p>
                )}
              </ul>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <Zap className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Высокая частота</h2>
              </div>
              <ul className="space-y-2">
                {noisy.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm"
                  >
                    <span className="text-[color:var(--workspace-text)]">{t.name}</span>
                    <span className="text-blue-300">{t.fires7d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
