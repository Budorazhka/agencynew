/** Дашборд Руководителя отдела закупки — ликвидность и оценка */
import { KpiCard, SimpleList, FunnelWidget, Section, S, C, MiniBarChart } from './shared'

const DOM_DATA = [42, 38, 55, 47, 61, 52, 44, 49, 58, 46, 53, 48]

export function ProcurementDashboard() {
  return (
    <div style={S.page}>
      <div style={S.pageTitle}>Дашборд Ликвидности и Оценки</div>
      <div style={S.pageSub}>Качество портфеля объектов, Days on Market и динамика цен</div>

      {/* KPI Row */}
      <div style={S.grid4}>
        <KpiCard
          label="Объектов в базе"
          value="284"
          sub="Активных объектов"
          delta="+12 за неделю"
          deltaPositive
        />
        <KpiCard
          label="Эксклюзивных"
          value="47"
          sub="Договоры с правом продажи"
          color={C.gold}
        />
        <KpiCard
          label="Days on Market"
          value="48 дн."
          sub="Среднее время продажи"
          delta="-4 дн. vs месяц назад"
          deltaPositive
          color={C.green}
        />
        <KpiCard
          label="Отклонение цены"
          value="-3.2%"
          sub="Ниже рынка в среднем"
          color={C.orange}
        />
      </div>

      <div style={S.grid2}>
        {/* DOM динамика */}
        <Section title="Days on Market — динамика">
          <div style={S.card}>
            <div style={S.cardTitle}>Среднее время экспозиции (дней)</div>
            <MiniBarChart values={DOM_DATA} color={C.blue} />
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: C.whiteLow, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Вторичка</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.blue }}>58 дн.</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.whiteLow, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Первичка</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.gold }}>32 дн.</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.whiteLow, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Целевой</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>45 дн.</div>
              </div>
            </div>
          </div>
        </Section>

        {/* Воронка выкупа */}
        <Section title="Воронка выкупа">
          <FunnelWidget
            title="Заявка → Постановка на баланс"
            items={[
              { label: 'Заявок от собственников', value: 84, total: 84 },
              { label: 'Оценка выполнена', value: 61, total: 84, color: C.gold },
              { label: 'Переговоры по цене', value: 38, total: 84, color: C.orange },
              { label: 'Договор подписан', value: 22, total: 84, color: C.blue },
              { label: 'Поставлен на баланс', value: 14, total: 84, color: C.green },
            ]}
          />
        </Section>
      </div>

      <div style={S.grid2}>
        {/* Объекты с высоким DOM */}
        <Section title="Проблемные объекты — высокий DOM">
          <SimpleList
            title="Висят более 90 дней"
            rows={[
              { left: 'ул. Садовая, 12, кв. 34', middle: 'Вторичка · 3к · 8.2M', right: '124 дн.', rightColor: C.red },
              { left: 'ЖК Олимп, корп. 2, 15', middle: 'Первичка · 2к · 6.8M', right: '98 дн.', rightColor: C.red },
              { left: 'пр. Мира, 88, кв. 7', middle: 'Вторичка · 1к · 4.1M', right: '92 дн.', rightColor: C.orange },
            ]}
          />
        </Section>

        {/* Отклонение цен */}
        <Section title="Ценовой анализ vs рынок">
          <div style={S.card}>
            <div style={S.cardTitle}>Сравнение цен портфеля со средними по рынку</div>
            {[
              { segment: 'Вторичка 1к, до 6M', portfolio: '5.2M', market: '5.6M', delta: '-7%', up: false },
              { segment: 'Вторичка 2к, до 9M', portfolio: '8.1M', market: '7.9M', delta: '+2.5%', up: true },
              { segment: 'Первичка, ЖК бизнес', portfolio: '11.8M', market: '12.4M', delta: '-5%', up: false },
              { segment: 'Первичка, эконом', portfolio: '4.9M', market: '5.1M', delta: '-4%', up: false },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '9px 0',
                borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 12, color: C.white, fontWeight: 500 }}>{row.segment}</div>
                  <div style={{ fontSize: 11, color: C.whiteLow }}>Портфель: {row.portfolio} · Рынок: {row.market}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: row.up ? C.red : C.orange }}>{row.delta}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
