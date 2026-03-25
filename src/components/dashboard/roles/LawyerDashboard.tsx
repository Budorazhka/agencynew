/** Дашборд Юриста — очередь юридических задач */
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { KpiCard, StatusBadge, Section, S, C } from './shared'

const LEGAL_QUEUE = [
  { deal: 'Иванов А.В. — ул. Садовая', stage: 'Подготовка к задатку', task: 'Подготовить договор задатка', hours: 1.5, urgent: true },
  { deal: 'Смирнова О.П. — ЖК Олимп', stage: 'Регистрация', task: 'Контроль подачи в Росреестр', hours: 4.0, urgent: true },
  { deal: 'Петров И.С. — пр. Мира', stage: 'Проверка чистоты', task: 'Запрос ЕГРН и согласий', hours: 8.2, urgent: false },
  { deal: 'Кузнецова Н.В. — Химки', stage: 'Подготовка к задатку', task: 'Подготовить договор задатка', hours: 12.0, urgent: false },
  { deal: 'Фролов Д.А. — Балашиха', stage: 'Проверка чистоты', task: 'Экспертиза правоустанавливающих', hours: 18.5, urgent: false },
]

const SLA_RULES = [
  { task: 'Подготовка договора задатка', sla: '4 ч', status: 'ok' },
  { task: 'Подача в Росреестр/МФЦ', sla: '24 ч', status: 'ok' },
  { task: 'Запрос ЕГРН', sla: '8 ч', status: 'warn' },
  { task: 'Правовая экспертиза', sla: '48 ч', status: 'ok' },
]

export function LawyerDashboard() {
  return (
    <div style={S.page}>
      <div style={S.pageTitle}>Очередь юридических задач</div>
      <div style={S.pageSub}>Правовое сопровождение сделок, SLA и приоритетная очередь</div>

      {/* KPI Row */}
      <div style={S.grid4}>
        <KpiCard label="Задач в очереди" value="5" sub="Требуют работы" />
        <KpiCard label="Срочных" value="2" sub="SLA < 4 часов" color={C.red} />
        <KpiCard label="Сделок на задатке" value="3" sub="Подготовка договора" color={C.orange} />
        <KpiCard label="На регистрации" value="2" sub="Контроль Росреестра" color={C.blue} />
      </div>

      {/* Сделки на задатке — срочные */}
      <Section title="Сделки на этапе «Подготовка к задатку» — СРОЧНО">
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertTriangle size={16} color={C.red} />
            <div style={S.cardTitle}>Требуют немедленной генерации договора</div>
          </div>
          {LEGAL_QUEUE.filter(t => t.stage === 'Подготовка к задатку').map((task, i) => (
            <div key={i} style={{
              padding: '12px 16px',
              background: 'rgba(248,113,113,0.05)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 8,
              marginBottom: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 14, color: C.white, fontWeight: 600 }}>{task.deal}</div>
                  <div style={{ fontSize: 12, color: C.whiteLow, marginTop: 2 }}>{task.task}</div>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ fontSize: 11, color: C.red, fontWeight: 700 }}>
                    <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />
                    {task.hours} ч. прошло
                  </div>
                  {task.urgent && <StatusBadge label="СРОЧНО" color="red" />}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button style={{
                  padding: '6px 14px',
                  background: 'rgba(201,168,76,0.15)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: 6,
                  color: C.gold,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                }}>
                  Сгенерировать договор
                </button>
                <button style={{
                  padding: '6px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: C.whiteLow,
                  fontSize: 11,
                  cursor: 'pointer',
                }}>
                  Открыть сделку
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div style={S.grid2}>
        {/* Все задачи в очереди */}
        <Section title="Полная очередь задач">
          <div style={S.card}>
            <div style={S.cardTitle}>Статусы и SLA</div>
            {LEGAL_QUEUE.map((task, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < LEGAL_QUEUE.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.white, fontWeight: 500 }}>{task.deal}</div>
                  <div style={{ fontSize: 11, color: C.whiteLow }}>{task.task}</div>
                </div>
                <div style={{ textAlign: 'right' as const, flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ fontSize: 11, color: task.hours < 4 ? C.red : task.hours < 12 ? C.orange : C.whiteLow }}>
                    {task.hours} ч.
                  </div>
                  <StatusBadge
                    label={task.stage.length > 15 ? task.stage.slice(0, 15) + '…' : task.stage}
                    color={task.stage === 'Регистрация' ? 'blue' : task.urgent ? 'red' : 'gold'}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* SLA правила */}
        <Section title="SLA правила">
          <div style={S.card}>
            <div style={S.cardTitle}>Нормативы юридического отдела</div>
            {SLA_RULES.map((rule, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < SLA_RULES.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div style={{ fontSize: 12, color: C.whiteMid }}>{rule.task}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.white }}>≤ {rule.sla}</span>
                  {rule.status === 'ok'
                    ? <CheckCircle size={14} color={C.green} />
                    : <AlertTriangle size={14} color={C.orange} />
                  }
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
