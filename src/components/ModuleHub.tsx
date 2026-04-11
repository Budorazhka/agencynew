import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  moduleDescription?: string
  sections: HubSection[]
  /** Внутренний маршрут или внешняя ссылка (например обычная CRM baza.sale) */
  actionButton?: { label: string; route?: string; externalUrl?: string }
  stats?: HubStat[]
}

export default function ModuleHub({
  moduleIcon,
  moduleName,
  sections,
  actionButton,
  stats,
}: Props) {
  const navigate = useNavigate()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  function handleSection(s: HubSection) {
    if (s.externalUrl) { window.open(s.externalUrl, '_blank'); return }
    if (s.route) navigate(s.route)
  }

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--app-bg)',
      padding: 'clamp(20px, 3vh, 32px) clamp(16px, 2.5vw, 40px)',
      fontFamily: "'Montserrat', sans-serif",
      overflowY: 'auto',
    }}>

      {/* ── Header (нижняя граница — сплошная, без градиента «обрывка») ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          paddingBottom: 24,
          marginBottom: 24,
          borderBottom: '1px solid var(--hub-card-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 68, height: 68, flexShrink: 0,
            background: 'var(--hub-card-bg)',
            border: '1px solid var(--hub-card-border-hover)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {moduleIcon}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: 'var(--theme-accent-heading)', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.1 }}>
              {moduleName}
            </h1>
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
              border: '1px solid color-mix(in srgb, var(--gold) 40%, transparent)',
              borderRadius: 'var(--section-cta-radius)',
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

      {/* ── Sections grid: 6 в ряд от ~1536px viewport, карточки 9:5 ─────── */}
      <div className="module-hub-sections-grid">
        {sections.map((s, i) => {
          const hovered = hoveredIdx === i
          const clickable = !!(s.route || s.externalUrl)
          return (
            <div
              key={i}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={() => handleSection(s)}
              onKeyDown={(e) => {
                if (!clickable) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSection(s)
                }
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={cn(
                'module-hub-section-card',
                hovered && 'module-hub-section-card--hover',
                clickable && 'cursor-pointer',
              )}
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
                  background: 'color-mix(in srgb, var(--gold) 15%, transparent)', color: 'var(--hub-badge-soon-fg)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>СКОРО</span>
              )}

              {/* Icon */}
              <div style={{
                width: 'clamp(40px, 7vw, 52px)',
                height: 'clamp(40px, 7vw, 52px)',
                background: hovered ? 'var(--hub-tile-icon-hover-bg)' : 'var(--hub-tile-icon-bg)',
                border: '1px solid var(--hub-tile-icon-border)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
                marginBottom: 'clamp(6px, 0.7vw, 10px)',
                flexShrink: 0,
              }}>
                <span
                  className="hub-section-icon-slot"
                  style={{ color: hovered ? 'var(--hub-tile-icon-hover-fg)' : 'var(--hub-tile-icon-fg)', display: 'flex', transition: 'color 0.2s' }}
                >
                  {s.icon}
                </span>
              </div>

              {/* Title — перенос длинных подписей; без жёсткой «двух строк» при узких колонках */}
              <h3
                className="module-hub-section-title line-clamp-4 w-full min-w-0 px-0.5"
                style={{
                  margin: 0,
                  fontSize: 'clamp(10px, 1.05vw, 13px)',
                  fontWeight: 700,
                  color: 'var(--theme-accent-heading)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  lineHeight: 1.3,
                }}
              >
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
