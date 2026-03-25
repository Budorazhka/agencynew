/** Дашборд Менеджера (Риэлтора) — фокус на личной работе */
import { useState, useEffect } from 'react'
import { Users, Bell, ChevronRight } from 'lucide-react'
import { KpiCard, StatusBadge, Section, S, C } from './shared'
import { useNavigate } from 'react-router-dom'

const TODAY_TASKS = [
  { time: '09:30', type: 'Звонок', client: 'Иванов А.В.', note: 'Квалификация по BANT', priority: 'high' },
  { time: '11:00', type: 'Встреча', client: 'Смирнова О.П.', note: 'Показ объекта на Садовой', priority: 'high' },
  { time: '13:00', type: 'Задача', client: 'Петров И.С.', note: 'Отправить подборку', priority: 'medium' },
  { time: '15:30', type: 'Звонок', client: 'Кузнецова Н.В.', note: 'Согласование даты встречи', priority: 'medium' },
  { time: '17:00', type: 'Встреча', client: 'Фролов Д.А.', note: 'Подписание предварительного ДКП', priority: 'high' },
]

const INCOMING = [
  { source: 'Авито', name: 'Новый лид', time: '2 мин назад', topic: '3к, Москва, до 12M', urgent: true },
  { source: 'Сайт', name: 'Новый лид', time: '18 мин назад', topic: '2к, Подмосковье', urgent: false },
  { source: 'ВК', name: 'Новый лид', time: '42 мин назад', topic: 'Первичка, бюджет до 8M', urgent: false },
]

export function ManagerDashboard() {
  const navigate = useNavigate()
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }))

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }))
    }, 10000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div style={S.pageTitle}>Рабочий стол Агента</div>
        <div style={{ fontSize: 12, color: C.whiteLow, letterSpacing: '0.1em' }}>{time}</div>
      </div>
      <div style={S.pageSub}>Focus Mode — максимальная скорость обработки лидов</div>

      {/* KPI */}
      <div style={S.grid4}>
        <KpiCard label="Мой план" value="74%" sub="12 из 16 сделок" color={C.orange} />
        <KpiCard label="Активных лидов" value="18" sub="В моей очереди" delta="+3 сегодня" deltaPositive />
        <KpiCard label="Задач на сегодня" value="5" sub="2 просроченных" color={C.orange} />
        <KpiCard label="Сделок в работе" value="7" sub="Разные этапы" color={C.gold} />
      </div>

      <div style={S.grid2}>
        {/* To-Do список */}
        <Section title="To-Do сегодня — приоритизированный список">
          <div style={S.card}>
            <div style={S.cardTitle}>Задачи на {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {TODAY_TASKS.map((task, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: i < TODAY_TASKS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <div style={{ fontSize: 11, color: C.whiteLow, width: 40, flexShrink: 0 }}>{task.time}</div>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: task.priority === 'high' ? C.red : C.gold,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: C.white, fontWeight: 500 }}>
                      {task.type}: {task.client}
                    </div>
                    <div style={{ fontSize: 11, color: C.whiteLow }}>{task.note}</div>
                  </div>
                  <StatusBadge
                    label={task.type}
                    color={task.type === 'Звонок' ? 'blue' : task.type === 'Встреча' ? 'gold' : 'orange'}
                  />
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Входящие лиды */}
        <Section title="Входящие — очередь обращений">
          <div style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={S.cardTitle}>Новые лиды</div>
              <button
                onClick={() => navigate('/dashboard/leads')}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.gold,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Все лиды <ChevronRight size={12} />
              </button>
            </div>
            {INCOMING.map((lead, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                background: lead.urgent ? 'rgba(248,113,113,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${lead.urgent ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.06)'}`,
                marginBottom: 8,
                cursor: 'pointer',
              }}>
                {lead.urgent && <Bell size={14} color={C.red} />}
                {!lead.urgent && <Users size={14} color={C.whiteLow} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: C.white }}>
                    <span style={{ color: C.gold, fontWeight: 600 }}>{lead.source}</span> · {lead.topic}
                  </div>
                  <div style={{ fontSize: 11, color: C.whiteLow }}>{lead.time}</div>
                </div>
                {lead.urgent && <StatusBadge label="Срочно" color="red" />}
              </div>
            ))}

            <button
              onClick={() => navigate('/dashboard/leads')}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: 8,
                color: C.gold,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              Открыть все лиды →
            </button>
          </div>
        </Section>
      </div>

      {/* Прогресс плана */}
      <Section title="Мой прогресс — выполнение личного плана">
        <div style={S.card}>
          <div style={S.cardTitle}>Прогресс-бар до цели месяца</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { label: 'Звонки', done: 47, plan: 60, color: C.blue },
              { label: 'Встречи', done: 9, plan: 16, color: C.gold },
              { label: 'Сделки', done: 3, plan: 5, color: C.green },
            ].map(item => {
              const pct = Math.round((item.done / item.plan) * 100)
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: C.whiteMid }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: C.whiteLow, marginTop: 4 }}>{item.done} / {item.plan}</div>
                </div>
              )
            })}
          </div>
        </div>
      </Section>
    </div>
  )
}
