import { useState } from 'react'
import { Eye, Monitor, Moon, Sparkles, Sun } from 'lucide-react'
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
type Density = 'comfort' | 'compact'

export function ThemeSettingsPage() {
  const { preference, setPreference } = useTheme()
  const themeMode: ThemeMode = preference === 'light' ? 'light' : 'standard'
  const [density, setDensity] = useState<Density>('comfort')
  const [reduceMotion, setReduceMotion] = useState(false)
  const [fontScale, setFontScale] = useState<'100' | '110' | '125'>('100')

  return (
    <DashboardShell>
      <div style={{ padding: '24px 28px 48px', maxWidth: 960 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>Внешний вид</div>
          <div style={{ fontSize: 12, color: C.textLow }}>Тема, плотность интерфейса и параметры читаемости (локальный UI-предпросмотр).</div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Тема</p>
            <p className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">{themeMode === 'light' ? 'Светлая' : 'Тёмная'}</p>
          </div>
          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Плотность</p>
            <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{density === 'comfort' ? 'Комфорт' : 'Компакт'}</p>
          </div>
          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Масштаб текста</p>
            <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{fontScale}%</p>
          </div>
          <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Анимации</p>
            <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{reduceMotion ? 'Снижены' : 'Обычные'}</p>
          </div>
        </div>

        {/* Theme mode */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 22px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, marginBottom: 16 }}>
            Режим интерфейса
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(['standard', 'light'] as ThemeMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreference(mode === 'light' ? 'light' : 'standard')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  background: themeMode === mode ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${themeMode === mode ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: themeMode === mode ? C.gold : C.textLow,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {mode === 'standard' ? <Moon size={13} /> : <Sun size={13} />}
                {mode === 'standard' ? 'Тёмная' : 'Светлая'}
              </button>
            ))}
          </div>
        </div>

        <section className="mb-5 rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-[color:var(--gold)]" />
            <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Плотность и читаемость</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <p className="mb-1 text-[11px] uppercase text-[color:var(--app-text-subtle)]">Сетка и отступы</p>
              <div className="flex flex-wrap gap-2">
                {(['comfort', 'compact'] as Density[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDensity(d)}
                    className={
                      density === d
                        ? 'rounded-md border border-[color:var(--gold)]/50 bg-[color:var(--gold)]/10 px-3 py-2 text-xs font-semibold text-[color:var(--gold)]'
                        : 'rounded-md border border-[var(--hub-card-border)] bg-[var(--workspace-row-bg)] px-3 py-2 text-xs text-[color:var(--workspace-text-muted)]'
                    }
                  >
                    {d === 'comfort' ? 'Комфорт' : 'Компакт'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-[11px] uppercase text-[color:var(--app-text-subtle)]">Базовый кегль</p>
              <select
                value={fontScale}
                onChange={(e) => setFontScale(e.target.value as typeof fontScale)}
                className="w-full rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"
              >
                <option value="100">100%</option>
                <option value="110">110%</option>
                <option value="125">125%</option>
              </select>
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-3 text-sm text-[color:var(--workspace-text)]">
              <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
              Снижение анимаций (prefers-reduced-motion)
            </label>
          </div>
          <p className="mt-2 text-xs text-[color:var(--app-text-muted)]">
            Плотность и масштаб здесь только фиксируются в состоянии страницы; глобальное применение — на этапе подключения к настройкам профиля.
          </p>
        </section>

        <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
          <div className="mb-3 flex items-center gap-2">
            <Eye className="size-4 text-[color:var(--gold)]" />
            <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Предпросмотр карточки</h2>
          </div>
          <div
            className="rounded-lg border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-3"
            style={{
              padding: density === 'compact' ? '10px 12px' : '16px 18px',
              fontSize: fontScale === '100' ? 13 : fontScale === '110' ? 14 : 15,
              transition: reduceMotion ? 'none' : 'padding 0.2s, font-size 0.2s',
            }}
          >
            <p className="font-semibold text-[color:var(--workspace-text)]">Заголовок виджета</p>
            <p className="mt-1 text-[color:var(--workspace-text-muted)]">Так могут выглядеть карточки рабочего стола при выбранных параметрах.</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-[color:var(--app-text-subtle)]">
              <Monitor className="size-3.5" />
              {themeMode === 'light' ? 'Светлая тема' : 'Тёмная тема'}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}
