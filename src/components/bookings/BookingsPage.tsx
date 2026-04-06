import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Clock, AlertTriangle, CheckCircle, XCircle, Building2, Layers, Minus, Plus } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { useLeads } from '@/context/LeadsContext'
import {
  AGENCY_SECONDARY_LOTS_MOCK,
  NEW_BUILD_APARTMENTS_MOCK,
  NEW_BUILD_COMPLEXES_MOCK,
} from '@/data/bookings-catalog-mock'
import { BOOKINGS_MOCK } from '@/data/bookings-mock'
import {
  BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS,
  type Booking, type BookingPropertyMarket, type BookingStatus,
} from '@/types/bookings'
import type { Lead, LeadSource } from '@/types/leads'
import { LEAD_STAGES } from '@/data/leads-mock'

const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
  rent: 'Аренда',
  ad_campaigns: 'Реклама',
}

const NO_LEAD_VALUE = '__no_lead__'

function stageName(stageId: string): string {
  return LEAD_STAGES.find(s => s.id === stageId)?.name ?? stageId
}

function LeadBookingSelect({
  value,
  onChange,
  leads,
}: {
  value: string
  onChange: (id: string) => void
  leads: Lead[]
}) {
  return (
    <Select
      value={value ? value : NO_LEAD_VALUE}
      onValueChange={v => onChange(v === NO_LEAD_VALUE ? '' : v)}
    >
      <SelectTrigger className="border-[var(--green-border)] bg-[var(--green-deep)] text-[color:var(--app-text)]">
        <SelectValue placeholder="Выберите лида" />
      </SelectTrigger>
      <SelectContent className="max-h-[min(320px,50vh)] border-[var(--green-border)] bg-[var(--green-card)] text-[color:var(--app-text)]">
        <SelectItem value={NO_LEAD_VALUE} className="focus:bg-[var(--dropdown-hover)]">
          Без лида
        </SelectItem>
        {leads.map(lead => (
          <SelectItem key={lead.id} value={lead.id} className="focus:bg-[var(--dropdown-hover)]">
            <span className="font-mono text-[11px] text-[color:var(--app-text-subtle)]">{lead.id}</span>
            {' · '}
            {lead.name ?? 'Без имени'}
            {' · '}
            {LEAD_SOURCE_LABELS[lead.source]}
            {' · '}
            {stageName(lead.stageId)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function BookingHoursField({
  value,
  onChange,
  id,
}: {
  value: string
  onChange: (v: string) => void
  id: string
}) {
  const parsed = parseInt(value, 10)
  const safe = Number.isFinite(parsed) && parsed >= 1 ? Math.min(720, parsed) : 72
  const bump = (delta: number) => onChange(String(Math.max(1, Math.min(720, safe + delta))))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 border-[var(--green-border)] bg-[var(--green-deep)] text-[color:var(--app-text)] hover:bg-[var(--dropdown-hover)]"
          onClick={() => bump(-24)}
          aria-label="Уменьшить срок на 24 часа"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={e => {
            const d = e.target.value.replace(/\D/g, '').slice(0, 3)
            onChange(d)
          }}
          onBlur={() => {
            const x = parseInt(value, 10)
            if (!Number.isFinite(x) || x < 1) onChange('72')
            else onChange(String(Math.min(720, x)))
          }}
          className="border-[var(--green-border)] bg-[var(--green-deep)] text-center text-[color:var(--app-text)] tabular-nums max-w-[5rem]"
        />
        <span className="text-sm text-[color:var(--app-text-muted)] shrink-0">ч</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 border-[var(--green-border)] bg-[var(--green-deep)] text-[color:var(--app-text)] hover:bg-[var(--dropdown-hover)]"
          onClick={() => bump(24)}
          aria-label="Увеличить срок на 24 часа"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {[24, 48, 72, 120, 168].map(h => (
          <button
            key={h}
            type="button"
            onClick={() => onChange(String(h))}
            className={`rounded-[var(--section-cta-radius)] border px-3 py-1.5 text-xs font-semibold transition-colors ${
              safe === h
                ? 'border-[var(--gold)] bg-[var(--nav-item-bg-active)] text-[color:var(--theme-accent-heading)]'
                : 'border-[var(--green-border)] bg-transparent text-[color:var(--app-text-muted)] hover:bg-[var(--dropdown-hover)]'
            }`}
          >
            {h} ч
          </button>
        ))}
      </div>
    </div>
  )
}

const C = {
  gold: 'var(--gold)',
  white: 'var(--app-text)',
  whiteMid: 'var(--app-text-muted)',
  whiteLow: 'var(--app-text-subtle)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
  green: '#4ade80',
  red: '#f87171',
  orange: '#fb923c',
  blue: '#60a5fa',
}

function useCountdown(expiresAt: string) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    function calc() {
      const diff = new Date(expiresAt).getTime() - Date.now()
      setRemaining(Math.max(0, diff))
    }
    calc()
    const t = setInterval(calc, 60000)
    return () => clearInterval(t)
  }, [expiresAt])

  const totalHours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  return { totalHours, minutes, isExpired: remaining === 0 }
}

function CountdownTimer({ expiresAt, status }: { expiresAt: string; status: BookingStatus }) {
  const { totalHours, minutes, isExpired } = useCountdown(expiresAt)

  if (status !== 'active') return null

  const color = totalHours < 12 ? C.red : totalHours < 24 ? C.orange : C.green
  const isUrgent = totalHours < 12

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {isUrgent && <AlertTriangle size={12} color={C.red} />}
      <Clock size={12} color={color} />
      <span style={{ fontSize: 11, fontWeight: 700, color }}>
        {isExpired ? 'Истекла' : `${totalHours}ч ${minutes}мин`}
      </span>
    </div>
  )
}

type FilterTab = 'all' | 'client' | 'apartment' | 'active' | 'expired'

/** client — только фиксация клиента в ЖК; buyer — бронь квартиры (первичка/вторичка); all — полный список (история). */
type BookingsFlowVariant = 'client' | 'buyer' | 'all'

function bookingsVariantFromPath(pathname: string): BookingsFlowVariant {
  if (pathname.includes('/bookings/history')) return 'all'
  if (pathname.includes('/register-buyer') || pathname.includes('/bookings/apartment')) return 'buyer'
  return 'client'
}

function apartmentMarket(b: Booking): BookingPropertyMarket {
  if (b.type !== 'apartment') return 'primary'
  return b.propertyMarket ?? 'primary'
}

export function BookingsPage() {
  const location = useLocation()
  const variant = bookingsVariantFromPath(location.pathname)
  const { currentUser } = useAuth()
  const { state: leadsState } = useLeads()
  const [bookings, setBookings] = useState<Booking[]>(() => [...BOOKINGS_MOCK])
  const [tab, setTab] = useState<FilterTab>('all')
  const [apartmentSubTab, setApartmentSubTab] = useState<BookingPropertyMarket>('primary')

  const [primaryOpen, setPrimaryOpen] = useState(false)
  const [primKind, setPrimKind] = useState<'client' | 'apartment'>('client')
  const [primRcId, setPrimRcId] = useState('')
  const [primAptId, setPrimAptId] = useState('')
  const [primClient, setPrimClient] = useState('')
  const [primHours, setPrimHours] = useState('72')
  const [primNotes, setPrimNotes] = useState('')
  const [primLeadId, setPrimLeadId] = useState('')

  const [secondaryOpen, setSecondaryOpen] = useState(false)
  const [secLotId, setSecLotId] = useState('')
  const [secClient, setSecClient] = useState('')
  const [secHours, setSecHours] = useState('72')
  const [secNotes, setSecNotes] = useState('')
  const [secLeadId, setSecLeadId] = useState('')

  const leadsSorted = useMemo(() => {
    return [...leadsState.leadPool].sort((a, b) => {
      const an = (a.name ?? a.id).toLocaleLowerCase()
      const bn = (b.name ?? b.id).toLocaleLowerCase()
      return an.localeCompare(bn, 'ru')
    })
  }, [leadsState.leadPool])

  const apartmentsForRc = useMemo(
    () => NEW_BUILD_APARTMENTS_MOCK.filter(a => a.rcId === primRcId),
    [primRcId],
  )

  function openPrimaryModal() {
    if (variant === 'buyer') setPrimKind('apartment')
    else if (variant === 'client') setPrimKind('client')
    else {
      if (tab === 'client') setPrimKind('client')
      else if (tab === 'apartment' && apartmentSubTab === 'primary') setPrimKind('apartment')
      else setPrimKind('client')
    }
    setPrimRcId('')
    setPrimAptId('')
    setPrimClient('')
    setPrimHours('72')
    setPrimNotes('')
    setPrimLeadId('')
    setPrimaryOpen(true)
  }

  function openSecondaryModal() {
    setSecLotId('')
    setSecClient('')
    setSecHours('72')
    setSecNotes('')
    setSecLeadId('')
    setSecondaryOpen(true)
  }

  function submitPrimaryBooking() {
    const rc = NEW_BUILD_COMPLEXES_MOCK.find(r => r.id === primRcId)
    const name = primClient.trim()
    if (!rc || !name) return
    if (primKind === 'apartment') {
      const apt = NEW_BUILD_APARTMENTS_MOCK.find(a => a.id === primAptId && a.rcId === primRcId)
      if (!apt) return
    }

    const hours = Math.max(1, Number.parseInt(primHours, 10) || 72)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString()

    let propertyAddress = rc.name
    let propertyType = primKind === 'client' ? 'Фиксация в ЖК' : '—'
    let newBuildApartmentId: string | undefined

    if (primKind === 'apartment') {
      const apt = NEW_BUILD_APARTMENTS_MOCK.find(a => a.id === primAptId && a.rcId === primRcId)!
      propertyAddress = `${rc.name}, ${apt.label}`
      propertyType = apt.typology
      newBuildApartmentId = apt.id
    }

    const row: Booking = {
      id: `book-${Date.now()}`,
      type: primKind,
      status: 'active',
      clientId: `tmp-${Date.now()}`,
      clientName: name,
      propertyAddress,
      propertyType,
      bookedAt: now.toISOString(),
      durationHours: hours,
      expiresAt,
      agentId: currentUser?.id ?? 'lm-1',
      agentName: currentUser?.name ?? 'Агент',
      developerName: rc.developerName,
      newBuildComplexId: rc.id,
      newBuildApartmentId,
      notes: primNotes.trim() || undefined,
      sourceLeadId: primLeadId.trim() || undefined,
    }
    if (primKind === 'apartment') row.propertyMarket = 'primary'

    setBookings(prev => [row, ...prev])
    setPrimaryOpen(false)
  }

  function submitSecondaryBooking() {
    const lot = AGENCY_SECONDARY_LOTS_MOCK.find(l => l.id === secLotId)
    const name = secClient.trim()
    if (!lot || !name) return

    const hours = Math.max(1, Number.parseInt(secHours, 10) || 72)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString()

    const row: Booking = {
      id: `book-${Date.now()}`,
      type: 'apartment',
      status: 'active',
      propertyMarket: 'secondary',
      clientId: `tmp-${Date.now()}`,
      clientName: name,
      propertyAddress: lot.address,
      propertyType: lot.propertyType,
      bookedAt: now.toISOString(),
      durationHours: hours,
      expiresAt,
      agentId: currentUser?.id ?? 'lm-1',
      agentName: currentUser?.name ?? 'Агент',
      agencyLotId: lot.id,
      sourceLeadId: secLeadId.trim() || undefined,
      notes: secNotes.trim() || undefined,
    }

    setBookings(prev => [row, ...prev])
    setSecondaryOpen(false)
  }

  useEffect(() => {
    const p = location.pathname
    if (p.includes('/bookings/history')) setTab('expired')
    else if (p.includes('/bookings/apartment')) {
      setTab('apartment')
      setApartmentSubTab('primary')
    } else if (p.includes('/bookings/client')) setTab('client')
    else if (p.includes('/register-buyer') || p.includes('/register-client')) setTab('all')
  }, [location.pathname])

  useEffect(() => {
    if (variant === 'buyer') setPrimKind('apartment')
    if (variant === 'client') setPrimKind('client')
  }, [variant])

  useEffect(() => {
    if (variant === 'buyer' && tab === 'client') setTab('all')
    if (variant === 'client' && tab === 'apartment') setTab('all')
  }, [variant, tab])

  const isHistoryRoute = location.pathname.includes('/bookings/history')

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (variant === 'client' && b.type !== 'client') return false
      if (variant === 'buyer' && b.type !== 'apartment') return false

      if (tab === 'active') {
        if (b.status !== 'active') return false
      } else if (tab === 'expired') {
        if (isHistoryRoute) {
          if (!['expired', 'rejected', 'completed'].includes(b.status)) return false
        } else if (b.status !== 'expired' && b.status !== 'rejected') {
          return false
        }
      } else if (tab === 'client') {
        if (b.type !== 'client') return false
      } else if (tab === 'apartment') {
        if (b.type !== 'apartment') return false
        if (apartmentMarket(b) !== apartmentSubTab) return false
      }
      return true
    })
  }, [bookings, tab, apartmentSubTab, isHistoryRoute, variant])

  const TABS: { key: FilterTab; label: string }[] = useMemo(() => {
    if (variant === 'client') {
      return [
        { key: 'all' as const, label: 'Все' },
        { key: 'active' as const, label: 'Активные' },
        { key: 'client' as const, label: 'Брони клиента' },
        { key: 'expired' as const, label: 'Истекшие' },
      ]
    }
    if (variant === 'buyer') {
      return [
        { key: 'all' as const, label: 'Все' },
        { key: 'active' as const, label: 'Активные' },
        { key: 'apartment' as const, label: 'Брони квартиры' },
        { key: 'expired' as const, label: 'Истекшие' },
      ]
    }
    return [
      { key: 'all' as const, label: 'Все' },
      { key: 'active' as const, label: 'Активные' },
      { key: 'client' as const, label: 'Брони клиента' },
      { key: 'apartment' as const, label: 'Брони квартиры' },
      { key: 'expired' as const, label: 'Истекшие' },
    ]
  }, [variant])

  const activeCount = useMemo(() => {
    return bookings.filter(b => {
      if (b.status !== 'active') return false
      if (variant === 'client' && b.type !== 'client') return false
      if (variant === 'buyer' && b.type !== 'apartment') return false
      return true
    }).length
  }, [bookings, variant])

  return (
    <DashboardShell>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '28px 24px 48px',
          boxSizing: 'border-box',
          width: '100%',
          minHeight: 0,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 920,
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              marginBottom: 8,
            }}
          >
            <div style={{ textAlign: 'left' as const, flex: '1 1 240px' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.white, letterSpacing: '-0.01em' }}>
                {variant === 'client'
                  ? 'Регистрация клиента'
                  : variant === 'buyer'
                    ? 'Регистрация покупателя'
                    : 'Брони / Регистрации'}
              </div>
              <div style={{ fontSize: 13, color: C.whiteLow, marginTop: 4, maxWidth: 560, lineHeight: 1.45 }}>
                {variant === 'client' && (
                  <>
                    Фиксация приведённого клиента за жилым комплексом в новостройке (несколько таких регистраций на одного клиента допустимы). ·{' '}
                  </>
                )}
                {variant === 'buyer' && (
                  <>
                    Бронь квартиры: новостройка (лот в ЖК) или вторичка из базы агентства. ·{' '}
                  </>
                )}
                {variant === 'all' && (
                  <>
                    Бронь клиента — только новостройки (фиксация в ЖК). Бронь квартиры — первичка (шахматка) или вторичка (лот из своей базы и лид). ·{' '}
                  </>
                )}
                <span style={{ color: C.gold, fontWeight: 600 }}>{activeCount}</span> активных
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <button type="button" onClick={openPrimaryModal} className="alphabase-section-primary">
                <Building2 size={18} strokeWidth={2.25} />
                Новостройка
              </button>
              {(variant === 'buyer' || variant === 'all') && (
                <button
                  type="button"
                  onClick={openSecondaryModal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 16px',
                    background: 'transparent',
                    border: '1px solid var(--hub-card-border-hover)',
                    borderRadius: 'var(--section-cta-radius)',
                    color: 'var(--theme-accent-heading)',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase' as const,
                    cursor: 'pointer',
                  }}
                >
                  <Layers size={18} strokeWidth={2.25} />
                  Вторичка
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              gap: 8,
              marginBottom: 24,
              padding: '4px 0',
            }}
          >
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key)
                  if (t.key === 'apartment') setApartmentSubTab('primary')
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--section-cta-radius)',
                  border: `1px solid ${tab === t.key ? 'var(--hub-card-border-hover)' : 'var(--hub-card-border)'}`,
                  background: tab === t.key ? 'var(--nav-item-bg-active)' : 'var(--hub-card-bg)',
                  color: tab === t.key ? C.gold : C.whiteLow,
                  fontSize: 12,
                  fontWeight: tab === t.key ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'client' && (
            <p style={{ fontSize: 12, color: C.whiteLow, marginTop: -12, marginBottom: 20, lineHeight: 1.5 }}>
              Раздел только для <strong style={{ color: C.gold }}>новостроек</strong>: закрепление приведённого клиента за конкретным ЖК / застройщиком (несколько таких броней на клиента допустимы).
            </p>
          )}

          {isHistoryRoute && tab === 'expired' && (
            <p style={{ fontSize: 12, color: C.whiteLow, marginTop: -12, marginBottom: 16 }}>
              История: завершённые, просроченные и отклонённые брони.
            </p>
          )}

          {tab === 'apartment' && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                marginTop: -8,
                marginBottom: 22,
                padding: '12px 14px',
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: 'var(--hub-card-bg)',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: C.whiteLow, alignSelf: 'center', textTransform: 'uppercase' as const }}>
                Брони квартиры
              </span>
              {(['primary', 'secondary'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setApartmentSubTab(m)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--section-cta-radius)',
                    border: `1px solid ${apartmentSubTab === m ? 'var(--hub-card-border-hover)' : 'var(--hub-card-border)'}`,
                    background: apartmentSubTab === m ? 'var(--nav-item-bg-active)' : 'transparent',
                    color: apartmentSubTab === m ? C.gold : C.whiteMid,
                    fontSize: 12,
                    fontWeight: apartmentSubTab === m ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {m === 'primary' ? 'Первичка' : 'Вторичка'}
                </button>
              ))}
              <span style={{ fontSize: 11, color: C.whiteLow, flex: '1 1 200px', lineHeight: 1.4 }}>
                {apartmentSubTab === 'primary'
                  ? 'Шахматка ЖК, конкретный лот в новостройке.'
                  : 'Объект из внутреннего списка агентства, связь с лидом.'}
              </span>
            </div>
          )}

          {/* Bookings cards */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
            {filtered.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
            {filtered.length === 0 && (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center' as const,
                  color: C.whiteLow,
                  border: `1px dashed ${C.border}`,
                  borderRadius: 12,
                  background: 'var(--workspace-row-bg)',
                }}
              >
                Бронирований не найдено
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={primaryOpen} onOpenChange={setPrimaryOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--green-border)] bg-[var(--green-card)] text-[color:var(--app-text)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f5]">
              {variant === 'client'
                ? 'Регистрация клиента в ЖК'
                : variant === 'buyer'
                  ? 'Бронь квартиры · новостройка'
                  : 'Бронь · новостройка'}
            </DialogTitle>
            <DialogDescription className="text-[color:var(--app-text-muted)]">
              {variant === 'client' && 'Выберите жилой комплекс и укажите клиента. Список ЖК позже подгрузится с сервера.'}
              {variant === 'buyer' &&
                'Сначала ЖК, затем лот (шахматка / каталог). Список позже подгрузится с сервера.'}
              {variant === 'all' &&
                'Два шага: сначала ЖК, затем при брони квартиры — лот (шахматка / каталог). Список позже подгрузится с сервера.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-1">
            {variant === 'all' && (
              <div className="flex flex-wrap gap-2">
                <span className="w-full text-[10px] font-bold uppercase tracking-wider text-[color:var(--app-text-subtle)]">Что бронируем</span>
                {(['client', 'apartment'] as const).map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setPrimKind(k)
                      setPrimAptId('')
                    }}
                    className={`rounded-[var(--section-cta-radius)] border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      primKind === k
                        ? 'border-[var(--gold)] bg-[var(--nav-item-bg-active)] text-[color:var(--theme-accent-heading)]'
                        : 'border-[var(--green-border)] bg-transparent text-[color:var(--app-text-muted)] hover:bg-[var(--dropdown-hover)]'
                    }`}
                  >
                    {k === 'client' ? 'Клиента в ЖК' : 'Квартиру'}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-[color:var(--app-text)]">1. Жилой комплекс</Label>
              <Select
                value={primRcId || undefined}
                onValueChange={v => {
                  setPrimRcId(v)
                  setPrimAptId('')
                }}
              >
                <SelectTrigger className="border-[var(--green-border)] bg-[var(--green-deep)] text-[color:var(--app-text)]">
                  <SelectValue placeholder="Выберите ЖК" />
                </SelectTrigger>
                <SelectContent className="border-[var(--green-border)] bg-[var(--green-card)] text-[color:var(--app-text)]">
                  {NEW_BUILD_COMPLEXES_MOCK.map(rc => (
                    <SelectItem key={rc.id} value={rc.id} className="focus:bg-[var(--dropdown-hover)]">
                      {rc.name} · {rc.developerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(variant === 'buyer' || primKind === 'apartment') && (
              <div className="space-y-1.5">
                <Label className="text-[color:var(--app-text)]">2. Квартира (лот)</Label>
                <Select
                  value={primAptId || undefined}
                  onValueChange={setPrimAptId}
                  disabled={!primRcId || apartmentsForRc.length === 0}
                >
                  <SelectTrigger className="border-[var(--green-border)] bg-[var(--green-deep)] text-[color:var(--app-text)] disabled:opacity-50">
                    <SelectValue placeholder={primRcId ? 'Выберите квартиру' : 'Сначала выберите ЖК'} />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--green-border)] bg-[var(--green-card)] text-[color:var(--app-text)]">
                    {apartmentsForRc.map(apt => (
                      <SelectItem key={apt.id} value={apt.id} className="focus:bg-[var(--dropdown-hover)]">
                        {apt.label} · {apt.typology}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="prim-client" className="text-[color:var(--app-text)]">Клиент (ФИО)</Label>
              <Input
                id="prim-client"
                value={primClient}
                onChange={e => setPrimClient(e.target.value)}
                placeholder="Иванов И.И."
                className="border-[var(--green-border)] bg-[var(--green-deep)] text-[color:var(--app-text)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[color:var(--app-text)]">Лид (из вашей базы, необязательно)</Label>
              <LeadBookingSelect value={primLeadId} onChange={setPrimLeadId} leads={leadsSorted} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prim-hours" className="text-[color:var(--app-text)]">Срок брони</Label>
              <BookingHoursField id="prim-hours" value={primHours} onChange={setPrimHours} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prim-notes" className="text-[color:var(--app-text)]">Комментарий</Label>
              <Input
                id="prim-notes"
                value={primNotes}
                onChange={e => setPrimNotes(e.target.value)}
                className="border-[var(--green-border)] bg-[var(--green-deep)] text-[color:var(--app-text)]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setPrimaryOpen(false)} className="border-[var(--green-border)] bg-transparent text-[color:var(--app-text)]">
              Отмена
            </Button>
            <Button type="button" onClick={submitPrimaryBooking} variant="sectionPrimary">
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={secondaryOpen} onOpenChange={setSecondaryOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--green-border)] bg-[var(--green-card)] text-[color:var(--app-text)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f5]">Бронь · вторичка</DialogTitle>
            <DialogDescription className="text-[color:var(--app-text-muted)]">
              Выбор объекта из внутренней базы агентства (позже — ваша CRM / каталог). Отдельный процесс от новостроек.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-1">
            <div className="space-y-1.5">
              <Label className="text-[color:var(--app-text)]">Объект из своей базы</Label>
              <Select value={secLotId || undefined} onValueChange={setSecLotId}>
                <SelectTrigger className="border-[var(--green-border)] bg-[var(--green-deep)] text-[color:var(--app-text)]">
                  <SelectValue placeholder="Выберите лот" />
                </SelectTrigger>
                <SelectContent className="border-[var(--green-border)] bg-[var(--green-card)] text-[color:var(--app-text)]">
                  {AGENCY_SECONDARY_LOTS_MOCK.map(lot => (
                    <SelectItem key={lot.id} value={lot.id} className="focus:bg-[var(--dropdown-hover)]">
                      {lot.address} · {lot.propertyType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sec-client" className="text-[color:var(--app-text)]">Клиент (ФИО)</Label>
              <Input
                id="sec-client"
                value={secClient}
                onChange={e => setSecClient(e.target.value)}
                className="border-[var(--green-border)] bg-[var(--green-deep)] text-[color:var(--app-text)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[color:var(--app-text)]">Лид (из вашей базы, необязательно)</Label>
              <LeadBookingSelect value={secLeadId} onChange={setSecLeadId} leads={leadsSorted} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sec-hours" className="text-[color:var(--app-text)]">Срок брони</Label>
              <BookingHoursField id="sec-hours" value={secHours} onChange={setSecHours} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sec-notes" className="text-[color:var(--app-text)]">Комментарий</Label>
              <Input
                id="sec-notes"
                value={secNotes}
                onChange={e => setSecNotes(e.target.value)}
                className="border-[var(--green-border)] bg-[var(--green-deep)] text-[color:var(--app-text)]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setSecondaryOpen(false)} className="border-[var(--green-border)] bg-transparent text-[color:var(--app-text)]">
              Отмена
            </Button>
            <Button type="button" onClick={submitSecondaryBooking} variant="sectionPrimary">
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  const statusColor = BOOKING_STATUS_COLORS[booking.status]
  const isActive = booking.status === 'active'
  const market = apartmentMarket(booking)

  return (
    <div style={{
      background: 'var(--green-card)',
      border: `1px solid ${isActive ? 'rgba(74,222,128,0.2)' : 'var(--green-border)'}`,
      borderRadius: 10,
      padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: booking.type === 'client' ? C.blue : C.gold }}>
              {booking.type === 'client' ? 'Бронь клиента · новостройки' : 'Бронь квартиры'}
            </span>
            {booking.type === 'apartment' && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 20,
                background: market === 'primary' ? 'rgba(96,165,250,0.12)' : 'rgba(201,168,76,0.12)',
                border: `1px solid ${market === 'primary' ? 'rgba(96,165,250,0.35)' : 'rgba(201,168,76,0.35)'}`,
                color: market === 'primary' ? C.blue : C.gold,
              }}>
                {market === 'primary' ? 'Первичка' : 'Вторичка'}
              </span>
            )}
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 20,
              background: `${statusColor}18`,
              border: `1px solid ${statusColor}44`,
              color: statusColor,
            }}>
              {BOOKING_STATUS_LABELS[booking.status]}
            </span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--app-text)' }}>{booking.clientName}</div>
          <div style={{ fontSize: 13, color: 'var(--app-text-muted)', marginTop: 2 }}>
            {booking.propertyAddress} · {booking.propertyType}
          </div>
          {booking.developerName && (
            <div style={{ fontSize: 11, color: 'var(--app-text-subtle)', marginTop: 2 }}>
              Застройщик: {booking.developerName}
            </div>
          )}
          {booking.type === 'apartment' && (
            <div style={{ fontSize: 11, color: 'var(--app-text-subtle)', marginTop: 4 }}>
              {market === 'primary'
                ? 'Сценарий: шахматка ЖК, конкретный лот.'
                : 'Сценарий: объект из списка агентства, связь с лидом.'}
            </div>
          )}
          {booking.sourceLeadId && (
            <div style={{ fontSize: 11, color: 'var(--theme-accent-link-dim)', marginTop: 4 }}>
              Лид: {booking.sourceLeadId}
            </div>
          )}
        </div>

        {/* Timer */}
        <div style={{ textAlign: 'right' as const }}>
          <CountdownTimer expiresAt={booking.expiresAt} status={booking.status} />
          <div style={{ fontSize: 10, color: 'var(--app-text-subtle)', marginTop: 4 }}>
            Истекает: {new Date(booking.expiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: 'var(--app-text-subtle)' }}>
          Агент: {booking.agentName} · Создана: {new Date(booking.bookedAt).toLocaleDateString('ru-RU')}
        </div>
        {isActive && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              padding: '5px 12px',
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: 'var(--section-cta-radius)',
              color: '#4ade80',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <CheckCircle size={11} /> Подтвердить
            </button>
            <button style={{
              padding: '5px 12px',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 'var(--section-cta-radius)',
              color: '#f87171',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <XCircle size={11} /> Отменить
            </button>
          </div>
        )}
      </div>

      {booking.notes && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--app-text-subtle)', fontStyle: 'italic' as const }}>
          {booking.notes}
        </div>
      )}
    </div>
  )
}
