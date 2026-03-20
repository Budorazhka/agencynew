import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'

export interface HubSection {
  icon: React.ReactNode
  title: string
  description: string
  route?: string          // внутренний роут
  externalUrl?: string    // внешняя ссылка
  badge?: string          // 'soon' | 'ready'
}

interface Props {
  moduleIcon: React.ReactNode
  moduleName: string
  moduleDescription: string
  sections: HubSection[]
  backRoute?: string
}

export default function ModuleHub({ moduleIcon, moduleName, moduleDescription, sections, backRoute = '/dashboard' }: Props) {
  const navigate = useNavigate()

  function handleSection(s: HubSection) {
    if (s.externalUrl) { window.open(s.externalUrl, '_blank'); return }
    if (s.route) navigate(s.route)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--green-bg)', padding: '28px 32px' }}>

      {/* Back */}
      <button
        onClick={() => navigate(backRoute)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(201,168,76,0.6)', fontSize: 13, marginBottom: 24,
          padding: 0,
        }}
      >
        <ArrowLeft size={15} /> На главную
      </button>

      {/* Module header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
        <div style={{
          width: 72, height: 72,
          background: 'var(--green-card)',
          border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {moduleIcon}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {moduleName}
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.45)', maxWidth: 560 }}>
            {moduleDescription}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(201,168,76,0.15)', marginBottom: 28 }} />

      {/* Sections grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 14,
      }}>
        {sections.map((s, i) => (
          <div
            key={i}
            onClick={() => handleSection(s)}
            className="card-glow"
            style={{
              background: 'var(--green-card)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 14,
              padding: '18px 20px',
              cursor: s.route || s.externalUrl ? 'pointer' : 'default',
              display: 'flex', gap: 14, alignItems: 'flex-start',
              position: 'relative',
            }}
          >
            {/* Icon */}
            <div style={{
              width: 42, height: 42, flexShrink: 0,
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {s.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>{s.title}</span>
                {s.externalUrl && <ExternalLink size={12} color="rgba(201,168,76,0.5)" />}
                {s.badge === 'soon' && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    background: 'rgba(201,168,76,0.12)', color: 'rgba(201,168,76,0.5)',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>скоро</span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
