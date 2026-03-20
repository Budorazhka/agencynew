import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useRolePermissions } from '@/hooks/useRolePermissions'

interface NotifItem {
  id: string
  label: string
  description: string
  ropOnly?: boolean
}

const NOTIFICATIONS: NotifItem[] = [
  {
    id: 'new_lead',
    label: 'Новый лид назначен',
    description: 'Уведомление при поступлении нового лида на вас',
  },
  {
    id: 'lead_status',
    label: 'Смена статуса лида',
    description: 'Когда статус лида изменяется в воронке',
  },
  {
    id: 'property_update',
    label: 'Объект требует обновления',
    description: 'Напоминание подтвердить актуальность объекта',
  },
  {
    id: 'team_activity',
    label: 'Активность команды',
    description: 'Сводка по активности менеджеров за день',
    ropOnly: true,
  },
  {
    id: 'weekly_report',
    label: 'Еженедельный дайджест',
    description: 'Отчёт по лидам, сделкам и объектам за неделю',
    ropOnly: true,
  },
]

type Channel = 'telegram' | 'crm'

const CHANNELS: { id: Channel; label: string; icon: string }[] = [
  { id: 'telegram', label: 'Telegram', icon: '✈' },
  { id: 'crm',      label: 'СРМ',     icon: '📋' },
]

export function NotificationsTab() {
  const { isRopOrAbove } = useRolePermissions()

  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    new_lead:        true,
    lead_status:     true,
    property_update: true,
    team_activity:   false,
    weekly_report:   false,
  })

  const [channels, setChannels] = useState<Set<Channel>>(new Set(['crm']))

  function toggleChannel(c: Channel) {
    setChannels((prev) => {
      const n = new Set(prev)
      n.has(c) ? n.delete(c) : n.add(c)
      return n
    })
  }

  const visible = NOTIFICATIONS.filter((n) => !n.ropOnly || isRopOrAbove)

  return (
    <div className="space-y-8 max-w-xl">
      {/* Events */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[rgba(242,207,141,0.55)] mb-4">
          События
        </p>
        <div className="divide-y divide-[rgba(242,207,141,0.08)] rounded-xl border border-[rgba(242,207,141,0.12)] bg-[rgba(0,0,0,0.15)] overflow-hidden">
          {visible.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#fcecc8]">{item.label}</p>
                <p className="mt-0.5 text-xs text-[rgba(242,207,141,0.45)]">{item.description}</p>
              </div>
              <Switch
                checked={enabled[item.id] ?? false}
                onCheckedChange={(v) => setEnabled((p) => ({ ...p, [item.id]: v }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Channels */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[rgba(242,207,141,0.55)]">
          Канал уведомлений
        </p>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((c) => {
            const active = channels.has(c.id)
            return (
              <button
                key={c.id}
                onClick={() => toggleChannel(c.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                  active
                    ? 'border-[rgba(242,207,141,0.5)] bg-[rgba(242,207,141,0.1)] text-[#fcecc8]'
                    : 'border-[rgba(242,207,141,0.15)] text-[rgba(242,207,141,0.4)] hover:border-[rgba(242,207,141,0.3)] hover:text-[rgba(242,207,141,0.7)]',
                )}
              >
                <span>{c.icon}</span>
                {c.label}
                {active && (
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-[rgba(242,207,141,0.3)]">
          Можно выбрать несколько каналов одновременно
        </p>
      </div>
    </div>
  )
}
