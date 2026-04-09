import { useMemo, useState } from 'react'
import { AlertTriangle, Bot, Filter, Sparkles, Target } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type Module = 'leads' | 'deals' | 'docs' | 'objects'
type Priority = 'Высокий' | 'Средний' | 'Низкий'

const MODULE_LABEL: Record<Module, string> = {
  leads: 'Лиды',
  deals: 'Сделки',
  docs: 'Документы',
  objects: 'Объекты',
}

const SCENARIOS: Array<{
  id: string
  name: string
  module: Module
  role: string
  priority: Priority
  enabled: boolean
  model: string
  runs7d: number
  tokens7d: number
  pii: boolean
}> = [
  { id: 'ai-1', name: 'AI-summary по сделке', module: 'deals', role: 'РОП/директор', priority: 'Высокий', enabled: true, model: 'gpt-4.1', runs7d: 142, tokens7d: 186000, pii: true },
  { id: 'ai-2', name: 'Подсказка следующего шага по лиду', module: 'leads', role: 'Менеджер', priority: 'Высокий', enabled: true, model: 'gpt-4.1-mini', runs7d: 520, tokens7d: 312000, pii: true },
  { id: 'ai-3', name: 'AI-сигнал риска по документам', module: 'docs', role: 'Юрист/РОП', priority: 'Средний', enabled: true, model: 'gpt-4.1', runs7d: 89, tokens7d: 98000, pii: false },
  { id: 'ai-4', name: 'Черновик ответа клиенту', module: 'leads', role: 'Менеджер', priority: 'Средний', enabled: true, model: 'gpt-4.1-mini', runs7d: 410, tokens7d: 205000, pii: true },
  { id: 'ai-5', name: 'Описание объекта для публикации', module: 'objects', role: 'Маркетолог', priority: 'Низкий', enabled: false, model: 'gpt-4.1-mini', runs7d: 0, tokens7d: 0, pii: false },
  { id: 'ai-6', name: 'Сводка по встрече (транскрипт)', module: 'deals', role: 'Менеджер', priority: 'Средний', enabled: true, model: 'gpt-4.1', runs7d: 64, tokens7d: 124000, pii: true },
]

const money = new Intl.NumberFormat('ru-RU')

export default function AiAutomationsPage() {
  const [moduleFilter, setModuleFilter] = useState<'all' | Module>('all')
  const [priority, setPriority] = useState<'all' | Priority>('all')
  const [enabledOnly, setEnabledOnly] = useState(false)
  const [piiOnly, setPiiOnly] = useState(false)

  const filtered = useMemo(() => {
    let rows = [...SCENARIOS]
    if (moduleFilter !== 'all') rows = rows.filter((s) => s.module === moduleFilter)
    if (priority !== 'all') rows = rows.filter((s) => s.priority === priority)
    if (enabledOnly) rows = rows.filter((s) => s.enabled)
    if (piiOnly) rows = rows.filter((s) => s.pii)
    return rows
  }, [enabledOnly, moduleFilter, piiOnly, priority])

  const kpi = useMemo(() => {
    const enabled = filtered.filter((s) => s.enabled).length
    const runs = filtered.reduce((a, s) => a + s.runs7d, 0)
    const tokens = filtered.reduce((a, s) => a + s.tokens7d, 0)
    const high = filtered.filter((s) => s.priority === 'Высокий' && s.enabled).length
    return { total: filtered.length, enabled, runs, tokens, high }
  }, [filtered])

  const reviewPii = useMemo(() => SCENARIOS.filter((s) => s.pii && s.enabled && s.runs7d > 200), [])

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">AI-автоматизации</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Сценарии подсказок и summary: модули, модели, нагрузка и чувствительные данные.
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value as 'all' | Module)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Модуль: все</option>
                <option value="leads">Лиды</option>
                <option value="deals">Сделки</option>
                <option value="docs">Документы</option>
                <option value="objects">Объекты</option>
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'all' | Priority)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Приоритет: все</option>
                <option value="Высокий">Высокий</option>
                <option value="Средний">Средний</option>
                <option value="Низкий">Низкий</option>
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]">
                <input type="checkbox" checked={enabledOnly} onChange={(e) => setEnabledOnly(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
                Только включённые
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]">
                <input type="checkbox" checked={piiOnly} onChange={(e) => setPiiOnly(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
                С ПДн в контексте
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">В выборке</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.total}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Включено</p>
              <p className="text-xl font-bold text-emerald-300">{kpi.enabled}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Запусков 7д</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{money.format(kpi.runs)}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Токенов 7д</p>
              <p className="text-xl font-bold text-amber-300">{money.format(kpi.tokens)}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Высокий приоритет</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.high}</p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Сценарии</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Сценарий</th>
                    <th className="px-2 py-2">Модуль</th>
                    <th className="px-2 py-2">Роли</th>
                    <th className="px-2 py-2">Модель</th>
                    <th className="px-2 py-2">Приоритет</th>
                    <th className="px-2 py-2">Статус</th>
                    <th className="px-2 py-2">7д запусков</th>
                    <th className="px-2 py-2">ПДн</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{s.name}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{MODULE_LABEL[s.module]}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{s.role}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{s.model}</td>
                      <td className="px-2 py-2">
                        <span className="inline-flex items-center gap-1 text-[color:var(--workspace-text)]">
                          <Target className="size-3.5 text-[color:var(--gold)]" />
                          {s.priority}
                        </span>
                      </td>
                      <td className={s.enabled ? 'px-2 py-2 text-emerald-300' : 'px-2 py-2 text-[color:var(--workspace-text-muted)]'}>
                        {s.enabled ? 'Вкл' : 'Выкл'}
                      </td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{money.format(s.runs7d)}</td>
                      <td className={s.pii ? 'px-2 py-2 text-amber-300' : 'px-2 py-2 text-[color:var(--workspace-text-muted)]'}>{s.pii ? 'Да' : 'Нет'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Контроль нагрузки и ПДн</h2>
            </div>
            <p className="mb-2 text-xs text-[color:var(--app-text-muted)]">Высокочастотные сценарии с персональными данными — проверить политики маскирования и лимиты.</p>
            <ul className="space-y-2">
              {reviewPii.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]"
                >
                  <Bot className="size-4 shrink-0 text-[color:var(--gold)]" />
                  {s.name} · {money.format(s.runs7d)} запусков/нед
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
