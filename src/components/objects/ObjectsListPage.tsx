import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Building2, Home, ChevronRight, X } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { mockProperties } from '@/components/management/my-properties/mock-data'
import type { PropertyCategory, PropertyType, SaleStatus } from '@/components/management/my-properties/types'
import { FMT_USD } from '@/lib/format-currency'

const FMT_M2  = new Intl.NumberFormat('ru', { maximumFractionDigits: 0 })

const STATUS_LABELS: Record<SaleStatus, string> = {
  for_sale:   'Продаётся',
  booked:     'Забронирован',
  sold:       'Продан',
  moderation: 'На модерации',
  draft:      'Черновик',
  archive:    'Архив',
}
const STATUS_COLORS: Record<SaleStatus, string> = {
  for_sale:   '#4ade80',
  booked:     '#fb923c',
  sold:       '#94a3b8',
  moderation: '#60a5fa',
  draft:      '#a78bfa',
  archive:    '#64748b',
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  'Квартира':    <Building2 size={14} />,
  'Дом':         <Home size={14} />,
  'Коммерция':   <Building2 size={14} />,
  'Участок':     <Building2 size={14} />,
  'Апартаменты': <Building2 size={14} />,
  'Проект':      <Building2 size={14} />,
}

type StatusFilter = SaleStatus | 'all'
type TypeFilter   = PropertyType | 'all'

const MARKET_TABS: { id: PropertyCategory; label: string }[] = [
  { id: 'primary', label: 'Первичка' },
  { id: 'secondary', label: 'Вторичка' },
  { id: 'rent', label: 'Аренда' },
  { id: 'commercial', label: 'Коммерция' },
  { id: 'other', label: 'Прочее' },
]

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all',        label: 'Все' },
  { id: 'for_sale',   label: 'Продаются' },
  { id: 'booked',     label: 'Забронированы' },
  { id: 'sold',       label: 'Проданы' },
  { id: 'draft',      label: 'Черновики' },
]

export function ObjectsListPage() {
  const navigate = useNavigate()
  const [marketTab, setMarketTab]   = useState<PropertyCategory>('primary')
  const [search, setSearch]         = useState('')
  const [statusTab, setStatusTab]   = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [priceMin, setPriceMin]     = useState('')
  const [priceMax, setPriceMax]     = useState('')
  const [areaMin, setAreaMin]       = useState('')

  const pool = useMemo(
    () => mockProperties.filter(p => p.category === marketTab),
    [marketTab],
  )

  const allTypes = useMemo<PropertyType[]>(() => (
    [...new Set(pool.map(p => p.type))]
  ), [pool])

  const filtered = useMemo(() => pool.filter(p => {
    if (statusTab !== 'all' && p.status !== statusTab) return false
    if (typeFilter !== 'all' && p.type !== typeFilter) return false
    if (priceMin && p.price < Number(priceMin)) return false
    if (priceMax && p.price > Number(priceMax)) return false
    if (areaMin && p.area < Number(areaMin)) return false
    const q = search.toLowerCase()
    if (q && !p.title.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q)) return false
    return true
  }), [pool, search, statusTab, typeFilter, priceMin, priceMax, areaMin])

  // KPI по выбранному сегменту (вкладка)
  const forSaleCount = pool.filter(p => p.status === 'for_sale').length
  const bookedCount  = pool.filter(p => p.status === 'booked').length
  const soldCount    = pool.filter(p => p.status === 'sold').length
  const totalVal     = pool.filter(p => p.status === 'for_sale').reduce((s, p) => s + p.price, 0)

  return (
    <DashboardShell hideSidebar>
      <div style={{ padding: '28px 28px 64px', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif", background: 'var(--app-bg)' }}>
        {/* Header */}
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--theme-accent-heading)', marginBottom: 16 }}>Каталог объектов</div>

        {/* Сегмент рынка: отдельные вкладки, по умолчанию — первичка */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--divider-subtle)', marginBottom: 22, paddingBottom: 2 }}>
          {MARKET_TABS.map(t => {
            const cnt = mockProperties.filter(p => p.category === t.id).length
            const active = marketTab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => { setMarketTab(t.id); setStatusTab('all'); setTypeFilter('all'); setSearch('') }}
                style={{
                  padding: '10px 16px',
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  color: active ? 'var(--gold)' : 'var(--app-text-subtle)',
                  borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
                  marginBottom: -2,
                  fontFamily: 'inherit',
                  transition: 'color 0.15s',
                }}
              >
                {t.label}
                <span style={{ marginLeft: 6, fontSize: 11, opacity: active ? 0.85 : 0.5 }}>({cnt})</span>
              </button>
            )
          })}
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'В продаже', value: forSaleCount, color: '#4ade80' },
            { label: 'Забронированы', value: bookedCount, color: '#fb923c' },
            { label: 'Продано (всего)', value: soldCount, color: 'var(--app-text-subtle)' },
            { label: 'Сумма базы', value: FMT_USD.format(totalVal), color: 'var(--gold)' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--hub-card-bg)', border: '1px solid var(--hub-card-border)', borderRadius: 12, padding: '14px 18px' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--app-text-subtle)', marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--shell-search-bg)', border: '1px solid var(--shell-search-border)', borderRadius: 8, padding: '0 12px', height: 36, flex: 1, maxWidth: 320 }}>
            <Search size={13} color="var(--app-text-subtle)" />
            <input
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: 'var(--shell-search-fg)', fontFamily: 'inherit' }}
              placeholder="Поиск по названию, городу..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            {search && <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-text-subtle)' }}><X size={12} /></button>}
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as TypeFilter)}
            style={{ height: 36, padding: '0 12px', background: 'var(--shell-search-bg)', border: '1px solid var(--shell-search-border)', borderRadius: 8, color: 'var(--shell-search-fg)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <option value="all">Все типы</option>
            {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Filters toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, height: 36, padding: '0 14px', background: showFilters ? 'var(--nav-item-bg-active)' : 'var(--shell-search-bg)', border: `1px solid ${showFilters ? 'var(--hub-card-border-hover)' : 'var(--shell-search-border)'}`, borderRadius: 8, color: showFilters ? 'var(--gold)' : 'var(--app-text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            <SlidersHorizontal size={13} />
            Фильтры
          </button>
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, padding: '14px 16px', background: 'var(--hub-card-bg)', border: '1px solid var(--hub-card-border)', borderRadius: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'Цена от ($)', val: priceMin, set: setPriceMin },
              { label: 'Цена до ($)', val: priceMax, set: setPriceMax },
              { label: 'Площадь от (м²)', val: areaMin, set: setAreaMin },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--app-text-subtle)' }}>{f.label}</span>
                <input
                  type="number" value={f.val} onChange={e => f.set(e.target.value)}
                  style={{ width: 120, height: 30, padding: '0 10px', background: 'var(--shell-search-bg)', border: '1px solid var(--shell-search-border)', borderRadius: 6, color: 'var(--shell-search-fg)', fontSize: 12, fontFamily: 'inherit', outline: 'none' }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => { setPriceMin(''); setPriceMax(''); setAreaMin('') }}
              style={{ height: 30, padding: '0 12px', background: 'none', border: '1px solid var(--shell-search-border)', borderRadius: 'var(--section-cta-radius)', color: 'var(--app-text-muted)', fontSize: 11, cursor: 'pointer', marginTop: 'auto' }}
            >
              Сбросить
            </button>
          </div>
        )}

        {/* Status tabs (внутри выбранного сегмента) */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--divider-subtle)', marginBottom: 20 }}>
          {STATUS_TABS.map(t => {
            const cnt = t.id === 'all' ? pool.length : pool.filter(p => p.status === t.id).length
            return (
              <button key={t.id} type="button" onClick={() => setStatusTab(t.id)} style={{
                padding: '8px 14px', fontSize: 11, fontWeight: statusTab === t.id ? 700 : 500,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                background: 'transparent', border: 'none',
                color: statusTab === t.id ? 'var(--gold)' : 'var(--app-text-subtle)',
                borderBottom: statusTab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
                marginBottom: -1,
              }}>
                {t.label}
                <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.6 }}>({cnt})</span>
              </button>
            )
          })}
        </div>

        {/* Results count */}
        <div style={{ fontSize: 11, color: 'var(--app-text-subtle)', marginBottom: 14 }}>
          Показано: {filtered.length} объектов
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--app-text-subtle)', fontSize: 14 }}>
            Нет объектов по заданным фильтрам
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {filtered.map(prop => (
              <div
                key={prop.id}
                onClick={() => navigate(`/dashboard/objects/${prop.id}`)}
                style={{
                  background: 'var(--hub-card-bg)',
                  border: '1px solid var(--hub-card-border)',
                  borderRadius: 14, overflow: 'hidden',
                  cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--hub-card-border-hover)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--hub-card-border)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                }}
              >
                {/* Photo placeholder */}
                <div style={{ height: 140, background: 'var(--workspace-row-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid var(--workspace-row-border)`, position: 'relative' }}>
                  {prop.photo
                    ? <img src={prop.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Building2 size={36} color="var(--app-text-subtle)" />
                  }
                  {/* Status badge */}
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: STATUS_COLORS[prop.status], background: `${STATUS_COLORS[prop.status]}22`,
                    border: `1px solid ${STATUS_COLORS[prop.status]}44`,
                    padding: '3px 7px', borderRadius: 5,
                  }}>
                    {STATUS_LABELS[prop.status]}
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 6 }}>
                    <span style={{ color: 'var(--app-text-subtle)', flexShrink: 0, marginTop: 1 }}>{TYPE_ICON[prop.type] ?? <Building2 size={14} />}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text)', lineHeight: 1.4 }}>{prop.title}</span>
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--app-text-muted)', marginBottom: 12 }}>
                    {prop.city} · {prop.street}
                  </div>

                  {/* Specs row */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    {[
                      prop.type === 'Проект' && prop.totalFloors > 0 && `до ${prop.totalFloors} эт.`,
                      prop.rooms > 0 && `${prop.rooms}-к`,
                      prop.area > 0 && `${FMT_M2.format(prop.area)} м²`,
                      prop.floor > 0 && `${prop.floor}/${prop.totalFloors} эт`,
                    ].filter(Boolean).map((s, i) => (
                      <span key={i} style={{ fontSize: 11, color: 'var(--app-text-muted)', background: 'var(--shell-search-bg)', padding: '2px 7px', borderRadius: 4 }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Price row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>{FMT_USD.format(prop.price)}</div>
                      <div style={{ fontSize: 10, color: 'var(--app-text-subtle)' }}>{FMT_M2.format(prop.pricePerM2)} $/м²</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--app-text-subtle)' }}>
                      <span>{prop.agentName}</span>
                      <ChevronRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
