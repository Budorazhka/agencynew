import { useMemo, useState } from 'react'
import {
  AlertTriangle, CheckCircle2, Clock3, Download, Eye, FileDown,
  FilePlus2, FileText, Filter, MessageSquare, PenLine, Send,
  ShieldCheck, Workflow, X, FileSpreadsheet, FileType2,
} from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { useLeads } from '@/context/LeadsContext'
import type { LeadSource } from '@/types/leads'
import { cn } from '@/lib/utils'

type DocStatus = 'draft' | 'review' | 'signed' | 'expired' | 'blocked'
type DocType = 'deal' | 'client' | 'finance' | 'new_build'
type FileFormat = 'pdf' | 'docx' | 'xlsx'

interface DocVersion {
  version: number
  date: string
  author: string
  note: string
}

interface DocComment {
  id: string
  author: string
  text: string
  date: string
}

interface DocRow {
  id: string
  name: string
  type: DocType
  template: string
  status: DocStatus
  assignee: string
  dealRef: string
  signer: string
  leadId?: string
  leadLabel?: string
  approvalRoute: string
  updated: string
  daysInReview: number
  fileFormat: FileFormat
  fileSize: string
  pageCount: number
  versions: DocVersion[]
  comments: DocComment[]
}

const STATUS_LABEL: Record<DocStatus, string> = {
  draft: 'Черновик',
  review: 'На согласовании',
  signed: 'Подписан',
  expired: 'Просрочен',
  blocked: 'Блокирует сделку',
}

const STATUS_COLOR: Record<DocStatus, string> = {
  draft: 'text-slate-300 bg-slate-500/15 border-slate-500/30',
  review: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
  signed: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
  expired: 'text-red-300 bg-red-500/15 border-red-500/30',
  blocked: 'text-violet-300 bg-violet-500/15 border-violet-500/30',
}

const TYPE_LABEL: Record<DocType, string> = {
  deal: 'Сделка',
  client: 'Клиент',
  finance: 'Финансы',
  new_build: 'Новостройки',
}

const FORMAT_ICON: Record<FileFormat, React.ReactNode> = {
  pdf: <FileText className="size-4 text-red-400" />,
  docx: <FileType2 className="size-4 text-blue-400" />,
  xlsx: <FileSpreadsheet className="size-4 text-emerald-400" />,
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
  rent: 'Аренда',
  ad_campaigns: 'Реклама',
}

const FORM_SELECT_CLASS =
  "rounded-md border border-[var(--hub-card-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)] [color-scheme:dark]"
const FORM_INPUT_CLASS =
  "rounded-md border border-[var(--workspace-row-border)] bg-[color-mix(in_srgb,var(--rail-bg)_82%,transparent)] px-2 py-2 text-sm text-[color:var(--workspace-text)]"

const DOCS_SEED: DocRow[] = [
  {
    id: 'd1', name: 'Договор бронирования', type: 'deal', template: 'Шаблон: Бронь 2026', status: 'review',
    assignee: 'Ирина Правова', dealRef: 'deal-12', signer: 'Клиент + директор',
    leadId: 'ld-101', leadLabel: 'Лид ld-101', approvalRoute: 'Менеджер → Юрист → Директор',
    updated: '2026-04-06', daysInReview: 3, fileFormat: 'pdf', fileSize: '1.2 МБ', pageCount: 8,
    versions: [
      { version: 1, date: '2026-04-01', author: 'Ирина Правова', note: 'Первичная версия' },
      { version: 2, date: '2026-04-04', author: 'Юрист Петров', note: 'Правки по п.3.2, п.5.1' },
      { version: 3, date: '2026-04-06', author: 'Ирина Правова', note: 'Финальная редакция' },
    ],
    comments: [
      { id: 'c1', author: 'Юрист Петров', text: 'Пункт 3.2 — уточнить сроки передачи', date: '2026-04-03' },
      { id: 'c2', author: 'Ирина Правова', text: 'Исправлено, добавлено приложение 2', date: '2026-04-05' },
    ],
  },
  {
    id: 'd2', name: 'Согласие на обработку данных', type: 'client', template: 'Шаблон: ПДн', status: 'signed',
    assignee: 'Анна Первичкина', dealRef: 'deal-6', signer: 'Клиент', approvalRoute: 'Менеджер → Юрист',
    updated: '2026-04-02', daysInReview: 0, fileFormat: 'pdf', fileSize: '340 КБ', pageCount: 2,
    versions: [{ version: 1, date: '2026-03-30', author: 'Анна Первичкина', note: 'Стандартная форма' }],
    comments: [],
  },
  {
    id: 'd3', name: 'Акт приёма-передачи', type: 'deal', template: 'Шаблон: АПП', status: 'draft',
    assignee: 'Дмитрий Коваль', dealRef: 'deal-3', signer: 'Покупатель + продавец', approvalRoute: 'Менеджер → Юрист',
    updated: '2026-04-07', daysInReview: 0, fileFormat: 'docx', fileSize: '890 КБ', pageCount: 5,
    versions: [{ version: 1, date: '2026-04-07', author: 'Дмитрий Коваль', note: 'Черновик' }],
    comments: [{ id: 'c3', author: 'Дмитрий Коваль', text: 'Нужно уточнить адрес объекта', date: '2026-04-07' }],
  },
  {
    id: 'd4', name: 'Доп. соглашение к ДДУ', type: 'new_build', template: 'Шаблон: ДДУ Доп', status: 'review',
    assignee: 'Ирина Правова', dealRef: 'deal-9', signer: 'Клиент + застройщик', approvalRoute: 'Менеджер → Юрист → РОП',
    updated: '2026-04-01', daysInReview: 8, fileFormat: 'pdf', fileSize: '2.1 МБ', pageCount: 14,
    versions: [
      { version: 1, date: '2026-03-25', author: 'Ирина Правова', note: 'Первая редакция' },
      { version: 2, date: '2026-04-01', author: 'Ирина Правова', note: 'Правки по замечаниям РОП' },
    ],
    comments: [
      { id: 'c4', author: 'РОП Сидоров', text: 'Проверить сумму в приложении', date: '2026-03-28' },
      { id: 'c5', author: 'Ирина Правова', text: 'Сумма скорректирована', date: '2026-04-01' },
    ],
  },
  {
    id: 'd5', name: 'Агентский договор', type: 'deal', template: 'Шаблон: Агентский', status: 'signed',
    assignee: 'Лариса Морозова', dealRef: 'deal-1', signer: 'Агент + клиент', approvalRoute: 'Менеджер → Юрист',
    updated: '2026-03-28', daysInReview: 0, fileFormat: 'pdf', fileSize: '560 КБ', pageCount: 6,
    versions: [{ version: 1, date: '2026-03-20', author: 'Лариса Морозова', note: 'Типовая форма' }],
    comments: [],
  },
  {
    id: 'd6', name: 'Справка об оплате', type: 'finance', template: 'Шаблон: Платёжка', status: 'expired',
    assignee: 'Анна Первичкина', dealRef: 'deal-4', signer: 'Бухгалтер', approvalRoute: 'Финансы → Директор',
    updated: '2026-03-10', daysInReview: 0, fileFormat: 'xlsx', fileSize: '120 КБ', pageCount: 1,
    versions: [{ version: 1, date: '2026-03-10', author: 'Анна Первичкина', note: 'Сформирована автоматически' }],
    comments: [],
  },
  {
    id: 'd7', name: 'Уведомление о смене условий', type: 'deal', template: 'Шаблон: Уведомление', status: 'blocked',
    assignee: 'Ирина Правова', dealRef: 'deal-22', signer: 'Клиент', approvalRoute: 'Менеджер → Юрист → Директор',
    updated: '2026-04-08', daysInReview: 6, fileFormat: 'docx', fileSize: '450 КБ', pageCount: 3,
    versions: [
      { version: 1, date: '2026-04-02', author: 'Ирина Правова', note: 'Первичный текст' },
      { version: 2, date: '2026-04-08', author: 'Юрист Петров', note: 'Доработка формулировок' },
    ],
    comments: [
      { id: 'c6', author: 'Директор', text: 'Блокирует сделку — приоритет!', date: '2026-04-08' },
    ],
  },
]

function MockDocPreview({ doc }: { doc: DocRow }) {
  const lines = Array.from({ length: doc.pageCount * 6 }, (_, i) => i)
  return (
    <div className="rounded-lg border border-[var(--workspace-row-border)] bg-white/5 p-4 space-y-3 max-h-[240px] overflow-y-auto lead-history-scroll">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {FORMAT_ICON[doc.fileFormat]}
          <span className="text-xs font-bold uppercase text-[color:var(--workspace-text)]">
            {doc.fileFormat.toUpperCase()}
          </span>
        </div>
        <span className="text-[10px] text-[color:var(--app-text-muted)]">
          {doc.fileSize} · {doc.pageCount} стр.
        </span>
      </div>
      <div className="space-y-2 pt-1">
        <p className="text-sm font-bold text-[color:var(--workspace-text)]">{doc.name}</p>
        {lines.map((i) => (
          <div
            key={i}
            className="h-2 rounded"
            style={{
              width: `${55 + Math.random() * 42}%`,
              background: 'var(--workspace-row-border)',
              opacity: 0.5 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  const { state: leadsState } = useLeads()
  const [docs, setDocs] = useState<DocRow[]>(DOCS_SEED)
  const [status, setStatus] = useState<'all' | DocStatus>('all')
  const [type, setType] = useState<'all' | DocType>('all')
  const [assignee, setAssignee] = useState<string>('all')
  const [staleReview, setStaleReview] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')

  const [newDocName, setNewDocName] = useState('')
  const [newDocType, setNewDocType] = useState<DocType>('deal')
  const [newDocAssignee, setNewDocAssignee] = useState('Ирина Правова')
  const [newDocDealRef, setNewDocDealRef] = useState('')
  const [newDocTemplate, setNewDocTemplate] = useState('Шаблон: Базовый')
  const [newDocSigner, setNewDocSigner] = useState('Клиент')
  const [newDocRoute, setNewDocRoute] = useState('Менеджер → Юрист')
  const [newDocLeadId, setNewDocLeadId] = useState<string>('none')
  const [newDocFormat, setNewDocFormat] = useState<FileFormat>('pdf')

  const leadOptions = useMemo(
    () => [...leadsState.leadPool].slice(0, 120),
    [leadsState.leadPool],
  )

  const selectedDoc = useMemo(() => docs.find((d) => d.id === selectedDocId) ?? null, [docs, selectedDocId])

  const assigneeOptions = useMemo(() => Array.from(new Set(docs.map((d) => d.assignee))).sort(), [docs])
  const templates = useMemo(() => Array.from(new Set(docs.map((d) => d.template))).sort(), [docs])

  const filtered = useMemo(() => {
    let rows = [...docs]
    if (status !== 'all') rows = rows.filter((d) => d.status === status)
    if (type !== 'all') rows = rows.filter((d) => d.type === type)
    if (assignee !== 'all') rows = rows.filter((d) => d.assignee === assignee)
    if (staleReview) rows = rows.filter((d) => d.status === 'review' && d.daysInReview >= 5)
    return rows
  }, [assignee, docs, staleReview, status, type])

  const kpi = useMemo(() => {
    const review = filtered.filter((d) => d.status === 'review').length
    const signed = filtered.filter((d) => d.status === 'signed').length
    const draft = filtered.filter((d) => d.status === 'draft').length
    const expired = filtered.filter((d) => d.status === 'expired').length
    const blocked = filtered.filter((d) => d.status === 'blocked').length
    return { total: filtered.length, review, signed, draft, expired, blocked }
  }, [filtered])

  const stuck = useMemo(() => docs.filter((d) => d.status === 'review' && d.daysInReview >= 5), [docs])
  const unsigned = useMemo(() => docs.filter((d) => d.status === 'review' || d.status === 'draft').length, [docs])
  const blockingDocs = useMemo(() => docs.filter((d) => d.status === 'blocked'), [docs])

  function changeDocStatus(docId: string, newStatus: DocStatus) {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, status: newStatus, updated: new Date().toISOString().split('T')[0], daysInReview: newStatus === 'review' ? 0 : d.daysInReview }
          : d,
      ),
    )
  }

  function addComment(docId: string) {
    if (!newComment.trim()) return
    setDocs((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              comments: [
                ...d.comments,
                { id: `c-${Date.now()}`, author: 'Текущий пользователь', text: newComment.trim(), date: new Date().toISOString().split('T')[0] },
              ],
            }
          : d,
      ),
    )
    setNewComment('')
  }

  function createDocument() {
    const name = newDocName.trim()
    if (!name) return
    const nowIso = new Date().toISOString().split('T')[0]
    const linkedLead = newDocLeadId !== 'none' ? leadsState.leadPool.find((l) => l.id === newDocLeadId) : null
    const row: DocRow = {
      id: `d-${Date.now()}`,
      name,
      type: newDocType,
      template: newDocTemplate,
      status: 'draft',
      assignee: newDocAssignee,
      dealRef: newDocDealRef.trim() || (linkedLead ? `lead:${linkedLead.id}` : '—'),
      signer: newDocSigner,
      leadId: linkedLead?.id,
      leadLabel: linkedLead ? `${linkedLead.name ?? linkedLead.id} · ${SOURCE_LABELS[linkedLead.source]}` : undefined,
      approvalRoute: newDocRoute,
      updated: nowIso,
      daysInReview: 0,
      fileFormat: newDocFormat,
      fileSize: '0 КБ',
      pageCount: 1,
      versions: [{ version: 1, date: nowIso, author: newDocAssignee, note: 'Создание документа' }],
      comments: [],
    }
    setDocs((prev) => [row, ...prev])
    setNewDocName('')
    setNewDocDealRef('')
    setNewDocLeadId('none')
    setCreateOpen(false)
  }

  return (
    <DashboardShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="w-full space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Документы</h1>
              <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
                Панель управления документами: создание, согласование, подпись и просмотр.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-[var(--hub-card-border)] bg-[color:var(--workspace-row-bg)] px-3 py-2 text-sm font-semibold text-[color:var(--workspace-text)] hover:border-[var(--hub-card-border-hover)]"
            >
              <FilePlus2 className="size-4 text-[color:var(--gold)]" />
              Создать документ
            </button>
          </div>

          {/* Create form */}
          {createOpen && (
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <h2 className="mb-3 text-sm font-semibold text-[color:var(--theme-accent-heading)]">Новый документ</h2>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <input value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder="Название документа" className={FORM_INPUT_CLASS} />
                <select value={newDocType} onChange={(e) => setNewDocType(e.target.value as DocType)} className={FORM_SELECT_CLASS}>
                  <option value="deal">Сделка</option><option value="client">Клиент</option><option value="finance">Финансы</option><option value="new_build">Новостройки</option>
                </select>
                <select value={newDocFormat} onChange={(e) => setNewDocFormat(e.target.value as FileFormat)} className={FORM_SELECT_CLASS}>
                  <option value="pdf">PDF</option><option value="docx">Word (DOCX)</option><option value="xlsx">Excel (XLSX)</option>
                </select>
                <input value={newDocDealRef} onChange={(e) => setNewDocDealRef(e.target.value)} placeholder="Сделка (например: deal-34)" className={FORM_INPUT_CLASS} />
                <select value={newDocLeadId} onChange={(e) => setNewDocLeadId(e.target.value)} className={FORM_SELECT_CLASS}>
                  <option value="none">Связка лида: не выбрано</option>
                  {leadOptions.map((lead) => (<option key={lead.id} value={lead.id}>{(lead.name ?? lead.id)} · {SOURCE_LABELS[lead.source]}</option>))}
                </select>
                <input value={newDocTemplate} onChange={(e) => setNewDocTemplate(e.target.value)} placeholder="Шаблон" className={FORM_INPUT_CLASS} />
                <input value={newDocAssignee} onChange={(e) => setNewDocAssignee(e.target.value)} placeholder="Ответственный" className={FORM_INPUT_CLASS} />
                <input value={newDocSigner} onChange={(e) => setNewDocSigner(e.target.value)} placeholder="Подписант" className={FORM_INPUT_CLASS} />
                <input value={newDocRoute} onChange={(e) => setNewDocRoute(e.target.value)} placeholder="Маршрут согласования" className={`md:col-span-1 ${FORM_INPUT_CLASS}`} />
                <button type="button" onClick={createDocument} className="rounded-md border border-[var(--hub-card-border)] bg-[color:var(--workspace-row-bg)] px-3 py-2 text-sm font-semibold text-[color:var(--workspace-text)] hover:border-[var(--hub-card-border-hover)]">
                  Сохранить документ
                </button>
              </div>
            </section>
          )}

          {/* KPI row */}
          <section className="grid grid-cols-2 gap-2 md:grid-cols-6">
            {[
              { label: 'Всего', value: kpi.total, color: '' },
              { label: 'На согласовании', value: kpi.review, color: 'text-amber-300' },
              { label: 'Подписаны', value: kpi.signed, color: 'text-emerald-300' },
              { label: 'Черновики', value: kpi.draft, color: '' },
              { label: 'Просрочено', value: kpi.expired, color: 'text-red-300' },
              { label: 'Блокирующие', value: kpi.blocked, color: 'text-violet-300' },
            ].map((k) => (
              <div key={k.label} className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">{k.label}</p>
                <p className={cn("text-xl font-bold", k.color || "text-[color:var(--workspace-text)]")}>{k.value}</p>
              </div>
            ))}
          </section>

          {/* Filters */}
          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
              <select value={status} onChange={(e) => setStatus(e.target.value as 'all' | DocStatus)} className={FORM_SELECT_CLASS}>
                <option value="all">Статус: все</option><option value="draft">Черновик</option><option value="review">На согласовании</option><option value="signed">Подписан</option><option value="expired">Просрочен</option><option value="blocked">Блокирует сделку</option>
              </select>
              <select value={type} onChange={(e) => setType(e.target.value as 'all' | DocType)} className={FORM_SELECT_CLASS}>
                <option value="all">Тип: все</option><option value="deal">Сделка</option><option value="client">Клиент</option><option value="finance">Финансы</option><option value="new_build">Новостройки</option>
              </select>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={FORM_SELECT_CLASS}>
                <option value="all">Ответственный: все</option>
                {assigneeOptions.map((a) => (<option key={a} value={a}>{a}</option>))}
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]">
                <input type="checkbox" checked={staleReview} onChange={(e) => setStaleReview(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
                Долго на согласовании (5+ дн.)
              </label>
            </div>
          </section>

          {/* Main content: table + detail panel */}
          <section className={cn("grid gap-3", selectedDoc ? "grid-cols-1 xl:grid-cols-[1fr_420px]" : "grid-cols-1")}>
            {/* Documents table */}
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Реестр документов</h2>
                <span className="ml-auto text-[10px] text-[color:var(--app-text-muted)]">{filtered.length} из {docs.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                      <th className="px-2 py-2 w-8"></th>
                      <th className="px-2 py-2">Документ</th>
                      <th className="px-2 py-2">Тип</th>
                      <th className="px-2 py-2">Статус</th>
                      <th className="px-2 py-2">Формат</th>
                      <th className="px-2 py-2">Ответственный</th>
                      <th className="px-2 py-2">Обновлён</th>
                      <th className="px-2 py-2 text-center">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((doc) => (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id === selectedDocId ? null : doc.id)}
                        className={cn(
                          "border-b border-[color:var(--workspace-row-border)] cursor-pointer transition-colors",
                          doc.id === selectedDocId
                            ? "bg-[rgba(212,175,85,0.12)]"
                            : "hover:bg-[rgba(212,175,85,0.06)]"
                        )}
                      >
                        <td className="px-2 py-2">{FORMAT_ICON[doc.fileFormat]}</td>
                        <td className="px-2 py-2">
                          <p className="font-medium text-[color:var(--workspace-text)]">{doc.name}</p>
                          <p className="text-[10px] text-[color:var(--app-text-muted)]">{doc.template} · {doc.fileSize}</p>
                        </td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{TYPE_LABEL[doc.type]}</td>
                        <td className="px-2 py-2">
                          <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold", STATUS_COLOR[doc.status])}>
                            {STATUS_LABEL[doc.status]}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-[11px] font-bold uppercase text-[color:var(--workspace-text-muted)]">{doc.fileFormat}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text)]">{doc.assignee}</td>
                        <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{doc.updated}</td>
                        <td className="px-2 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedDocId(doc.id) }}
                              className="rounded-md p-1.5 text-[color:var(--app-text-muted)] hover:text-[color:var(--workspace-text)] hover:bg-[var(--workspace-row-bg)] transition-colors"
                              title="Просмотр"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation() }}
                              className="rounded-md p-1.5 text-[color:var(--app-text-muted)] hover:text-[color:var(--workspace-text)] hover:bg-[var(--workspace-row-bg)] transition-colors"
                              title="Скачать"
                            >
                              <Download className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail side panel */}
            {selectedDoc && (
              <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-4 space-y-4 overflow-y-auto max-h-[80vh] lead-history-scroll">
                {/* Panel header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {FORMAT_ICON[selectedDoc.fileFormat]}
                      <h2 className="text-base font-bold text-[color:var(--theme-accent-heading)] truncate">{selectedDoc.name}</h2>
                    </div>
                    <p className="text-xs text-[color:var(--app-text-muted)]">{selectedDoc.template} · {selectedDoc.fileSize} · {selectedDoc.pageCount} стр.</p>
                  </div>
                  <button onClick={() => setSelectedDocId(null)} className="shrink-0 rounded-md p-1 text-[color:var(--app-text-muted)] hover:text-[color:var(--workspace-text)] transition-colors">
                    <X className="size-4" />
                  </button>
                </div>

                {/* Status + actions */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold", STATUS_COLOR[selectedDoc.status])}>
                      <ShieldCheck className="size-3.5" />
                      {STATUS_LABEL[selectedDoc.status]}
                    </span>
                    <span className="text-[10px] text-[color:var(--app-text-muted)]">
                      {selectedDoc.daysInReview > 0 ? `${selectedDoc.daysInReview} дн. в согласовании` : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoc.status === 'draft' && (
                      <button onClick={() => changeDocStatus(selectedDoc.id, 'review')} className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors">
                        Отправить на согласование
                      </button>
                    )}
                    {selectedDoc.status === 'review' && (
                      <>
                        <button onClick={() => changeDocStatus(selectedDoc.id, 'signed')} className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors">
                          Подписать
                        </button>
                        <button onClick={() => changeDocStatus(selectedDoc.id, 'draft')} className="rounded-md border border-slate-500/30 bg-slate-500/10 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-500/20 transition-colors">
                          Вернуть на доработку
                        </button>
                      </>
                    )}
                    {(selectedDoc.status === 'expired' || selectedDoc.status === 'blocked') && (
                      <button onClick={() => changeDocStatus(selectedDoc.id, 'review')} className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors">
                        Отправить повторно
                      </button>
                    )}
                    <button className="rounded-md border border-[var(--hub-card-border)] bg-[var(--workspace-row-bg)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--workspace-text)] hover:border-[var(--hub-card-border-hover)] transition-colors flex items-center gap-1">
                      <FileDown className="size-3" /> Скачать
                    </button>
                  </div>
                </div>

                {/* Doc info grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    ['Тип', TYPE_LABEL[selectedDoc.type]],
                    ['Формат', selectedDoc.fileFormat.toUpperCase()],
                    ['Сделка', selectedDoc.dealRef],
                    ['Подписант', selectedDoc.signer],
                    ['Ответственный', selectedDoc.assignee],
                    ['Маршрут', selectedDoc.approvalRoute],
                    ['Лид', selectedDoc.leadLabel ?? '—'],
                    ['Обновлён', selectedDoc.updated],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-1.5">
                      <p className="text-[9px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">{label}</p>
                      <p className="font-medium text-[color:var(--workspace-text)] truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {/* File preview */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Eye className="size-4 text-[color:var(--gold)]" />
                    <h3 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Предпросмотр</h3>
                  </div>
                  <MockDocPreview doc={selectedDoc} />
                </div>

                {/* Version history */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Workflow className="size-4 text-amber-300" />
                    <h3 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">История версий</h3>
                  </div>
                  <div className="space-y-1.5">
                    {selectedDoc.versions.map((v) => (
                      <div key={v.version} className="flex items-start gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2.5 py-1.5">
                        <span className="shrink-0 flex size-5 items-center justify-center rounded-full bg-[color:var(--gold)] text-[9px] font-bold text-black">
                          {v.version}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-[color:var(--workspace-text)]">{v.note}</p>
                          <p className="text-[10px] text-[color:var(--app-text-muted)]">{v.author} · {v.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <MessageSquare className="size-4 text-sky-400" />
                    <h3 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Комментарии</h3>
                    <span className="text-[10px] text-[color:var(--app-text-muted)]">{selectedDoc.comments.length}</span>
                  </div>
                  <div className="space-y-1.5 mb-2">
                    {selectedDoc.comments.length === 0 && (
                      <p className="text-[11px] text-[color:var(--app-text-muted)] italic">Комментариев пока нет</p>
                    )}
                    {selectedDoc.comments.map((c) => (
                      <div key={c.id} className="rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2.5 py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-semibold text-[color:var(--workspace-text)]">{c.author}</p>
                          <p className="text-[9px] text-[color:var(--app-text-muted)]">{c.date}</p>
                        </div>
                        <p className="text-[11px] text-[color:var(--workspace-text-muted)] mt-0.5">{c.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addComment(selectedDoc.id) }}
                      placeholder="Написать комментарий..."
                      className={cn(FORM_INPUT_CLASS, "flex-1 py-1.5 text-[11px]")}
                    />
                    <button
                      onClick={() => addComment(selectedDoc.id)}
                      className="shrink-0 rounded-md border border-sky-500/30 bg-sky-500/10 p-1.5 text-sky-300 hover:bg-sky-500/20 transition-colors"
                    >
                      <Send className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Approval route visualization */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-300" />
                    <h3 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Маршрут согласования</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoc.approvalRoute.split('→').map((step, ix, arr) => {
                      const currentIx = selectedDoc.status === 'draft' ? -1 : selectedDoc.status === 'signed' ? arr.length : Math.min(ix, arr.length - 1)
                      return (
                        <span
                          key={ix}
                          className={cn(
                            "rounded-md border px-2.5 py-1 text-[11px] font-semibold",
                            ix < currentIx
                              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                              : ix === currentIx
                                ? "border-amber-400/40 bg-amber-500/15 text-amber-200"
                                : "border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] text-[color:var(--workspace-text-muted)]"
                          )}
                        >
                          {step.trim()}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Signals + templates (below table) */}
          <section className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <PenLine className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Шаблоны</h2>
              </div>
              <ul className="space-y-1.5">
                {templates.slice(0, 6).map((tpl) => (
                  <li key={tpl} className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2.5 py-1.5 text-sm text-[color:var(--workspace-text)]">{tpl}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <Workflow className="size-4 text-amber-300" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Маршруты</h2>
              </div>
              <ul className="space-y-1.5">
                {Array.from(new Set(docs.map((d) => d.approvalRoute))).slice(0, 4).map((route) => (
                  <li key={route} className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2.5 py-1.5 text-sm text-[color:var(--workspace-text)]">{route}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Сигналы</h2>
              </div>
              <ul className="space-y-1.5">
                {stuck.map((d) => (
                  <li key={d.id} className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-sm text-amber-200">
                    <Clock3 className="mr-1 inline size-3.5" />{d.name} · {d.daysInReview} дн.
                  </li>
                ))}
                {blockingDocs.map((d) => (
                  <li key={d.id} className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5 text-sm text-violet-200">
                    <AlertTriangle className="mr-1 inline size-3.5" />{d.name} · блокирует {d.dealRef}
                  </li>
                ))}
                {kpi.expired > 0 && (
                  <li className="rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-sm text-red-200">
                    <AlertTriangle className="mr-1 inline size-3.5" />Просроченных: {kpi.expired}
                  </li>
                )}
                {stuck.length === 0 && blockingDocs.length === 0 && kpi.expired === 0 && (
                  <li className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 text-sm text-emerald-200">
                    <CheckCircle2 className="mr-1 inline size-3.5" />Критичных сигналов нет
                  </li>
                )}
              </ul>
            </div>
          </section>

          {/* Unsigned count */}
          <div className="text-[10px] text-[color:var(--app-text-muted)] text-right">
            Неподписанных документов: {unsigned}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
