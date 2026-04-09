import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Filter, MapPinned, ShieldCheck, Sparkles } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type StatusType =
  | 'aggregator_primary'
  | 'mls_secondary_admin'
  | 'mls_rent_admin'
  | 'community_organizer'

type RegionStatusRow = {
  id: string
  region: string
  statusType: StatusType
  ownerAgency: string | null
}

const MY_AGENCY = 'ALPHABASE.sale Agency'

const STATUS_LABELS: Record<StatusType, string> = {
  aggregator_primary: 'Агрегатор первичного рынка',
  mls_secondary_admin: 'Администратор MLS вторичного рынка',
  mls_rent_admin: 'Администратор MLS аренды',
  community_organizer: 'Организатор сообщества',
}

const INITIAL_ROWS: RegionStatusRow[] = [
  { id: 's-1', region: 'Тбилиси', statusType: 'aggregator_primary', ownerAgency: MY_AGENCY },
  { id: 's-2', region: 'Тбилиси', statusType: 'mls_secondary_admin', ownerAgency: 'GeoReal Network' },
  { id: 's-3', region: 'Батуми', statusType: 'mls_rent_admin', ownerAgency: null },
  { id: 's-4', region: 'Батуми', statusType: 'community_organizer', ownerAgency: MY_AGENCY },
  { id: 's-5', region: 'Кутаиси', statusType: 'aggregator_primary', ownerAgency: 'West Home Partners' },
  { id: 's-6', region: 'Кутаиси', statusType: 'mls_secondary_admin', ownerAgency: null },
]

export default function AgencyStatusesPage() {
  const [rows, setRows] = useState<RegionStatusRow[]>(INITIAL_ROWS)
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [statusTypeFilter, setStatusTypeFilter] = useState<'all' | StatusType>('all')
  const [ownership, setOwnership] = useState<'all' | 'mine' | 'free' | 'other'>('all')

  const regionOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.region))).sort(), [rows])

  const filteredRows = useMemo(() => {
    let list = [...rows]
    if (regionFilter !== 'all') list = list.filter((r) => r.region === regionFilter)
    if (statusTypeFilter !== 'all') list = list.filter((r) => r.statusType === statusTypeFilter)
    if (ownership === 'mine') list = list.filter((r) => r.ownerAgency === MY_AGENCY)
    if (ownership === 'free') list = list.filter((r) => !r.ownerAgency)
    if (ownership === 'other') list = list.filter((r) => !!r.ownerAgency && r.ownerAgency !== MY_AGENCY)
    return list
  }, [ownership, regionFilter, rows, statusTypeFilter])

  const stats = useMemo(() => {
    const base = filteredRows
    const mine = base.filter((r) => r.ownerAgency === MY_AGENCY).length
    const free = base.filter((r) => !r.ownerAgency).length
    const occupied = base.filter((r) => r.ownerAgency && r.ownerAgency !== MY_AGENCY).length
    return { mine, free, occupied, total: base.length }
  }, [filteredRows])

  const freeSlots = useMemo(() => rows.filter((r) => !r.ownerAgency), [rows])

  function assignStatus(rowId: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, ownerAgency: MY_AGENCY } : r)),
    )
  }

  function removeStatus(rowId: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, ownerAgency: null } : r)),
    )
  }

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Статусы агентства по регионам</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              UI-контроль статусной модели: один тип статуса в регионе может принадлежать только одному агентству.
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Регион: все</option>
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                value={statusTypeFilter}
                onChange={(e) => setStatusTypeFilter(e.target.value as 'all' | StatusType)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Тип статуса: все</option>
                {(Object.keys(STATUS_LABELS) as StatusType[]).map((t) => (
                  <option key={t} value={t}>
                    {STATUS_LABELS[t]}
                  </option>
                ))}
              </select>
              <select
                value={ownership}
                onChange={(e) => setOwnership(e.target.value as typeof ownership)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Владение: все</option>
                <option value="mine">Назначено нам</option>
                <option value="free">Свободные</option>
                <option value="other">У других агентств</option>
              </select>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">В выборке</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Наши статусы</p>
              <p className="text-xl font-bold text-emerald-400">{stats.mine}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Свободные</p>
              <p className="text-xl font-bold text-blue-400">{stats.free}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Занятые другими</p>
              <p className="text-xl font-bold text-amber-300">{stats.occupied}</p>
            </div>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <MapPinned className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Матрица статусов</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Регион</th>
                    <th className="px-2 py-2">Тип статуса</th>
                    <th className="px-2 py-2">Владелец статуса</th>
                    <th className="px-2 py-2">Состояние</th>
                    <th className="px-2 py-2 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const isMine = row.ownerAgency === MY_AGENCY
                    const isFree = !row.ownerAgency
                    const isConflict = !!row.ownerAgency && row.ownerAgency !== MY_AGENCY
                    return (
                      <tr key={row.id} className="border-b border-[color:var(--workspace-row-border)]">
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{row.region}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{STATUS_LABELS[row.statusType]}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">
                          {row.ownerAgency ?? 'Не назначен'}
                        </td>
                        <td className="px-2 py-2">
                          {isMine ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                              <CheckCircle2 className="size-3.5" />
                              Назначен нам
                            </span>
                          ) : isFree ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/35 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-300">
                              <ShieldCheck className="size-3.5" />
                              Свободен
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
                              <AlertTriangle className="size-3.5" />
                              Конфликт уникальности
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => assignStatus(row.id)}
                              disabled={isMine}
                              className="rounded-md border border-[var(--hub-card-border-hover)] px-2 py-1 text-xs text-[color:var(--theme-accent-heading)] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Назначить
                            </button>
                            <button
                              type="button"
                              onClick={() => removeStatus(row.id)}
                              disabled={isFree}
                              className="rounded-md border border-[color:var(--workspace-row-border)] px-2 py-1 text-xs text-[color:var(--workspace-text-muted)] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Снять
                            </button>
                          </div>
                          {isConflict ? (
                            <p className="mt-1 text-right text-[11px] text-amber-300">
                              Статус уже закреплен за другим агентством.
                            </p>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredRows.length === 0 && (
              <p className="mt-2 text-sm text-[color:var(--app-text-muted)]">Нет строк по текущим фильтрам.</p>
            )}
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Доступно к закреплению</h2>
            </div>
            <p className="mb-2 text-xs text-[color:var(--app-text-muted)]">Свободные ячейки матрицы по всем регионам (без фильтра таблицы).</p>
            <ul className="space-y-2">
              {freeSlots.map((r) => (
                <li
                  key={r.id}
                  className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]"
                >
                  {r.region} · {STATUS_LABELS[r.statusType]}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
