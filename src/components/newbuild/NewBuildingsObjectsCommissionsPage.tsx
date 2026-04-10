import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CircleDollarSign,
  Filter,
  Home,
  Pencil,
  Percent,
  Plus,
  Trash2,
} from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import {
  NEW_BUILD_APARTMENTS_MOCK,
  NEW_BUILD_COMPLEXES_MOCK,
  type NewBuildUnitStatus,
} from '@/data/bookings-catalog-mock'

type CommissionRule = {
  id: string
  complexId: string
  partnerType: string
  commissionPercent: number
}

const UNIT_STATUS_LABEL: Record<NewBuildUnitStatus, string> = {
  free: 'Свободен',
  reserved: 'Бронь',
  sold: 'Продан',
  hold: 'Стоп-лист',
}

const FORM_SELECT_CLASS =
  "rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]"
const FORM_INPUT_CLASS =
  "rounded-md border border-[var(--workspace-row-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"

const COMMISSIONS_SEED: CommissionRule[] = [
  { id: 'cr-1', complexId: 'rc-olymp', partnerType: 'Агентство-партнёр', commissionPercent: 2.5 },
  { id: 'cr-2', complexId: 'rc-olymp', partnerType: 'Внутренняя команда', commissionPercent: 3.1 },
  { id: 'cr-3', complexId: 'rc-samolet', partnerType: 'Агентство-партнёр', commissionPercent: 2.2 },
  { id: 'cr-4', complexId: 'rc-bunin', partnerType: 'Агентство-партнёр', commissionPercent: 2.8 },
]

function nextRuleId() {
  return `cr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export default function NewBuildingsObjectsCommissionsPage() {
  const [commissions, setCommissions] = useState<CommissionRule[]>(() => [...COMMISSIONS_SEED])
  const [developer, setDeveloper] = useState<string>('all')
  const [noRulesOnly, setNoRulesOnly] = useState(false)
  const [selectedComplexId, setSelectedComplexId] = useState<string | null>(NEW_BUILD_COMPLEXES_MOCK[0]?.id ?? null)

  const [newPartnerType, setNewPartnerType] = useState('Агентство-партнёр')
  const [newPercent, setNewPercent] = useState('2.5')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPartnerType, setEditPartnerType] = useState('')
  const [editPercent, setEditPercent] = useState('')

  const rows = useMemo(() => {
    return NEW_BUILD_COMPLEXES_MOCK.map((complex) => {
      const units = NEW_BUILD_APARTMENTS_MOCK.filter((u) => u.rcId === complex.id)
      const byStatus = units.reduce(
        (acc, u) => {
          acc[u.salesStatus] = (acc[u.salesStatus] ?? 0) + 1
          return acc
        },
        {} as Record<NewBuildUnitStatus, number>,
      )
      const rules = commissions.filter((c) => c.complexId === complex.id)
      const avgPct =
        rules.length > 0 ? Math.round((rules.reduce((s, r) => s + r.commissionPercent, 0) / rules.length) * 10) / 10 : 0
      return { complex, units, unitCount: units.length, byStatus, rules, avgPct }
    })
  }, [commissions])

  const developerOptions = useMemo(() => Array.from(new Set(NEW_BUILD_COMPLEXES_MOCK.map((c) => c.developerName))).sort(), [])

  const filtered = useMemo(() => {
    let list = [...rows]
    if (developer !== 'all') list = list.filter((r) => r.complex.developerName === developer)
    if (noRulesOnly) list = list.filter((r) => r.rules.length === 0)
    return list
  }, [developer, noRulesOnly, rows])

  const selectedRow = useMemo(() => {
    if (!selectedComplexId) return null
    return rows.find((r) => r.complex.id === selectedComplexId) ?? null
  }, [rows, selectedComplexId])

  const kpi = useMemo(() => {
    const totalUnits = filtered.reduce((s, r) => s + r.unitCount, 0)
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

  const addRule = useCallback(() => {
    if (!selectedRow) return
    const pct = Number.parseFloat(newPercent.replace(',', '.'))
    if (!newPartnerType.trim() || Number.isNaN(pct) || pct < 0 || pct > 100) return
    setCommissions((prev) => [
      ...prev,
      { id: nextRuleId(), complexId: selectedRow.complex.id, partnerType: newPartnerType.trim(), commissionPercent: pct },
    ])
    setNewPercent('2.5')
  }, [newPartnerType, newPercent, selectedRow])

  const startEdit = useCallback((r: CommissionRule) => {
    setEditingId(r.id)
    setEditPartnerType(r.partnerType)
    setEditPercent(String(r.commissionPercent))
  }, [])

  const saveEdit = useCallback(() => {
    if (!editingId) return
    const pct = Number.parseFloat(editPercent.replace(',', '.'))
    if (!editPartnerType.trim() || Number.isNaN(pct) || pct < 0 || pct > 100) return
    setCommissions((prev) =>
      prev.map((c) =>
        c.id === editingId ? { ...c, partnerType: editPartnerType.trim(), commissionPercent: pct } : c,
      ),
    )
    setEditingId(null)
  }, [editPartnerType, editPercent, editingId])

  const removeRule = useCallback((id: string) => {
    setCommissions((prev) => prev.filter((c) => c.id !== id))
    if (editingId === id) setEditingId(null)
  }, [editingId])

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="w-full space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Объекты и комиссии</h1>
              <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
                Реестр проектов первички, статусы юнитов, настройка комиссионных условий и связка с партнёрским контуром.
              </p>
            </div>
            <Link
              to="/dashboard/new-buildings/report-partners"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] px-3 py-2 text-sm font-semibold text-[color:var(--theme-accent-heading)] hover:border-[var(--hub-card-border-hover)]"
            >
              Отчёт по партнёрам первички
            </Link>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <select value={developer} onChange={(e) => setDeveloper(e.target.value)} className={FORM_SELECT_CLASS}>
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

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_minmax(300px,380px)] xl:items-start">
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-3 flex items-center gap-2">
                <Home className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Реестр объектов первички</h2>
              </div>
              <p className="mb-2 text-xs text-[color:var(--app-text-muted)]">Выберите проект — справа откроется карточка, юниты и комиссии.</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                      <th className="px-2 py-2">Проект</th>
                      <th className="px-2 py-2">Девелопер</th>
                      <th className="px-2 py-2">Юниты</th>
                      <th className="px-2 py-2">Своб./бронь</th>
                      <th className="px-2 py-2">Ср. %</th>
                      <th className="px-2 py-2">Правила</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => {
                      const sel = row.complex.id === selectedComplexId
                      const free = row.byStatus.free ?? 0
                      const reserved = row.byStatus.reserved ?? 0
                      return (
                        <tr
                          key={row.complex.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedComplexId(row.complex.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setSelectedComplexId(row.complex.id)
                            }
                          }}
                          className={
                            sel
                              ? 'cursor-pointer border-b border-[color:var(--workspace-row-border)] bg-[color:var(--gold)]/12'
                              : 'cursor-pointer border-b border-[color:var(--workspace-row-border)] hover:bg-[var(--workspace-row-bg)]'
                          }
                        >
                          <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{row.complex.name}</td>
                          <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{row.complex.developerName}</td>
                          <td className="px-2 py-2">
                            <span className="inline-flex items-center gap-1 text-[color:var(--workspace-text)]">
                              <CircleDollarSign className="size-3.5 text-emerald-400" />
                              {row.unitCount}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-xs text-[color:var(--workspace-text-muted)]">
                            {free} / {reserved}
                          </td>
                          <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.rules.length ? `${row.avgPct}%` : '—'}</td>
                          <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{row.rules.length} шт.</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && <p className="mt-2 text-sm text-[color:var(--app-text-muted)]">Нет строк по фильтрам.</p>}
            </section>

            <div className="space-y-3">
              {selectedRow ? (
                <>
                  <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                    <h2 className="mb-2 text-sm font-semibold text-[color:var(--theme-accent-heading)]">Карточка объекта</h2>
                    <p className="text-base font-bold text-[color:var(--workspace-text)]">{selectedRow.complex.name}</p>
                    <p className="mt-1 text-sm text-[color:var(--workspace-text-muted)]">{selectedRow.complex.developerName}</p>
                    <p className="mt-2 text-xs text-[color:var(--app-text-subtle)]">ID: {selectedRow.complex.id}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {(Object.keys(UNIT_STATUS_LABEL) as NewBuildUnitStatus[]).map((st) => (
                        <div
                          key={st}
                          className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-1.5 text-center"
                        >
                          <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">{UNIT_STATUS_LABEL[st]}</p>
                          <p className="text-lg font-bold text-[color:var(--workspace-text)]">{selectedRow.byStatus[st] ?? 0}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Percent className="size-4 text-[color:var(--gold)]" />
                      <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Комиссионные условия</h2>
                    </div>
                    <p className="mb-3 text-xs text-[color:var(--app-text-muted)]">
                      Локальная матрица ставок по типу партнёра (до подключения API сохраняется в сессии).
                    </p>
                    <ul className="mb-3 space-y-2">
                      {selectedRow.rules.map((rule) => (
                        <li
                          key={rule.id}
                          className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2"
                        >
                          {editingId === rule.id ? (
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                              <input
                                value={editPartnerType}
                                onChange={(e) => setEditPartnerType(e.target.value)}
                                className={`flex-1 ${FORM_INPUT_CLASS}`}
                              />
                              <input
                                value={editPercent}
                                onChange={(e) => setEditPercent(e.target.value)}
                                type="text"
                                inputMode="decimal"
                                className={`w-24 shrink-0 text-right ${FORM_INPUT_CLASS}`}
                              />
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  className="rounded-md border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] px-2 py-1.5 text-xs font-semibold text-[color:var(--workspace-text)]"
                                >
                                  OK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="rounded-md border border-[var(--hub-card-border)] px-2 py-1.5 text-xs text-[color:var(--app-text-muted)]"
                                >
                                  Отмена
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-[color:var(--workspace-text)]">
                                {rule.partnerType}: <strong>{rule.commissionPercent}%</strong>
                              </span>
                              <div className="flex shrink-0 gap-1">
                                <button
                                  type="button"
                                  onClick={() => startEdit(rule)}
                                  className="rounded p-1 text-[color:var(--gold)] hover:bg-[var(--workspace-row-bg)]"
                                  aria-label="Изменить"
                                >
                                  <Pencil className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeRule(rule.id)}
                                  className="rounded p-1 text-red-400 hover:bg-red-500/10"
                                  aria-label="Удалить"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                      {selectedRow.rules.length === 0 && (
                        <li className="text-sm text-amber-300">Нет условий — добавьте правило ниже.</li>
                      )}
                    </ul>
                    <div className="flex flex-col gap-2 border-t border-[color:var(--workspace-row-border)] pt-3 sm:flex-row sm:items-end">
                      <input
                        value={newPartnerType}
                        onChange={(e) => setNewPartnerType(e.target.value)}
                        placeholder="Тип партнёра"
                        className={`flex-1 ${FORM_INPUT_CLASS}`}
                      />
                      <input
                        value={newPercent}
                        onChange={(e) => setNewPercent(e.target.value)}
                        placeholder="%"
                        className={`w-24 shrink-0 text-right sm:w-28 ${FORM_INPUT_CLASS}`}
                      />
                      <button
                        type="button"
                        onClick={addRule}
                        className="inline-flex items-center justify-center gap-1 rounded-md border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] px-3 py-2 text-sm font-semibold text-[color:var(--theme-accent-heading)]"
                      >
                        <Plus className="size-4" />
                        Добавить
                      </button>
                    </div>
                  </section>
                </>
              ) : (
                <section className="rounded-lg border border-dashed border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-6 text-center text-sm text-[color:var(--app-text-muted)]">
                  Выберите проект в реестре слева
                </section>
              )}
            </div>
          </div>

          {missingRules.length > 0 && (
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Сигнал: нет комиссионной матрицы</h2>
              </div>
              <p className="mb-2 text-xs text-[color:var(--app-text-muted)]">Проекты без настроенных ставок.</p>
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
