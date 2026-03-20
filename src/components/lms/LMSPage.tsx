import { useState } from 'react'
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
  Lock,
  FileText,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import { LMS_ITEMS } from '@/data/lms-mock'
import type { LMSItem, TargetRole } from '@/data/lms-mock'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LMSAdminDialog } from './LMSAdminDialog'
import '@/components/leads/leads-secret-table.css'

// ─── Типы вкладок ─────────────────────────────────────────────────────────────

type Tab = 'articles' | 'scripts' | 'presentations' | 'pdfs' | 'courses'

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
        className="group/card flex flex-col gap-3 rounded-2xl border border-[rgba(242,207,141,0.2)] bg-[rgba(18,48,36,0.7)] p-5 text-left transition-all hover:border-[rgba(242,207,141,0.45)] hover:bg-[rgba(242,207,141,0.07)] w-full"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#fcecc8] leading-snug">{item.title}</p>
            <p className="mt-1 text-sm text-[rgba(242,207,141,0.5)] line-clamp-2">{item.description}</p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-[rgba(242,207,141,0.25)] transition-transform group-hover/card:translate-x-0.5 group-hover/card:text-[rgba(242,207,141,0.7)] mt-1" />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-auto">
          {item.targetRole !== 'all' && (
            <span className="rounded-full border border-[rgba(242,207,141,0.2)] bg-[rgba(242,207,141,0.07)] px-2.5 py-0.5 text-xs text-[rgba(242,207,141,0.6)]">
              {ROLE_LABELS[item.targetRole]}
            </span>
          )}
          {item.tags?.map(t => (
            <span key={t} className="rounded-full bg-[rgba(242,207,141,0.08)] px-2.5 py-0.5 text-xs text-[rgba(242,207,141,0.5)]">{t}</span>
          ))}
          {item.readTime && (
            <span className="ml-auto flex items-center gap-1 text-xs text-[rgba(242,207,141,0.35)] shrink-0">
              <Clock className="size-3" />
              {item.readTime}
            </span>
          )}
        </div>
      </button>

      {/* Admin controls — visible only when admin props passed */}
      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-9 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="flex size-7 items-center justify-center rounded-full bg-[rgba(9,36,28,0.85)] border border-[rgba(242,207,141,0.2)] text-[rgba(242,207,141,0.6)] hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
              title="Редактировать"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="flex size-7 items-center justify-center rounded-full bg-[rgba(9,36,28,0.85)] border border-[rgba(242,207,141,0.2)] text-[rgba(242,207,141,0.6)] hover:text-red-400 hover:border-red-500/40 transition-colors"
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

// ─── ArticleViewer ────────────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-semibold text-[#f2cf8d]">{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="rounded bg-[rgba(242,207,141,0.1)] px-1 py-0.5 font-mono text-xs text-[#f2cf8d]">{p.slice(1, -1)}</code>
    return p
  })
}

function TableRow({ line }: { line: string }) {
  const cells = line.split('|').filter(Boolean).map(c => c.trim())
  const isHeader = cells.every(c => /^-+$/.test(c))
  if (isHeader) return null
  return (
    <div className="grid gap-0 border-b border-[rgba(242,207,141,0.1)] last:border-0" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
      {cells.map((c, i) => (
        <div key={i} className="px-3 py-2 text-xs text-[rgba(247,236,212,0.75)] border-r border-[rgba(242,207,141,0.1)] last:border-0">{c}</div>
      ))}
    </div>
  )
}

function ArticleViewer({ body }: { body: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-[rgba(247,236,212,0.85)]">
      {body.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-[#fcecc8] mt-5 mb-2">{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-[#f2cf8d] mt-4 mb-1">{line.slice(4)}</h3>
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

// ─── ScriptViewer ─────────────────────────────────────────────────────────────

function ScriptViewer({ lines }: { lines: Array<{ speaker: 'manager' | 'client'; text: string }> }) {
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const isManager = line.speaker === 'manager'
        return (
          <div key={i} className={cn('flex gap-3', isManager ? 'flex-row-reverse' : 'flex-row')}>
            <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', isManager ? 'bg-[rgba(126,200,227,0.2)] text-[#7ec8e3]' : 'bg-[rgba(242,207,141,0.1)] text-[rgba(242,207,141,0.6)]')}>
              {isManager ? 'М' : 'К'}
            </div>
            <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed', isManager ? 'rounded-tr-sm bg-[rgba(126,200,227,0.15)] text-[#c8e8f5] border border-[rgba(126,200,227,0.25)]' : 'rounded-tl-sm bg-[rgba(255,255,255,0.05)] text-[rgba(247,236,212,0.85)] border border-[rgba(242,207,141,0.12)]')}>
              {line.text}
            </div>
          </div>
        )
      })}
      <div className="mt-4 flex items-center gap-4 rounded-xl border border-[rgba(242,207,141,0.12)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-xs text-[rgba(242,207,141,0.5)]">
        <div className="flex items-center gap-1.5"><span className="inline-flex size-5 rounded-full bg-[rgba(126,200,227,0.2)] text-[#7ec8e3] font-bold text-[10px] items-center justify-center">М</span>Менеджер</div>
        <div className="flex items-center gap-1.5"><span className="inline-flex size-5 rounded-full bg-[rgba(242,207,141,0.1)] text-[rgba(242,207,141,0.6)] font-bold text-[10px] items-center justify-center">К</span>Клиент</div>
      </div>
    </div>
  )
}

// ─── PresentationViewer ───────────────────────────────────────────────────────

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
        <Button variant="outline" size="sm" onClick={() => setCurrent(c => c - 1)} disabled={current === 0} className="border-[rgba(242,207,141,0.3)] bg-[rgba(242,207,141,0.07)] text-[rgba(242,207,141,0.8)] hover:bg-[rgba(242,207,141,0.12)]">← Назад</Button>
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={cn('rounded-full transition-all', i === current ? 'size-2.5 bg-[#f2cf8d]' : 'size-2 bg-[rgba(242,207,141,0.25)] hover:bg-[rgba(242,207,141,0.5)]')}
            />
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrent(c => c + 1)} disabled={current === total - 1} className="border-[rgba(242,207,141,0.3)] bg-[rgba(242,207,141,0.07)] text-[rgba(242,207,141,0.8)] hover:bg-[rgba(242,207,141,0.12)]">Далее →</Button>
      </div>
      <div className="rounded-xl border border-[rgba(242,207,141,0.15)] divide-y divide-[rgba(242,207,141,0.08)] overflow-hidden">
        {slides.map((s, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={cn('flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[rgba(242,207,141,0.05)]', i === current ? 'bg-[rgba(242,207,141,0.08)] font-semibold text-[#fcecc8]' : 'text-[rgba(247,236,212,0.5)]')}
          >
            <span className={cn('inline-flex size-5 shrink-0 rounded-full text-[10px] font-bold items-center justify-center', i === current ? 'bg-[#f2cf8d] text-[#0a2619]' : 'bg-[rgba(242,207,141,0.1)] text-[rgba(242,207,141,0.5)]')}>{i + 1}</span>
            {s.title}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── PdfViewer ────────────────────────────────────────────────────────────────

function PdfViewer({ url, description }: { url: string; description?: string }) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.2)]" style={{ height: 520 }}>
        <iframe src={`${url}#toolbar=1`} title="PDF" className="h-full w-full" />
      </div>
      {description && <p className="text-sm text-[rgba(247,236,212,0.65)] leading-relaxed">{description}</p>}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-[rgba(242,207,141,0.3)] bg-[rgba(242,207,141,0.07)] px-4 py-2 text-sm text-[rgba(242,207,141,0.8)] hover:bg-[rgba(242,207,141,0.12)] transition-colors"
      >
        <ExternalLink className="size-4" />
        Открыть в новой вкладке
      </a>
    </div>
  )
}

// ─── QuizViewer ───────────────────────────────────────────────────────────────

function QuizViewer({ questions }: { questions: Array<{ question: string; options: string[]; correct: number }> }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const allAnswered = Object.keys(answers).length === questions.length
  const score = submitted ? questions.filter((q, i) => answers[i] === q.correct).length : 0

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className={cn('rounded-2xl border p-6 text-center', score === questions.length ? 'border-[rgba(111,207,151,0.4)] bg-[rgba(111,207,151,0.08)]' : score >= questions.length / 2 ? 'border-[rgba(244,185,106,0.4)] bg-[rgba(244,185,106,0.08)]' : 'border-[rgba(252,129,129,0.4)] bg-[rgba(252,129,129,0.08)]')}>
          <p className="text-3xl font-bold text-[#fcecc8]">{score} / {questions.length}</p>
          <p className={cn('mt-1 text-sm font-medium', score === questions.length ? 'text-[#6fcf97]' : score >= questions.length / 2 ? 'text-[#f4b96a]' : 'text-[#fc8181]')}>
            {score === questions.length ? 'Отлично! Все правильно.' : score >= questions.length / 2 ? 'Хороший результат.' : 'Повторите материал.'}
          </p>
        </div>
        <div className="space-y-4">
          {questions.map((q, qi) => {
            const isCorrect = answers[qi] === q.correct
            return (
              <div key={qi} className="rounded-xl border border-[rgba(242,207,141,0.15)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3">
                <div className="flex items-start gap-2">
                  {isCorrect ? <CheckCircle2 className="size-5 shrink-0 text-[#6fcf97] mt-0.5" /> : <XCircle className="size-5 shrink-0 text-[#fc8181] mt-0.5" />}
                  <p className="text-sm font-medium text-[#fcecc8]">{q.question}</p>
                </div>
                <div className="space-y-1.5 pl-7">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={cn('rounded-lg px-3 py-2 text-sm', oi === q.correct ? 'bg-[rgba(111,207,151,0.12)] text-[#6fcf97] font-medium' : oi === answers[qi] && !isCorrect ? 'bg-[rgba(252,129,129,0.1)] text-[#fc8181] line-through' : 'text-[rgba(247,236,212,0.4)]')}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <Button variant="outline" onClick={() => { setAnswers({}); setSubmitted(false) }} className="w-full border-[rgba(242,207,141,0.3)] bg-[rgba(242,207,141,0.07)] text-[rgba(242,207,141,0.8)] hover:bg-[rgba(242,207,141,0.12)]">Пройти заново</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-xl border border-[rgba(242,207,141,0.15)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3">
          <p className="text-sm font-semibold text-[#fcecc8]">
            <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-[rgba(242,207,141,0.12)] text-xs font-bold text-[rgba(242,207,141,0.7)]">{qi + 1}</span>
            {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                className={cn('w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors', answers[qi] === oi ? 'border-[rgba(126,200,227,0.5)] bg-[rgba(126,200,227,0.1)] text-[#c8e8f5] font-medium' : 'border-[rgba(242,207,141,0.15)] bg-[rgba(255,255,255,0.02)] text-[rgba(247,236,212,0.7)] hover:border-[rgba(242,207,141,0.3)] hover:bg-[rgba(242,207,141,0.05)]')}
              >{opt}</button>
            ))}
          </div>
        </div>
      ))}
      <Button onClick={() => setSubmitted(true)} disabled={!allAnswered} className="w-full bg-[rgba(242,207,141,0.15)] border border-[rgba(242,207,141,0.35)] text-[#f2cf8d] hover:bg-[rgba(242,207,141,0.22)] disabled:opacity-40">
        {allAnswered ? 'Проверить ответы' : `Ответьте на все вопросы (${Object.keys(answers).length}/${questions.length})`}
      </Button>
    </div>
  )
}

// ─── Детальный просмотр ──────────────────────────────────────────────────────

function ItemDetail({ item, onBack }: { item: LMSItem; onBack: () => void }) {
  return (
    <div className="leads-page-root -m-6 min-h-[calc(100vh+3rem)] lg:-m-8 lg:min-h-[calc(100vh+4rem)]">
      <div className="leads-page-bg" aria-hidden />
      <div className="leads-page-ornament" aria-hidden />
      <div className="leads-page relative z-10 p-6 lg:p-8 space-y-5 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={onBack}
            className="gap-2 text-[rgba(242,207,141,0.7)] hover:text-[#fcecc8] hover:bg-transparent px-0">
            <ArrowLeft className="size-4" />
            Обучение
          </Button>
          <span className="text-[rgba(242,207,141,0.3)]">/</span>
          <span className="text-[rgba(242,207,141,0.75)] font-medium truncate max-w-[200px]">{item.title}</span>
        </div>

        {/* Meta */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {item.targetRole !== 'all' && (
              <span className="rounded-full border border-[rgba(242,207,141,0.2)] bg-[rgba(242,207,141,0.08)] px-2.5 py-0.5 text-xs text-[rgba(242,207,141,0.65)]">
                {ROLE_LABELS[item.targetRole]}
              </span>
            )}
            {item.readTime && (
              <span className="flex items-center gap-1 text-xs text-[rgba(242,207,141,0.4)]">
                <Clock className="size-3" />{item.readTime}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#fcecc8]">{item.title}</h1>
          <p className="text-sm text-[rgba(242,207,141,0.5)]">{item.description}</p>
        </div>

        {/* Content card */}
        <div className="rounded-2xl border border-[rgba(242,207,141,0.18)] bg-[rgba(10,35,24,0.85)] shadow-xl overflow-hidden p-5 sm:p-6">
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

const COURSE_TRACKS = [
  {
    title: 'Базовый курс менеджера',
    description: 'Скрипты, воронка, CRM — полный онбординг для новичка.',
    role: 'Менеджер',
    modules: 6,
  },
  {
    title: 'Управление командой продаж',
    description: 'KPI, планёрки, разбор звонков и работа с воронкой.',
    role: 'РОП',
    modules: 5,
  },
  {
    title: 'Стратегия и финансы',
    description: 'P&L, масштабирование, партнёрская модель.',
    role: 'Директор',
    modules: 4,
  },
]

function CoursesTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-[rgba(242,207,141,0.2)] bg-[rgba(242,207,141,0.06)] px-4 py-3">
        <Lock className="size-4 text-[rgba(242,207,141,0.6)] shrink-0" />
        <p className="text-sm text-[rgba(242,207,141,0.8)] font-medium">
          Раздел курсов в разработке. Скоро здесь появятся полноценные треки обучения.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COURSE_TRACKS.map((course) => (
          <div key={course.title} className="rounded-2xl border border-dashed border-[rgba(242,207,141,0.15)] bg-[rgba(10,30,22,0.5)] p-5 relative">
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(242,207,141,0.15)] bg-[rgba(242,207,141,0.07)] px-2 py-0.5 text-[10px] font-semibold text-[rgba(242,207,141,0.4)]">
                <Lock className="size-2.5" /> Скоро
              </span>
            </div>
            <div className="space-y-3 pr-14">
              <span className="inline-block rounded-full border border-[rgba(242,207,141,0.2)] bg-[rgba(242,207,141,0.08)] px-2.5 py-0.5 text-xs font-semibold text-[rgba(242,207,141,0.65)]">
                {course.role}
              </span>
              <div>
                <p className="font-semibold text-[rgba(242,207,141,0.85)] leading-snug">{course.title}</p>
                <p className="mt-1 text-sm text-[rgba(242,207,141,0.4)]">{course.description}</p>
              </div>
              <p className="text-xs text-[rgba(242,207,141,0.3)]">{course.modules} модулей</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Главная страница ─────────────────────────────────────────────────────────

export function LMSPage() {
  const { currentUser } = useAuth()
  const { isDirectorOrAbove } = useRolePermissions()
  const userRole = currentUser?.role ?? 'manager'
  const canAdmin = isDirectorOrAbove

  const [items, setItems] = useState<LMSItem[]>(LMS_ITEMS)
  const [activeTab, setActiveTab] = useState<Tab>('articles')
  const [search, setSearch] = useState('')
  const [openItem, setOpenItem] = useState<LMSItem | null>(null)

  // Admin dialog state
  const [adminOpen, setAdminOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LMSItem | null>(null)

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
      <div className="leads-page-root -m-6 min-h-[calc(100vh+3rem)] lg:-m-8 lg:min-h-[calc(100vh+4rem)]">
        <div className="leads-page-bg" aria-hidden />
        <div className="leads-page-ornament" aria-hidden />
        <div className="leads-page relative z-10 space-y-8 p-6 lg:p-8">

          {/* Header */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[rgba(242,207,141,0.45)] mb-1">База знаний</p>
            <h1 className="text-3xl font-bold text-[#fcecc8]">Обучение</h1>
            <p className="mt-1 text-sm text-[rgba(242,207,141,0.45)]">Материалы, скрипты и презентации для работы.</p>
          </div>

          {/* Tabs + Add button */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="leads-tabs-list inline-flex h-auto rounded-full p-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSearch('') }}
                    className={cn(
                      'leads-tabs-trigger flex items-center gap-1.5 rounded-full border-0 px-4 py-2 text-sm font-medium shadow-none transition-colors',
                      activeTab === tab.id && 'leads-tabs-trigger--active'
                    )}
                    data-state={activeTab === tab.id ? 'active' : 'inactive'}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.id === 'courses' && (
                      <span className="rounded-full bg-[rgba(242,207,141,0.15)] px-1.5 py-0.5 text-[9px] font-bold text-[rgba(242,207,141,0.7)] uppercase tracking-wide">soon</span>
                    )}
                  </button>
                ))}
              </div>

              {canAdmin && activeTab !== 'courses' && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/60 transition-colors"
                >
                  <Plus className="size-4" />
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[rgba(242,207,141,0.35)]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск..."
                    className="w-full rounded-full border border-[rgba(242,207,141,0.2)] bg-[rgba(18,48,36,0.7)] pl-9 pr-4 py-2 text-sm text-[#fcecc8] placeholder-[rgba(242,207,141,0.3)] outline-none focus:border-[rgba(242,207,141,0.45)]"
                  />
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-[rgba(242,207,141,0.35)]">
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

                <p className="text-center text-xs text-[rgba(242,207,141,0.3)]">
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
        onClose={() => { setAdminOpen(false); setEditingItem(null) }}
        onSave={handleSaveItem}
      />
    </>
  )
}
