import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, FileText, Filter, ListChecks, UserRound } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { BOOKINGS_MOCK } from '@/data/bookings-mock'
import type { Booking, BookingStatus } from '@/types/bookings'

const FORM_SELECT_CLASS =
  "rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]"

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(status: Booking['status']) {
  if (status === 'active') return 'Активна'
  if (status === 'pending') return 'Новая'
  if (status === 'completed') return 'Завершена'
  if (status === 'expired') return 'Просрочена'
  return 'Отклонена'
}

export default function RegistrationsPage() {
  const registrations = useMemo(() => BOOKINGS_MOCK.filter((b) => b.type === 'client'), [])
  const [selectedId, setSelectedId] = useState(registrations[0]?.id ?? '')
  const [status, setStatus] = useState<'all' | BookingStatus>('all')
  const [agent, setAgent] = useState<string>('all')
  const [riskOnly, setRiskOnly] = useState(false)

  const agentOptions = useMemo(() => Array.from(new Set(registrations.map((r) => r.agentName))).sort(), [registrations])

  const filtered = useMemo(() => {
    let rows = [...registrations]
    if (status !== 'all') rows = rows.filter((r) => r.status === status)
    if (agent !== 'all') rows = rows.filter((r) => r.agentName === agent)
    if (riskOnly) rows = rows.filter((r) => r.status === 'expired' || r.status === 'rejected' || r.status === 'pending')
    return rows
  }, [agent, registrations, riskOnly, status])

  const selected = useMemo(
    () => filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? registrations.find((r) => r.id === selectedId),
    [filtered, registrations, selectedId],
  )

  const kpi = useMemo(() => {
    const total = filtered.length
    const active = filtered.filter((r) => r.status === 'active').length
    const pending = filtered.filter((r) => r.status === 'pending').length
    const risk = filtered.filter((r) => r.status === 'expired' || r.status === 'rejected').length
    const completed = filtered.filter((r) => r.status === 'completed').length
    return { total, active, pending, risk, completed }
  }, [filtered])

  const needsAttention = useMemo(
    () => registrations.filter((r) => r.status === 'expired' || r.status === 'pending' || r.status === 'rejected'),
    [registrations],
  )

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <DashboardShell scrollMain={false}>
      <div className="flex min-h-0 w-full flex-1 flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <div className="shrink-0">
          <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Панель управления регистрацией</h1>
          <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
            Реестр регистраций покупателей в проектах девелопера, фильтры и карточка выбранной записи.
          </p>
        </div>

          <section className="shrink-0 rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'all' | BookingStatus)}
                className={FORM_SELECT_CLASS}
              >
                <option value="all">Статус: все</option>
                <option value="pending">Новая</option>
                <option value="active">Активна</option>
                <option value="completed">Завершена</option>
                <option value="expired">Просрочена</option>
                <option value="rejected">Отклонена</option>
              </select>
              <select
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
                className={FORM_SELECT_CLASS}
              >
                <option value="all">Ответственный: все</option>
                {agentOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]">
                <input
                  type="checkbox"
                  checked={riskOnly}
                  onChange={(e) => setRiskOnly(e.target.checked)}
                  className="size-4 appearance-none rounded border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] checked:border-[var(--gold)] checked:bg-[var(--gold)]"
                />
                Только риск / ожидание
              </label>
            </div>
          </section>

          <section className="grid shrink-0 grid-cols-2 gap-2 md:grid-cols-5">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">В выборке</p>
              <p className="text-xl font-bold text-[color:var(--theme-accent-heading)]">{kpi.total}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Активные</p>
              <p className="text-xl font-bold text-emerald-400">{kpi.active}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Новые</p>
              <p className="text-xl font-bold text-blue-400">{kpi.pending}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Завершены</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.completed}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Риск</p>
              <p className="text-xl font-bold text-red-400">{kpi.risk}</p>
            </div>
          </section>

          <div className="grid min-h-[min(400px,55vh)] flex-1 grid-cols-1 gap-3 lg:min-h-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]">
            <section className="flex min-h-0 flex-col rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex shrink-0 items-center gap-2">
                <FileText className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Реестр регистраций</h2>
              </div>
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                      <th className="px-2 py-2">Клиент</th>
                      <th className="px-2 py-2">Объект</th>
                      <th className="px-2 py-2">Статус</th>
                      <th className="px-2 py-2">Агент</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => {
                      const isSel = item.id === selected?.id
                      return (
                        <tr
                          key={item.id}
                          className={
                            isSel
                              ? 'cursor-pointer border-b border-[color:var(--workspace-row-border)] bg-[color:var(--gold)]/10'
                              : 'cursor-pointer border-b border-[color:var(--workspace-row-border)] hover:bg-[var(--workspace-row-bg)]'
                          }
                          onClick={() => setSelectedId(item.id)}
                        >
                          <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{item.clientName}</td>
                          <td className="max-w-[200px] truncate px-2 py-2 text-[color:var(--workspace-text-muted)]" title={item.propertyAddress}>
                            {item.propertyAddress}
                          </td>
                          <td className="px-2 py-2 text-xs text-[color:var(--workspace-text)]">{statusLabel(item.status)}</td>
                          <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{item.agentName}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && <p className="mt-2 shrink-0 text-sm text-[color:var(--app-text-muted)]">Нет записей по фильтрам.</p>}
            </section>

            <section className="flex min-h-[min(280px,40vh)] flex-col overflow-hidden rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3 lg:min-h-0">
              <div className="mb-2 flex shrink-0 items-center gap-2">
                <UserRound className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Карточка регистрации</h2>
              </div>
              {selected ? (
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-0.5">
                  <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-3">
                    <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{selected.clientName}</p>
                    <p className="mt-1 text-xs text-[color:var(--workspace-text-muted)]">{selected.propertyAddress}</p>
                    {selected.propertyType && (
                      <p className="mt-1 text-xs text-[color:var(--app-text-subtle)]">{selected.propertyType}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                    <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
                      <p className="text-[color:var(--app-text-subtle)]">Статус</p>
                      <p className="mt-1 font-semibold text-[color:var(--workspace-text)]">{statusLabel(selected.status)}</p>
                    </div>
                    <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
                      <p className="text-[color:var(--app-text-subtle)]">Застройщик</p>
                      <p className="mt-1 font-semibold text-[color:var(--workspace-text)]">{selected.developerName ?? '—'}</p>
                    </div>
                    <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
                      <p className="text-[color:var(--app-text-subtle)]">Источник лида</p>
                      <p className="mt-1 font-semibold text-[color:var(--workspace-text)]">{selected.sourceLeadId ?? 'Не указан'}</p>
                    </div>
                    <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
                      <p className="text-[color:var(--app-text-subtle)]">Ответственный</p>
                      <p className="mt-1 font-semibold text-[color:var(--workspace-text)]">{selected.agentName}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-[color:var(--workspace-text-muted)]">
                    <p className="flex items-center gap-1">
                      <Clock3 className="size-3.5" /> Создана: {formatDate(selected.bookedAt)}
                    </p>
                    <p className="flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Действует до: {formatDate(selected.expiresAt)} ({selected.durationHours} ч)
                    </p>
                    {selected.dealId && (
                      <p className="text-[color:var(--workspace-text)]">Сделка: {selected.dealId}</p>
                    )}
                  </div>
                  {selected.notes && (
                    <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2 text-xs text-[color:var(--workspace-text-muted)]">
                      {selected.notes}
                    </div>
                  )}
                  <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-3">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                      <ListChecks className="size-3.5" />
                      Этапы
                    </div>
                    <ul className="space-y-1.5 text-xs text-[color:var(--workspace-text)]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                        Заявка в системе застройщика
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                        Проверка уникальности клиента
                      </li>
                      <li className="flex items-center gap-2">
                        {selected.status === 'active' || selected.status === 'completed' ? (
                          <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                        ) : (
                          <Clock3 className="size-3.5 shrink-0 text-amber-400" />
                        )}
                        Подбор лота / бронь по шахматке
                      </li>
                      <li className="flex items-center gap-2">
                        {selected.status === 'completed' ? (
                          <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                        ) : (
                          <Clock3 className="size-3.5 shrink-0 text-[color:var(--workspace-text-muted)]" />
                        )}
                        Закрытие сделки
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[color:var(--workspace-text-muted)]">Нет данных о регистрациях</p>
              )}
            </section>
          </div>

          <section className="max-h-[min(200px,28vh)] shrink-0 overflow-hidden rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Требуют внимания</h2>
            </div>
            <p className="mb-2 text-xs text-[color:var(--app-text-muted)]">По всем регистрациям: просрочка, отклонение или долго в статусе «новая».</p>
            <ul className="max-h-[min(120px,18vh)] space-y-2 overflow-y-auto pr-1">
              {needsAttention.map((r) => (
                <li
                  key={r.id}
                  className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]"
                >
                  {r.clientName} · {r.propertyAddress} · {statusLabel(r.status)}
                </li>
              ))}
            </ul>
          </section>
      </div>
      </DashboardShell>
    </div>
  )
}
