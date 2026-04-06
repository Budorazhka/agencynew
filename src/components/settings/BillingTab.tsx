import { FileText, TrendingUp } from 'lucide-react'

interface UsageBarProps {
  label: string
  used: number
  total: number
  icon: React.ReactNode
}

function UsageBar({ label, used, total, icon }: UsageBarProps) {
  const pct = Math.min((used / total) * 100, 100)
  const color = pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[color:var(--theme-accent-link-dim)]">
          <span className="text-[color:var(--hub-stat-label)]">{icon}</span>
          {label}
        </div>
        <span className="text-sm font-semibold text-[color:var(--app-text)]">
          {used.toLocaleString('ru-RU')} <span className="text-[color:var(--workspace-text-muted)] font-normal">/ {total.toLocaleString('ru-RU')}</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.07)]">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

const HISTORY = [
  { date: '01.02.2026', amount: '54 $', status: 'Оплачено', id: 'inv-006' },
  { date: '01.01.2026', amount: '54 $', status: 'Оплачено', id: 'inv-005' },
  { date: '01.12.2025', amount: '54 $', status: 'Оплачено', id: 'inv-004' },
  { date: '01.11.2025', amount: '54 $', status: 'Оплачено', id: 'inv-003' },
  { date: '01.10.2025', amount: '38 $', status: 'Оплачено', id: 'inv-002' },
]

export function BillingTab() {
  return (
    <div className="space-y-8 max-w-xl">
      {/* Current plan */}
      <div className="rounded-xl border border-[color:var(--hub-card-border-hover)] bg-[var(--hub-action-hover)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[color:var(--app-text)]">Бизнес</span>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
                Активен
              </span>
            </div>
            <p className="mt-1 text-sm text-[color:var(--hub-desc)]">
              Следующее списание — <span className="text-[color:var(--app-text-muted)]">01.03.2026</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[color:var(--app-text)]">54 $</p>
            <p className="text-xs text-[color:var(--hub-stat-label)]">в месяц</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="rounded-xl border border-[color:var(--hub-card-border-hover)] px-4 py-2 text-sm font-medium text-[color:var(--theme-accent-link-dim)] hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--app-text)] transition-colors">
            Изменить тариф
          </button>
          <button className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400/80 hover:border-red-400/50 hover:text-red-300 transition-colors">
            Отменить подписку
          </button>
        </div>
      </div>

      {/* Usage */}
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--hub-stat-label)]">
          Использование
        </p>
        <div className="rounded-xl border border-[color:var(--hub-tile-icon-border)] bg-[rgba(0,0,0,0.15)] p-5 space-y-5">
          <UsageBar label="Объекты"     used={26}    total={100}  icon={<TrendingUp className="size-3.5" />} />
          <UsageBar label="Менеджеры"   used={4}     total={10}   icon={<span className="text-xs">👤</span>} />
        </div>
      </div>

      {/* Payment history */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--hub-stat-label)]">
          История платежей
        </p>
        <div className="rounded-xl border border-[color:var(--hub-tile-icon-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--hub-tile-icon-border)] bg-[rgba(0,0,0,0.2)]">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[color:var(--hub-stat-label)] uppercase tracking-wide">Дата</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[color:var(--hub-stat-label)] uppercase tracking-wide">Сумма</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[color:var(--hub-stat-label)] uppercase tracking-wide">Статус</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-[color:var(--hub-stat-label)] uppercase tracking-wide">Счёт</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--hub-card-border)]">
              {HISTORY.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--hub-action-hover)] transition-colors">
                  <td className="px-4 py-3 text-[color:var(--theme-accent-link-dim)]">{row.date}</td>
                  <td className="px-4 py-3 font-semibold text-[color:var(--app-text)]">{row.amount}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="flex items-center gap-1 ml-auto text-xs text-[color:var(--hub-stat-label)] hover:text-[color:var(--app-text-muted)] transition-colors">
                      <FileText className="size-3.5" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
