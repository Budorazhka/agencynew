import { useMemo, useState } from 'react'
import { AlertTriangle, CircleDollarSign, Filter, Home, Percent } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { NEW_BUILD_APARTMENTS_MOCK, NEW_BUILD_COMPLEXES_MOCK } from '@/data/bookings-catalog-mock'

type CommissionRule = {
  complexId: string
  partnerType: string
  commissionPercent: number
}

const FORM_SELECT_CLASS =
  "rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]"

const COMMISSIONS: CommissionRule[] = [
  { complexId: 'rc-olymp', partnerType: 'Агентство-партнёр', commissionPercent: 2.5 },
  { complexId: 'rc-olymp', partnerType: 'Внутренняя команда', commissionPercent: 3.1 },
  { complexId: 'rc-samolet', partnerType: 'Агентство-партнёр', commissionPercent: 2.2 },
  { complexId: 'rc-bunin', partnerType: 'Агентство-партнёр', commissionPercent: 2.8 },
]

export default function NewBuildingsObjectsCommissionsPage() {
  const [developer, setDeveloper] = useState<string>('all')
  const [noRulesOnly, setNoRulesOnly] = useState(false)

  const rows = useMemo(() => {
    return NEW_BUILD_COMPLEXES_MOCK.map((complex) => {
      const units = NEW_BUILD_APARTMENTS_MOCK.filter((u) => u.rcId === complex.id).length
      const rules = COMMISSIONS.filter((c) => c.complexId === complex.id)
      const avgPct =
        rules.length > 0 ? Math.round((rules.reduce((s, r) => s + r.commissionPercent, 0) / rules.length) * 10) / 10 : 0
      return { complex, units, rules, avgPct }
    })
  }, [])

  const developerOptions = useMemo(() => Array.from(new Set(NEW_BUILD_COMPLEXES_MOCK.map((c) => c.developerName))).sort(), [])

  const filtered = useMemo(() => {
    let list = [...rows]
    if (developer !== 'all') list = list.filter((r) => r.complex.developerName === developer)
    if (noRulesOnly) list = list.filter((r) => r.rules.length === 0)
    return list
  }, [developer, noRulesOnly, rows])

  const kpi = useMemo(() => {
    const totalUnits = filtered.reduce((s, r) => s + r.units, 0)
    const withRules = filtered.filter((r) => r.rules.length > 0).length
    const avgAcross =
      filtered.length > 0
        ? Math.round(
            (filtered.reduce((s, r) => s + (r.rules.length ? r.avgPct : 0), 0) / Math.max(1, filtered.filter((r) => r.rules.length).length)) * 10,
          ) / 10
        : 0
    return { totalUnits, withRules, avgAcross, projects: filtered.length }
  }, [filtered])

  const missingRules = useMemo(() => rows.filter((r) => r.rules.length === 0), [rows])

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Объекты и комиссии</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Проекты первички, объём юнитов и комиссионные ставки по типам партнёров.
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <select
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                className={FORM_SELECT_CLASS}
              >
                <option value="all">Девелопер: все</option>
                {developerOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]">
                <input
                  type="checkbox"
                  checked={noRulesOnly}
                  onChange={(e) => setNoRulesOnly(e.target.checked)}
                  className="size-4 appearance-none rounded border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] checked:border-[var(--gold)] checked:bg-[var(--gold)]"
                />
                Только без комиссионных правил
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Проектов в выборке</p>
              <p className="text-xl font-bold text-[color:var(--theme-accent-heading)]">{kpi.projects}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Юнитов</p>
              <p className="text-xl font-bold text-emerald-400">{kpi.totalUnits}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">С правилами</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.withRules}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Ср. % (где задано)</p>
              <p className="text-xl font-bold text-amber-300">{kpi.avgAcross}%</p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Home className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Реестр объектов первички</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Проект</th>
                    <th className="px-2 py-2">Девелопер</th>
                    <th className="px-2 py-2">Юниты</th>
                    <th className="px-2 py-2">Ср. %</th>
                    <th className="px-2 py-2">Комиссионные условия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.complex.id} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{row.complex.name}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{row.complex.developerName}</td>
                      <td className="px-2 py-2">
                        <span className="inline-flex items-center gap-1 text-[color:var(--workspace-text)]">
                          <CircleDollarSign className="size-3.5 text-emerald-400" />
                          {row.units}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.rules.length ? `${row.avgPct}%` : '—'}</td>
                      <td className="px-2 py-2">
                        <div className="flex flex-wrap gap-1.5">
                          {row.rules.map((rule, idx) => (
                            <span
                              key={`${rule.partnerType}-${idx}`}
                              className="inline-flex items-center gap-1 rounded-full border border-[var(--hub-card-border-hover)] px-2 py-0.5 text-xs text-[color:var(--theme-accent-heading)]"
                            >
                              <Percent className="size-3" />
                              {rule.partnerType}: {rule.commissionPercent}%
                            </span>
                          ))}
                          {row.rules.length === 0 && (
                            <span className="text-xs text-amber-300">Нет условий</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <p className="mt-2 text-sm text-[color:var(--app-text-muted)]">Нет строк по фильтрам.</p>}
          </section>

          {missingRules.length > 0 && (
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Нет комиссионной матрицы</h2>
              </div>
              <p className="mb-2 text-xs text-[color:var(--app-text-muted)]">
                Проекты без настроенных ставок (по мок-данным каталога).
              </p>
              <ul className="space-y-2">
                {missingRules.map((r) => (
                  <li
                    key={r.complex.id}
                    className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]"
                  >
                    {r.complex.name} · {r.complex.developerName}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
