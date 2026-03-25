/** Дашборд РОПа — управление командой продаж */
import { KpiCard, FunnelWidget, StatusBadge, Section, S, C } from './shared'

const AGENTS = [
  { name: 'Анна Первичкина', calls: 12, meetings: 3, selections: 8, plan: 85, color: C.green },
  { name: 'Дмитрий Волков',  calls: 9,  meetings: 2, selections: 5, plan: 62, color: C.gold },
  { name: 'Марина Озёрова',  calls: 7,  meetings: 1, selections: 4, plan: 48, color: C.orange },
  { name: 'Кирилл Степанов', calls: 14, meetings: 4, selections: 11,plan: 94, color: C.green },
  { name: 'Светлана Лопата', calls: 3,  meetings: 0, selections: 1, plan: 21, color: C.red },
]

export function RopDashboard() {
  return (
    <div style={S.page}>
      <div style={S.pageTitle}>Дашборд Активности Команды</div>
      <div style={S.pageSub}>Выполнение плана отделом, рейтинг агентов и красные зоны</div>

      {/* KPI Row */}
      <div style={S.grid4}>
        <KpiCard label="Сделок в работе" value="28" sub="Всего по отделу" delta="+4 vs неделя назад" deltaPositive />
        <KpiCard label="Просрочено задач" value="7" sub="Красная зона" color={C.red} delta="+2" deltaPositive={false} />
        <KpiCard label="Выполнение плана" value="74%" sub="Отдел, месяц" color={C.orange} />
        <KpiCard label="Лиды без движ." value="12" sub=">24 часа без контакта" color={C.red} />
      </div>

      {/* Воронка отдела */}
      <div style={S.grid2}>
        <Section title="Воронка отдела (с суммой комиссий)">
          <FunnelWidget
            title="Статусы сделок"
            items={[
              { label: 'Показ назначен', value: 18, total: 28, color: C.blue },
              { label: 'Переговоры', value: 8, total: 28, color: C.gold },
              { label: 'Выход на задаток', value: 4, total: 28, color: C.orange },
              { label: 'Регистрация', value: 2, total: 28, color: C.green },
            ]}
          />
        </Section>

        {/* Красная зона */}
        <Section title="Красная зона — требуют внимания">
          <div style={S.card}>
            <div style={S.cardTitle}>Просроченные задачи и лиды</div>
            {[
              { name: 'Светлана Лопата', issue: 'Лид без контакта 48 ч', badge: 'Срочно' as const, color: C.red },
              { name: 'Кирилл Степанов', issue: 'Задача: встреча с Ивановым', badge: 'Просрочено' as const, color: C.orange },
              { name: 'Марина Озёрова', issue: 'Лид без движения 26 ч', badge: 'Просрочено' as const, color: C.orange },
              { name: 'Дмитрий Волков', issue: 'Не заполнена анкета BANT', badge: 'Задача' as const, color: C.whiteLow },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: C.white, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: C.whiteLow }}>{item.issue}</div>
                </div>
                <StatusBadge
                  label={item.badge}
                  color={item.color === C.red ? 'red' : item.color === C.orange ? 'orange' : 'gold'}
                />
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Рейтинг агентов */}
      <Section title="Рейтинг агентов за сегодня">
        <div style={S.card}>
          <div style={S.cardTitle}>Активность: звонки / встречи / подборки / % плана</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Шапка */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 90px 100px', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {['Менеджер', 'Звонки', 'Встречи', 'Подборки', '% плана'].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.whiteLow }}>{h}</div>
              ))}
            </div>
            {AGENTS.map((a, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px 90px 100px',
                gap: 8,
                padding: '10px 0',
                borderBottom: i < AGENTS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                alignItems: 'center',
              }}>
                <div style={{ fontSize: 13, color: C.white, fontWeight: 500 }}>{a.name}</div>
                <div style={{ fontSize: 13, color: C.whiteMid }}>{a.calls}</div>
                <div style={{ fontSize: 13, color: C.whiteMid }}>{a.meetings}</div>
                <div style={{ fontSize: 13, color: C.whiteMid }}>{a.selections}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: a.color, marginBottom: 3 }}>{a.plan}%</div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${a.plan}%`, background: a.color, borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}
