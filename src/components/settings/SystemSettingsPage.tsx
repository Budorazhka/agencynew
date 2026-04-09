import { useMemo, useState } from 'react'
import { AlertTriangle, Database, Filter, Link2, Server, Shield } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type IntStatus = 'ok' | 'pending' | 'error'

const ITEMS: Array<{ key: string; value: string; category: 'org' | 'locale' | 'security' }> = [
  { key: 'Профиль агентства', value: 'ALPHABASE.sale Agency', category: 'org' },
  { key: 'Регион по умолчанию', value: 'Тбилиси', category: 'locale' },
  { key: 'Часовой пояс', value: 'UTC+4', category: 'locale' },
  { key: 'Язык интерфейса', value: 'Русский', category: 'locale' },
  { key: 'Политика хранения логов', value: '90 дней', category: 'security' },
  { key: '2FA для админов', value: 'Обязательна', category: 'security' },
]

const INTEGRATIONS: Array<{ id: string; name: string; status: IntStatus; lastSync: string; env: 'prod' | 'sandbox' }> = [
  { id: 'int-1', name: 'CRM API', status: 'ok', lastSync: '2026-04-08 09:12', env: 'prod' },
  { id: 'int-2', name: 'Телефония', status: 'pending', lastSync: '—', env: 'sandbox' },
  { id: 'int-3', name: 'Подписание документов', status: 'pending', lastSync: '—', env: 'sandbox' },
  { id: 'int-4', name: 'Почта (SMTP)', status: 'ok', lastSync: '2026-04-08 08:40', env: 'prod' },
  { id: 'int-5', name: 'Платёжный шлюз', status: 'error', lastSync: '2026-04-07 22:01', env: 'prod' },
]

const STATUS_LABEL: Record<IntStatus, string> = {
  ok: 'Подключено',
  pending: 'В очереди',
  error: 'Ошибка',
}

export default function SystemSettingsPage() {
  const [category, setCategory] = useState<'all' | 'org' | 'locale' | 'security'>('all')
  const [intFilter, setIntFilter] = useState<'all' | IntStatus>('all')

  const filteredItems = useMemo(() => {
    if (category === 'all') return ITEMS
    return ITEMS.filter((i) => i.category === category)
  }, [category])

  const filteredInt = useMemo(() => {
    if (intFilter === 'all') return INTEGRATIONS
    return INTEGRATIONS.filter((i) => i.status === intFilter)
  }, [intFilter])

  const kpi = useMemo(() => {
    const ok = INTEGRATIONS.filter((i) => i.status === 'ok').length
    const pend = INTEGRATIONS.filter((i) => i.status === 'pending').length
    const err = INTEGRATIONS.filter((i) => i.status === 'error').length
    return { ok, pend, err, params: ITEMS.length }
  }, [])

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Настройки системы</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Параметры агентства, безопасность и статусы интеграций.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)]/80 px-3 py-2 text-xs text-[color:var(--workspace-text-muted)]">
            <span className="font-semibold text-[color:var(--theme-accent-heading)]">Среда:</span> production · критичные изменения требуют роли владельца.
          </div>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Параметров</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.params}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Интеграции ок</p>
              <p className="text-xl font-bold text-emerald-300">{kpi.ok}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">В очереди</p>
              <p className="text-xl font-bold text-amber-300">{kpi.pend}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">С ошибкой</p>
              <p className="text-xl font-bold text-red-300">{kpi.err}</p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Параметры: все группы</option>
                <option value="org">Организация</option>
                <option value="locale">Локаль</option>
                <option value="security">Безопасность</option>
              </select>
              <select
                value={intFilter}
                onChange={(e) => setIntFilter(e.target.value as 'all' | IntStatus)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Интеграции: все статусы</option>
                <option value="ok">Подключено</option>
                <option value="pending">В очереди</option>
                <option value="error">Ошибка</option>
              </select>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-3 flex items-center gap-2">
                <Server className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Базовые параметры</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                      <th className="px-2 py-2">Параметр</th>
                      <th className="px-2 py-2">Значение</th>
                      <th className="px-2 py-2">Группа</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.key} className="border-b border-[color:var(--workspace-row-border)]">
                        <td className="px-2 py-2 text-xs text-[color:var(--app-text-subtle)]">{item.key}</td>
                        <td className="px-2 py-2 font-semibold text-[color:var(--workspace-text)]">{item.value}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">
                          {item.category === 'org' ? 'Орг.' : item.category === 'locale' ? 'Локаль' : 'Безопасн.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-3 flex items-center gap-2">
                <Link2 className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Интеграции</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                      <th className="px-2 py-2">Сервис</th>
                      <th className="px-2 py-2">Статус</th>
                      <th className="px-2 py-2">Среда</th>
                      <th className="px-2 py-2">Синхр.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInt.map((item) => (
                      <tr key={item.id} className="border-b border-[color:var(--workspace-row-border)]">
                        <td className="px-2 py-2 font-semibold text-[color:var(--workspace-text)]">{item.name}</td>
                        <td className="px-2 py-2">
                          <span
                            className={
                              item.status === 'ok'
                                ? 'text-emerald-300'
                                : item.status === 'error'
                                  ? 'text-red-300'
                                  : 'text-amber-300'
                            }
                          >
                            {STATUS_LABEL[item.status]}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{item.env === 'prod' ? 'Prod' : 'Sandbox'}</td>
                        <td className="px-2 py-2 text-xs text-[color:var(--workspace-text-muted)]">{item.lastSync}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Требуют внимания</h2>
            </div>
            <ul className="space-y-2">
              {INTEGRATIONS.filter((i) => i.status !== 'ok').map((i) => (
                <li
                  key={i.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]"
                >
                  <Database className="size-3.5 text-[color:var(--gold)]" />
                  {i.name} — {STATUS_LABEL[i.status]}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-2 flex items-center gap-2">
              <Shield className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Ключи API (заглушка UI)</h2>
            </div>
            <p className="text-xs text-[color:var(--app-text-muted)]">Отображение без значений секретов — только маски и срок ротации.</p>
            <div className="mt-2 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 font-mono text-xs text-[color:var(--workspace-text-muted)]">
              crm_primary · ••••••••••last4 A7F2 · ротация 2026-07-01
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
