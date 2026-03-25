/** Дашборд Собственника — стратегический BI */
import { KpiCard, MiniBarChart, SimpleList, FunnelWidget, Section, S, C } from './shared'

const PL_DATA = [12, 18, 15, 22, 19, 28, 24, 31, 27, 35, 29, 38]
const ROI_DATA = [180, 210, 195, 240, 220, 265, 245, 280]

export function OwnerDashboard() {
  return (
    <div style={S.page}>
      <div style={S.pageTitle}>Стратегический BI-дашборд</div>
      <div style={S.pageSub}>Здоровье бизнеса, ROI и макропоказатели</div>

      {/* KPI Row */}
      <div style={S.grid4}>
        <KpiCard
          label="EBITDA (мес.)"
          value="4.2M ₽"
          delta="+12.4% vs прошлый мес."
          deltaPositive
        />
        <KpiCard
          label="ROI маркетинга"
          value="380%"
          sub="Затраты → Комиссия"
          delta="+8%"
          deltaPositive
          color={C.gold}
        />
        <KpiCard
          label="Стоимость базы"
          value="218M ₽"
          sub="Оценка активов в базе"
        />
        <KpiCard
          label="Новые сделки"
          value="34"
          sub="За текущий месяц"
          delta="+6 vs план"
          deltaPositive
          color={C.green}
        />
      </div>

      <div style={S.grid2}>
        {/* P&L динамика */}
        <Section title="P&L — прибыль по месяцам (млн ₽)">
          <div style={{ ...S.card }}>
            <div style={S.cardTitle}>P&L Динамика</div>
            <MiniBarChart values={PL_DATA} color={C.gold} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: C.whiteLow }}>Янв</span>
              <span style={{ fontSize: 11, color: C.whiteLow }}>Дек</span>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 24 }}>
              <div>
                <div style={{ fontSize: 10, color: C.whiteLow, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Факт YTD</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.white }}>38M ₽</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.whiteLow, letterSpacing: '0.1em', textTransform: 'uppercase' }}>План YTD</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.gold }}>42M ₽</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.whiteLow, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Исполнение</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fb923c' }}>90.5%</div>
              </div>
            </div>
          </div>
        </Section>

        {/* ROI маркетинга */}
        <Section title="ROI маркетинга — соотношение затрат к комиссии">
          <div style={S.card}>
            <div style={S.cardTitle}>ROI по каналам</div>
            <MiniBarChart values={ROI_DATA} color="#60a5fa" />
            <SimpleList
              rows={[
                { left: 'Яндекс.Директ', middle: '320 лидов', right: '420%', rightColor: C.green },
                { left: 'Авито', middle: '180 лидов', right: '280%', rightColor: C.gold },
                { left: 'ВКонтакте', middle: '95 лидов', right: '190%', rightColor: C.orange },
                { left: 'ЦИАН', middle: '140 лидов', right: '350%', rightColor: C.green },
              ]}
            />
          </div>
        </Section>
      </div>

      <div style={S.grid2}>
        {/* Тепловая карта продаж по филиалам */}
        <Section title="Продажи по филиалам">
          <SimpleList
            title="Тепловая карта"
            rows={[
              { left: 'Центральный офис', middle: 'Москва', right: '18 сделок', rightColor: C.green },
              { left: 'Северное Бутово', middle: 'Москва ЮЗ', right: '9 сделок', rightColor: C.gold },
              { left: 'Химки', middle: 'МО Север', right: '5 сделок', rightColor: C.whiteMid },
              { left: 'Балашиха', middle: 'МО Восток', right: '2 сделки', rightColor: C.orange },
            ]}
          />
        </Section>

        {/* Ключевые алерты */}
        <Section title="Алерты и аномалии">
          <div style={S.card}>
            <div style={S.cardTitle}>Требуют внимания</div>
            {[
              { text: 'Конверсия лид → сделка упала на 4%', color: C.orange },
              { text: '3 объекта висят >90 дней без движения', color: C.red },
              { text: 'Расходы на маркетинг превысили бюджет на 8%', color: C.orange },
              { text: 'Новый менеджер без активных лидов 5 дней', color: C.whiteLow },
            ].map((a, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '8px 0',
                borderBottom: i < 3 ? `1px solid rgba(255,255,255,0.06)` : 'none',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.color, marginTop: 5, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.whiteMid }}>{a.text}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Воронка от лида до комиссии */}
      <Section title="Сквозная воронка">
        <FunnelWidget
          title="Лид → Комиссия (текущий месяц)"
          items={[
            { label: 'Входящих лидов', value: 420, total: 420 },
            { label: 'Квалифицировано', value: 280, total: 420, color: '#60a5fa' },
            { label: 'Показы проведены', value: 140, total: 420, color: C.gold },
            { label: 'Сделки открыты', value: 72, total: 420, color: C.orange },
            { label: 'Сделки закрыты', value: 34, total: 420, color: C.green },
          ]}
        />
      </Section>
    </div>
  )
}
