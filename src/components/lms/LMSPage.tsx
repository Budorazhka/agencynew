import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  MessageSquare,
  Search,
  ArrowLeft,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Presentation,
  GraduationCap,
  FileText,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import { LMS_ITEMS, LMS_COURSES } from '@/data/lms-mock'
import type { LMSItem, TargetRole } from '@/data/lms-mock'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LMSAdminDialog } from './LMSAdminDialog'
import '@/components/leads/leads-secret-table.css'

// ─── Типы вкладок ─────────────────────────────────────────────────────────────

type Tab = 'articles' | 'scripts' | 'presentations' | 'pdfs' | 'courses'

const VALID_TABS: readonly Tab[] = ['articles', 'scripts', 'presentations', 'pdfs', 'courses']

function parseLmsTab(params: URLSearchParams): Tab {
  const t = params.get('tab')
  return (VALID_TABS as readonly string[]).includes(t ?? '') ? (t as Tab) : 'scripts'
}

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'articles', label: 'Статьи', icon: <BookOpen className="size-3.5" /> },
  { id: 'scripts', label: 'Скрипты', icon: <MessageSquare className="size-3.5" /> },
  { id: 'presentations', label: 'Презентации', icon: <Presentation className="size-3.5" /> },
  { id: 'pdfs', label: 'PDF', icon: <FileText className="size-3.5" /> },
  { id: 'courses', label: 'Курсы', icon: <GraduationCap className="size-3.5" /> },
]

const ROLE_LABELS: Record<TargetRole, string> = {
  all: 'Все',
  manager: 'Менеджер',
  rop: 'РОП',
  director: 'Директор',
}

// ─── Карточка материала ────────────────────────────────────────────────────────

function ItemCard({
  item,
  onClick,
  onEdit,
  onDelete,
}: {
  item: LMSItem
  onClick: () => void
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="group/card flex flex-col gap-3 rounded-2xl border border-[color:var(--hub-card-border)] bg-[var(--hub-card-bg)] p-5 text-left transition-all hover:border-[color:var(--hub-card-border-hover)] hover:bg-[var(--hub-action-hover)] w-full"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[color:var(--app-text)] leading-snug">{item.title}</p>
            <p className="mt-1 text-sm text-[color:var(--hub-desc)] line-clamp-2">{item.description}</p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-[color:var(--theme-accent-icon-dim)] transition-transform group-hover/card:translate-x-0.5 group-hover/card:text-[color:var(--theme-accent-link-dim)] mt-1" />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-auto">
          {item.targetRole !== 'all' && (
            <span className="rounded-full border border-[color:var(--hub-card-border)] bg-[var(--hub-action-hover)] px-2.5 py-0.5 text-xs text-[color:var(--hub-badge-soon-fg)]">
              {ROLE_LABELS[item.targetRole]}
            </span>
          )}
          {item.tags?.map(t => (
            <span key={t} className="rounded-full bg-[var(--nav-item-bg-active)] px-2.5 py-0.5 text-xs text-[color:var(--hub-desc)]">{t}</span>
          ))}
          {item.readTime && (
            <span className="ml-auto flex items-center gap-1 text-xs text-[color:var(--theme-accent-icon-dim)] shrink-0">
              <Clock className="size-3" />
              {item.readTime}
            </span>
          )}
        </div>
      </button>

      {/* Кнопки админа — только если переданы onEdit / onDelete */}
      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-9 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="flex size-7 items-center justify-center rounded-full bg-[rgba(9,36,28,0.85)] border border-[color:var(--hub-card-border)] text-[color:var(--hub-badge-soon-fg)] hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
              title="Редактировать"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="flex size-7 items-center justify-center rounded-full bg-[rgba(9,36,28,0.85)] border border-[color:var(--hub-card-border)] text-[color:var(--hub-badge-soon-fg)] hover:text-red-400 hover:border-red-500/40 transition-colors"
              title="Удалить"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Просмотр статьи (разметка) ───────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-semibold text-[color:var(--gold-light)]">{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="rounded bg-[var(--hub-tile-icon-bg)] px-1 py-0.5 font-mono text-xs text-[color:var(--gold-light)]">{p.slice(1, -1)}</code>
    return p
  })
}

function TableRow({ line }: { line: string }) {
  const cells = line.split('|').filter(Boolean).map(c => c.trim())
  const isHeader = cells.every(c => /^-+$/.test(c))
  if (isHeader) return null
  return (
    <div className="grid gap-0 border-b border-[color:var(--hub-tile-icon-border)] last:border-0" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
      {cells.map((c, i) => (
        <div key={i} className="px-3 py-2 text-xs text-[color:var(--hub-body)] border-r border-[color:var(--hub-tile-icon-border)] last:border-0">{c}</div>
      ))}
    </div>
  )
}

function ArticleViewer({ body }: { body: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-[color:var(--app-text-muted)]">
      {body.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-[color:var(--app-text)] mt-5 mb-2">{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-[color:var(--gold-light)] mt-4 mb-1">{line.slice(4)}</h3>
        if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{renderInline(line.slice(2))}</li>
        if (line.startsWith('```')) return null
        if (/^\d+\./.test(line)) return <li key={i} className="ml-4 list-decimal">{renderInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (line.startsWith('|')) return <TableRow key={i} line={line} />
        if (line.trim() === '') return <div key={i} className="h-1" />
        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

// ─── Просмотр скрипта (диалог) ────────────────────────────────────────────────

function ScriptViewer({ lines }: { lines: Array<{ speaker: 'manager' | 'client'; text: string }> }) {
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const isManager = line.speaker === 'manager'
        return (
          <div key={i} className={cn('flex gap-3', isManager ? 'flex-row-reverse' : 'flex-row')}>
            <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', isManager ? 'bg-[rgba(126,200,227,0.2)] text-[#7ec8e3]' : 'bg-[var(--hub-tile-icon-bg)] text-[color:var(--hub-badge-soon-fg)]')}>
              {isManager ? 'М' : 'К'}
            </div>
            <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed', isManager ? 'rounded-tr-sm bg-[rgba(126,200,227,0.15)] text-[#c8e8f5] border border-[rgba(126,200,227,0.25)]' : 'rounded-tl-sm bg-[rgba(255,255,255,0.05)] text-[color:var(--app-text-muted)] border border-[color:var(--hub-tile-icon-border)]')}>
              {line.text}
            </div>
          </div>
        )
      })}
      <div className="mt-4 flex items-center gap-4 rounded-xl border border-[color:var(--hub-tile-icon-border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-xs text-[color:var(--hub-desc)]">
        <div className="flex items-center gap-1.5"><span className="inline-flex size-5 rounded-full bg-[rgba(126,200,227,0.2)] text-[#7ec8e3] font-bold text-[10px] items-center justify-center">М</span>Менеджер</div>
        <div className="flex items-center gap-1.5"><span className="inline-flex size-5 rounded-full bg-[var(--hub-tile-icon-bg)] text-[color:var(--hub-badge-soon-fg)] font-bold text-[10px] items-center justify-center">К</span>Клиент</div>
      </div>
    </div>
  )
}

// ─── Просмотр презентации (слайды) ────────────────────────────────────────────

function PresentationViewer({ slides }: { slides: Array<{ title: string; body: string }> }) {
  const [current, setCurrent] = useState(0)
  const slide = slides[current]
  const total = slides.length

  return (
    <div className="space-y-4">
      <div className="relative min-h-[260px] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white flex flex-col justify-between">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{current + 1} / {total}</p>
          <h2 className="text-xl font-bold leading-snug">{slide.title}</h2>
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{slide.body}</div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => setCurrent(c => c - 1)} disabled={current === 0} className="border-[color:var(--hub-card-border-hover)] bg-[var(--hub-action-hover)] text-[color:var(--app-text-muted)] hover:bg-[var(--nav-item-bg-active)]">← Назад</Button>
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={cn('rounded-full transition-all', i === current ? 'size-2.5 bg-[var(--gold-light)]' : 'size-2 bg-[var(--gold)]/25 hover:bg-[var(--gold)]/50')}
            />
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrent(c => c + 1)} disabled={current === total - 1} className="border-[color:var(--hub-card-border-hover)] bg-[var(--hub-action-hover)] text-[color:var(--app-text-muted)] hover:bg-[var(--nav-item-bg-active)]">Далее →</Button>
      </div>
      <div className="rounded-xl border border-[color:var(--hub-card-border)] divide-y divide-[color:var(--hub-card-border)] overflow-hidden">
        {slides.map((s, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={cn('flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--hub-action-hover)]', i === current ? 'bg-[var(--nav-item-bg-active)] font-semibold text-[color:var(--app-text)]' : 'text-[color:var(--hub-desc)]')}
          >
            <span className={cn('inline-flex size-5 shrink-0 rounded-full text-[10px] font-bold items-center justify-center', i === current ? 'bg-[var(--gold-light)] text-[#0a2619]' : 'bg-[var(--hub-tile-icon-bg)] text-[color:var(--hub-desc)]')}>{i + 1}</span>
            {s.title}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Просмотр PDF ───────────────────────────────────────────────────────────────

function PdfViewer({ url, description }: { url: string; description?: string }) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[color:var(--hub-card-border)] bg-[rgba(0,0,0,0.2)]" style={{ height: 520 }}>
        <iframe src={`${url}#toolbar=1`} title="PDF" className="h-full w-full" />
      </div>
      {description && <p className="text-sm text-[color:var(--hub-body)] leading-relaxed">{description}</p>}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--hub-card-border-hover)] bg-[var(--hub-action-hover)] px-4 py-2 text-sm text-[color:var(--app-text-muted)] hover:bg-[var(--nav-item-bg-active)] transition-colors"
      >
        <ExternalLink className="size-4" />
        Открыть в новой вкладке
      </a>
    </div>
  )
}

// ─── Просмотр теста (вопросы) ─────────────────────────────────────────────────

function QuizViewer({ questions }: { questions: Array<{ question: string; options: string[]; correct: number }> }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const allAnswered = Object.keys(answers).length === questions.length
  const score = submitted ? questions.filter((q, i) => answers[i] === q.correct).length : 0

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className={cn('rounded-2xl border p-6 text-center', score === questions.length ? 'border-[rgba(111,207,151,0.4)] bg-[rgba(111,207,151,0.08)]' : score >= questions.length / 2 ? 'border-[rgba(244,185,106,0.4)] bg-[rgba(244,185,106,0.08)]' : 'border-[rgba(252,129,129,0.4)] bg-[rgba(252,129,129,0.08)]')}>
          <p className="text-3xl font-bold text-[color:var(--app-text)]">{score} / {questions.length}</p>
          <p className={cn('mt-1 text-sm font-medium', score === questions.length ? 'text-[#6fcf97]' : score >= questions.length / 2 ? 'text-[#f4b96a]' : 'text-[#fc8181]')}>
            {score === questions.length ? 'Отлично! Все правильно.' : score >= questions.length / 2 ? 'Хороший результат.' : 'Повторите материал.'}
          </p>
        </div>
        <div className="space-y-4">
          {questions.map((q, qi) => {
            const isCorrect = answers[qi] === q.correct
            return (
              <div key={qi} className="rounded-xl border border-[color:var(--hub-card-border)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3">
                <div className="flex items-start gap-2">
                  {isCorrect ? <CheckCircle2 className="size-5 shrink-0 text-[#6fcf97] mt-0.5" /> : <XCircle className="size-5 shrink-0 text-[#fc8181] mt-0.5" />}
                  <p className="text-sm font-medium text-[color:var(--app-text)]">{q.question}</p>
                </div>
                <div className="space-y-1.5 pl-7">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={cn('rounded-lg px-3 py-2 text-sm', oi === q.correct ? 'bg-[rgba(111,207,151,0.12)] text-[#6fcf97] font-medium' : oi === answers[qi] && !isCorrect ? 'bg-[rgba(252,129,129,0.1)] text-[#fc8181] line-through' : 'text-[color:var(--workspace-text-muted)]')}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <Button variant="outline" onClick={() => { setAnswers({}); setSubmitted(false) }} className="w-full border-[color:var(--hub-card-border-hover)] bg-[var(--hub-action-hover)] text-[color:var(--app-text-muted)] hover:bg-[var(--nav-item-bg-active)]">Пройти заново</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-xl border border-[color:var(--hub-card-border)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3">
          <p className="text-sm font-semibold text-[color:var(--app-text)]">
            <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-[var(--nav-item-bg-active)] text-xs font-bold text-[color:var(--theme-accent-link-dim)]">{qi + 1}</span>
            {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                className={cn('w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors', answers[qi] === oi ? 'border-[rgba(126,200,227,0.5)] bg-[rgba(126,200,227,0.1)] text-[#c8e8f5] font-medium' : 'border-[color:var(--hub-card-border)] bg-[rgba(255,255,255,0.02)] text-[color:var(--app-text-muted)] hover:border-[color:var(--hub-card-border-hover)] hover:bg-[var(--hub-action-hover)]')}
              >{opt}</button>
            ))}
          </div>
        </div>
      ))}
      <Button variant="sectionPrimary" onClick={() => setSubmitted(true)} disabled={!allAnswered} className="w-full !normal-case">
        {allAnswered ? 'Проверить ответы' : `Ответьте на все вопросы (${Object.keys(answers).length}/${questions.length})`}
      </Button>
    </div>
  )
}

// ─── Детальный просмотр ──────────────────────────────────────────────────────

function ItemDetail({ item, onBack }: { item: LMSItem; onBack: () => void }) {
  return (
    <div className="leads-page-root min-h-screen">
      <div className="leads-page-bg" aria-hidden />
      <div className="leads-page-ornament" aria-hidden />
      <div className="leads-page relative z-10 p-6 lg:p-8 space-y-5 max-w-3xl mx-auto">
        {/* Навигация «назад» */}
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={onBack}
            className="gap-2 text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--app-text)] hover:bg-transparent px-0">
            <ArrowLeft className="size-4" />
            Обучение
          </Button>
          <span className="text-[color:var(--theme-accent-icon-dim)]">/</span>
          <span className="text-[color:var(--app-text-muted)] font-medium truncate max-w-[200px]">{item.title}</span>
        </div>

        {/* Метаданные материала */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {item.targetRole !== 'all' && (
              <span className="rounded-full border border-[color:var(--hub-card-border)] bg-[var(--nav-item-bg-active)] px-2.5 py-0.5 text-xs text-[color:var(--hub-body)]">
                {ROLE_LABELS[item.targetRole]}
              </span>
            )}
            {item.readTime && (
              <span className="flex items-center gap-1 text-xs text-[color:var(--workspace-text-muted)]">
                <Clock className="size-3" />{item.readTime}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[color:var(--app-text)]">{item.title}</h1>
          <p className="text-sm text-[color:var(--hub-desc)]">{item.description}</p>
        </div>

        {/* Карточка с содержимым */}
        <div className="rounded-2xl border border-[color:var(--hub-card-border)] bg-[rgba(10,35,24,0.85)] shadow-xl overflow-hidden p-5 sm:p-6">
          {item.content.type === 'article' && <ArticleViewer body={item.content.body} />}
          {item.content.type === 'video' && (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl bg-black aspect-video">
                <iframe src={item.content.url} title="video" className="absolute inset-0 w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
              </div>
              {item.content.description && <p className="text-sm text-slate-600 leading-relaxed">{item.content.description}</p>}
            </div>
          )}
          {item.content.type === 'script' && <ScriptViewer lines={item.content.lines} />}
          {item.content.type === 'presentation' && <PresentationViewer slides={item.content.slides} />}
          {item.content.type === 'quiz' && <QuizViewer questions={item.content.questions} />}
          {item.content.type === 'pdf' && <PdfViewer url={item.content.url} description={item.content.description} />}
        </div>
      </div>
    </div>
  )
}

// ─── Вкладка «Курсы» ──────────────────────────────────────────────────────────


function CoursesTab() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const userRole = (currentUser?.role ?? 'manager') as TargetRole

  const visibleCourses = LMS_COURSES.filter(c =>
    c.targetRoles.includes('all') || c.targetRoles.includes(userRole)
  )

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visibleCourses.map((course) => (
        <div
          key={course.id}
          onClick={() => navigate(`/dashboard/lms/course/${course.id}`)}
          className="rounded-2xl border border-[color:var(--hub-card-border)] bg-[rgba(10,30,22,0.5)] p-5 cursor-pointer hover:border-[color:var(--hub-card-border-hover)] hover:bg-[var(--hub-action-hover)] transition-all"
        >
          <div className="text-3xl mb-3">{course.emoji}</div>
          <div className="space-y-2">
            <p className="font-semibold text-[color:var(--theme-accent-heading)] leading-snug">{course.title}</p>
            <p className="text-sm text-[color:var(--workspace-text-muted)]">{course.description}</p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-[color:var(--theme-accent-icon-dim)]">{course.lessons.length} уроков</span>
            <span className="text-xs font-semibold text-[color:var(--hub-badge-soon-fg)] flex items-center gap-1">
              Начать <ChevronRight className="size-3" />
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Главная страница ─────────────────────────────────────────────────────────

export function LMSPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = useMemo(() => parseLmsTab(searchParams), [searchParams])
  const { currentUser } = useAuth()
  const { isDirectorOrAbove } = useRolePermissions()
  const userRole = currentUser?.role ?? 'manager'
  const canAdmin = isDirectorOrAbove

  const [items, setItems] = useState<LMSItem[]>(LMS_ITEMS)
  const [search, setSearch] = useState('')
  const [openItem, setOpenItem] = useState<LMSItem | null>(null)

  // Состояние админ-диалога
  const [adminOpen, setAdminOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LMSItem | null>(null)

  useEffect(() => {
    if (!location.pathname.includes('/lms/add')) return
    if (!canAdmin) {
      navigate('/dashboard/lms/browse', { replace: true })
      return
    }
    setEditingItem(null)
    setAdminOpen(true)
  }, [location.pathname, canAdmin, navigate])

  const handleAdminClose = () => {
    setAdminOpen(false)
    setEditingItem(null)
    if (location.pathname.includes('/lms/add')) {
      navigate('/dashboard/learning')
    }
  }

  const handleOpenCreate = () => {
    setEditingItem(null)
    setAdminOpen(true)
  }

  const handleOpenEdit = (item: LMSItem) => {
    setEditingItem(item)
    setAdminOpen(true)
  }

  const handleSaveItem = (saved: LMSItem) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [...prev, saved]
    })
    setAdminOpen(false)
    setEditingItem(null)
  }

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  if (openItem) {
    return <ItemDetail item={openItem} onBack={() => setOpenItem(null)} />
  }

  const typeMap: Record<Tab, LMSItem['type'] | null> = {
    articles: 'article',
    scripts: 'script',
    presentations: 'presentation',
    pdfs: 'pdf',
    courses: null,
  }

  const filtered = activeTab === 'courses' ? [] : items.filter((item) => {
    if (item.type !== typeMap[activeTab]) return false
    if (userRole === 'manager' && item.targetRole !== 'all' && item.targetRole !== 'manager') return false
    if (userRole === 'rop' && item.targetRole !== 'all' && item.targetRole !== 'rop' && item.targetRole !== 'manager') return false
    if (search) {
      const q = search.toLowerCase()
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <>
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
        <div className="space-y-8 p-6 lg:p-8">
          {/* Header */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[color:var(--hub-stat-label)] mb-1">База знаний</p>
            <h1 className="text-3xl font-bold text-[color:var(--app-text)]">Обучение</h1>
            <p className="mt-1 text-sm text-[color:var(--hub-stat-label)]">Материалы, скрипты и презентации для работы.</p>
          </div>

          {/* Tabs + Add button */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="leads-tabs-list inline-flex h-auto rounded-full p-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSearch('')
                      if (tab.id === 'scripts') {
                        setSearchParams({}, { replace: true })
                      } else {
                        setSearchParams({ tab: tab.id }, { replace: true })
                      }
                    }}
                    className={cn(
                      'leads-tabs-trigger flex items-center gap-1.5 rounded-full border-0 px-4 py-2 text-sm font-medium shadow-none transition-colors',
                      activeTab === tab.id && 'leads-tabs-trigger--active'
                    )}
                    data-state={activeTab === tab.id ? 'active' : 'inactive'}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.id === 'courses' && (
                      <span className="rounded-full bg-[var(--nav-item-bg-active)] px-1.5 py-0.5 text-[9px] font-bold text-[color:var(--theme-accent-link-dim)] uppercase tracking-wide">soon</span>
                    )}
                  </button>
                ))}
              </div>

              {canAdmin && activeTab !== 'courses' && (
                <button type="button" onClick={handleOpenCreate} className="alphabase-section-primary !normal-case">
                  <Plus className="size-4 stroke-[2.5]" />
                  Добавить материал
                </button>
              )}
            </div>

            {activeTab === 'courses' ? (
              <CoursesTab />
            ) : (
              <>
                {/* Search */}
                <div className="relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[color:var(--theme-accent-icon-dim)]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск..."
                    className="w-full rounded-full border border-[var(--shell-search-border)] bg-[var(--shell-search-bg)] pl-9 pr-4 py-2 text-sm text-[var(--shell-search-fg)] placeholder:text-[color:var(--shell-search-ph)] outline-none focus:border-[color:var(--hub-card-border-hover)]"
                  />
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[color:var(--theme-accent-icon-dim)]">
                    <Search className="size-10 mb-4 opacity-40" />
                    <p className="font-medium">Ничего не найдено</p>
                    <p className="text-sm opacity-70">Попробуйте изменить запрос</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onClick={() => setOpenItem(item)}
                        onEdit={canAdmin ? () => handleOpenEdit(item) : undefined}
                        onDelete={canAdmin ? () => handleDeleteItem(item.id) : undefined}
                      />
                    ))}
                  </div>
                )}

                <p className="text-center text-xs text-[color:var(--theme-accent-icon-dim)]">
                  {filtered.length} {filtered.length === 1 ? 'материал' : filtered.length < 5 ? 'материала' : 'материалов'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Admin dialog */}
      <LMSAdminDialog
        open={adminOpen}
        mode={editingItem ? 'edit' : 'create'}
        item={editingItem}
        onClose={handleAdminClose}
        onSave={handleSaveItem}
      />
    </>
  )
}
