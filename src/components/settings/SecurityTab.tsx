import { useState } from 'react'
import { Monitor, Smartphone, LogOut } from 'lucide-react'

interface Session {
  id: string
  device: string
  deviceType: 'desktop' | 'mobile'
  location: string
  ip: string
  lastActive: string
  current: boolean
}

const MOCK_SESSIONS: Session[] = [
  {
    id: 's1',
    device: 'Chrome · Windows 11',
    deviceType: 'desktop',
    location: 'Москва, RU',
    ip: '95.141.32.17',
    lastActive: 'Сейчас',
    current: true,
  },
  {
    id: 's2',
    device: 'Safari · iPhone 15',
    deviceType: 'mobile',
    location: 'Москва, RU',
    ip: '95.141.32.18',
    lastActive: '2 часа назад',
    current: false,
  },
  {
    id: 's3',
    device: 'Firefox · macOS',
    deviceType: 'desktop',
    location: 'Санкт-Петербург, RU',
    ip: '81.23.44.102',
    lastActive: '3 дня назад',
    current: false,
  },
]

export function SecurityTab() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS)

  function revokeSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id === 's1' || s.id !== id))
  }

  function revokeAll() {
    setSessions((prev) => prev.filter((s) => s.current))
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Last login */}
      <div className="rounded-xl border border-[color:var(--hub-card-border)] bg-[rgba(0,0,0,0.3)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--hub-badge-soon-fg)] mb-4">
          Последний вход
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[color:var(--hub-stat-label)] text-xs mb-1">Дата</p>
            <p className="text-[color:var(--app-text)] text-sm font-semibold">14 марта 2026, 09:41</p>
          </div>
          <div>
            <p className="text-[color:var(--hub-stat-label)] text-xs mb-1">Устройство</p>
            <p className="text-[color:var(--app-text)] text-sm font-semibold">Chrome · Win 11</p>
          </div>
          <div>
            <p className="text-[color:var(--hub-stat-label)] text-xs mb-1">IP-адрес</p>
            <p className="text-[color:var(--app-text)] text-sm font-semibold">95.141.32.17</p>
          </div>
        </div>
      </div>

      {/* Active sessions */}
      <div className="rounded-xl border border-[color:var(--hub-card-border)] bg-[rgba(0,0,0,0.3)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--hub-tile-icon-border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--hub-badge-soon-fg)]">
            Активные сессии
          </p>
          {sessions.length > 1 && (
            <button
              onClick={revokeAll}
              className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
            >
              Завершить все, кроме текущей
            </button>
          )}
        </div>

        <div className="divide-y divide-[color:var(--hub-tile-icon-border)]">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--hub-action-hover)] transition-colors">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--hub-card-border)] bg-[var(--hub-tile-icon-bg)] text-[color:var(--app-text-muted)]">
                {s.deviceType === 'mobile'
                  ? <Smartphone className="size-4" />
                  : <Monitor className="size-4" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[color:var(--app-text)]">{s.device}</p>
                  {s.current && (
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                      Текущая
                    </span>
                  )}
                </div>
                <p className="text-xs text-[color:var(--hub-stat-label)] mt-0.5">
                  {s.location} · {s.ip} · {s.lastActive}
                </p>
              </div>
              {!s.current && (
                <button
                  onClick={() => revokeSession(s.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/35 bg-red-900/15 px-3 py-1.5 text-xs font-medium text-red-400 hover:border-red-400/60 hover:bg-red-900/25 hover:text-red-300 transition-colors"
                >
                  <LogOut className="size-3.5" />
                  Завершить
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
