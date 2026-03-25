/** Дашборд Маркетолога — лидогенерация и сквозная аналитика */
import { KpiCard, SimpleList, FunnelWidget, Section, S, C, MiniBarChart } from './shared'

const CPL_DATA = [1200, 980, 1450, 1100, 880, 1320, 1050, 920]

export function MarketerDashboard() {
  return (
    <div style={S.page}>
      <div style={S.pageTitle}>Дашборд Лидогенерации</div>
      <div style={S.pageSub}>Сквозная аналитика: от клика до комиссии, CPL и ROI каналов</div>

      {/* KPI Row */}
      <div style={S.grid4}>
        <KpiCard
          label="Лидов за месяц"
          value="420"
          sub="Все каналы"
          delta="+18% vs прошлый мес."
          deltaPositive
        />
        <KpiCard
          label="CPL средний"
          value="$1,050"
          sub="Стоимость лида"
          delta="-$80"
          deltaPositive
          color={C.green}
        />
        <KpiCard
          label="ДРР"
          value="8.4%"
          sub="Доля рекл. расходов"
          delta="+0.6%"
          deltaPositive={false}
          color={C.orange}
        />
        <KpiCard
          label="CAC"
          value="$14,200"
          sub="Стоимость клиента"
          color={C.gold}
        />
      </div>

      <div style={S.grid2}>
        {/* Воронка трафика */}
        <Section title="Воронка трафика — от показа до сделки">
          <FunnelWidget
            title="Сквозная конверсия"
            items={[
              { label: 'Показы рекламы', value: 124000, total: 124000 },
              { label: 'Клики', value: 8400, total: 124000, color: C.blue },
              { label: 'Лиды (заявки)', value: 420, total: 124000, color: C.gold },
              { label: 'Квалифицировано', value: 280, total: 124000, color: C.orange },
              { label: 'Сделки открыты', value: 72, total: 124000, color: C.green },
            ]}
          />
        </Section>

        {/* CPL по источникам */}
        <Section title="CPL по источникам">
          <div style={S.card}>
            <div style={S.cardTitle}>Динамика CPL</div>
            <MiniBarChart values={CPL_DATA} color={C.blue} />
            <SimpleList
              rows={[
                { left: 'Яндекс.Директ', middle: '320 лидов · $256,000', right: '$800', rightColor: C.green },
                { left: 'Авито', middle: '62 лида · $74,400', right: '$1,200', rightColor: C.gold },
                { left: 'ВКонтакте', middle: '38 лидов · $76,000', right: '$2,000', rightColor: C.orange },
                { left: 'ЦИАН', middle: '140 лидов · $98,000', right: '$700', rightColor: C.green },
              ]}
            />
          </div>
        </Section>
      </div>

      <div style={S.grid2}>
        {/* Топ UTM-кампании */}
        <Section title="Топ UTM-кампании по ROI">
          <SimpleList
            title="Кампании с наивысшим ROI"
            rows={[
              { left: 'yandex_search_firstichka', middle: 'Поиск · Первичка', right: '580%', rightColor: C.green },
              { left: 'cian_listing_2k_msk', middle: 'ЦИАН · 2к. Москва', right: '490%', rightColor: C.green },
              { left: 'yandex_rsa_novostrojki', middle: 'РСЯ · Новостройки', right: '310%', rightColor: C.gold },
              { left: 'vk_retargeting_buyers', middle: 'Ретаргет · Покупатели', right: '240%', rightColor: C.gold },
              { left: 'avito_premium_listings', middle: 'Авито · Премиум', right: '180%', rightColor: C.orange },
            ]}
          />
        </Section>

        {/* Бюджет */}
        <Section title="Бюджет и расходы">
          <div style={S.card}>
            <div style={S.cardTitle}>Рекламные расходы vs бюджет</div>
            {[
              { channel: 'Яндекс.Директ', spent: 256000, budget: 300000, pct: 85 },
              { channel: 'ЦИАН', spent: 98000, budget: 100000, pct: 98 },
              { channel: 'Авито', spent: 74400, budget: 80000, pct: 93 },
              { channel: 'ВКонтакте', spent: 76000, budget: 60000, pct: 127 },
            ].map((b, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: C.whiteMid }}>{b.channel}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: b.pct > 100 ? C.red : b.pct > 90 ? C.orange : C.green }}>
                    {b.pct}%
                  </span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(b.pct, 100)}%`,
                    background: b.pct > 100 ? C.red : b.pct > 90 ? C.orange : C.green,
                    borderRadius: 2,
                  }} />
                </div>
                <div style={{ fontSize: 11, color: C.whiteLow, marginTop: 2 }}>
                  ${(b.spent / 1000).toFixed(0)}K / ${(b.budget / 1000).toFixed(0)}K
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
