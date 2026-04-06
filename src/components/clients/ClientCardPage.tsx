import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Phone, Mail, User, Building2,
  Briefcase, Clock, Edit, Plus
} from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { CLIENTS_MOCK, SEGMENT_LABELS } from '@/data/clients-mock'
import { readSessionClient } from '@/lib/session-client'
import { CLIENT_REQUEST_TYPE_LABEL } from '@/types/clients'

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
  green: '#4ade80',
  red: '#f87171',
  blue: '#60a5fa',
}

type Tab = 'overview' | 'deals' | 'documents' | 'history'

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Обзор' },
  { key: 'deals', label: 'Сделки' },
  { key: 'documents', label: 'Документы' },
  { key: 'history', label: 'История' },
]

const MOCK_HISTORY = [
  { date: '20.03.2026', type: 'Звонок', note: 'Обсудили подборку по Садовому кольцу', author: 'Анна П.' },
  { date: '18.03.2026', type: 'Email', note: 'Отправили 3 варианта квартир', author: 'Анна П.' },
  { date: '15.03.2026', type: 'Встреча', note: 'Показ на ул. Садовой — понравилось', author: 'Анна П.' },
  { date: '10.03.2026', type: 'Статус', note: 'Конвертирован из лида #ld-101', author: 'Система' },
]

export function ClientCardPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('overview')

  const client = CLIENTS_MOCK.find(c => c.id === clientId) ?? readSessionClient(clientId)

  if (!client) {
    return (
      <DashboardShell hideSidebar>
        <div style={{ padding: 40, color: C.whiteLow }}>
          Клиент не найден.
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell hideSidebar>
      <div style={{ padding: '24px 32px 40px', width: '100%', maxWidth: 960, margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Client header */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '24px',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {client.type === 'company'
                  ? <Building2 size={22} color={C.gold} />
                  : <User size={22} color={C.gold} />
                }
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.white }}>{client.name}</div>
                <div style={{ fontSize: 12, color: C.whiteLow, marginTop: 3 }}>
                  {client.type === 'company' ? 'Юридическое лицо' : 'Физическое лицо'} · {client.source}
                </div>
                <div style={{ marginTop: 6 }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 20,
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    color: C.gold,
                    letterSpacing: '0.06em',
                  }}>
                    {SEGMENT_LABELS[client.segment]}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 7,
                color: C.whiteMid,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                <Edit size={12} /> Редактировать
              </button>
              <button
                onClick={() => navigate('/dashboard/deals/kanban')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px',
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: 7,
                  color: C.gold,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                }}
              >
                <Plus size={12} /> Создать сделку
              </button>
            </div>
          </div>

          {/* Contact info */}
          <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' as const }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.whiteMid }}>
              <Phone size={13} color={C.whiteLow} /> {client.phone}
            </div>
            {client.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.whiteMid }}>
                <Mail size={13} color={C.whiteLow} /> {client.email}
              </div>
            )}
            <div style={{ fontSize: 13, color: C.whiteLow }}>
              Менеджер: <span style={{ color: C.whiteMid }}>{client.assignedAgentName}</span>
            </div>
            <div style={{ fontSize: 13, color: C.whiteLow }}>
              С нами с: <span style={{ color: C.whiteMid }}>{new Date(client.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
            {client.requestType && (
              <div style={{ fontSize: 13, color: C.whiteLow }}>
                Тип запроса:{' '}
                <span style={{ color: C.whiteMid, fontWeight: 600 }}>{CLIENT_REQUEST_TYPE_LABEL[client.requestType]}</span>
              </div>
            )}
            {client.budget && (
              <div style={{ fontSize: 13, color: C.whiteLow }}>
                Бюджет: <span style={{ color: C.whiteMid, fontWeight: 600 }}>{client.budget}</span>
              </div>
            )}
          </div>

          {client.interests && (
            <div style={{
              marginTop: 14,
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 7,
              fontSize: 13,
              color: C.whiteMid,
              borderLeft: `3px solid rgba(201,168,76,0.4)`,
            }}>
              <span style={{ color: C.whiteLow, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Запрос: </span>
              {client.interests}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: 'none',
                background: tab === t.key ? 'rgba(201,168,76,0.1)' : 'transparent',
                color: tab === t.key ? C.gold : C.whiteLow,
                fontSize: 13,
                fontWeight: tab === t.key ? 700 : 400,
                cursor: 'pointer',
                borderBottom: tab === t.key ? '2px solid var(--gold)' : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Сделок', value: client.dealsCount, icon: <Briefcase size={16} color={C.gold} /> },
              { label: 'Активных задач', value: client.tasksCount, icon: <Clock size={16} color={C.gold} /> },
            ].map(stat => (
              <div key={stat.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                {stat.icon}
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.white }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: C.whiteLow }}>{stat.label}</div>
                </div>
              </div>
            ))}
            {client.notes && (
              <div style={{ gridColumn: '1 / -1', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: C.whiteLow, marginBottom: 8 }}>Заметки</div>
                <div style={{ fontSize: 13, color: C.whiteMid }}>{client.notes}</div>
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {MOCK_HISTORY.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 14,
                padding: '14px 20px',
                borderBottom: i < MOCK_HISTORY.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{ width: 4, background: C.gold + '44', borderRadius: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.gold }}>{item.type}</span>
                      <span style={{ fontSize: 11, color: C.whiteLow }}>— {item.author}</span>
                    </div>
                    <span style={{ fontSize: 11, color: C.whiteLow }}>{item.date}</span>
                  </div>
                  <div style={{ fontSize: 13, color: C.whiteMid }}>{item.note}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'deals' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, textAlign: 'center' as const, color: C.whiteLow }}>
            {client.dealsCount === 0
              ? 'Нет связанных сделок'
              : `${client.dealsCount} сделок — перейдите в модуль Сделки для просмотра`
            }
          </div>
        )}

        {tab === 'documents' && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, textAlign: 'center' as const, color: C.whiteLow }}>
            Документы появятся при открытии сделки
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
