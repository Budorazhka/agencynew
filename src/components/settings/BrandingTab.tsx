import { useRef, useState } from 'react'
import { Check, Upload } from 'lucide-react'
import { getBranding, saveBranding, type AgencyBranding } from '@/store/agencyStore'

export function BrandingTab() {
  const initial = getBranding()
  const [name, setName] = useState(initial.name)
  const [logo, setLogo] = useState<string | null>(initial.logoDataUrl)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setLogo(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleSave() {
    const data: AgencyBranding = { name: name.trim(), logoDataUrl: logo }
    saveBranding(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <p className="mb-1 text-xs uppercase tracking-widest text-[color:var(--hub-stat-label)]">Оформление</p>
        <h2 className="mb-2 text-xl font-bold text-[color:var(--app-text)]">Брендинг агентства</h2>
        <p className="text-sm text-[color:var(--hub-stat-label)]">
          Название и логотип подставляются в боковую панель CRM, на главный экран и в модули вроде подборок для клиентов.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium uppercase tracking-wide text-[color:var(--hub-stat-label)]">
          Название компании (как в интерфейсе)
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Например, Премьер Недвижимость"
          className="w-full rounded-xl border border-[color:var(--hub-card-border)] bg-[rgba(0,0,0,0.25)] px-4 py-2.5 text-sm text-[color:var(--app-text)] placeholder:text-[color:var(--theme-accent-icon-dim)] outline-none transition-all focus:border-[color:var(--hub-card-border-hover)] focus:ring-1 focus:ring-[color:var(--hub-card-border)]"
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--hub-stat-label)]">Логотип</p>
        <div className="flex flex-wrap items-start gap-4">
          <div
            className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[color:var(--hub-tile-icon-border)]"
            style={{
              background: 'repeating-conic-gradient(#e2e8f0 0% 25%, #f8fafc 0% 50%) 50% / 12px 12px',
            }}
          >
            {logo ? (
              <img src={logo} alt="Логотип" className="max-h-full max-w-full object-contain p-1" />
            ) : (
              <span className="px-2 text-center text-[10px] text-slate-500">превью</span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-[color:var(--hub-card-border)] px-4 py-2 text-sm font-medium text-[color:var(--theme-accent-link-dim)] transition-colors hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--app-text)]"
            >
              <Upload className="size-4" />
              Загрузить изображение
            </button>
            {logo && (
              <button
                type="button"
                onClick={() => setLogo(null)}
                className="block text-xs text-[color:var(--hub-stat-label)] underline-offset-2 hover:text-[color:var(--app-text-muted)] hover:underline"
              >
                Удалить логотип
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/svg+xml,image/webp,image/jpeg"
              className="hidden"
              onChange={handleFile}
            />
            <p className="text-xs leading-relaxed text-[color:var(--workspace-text-muted)]">
              Загрузите файл на{' '}
              <span className="text-[color:var(--hub-badge-soon-fg)]">прозрачном фоне</span>
              {' '}(удобный формат — PNG). Если логотип с белым или цветным фоном, фон лучше убрать в онлайн-сервисе, например{' '}
              <a
                href="https://www.remove.bg"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[rgba(201,168,76,0.85)] underline-offset-2 hover:underline"
              >
                remove.bg
              </a>
              — так знак нормально смотрится и в тёмной, и в светлой теме.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        {saved ? (
          <>
            <Check className="size-4" /> Сохранено
          </>
        ) : (
          'Сохранить'
        )}
      </button>
    </div>
  )
}
