import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { SELECTIONS_MOCK } from '@/data/selections-mock'
import { loadExtraSelections } from '@/lib/selections-storage'
import {
  type SelectionProperty,
  SELECTION_STATUS_LABELS,
  SELECTION_STATUS_COLORS,
  MARKET_LABELS,
  MARKET_COLORS,
} from '@/types/selections'
import {
  Send,
  Copy,
  Plus,
  ThumbsUp,
  EyeOff,
  Building2,
  Home,
  Pencil,
  CheckCircle2,
  ExternalLink,
  User,
  Calendar,
  Wallet,
  MessageSquare,
} from 'lucide-react'
import { formatUsdCompact } from '@/lib/format-currency'

function formatPrice(price: number) {
  return formatUsdCompact(price)
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function SelectionCardPage() {
  const { selectionId } = useParams<{ selectionId: string }>()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  const selection = useMemo(() => {
    const pool = [...loadExtraSelections(), ...SELECTIONS_MOCK]
    return pool.find((s) => s.id === selectionId)
  }, [selectionId])

  if (!selection) {
    return (
      <DashboardShell hideSidebar>
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--app-text-subtle)' }}>
          Подборка не найдена
        </div>
      </DashboardShell>
    )
  }

  const statusColor = SELECTION_STATUS_COLORS[selection.status]
  const primaryProps = selection.properties.filter(p => p.market === 'primary')
  const secondaryProps = selection.properties.filter(p => p.market === 'secondary')
  const likedCount = selection.properties.filter(p => p.liked).length

  function copyPortalLink() {
    const url = selection?.portalUrl
    if (url) {
      navigator.clipboard.writeText(url).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function sendToClient() {
    setSendSuccess(true)
    setTimeout(() => setSendSuccess(false), 3000)
  }

  return (
    <DashboardShell hideSidebar>
      <div
        style={{
          padding: '28px 32px',
          minHeight: '100%',
          fontFamily: "'Montserrat', sans-serif",
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          background: 'var(--app-bg)',
        }}
      >

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--app-text)', marginBottom: 4 }}>
              {selection.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 12,
                background: `${statusColor}18`, border: `1px solid ${statusColor}40`,
                fontSize: 10, fontWeight: 700, color: statusColor, letterSpacing: '0.06em',
              }}>
                {SELECTION_STATUS_LABELS[selection.status].toUpperCase()}
              </span>
              <span style={{ fontSize: 11, color: 'var(--app-text-subtle)' }}>
                Создана {formatDate(selection.createdAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            {selection.portalUrl && (
              <button
                onClick={copyPortalLink}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8,
                  background: copied ? 'rgba(34,197,94,0.12)' : 'var(--hub-tile-icon-bg)',
                  border: `1px solid ${copied ? 'rgba(34,197,94,0.35)' : 'var(--hub-card-border)'}`,
                  color: copied ? '#22c55e' : 'var(--app-text-muted)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                {copied ? 'Скопировано' : 'Копировать ссылку'}
              </button>
            )}
            <button
              onClick={sendToClient}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                background: sendSuccess ? 'rgba(34,197,94,0.15)' : 'var(--nav-item-bg-active)',
                border: `1px solid ${sendSuccess ? 'rgba(34,197,94,0.4)' : 'var(--hub-card-border-hover)'}`,
                color: sendSuccess ? '#22c55e' : 'var(--theme-accent-heading)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                letterSpacing: '0.04em',
              }}
            >
              {sendSuccess ? <CheckCircle2 size={13} /> : <Send size={13} />}
              {sendSuccess ? 'Отправлено!' : 'Отправить клиенту'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>

          {/* LEFT: Properties */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Portal preview */}
            {selection.portalUrl && (
              <div style={{
                background: 'var(--nav-item-bg-active)', border: '1px solid var(--hub-tile-icon-border)',
                borderRadius: 10, padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Клиентский портал:</span>
                  {' '}{selection.portalUrl}
                </div>
                <a
                  href={selection.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 11, color: 'var(--theme-accent-heading)', fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={11} />
                  Открыть
                </a>
              </div>
            )}

            {/* Reaction summary */}
            {selection.status !== 'draft' && selection.viewCount > 0 && (
              <div style={{
                display: 'flex', gap: 16, padding: '12px 16px',
                background: 'var(--hub-card-bg)', border: '1px solid var(--hub-card-border)',
                borderRadius: 10,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--app-text)' }}>{selection.viewCount}</div>
                  <div style={{ fontSize: 10, color: 'var(--app-text-subtle)', letterSpacing: '0.06em' }}>просмотров</div>
                </div>
                <div style={{ width: 1, background: 'var(--divider-subtle)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: likedCount > 0 ? '#22c55e' : 'var(--app-text)' }}>
                    {likedCount}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--app-text-subtle)', letterSpacing: '0.06em' }}>понравилось</div>
                </div>
                <div style={{ width: 1, background: 'var(--divider-subtle)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>
                    {selection.properties.filter(p => p.hidden).length}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--app-text-subtle)', letterSpacing: '0.06em' }}>скрыто</div>
                </div>
                {selection.lastOpenedAt && (
                  <>
                    <div style={{ width: 1, background: 'var(--divider-subtle)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--app-text-muted)' }}>
                        Последнее открытие: {formatDateTime(selection.lastOpenedAt)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Новостройки */}
            {primaryProps.length > 0 && (
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                }}>
                  <Building2 size={14} color={MARKET_COLORS.primary} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: MARKET_COLORS.primary, letterSpacing: '0.08em' }}>
                    НОВОСТРОЙКИ — {primaryProps.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {primaryProps.map(prop => (
                    <PropertyRow key={prop.id} prop={prop} />
                  ))}
                </div>
              </div>
            )}

            {/* Вторичка */}
            {secondaryProps.length > 0 && (
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                  marginTop: primaryProps.length > 0 ? 8 : 0,
                }}>
                  <Home size={14} color={MARKET_COLORS.secondary} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: MARKET_COLORS.secondary, letterSpacing: '0.08em' }}>
                    ВТОРИЧКА — {secondaryProps.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {secondaryProps.map(prop => (
                    <PropertyRow key={prop.id} prop={prop} />
                  ))}
                </div>
              </div>
            )}

            {/* Add property */}
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px', borderRadius: 8,
              background: 'transparent', border: '1px dashed var(--hub-card-border)',
              color: 'var(--app-text-subtle)', fontSize: 12, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--hub-card-border-hover)'
                e.currentTarget.style.color = 'var(--theme-accent-heading)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--hub-card-border)'
                e.currentTarget.style.color = 'var(--app-text-subtle)'
              }}
            >
              <Plus size={13} />
              Добавить объект из каталога
            </button>
          </div>

          {/* RIGHT: Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Client info */}
            <div style={{
              background: 'var(--hub-card-bg)', border: '1px solid var(--hub-card-border)',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--app-text-subtle)', letterSpacing: '0.1em', marginBottom: 10 }}>
                КЛИЕНТ
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: 'rgba(96,165,250,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <User size={14} color={MARKET_COLORS.secondary} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-text)' }}>{selection.clientName}</div>
                  <div style={{ fontSize: 11, color: 'var(--app-text-muted)' }}>{selection.clientPhone}</div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/dashboard/clients/${selection.clientId}`)}
                style={{
                  width: '100%', padding: '6px', borderRadius: 6,
                  background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
                  color: MARKET_COLORS.secondary, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Карточка клиента →
              </button>
            </div>

            {/* Budget */}
            {selection.budget && (
              <div style={{
                background: 'var(--hub-card-bg)', border: '1px solid var(--hub-card-border)',
                borderRadius: 10, padding: '14px 16px',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--app-text-subtle)', letterSpacing: '0.1em', marginBottom: 8 }}>
                  БЮДЖЕТ КЛИЕНТА
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Wallet size={14} color="var(--gold)" />
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>
                    {formatPrice(selection.budget)}
                  </span>
                </div>
              </div>
            )}

            {/* Agent */}
            <div style={{
              background: 'var(--hub-card-bg)', border: '1px solid var(--hub-card-border)',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--app-text-subtle)', letterSpacing: '0.1em', marginBottom: 8 }}>
                АГЕНТ
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-text)' }}>{selection.agentName}</div>
            </div>

            {/* Timeline */}
            <div style={{
              background: 'var(--hub-card-bg)', border: '1px solid var(--hub-card-border)',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--app-text-subtle)', letterSpacing: '0.1em', marginBottom: 10 }}>
                ХРОНОЛОГИЯ
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <TimelineItem icon={<Pencil size={11} />} label="Создана" date={selection.createdAt} />
                {selection.sentAt && (
                  <TimelineItem icon={<Send size={11} />} label="Отправлена" date={selection.sentAt} />
                )}
                {selection.lastOpenedAt && (
                  <TimelineItem icon={<Calendar size={11} />} label="Открыта клиентом" date={selection.lastOpenedAt} />
                )}
              </div>
            </div>

            {/* Notes */}
            {selection.notes && (
              <div style={{
                background: 'var(--hub-card-bg)', border: '1px solid var(--hub-card-border)',
                borderRadius: 10, padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <MessageSquare size={12} color="var(--app-text-subtle)" />
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--app-text-subtle)', letterSpacing: '0.1em' }}>
                    ЗАМЕТКИ
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--app-text-muted)', lineHeight: 1.5 }}>
                  {selection.notes}
                </div>
              </div>
            )}

            {/* Create deal CTA */}
            {(selection.status === 'viewed' || selection.status === 'sent') && (
              <button
                onClick={() => navigate('/dashboard/deals/kanban')}
                style={{
                  padding: '10px 16px', borderRadius: 8, width: '100%',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                  color: '#22c55e', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                Создать сделку →
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

function PropertyRow({ prop }: { prop: SelectionProperty }) {
  const isLiked = prop.liked
  const isHidden = prop.hidden
  const marketColor = MARKET_COLORS[prop.market]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: isLiked ? 'rgba(34,197,94,0.05)' : isHidden ? 'var(--green-deep)' : 'var(--hub-card-bg)',
      border: `1px solid ${isLiked ? 'rgba(34,197,94,0.2)' : isHidden ? 'var(--divider-subtle)' : 'var(--hub-card-border)'}`,
      borderRadius: 8, padding: '12px 14px',
      opacity: isHidden ? 0.5 : 1,
    }}>
      {/* Market badge */}
      <div style={{
        width: 30, height: 30, borderRadius: 6, flexShrink: 0,
        background: `${marketColor}12`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {prop.market === 'primary' ? (
          <Building2 size={14} color={marketColor} />
        ) : (
          <Home size={14} color={marketColor} />
        )}
      </div>

      {/* Address */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: isHidden ? 'var(--app-text-subtle)' : 'var(--app-text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2,
        }}>
          {prop.address}
        </div>
        <div style={{ fontSize: 11, color: 'var(--app-text-muted)' }}>
          {prop.rooms === 0 ? 'Студия' : `${prop.rooms}-комн.`} · {prop.area} м² · {prop.floor} эт.
          {prop.developer && ` · ${prop.developer}`}
        </div>
      </div>

      {/* Price */}
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text)', flexShrink: 0 }}>
        {formatPrice(prop.price)}
      </div>

      {/* Reaction */}
      <div style={{ flexShrink: 0, width: 20 }}>
        {isLiked && <ThumbsUp size={14} color="#22c55e" />}
        {isHidden && <EyeOff size={14} color="var(--app-text-subtle)" />}
      </div>

      {/* Market label */}
      <div style={{
        fontSize: 9, fontWeight: 700, color: marketColor,
        letterSpacing: '0.08em', flexShrink: 0,
      }}>
        {MARKET_LABELS[prop.market].toUpperCase()}
      </div>
    </div>
  )
}

function TimelineItem({ icon, label, date }: { icon: React.ReactNode; label: string; date: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 4,
        background: 'var(--hub-tile-icon-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--gold)', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: 'var(--app-text-muted)' }}>{label}</div>
      </div>
      <div style={{ fontSize: 10, color: 'var(--app-text-subtle)' }}>
        {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
      </div>
    </div>
  )
}
