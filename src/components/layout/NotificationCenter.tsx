import { useState, useRef, useEffect } from 'react'
import { Bell, X, AlertTriangle, CheckCircle, Info, Zap, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Notification {
  id: string
  type: 'alert' | 'success' | 'info' | 'auto'
  title: string
  body: string
  time: string
  read: boolean
  link?: string
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'alert',
    title: 'Просрочен SLA — лид без контакта',
    body: 'Иванов А.В. ждёт ответа уже 48 часов',
    time: '18 мин назад',
    read: false,
    link: '/dashboard/leads',
  },
  {
    id: 'n2',
    type: 'auto',
    title: 'Автозадача создана',
    body: 'Юрист: "Подготовить договор задатка" — Фролов Д.А.',
    time: '1 час назад',
    read: false,
    link: '/dashboard/tasks/my',
  },
  {
    id: 'n3',
    type: 'alert',
    title: 'Бронь истекает через 12 часов',
    body: 'Фролов Д.А. — пр. Мира, 88. Успейте продвинуть сделку.',
    time: '2 часа назад',
    read: false,
    link: '/dashboard/bookings',
  },
  {
    id: 'n4',
    type: 'info',
    title: 'Клиент открыл подборку',
    body: 'Петров И.С. просматривал подборку 5 минут назад',
    time: '5 мин назад',
    read: true,
  },
  {
    id: 'n5',
    type: 'success',
    title: 'Сделка переведена на новый этап',
    body: 'Смирнова О.П. — ЖК Олимп: перешла в "Регистрация"',
    time: '3 часа назад',
    read: true,
    link: '/dashboard/deals/deal-4',
  },
  {
    id: 'n6',
    type: 'info',
    title: 'Новый лид с Авито',
    body: '3к, Москва, до 12M — назначьте ответственного',
    time: '4 часа назад',
    read: true,
    link: '/dashboard/leads',
  },
]

const NOTIF_ICONS: Record<Notification['type'], React.ReactNode> = {
  alert:   <AlertTriangle size={14} color="#f87171" />,
  success: <CheckCircle size={14} color="#4ade80" />,
  info:    <Info size={14} color="#60a5fa" />,
  auto:    <Zap size={14} color="#fb923c" />,
}

const NOTIF_BORDER: Record<Notification['type'], string> = {
  alert:   'rgba(248,113,113,0.3)',
  success: 'rgba(74,222,128,0.3)',
  info:    'rgba(96,165,250,0.3)',
  auto:    'rgba(251,146,60,0.3)',
}

export function NotificationCenter() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  function dismiss(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  function handleNotifClick(notif: Notification) {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
    if (notif.link) {
      navigate(notif.link)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' as const }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative' as const,
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: open ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.1)'}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: open ? 'var(--gold)' : 'rgba(255,255,255,0.55)',
          transition: 'all 0.15s',
        }}
      >
        <Bell size={15} />
        {unread > 0 && (
          <div style={{
            position: 'absolute' as const,
            top: -3,
            right: -3,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#f87171',
            border: '2px solid var(--green-deep)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 700,
            color: '#fff',
          }}>
            {unread > 9 ? '9+' : unread}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute' as const,
          top: '100%',
          right: 0,
          marginTop: 8,
          width: 360,
          background: 'var(--green-deep)',
          border: '1px solid var(--green-border)',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          zIndex: 1000,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--green-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
              Уведомления
              {unread > 0 && (
                <span style={{
                  marginLeft: 8,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 10,
                  background: 'rgba(248,113,113,0.2)',
                  color: '#f87171',
                }}>
                  {unread} новых
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: 11,
                  color: 'var(--gold)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Прочитать все
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div style={{ maxHeight: 380, overflowY: 'auto' as const }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center' as const, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                Нет уведомлений
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    borderLeft: `3px solid ${notif.read ? 'transparent' : NOTIF_BORDER[notif.type]}`,
                    background: notif.read ? 'transparent' : 'rgba(255,255,255,0.02)',
                    cursor: notif.link ? 'pointer' : 'default',
                    transition: 'background 0.12s',
                    position: 'relative' as const,
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                  onMouseEnter={e => { if (notif.link) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = notif.read ? 'transparent' : 'rgba(255,255,255,0.02)'}
                >
                  <div style={{ marginTop: 1, flexShrink: 0 }}>{NOTIF_ICONS[notif.type]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: notif.read ? 400 : 600, color: notif.read ? 'rgba(255,255,255,0.6)' : '#ffffff', marginBottom: 2 }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{notif.body}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{notif.time}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); dismiss(notif.id) }}
                    style={{
                      flexShrink: 0,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.25)',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--green-border)' }}>
            <button
              onClick={() => { navigate('/dashboard/info'); setOpen(false) }}
              style={{
                width: '100%',
                padding: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--gold)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              Все уведомления <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
