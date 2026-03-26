import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'

export interface HubSection {
  icon: React.ReactNode
  title: string
  description: string
  route?: string
  externalUrl?: string
  badge?: string
}

export interface HubStat {
  label: string
  value: string
  sub?: string
  progress?: number
}

interface Props {
  moduleIcon: React.ReactNode
  moduleName: string
  moduleDescription: string
  sections: HubSection[]
  /** Куда вести «Назад» (обычно главный дашборд `/dashboard`) */
  backRoute?: string
  backLabel?: string
  /** Если задан — вызывается вместо `navigate(backRoute)` (например `() => navigate(-1)`) */
  onBack?: () => void
  /** Внутренний маршрут или внешняя ссылка (например обычная CRM baza.sale) */
  actionButton?: { label: string; route?: string; externalUrl?: string }
  stats?: HubStat[]
}

export default function ModuleHub({
  moduleIcon,
  moduleName,
  moduleDescription,
  sections,
  backRoute,
  backLabel = 'Назад',
  onBack,
  actionButton,
  stats,
}: Props) {
  const navigate = useNavigate()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  function handleSection(s: HubSection) {
    if (s.externalUrl) { window.open(s.externalUrl, '_blank'); return }
    if (s.route) navigate(s.route)
  }

  /** Как в CRM: при двух строках сетки высота одной ячейки ~половина области. При 1–3 плитках одна строка тянула бы плитку на весь экран — добавляем вторую пустую строку 1fr. */
  const computedRows =
    sections.length === 0 ? 0 : Math.ceil(sections.length / 3)
  const minRowsToMatchCrmCellHeight =
    sections.length > 0 && sections.length < 4 ? 2 : 0
  const rows = Math.max(computedRows, minRowsToMatchCrmCellHeight)

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--app-bg)',
      padding: '32px 40px',
      fontFamily: 'Inter, sans-serif',
      overflowY: 'auto',
    }}>

      {(backRoute || onBack) && (
        <div style={{ marginBottom: 20, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => (onBack ? onBack() : backRoute && navigate(backRoute))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 36,
              padding: '0 14px',
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.35)',
              borderRadius: 10,
              color: 'var(--theme-accent-heading)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={20} strokeWidth={2} />
            {backLabel}
          </button>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 68, height: 68, flexShrink: 0,
            background: 'var(--hub-card-bg)',
            border: '1px solid var(--hub-card-border-hover)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(230,195,100,0.08)',
          }}>
            {moduleIcon}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: 'var(--theme-accent-heading)', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.1 }}>
              {moduleName}
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--hub-desc)', maxWidth: 540, lineHeight: 1.5 }}>
              {moduleDescription}
            </p>
          </div>
        </div>

        {actionButton && (
          <button
            type="button"
            onClick={() => {
              if (actionButton.externalUrl) {
                window.open(actionButton.externalUrl, '_blank', 'noopener,noreferrer')
                return
              }
              if (actionButton.route) navigate(actionButton.route)
            }}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 22px',
              background: 'transparent',
              border: '1px solid rgba(230,195,100,0.4)',
              borderRadius: 6,
              color: 'var(--theme-accent-heading)',
              fontSize: 12, fontWeight: 600,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hub-action-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {actionButton.label}
            <ArrowUpRight size={20} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        height: 1,
        background: 'var(--hub-header-line)',
        marginBottom: 24,
      }} />

      {/* ── Sections grid — flex:1 fills remaining space ─────────────── */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: 16,
        minHeight: 0,
      }}>
        {sections.map((s, i) => {
          const hovered = hoveredIdx === i
          const clickable = !!(s.route || s.externalUrl)
          return (
            <div
              key={i}
              onClick={() => handleSection(s)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                background: hovered ? 'var(--hub-card-bg-hover)' : 'var(--hub-card-bg)',
                backdropFilter: 'blur(20px)',
                boxShadow: hovered
                  ? 'inset 0 0 0 1px var(--hub-card-border-hover)'
                  : 'inset 0 0 0 1px var(--hub-card-border)',
                borderRadius: 6,
                padding: '32px 24px',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'all 0.2s',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              {/* Arrow top-right */}
              <ArrowUpRight
                size={20}
                strokeWidth={2}
                color="var(--theme-accent-heading)"
                style={{ position: 'absolute', top: 16, right: 16, opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}
              />

              {/* Badge top-right (if soon) */}
              {s.badge === 'soon' && (
                <span style={{
                  position: 'absolute', top: 14, right: 14,
                  fontSize: 8, fontWeight: 700, padding: '3px 8px', borderRadius: 3,
                  background: 'rgba(230,195,100,0.15)', color: 'var(--hub-badge-soon-fg)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>СКОРО</span>
              )}

              {/* Icon */}
              <div style={{
                width: 56, height: 56,
                background: hovered ? 'var(--hub-tile-icon-hover-bg)' : 'var(--hub-tile-icon-bg)',
                border: '1px solid var(--hub-tile-icon-border)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
                marginBottom: 20,
                flexShrink: 0,
              }}>
                <span
                  className="hub-section-icon-slot"
                  style={{ color: hovered ? 'var(--hub-tile-icon-hover-fg)' : 'var(--hub-tile-icon-fg)', display: 'flex', transition: 'color 0.2s' }}
                >
                  {s.icon}
                </span>
              </div>

              {/* Title */}
              <h3 style={{
                margin: '0 0 10px',
                fontSize: 15, fontWeight: 700,
                color: 'var(--theme-accent-heading)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}>
                {s.title}
              </h3>

            </div>
          )
        })}
      </div>

      {/* ── Stats footer ───────────────────────────────────────────────── */}
      {stats && stats.length > 0 && (
        <footer style={{
          flexShrink: 0,
          marginTop: 24,
          paddingTop: 20,
          borderTop: '1px solid var(--divider-subtle)',
          display: 'grid',
          gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
          gap: 24,
        }}>
          {stats.map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: 9, color: 'var(--hub-stat-label)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 6 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--workspace-text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {stat.value}
              </div>
              {stat.sub && (
                <div style={{ fontSize: 10, color: stat.sub.startsWith('+') ? '#4ade80' : 'var(--workspace-text-dim)', marginTop: 5 }}>
                  {stat.sub}
                </div>
              )}
              {stat.progress !== undefined && (
                <div style={{ marginTop: 8, height: 3, background: 'var(--hub-progress-track)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${stat.progress}%`, background: 'var(--hub-progress-fill)', borderRadius: 2 }} />
                </div>
              )}
            </div>
          ))}
        </footer>
      )}
    </div>
  )
}
