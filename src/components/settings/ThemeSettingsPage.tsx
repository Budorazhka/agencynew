import { useState } from 'react'
import { Palette, Monitor, Check } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { getBranding, saveBranding } from '@/store/agencyStore'

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
}

const ACCENT_PRESETS = [
  { label: 'Золото (по умолчанию)', value: '#c9a84c' },
  { label: 'Синий',                 value: '#3b82f6' },
  { label: 'Изумруд',               value: '#10b981' },
  { label: 'Фиолетовый',            value: '#8b5cf6' },
  { label: 'Розовый',               value: '#ec4899' },
  { label: 'Оранжевый',             value: '#f97316' },
]

const FONT_OPTIONS = [
  { label: 'Inter (системный)', value: 'Inter, sans-serif' },
  { label: 'Montserrat',        value: 'Montserrat, sans-serif' },
  { label: 'Roboto',            value: 'Roboto, sans-serif' },
  { label: 'Nunito',            value: 'Nunito, sans-serif' },
]

type ThemeMode = 'dark' | 'light'

export function ThemeSettingsPage() {
  const branding = getBranding()
  const [companyName, setCompanyName] = useState(branding.name || 'Estate Portal')
  const [tagline, setTagline] = useState('PropTech Platform')
  const [accentColor, setAccentColor] = useState('#c9a84c')
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif')
  const [themeMode] = useState<ThemeMode>('dark')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    saveBranding({ ...branding, name: companyName })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <DashboardShell>
      <div style={{ padding: '24px 28px 48px', maxWidth: 680 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 4 }}>White-label и тема</div>
          <div style={{ fontSize: 12, color: C.whiteLow }}>Настройте внешний вид платформы под ваш бренд</div>
        </div>

        {/* Company identity */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 22px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, marginBottom: 16 }}>
            Идентификация компании
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: C.whiteLow, display: 'block', marginBottom: 6 }}>Название компании</label>
              <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, padding: '9px 14px', fontSize: 13, color: C.white,
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.whiteLow, display: 'block', marginBottom: 6 }}>Слоган (под логотипом)</label>
              <input
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, padding: '9px 14px', fontSize: 13, color: C.white,
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Accent color */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 22px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, marginBottom: 16 }}>
            Акцентный цвет
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {ACCENT_PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => setAccentColor(p.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                  background: accentColor === p.value ? `${p.value}18` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${accentColor === p.value ? `${p.value}66` : 'rgba(255,255,255,0.1)'}`,
                  color: accentColor === p.value ? p.value : C.whiteLow,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.value, flexShrink: 0 }} />
                {p.label}
                {accentColor === p.value && <Check size={11} />}
              </button>
            ))}
          </div>
          {/* Custom color */}
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 11, color: C.whiteLow }}>Произвольный:</label>
            <input
              type="color"
              value={accentColor}
              onChange={e => setAccentColor(e.target.value)}
              style={{ width: 36, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'none' }}
            />
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: C.whiteLow }}>{accentColor}</span>
          </div>
        </div>

        {/* Font */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 22px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, marginBottom: 16 }}>
            Шрифт интерфейса
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FONT_OPTIONS.map(f => (
              <button
                key={f.value}
                onClick={() => setFontFamily(f.value)}
                style={{
                  padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                  fontFamily: f.value,
                  background: fontFamily === f.value ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${fontFamily === f.value ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: fontFamily === f.value ? C.gold : C.whiteLow,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {fontFamily === f.value && <Check size={11} />}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme mode */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 22px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, marginBottom: 16 }}>
            Режим интерфейса
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['dark', 'light'] as ThemeMode[]).map(mode => (
              <button
                key={mode}
                style={{
                  padding: '10px 20px', borderRadius: 10, cursor: mode === 'light' ? 'not-allowed' : 'pointer',
                  fontSize: 12, fontWeight: 700,
                  background: themeMode === mode ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${themeMode === mode ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: themeMode === mode ? C.gold : C.whiteLow,
                  display: 'flex', alignItems: 'center', gap: 6, opacity: mode === 'light' ? 0.5 : 1,
                }}
              >
                <Monitor size={13} />
                {mode === 'dark' ? 'Тёмная' : 'Светлая'}
                {mode === 'light' && <span style={{ fontSize: 9, background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)', color: '#fb923c', padding: '1px 5px', borderRadius: 8 }}>soon</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.whiteLow, marginBottom: 10 }}>
            Предпросмотр
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${accentColor}22`, border: `2px solid ${accentColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Palette size={16} color={accentColor} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: accentColor, fontFamily }}>{companyName}</div>
              <div style={{ fontSize: 9, color: `${accentColor}88`, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily }}>{tagline}</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            padding: '10px 28px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: saved ? 'rgba(74,222,128,0.15)' : 'rgba(201,168,76,0.15)',
            border: `1px solid ${saved ? 'rgba(74,222,128,0.4)' : 'rgba(201,168,76,0.4)'}`,
            color: saved ? '#4ade80' : C.gold, cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          {saved ? '✓ Сохранено' : 'Применить тему'}
        </button>
      </div>
    </DashboardShell>
  )
}
