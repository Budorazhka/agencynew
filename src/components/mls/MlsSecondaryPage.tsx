import { useMemo, useState } from 'react'
import { AlertTriangle, Building2, Filter, Network, Users } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type LotStatus = 'active' | 'reserved' | 'moderation'

const STATUS_LABEL: Record<LotStatus, string> = {
  active: 'Активен',
  reserved: 'Зарезервирован',
  moderation: 'На модерации',
}

const LOTS: Array<{
  id: string
  address: string
  region: string
  partner: string
  rooms: number
  areaM2: number
  priceUsd: number
  status: LotStatus
  daysInFeed: number
  verified: boolean
}> = [
  { id: '1', address: 'ул. Садовая, 12, кв. 44', region: 'Москва', partner: 'Альфа-недвижимость', rooms: 3, areaM2: 78, priceUsd: 285000, status: 'active', daysInFeed: 12, verified: true },
  { id: '2', address: 'пр. Мира, 88', region: 'Москва', partner: 'GeoPrime Realty', rooms: 2, areaM2: 54, priceUsd: 198000, status: 'active', daysInFeed: 45, verified: true },
  { id: '3', address: 'ул. Новаторов, 17', region: 'МО', partner: 'Сити Экспресс', rooms: 1, areaM2: 38, priceUsd: 112000, status: 'reserved', daysInFeed: 8, verified: true },
  { id: '4', address: 'Наб. Фонтанки, 22', region: 'СПб', partner: 'Северный квартал', rooms: 4, areaM2: 112, priceUsd: 320000, status: 'active', daysInFeed: 62, verified: false },
  { id: '5', address: 'ул. Тверская, 5', region: 'Москва', partner: 'Альфа-недвижимость', rooms: 2, areaM2: 61, priceUsd: 410000, status: 'moderation', daysInFeed: 2, verified: false },
  { id: '6', address: 'пр. Ленина, 101', region: 'Регионы', partner: 'Batumi Invest Brokers', rooms: 3, areaM2: 85, priceUsd: 95000, status: 'active', daysInFeed: 91, verified: true },
  { id: '7', address: 'ул. Лесная, 9', region: 'МО', partner: 'West Capital Homes', rooms: 2, areaM2: 49, priceUsd: 165000, status: 'active', daysInFeed: 28, verified: true },
  { id: '8', address: 'ул. Рубинштейна, 15', region: 'СПб', partner: 'Регион Плюс', rooms: 1, areaM2: 34, priceUsd: 128000, status: 'active', daysInFeed: 120, verified: false },
]

const money = new Intl.NumberFormat('ru-RU')

export default function MlsSecondaryPage() {
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
    if (staleOnly) rows = rows.filter((l) => l.daysInFeed > 60 || !l.verified)
    return rows
  }, [partner, region, staleOnly, status])

  const kpi = useMemo(() => {
    const active = filtered.filter((l) => l.status === 'active').length
    const reserved = filtered.filter((l) => l.status === 'reserved').length
    const moderation = filtered.filter((l) => l.status === 'moderation').length
    const verifiedPct =
      filtered.length > 0 ? Math.round((filtered.filter((l) => l.verified).length / filtered.length) * 100) : 0
    const partners = new Set(filtered.map((l) => l.partner)).size
    return { total: filtered.length, active, reserved, moderation, verifiedPct, partners }
  }, [filtered])

  const stale = useMemo(() => LOTS.filter((l) => l.daysInFeed > 60 || !l.verified).slice(0, 6), [])

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">MLS вторичного рынка</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Реестр лотов сети: размещение, партнёр, статус и контроль актуальности.
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
                <option value="active">Активен</option>
                <option value="reserved">Зарезервирован</option>
                <option value="moderation">На модерации</option>
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]">
                <input type="checkbox" checked={staleOnly} onChange={(e) => setStaleOnly(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
                Устаревшие / без верификации
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">В выборке</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.total}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Активные</p>
              <p className="text-xl font-bold text-emerald-300">{kpi.active}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Резерв</p>
              <p className="text-xl font-bold text-amber-300">{kpi.reserved}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Модерация</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.moderation}</p>
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
              <Network className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Объекты сети</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Адрес</th>
                    <th className="px-2 py-2">Регион</th>
                    <th className="px-2 py-2">Комн.</th>
                    <th className="px-2 py-2">м²</th>
                    <th className="px-2 py-2">Цена</th>
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
                          <Building2 className="size-3.5 shrink-0 text-[color:var(--gold)]" />
                          {l.address}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{l.region}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{l.rooms}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{l.areaM2}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{money.format(l.priceUsd)} $</td>
                      <td className="px-2 py-2">
                        <span className="flex items-center gap-1 text-[color:var(--workspace-text)]">
                          <Users className="size-3.5 text-[color:var(--workspace-text-muted)]" />
                          {l.partner}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{STATUS_LABEL[l.status]}</td>
                      <td className={l.daysInFeed > 60 ? 'px-2 py-2 text-amber-300' : 'px-2 py-2 text-[color:var(--workspace-text)]'}>
                        {l.daysInFeed} дн.
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
            <p className="mb-2 text-xs text-[color:var(--app-text-muted)]">Долго в ленте или без верификации карточки (по всей сети).</p>
            <ul className="space-y-2">
              {stale.map((l) => (
                <li
                  key={l.id}
                  className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]"
                >
                  {l.address} · {l.partner} · {l.daysInFeed} дн. {!l.verified ? '· нет верификации' : ''}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
