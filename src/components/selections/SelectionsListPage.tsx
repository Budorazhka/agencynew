import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelectionsBasePath, useSelectionsMarket } from '@/hooks/useSelectionsBasePath'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { SELECTIONS_MOCK } from '@/data/selections-mock'
import { loadExtraSelections } from '@/lib/selections-storage'
import {
  type SelectionStatus,
  type PropertyMarket,
  SELECTION_STATUS_LABELS,
  SELECTION_STATUS_COLORS,
  MARKET_COLORS,
} from '@/types/selections'
import {
  Plus,
  Search,
  Eye,
  Send,
  Building2,
  Home,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { formatUsdCompact } from '@/lib/format-currency'

const STATUS_FILTERS: { value: SelectionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'draft', label: 'Черновики' },
  { value: 'sent', label: 'Отправлены' },
  { value: 'viewed', label: 'Просмотрены' },
  { value: 'deal_created', label: 'Сделка создана' },
  { value: 'archived', label: 'Архив' },
]

const MARKET_FILTERS: { value: PropertyMarket | 'all'; label: string }[] = [
  { value: 'all', label: 'Все типы' },
  { value: 'primary', label: 'Новостройки' },
  { value: 'secondary', label: 'Вторичка' },
]

function formatPrice(price: number) {
  return formatUsdCompact(price)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function SelectionsListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectionsBase = useSelectionsBasePath()
  const market = useSelectionsMarket()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<SelectionStatus | 'all'>('all')
  const [marketFilter, setMarketFilter] = useState<PropertyMarket | 'all'>(
    () => (market === 'newbuild' ? 'primary' : 'secondary'),
  )

  const allSelections = useMemo(
    () => [...loadExtraSelections(), ...SELECTIONS_MOCK],
    [location.pathname, location.key],
  )

  const filtered = useMemo(() => {
    return allSelections.filter(sel => {
      if (statusFilter !== 'all' && sel.status !== statusFilter) return false
      if (marketFilter !== 'all') {
        const hasMarket = sel.properties.some(p => p.market === marketFilter)
        if (!hasMarket) return false
      }
      if (query.trim().length >= 2) {
        const q = query.toLowerCase()
        if (
          !sel.title.toLowerCase().includes(q) &&
          !sel.clientName.toLowerCase().includes(q) &&
          !sel.agentName.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [allSelections, query, statusFilter, marketFilter])

  return (
    <DashboardShell hideSidebar>
      <div
        style={{
          padding: '28px 32px',
          minHeight: '100%',
          fontFamily: "'Montserrat', sans-serif",
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          background: 'var(--app-bg)',
        }}
      >

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '0.02em' }}>
            {market === 'newbuild' ? 'Подборки · новостройки' : 'Подборки · вторичка'}
          </div>
          <button
            type="button"
            className="alphabase-section-primary"
            onClick={() => navigate(`${selectionsBase}/new`)}
          >
            <Plus size={14} strokeWidth={2.5} />
            Новая подборка
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--green-deep)', border: '1px solid var(--green-border)',
            borderRadius: 8, padding: '0 12px', height: 34, minWidth: 240,
          }}>
            <Search size={13} color="var(--app-text-subtle)" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Клиент, агент, название..."
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 12, color: 'var(--app-text)', fontFamily: 'inherit', flex: 1,
              }}
            />
          </div>

          {/* Status pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', border: '1px solid',
                  background: statusFilter === f.value ? 'var(--nav-item-bg-active)' : 'transparent',
                  borderColor: statusFilter === f.value ? 'var(--hub-card-border-hover)' : 'var(--green-border)',
                  color: statusFilter === f.value ? 'var(--theme-accent-heading)' : 'var(--app-text-subtle)',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Market type pills */}
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            {MARKET_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setMarketFilter(f.value)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', border: '1px solid',
                  background: marketFilter === f.value ? 'rgba(96,165,250,0.12)' : 'transparent',
                  borderColor: marketFilter === f.value ? 'rgba(96,165,250,0.4)' : 'var(--green-border)',
                  color: marketFilter === f.value ? MARKET_COLORS.secondary : 'var(--app-text-subtle)',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div style={{ fontSize: 11, color: 'var(--app-text-subtle)', marginBottom: 12, letterSpacing: '0.05em' }}>
          ПОКАЗАНО {filtered.length} ИЗ {SELECTIONS_MOCK.length}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--app-text-subtle)', padding: '48px 0', fontSize: 13 }}>
              Подборок не найдено
            </div>
          )}
          {filtered.map(sel => {
            const statusColor = SELECTION_STATUS_COLORS[sel.status]
            const primaryCount = sel.properties.filter(p => p.market === 'primary').length
            const secondaryCount = sel.properties.filter(p => p.market === 'secondary').length
            const likedCount = sel.properties.filter(p => p.liked).length

            return (
              <div
                key={sel.id}
                onClick={() => navigate(`${selectionsBase}/${sel.id}`)}
                style={{
                  background: 'var(--hub-card-bg)',
                  border: '1px solid var(--hub-card-border)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--hub-card-border-hover)'
                  e.currentTarget.style.background = 'var(--hub-card-bg-hover)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--hub-card-border)'
                  e.currentTarget.style.background = 'var(--hub-card-bg)'
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: 'var(--hub-tile-icon-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileText size={18} color="var(--gold)" />
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: 'var(--app-text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 3,
                  }}>
                    {sel.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--app-text-muted)' }}>
                    <span>{sel.clientName}</span>
                    <span>·</span>
                    <span>{sel.agentName}</span>
                    {sel.budget && (
                      <>
                        <span>·</span>
                        <span>до {formatPrice(sel.budget)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Property type badges */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {primaryCount > 0 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '3px 8px', borderRadius: 12,
                      background: 'var(--hub-tile-icon-bg)', border: '1px solid var(--hub-tile-icon-border)',
                      fontSize: 10, fontWeight: 700, color: MARKET_COLORS.primary,
                    }}>
                      <Building2 size={10} />
                      {primaryCount} нов.
                    </div>
                  )}
                  {secondaryCount > 0 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '3px 8px', borderRadius: 12,
                      background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
                      fontSize: 10, fontWeight: 700, color: MARKET_COLORS.secondary,
                    }}>
                      <Home size={10} />
                      {secondaryCount} втор.
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 16, flexShrink: 0, minWidth: 120 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)' }}>{sel.properties.length}</div>
                    <div style={{ fontSize: 9, color: 'var(--app-text-subtle)', letterSpacing: '0.06em' }}>объектов</div>
                  </div>
                  {sel.viewCount > 0 && (
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Eye size={12} color="var(--app-text-muted)" />
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)' }}>{sel.viewCount}</span>
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--app-text-subtle)', letterSpacing: '0.06em' }}>просмотров</div>
                    </div>
                  )}
                  {likedCount > 0 && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#22c55e' }}>+{likedCount}</div>
                      <div style={{ fontSize: 9, color: 'var(--app-text-subtle)', letterSpacing: '0.06em' }}>лайков</div>
                    </div>
                  )}
                </div>

                {/* Status + date */}
                <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 100 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 12,
                    background: `${statusColor}18`, border: `1px solid ${statusColor}40`,
                    fontSize: 10, fontWeight: 700, color: statusColor,
                    letterSpacing: '0.06em', marginBottom: 4,
                  }}>
                    {sel.status === 'sent' && <Send size={9} />}
                    {SELECTION_STATUS_LABELS[sel.status].toUpperCase()}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--app-text-subtle)' }}>
                    {formatDate(sel.sentAt || sel.createdAt)}
                  </div>
                </div>

                <ChevronRight size={14} color="var(--app-text-subtle)" style={{ flexShrink: 0 }} />
              </div>
            )
          })}
        </div>
      </div>
    </DashboardShell>
  )
}
