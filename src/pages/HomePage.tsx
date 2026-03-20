import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings, Pencil,
  Users, Handshake, Building2, BookMarked,
  Briefcase, CheckSquare, CalendarDays, GraduationCap,
  Bell, UserCog,
} from 'lucide-react'
import IconHouse from '../components/icons/IconHouse'
import IconRoulette from '../components/icons/IconRoulette'
import IconPokerChip from '../components/icons/IconPokerChip'
import AgencyBrandingModal from '../components/AgencyBrandingModal'
import { getBranding, type AgencyBranding } from '../store/agencyStore'

const ROLE: 'owner' | 'manager' = 'owner'
const USER_NAME = 'Александр'

// ─── Top 3 big cards ──────────────────────────────────────────────────────────
interface TopCard { label: string; icon: React.ReactNode; sub: string[]; route: string }

const TOP_CARDS: TopCard[] = [
  { label: 'Маркетплейс', icon: <IconHouse size={80} />,     sub: [], route: 'https://baza.sale' },
  { label: 'CRM',         icon: <IconRoulette size={80} />,  sub: [], route: '/dashboard/crm' },
  { label: 'Дашборды',    icon: <IconPokerChip size={80} />, sub: [], route: '/dashboard/dashboards' },
]

// ─── 12 module cards ──────────────────────────────────────────────────────────
interface ModuleCard { label: string; icon: React.ReactNode; route: string }

const iconStyle = { color: '#c9a84c' }

const MODULE_CARDS: ModuleCard[] = [
  { label: 'Объекты',    icon: <Building2 size={36} style={iconStyle} />,     route: '/dashboard/objects' },
  { label: 'Брони',      icon: <BookMarked size={36} style={iconStyle} />,    route: '/dashboard/bookings' },
  { label: 'Лиды',       icon: <Users size={36} style={iconStyle} />,         route: '/dashboard/leads-hub' },
  { label: 'Клиенты',    icon: <UserCog size={36} style={iconStyle} />,       route: '/dashboard/clients' },
  { label: 'Команда',    icon: <Users size={36} style={iconStyle} />,         route: '/dashboard/team' },
  { label: 'Обучение',   icon: <GraduationCap size={36} style={iconStyle} />, route: '/dashboard/learning' },
  { label: 'Сделки',     icon: <Briefcase size={36} style={iconStyle} />,     route: '/dashboard/deals' },
  { label: 'Календарь',  icon: <CalendarDays size={36} style={iconStyle} />,  route: '/dashboard/calendar' },
  { label: 'Партнёры',   icon: <Handshake size={36} style={iconStyle} />,     route: '/dashboard/partners' },
  { label: 'Задачи',     icon: <CheckSquare size={36} style={iconStyle} />,   route: '/dashboard/tasks' },
  { label: 'Информация', icon: <Bell size={36} style={iconStyle} />,          route: '/dashboard/info' },
  { label: 'Настройки',  icon: <Settings size={36} style={iconStyle} />,      route: '/dashboard/settings-hub' },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate()
  const [branding, setBranding] = useState<AgencyBranding>({ name: '', logoDataUrl: null })
  const [showBrandingModal, setShowBrandingModal] = useState(false)

  useEffect(() => { setBranding(getBranding()) }, [])

  const hasLogo = !!branding.logoDataUrl
  const hasName = !!branding.name

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--green-bg)', position: 'relative', overflow: 'hidden' }}>

      {/* ── Watermark ───────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', userSelect: 'none', gap: 16,
      }}>
        {hasLogo && (
          <img src={branding.logoDataUrl!} alt="" style={{ maxWidth: 280, maxHeight: 180, opacity: 0.07, filter: 'grayscale(30%)' }} />
        )}
        {hasName && (
          <span style={{
            fontSize: hasLogo ? 36 : 72, fontWeight: 900,
            color: 'rgba(201,168,76,0.08)', letterSpacing: '0.1em',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
          }}>
            {branding.name}
          </span>
        )}
      </div>

      {/* ── Main area ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10 }}>

        {/* Top bar */}
        <header style={{
          padding: '10px 18px',
          borderBottom: '1px solid var(--green-border)',
          background: 'var(--green-deep)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {hasLogo && (
              <img src={branding.logoDataUrl!} alt="logo" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
            )}
            {hasName && (
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.06em' }}>
                {branding.name}
              </span>
            )}
            {!hasLogo && !hasName && (
              <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                Добро пожаловать, <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{USER_NAME}</span>
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(hasName || hasLogo) && (
              <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                Добро пожаловать, <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{USER_NAME}</span>
              </span>
            )}
            {ROLE === 'owner' && (
              <button
                onClick={() => setShowBrandingModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'transparent', border: '1px solid rgba(201,168,76,0.35)',
                  color: 'rgba(201,168,76,0.7)', borderRadius: 8, padding: '5px 12px',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em',
                }}
              >
                <Pencil size={12} /> Брендинг
              </button>
            )}
          </div>
        </header>

        {/* Content — all 15 cards */}
        <main style={{ flex: 1, overflow: 'auto', padding: '14px 16px' }}>

          {/* Row 1: 3 large cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            {TOP_CARDS.map(card => (
              <div key={card.label} className="top-card card-glow" onClick={() => card.route.startsWith('http') ? window.open(card.route, '_blank') : navigate(card.route)} style={{
                minHeight: 120,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 12,
              }}>
                <div>{card.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center' }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          {/* Rows 2–3: 12 module cards (6 + 6) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
            {MODULE_CARDS.map(card => (
              <div key={card.label} className="module-card card-glow" style={{ minHeight: 130 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
                  {card.icon}
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 7, letterSpacing: '0.02em' }}>
                    {card.label}
                  </div>
                  <button className="open-btn" onClick={() => navigate(card.route)}>ОТКРЫТЬ →</button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Agency logo area ─────────────────────────────────────── */}
          {(hasLogo || hasName) && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              paddingTop: 32,
              paddingBottom: 16,
              minHeight: 140,
            }}>
              {hasLogo && (
                <img
                  src={branding.logoDataUrl!}
                  alt="agency logo"
                  style={{ maxHeight: 90, maxWidth: 320, objectFit: 'contain', opacity: 0.55 }}
                />
              )}
              {hasName && (
                <span style={{
                  fontSize: hasLogo ? 22 : 48,
                  fontWeight: 900,
                  color: 'rgba(201,168,76,0.35)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  {branding.name}
                </span>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── Branding modal ───────────────────────────────────────────── */}
      {showBrandingModal && (
        <AgencyBrandingModal
          current={branding}
          onClose={() => setShowBrandingModal(false)}
          onSave={setBranding}
        />
      )}

    </div>
  )
}

