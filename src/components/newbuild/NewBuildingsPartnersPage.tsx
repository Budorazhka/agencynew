import { useMemo, useState } from 'react'
import { AlertTriangle, Building2, Filter, Handshake, Phone, TrendingUp } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

type Segment = 'Агентство' | 'Брокер' | 'Корпоративный партнёр'

type PrimaryPartner = {
  id: string
  name: string
  segment: Segment
  city: string
  manager: string
  phone: string
  projects: string[]
  dealsYtd: number
  regYtd: number
  health: number
}

const PRIMARY_PARTNERS: PrimaryPartner[] = [
  {
    id: 'pp-1',
    name: 'GeoPrime Realty',
    segment: 'Агентство',
    city: 'Тбилиси',
    manager: 'Николай Лавров',
    phone: '+995 599 110 220',
    projects: ['ЖК Олимп', 'ЖК Самолёт Парк'],
    dealsYtd: 12,
    regYtd: 38,
    health: 88,
  },
  {
    id: 'pp-2',
    name: 'Batumi Invest Brokers',
    segment: 'Брокер',
    city: 'Батуми',
    manager: 'Ирина Кварацхелия',
    phone: '+995 577 900 120',
    projects: ['ЖК Бунинские луга'],
    dealsYtd: 6,
    regYtd: 19,
    health: 71,
  },
  {
    id: 'pp-3',
    name: 'West Capital Homes',
    segment: 'Корпоративный партнёр',
    city: 'Кутаиси',
    manager: 'Олег Чхеидзе',
    phone: '+995 591 700 440',
    projects: ['ЖК Олимп'],
    dealsYtd: 4,
    regYtd: 11,
    health: 62,
  },
  {
    id: 'pp-4',
    name: 'Альфа Первичка',
    segment: 'Агентство',
    city: 'Москва',
    manager: 'Светлана Орлова',
    phone: '+7 903 000 11 22',
    projects: ['ЖК Олимп', 'ЖК Бунинские луга'],
    dealsYtd: 18,
    regYtd: 44,
    health: 93,
  },
  {
    id: 'pp-5',
    name: 'Сити Партнёр',
    segment: 'Брокер',
    city: 'Москва',
    manager: 'Павел Ермаков',
    phone: '+7 916 555 44 33',
    projects: ['ЖК Самолёт Парк'],
    dealsYtd: 3,
    regYtd: 9,
    health: 48,
  },
]

export default function NewBuildingsPartnersPage() {
  const [activeId, setActiveId] = useState(PRIMARY_PARTNERS[0]?.id ?? '')
  const [segment, setSegment] = useState<'all' | Segment>('all')
  const [city, setCity] = useState<string>('all')
  const [weakOnly, setWeakOnly] = useState(false)

  const cityOptions = useMemo(() => Array.from(new Set(PRIMARY_PARTNERS.map((p) => p.city))).sort(), [])

  const filtered = useMemo(() => {
    let rows = [...PRIMARY_PARTNERS]
    if (segment !== 'all') rows = rows.filter((p) => p.segment === segment)
    if (city !== 'all') rows = rows.filter((p) => p.city === city)
    if (weakOnly) rows = rows.filter((p) => p.health < 65 || p.dealsYtd < 5)
    return rows
  }, [city, segment, weakOnly])

  const active = useMemo(
    () => filtered.find((p) => p.id === activeId) ?? filtered[0] ?? PRIMARY_PARTNERS.find((p) => p.id === activeId),
    [activeId, filtered],
  )

  const kpi = useMemo(() => {
    const n = filtered.length
    const deals = filtered.reduce((s, p) => s + p.dealsYtd, 0)
    const reg = filtered.reduce((s, p) => s + p.regYtd, 0)
    const avgHealth = n > 0 ? Math.round(filtered.reduce((s, p) => s + p.health, 0) / n) : 0
    const projects = new Set(filtered.flatMap((p) => p.projects)).size
    return { n, deals, reg, avgHealth, projects }
  }, [filtered])

  const atRisk = useMemo(() => PRIMARY_PARTNERS.filter((p) => p.health < 60).sort((a, b) => a.health - b.health), [])

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Партнёры первичного рынка</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
              Реестр партнёров, контактов, проектных связок и качества контура.
            </p>
          </div>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as 'all' | Segment)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Сегмент: все</option>
                <option value="Агентство">Агентство</option>
                <option value="Брокер">Брокер</option>
                <option value="Корпоративный партнёр">Корпоративный партнёр</option>
              </select>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="all">Город: все</option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]">
                <input type="checkbox" checked={weakOnly} onChange={(e) => setWeakOnly(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
                Слабые по сделкам / индексу
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">В выборке</p>
              <p className="text-xl font-bold text-[color:var(--theme-accent-heading)]">{kpi.n}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Сделок YTD</p>
              <p className="text-xl font-bold text-emerald-400">{kpi.deals}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Регистраций YTD</p>
              <p className="text-xl font-bold text-blue-400">{kpi.reg}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Ср. индекс</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.avgHealth}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">Проектов в сети</p>
              <p className="text-xl font-bold text-amber-300">{kpi.projects}</p>
            </div>
          </section>

          <div className="grid min-h-[440px] grid-cols-1 gap-3 lg:grid-cols-[1.15fr_1fr]">
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <Handshake className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Реестр партнёров</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                      <th className="px-2 py-2">Партнёр</th>
                      <th className="px-2 py-2">Город</th>
                      <th className="px-2 py-2">Сделки</th>
                      <th className="px-2 py-2">Индекс</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((partner) => {
                      const isSel = partner.id === active?.id
                      return (
                        <tr
                          key={partner.id}
                          className={
                            isSel
                              ? 'cursor-pointer border-b border-[color:var(--workspace-row-border)] bg-[color:var(--gold)]/10'
                              : 'cursor-pointer border-b border-[color:var(--workspace-row-border)] hover:bg-[var(--workspace-row-bg)]'
                          }
                          onClick={() => setActiveId(partner.id)}
                        >
                          <td className="px-2 py-2">
                            <p className="font-semibold text-[color:var(--workspace-text)]">{partner.name}</p>
                            <p className="text-xs text-[color:var(--workspace-text-muted)]">{partner.segment}</p>
                          </td>
                          <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{partner.city}</td>
                          <td className="px-2 py-2 text-[color:var(--workspace-text)]">{partner.dealsYtd}</td>
                          <td className={partner.health >= 70 ? 'px-2 py-2 text-emerald-300' : 'px-2 py-2 text-amber-300'}>
                            {partner.health}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <Building2 className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Карточка партнёра</h2>
              </div>
              {active ? (
                <div className="space-y-3">
                  <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-3">
                    <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{active.name}</p>
                    <p className="mt-1 text-xs text-[color:var(--workspace-text-muted)]">{active.segment} · {active.city}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
                      <p className="text-[11px] text-[color:var(--app-text-subtle)]">Сделки YTD</p>
                      <p className="mt-1 text-lg font-semibold text-emerald-300">{active.dealsYtd}</p>
                    </div>
                    <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
                      <p className="text-[11px] text-[color:var(--app-text-subtle)]">Регистрации YTD</p>
                      <p className="mt-1 text-lg font-semibold text-blue-300">{active.regYtd}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
                      <p className="text-[11px] text-[color:var(--app-text-subtle)]">Ответственный</p>
                      <p className="mt-1 text-sm font-semibold text-[color:var(--workspace-text)]">{active.manager}</p>
                    </div>
                    <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
                      <p className="flex items-center gap-1 text-[11px] text-[color:var(--app-text-subtle)]">
                        <Phone className="size-3.5" />
                        Контакт
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[color:var(--workspace-text)]">{active.phone}</p>
                    </div>
                    <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
                      <p className="text-[11px] text-[color:var(--app-text-subtle)]">Проекты в работе</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {active.projects.map((project) => (
                          <span
                            key={project}
                            className="rounded-full border border-[var(--hub-card-border-hover)] px-2 py-0.5 text-xs text-[color:var(--theme-accent-heading)]"
                          >
                            {project}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Низкий индекс</h2>
              </div>
              <ul className="space-y-2">
                {atRisk.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm text-[color:var(--workspace-text)]"
                  >
                    {p.name} · индекс {p.health} · сделок {p.dealsYtd}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Топ по сделкам</h2>
              </div>
              <ul className="space-y-2">
                {[...PRIMARY_PARTNERS]
                  .sort((a, b) => b.dealsYtd - a.dealsYtd)
                  .slice(0, 4)
                  .map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-sm"
                    >
                      <span className="text-[color:var(--workspace-text)]">{p.name}</span>
                      <span className="text-emerald-300">{p.dealsYtd}</span>
                    </li>
                  ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
