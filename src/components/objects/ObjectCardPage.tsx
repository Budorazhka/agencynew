import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Building2, MapPin, Calendar, TrendingUp, FileText, Bookmark } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { mockProperties } from '@/components/management/my-properties/mock-data'
import type { SaleStatus } from '@/components/management/my-properties/types'
import { FMT_USD } from '@/lib/format-currency'

const FMT_M2  = new Intl.NumberFormat('ru', { maximumFractionDigits: 0 })

const STATUS_LABELS: Record<SaleStatus, string> = {
  for_sale: 'В продаже', booked: 'Забронирован', sold: 'Продан',
  moderation: 'Модерация', draft: 'Черновик', archive: 'Архив',
}
const STATUS_COLORS: Record<SaleStatus, string> = {
  for_sale: '#4ade80', booked: '#fb923c', sold: 'rgba(255,255,255,0.3)',
  moderation: '#60a5fa', draft: '#a78bfa', archive: 'rgba(255,255,255,0.2)',
}

type Tab = 'overview' | 'history' | 'docs'

export function ObjectCardPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('overview')

  const property = mockProperties.find(p => p.id === propertyId)
  if (!property) {
    return (
      <DashboardShell hideSidebar topBack={{ label: 'Назад', route: '/dashboard/objects/list' }}>
        <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>
          Объект не найден
        </div>
      </DashboardShell>
    )
  }

  const d = property.details

  return (
    <DashboardShell hideSidebar topBack={{ label: 'Назад', route: '/dashboard/objects/list' }}>
      <div style={{ padding: '28px 28px 64px', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

        {/* Hero */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
          {/* Photo */}
          <div style={{ width: 280, height: 200, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {property.photo
              ? <img src={property.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Building2 size={48} color="rgba(255,255,255,0.07)" />
            }
          </div>

          {/* Main info */}
          <div style={{ flex: 1, minWidth: 240 }}>
            {/* Status */}
            <span style={{
              display: 'inline-block', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: STATUS_COLORS[property.status], background: `${STATUS_COLORS[property.status]}18`,
              border: `1px solid ${STATUS_COLORS[property.status]}44`,
              padding: '3px 8px', borderRadius: 5, marginBottom: 10,
            }}>
              {STATUS_LABELS[property.status]}
            </span>

            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)', marginBottom: 6, lineHeight: 1.3 }}>
              {property.title}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
              <MapPin size={12} />
              {property.city}, {property.street}
            </div>

            {/* Price block */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>{FMT_USD.format(property.price)}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{FMT_M2.format(property.pricePerM2)} $/м²</div>
            </div>

            {/* Spec chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {[
                property.rooms > 0 && `${property.rooms} комн.`,
                `${property.area} м²`,
                property.floor > 0 && `${property.floor} / ${property.totalFloors} эт.`,
                property.type,
                property.country,
              ].filter(Boolean).map((s, i) => (
                <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 6 }}>
                  {s}
                </span>
              ))}
            </div>

            {/* CTA buttons — cross-module actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/dashboard/deals/kanban')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)', letterSpacing: '0.05em' }}
              >
                <TrendingUp size={12} />
                Открыть сделку
              </button>
              <button
                onClick={() => navigate('/dashboard/bookings/client')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa', letterSpacing: '0.05em' }}
              >
                <Bookmark size={12} />
                Забронировать
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 22 }}>
          {([['overview','Обзор'],['history','История цены'],['docs','Документы']] as [Tab,string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '8px 18px', fontSize: 11, fontWeight: tab === id ? 700 : 500,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              background: 'transparent', border: 'none',
              color: tab === id ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
              borderBottom: tab === id ? '2px solid var(--gold)' : '2px solid transparent',
              marginBottom: -1,
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Характеристики */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>Характеристики</div>
              {[
                { label: 'Тип недвижимости', value: property.type },
                { label: 'Площадь', value: `${property.area} м²` },
                { label: 'Комнат', value: property.rooms > 0 ? property.rooms : '—' },
                { label: 'Этаж / Всего', value: property.floor > 0 ? `${property.floor} / ${property.totalFloors}` : '—' },
                { label: 'Адрес', value: `${property.city}, ${property.street}` },
                { label: 'Страна', value: property.country },
                d?.renovation && { label: 'Ремонт', value: d.renovation },
                d?.ceilingHeight && { label: 'Потолки', value: `${d.ceilingHeight} м` },
                d?.bathroomType && { label: 'Санузел', value: d.bathroomType },
                { label: 'Ипотека', value: d?.mortgageAvailable ? 'Да' : 'Нет' },
                { label: 'Рассрочка', value: d?.installmentAvailable ? 'Да' : 'Нет' },
              ].filter(Boolean).map((row, i) => {
                const r = row as { label: string; value: string | number }
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{r.label}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{r.value}</span>
                  </div>
                )
              })}
            </div>

            {/* Агент + даты */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>Ответственный</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>
                    {property.agentName[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{property.agentName}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Агент</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>Даты</div>
                {[
                  { icon: Calendar, label: 'Добавлен', value: new Date(property.listedAt).toLocaleDateString('ru') },
                  { icon: Calendar, label: 'Обновлён', value: new Date(property.updatedAt).toLocaleDateString('ru') },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      <row.icon size={12} />{row.label}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {d?.description && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', flex: 1 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>Описание</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{d.description}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price history tab */}
        {tab === 'history' && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>История изменения цены</div>
            {[
              { date: '2026-03-01', price: property.price, note: 'Текущая цена' },
              { date: '2026-01-15', price: Math.round(property.price * 1.04), note: 'Снижение цены' },
              { date: '2025-11-23', price: Math.round(property.price * 1.08), note: 'Первоначальная цена' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? 'var(--gold)' : 'rgba(255,255,255,0.7)' }}>{FMT_USD.format(row.price)}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{new Date(row.date).toLocaleDateString('ru')} · {row.note}</div>
                </div>
                {i > 0 && (
                  <span style={{ fontSize: 11, color: '#4ade80' }}>
                    −{Math.round((row.price - property.price) / row.price * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Docs tab */}
        {tab === 'docs' && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)' }}>Документы</div>
              <button style={{ padding: '6px 14px', borderRadius: 7, fontSize: 11, fontWeight: 700, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)', cursor: 'pointer' }}>
                + Загрузить
              </button>
            </div>
            {[
              { name: 'Правоустанавливающий документ', type: 'PDF', date: '2025-11-23' },
              { name: 'Технический паспорт', type: 'PDF', date: '2025-11-23' },
              { name: 'Договор поручения', type: 'DOCX', date: '2025-12-01' },
            ].map((doc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <FileText size={16} color="rgba(255,255,255,0.3)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{doc.type} · {new Date(doc.date).toLocaleDateString('ru')}</div>
                </div>
                <button style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Скачать
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
