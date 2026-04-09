import { useMemo, useState } from 'react'
import { AlertTriangle, Check, FileText, X, Zap, Crown, Building2 } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
}

type Plan = {
  key: string
  name: string
  price: string
  period: string
  icon: React.ReactNode
  color: string
  current: boolean
  features: { label: string; included: boolean }[]
}

const PLANS: Plan[] = [
  {
    key: 'starter',
    name: 'Старт',
    price: '$2,900',
    period: '$/мес',
    icon: <Zap size={20} />,
    color: '#60a5fa',
    current: false,
    features: [
      { label: 'До 5 пользователей', included: true },
      { label: 'Канбан сделок', included: true },
      { label: 'Модуль лидов', included: true },
      { label: 'Клиенты и объекты', included: true },
      { label: 'Задачи и брони', included: true },
      { label: 'Партнёрский кабинет', included: false },
      { label: 'LMS (обучение)', included: false },
      { label: 'Ролевые дашборды', included: false },
      { label: 'White-label', included: false },
      { label: 'API-доступ', included: false },
    ],
  },
  {
    key: 'pro',
    name: 'Профи',
    price: '$7,900',
    period: '$/мес',
    icon: <Crown size={20} />,
    color: '#c9a84c',
    current: true,
    features: [
      { label: 'До 25 пользователей', included: true },
      { label: 'Канбан сделок', included: true },
      { label: 'Модуль лидов', included: true },
      { label: 'Клиенты и объекты', included: true },
      { label: 'Задачи и брони', included: true },
      { label: 'Партнёрский кабинет', included: true },
      { label: 'LMS (обучение)', included: true },
      { label: 'Ролевые дашборды', included: true },
      { label: 'White-label', included: false },
      { label: 'API-доступ', included: false },
    ],
  },
  {
    key: 'enterprise',
    name: 'Корпоратив',
    price: 'от $24,900',
    period: '$/мес',
    icon: <Building2 size={20} />,
    color: '#a78bfa',
    current: false,
    features: [
      { label: 'Неограниченно пользователей', included: true },
      { label: 'Канбан сделок', included: true },
      { label: 'Модуль лидов', included: true },
      { label: 'Клиенты и объекты', included: true },
      { label: 'Задачи и брони', included: true },
      { label: 'Партнёрский кабинет', included: true },
      { label: 'LMS (обучение)', included: true },
      { label: 'Ролевые дашборды', included: true },
      { label: 'White-label', included: true },
      { label: 'API-доступ', included: true },
    ],
  },
]

const INVOICE_ROWS = [
  { id: 'inv-3', date: '2026-03-22', amount: '$7,900', plan: 'Профи', status: 'Оплачен' },
  { id: 'inv-2', date: '2026-02-22', amount: '$7,900', plan: 'Профи', status: 'Оплачен' },
  { id: 'inv-1', date: '2026-01-22', amount: '$7,900', plan: 'Профи', status: 'Оплачен' },
]

export function TariffPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  const usageAlerts = useMemo(
    () => [
      { label: 'Пользователи', pct: 10 / 25, warn: 0.8 },
      { label: 'Сделки/мес', pct: 12 / 100, warn: 0.85 },
      { label: 'Объекты', pct: 47 / 500, warn: 0.9 },
    ],
    [],
  )

  return (
    <DashboardShell>
      <div style={{ padding: '24px 28px 48px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 4 }}>Тарифные планы</div>
          <div style={{ fontSize: 12, color: C.whiteLow }}>Текущий тариф: <span style={{ color: C.gold, fontWeight: 700 }}>Профи</span> · Следующее списание: 22 апреля 2026</div>
        </div>

        <div className="mx-auto mb-6 max-w-6xl space-y-4">
          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="mb-2 text-sm font-semibold text-[color:var(--theme-accent-heading)]">Биллинг (UI)</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBilling('monthly')}
                className={
                  billing === 'monthly'
                    ? 'rounded-md border border-[color:var(--gold)]/50 bg-[color:var(--gold)]/10 px-3 py-2 text-xs font-semibold text-[color:var(--gold)]'
                    : 'rounded-md border border-[var(--hub-card-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-xs text-[color:var(--workspace-text-muted)]'
                }
              >
                Помесячно
              </button>
              <button
                type="button"
                onClick={() => setBilling('annual')}
                className={
                  billing === 'annual'
                    ? 'rounded-md border border-[color:var(--gold)]/50 bg-[color:var(--gold)]/10 px-3 py-2 text-xs font-semibold text-[color:var(--gold)]'
                    : 'rounded-md border border-[var(--hub-card-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-xs text-[color:var(--workspace-text-muted)]'
                }
              >
                Годовой (−15%)
              </button>
            </div>
            <p className="mt-2 text-xs text-[color:var(--app-text-muted)]">
              Отображение цен на карточках планов ниже — демо; переключатель влияет только на подпись в сводке.
            </p>
          </section>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Последние счета</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase text-[color:var(--app-text-subtle)]">
                      <th className="px-2 py-2">Дата</th>
                      <th className="px-2 py-2">Сумма</th>
                      <th className="px-2 py-2">План</th>
                      <th className="px-2 py-2">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INVOICE_ROWS.map((inv) => (
                      <tr key={inv.id} className="border-b border-[color:var(--workspace-row-border)]">
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{inv.date}</td>
                        <td className="px-2 py-2 text-emerald-300">{inv.amount}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{inv.plan}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{inv.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-[color:var(--app-text-muted)]">Период оплаты: {billing === 'monthly' ? 'ежемесячно' : 'ежегодно (предпросмотр)'}</p>
            </section>

            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Лимиты</h2>
              </div>
              <ul className="space-y-2">
                {usageAlerts.map((u) => (
                  <li key={u.label} className="text-sm text-[color:var(--workspace-text)]">
                    <div className="flex justify-between gap-2">
                      <span>{u.label}</span>
                      <span className={u.pct >= u.warn ? 'text-amber-300' : 'text-[color:var(--app-text-subtle)]'}>
                        {Math.round(u.pct * 100)}% от лимита
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[color:var(--workspace-row-border)]">
                      <div
                        className="h-full rounded-full bg-[color:var(--gold)]"
                        style={{ width: `${Math.min(100, Math.round(u.pct * 100))}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Current usage */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Пользователей', used: 10, max: 25, color: '#60a5fa' },
            { label: 'Сделок/мес', used: 12, max: 100, color: C.gold },
            { label: 'Объектов',   used: 47, max: 500, color: '#4ade80' },
            { label: 'API вызовов', used: 0, max: 0, color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, color: C.whiteLow, marginBottom: 6 }}>{s.label}</div>
              {s.max === 0 ? (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Недоступно</div>
              ) : (
                <>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.used} / {s.max}</div>
                  <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ width: `${(s.used / s.max) * 100}%`, height: '100%', borderRadius: 2, background: s.color }} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 900 }}>
          {PLANS.map(plan => (
            <div
              key={plan.key}
              style={{
                background: plan.current ? `${plan.color}08` : C.card,
                border: `1px solid ${plan.current ? `${plan.color}55` : C.border}`,
                borderRadius: 14,
                padding: '22px 20px',
                position: 'relative',
              }}
            >
              {plan.current && (
                <div style={{
                  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '3px 12px', borderRadius: 20,
                  background: `${plan.color}22`, border: `1px solid ${plan.color}66`, color: plan.color,
                  whiteSpace: 'nowrap',
                }}>
                  Текущий план
                </div>
              )}

              {/* Icon + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ color: plan.color }}>{plan.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.white }}>{plan.name}</div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: plan.color }}>{plan.price}</span>
                <span style={{ fontSize: 12, color: C.whiteLow, marginLeft: 4 }}>{plan.period}</span>
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {f.included
                      ? <Check size={13} color="#4ade80" style={{ flexShrink: 0 }} />
                      : <X size={13} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                    }
                    <span style={{ fontSize: 12, color: f.included ? C.whiteMid : 'rgba(255,255,255,0.25)' }}>{f.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                style={{
                  width: '100%', padding: '10px 0', borderRadius: 10,
                  fontSize: 12, fontWeight: 700, cursor: plan.current ? 'default' : 'pointer',
                  background: plan.current ? `${plan.color}10` : `${plan.color}18`,
                  border: `1px solid ${plan.current ? `${plan.color}33` : `${plan.color}55`}`,
                  color: plan.current ? `${plan.color}88` : plan.color,
                  letterSpacing: '0.05em',
                }}
              >
                {plan.current ? 'Текущий план' : plan.key === 'enterprise' ? 'Связаться с нами' : 'Перейти на план'}
              </button>
            </div>
          ))}
        </div>

        {/* Billing info */}
        <div style={{ marginTop: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', maxWidth: 500 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.whiteLow, marginBottom: 10 }}>
            Платёжная информация
          </div>
          {[
            { label: 'Способ оплаты', value: '**** **** **** 4242' },
            { label: 'Следующее списание', value: '22 апреля 2026 · $7,900' },
            { label: 'Договор', value: '№ AG-2024-0087' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? `1px solid rgba(255,255,255,0.05)` : 'none' }}>
              <span style={{ fontSize: 12, color: C.whiteLow }}>{row.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.whiteMid }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
