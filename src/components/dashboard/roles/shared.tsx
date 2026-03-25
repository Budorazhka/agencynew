/** Общие утилиты и компоненты для ролевых дашбордов */

import type { ReactNode } from 'react'

// ─── Цвета и стили ───────────────────────────────────────────────────────────

export const C = {
  gold: 'var(--gold)',
  goldMuted: 'rgba(201,168,76,0.4)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.45)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
  cardHover: 'var(--green-card-hover)',
  red: '#f87171',
  green: '#4ade80',
  blue: '#60a5fa',
  orange: '#fb923c',
}

export const S = {
  page: {
    padding: '28px 28px 40px',
    maxWidth: 1200,
  } as React.CSSProperties,

  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: C.white,
    letterSpacing: '-0.01em',
    marginBottom: 4,
  } as React.CSSProperties,

  pageSub: {
    fontSize: 13,
    color: C.whiteLow,
    marginBottom: 28,
  } as React.CSSProperties,

  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 20,
  } as React.CSSProperties,

  grid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 16,
    marginBottom: 20,
  } as React.CSSProperties,

  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 20,
  } as React.CSSProperties,

  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: '20px 22px',
  } as React.CSSProperties,

  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: C.goldMuted,
    marginBottom: 10,
  } as React.CSSProperties,

  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: C.goldMuted,
    marginBottom: 12,
    marginTop: 8,
  } as React.CSSProperties,
}

// ─── KPI виджет ──────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  color?: string
  delta?: string
  deltaPositive?: boolean
}

export function KpiCard({ label, value, sub, color, delta, deltaPositive }: KpiCardProps) {
  return (
    <div style={S.card}>
      <div style={S.cardTitle}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: color || C.white, lineHeight: 1 }}>
        {value}
      </div>
      {delta && (
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: deltaPositive ? C.green : C.red,
          marginTop: 6,
        }}>
          {deltaPositive ? '▲' : '▼'} {delta}
        </div>
      )}
      {sub && (
        <div style={{ fontSize: 12, color: C.whiteLow, marginTop: 4 }}>{sub}</div>
      )}
    </div>
  )
}

// ─── Мини бар-чарт ───────────────────────────────────────────────────────────

export function MiniBarChart({ values, color = C.gold }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            borderRadius: 2,
            background: i === values.length - 1 ? color : `${color}55`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Статусная строка (badge) ────────────────────────────────────────────────

interface StatusBadgeProps {
  label: string
  color?: 'green' | 'red' | 'orange' | 'blue' | 'gold'
}

const BADGE_COLORS = {
  green: { bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)', text: C.green },
  red:   { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', text: C.red },
  orange:{ bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.3)', text: C.orange },
  blue:  { bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)', text: C.blue },
  gold:  { bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.3)', text: C.gold },
}

export function StatusBadge({ label, color = 'gold' }: StatusBadgeProps) {
  const c = BADGE_COLORS[color]
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 20,
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      letterSpacing: '0.06em',
    }}>
      {label}
    </span>
  )
}

// ─── Список строк (таблица-заглушка) ────────────────────────────────────────

interface ListRow {
  left: string
  middle?: string
  right?: string
  rightColor?: string
}

export function SimpleList({ rows, title }: { rows: ListRow[]; title?: string }) {
  return (
    <div style={S.card}>
      {title && <div style={S.cardTitle}>{title}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: i < rows.length - 1 ? `1px solid rgba(255,255,255,0.06)` : 'none',
          }}>
            <div>
              <div style={{ fontSize: 13, color: C.whiteMid, fontWeight: 500 }}>{row.left}</div>
              {row.middle && <div style={{ fontSize: 11, color: C.whiteLow }}>{row.middle}</div>}
            </div>
            {row.right && (
              <div style={{ fontSize: 13, fontWeight: 700, color: row.rightColor || C.white }}>
                {row.right}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Воронка (progress bars) ─────────────────────────────────────────────────

interface FunnelItem {
  label: string
  value: number
  total: number
  color?: string
}

export function FunnelWidget({ title, items }: { title: string; items: FunnelItem[] }) {
  return (
    <div style={S.card}>
      <div style={S.cardTitle}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => {
          const pct = Math.round((item.value / Math.max(item.total, 1)) * 100)
          return (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: C.whiteMid }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{item.value}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: item.color || C.gold,
                  borderRadius: 2,
                  transition: 'width 0.5s',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Секция обёртка ──────────────────────────────────────────────────────────

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {title && <div style={S.sectionLabel}>{title}</div>}
      {children}
    </div>
  )
}
