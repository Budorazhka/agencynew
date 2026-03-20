import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Settings,
  Users, Handshake, Building2, BookMarked,
  Briefcase, CheckSquare, CalendarDays, GraduationCap,
  Bell, UserCog, LayoutDashboard, Store,
  ChevronRight,
} from 'lucide-react'
import { getBranding, type AgencyBranding } from '../store/agencyStore'

const USER_NAME = 'Александр'

// ─── Sidebar nav items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Маркетплейс', icon: Store,         route: 'https://baza.sale',           external: true },
  { label: 'CRM',          icon: Users,          route: '/dashboard/crm' },
  { label: 'Дашборды',    icon: LayoutDashboard, route: '/dashboard/dashboards' },
  { label: 'Объекты',     icon: Building2,       route: '/dashboard/objects' },
  { label: 'Брони',       icon: BookMarked,      route: '/dashboard/bookings' },
  { label: 'Лиды',        icon: UserCog,         route: '/dashboard/leads-hub' },
  { label: 'Клиенты',     icon: Users,           route: '/dashboard/clients' },
  { label: 'Команда',     icon: Users,           route: '/dashboard/team' },
  { label: 'Обучение',    icon: GraduationCap,   route: '/dashboard/learning' },
  { label: 'Сделки',      icon: Briefcase,       route: '/dashboard/deals' },
  { label: 'Календарь',   icon: CalendarDays,    route: '/dashboard/calendar' },
  { label: 'Партнёры',    icon: Handshake,       route: '/dashboard/partners' },
  { label: 'Задачи',      icon: CheckSquare,     route: '/dashboard/tasks' },
  { label: 'Инфо',        icon: Bell,            route: '/dashboard/info' },
  { label: 'Настройки',   icon: Settings,        route: '/dashboard/settings-hub' },
]

// ─── Module cards ──────────────────────────────────────────────────────────────
const MODULE_CARDS = [
  { label: 'Объекты',   icon: Building2,   route: '/dashboard/objects' },
  { label: 'Брони',     icon: BookMarked,  route: '/dashboard/bookings' },
  { label: 'Лиды',      icon: UserCog,     route: '/dashboard/leads-hub' },
  { label: 'Клиенты',   icon: Users,       route: '/dashboard/clients' },
  { label: 'Команда',   icon: Users,       route: '/dashboard/team' },
  { label: 'Обучение',  icon: GraduationCap, route: '/dashboard/learning' },
  { label: 'Сделки',    icon: Briefcase,   route: '/dashboard/deals' },
  { label: 'Календарь', icon: CalendarDays, route: '/dashboard/calendar' },
  { label: 'Партнёры',  icon: Handshake,   route: '/dashboard/partners' },
  { label: 'Задачи',    icon: CheckSquare, route: '/dashboard/tasks' },
  { label: 'Информация',icon: Bell,        route: '/dashboard/info' },
  { label: 'Настройки', icon: Settings,    route: '/dashboard/settings-hub' },
]

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = {
  root: {
    display: 'flex',
    height: '100vh',
    background: 'var(--green-bg)',
    overflow: 'hidden',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,

  // Sidebar
  sidebar: {
    width: 220,
    flexShrink: 0,
    background: 'var(--green-deep)',
    borderRight: '1px solid var(--green-border)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  sidebarLogo: {
    padding: '20px 20px 16px',
    borderBottom: '1px solid var(--green-border)',
  },
  sidebarLogoTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--gold)',
    letterSpacing: '0.04em',
    marginBottom: 2,
  },
  sidebarLogoSub: {
    fontSize: 9,
    fontWeight: 600,
    color: 'rgba(201,168,76,0.4)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
  },
  navScroll: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '8px 0',
  },
  navItem: (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 20px',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: active ? 700 : 500,
    letterSpacing: '0.08em',
    color: active ? 'var(--gold)' : 'rgba(255,255,255,0.55)',
    background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
    borderLeft: active ? '3px solid var(--gold)' : '3px solid transparent',
    transition: 'all 0.15s',
    textTransform: 'uppercase' as const,
  }),

  // Right side
  right: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },

  // Main content
  content: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '28px 28px 40px',
  },

  // Greeting
  greeting: {
    marginBottom: 24,
  },
  greetingTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '-0.01em',
    marginBottom: 6,
  },
  greetingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    fontStyle: 'italic' as const,
  },
  greetingTime: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.12em',
    color: 'rgba(201,168,76,0.55)',
    textTransform: 'uppercase' as const,
  },

  // Feature cards row
  featureRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
    marginBottom: 28,
  },

  // Card base
  card: (variant: 'light' | 'dark' | 'mid'): React.CSSProperties => ({
    borderRadius: 12,
    padding: '22px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    cursor: 'pointer',
    border: '1px solid',
    background:
      variant === 'light' ? 'rgba(255,255,255,0.06)' :
      variant === 'dark'  ? '#0a1f12' :
      'var(--green-card)',
    borderColor:
      variant === 'light' ? 'rgba(255,255,255,0.1)' :
      variant === 'dark'  ? 'var(--green-border)' :
      'var(--green-border)',
    transition: 'all 0.2s',
    minHeight: 200,
  }),
  cardLabel: (gold: boolean): React.CSSProperties => ({
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: gold ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
    marginBottom: 2,
  }),
  cardTitle: (light: boolean): React.CSSProperties => ({
    fontSize: 24,
    fontWeight: 700,
    color: light ? '#ffffff' : '#ffffff',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
  }),
  cardDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.5,
    flex: 1,
  },
  cardStat: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    padding: '6px 0',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  cardLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--gold)',
    marginTop: 4,
  },
  actionBtn: {
    background: 'var(--gold-dark)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    width: '100%',
    marginTop: 8,
  },

  // Chart placeholder
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 4,
    height: 50,
    padding: '4px 0',
  },

  // Section label
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: 'rgba(201,168,76,0.5)',
    marginBottom: 12,
  },

  // Module grid
  moduleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 10,
  },
  moduleTile: {
    background: 'var(--green-card)',
    border: '1px solid var(--green-border)',
    borderRadius: 10,
    padding: '16px 12px 12px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    transition: 'all 0.18s',
    minHeight: 90,
    justifyContent: 'center',
  },
  moduleTileLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: '0.05em',
    textAlign: 'center' as const,
  },
}

// ─── Mini bar chart ────────────────────────────────────────────────────────────
const BARS = [55, 70, 45, 80, 65, 90, 75]

function MiniChart() {
  return (
    <div style={S.chartBars}>
      {BARS.map((h, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${h}%`,
          borderRadius: 3,
          background: i === BARS.length - 1
            ? 'var(--gold)'
            : 'rgba(201,168,76,0.3)',
        }} />
      ))}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [branding, setBranding] = useState<AgencyBranding>(() => getBranding())

  useEffect(() => { setBranding(getBranding()) }, [])

  const now = new Date()
  const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  function go(route: string, external = false) {
    if (external) { window.open(route, '_blank'); return }
    navigate(route)
  }

  return (
    <div style={S.root}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={S.sidebar}>
        <div style={S.sidebarLogo}>
          {branding.logoDataUrl && (
            <img src={branding.logoDataUrl} alt="logo" style={{ height: 28, marginBottom: 6, objectFit: 'contain' }} />
          )}
          <div style={S.sidebarLogoTitle}>
            {branding.name || 'Estate Portal'}
          </div>
        </div>

        <nav style={S.navScroll}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = item.route === '/dashboard/dashboards'
              ? location.pathname === '/dashboard' || location.pathname === '/dashboard/'
              : location.pathname.startsWith(item.route)
            return (
              <div
                key={item.label}
                style={S.navItem(active)}
                onClick={() => go(item.route, item.external)}
              >
                <Icon size={14} />
                {item.label}
              </div>
            )
          })}
        </nav>

      </aside>

      {/* ── Right area ──────────────────────────────────────────────────── */}
      <div style={S.right}>

        {/* Main content */}
        <main style={S.content}>

          {/* Greeting */}
          <div style={S.greeting}>
            <div style={S.greetingTitle}>Добро пожаловать, {USER_NAME}</div>
            <div style={S.greetingRow}>
              <div style={S.greetingSub}>
                На рынке сегодня 14 новых запросов и 3 премиальных объекта на выброс
              </div>
              <div style={S.greetingTime}>Обновлено: сегодня, {timeStr}</div>
            </div>
          </div>

          {/* 3 Feature cards */}
          <div style={S.featureRow}>

            {/* Маркетплейс */}
            <div style={S.card('light')} onClick={() => window.open('https://baza.sale', '_blank')}>
              <div style={S.cardLabel(false)}>Глобальная сеть</div>
              <div style={S.cardTitle(true)}>Маркетплейс</div>
              <div style={S.cardDesc}>
                Доступ к эксклюзивным объектам по всему миру и внешним листингам.
              </div>
              <div style={{ flex: 1 }} />
              <div style={S.cardLink}>
                Перейти <ChevronRight size={13} />
              </div>
            </div>

            {/* CRM */}
            <div style={S.card('dark')} onClick={() => navigate('/dashboard/crm')}>
              <div style={S.cardLabel(true)}>Взаимоотношения</div>
              <div style={S.cardTitle(true)}>CRM Система</div>
              <div style={{ flex: 1 }} />
              <div style={S.cardStat}>
                <Users size={14} color="var(--gold)" />
                42 активных клиента в воронке
              </div>
              <div style={{ ...S.cardStat, borderBottom: 'none' }}>
                <CalendarDays size={14} color="var(--gold)" />
                3 запланированных показа сегодня
              </div>
              <button style={S.actionBtn} onClick={e => { e.stopPropagation(); navigate('/dashboard/crm') }}>
                Управление клиентами
              </button>
            </div>

            {/* Статистика */}
            <div style={S.card('mid')} onClick={() => navigate('/dashboard/dashboards')}>
              <div style={S.cardLabel(false)}>Аналитика</div>
              <div style={S.cardTitle(true)}>Статистика</div>
              <MiniChart />
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>
                Эффективность отдела выросла на{' '}
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>12.4%</span>{' '}
                за последний месяц
              </div>
            </div>

          </div>

          {/* Module tiles */}
          <div style={S.sectionLabel}>Вспомогательные инструменты</div>
          <div style={S.moduleGrid}>
            {MODULE_CARDS.map(card => {
              const Icon = card.icon
              return (
                <div
                  key={card.label}
                  style={S.moduleTile}
                  onClick={() => navigate(card.route)}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLDivElement).style.background = 'var(--green-card-hover)'
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.3)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLDivElement).style.background = 'var(--green-card)'
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--green-border)'
                  }}
                >
                  <Icon size={24} color="var(--gold)" />
                  <div style={S.moduleTileLabel}>{card.label}</div>
                </div>
              )
            })}
          </div>

        </main>
      </div>

    </div>
  )
}
