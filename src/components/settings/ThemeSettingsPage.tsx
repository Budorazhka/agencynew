import { Monitor } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { useTheme } from '@/hooks/useTheme'

const C = {
  gold: 'var(--gold)',
  text: 'var(--app-text)',
  textLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
}

type ThemeMode = 'standard' | 'light'

export function ThemeSettingsPage() {
  const { preference, setPreference } = useTheme()

  const themeMode: ThemeMode = preference === 'light' ? 'light' : 'standard'

  return (
    <DashboardShell>
      <div style={{ padding: '24px 28px 48px', maxWidth: 680 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>Внешний вид</div>
          <div style={{ fontSize: 12, color: C.textLow }}>Настройте тему интерфейса</div>
        </div>

        {/* Theme mode */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 22px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, marginBottom: 16 }}>
            Режим интерфейса
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['standard', 'light'] as ThemeMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setPreference(mode === 'light' ? 'light' : 'standard')}
                style={{
                  padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                  background: themeMode === mode ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${themeMode === mode ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: themeMode === mode ? C.gold : C.textLow,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Monitor size={13} />
                {mode === 'standard' ? 'Тёмная' : 'Светлая'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
