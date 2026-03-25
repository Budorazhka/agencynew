import { useState, useEffect, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { X, User, Building2, Megaphone } from 'lucide-react'
import { CLIENT_SOURCE_GROUPS } from '@/data/clients-mock'
import { type Client, type ClientRequestType, type ClientType, CLIENT_REQUEST_TYPE_LABEL } from '@/types/clients'

const PRIMARY = '#e6c364'
const SURFACE = '#0a1f12'
const DIALOG_BG = '#040d0a'

const DEFAULT_SOURCE = CLIENT_SOURCE_GROUPS[0]?.sources[0] ?? 'Baza.sale'

function displayNameForCompany(org: string): string {
  const t = org.trim()
  if (!t) return ''
  return t.length > 28 ? `${t.slice(0, 26)}…` : t
}

function displayNameFromPerson(lastName: string, firstName: string): string {
  const L = lastName.trim()
  const F = firstName.trim()
  if (!L && !F) return ''
  if (!F) return L
  if (!L) return F
  return `${L} ${F[0]}.`
}

const REQUEST_KEYS = Object.keys(CLIENT_REQUEST_TYPE_LABEL) as ClientRequestType[]

function budgetInputToStored(raw: string): string | undefined {
  const t = raw.trim()
  if (t === '') return undefined
  const n = Number(t)
  if (!Number.isFinite(n) || n < 0 || n > 1e15) return undefined
  return `$${Math.round(n).toLocaleString('en-US')}`
}

const inputBase = {
  width: '100%' as const,
  height: 44,
  padding: '0 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  background: SURFACE,
  color: '#e8f2ec',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
}

const labelStyle = { fontSize: 13, fontWeight: 600 as const, color: 'rgba(220,230,224,0.92)', marginBottom: 6 }

type Props = {
  open: boolean
  onClose: () => void
  onCreated: (client: Client) => void
  assignedAgentId: string
  assignedAgentName: string
}

export function CreateClientModal({
  open,
  onClose,
  onCreated,
  assignedAgentId,
  assignedAgentName,
}: Props) {
  const [clientType, setClientType] = useState<ClientType>('individual')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [budget, setBudget] = useState('')
  const [requestType, setRequestType] = useState<ClientRequestType | ''>('')
  const [sourceKey, setSourceKey] = useState<string>(DEFAULT_SOURCE)
  const [sourceOther, setSourceOther] = useState('')
  const [interests, setInterests] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setClientType('individual')
    setFirstName('')
    setLastName('')
    setCompanyName('')
    setPhone('')
    setEmail('')
    setBudget('')
    setRequestType('')
    setSourceKey(DEFAULT_SOURCE)
    setSourceOther('')
    setInterests('')
    setError(null)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const resolvedSource =
    sourceKey === 'Другое' ? sourceOther.trim() || 'Другое (не указано)' : sourceKey

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const p = phone.trim()
    if (!p) {
      setError('Укажите телефон')
      return
    }
    if (!requestType) {
      setError('Выберите тип запроса: первичка, вторичка, аренда или коммерция')
      return
    }
    if (sourceKey === 'Другое' && !sourceOther.trim()) {
      setError('Опишите источник в поле «Свой вариант» или выберите другой канал')
      return
    }

    let name: string
    let displayName: string
    let firstNameOut: string | undefined
    let lastNameOut: string | undefined

    if (clientType === 'company') {
      const org = companyName.trim()
      if (!org) {
        setError('Укажите название организации')
        return
      }
      name = org
      displayName = displayNameForCompany(org)
    } else {
      const fn = firstName.trim()
      const ln = lastName.trim()
      if (!fn) {
        setError('Укажите имя')
        return
      }
      if (!ln) {
        setError('Укажите фамилию')
        return
      }
      firstNameOut = fn
      lastNameOut = ln
      name = `${ln} ${fn}`
      displayName = displayNameFromPerson(ln, fn)
    }

    const id = `cl-${Date.now()}`
    const today = new Date().toISOString().slice(0, 10)
    const client: Client = {
      id,
      type: clientType,
      name,
      displayName,
      firstName: firstNameOut,
      lastName: lastNameOut,
      phone: p,
      email: email.trim() || undefined,
      assignedAgentId,
      assignedAgentName,
      segment: 'active',
      source: resolvedSource,
      createdAt: today,
      lastContactAt: today,
      budget: budgetInputToStored(budget),
      requestType,
      interests: interests.trim() || undefined,
      dealsCount: 0,
      tasksCount: 0,
    }
    onCreated(client)
    onClose()
  }

  const modal = (
    <>
      <div
        role="presentation"
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10100,
          background: 'rgba(0,0,0,0.55)',
        }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="create-client-title"
        style={{
          position: 'fixed',
          zIndex: 10101,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(520px, calc(100vw - 28px))',
          maxHeight: 'min(90vh, 780px)',
          overflowY: 'auto',
          padding: 22,
          background: DIALOG_BG,
          border: `2px solid ${PRIMARY}`,
          borderRadius: 14,
          boxShadow: '0 24px 64px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)',
          boxSizing: 'border-box',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
          <h2 id="create-client-title" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.25 }}>
            Новый клиент
          </h2>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(0,0,0,0.35)',
              color: 'rgba(220,230,224,0.85)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: 'rgba(194, 200, 196, 0.72)', lineHeight: 1.45 }}>
          Источник обязателен для аналитики по каналам. Тип запроса — первичка, вторичка, аренда или коммерция.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <span style={{ ...labelStyle, display: 'block', marginBottom: 8 }}>Тип</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {(
                [
                  { key: 'individual' as const, label: 'Физлицо', Icon: User },
                  { key: 'company' as const, label: 'Юрлицо', Icon: Building2 },
                ] as const
              ).map(({ key, label, Icon }) => {
                const active = clientType === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setClientType(key)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      height: 44,
                      borderRadius: 10,
                      border: active ? `2px solid ${PRIMARY}` : '1px solid rgba(255,255,255,0.12)',
                      background: active ? 'rgba(230,195,100,0.12)' : SURFACE,
                      color: active ? PRIMARY : 'rgba(220,230,224,0.85)',
                      fontSize: 13,
                      fontWeight: active ? 700 : 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {clientType === 'individual' ? (
            <>
              <label style={{ display: 'block', marginBottom: 14 }}>
                <span style={labelStyle}>
                  Имя <span style={{ color: '#fb923c' }}>*</span>
                </span>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Иван"
                  style={inputBase}
                  autoComplete="given-name"
                />
              </label>
              <label style={{ display: 'block', marginBottom: 14 }}>
                <span style={labelStyle}>
                  Фамилия <span style={{ color: '#fb923c' }}>*</span>
                </span>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Иванов"
                  style={inputBase}
                  autoComplete="family-name"
                />
              </label>
            </>
          ) : (
            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={labelStyle}>
                Название организации <span style={{ color: '#fb923c' }}>*</span>
              </span>
              <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="ООО «…»"
                style={inputBase}
              />
            </label>
          )}

          <label style={{ display: 'block', marginBottom: 14 }}>
            <span style={labelStyle}>
              Телефон <span style={{ color: '#fb923c' }}>*</span>
            </span>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+7 …"
              style={inputBase}
              inputMode="tel"
            />
          </label>

          <label style={{ display: 'block', marginBottom: 14 }}>
            <span style={labelStyle}>Email</span>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="необязательно"
              type="email"
              style={inputBase}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 14 }}>
            <span style={labelStyle}>Бюджет</span>
            <div style={{ position: 'relative' }}>
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'rgba(194, 200, 196, 0.38)',
                  pointerEvents: 'none',
                  lineHeight: 1,
                }}
              >
                $
              </span>
              <input
                type="number"
                min={0}
                step={1}
                className="create-client-budget-input"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                autoComplete="off"
                style={{
                  ...inputBase,
                  width: '100%',
                  paddingLeft: 28,
                }}
              />
            </div>
          </label>

          <label style={{ display: 'block', marginBottom: 18 }}>
            <span style={labelStyle}>
              Тип запроса <span style={{ color: '#fb923c' }}>*</span>
            </span>
            <select
              value={requestType}
              onChange={e => setRequestType(e.target.value as ClientRequestType | '')}
              style={{
                ...inputBase,
                height: 48,
                cursor: 'pointer',
              }}
            >
              <option value="">Выберите…</option>
              {REQUEST_KEYS.map(key => (
                <option key={key} value={key}>
                  {CLIENT_REQUEST_TYPE_LABEL[key]}
                </option>
              ))}
            </select>
          </label>

          <div
            style={{
              marginBottom: 18,
              padding: 14,
              borderRadius: 12,
              border: '1px solid rgba(230,195,100,0.28)',
              background: 'rgba(15, 35, 30, 0.65)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(230,195,100,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Megaphone size={20} color={PRIMARY} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Источник обращения
                </div>
                <div style={{ fontSize: 12, color: 'rgba(194,200,196,0.65)', marginTop: 2, lineHeight: 1.4 }}>
                  Кабинеты — платные кампании (Директ, Google Ads, Meta). Группа «соцсети» — когда написали в директ или пришли с органики, без рекламы из кабинета.
                </div>
              </div>
            </div>
            <label style={{ display: 'block', marginBottom: sourceKey === 'Другое' ? 10 : 0 }}>
              <span style={{ ...labelStyle, fontSize: 12 }}>Канал / сценарий <span style={{ color: '#fb923c' }}>*</span></span>
              <select
                value={sourceKey}
                onChange={e => setSourceKey(e.target.value)}
                style={{
                  ...inputBase,
                  height: 48,
                  cursor: 'pointer',
                }}
              >
                {CLIENT_SOURCE_GROUPS.map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.sources.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            {sourceKey === 'Другое' && (
              <label style={{ display: 'block' }}>
                <span style={{ ...labelStyle, fontSize: 12 }}>Свой вариант <span style={{ color: '#fb923c' }}>*</span></span>
                <input
                  value={sourceOther}
                  onChange={e => setSourceOther(e.target.value)}
                  placeholder="Например: чат-бот на сайте застройщика"
                  style={inputBase}
                />
              </label>
            )}
          </div>

          <label style={{ display: 'block', marginBottom: error ? 12 : 18 }}>
            <span style={labelStyle}>Комментарий к запросу</span>
            <textarea
              value={interests}
              onChange={e => setInterests(e.target.value)}
              placeholder="Объект, сроки, пожелания…"
              rows={3}
              style={{
                ...inputBase,
                height: 'auto',
                minHeight: 80,
                padding: '12px 14px',
                resize: 'vertical' as const,
              }}
            />
          </label>

          {error && (
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#fb923c', lineHeight: 1.4 }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: 'rgba(220,230,224,0.9)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                height: 48,
                borderRadius: 10,
                border: 'none',
                background: '#a07828',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.04em',
              }}
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </>
  )

  return createPortal(modal, document.body)
}
