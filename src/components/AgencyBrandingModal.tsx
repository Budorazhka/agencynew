import { useRef, useState } from 'react'
import { X, Upload } from 'lucide-react'
import { saveBranding, type AgencyBranding } from '../store/agencyStore'

interface Props {
  current: AgencyBranding
  onClose: () => void
  onSave: (b: AgencyBranding) => void
}

export default function AgencyBrandingModal({ current, onClose, onSave }: Props) {
  const [name, setName] = useState(current.name)
  const [logo, setLogo] = useState<string | null>(current.logoDataUrl)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setLogo(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleSave() {
    const data: AgencyBranding = { name: name.trim(), logoDataUrl: logo }
    saveBranding(data)
    onSave(data)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--green-card)',
        border: '1px solid rgba(201,168,76,0.4)',
        borderRadius: 16,
        padding: 32,
        width: 420,
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>Брендинг агентства</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#888" />
          </button>
        </div>

        {/* Name */}
        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: 'rgba(201,168,76,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Название агентства
          </span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Введите название..."
            style={{
              display: 'block', width: '100%', marginTop: 6,
              background: 'var(--green-bg)', border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 8, padding: '10px 14px', color: '#fff',
              fontSize: 14, fontFamily: 'Montserrat, sans-serif', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </label>

        {/* Logo upload */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 11, color: 'rgba(201,168,76,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Логотип (PNG с прозрачным фоном)
          </span>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Preview */}
            <div style={{
              width: 80, height: 80, borderRadius: 10,
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(201,168,76,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {logo
                ? <img src={logo} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                : <span style={{ fontSize: 10, color: '#666' }}>нет</span>
              }
            </div>
            <div style={{ flex: 1 }}>
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'transparent', border: '1px solid var(--gold)',
                  color: 'var(--gold)', borderRadius: 8, padding: '8px 16px',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Upload size={14} /> Загрузить PNG
              </button>
              {logo && (
                <button
                  onClick={() => setLogo(null)}
                  style={{
                    display: 'block', marginTop: 6, background: 'none', border: 'none',
                    color: '#888', fontSize: 11, cursor: 'pointer', textDecoration: 'underline',
                  }}
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/svg+xml,image/*" onChange={handleFile} style={{ display: 'none' }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
            color: '#aaa', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer',
          }}>
            Отмена
          </button>
          <button onClick={handleSave} style={{
            background: 'var(--gold)', border: 'none', color: '#0d2818',
            borderRadius: 8, padding: '9px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}
