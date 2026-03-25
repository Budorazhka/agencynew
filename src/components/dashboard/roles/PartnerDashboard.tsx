/** Дашборд Партнёра — изолированная readonly-среда */
import { useState } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { KpiCard, StatusBadge, Section, S, C } from './shared'

const MY_LEADS = [
  { client: 'Новиков А.В.', topic: '3к, до 12M', status: 'В обработке', date: '18.03.2026', reward: null },
  { client: 'Горбунова М.С.', topic: '2к, Первичка', status: 'На задатке', date: '12.03.2026', reward: '$85,000' },
  { client: 'Тихомиров К.П.', topic: '4к, Бизнес-класс', status: 'Выплата', date: '05.03.2026', reward: '$120,000' },
  { client: 'Белова О.Н.', topic: '1к, до 5M', status: 'В обработке', date: '20.03.2026', reward: null },
  { client: 'Захаров Д.В.', topic: '2к, Вторичка', status: 'Завершено', date: '28.02.2026', reward: '$62,000' },
]

const STATUS_COLOR: Record<string, 'green' | 'orange' | 'gold' | 'blue'> = {
  'Выплата': 'green',
  'На задатке': 'orange',
  'В обработке': 'blue',
  'Завершено': 'gold',
}

export function PartnerDashboard() {
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', topic: '' })

  return (
    <div style={S.page}>
      <div style={S.pageTitle}>Кабинет Партнёра</div>
      <div style={S.pageSub}>Передача лидов, статусы и ваш баланс вознаграждений</div>

      {/* KPI Row */}
      <div style={S.grid4}>
        <KpiCard label="Баланс" value="$267,000" sub="Начислено, не выплачено" color={C.green} />
        <KpiCard label="Передано лидов" value="12" sub="Всего за всё время" />
        <KpiCard label="Конвертировано" value="5" sub="Дошли до сделки" color={C.gold} delta="42%" deltaPositive />
        <KpiCard label="В обработке" value="2" sub="Ещё не завершены" color={C.blue} />
      </div>

      {/* Кнопка быстрого действия */}
      <Section title="Быстрое действие">
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 4 }}>
                Передать лид
              </div>
              <div style={{ fontSize: 12, color: C.whiteLow }}>
                Укажите контакт клиента — наш менеджер свяжется в течение 5 минут
              </div>
            </div>
            <button
              onClick={() => setShowTransferForm(!showTransferForm)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                background: 'var(--gold-dark)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Plus size={14} />
              Передать лид
            </button>
          </div>

          {showTransferForm && (
            <div style={{
              marginTop: 16,
              padding: 16,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                {[
                  { label: 'Имя клиента', key: 'name', placeholder: 'Иванов Александр' },
                  { label: 'Телефон', key: 'phone', placeholder: '+7 (999) 123-45-67' },
                  { label: 'Запрос', key: 'topic', placeholder: '2к, до 8M, Москва' },
                ].map(field => (
                  <div key={field.key}>
                    <div style={{ fontSize: 10, color: C.whiteLow, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                      {field.label}
                    </div>
                    <input
                      value={formData[field.key as keyof typeof formData]}
                      onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 6,
                        color: C.white,
                        fontSize: 12,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setShowTransferForm(false); setFormData({ name: '', phone: '', topic: '' }) }}
                style={{
                  padding: '8px 20px',
                  background: 'rgba(201,168,76,0.15)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: 6,
                  color: C.gold,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Отправить
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* Канбан переданных лидов */}
      <Section title="Мои переданные лиды">
        <div style={S.card}>
          <div style={S.cardTitle}>Статусы и вознаграждения</div>
          {MY_LEADS.map((lead, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: i < MY_LEADS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: C.white, fontWeight: 500 }}>{lead.client}</div>
                <div style={{ fontSize: 11, color: C.whiteLow }}>{lead.topic} · {lead.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {lead.reward && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.green, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Wallet size={12} />
                    {lead.reward}
                  </div>
                )}
                <StatusBadge
                  label={lead.status}
                  color={STATUS_COLOR[lead.status] || 'gold'}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Информация о вознаграждениях */}
      <Section title="Структура вознаграждений">
        <div style={S.card}>
          <div style={S.cardTitle}>Начислено и выплачено</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 10, color: C.whiteLow, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Начислено всего</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.green }}>$389,000</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.whiteLow, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Выплачено</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.whiteMid }}>$122,000</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.whiteLow, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Ожидает выплаты</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.gold }}>$267,000</div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
