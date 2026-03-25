/** Дашборд CEO / Генерального директора — операционный контроль */
import { KpiCard, SimpleList, FunnelWidget, Section, S, C, MiniBarChart } from './shared'

const REVENUE_DATA = [28, 31, 27, 35, 32, 38, 34, 42, 39, 45, 41, 48]

export function DirectorDashboard() {
  return (
    <div style={S.page}>
      <div style={S.pageTitle}>Дашборд Операционного Контроля</div>
      <div style={S.pageSub}>Тактический контроль эффективности, воронки и SLA</div>

      {/* KPI Row */}
      <div style={S.grid4}>
        <KpiCard
          label="Выручка факт"
          value="$48M"
          sub="Текущий месяц"
          delta="+14% vs план"
          deltaPositive
        />
        <KpiCard
          label="Конверсия Pipeline"
          value="8.1%"
          sub="Лид → Успешная сделка"
          delta="-0.4%"
          deltaPositive={false}
          color={C.orange}
        />
        <KpiCard
          label="Churn Rate"
          value="12%"
          sub="Отток квалиф. клиентов"
          delta="+2%"
          deltaPositive={false}
          color={C.red}
        />
        <KpiCard
          label="SLA Compliance"
          value="87%"
          sub="Задачи выполнены в срок"
          delta="+5%"
          deltaPositive
          color={C.green}
        />
      </div>

      <div style={S.grid2}>
        {/* Выручка план-факт */}
        <Section title="Выручка план-факт (млн $)">
          <div style={S.card}>
            <div style={S.cardTitle}>Динамика выручки</div>
            <MiniBarChart values={REVENUE_DATA} color={C.gold} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
              {[
                { l: 'Центр. офис', v: '$21.4M', c: C.green },
                { l: 'Бутово', v: '$14.2M', c: C.gold },
                { l: 'Подмосковье', v: '$12.4M', c: C.whiteMid },
              ].map((d, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: C.whiteLow, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{d.l}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: d.c }}>{d.v}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Воронка отделов */}
        <Section title="Воронки по отделам">
          <FunnelWidget
            title="Конверсия по отделам"
            items={[
              { label: 'Первичка — Иванов', value: 18, total: 120, color: C.green },
              { label: 'Вторичка — Смирнова', value: 12, total: 90, color: C.gold },
              { label: 'Вторичка — Петров', value: 8, total: 85, color: C.orange },
            ]}
          />
        </Section>
      </div>

      <div style={S.grid2}>
        {/* Причины отказов */}
        <Section title="Причины отказов (Churn)">
          <SimpleList
            title="Топ причин потери клиентов"
            rows={[
              { left: 'Не устроила цена', middle: '34 случая', right: '28%', rightColor: C.red },
              { left: 'Нашли другой вариант', middle: '28 случаев', right: '23%', rightColor: C.orange },
              { left: 'Долго обрабатывали', middle: '21 случай', right: '17%', rightColor: C.orange },
              { left: 'Не квалифицированный лид', middle: '18 случаев', right: '15%', rightColor: C.whiteLow },
              { left: 'Прочее', middle: '21 случай', right: '17%', rightColor: C.whiteLow },
            ]}
          />
        </Section>

        {/* SLA нарушения */}
        <Section title="SLA — просрочки">
          <div style={S.card}>
            <div style={S.cardTitle}>Нарушения SLA по категориям</div>
            {[
              { label: 'Первый контакт >5 мин', count: 14, total: 87, color: C.red },
              { label: 'Задача просрочена', count: 23, total: 156, color: C.orange },
              { label: 'Сделка без движения >3 дн.', count: 8, total: 34, color: C.orange },
              { label: 'Юр. документ >2 дн.', count: 3, total: 18, color: C.red },
            ].map((item, i) => {
              const pct = Math.round((item.count / item.total) * 100)
              return (
                <div key={i} style={{ padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.whiteMid }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.count} / {item.total} ({pct}%)</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 2 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      </div>
    </div>
  )
}
