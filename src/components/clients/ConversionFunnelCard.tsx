import { useState, useMemo, useEffect, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { BarChart3, ChevronDown } from 'lucide-react'
import { LEAD_STAGES, LEAD_STAGE_COLUMN } from '@/data/leads-mock'
import type { LeadStage } from '@/types/leads'

const PRIMARY = '#e6c364'

/** Этапы рабочей воронки (как в покерном столе / канбане), плюс успех — как конечные точки конверсии */
const FUNNEL_STAGES = LEAD_STAGES.filter(
  s => LEAD_STAGE_COLUMN[s.id] === 'in_progress' || LEAD_STAGE_COLUMN[s.id] === 'success',
)

function stageById(id: string): LeadStage | undefined {
  return LEAD_STAGES.find(s => s.id === id)
}

function labelPair(fromId: string, toId: string): string {
  const a = stageById(fromId)?.name ?? fromId
  const b = stageById(toId)?.name ?? toId
  return `${a} → ${b}`
}

type Preset = { id: string; from: string; to: string; value: string; delta: string }

const PRESETS: Preset[] = [
  { id: 'new_kp', from: 'new', to: 'kp_sent', value: '38.2', delta: '+1.8' },
  { id: 'new_deal', from: 'new', to: 'deal', value: '42.8', delta: '+2.4' },
  { id: 'new_showing', from: 'new', to: 'showing', value: '51.0', delta: '+0.5' },
  { id: 'new_deposit', from: 'new', to: 'deposit', value: '28.4', delta: '\u22120.3' },
  { id: 'presented_deal', from: 'presented', to: 'deal', value: '33.1', delta: '+1.2' },
  { id: 'kp_deal', from: 'kp_sent', to: 'deal', value: '56.3', delta: '+2.1' },
]

const EXTRA_RATES: Record<string, { value: string; delta: string }> = {
  new_need_identified: { value: '44.5', delta: '+0.9' },
  new_objections: { value: '35.7', delta: '\u22120.4' },
  new_golden: { value: '18.2', delta: '+0.6' },
}

function rateKey(from: string, to: string): string {
  return `${from}_${to}`
}

function metricsFor(from: string, to: string): { value: string; delta: string } {
  const preset = PRESETS.find(p => p.from === from && p.to === to)
  if (preset) return { value: preset.value, delta: preset.delta }
  const extra = EXTRA_RATES[rateKey(from, to)]
  if (extra) return extra
  return { value: '—', delta: '' }
}

function monthLabelRu(): string {
  return new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(new Date())
}

type ConversionFunnelCardProps = {
  /** Выровнять высоту с соседними bento-плитками */
  tileMinHeight?: number
}

export function ConversionFunnelCard({ tileMinHeight }: ConversionFunnelCardProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [fromId, setFromId] = useState('new')
  const [toId, setToId] = useState('deal')
  const rootRef = useRef<HTMLDivElement>(null)

  const fromStage = stageById(fromId)
  const fromOrder = fromStage?.order ?? 0

  const toOptions = useMemo(
    () => FUNNEL_STAGES.filter(s => s.order > fromOrder),
    [fromOrder],
  )

  useEffect(() => {
    if (!toOptions.some(s => s.id === toId)) {
      const next = toOptions[0]?.id
      if (next) setToId(next)
    }
  }, [fromId, toOptions, toId])

  useEffect(() => {
    if (!panelOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [panelOpen])

  const { value, delta } = metricsFor(fromId, toId)
  const pairLabel = labelPair(fromId, toId)
  const deltaColor = /^[\u2212-]/.test(delta.trim()) ? '#fb923c' : '#4ade80'

  const selectStyle: CSSProperties = {
    width: '100%',
    height: 48,
    padding: '0 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.12)',
    background: '#0a1f12',
    color: '#e8f2ec',
    fontSize: 15,
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  const presetBtn = (active: boolean): CSSProperties => ({
    width: '100%',
    textAlign: 'left' as const,
    padding: '14px 16px',
    borderRadius: 10,
    border: active ? `2px solid ${PRIMARY}` : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(230,195,100,0.12)' : 'rgba(0,0,0,0.25)',
    color: '#fff',
    fontSize: 15,
    fontWeight: active ? 700 : 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    lineHeight: 1.35,
    transition: 'border-color 0.15s, background 0.15s',
  })

  const modal =
    panelOpen && typeof document !== 'undefined'
      ? createPortal(
          <>
            <div
              role="presentation"
              aria-hidden
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                background: 'rgba(0,0,0,0.55)',
              }}
              onClick={() => setPanelOpen(false)}
            />
            <div
              role="dialog"
              aria-modal
              aria-label="Настройка конверсии по воронке"
              style={{
                position: 'fixed',
                zIndex: 10001,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(440px, calc(100vw - 28px))',
                maxHeight: 'min(85vh, 560px)',
                overflowY: 'auto',
                padding: 22,
                background: '#040d0a',
                border: `2px solid ${PRIMARY}`,
                borderRadius: 14,
                boxShadow: '0 24px 64px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)',
                boxSizing: 'border-box',
              }}
              onClick={e => e.stopPropagation()}
            >
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: '#fff' }}>
              Конверсия по этапам воронки
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: 'rgba(220, 230, 224, 0.88)', lineHeight: 1.55 }}>
              Считаем долю лидов, которые дошли до выбранного <strong style={{ color: '#fff' }}>конечного</strong> этапа,
              среди тех, кто в отчётном периоде был на <strong style={{ color: '#fff' }}>стартовом</strong> этапе или прошёл его
              (этапы как в канбане лидов: «Новый лид» → … → «Заключен договор», далее золотой фонд и сопутствующие статусы).
              Период: <strong style={{ color: '#fff' }}>{monthLabelRu()}</strong>.
            </p>

            <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              Быстрые пресеты
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
              {PRESETS.map(p => {
                const active = fromId === p.from && toId === p.to
                return (
                  <button
                    key={p.id}
                    type="button"
                    style={presetBtn(active)}
                    onClick={() => {
                      setFromId(p.from)
                      setToId(p.to)
                    }}
                  >
                    {labelPair(p.from, p.to)}
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(220,230,224,0.65)', marginTop: 4 }}>
                      {p.value}% · {p.delta} к прошлому месяцу
                    </span>
                  </button>
                )
              })}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Своя связка
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(220,230,224,0.9)' }}>С этапа</span>
                <select
                  value={fromId}
                  style={selectStyle}
                  onChange={e => setFromId(e.target.value)}
                >
                  {FUNNEL_STAGES.filter(s => LEAD_STAGE_COLUMN[s.id] === 'in_progress').map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(220,230,224,0.9)' }}>До этапа</span>
                <select
                  value={toOptions.some(s => s.id === toId) ? toId : (toOptions[0]?.id ?? '')}
                  style={selectStyle}
                  onChange={e => setToId(e.target.value)}
                >
                  {toOptions.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <p style={{ margin: '18px 0 0', fontSize: 14, color: 'rgba(220, 230, 224, 0.82)', lineHeight: 1.55 }}>
              <strong style={{ color: '#fff' }}>Как читать:</strong> из лидов, прошедших «{fromStage?.name ?? '—'}», {value === '—' ? 'метрика для этой пары пока не заведена в моке' : `${value}% дошли до «${stageById(toId)?.name ?? '—'}»`} за выбранный месяц (мок для демо).
            </p>

            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              style={{
                marginTop: 18,
                width: '100%',
                height: 48,
                borderRadius: 10,
                border: 'none',
                background: 'rgba(230,195,100,0.2)',
                color: PRIMARY,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Готово
            </button>
            </div>
          </>,
          document.body,
        )
      : null

  const stretch = tileMinHeight != null

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        width: '100%',
        ...(stretch ? { flex: 1, minHeight: tileMinHeight, display: 'flex', flexDirection: 'column' } : {}),
      }}
    >
      {modal}

      <button
        type="button"
        onClick={() => setPanelOpen(o => !o)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left' as const,
          fontFamily: 'inherit',
          ...(stretch ? { flex: 1, minHeight: tileMinHeight, alignItems: 'stretch' } : {}),
        }}
      >
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 12,
            border: panelOpen ? `1px solid rgba(230,195,100,0.45)` : '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(15, 35, 30, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: 'inset 0 1px 0 rgba(201,168,76,0.18)',
            ...(stretch
              ? { flex: 1, minHeight: tileMinHeight, display: 'flex', flexDirection: 'column' }
              : {}),
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              ...(stretch
                ? { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }
                : {}),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: PRIMARY, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Конверсия базы
              </span>
              <BarChart3 size={18} color={PRIMARY} />
            </div>
            <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              {value === '—' ? '—' : `${value}%`}
            </h4>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(220,230,224,0.85)', lineHeight: 1.35 }}>
                  {pairLabel}
                </div>
                {delta ? (
                  <div style={{ marginTop: 2, fontSize: 11, fontWeight: 600, color: deltaColor }}>
                    {delta} к прошлому месяцу
                  </div>
                ) : null}
                <div style={{ marginTop: 6, fontSize: 10, color: 'rgba(194,200,196,0.5)', lineHeight: 1.3 }}>
                  Нажмите, чтобы сменить этапы
                </div>
              </div>
              <ChevronDown
                size={20}
                color={PRIMARY}
                style={{
                  flexShrink: 0,
                  marginTop: 2,
                  transform: panelOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                  opacity: 0.85,
                }}
              />
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
