import { useMemo, useState } from 'react'
import { AlertTriangle, Filter, Home, KeyRound, Users } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type LotStatus = 'active' | 'reserved' | 'moderation'

const STATUS_LABEL: Record<LotStatus, string> = {
  active: 'Свободен',
  reserved: 'Бронь',
  moderation: 'На модерации',
}

const LOTS: Array<{
  id: string
  address: string
  region: string
  partner: string
  rooms: number
  areaM2: number
  rentUsd: number
  depositMonths: number
  status: LotStatus
  daysListed: number
  availableFrom: string
  verified: boolean
}> = [
  { id: 'r1', address: 'ул. Меликишвили, 8', region: 'Москва', partner: 'Бета Партнёры', rooms: 2, areaM2: 55, rentUsd: 1200, depositMonths: 1, status: 'active', daysListed: 5, availableFrom: 'сразу', verified: true },
  { id: 'r2', address: 'пр. Руставели, 14', region: 'Москва', partner: 'GeoPrime Realty', rooms: 1, areaM2: 38, rentUsd: 950, depositMonths: 1, status: 'active', daysListed: 22, availableFrom: '01.05', verified: true },
  { id: 'r3', address: 'ул. Пушкина, 3', region: 'МО', partner: 'Дом на час', rooms: 3, areaM2: 72, rentUsd: 1100, depositMonths: 2, status: 'reserved', daysListed: 3, availableFrom: 'сразу', verified: true },
  { id: 'r4', address: 'Невский, 120', region: 'СПб', partner: 'Лайт Рент', rooms: 2, areaM2: 48, rentUsd: 880, depositMonths: 1, status: 'active', daysListed: 71, availableFrom: '15.04', verified: false },
  { id: 'r5', address: 'ул. Арбат, 21', region: 'Москва', partner: 'Бета Партнёры', rooms: 1, areaM2: 32, rentUsd: 1450, depositMonths: 1, status: 'moderation', daysListed: 1, availableFrom: 'сразу', verified: false },
  { id: 'r6', address: 'ул. Кирова, 7', region: 'Регионы', partner: 'Юг Аренда', rooms: 2, areaM2: 52, rentUsd: 520, depositMonths: 1, status: 'active', daysListed: 95, availableFrom: '20.04', verified: true },
  { id: 'r7', address: 'пр. Мира, 33', region: 'МО', partner: 'West Capital Homes', rooms: 2, areaM2: 58, rentUsd: 980, depositMonths: 1, status: 'active', daysListed: 18, availableFrom: '05.05', verified: true },
  { id: 'r8', address: 'ул. Рубинштейна, 40', region: 'СПб', partner: 'Batumi Invest Brokers', rooms: 1, areaM2: 30, rentUsd: 750, depositMonths: 1, status: 'active', daysListed: 55, availableFrom: 'сразу', verified: false },
]

const money = new Intl.NumberFormat('ru-RU')

export default function MlsRentPage() {
  const [region, setRegion] = useState<string>('all')
  const [partner, setPartner] = useState<string>('all')
  const [status, setStatus] = useState<'all' | LotStatus>('all')
  const [staleOnly, setStaleOnly] = useState(false)

  const regionOptions = useMemo(() => Array.from(new Set(LOTS.map((l) => l.region))), [])
  const partnerOptions = useMemo(() => Array.from(new Set(LOTS.map((l) => l.partner))).sort(), [])

  const filtered = useMemo(() => {
    let rows = [...LOTS]
    if (region !== 'all') rows = rows.filter((l) => l.region === region)
    if (partner !== 'all') rows = rows.filter((l) => l.partner === partner)
    if (status !== 'all') rows = rows.filter((l) => l.status === status)
    if (staleOnly) rows = rows.filter((l) => l.daysListed > 45 || !l.verified)
    return rows
  }, [partner, region, staleOnly, status])

  const kpi = useMemo(() => {
    const active = filtered.filter((l) => l.status === 'active').length
    const reserved = filtered.filter((l) => l.status === 'reserved').length
    const moderation = filtered.filter((l) => l.status === 'moderation').length
    const avgRent =
      filtered.length > 0 ? Math.round(filtered.reduce((s, l) => s + l.rentUsd, 0) / filtered.length) : 0
    const partners = new Set(filtered.map((l) => l.partner)).size
    const verifiedPct =
      filtered.length > 0 ? Math.round((filtered.filter((l) => l.verified).length / filtered.length) * 100) : 0
    return { total: filtered.length, active, reserved, moderation, avgRent, partners, verifiedPct }
  }, [filtered])

  const stale = useMemo(() => LOTS.filter((l) => l.daysListed > 45 || !l.verified).slice(0, 6), [])

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">MLS аренды</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Арендные лоты сети: ставка, залог, доступность и партнёр-источник.
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
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
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Партнёр: все</option>
                {partnerOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'all' | LotStatus)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Статус: все</option>
                <option value="active">Свободен</option>
                <option value="reserved">Бронь</option>
                <option value="moderation">На модерации</option>
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]">
                <input type="checkbox" checked={staleOnly} onChange={(e) => setStaleOnly(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
                Долгий простой / без верификации
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">В выборке</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.total}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Свободны</p>
              <p className="text-xl font-bold text-emerald-300">{kpi.active}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Бронь</p>
              <p className="text-xl font-bold text-amber-300">{kpi.reserved}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Модерация</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.moderation}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Ср. ставка</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{money.format(kpi.avgRent)} $</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Вериф. лотов</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.verifiedPct}%</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Партнёров</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.partners}</p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <KeyRound className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Лоты аренды</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Адрес</th>
                    <th className="px-2 py-2">Регион</th>
                    <th className="px-2 py-2">Комн.</th>
                    <th className="px-2 py-2">м²</th>
                    <th className="px-2 py-2">Аренда / мес</th>
                    <th className="px-2 py-2">Залог</th>
                    <th className="px-2 py-2">Старт</th>
                    <th className="px-2 py-2">Партнёр</th>
                    <th className="px-2 py-2">Статус</th>
                    <th className="px-2 py-2">В ленте</th>
                    <th className="px-2 py-2">Вериф.</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2">
                        <span className="flex items-center gap-1 font-medium text-[color:var(--workspace-text)]">
                          <Home className="size-3.5 shrink-0 text-[color:var(--gold)]" />
                          {l.address}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{l.region}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{l.rooms}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{l.areaM2}</td>
                      <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{money.format(l.rentUsd)} $</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{l.depositMonths} мес.</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{l.availableFrom}</td>
                      <td className="px-2 py-2">
                        <span className="flex items-center gap-1 text-[color:var(--workspace-text)]">
                          <Users className="size-3.5 text-[color:var(--workspace-text-muted)]" />
                          {l.partner}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{STATUS_LABEL[l.status]}</td>
                      <td className={l.daysListed > 45 ? 'px-2 py-2 text-amber-300' : 'px-2 py-2 text-[color:var(--workspace-text)]'}>
                        {l.daysListed} дн.
                      </td>
                      <td className={l.verified ? 'px-2 py-2 text-emerald-300' : 'px-2 py-2 text-amber-300'}>{l.verified ? 'Да' : 'Нет'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Требуют внимания</h2>
            </div>
            <p className="mb-2 text-xs text-[color:var(--app-text-muted)]">Долго в выдаче или без верификации (по всей сети).</p>
            <ul className="space-y-2">
              {stale.map((l) => (
                <li
                  key={l.id}
                  className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]"
                >
                  {l.address} · {l.partner} · {money.format(l.rentUsd)} $/мес · {l.daysListed} дн. {!l.verified ? '· нет верификации' : ''}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
