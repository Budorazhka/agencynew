/**
 * SLA-таймер первого контакта.
 * Показывает время с момента создания лида.
 * Цвет: зелёный <5 мин | оранжевый 5–15 мин | красный >15 мин
 */
import { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

interface SlaTimerProps {
  createdAt: string
  /** Если true — показывать полный badge. Если false — только иконка+время */
  compact?: boolean
}

function getMinutes(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / 60000
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}ч ${m}мин`
  if (m > 0) return `${m}:${String(s).padStart(2, '0')}`
  return `${s}с`
}

export function SlaTimer({ createdAt, compact = false }: SlaTimerProps) {
  const [elapsed, setElapsed] = useState(() => Date.now() - new Date(createdAt).getTime())

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Date.now() - new Date(createdAt).getTime())
    }, 30_000)
    return () => clearInterval(id)
  }, [createdAt])

  const mins = elapsed / 60000

  const color = mins < 5 ? '#4ade80' : mins < 15 ? '#fb923c' : '#ef4444'
  const label = mins < 5 ? 'SLA OK' : mins < 15 ? 'SLA' : 'Просрочен SLA'
  const Icon = mins >= 5 ? AlertTriangle : Clock

  if (compact) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 10,
        fontWeight: 700,
        color,
        letterSpacing: '0.05em',
      }}>
        <Icon size={10} />
        {formatDuration(elapsed)}
      </span>
    )
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '2px 8px',
      borderRadius: 6,
      background: `${color}18`,
      border: `1px solid ${color}44`,
      fontSize: 10,
      fontWeight: 700,
      color,
      letterSpacing: '0.06em',
      animation: mins >= 5 && mins < 15 ? 'sla-pulse 1.5s infinite' : undefined,
    }}>
      <Icon size={10} />
      {label} · {formatDuration(elapsed)}
      <style>{`
        @keyframes sla-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </span>
  )
}

/** Утилита: вернуть true если лид нарушает SLA (>5 мин без обработки) */
export function isSlaBreached(createdAt: string): boolean {
  return getMinutes(createdAt) >= 5
}

/** Утилита: уровень SLA */
export function getSlaLevel(createdAt: string): 'ok' | 'warning' | 'critical' {
  const m = getMinutes(createdAt)
  if (m < 5) return 'ok'
  if (m < 15) return 'warning'
  return 'critical'
}
