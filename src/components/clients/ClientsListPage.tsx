import { useState, useMemo, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  Search,
  User,
  Building2,
  Phone,
  ChevronRight,
  ChevronLeft,
  Filter,
  Banknote,
  Building,
  LineChart,
} from 'lucide-react'
import { ConversionFunnelCard } from '@/components/clients/ConversionFunnelCard'
import { CreateClientModal } from '@/components/clients/CreateClientModal'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { CLIENTS_MOCK, SEGMENT_LABELS } from '@/data/clients-mock'
import { persistSessionClient } from '@/lib/session-client'
import type { Client, ClientSegment } from '@/types/clients'

const SEGMENTS: { key: ClientSegment | 'all'; label: string }[] = [
  { key: 'all', label: 'Все клиенты' },
  { key: 'active', label: 'Активные' },
  { key: 'golden', label: 'Золотой фонд' },
  { key: 'deferred', label: 'Отложенный спрос' },
  { key: 'archived', label: 'Архив' },
]

/** Токены ALPHABASE / хабы — светлая и тёмная тема (`index.css`). */
const PRIMARY = 'var(--theme-accent-heading)'
const ON_PRIMARY = 'var(--hub-tile-icon-hover-fg)'
const BG_PAGE = 'var(--app-bg)'
const CARD = 'var(--green-card)'
const BORDER = 'var(--green-border)'
const SURFACE_LOW = 'var(--green-deep)'
const SURFACE_HIGH = 'var(--green-card-hover)'
const MUTED_ICON_BOX = 'var(--header-avatar-bg)'

const PAGE_SIZE = 8

/** Единая высота плиток метрик внизу; таблица ограничена по высоте, чтобы основной скролл шёл по всей странице */
const BENTO_TILE_MIN_PX = 168
const TABLE_BODY_MAX_H = 'min(50vh, 520px)'

function countSegment(list: Client[], seg: ClientSegment | 'all'): number {
  if (seg === 'all') return list.length
  return list.filter(c => c.segment === seg).length
}

function mutedAvatarBox(client: Client): boolean {
  if (client.segment === 'archived') return true
  if (client.segment === 'deferred' && client.dealsCount === 0) return true
  return false
}

function SegmentBadge({ segment }: { segment: ClientSegment }) {
  const styles: Record<ClientSegment, { bg: string; text: string; border: string; dot: string }> = {
    active: {
      bg: 'rgba(59, 130, 246, 0.1)',
      text: '#60a5fa',
      border: 'rgba(59, 130, 246, 0.2)',
      dot: '#60a5fa',
    },
    golden: {
      bg: 'rgba(230, 195, 100, 0.1)',
      text: 'var(--gold-light)',
      border: 'rgba(230, 195, 100, 0.2)',
      dot: 'var(--gold)',
    },
    deferred: {
      bg: 'rgba(249, 115, 22, 0.1)',
      text: '#fb923c',
      border: 'rgba(249, 115, 22, 0.2)',
      dot: '#fb923c',
    },
    archived: {
      bg: 'rgba(66, 72, 70, 0.12)',
      text: 'rgba(194, 200, 196, 0.75)',
      border: 'rgba(66, 72, 70, 0.25)',
      dot: '#8c928f',
    },
  }
  const s = styles[segment]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 999,
        background: s.bg,
        color: s.text,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        border: `1px solid ${s.border}`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {SEGMENT_LABELS[segment]}
    </span>
  )
}

export function ClientsListPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [clients, setClients] = useState<Client[]>(() => [...CLIENTS_MOCK])
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState<ClientSegment | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'company'>('all')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const agentId = currentUser?.id ?? 'lm-1'
  const agentName = currentUser?.name ?? 'Анна Первичкина'

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const matchSeg = segment === 'all' || c.segment === segment
      const matchType = typeFilter === 'all' || c.type === typeFilter
      const matchSearch = !search || [c.name, c.phone, c.email || '', c.interests || '']
        .some(s => s.toLowerCase().includes(search.toLowerCase()))
      return matchSeg && matchType && matchSearch
    })
  }, [clients, search, segment, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageSlice = useMemo(() => {
    const p = Math.min(page, totalPages)
    const start = (p - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page, totalPages])

  const startIdx = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const endIdx = filtered.length === 0 ? 0 : Math.min(safePage * PAGE_SIZE, filtered.length)

  const totalFmt = clients.length.toLocaleString('ru-RU')

  return (
    <DashboardShell hideSidebar>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          maxWidth: 'none',
          margin: 0,
          padding: '10px 24px 20px',
          boxSizing: 'border-box',
          background: BG_PAGE,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
              Клиенты
            </h1>
            <p style={{ fontSize: 12, color: 'var(--hub-desc)', margin: '4px 0 0' }}>
              Единая база физлиц и юрлиц · {totalFmt} записей
            </p>
          </div>
          <button type="button" className="alphabase-section-primary" onClick={() => setCreateOpen(true)}>
            Новый клиент
          </button>
        </div>

        <CreateClientModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          assignedAgentId={agentId}
          assignedAgentName={agentName}
          onCreated={c => {
            persistSessionClient(c)
            setClients(prev => [c, ...prev])
            setPage(1)
            setSegment('all')
            navigate(`/dashboard/clients/${c.id}`)
          }}
        />

        {/* Segment tabs */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 12,
            overflowX: 'auto',
            paddingBottom: 2,
            flexShrink: 0,
            scrollbarWidth: 'thin',
          }}
        >
          {SEGMENTS.map(s => {
            const active = segment === s.key
            const cnt = countSegment(clients, s.key).toLocaleString('ru-RU')
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => { setSegment(s.key); setPage(1) }}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: active ? '1px solid var(--hub-card-border-hover)' : '1px solid var(--green-border)',
                  background: active ? 'var(--nav-item-bg-active)' : 'transparent',
                  color: active ? PRIMARY : 'var(--hub-body)',
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: 'inherit',
                }}
              >
                {s.label}
                <span style={{ fontSize: 11, opacity: 0.6 }}>({cnt})</span>
              </button>
            )
          })}
        </div>

        {/* Filter bar */}
        <div
          style={{
            background: CARD,
            padding: 12,
            borderRadius: 12,
            border: '1px solid var(--green-border)',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            marginBottom: 10,
            flexShrink: 0,
            boxShadow: '0 8px 28px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            <Search
              size={20}
              color="var(--theme-accent-icon-dim)"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Поиск по имени, телефону, интересам…"
              style={{
                width: '100%',
                height: 38,
                padding: '0 14px 0 44px',
                background: SURFACE_LOW,
                border: 'none',
                borderRadius: 10,
                color: 'var(--app-text)',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ position: 'relative', minWidth: 160 }}>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as typeof typeFilter); setPage(1) }}
              style={{
                width: '100%',
                height: 38,
                padding: '0 36px 0 16px',
                background: SURFACE_LOW,
                border: 'none',
                borderRadius: 10,
                color: 'var(--app-text-muted)',
                fontSize: 13,
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="all">Все типы</option>
              <option value="individual">Физлица</option>
              <option value="company">Юрлица</option>
            </select>
            <span
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: 'var(--theme-accent-icon-dim)',
                fontSize: 18,
              }}
            >
              ▾
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(v => !v)}
            style={{
              height: 38,
              padding: '0 16px',
              background: SURFACE_HIGH,
              border: 'none',
              borderRadius: 10,
              color: 'var(--app-text)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
              fontFamily: 'inherit',
            }}
          >
            <Filter size={20} color="var(--gold)" style={{ opacity: 0.85 }} />
            Фильтры
          </button>
        </div>

        {filtersOpen && (
          <div
            style={{
              marginBottom: 8,
              padding: '8px 12px',
              flexShrink: 0,
              borderRadius: 10,
              background: 'var(--hub-card-bg)',
              border: '1px solid var(--hub-card-border)',
              fontSize: 12,
              color: 'var(--hub-body)',
            }}
          >
            Расширенные фильтры появятся здесь в следующей итерации.
          </div>
        )}

        {/* Таблица с ограниченной высотой — основной скролл у всей страницы, строки — внутри */}
        <div
          style={{
            flex: 'none',
            display: 'flex',
            flexDirection: 'column',
            background: CARD,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
            minHeight: 200,
          }}
        >
          <div style={{ maxHeight: TABLE_BODY_MAX_H, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' as const }}>
              <thead
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                }}
              >
                <tr style={{ background: 'var(--green-card-hover)', borderBottom: '1px solid var(--green-border)', boxShadow: '0 1px 0 var(--divider-subtle)' }}>
                {[
                  { w: '40%', label: 'КЛИЕНТ' },
                  { w: 'auto', label: 'ТЕЛЕФОН' },
                  { w: 'auto', label: 'ИСТОЧНИК', center: true },
                  { w: 'auto', label: 'СЕГМЕНТ' },
                  { w: 88, label: 'СДЕЛКИ', center: true },
                ].map(col => (
                  <th
                    key={col.label}
                    style={{
                      padding: '10px 16px',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--app-text-subtle)',
                      width: typeof col.w === 'number' ? col.w : col.w,
                      textAlign: (col.center ? 'center' : 'left') as 'center' | 'left',
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--app-text-subtle)' }}>
                    Клиенты не найдены
                  </td>
                </tr>
              )}
              {pageSlice.map((client, i) => (
                <ClientTableRow
                  key={client.id}
                  client={client}
                  isLast={i === pageSlice.length - 1 && filtered.length > 0}
                  onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                />
              ))}
            </tbody>
          </table>
          </div>

          {filtered.length > 0 && (
            <div
              style={{
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--workspace-row-bg)',
                borderTop: '1px solid var(--green-border)',
                flexShrink: 0,
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: 'var(--workspace-text-dim)' }}>
                Показано {startIdx}–{endIdx} из {filtered.length.toLocaleString('ru-RU')} записей
              </p>
              <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </div>

        {/* Bento metrics */}
        <div
          style={{
            marginTop: 12,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            flexShrink: 0,
            alignItems: 'stretch',
            overflow: 'visible',
            position: 'relative' as const,
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', minWidth: 0, minHeight: BENTO_TILE_MIN_PX }}>
            <ConversionFunnelCard tileMinHeight={BENTO_TILE_MIN_PX} />
          </div>
          <div style={{ display: 'flex', minWidth: 0, minHeight: BENTO_TILE_MIN_PX }}>
            <BentoCard
              tileMinHeight={BENTO_TILE_MIN_PX}
              kicker="Средний чек"
              icon={<Banknote size={18} color="var(--gold)" />}
              value="$285K"
            />
          </div>
          <div style={{ display: 'flex', minWidth: 0, minHeight: BENTO_TILE_MIN_PX }}>
            <BentoCard
              tileMinHeight={BENTO_TILE_MIN_PX}
              kicker="Популярный сектор"
              icon={<Building size={18} color="var(--gold)" />}
              value="Бизнес-класс"
              sub={<span style={{ fontSize: 12, color: 'var(--workspace-text-muted)', marginTop: 4, display: 'block' }}>68% новых заявок за неделю</span>}
              decorative={<LineChart size={72} color="var(--gold)" style={{ opacity: 0.1 }} />}
              hoverContent={<BatumiSegmentsHoverDetail />}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

function visiblePageNumbers(page: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  return Array.from({ length: 5 }, (_, i) => start + i)
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  const pages = visiblePageNumbers(page, totalPages)
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        style={pgBtn(page <= 1)}
      >
        <ChevronLeft size={18} color="var(--app-text-subtle)" />
      </button>
      {pages.map(p => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: p === page ? '1px solid var(--hub-card-border-hover)' : '1px solid var(--hub-card-border)',
            background: p === page ? 'var(--nav-item-bg-active)' : 'transparent',
            color: p === page ? PRIMARY : 'var(--hub-body)',
            fontSize: 11,
            fontWeight: p === page ? 700 : 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        style={pgBtn(page >= totalPages)}
      >
        <ChevronRight size={18} color="var(--app-text-muted)" />
      </button>
    </div>
  )
}

function pgBtn(disabled: boolean): CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid var(--hub-card-border)',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    fontFamily: 'inherit',
  }
}

function BatumiSegmentsHoverDetail() {
  const rows: { seg: string; range: string; note?: string }[] = [
    { seg: 'Эконом / вход', range: '≈ $650–1 100/м²', note: 'простые корпуса у моря, стартовые проекты' },
    { seg: 'Комфорт', range: '≈ $1 200–1 800/м²', note: 'массовые ЖК, Новый бульвар, типовой сервис' },
    { seg: 'Бизнес-класс', range: '≈ $1 900–2 800/м²', note: 'премиум-комплексы, пулы, межд. операторы' },
    { seg: 'Премиум / локация', range: 'до ~$3 500/м²', note: 'просп. Руставели, Old Town, виды, редкие лоты' },
  ]
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: PRIMARY,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}
      >
        Батуми · новостройки · $/м²
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map(r => (
          <div
            key={r.seg}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '6px 16px',
              alignItems: 'baseline',
              padding: '10px 0',
              borderBottom: '1px solid var(--divider-subtle)',
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--app-text)' }}>{r.seg}</div>
              {r.note && (
                <div style={{ fontSize: 13, color: 'var(--hub-body)', marginTop: 4, lineHeight: 1.4 }}>{r.note}</div>
              )}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: PRIMARY, whiteSpace: 'nowrap', textAlign: 'right' }}>{r.range}</div>
          </div>
        ))}
      </div>
      <p style={{ margin: '16px 0 0', fontSize: 12, color: 'var(--app-text-muted)', lineHeight: 1.45 }}>
        Ориентиры по обзорам рынка новостроек Батуми, 2025–2026. Не оферта — для аналитики в CRM.
      </p>
    </div>
  )
}

function BentoCard({
  kicker,
  icon,
  value,
  sub,
  decorative,
  hoverContent,
  tileMinHeight,
}: {
  kicker: string
  icon: ReactNode
  value: string
  sub?: ReactNode
  decorative?: ReactNode
  hoverContent?: ReactNode
  tileMinHeight?: number
}) {
  const [hover, setHover] = useState(false)
  const showHover = Boolean(hoverContent)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        overflow: 'visible',
        zIndex: hover && showHover ? 40 : 1,
        cursor: showHover ? 'help' : undefined,
        width: '100%',
        ...(tileMinHeight != null
          ? { flex: 1, minHeight: tileMinHeight, display: 'flex', flexDirection: 'column' as const }
          : {}),
      }}
    >
      {showHover && hover && (
        <>
          {/* мостик, чтобы курсор не терял hover между карточкой и панелью */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: '100%',
              height: 12,
              zIndex: 41,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 'calc(100% + 10px)',
              width: '100%',
              maxHeight: 'min(75vh, 520px)',
              overflowY: 'auto' as const,
              padding: '20px 22px',
              background: 'var(--app-bg)',
              border: '2px solid var(--hub-card-border-hover)',
              borderRadius: 12,
              boxShadow: '0 20px 56px rgba(0,0,0,0.85), 0 0 0 1px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
              zIndex: 42,
              color: 'var(--app-text)',
              boxSizing: 'border-box' as const,
            }}
          >
            {hoverContent}
          </div>
        </>
      )}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 12,
          border: '1px solid var(--hub-card-border)',
          background: 'var(--hub-card-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: 'inset 0 0 0 1px var(--hub-card-border)',
          ...(tileMinHeight != null
            ? {
                flex: 1,
                minHeight: tileMinHeight,
                display: 'flex',
                flexDirection: 'column' as const,
              }
            : {}),
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            ...(tileMinHeight != null
              ? { flex: 1, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center' as const }
              : {}),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: PRIMARY, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {kicker}
            </span>
            {icon}
          </div>
          <h4 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--app-text)', lineHeight: 1.2 }}>{value}</h4>
          {sub != null && sub !== false ? <div style={{ marginTop: 6 }}>{sub}</div> : null}
        </div>
        {decorative && (
          <div
            style={{
              position: 'absolute',
              right: -16,
              bottom: -16,
              pointerEvents: 'none',
            }}
          >
            {decorative}
          </div>
        )}
      </div>
    </div>
  )
}

function ClientTableRow({
  client,
  isLast,
  onClick,
}: {
  client: Client
  isLast: boolean
  onClick: () => void
}) {
  const [hover, setHover] = useState(false)
  const [chevHover, setChevHover] = useState(false)
  const muted = mutedAvatarBox(client)

  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setChevHover(false) }}
      style={{
        cursor: 'pointer',
        transition: 'background 0.15s',
        background: hover ? 'var(--dropdown-hover)' : 'transparent',
        borderBottom: isLast ? 'none' : '1px solid var(--green-border)',
      }}
    >
      <td style={{ padding: '12px 16px', verticalAlign: 'middle' as const }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: muted ? MUTED_ICON_BOX : 'var(--gold)',
              border: muted ? '1px solid var(--divider-subtle)' : 'none',
            }}
          >
            {client.type === 'company' ? (
              <Building2 size={16} color={muted ? 'rgba(194,200,196,0.45)' : ON_PRIMARY} />
            ) : (
              <User size={16} color={muted ? 'rgba(194,200,196,0.45)' : ON_PRIMARY} />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: hover ? PRIMARY : 'var(--app-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
                transition: 'color 0.15s',
              }}
            >
              {client.type === 'company' ? client.name : client.displayName}
            </div>
            {client.interests && (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--hub-body)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' as const,
                  marginTop: 2,
                }}
              >
                {client.interests}
              </div>
            )}
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 16px', verticalAlign: 'middle' as const }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--app-text-muted)' }}>
          <Phone size={16} color="var(--theme-accent-icon-dim)" style={{ flexShrink: 0 }} />
          {client.phone}
        </div>
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'center', verticalAlign: 'middle' as const }}>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: 6,
            background: SURFACE_HIGH,
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--hub-body)',
          }}
        >
          {client.source}
        </span>
      </td>
      <td style={{ padding: '12px 16px', verticalAlign: 'middle' as const }}>
        <SegmentBadge segment={client.segment} />
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'center', verticalAlign: 'middle' as const }}>
        <div
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
          onMouseEnter={() => setChevHover(true)}
          onMouseLeave={() => setChevHover(false)}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: client.dealsCount > 0 ? PRIMARY : 'var(--app-text-subtle)',
            }}
          >
            {client.dealsCount}
          </span>
          <ChevronRight
            size={16}
            color={client.dealsCount > 0 ? 'var(--theme-accent-icon-dim)' : 'var(--app-text-subtle)'}
            style={{ transform: chevHover ? 'translateX(3px)' : 'none', transition: 'transform 0.2s' }}
          />
        </div>
      </td>
    </tr>
  )
}
