import { useEffect, useState } from 'react'
import {
  X, Plus, Trash2, BookOpen, MessageSquare,
  Presentation, Video, FileText, Check, ArrowUp, ArrowDown,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { LMSItem, ContentType, TargetRole } from '@/data/lms-mock'

// ─── Props ────────────────────────────────────────────────────────────────────

interface LMSAdminDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  item?: LMSItem | null
  onClose: () => void
  onSave: (item: LMSItem) => void
}

// ─── Form state ───────────────────────────────────────────────────────────────

type AdminContentType = Exclude<ContentType, 'quiz'>

interface FormState {
  type: AdminContentType
  title: string
  description: string
  targetRole: TargetRole
  tags: string
  readTime: string
  coverUrl: string
  // article
  articleBody: string
  // video
  videoUrl: string
  videoDescription: string
  // script
  scriptLines: Array<{ speaker: 'manager' | 'client'; text: string }>
  // presentation
  slides: Array<{ title: string; body: string }>
  // pdf
  pdfUrl: string
  pdfDescription: string
}

function emptyForm(): FormState {
  return {
    type: 'article',
    title: '',
    description: '',
    targetRole: 'all',
    tags: '',
    readTime: '',
    coverUrl: '',
    articleBody: '',
    videoUrl: '',
    videoDescription: '',
    scriptLines: [{ speaker: 'manager', text: '' }],
    slides: [{ title: '', body: '' }],
    pdfUrl: '',
    pdfDescription: '',
  }
}

function itemToForm(item: LMSItem): FormState {
  const base: FormState = {
    ...emptyForm(),
    type: item.type === 'quiz' ? 'article' : item.type,
    title: item.title,
    description: item.description,
    targetRole: item.targetRole,
    tags: item.tags?.join(', ') ?? '',
    readTime: item.readTime ?? '',
    coverUrl: '',
  }
  if (item.content.type === 'article') base.articleBody = item.content.body
  if (item.content.type === 'video') {
    base.videoUrl = item.content.url
    base.videoDescription = item.content.description ?? ''
  }
  if (item.content.type === 'script') base.scriptLines = item.content.lines.map(l => ({ ...l }))
  if (item.content.type === 'presentation') base.slides = item.content.slides.map(s => ({ ...s }))
  if (item.content.type === 'pdf') {
    base.pdfUrl = item.content.url
    base.pdfDescription = item.content.description ?? ''
  }
  return base
}

function formToItem(form: FormState, existingId?: string): LMSItem {
  const id = existingId ?? `lms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)

  let content: LMSItem['content']
  switch (form.type) {
    case 'article':
      content = { type: 'article', body: form.articleBody }
      break
    case 'video':
      content = { type: 'video', url: form.videoUrl, description: form.videoDescription || undefined }
      break
    case 'script':
      content = { type: 'script', lines: form.scriptLines.filter(l => l.text.trim()) }
      break
    case 'presentation':
      content = { type: 'presentation', slides: form.slides.filter(s => s.title.trim()) }
      break
    case 'pdf':
      content = { type: 'pdf', url: form.pdfUrl, description: form.pdfDescription || undefined }
      break
    default:
      content = { type: 'article', body: '' }
  }

  return {
    id,
    type: form.type,
    title: form.title,
    description: form.description,
    targetRole: form.targetRole,
    readTime: form.readTime || undefined,
    tags: tags.length ? tags : undefined,
    content,
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: FormState): string | null {
  if (!form.title.trim()) return 'Укажите название материала'
  if (form.type === 'video' && !form.videoUrl.trim()) return 'Укажите ссылку на видео'
  if (form.type === 'pdf' && !form.pdfUrl.trim()) return 'Укажите ссылку на PDF файл'
  if (form.type === 'script' && form.scriptLines.filter(l => l.text.trim()).length === 0)
    return 'Добавьте хотя бы одну реплику'
  if (form.type === 'presentation' && form.slides.filter(s => s.title.trim()).length === 0)
    return 'Добавьте хотя бы один слайд'
  return null
}

// ─── Style tokens ─────────────────────────────────────────────────────────────

const FIELD =
  'w-full rounded-2xl border border-[rgba(242,207,141,0.16)] bg-[rgba(5,20,16,0.52)] px-3 py-2.5 text-[13px] text-[#fcecc8] placeholder:text-[rgba(242,207,141,0.3)] outline-none focus:border-[rgba(52,211,153,0.55)] transition-colors'

// ─── Small sub-components ─────────────────────────────────────────────────────

function FieldShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[rgba(242,207,141,0.55)]">{label}</p>
      {children}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="h-px flex-1 bg-[rgba(242,207,141,0.1)]" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[rgba(242,207,141,0.35)]">{label}</span>
      <div className="h-px flex-1 bg-[rgba(242,207,141,0.1)]" />
    </div>
  )
}

// ─── Content type config ──────────────────────────────────────────────────────

const CONTENT_TYPES: Array<{ id: AdminContentType; label: string; icon: React.ReactNode }> = [
  { id: 'article',      label: 'Статья',        icon: <BookOpen className="size-4" /> },
  { id: 'script',       label: 'Скрипт',         icon: <MessageSquare className="size-4" /> },
  { id: 'presentation', label: 'Презентация',    icon: <Presentation className="size-4" /> },
  { id: 'video',        label: 'Видео',           icon: <Video className="size-4" /> },
  { id: 'pdf',          label: 'PDF',             icon: <FileText className="size-4" /> },
]

// ─── Script line editor ───────────────────────────────────────────────────────

function ScriptEditor({
  lines,
  onChange,
}: {
  lines: Array<{ speaker: 'manager' | 'client'; text: string }>
  onChange: (lines: Array<{ speaker: 'manager' | 'client'; text: string }>) => void
}) {
  const addLine = () => {
    const lastSpeaker = lines[lines.length - 1]?.speaker ?? 'manager'
    onChange([...lines, { speaker: lastSpeaker === 'manager' ? 'client' : 'manager', text: '' }])
  }

  const updateLine = (i: number, patch: Partial<typeof lines[0]>) => {
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  }

  const removeLine = (i: number) => onChange(lines.filter((_, idx) => idx !== i))

  const moveLine = (i: number, dir: -1 | 1) => {
    const next = [...lines]
    const target = i + dir
    if (target < 0 || target >= next.length) return
    ;[next[i], next[target]] = [next[target], next[i]]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {lines.map((line, i) => (
        <div key={i} className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => updateLine(i, { speaker: line.speaker === 'manager' ? 'client' : 'manager' })}
            className={cn(
              'mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-colors',
              line.speaker === 'manager'
                ? 'border-blue-500/40 bg-blue-500/15 text-blue-300 hover:bg-blue-500/25'
                : 'border-[rgba(242,207,141,0.2)] bg-[rgba(242,207,141,0.07)] text-[rgba(242,207,141,0.7)] hover:bg-[rgba(242,207,141,0.12)]',
            )}
            title={line.speaker === 'manager' ? 'Менеджер (нажмите для смены)' : 'Клиент (нажмите для смены)'}
          >
            {line.speaker === 'manager' ? 'М' : 'К'}
          </button>
          <input
            value={line.text}
            onChange={e => updateLine(i, { text: e.target.value })}
            placeholder={line.speaker === 'manager' ? 'Реплика менеджера...' : 'Реплика клиента...'}
            className={cn(FIELD, 'flex-1')}
          />
          <div className="mt-1 flex flex-col gap-0.5">
            <button type="button" onClick={() => moveLine(i, -1)} disabled={i === 0}
              className="rounded p-1 text-[rgba(242,207,141,0.3)] hover:text-[rgba(242,207,141,0.7)] disabled:opacity-20">
              <ArrowUp className="size-3" />
            </button>
            <button type="button" onClick={() => moveLine(i, 1)} disabled={i === lines.length - 1}
              className="rounded p-1 text-[rgba(242,207,141,0.3)] hover:text-[rgba(242,207,141,0.7)] disabled:opacity-20">
              <ArrowDown className="size-3" />
            </button>
          </div>
          <button type="button" onClick={() => removeLine(i)} disabled={lines.length === 1}
            className="mt-1 rounded-full p-1.5 text-[rgba(242,207,141,0.3)] hover:text-red-400 hover:bg-red-900/20 disabled:opacity-20 transition-colors">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addLine}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-[rgba(242,207,141,0.2)] px-3 py-1.5 text-xs text-[rgba(242,207,141,0.5)] hover:border-[rgba(242,207,141,0.4)] hover:text-[rgba(242,207,141,0.8)] transition-colors"
      >
        <Plus className="size-3" /> Добавить реплику
      </button>
    </div>
  )
}

// ─── Slides editor ────────────────────────────────────────────────────────────

function SlidesEditor({
  slides,
  onChange,
}: {
  slides: Array<{ title: string; body: string }>
  onChange: (slides: Array<{ title: string; body: string }>) => void
}) {
  const addSlide = () => onChange([...slides, { title: '', body: '' }])
  const updateSlide = (i: number, patch: Partial<typeof slides[0]>) =>
    onChange(slides.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  const removeSlide = (i: number) => onChange(slides.filter((_, idx) => idx !== i))
  const moveSlide = (i: number, dir: -1 | 1) => {
    const next = [...slides]
    const target = i + dir
    if (target < 0 || target >= next.length) return
    ;[next[i], next[target]] = [next[target], next[i]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {slides.map((slide, i) => (
        <div key={i} className="rounded-2xl border border-[rgba(242,207,141,0.14)] bg-[rgba(5,20,16,0.35)] p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[rgba(242,207,141,0.1)] text-[11px] font-bold text-[rgba(242,207,141,0.6)]">{i + 1}</span>
            <input
              value={slide.title}
              onChange={e => updateSlide(i, { title: e.target.value })}
              placeholder="Заголовок слайда"
              className={cn(FIELD, 'flex-1')}
            />
            <button type="button" onClick={() => moveSlide(i, -1)} disabled={i === 0}
              className="rounded p-1 text-[rgba(242,207,141,0.3)] hover:text-[rgba(242,207,141,0.7)] disabled:opacity-20">
              <ArrowUp className="size-3.5" />
            </button>
            <button type="button" onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1}
              className="rounded p-1 text-[rgba(242,207,141,0.3)] hover:text-[rgba(242,207,141,0.7)] disabled:opacity-20">
              <ArrowDown className="size-3.5" />
            </button>
            <button type="button" onClick={() => removeSlide(i)} disabled={slides.length === 1}
              className="rounded-full p-1.5 text-[rgba(242,207,141,0.3)] hover:text-red-400 hover:bg-red-900/20 disabled:opacity-20 transition-colors">
              <Trash2 className="size-3.5" />
            </button>
          </div>
          <textarea
            value={slide.body}
            onChange={e => updateSlide(i, { body: e.target.value })}
            placeholder="Содержимое слайда..."
            rows={3}
            className={cn(FIELD, 'resize-none')}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addSlide}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-[rgba(242,207,141,0.2)] px-3 py-1.5 text-xs text-[rgba(242,207,141,0.5)] hover:border-[rgba(242,207,141,0.4)] hover:text-[rgba(242,207,141,0.8)] transition-colors"
      >
        <Plus className="size-3" /> Добавить слайд
      </button>
    </div>
  )
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

export function LMSAdminDialog({ open, mode, item, onClose, onSave }: LMSAdminDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(item ? itemToForm(item) : emptyForm())
      setError(null)
    }
  }, [open, item])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = () => {
    const err = validate(form)
    if (err) { setError(err); return }
    onSave(formToItem(form, item?.id))
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="top-[50%] h-[calc(100vh-24px)] w-[calc(100vw-16px)] max-w-2xl translate-y-[-50%] overflow-hidden rounded-[24px] border-0 bg-transparent p-0 shadow-none"
      >
        {/* Dark background wrapper */}
        <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[rgba(242,207,141,0.16)] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.09),transparent_40%),linear-gradient(180deg,rgba(9,36,28,0.99),rgba(6,20,16,0.98))]">

          {/* Sticky header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[rgba(242,207,141,0.1)] px-5 py-4">
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(242,207,141,0.45)]">
                База знаний
              </p>
              <h2 className="text-lg font-semibold text-[#fcecc8]">
                {mode === 'create' ? 'Новый материал' : 'Редактировать материал'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full border border-[rgba(242,207,141,0.12)] text-[rgba(242,207,141,0.5)] hover:border-[rgba(242,207,141,0.3)] hover:text-[#fcecc8] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

            {/* Content type selector */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[rgba(242,207,141,0.55)]">Тип материала</p>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map(ct => {
                  const active = form.type === ct.id
                  return (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => set('type', ct.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-[13px] font-medium transition-all',
                        active
                          ? 'border-emerald-400/60 bg-emerald-400/12 text-emerald-300'
                          : 'border-[rgba(242,207,141,0.14)] bg-[rgba(5,20,16,0.4)] text-[rgba(242,207,141,0.6)] hover:border-[rgba(242,207,141,0.3)] hover:text-[rgba(242,207,141,0.9)]',
                      )}
                    >
                      {ct.icon}
                      {ct.label}
                      {active && <Check className="size-3 ml-0.5" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <SectionDivider label="Основное" />

            {/* Title */}
            <FieldShell label="Название">
              <input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Название материала"
                className={cn(FIELD, !form.title.trim() && error ? 'border-red-500/60' : '')}
              />
            </FieldShell>

            {/* Description */}
            <FieldShell label="Описание">
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Краткое описание — отображается на карточке"
                rows={2}
                className={cn(FIELD, 'resize-none')}
              />
            </FieldShell>

            {/* Role + ReadTime row */}
            <div className="grid grid-cols-2 gap-3">
              <FieldShell label="Для кого">
                <Select value={form.targetRole} onValueChange={v => set('targetRole', v as TargetRole)}>
                  <SelectTrigger className="h-10 rounded-2xl border-[rgba(242,207,141,0.16)] bg-[rgba(5,20,16,0.52)] text-[13px] text-[#fcecc8] shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все роли</SelectItem>
                    <SelectItem value="manager">Менеджер</SelectItem>
                    <SelectItem value="rop">РОП</SelectItem>
                    <SelectItem value="director">Директор</SelectItem>
                  </SelectContent>
                </Select>
              </FieldShell>
              <FieldShell label="Время чтения">
                <input
                  value={form.readTime}
                  onChange={e => set('readTime', e.target.value)}
                  placeholder="5 мин"
                  className={FIELD}
                />
              </FieldShell>
            </div>

            {/* Tags */}
            <FieldShell label="Теги (через запятую)">
              <input
                value={form.tags}
                onChange={e => set('tags', e.target.value)}
                placeholder="CRM, Скрипты, Возражения"
                className={FIELD}
              />
            </FieldShell>

            {/* Cover image upload */}
            <FieldShell label="Обложка">
              <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(242,207,141,0.22)] bg-[rgba(5,20,16,0.4)] px-4 py-5 transition-colors hover:border-[rgba(242,207,141,0.45)] hover:bg-[rgba(242,207,141,0.05)]">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = ev => set('coverUrl', ev.target?.result as string)
                    reader.readAsDataURL(file)
                  }}
                />
                {form.coverUrl ? (
                  <div className="h-32 w-full overflow-hidden rounded-xl">
                    <img src={form.coverUrl} alt="preview" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <>
                    <div className="flex size-10 items-center justify-center rounded-full bg-[rgba(242,207,141,0.08)]">
                      <svg className="size-5 text-[rgba(242,207,141,0.45)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <p className="text-[12px] text-[rgba(242,207,141,0.45)]">Нажмите, чтобы загрузить картинку</p>
                    <p className="text-[11px] text-[rgba(242,207,141,0.25)]">PNG, JPG, WEBP</p>
                  </>
                )}
              </label>
              {form.coverUrl && (
                <button
                  type="button"
                  onClick={() => set('coverUrl', '')}
                  className="mt-1.5 text-[11px] text-[rgba(242,207,141,0.35)] hover:text-red-400 transition-colors"
                >
                  Удалить обложку
                </button>
              )}
            </FieldShell>

            {/* ── Content section ── */}
            <SectionDivider label="Контент" />

            {/* Article */}
            {form.type === 'article' && (
              <FieldShell label="Текст статьи (поддерживается markdown: ## заголовки, **жирный**, - списки)">
                <textarea
                  value={form.articleBody}
                  onChange={e => set('articleBody', e.target.value)}
                  placeholder="## Заголовок&#10;&#10;Текст статьи..."
                  rows={14}
                  className={cn(FIELD, 'resize-y font-mono text-[12px] leading-relaxed')}
                />
              </FieldShell>
            )}

            {/* Video */}
            {form.type === 'video' && (
              <div className="space-y-4">
                <FieldShell label="Ссылка на видео (YouTube embed или прямая)">
                  <input
                    value={form.videoUrl}
                    onChange={e => set('videoUrl', e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className={cn(FIELD, !form.videoUrl.trim() && error ? 'border-red-500/60' : '')}
                  />
                </FieldShell>
                {form.videoUrl && (
                  <div className="relative aspect-video overflow-hidden rounded-xl border border-[rgba(242,207,141,0.12)] bg-black">
                    <iframe src={form.videoUrl} title="preview" className="absolute inset-0 h-full w-full" allowFullScreen />
                  </div>
                )}
                <FieldShell label="Описание (необязательно)">
                  <textarea
                    value={form.videoDescription}
                    onChange={e => set('videoDescription', e.target.value)}
                    placeholder="О чём это видео..."
                    rows={3}
                    className={cn(FIELD, 'resize-none')}
                  />
                </FieldShell>
              </div>
            )}

            {/* PDF */}
            {form.type === 'pdf' && (
              <div className="space-y-4">
                <FieldShell label="PDF файл">
                  <label className={cn(
                    'group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-5 transition-colors',
                    !form.pdfUrl && error
                      ? 'border-red-500/50 bg-red-900/10'
                      : 'border-[rgba(242,207,141,0.22)] bg-[rgba(5,20,16,0.4)] hover:border-[rgba(242,207,141,0.45)] hover:bg-[rgba(242,207,141,0.05)]',
                  )}>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const url = URL.createObjectURL(file)
                        set('pdfUrl', url)
                        set('pdfDescription', form.pdfDescription || file.name.replace(/\.pdf$/i, ''))
                      }}
                    />
                    {form.pdfUrl ? (
                      <div className="flex w-full items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
                          <FileText className="size-5 text-red-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#fcecc8]">{form.pdfDescription || 'PDF загружен'}</p>
                          <p className="text-[11px] text-[rgba(242,207,141,0.4)]">Нажмите, чтобы заменить</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex size-10 items-center justify-center rounded-full bg-[rgba(242,207,141,0.08)]">
                          <FileText className="size-5 text-[rgba(242,207,141,0.45)]" />
                        </div>
                        <p className="text-[12px] text-[rgba(242,207,141,0.45)]">Нажмите, чтобы загрузить PDF</p>
                        <p className="text-[11px] text-[rgba(242,207,141,0.25)]">PDF до 50 МБ</p>
                      </>
                    )}
                  </label>
                  {form.pdfUrl && (
                    <button
                      type="button"
                      onClick={() => set('pdfUrl', '')}
                      className="mt-1 text-[11px] text-[rgba(242,207,141,0.35)] hover:text-red-400 transition-colors"
                    >
                      Удалить файл
                    </button>
                  )}
                </FieldShell>
                {form.pdfUrl && (
                  <div className="overflow-hidden rounded-xl border border-[rgba(242,207,141,0.12)]" style={{ height: 300 }}>
                    <iframe src={form.pdfUrl} title="PDF preview" className="h-full w-full bg-white" />
                  </div>
                )}
                <FieldShell label="Описание (необязательно)">
                  <textarea
                    value={form.pdfDescription}
                    onChange={e => set('pdfDescription', e.target.value)}
                    placeholder="О чём этот документ..."
                    rows={3}
                    className={cn(FIELD, 'resize-none')}
                  />
                </FieldShell>
              </div>
            )}

            {/* Script */}
            {form.type === 'script' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-[rgba(242,207,141,0.4)]">
                  <span className="flex items-center gap-1.5"><span className="inline-flex size-5 items-center justify-center rounded-full bg-blue-500/15 text-[10px] font-bold text-blue-300">М</span>Менеджер</span>
                  <span className="flex items-center gap-1.5"><span className="inline-flex size-5 items-center justify-center rounded-full bg-[rgba(242,207,141,0.08)] text-[10px] font-bold text-[rgba(242,207,141,0.6)]">К</span>Клиент</span>
                  <span className="ml-auto">Нажмите М/К для смены роли</span>
                </div>
                <ScriptEditor lines={form.scriptLines} onChange={v => set('scriptLines', v)} />
              </div>
            )}

            {/* Presentation */}
            {form.type === 'presentation' && (
              <div className="space-y-2">
                <p className="text-[11px] text-[rgba(242,207,141,0.4)]">
                  {form.slides.length} {form.slides.length === 1 ? 'слайд' : form.slides.length < 5 ? 'слайда' : 'слайдов'}
                </p>
                <SlidesEditor slides={form.slides} onChange={v => set('slides', v)} />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Bottom padding */}
            <div className="h-2" />
          </div>

          {/* Sticky footer */}
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[rgba(242,207,141,0.1)] px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[rgba(242,207,141,0.2)] px-5 py-2 text-[13px] font-medium text-[rgba(242,207,141,0.65)] hover:border-[rgba(242,207,141,0.4)] hover:text-[#fcecc8] transition-colors"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full bg-emerald-500 px-5 py-2 text-[13px] font-semibold text-white hover:bg-emerald-400 transition-colors"
            >
              {mode === 'create' ? 'Добавить' : 'Сохранить'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
