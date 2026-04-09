import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, FilePlus2, FileText, Filter, PenLine, ShieldCheck, Workflow } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { useLeads } from '@/context/LeadsContext'
import type { LeadSource } from '@/types/leads'

type DocStatus = 'draft' | 'review' | 'signed' | 'expired' | 'blocked'
type DocType = 'deal' | 'client' | 'finance' | 'new_build'

const STATUS_LABEL: Record<DocStatus, string> = {
  draft: 'Черновик',
  review: 'На согласовании',
  signed: 'Подписан',
  expired: 'Просрочен',
  blocked: 'Блокирует сделку',
}

const TYPE_LABEL: Record<DocType, string> = {
  deal: 'Сделка',
  client: 'Клиент',
  finance: 'Финансы',
  new_build: 'Новостройки',
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

const DOCS_SEED: Array<{
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
}> = [
  { id: 'd1', name: 'Договор бронирования', type: 'deal', template: 'Шаблон: Бронь 2026', status: 'review', assignee: 'Ирина Правова', dealRef: 'deal-12', signer: 'Клиент + директор', leadId: 'ld-101', leadLabel: 'Лид ld-101', approvalRoute: 'Менеджер → Юрист → Директор', updated: '2026-04-06', daysInReview: 3 },
  { id: 'd2', name: 'Согласие на обработку данных', type: 'client', template: 'Шаблон: ПДн', status: 'signed', assignee: 'Анна Первичкина', dealRef: 'deal-6', signer: 'Клиент', approvalRoute: 'Менеджер → Юрист', updated: '2026-04-02', daysInReview: 0 },
  { id: 'd3', name: 'Акт приёма-передачи', type: 'deal', template: 'Шаблон: АПП', status: 'draft', assignee: 'Дмитрий Коваль', dealRef: 'deal-3', signer: 'Покупатель + продавец', approvalRoute: 'Менеджер → Юрист', updated: '2026-04-07', daysInReview: 0 },
  { id: 'd4', name: 'Доп. соглашение к ДДУ', type: 'new_build', template: 'Шаблон: ДДУ Доп', status: 'review', assignee: 'Ирина Правова', dealRef: 'deal-9', signer: 'Клиент + застройщик', approvalRoute: 'Менеджер → Юрист → РОП', updated: '2026-04-01', daysInReview: 8 },
  { id: 'd5', name: 'Агентский договор', type: 'deal', template: 'Шаблон: Агентский', status: 'signed', assignee: 'Лариса Морозова', dealRef: 'deal-1', signer: 'Агент + клиент', approvalRoute: 'Менеджер → Юрист', updated: '2026-03-28', daysInReview: 0 },
  { id: 'd6', name: 'Справка об оплате', type: 'finance', template: 'Шаблон: Платёжка', status: 'expired', assignee: 'Анна Первичкина', dealRef: 'deal-4', signer: 'Бухгалтер', approvalRoute: 'Финансы → Директор', updated: '2026-03-10', daysInReview: 0 },
  { id: 'd7', name: 'Уведомление о смене условий', type: 'deal', template: 'Шаблон: Уведомление', status: 'blocked', assignee: 'Ирина Правова', dealRef: 'deal-22', signer: 'Клиент', approvalRoute: 'Менеджер → Юрист → Директор', updated: '2026-04-08', daysInReview: 6 },
]

export default function DocumentsPage() {
  const { state: leadsState } = useLeads()
  const [docs, setDocs] = useState(DOCS_SEED)
  const [status, setStatus] = useState<'all' | DocStatus>('all')
  const [type, setType] = useState<'all' | DocType>('all')
  const [assignee, setAssignee] = useState<string>('all')
  const [staleReview, setStaleReview] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [newDocType, setNewDocType] = useState<DocType>('deal')
  const [newDocAssignee, setNewDocAssignee] = useState('Ирина Правова')
  const [newDocDealRef, setNewDocDealRef] = useState('')
  const [newDocTemplate, setNewDocTemplate] = useState('Шаблон: Базовый')
  const [newDocSigner, setNewDocSigner] = useState('Клиент')
  const [newDocRoute, setNewDocRoute] = useState('Менеджер → Юрист')
  const [newDocLeadId, setNewDocLeadId] = useState<string>('none')
  const leadOptions = useMemo(
    () => [...leadsState.leadPool].slice(0, 120),
    [leadsState.leadPool],
  )

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
  const ownerApprovalDocs = useMemo(() => {
    const queue = docs.filter((d) => d.status === 'review' || d.status === 'draft')
    return queue.slice(0, 5)
  }, [docs])

  function createDocument() {
    const name = newDocName.trim()
    if (!name) return
    const nowIso = new Date().toISOString().split('T')[0]
    const linkedLead = newDocLeadId !== 'none' ? leadsState.leadPool.find((l) => l.id === newDocLeadId) : null
    const row = {
      id: `d-${Date.now()}`,
      name,
      type: newDocType,
      template: newDocTemplate,
      status: 'draft' as const,
      assignee: newDocAssignee,
      dealRef: newDocDealRef.trim() || (linkedLead ? `lead:${linkedLead.id}` : '—'),
      signer: newDocSigner,
      leadId: linkedLead?.id,
      leadLabel: linkedLead ? `${linkedLead.name ?? linkedLead.id} · ${SOURCE_LABELS[linkedLead.source]}` : undefined,
      approvalRoute: newDocRoute,
      updated: nowIso,
      daysInReview: 0,
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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
            <h1 className="text-xl font-bold text-[color:var(--theme-accent-heading)]">Документы</h1>
            <p className="mt-1 text-sm text-[color:var(--app-text-muted)]">
                Панель управления документами: создание, согласование и подпись.
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

          {createOpen ? (
            <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <h2 className="mb-3 text-sm font-semibold text-[color:var(--theme-accent-heading)]">Новый документ</h2>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <input
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="Название документа"
                  className={FORM_INPUT_CLASS}
                />
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as DocType)}
                  className={FORM_SELECT_CLASS}
                >
                  <option value="deal">Сделка</option>
                  <option value="client">Клиент</option>
                  <option value="finance">Финансы</option>
                  <option value="new_build">Новостройки</option>
                </select>
                <input
                  value={newDocDealRef}
                  onChange={(e) => setNewDocDealRef(e.target.value)}
                  placeholder="Сделка (например: deal-34)"
                  className={FORM_INPUT_CLASS}
                />
                <select
                  value={newDocLeadId}
                  onChange={(e) => setNewDocLeadId(e.target.value)}
                  className={FORM_SELECT_CLASS}
                >
                  <option value="none">Связка лида: не выбрано</option>
                  {leadOptions.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {(lead.name ?? lead.id)} · {SOURCE_LABELS[lead.source]}
                    </option>
                  ))}
                </select>
                <input
                  value={newDocTemplate}
                  onChange={(e) => setNewDocTemplate(e.target.value)}
                  placeholder="Шаблон"
                  className={FORM_INPUT_CLASS}
                />
                <input
                  value={newDocAssignee}
                  onChange={(e) => setNewDocAssignee(e.target.value)}
                  placeholder="Ответственный"
                  className={FORM_INPUT_CLASS}
                />
                <input
                  value={newDocSigner}
                  onChange={(e) => setNewDocSigner(e.target.value)}
                  placeholder="Подписант"
                  className={FORM_INPUT_CLASS}
                />
                <input
                  value={newDocRoute}
                  onChange={(e) => setNewDocRoute(e.target.value)}
                  placeholder="Маршрут согласования"
                  className={`md:col-span-2 ${FORM_INPUT_CLASS}`}
                />
                <button
                  type="button"
                  onClick={createDocument}
                  className="rounded-md border border-[var(--hub-card-border)] bg-[color:var(--workspace-row-bg)] px-3 py-2 text-sm font-semibold text-[color:var(--workspace-text)] hover:border-[var(--hub-card-border-hover)]"
                >
                  Сохранить документ
                </button>
              </div>
            </section>
          ) : null}

          <section className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-[10px] uppercase text-red-200">Просроченные документы</p>
              <p className="mt-1 text-2xl font-bold text-red-300">{kpi.expired}</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-[10px] uppercase text-amber-200">Неподписанные документы</p>
              <p className="mt-1 text-2xl font-bold text-amber-300">{unsigned}</p>
            </div>
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-3">
              <p className="text-[10px] uppercase text-violet-200">Блокирующие документы</p>
              <p className="mt-1 text-2xl font-bold text-violet-300">{kpi.blocked}</p>
            </div>
          </section>

          <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="size-4 text-[color:var(--gold)]" />
              <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Фильтры</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'all' | DocStatus)}
                className={FORM_SELECT_CLASS}
              >
                <option value="all">Статус: все</option>
                <option value="draft">Черновик</option>
                <option value="review">На согласовании</option>
                <option value="signed">Подписан</option>
                <option value="expired">Просрочен</option>
                <option value="blocked">Блокирует сделку</option>
              </select>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'all' | DocType)}
                className={FORM_SELECT_CLASS}
              >
                <option value="all">Тип: все</option>
                <option value="deal">Сделка</option>
                <option value="client">Клиент</option>
                <option value="finance">Финансы</option>
                <option value="new_build">Новостройки</option>
              </select>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className={FORM_SELECT_CLASS}
              >
                <option value="all">Ответственный: все</option>
                {assigneeOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-2 text-sm text-[color:var(--workspace-text)]">
                <input type="checkbox" checked={staleReview} onChange={(e) => setStaleReview(e.target.checked)} className="rounded border-[var(--workspace-row-border)]" />
                Долго на согласовании (5+ дн.)
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 md:grid-cols-6">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">В выборке</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.total}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">На согласовании</p>
              <p className="text-xl font-bold text-amber-300">{kpi.review}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Подписаны</p>
              <p className="text-xl font-bold text-emerald-300">{kpi.signed}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Черновики</p>
              <p className="text-xl font-bold text-[color:var(--workspace-text)]">{kpi.draft}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Просрочено</p>
              <p className="text-xl font-bold text-red-300">{kpi.expired}</p>
            </div>
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Блокирующие</p>
              <p className="text-xl font-bold text-violet-300">{kpi.blocked}</p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.55fr_1.45fr]">
            <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="size-4 text-[color:var(--gold)]" />
                <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Реестр документов</h2>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--workspace-row-border)] text-left text-[11px] uppercase tracking-wide text-[color:var(--app-text-subtle)]">
                    <th className="px-2 py-2">Документ</th>
                    <th className="px-2 py-2">Тип</th>
                    <th className="px-2 py-2">Шаблон</th>
                    <th className="px-2 py-2">Статус</th>
                    <th className="px-2 py-2">Сделка</th>
                    <th className="px-2 py-2">Связка лида</th>
                    <th className="px-2 py-2">Ответственный</th>
                    <th className="px-2 py-2">Подписант</th>
                    <th className="px-2 py-2">Обновлён</th>
                    <th className="px-2 py-2">Дней в согласовании</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="border-b border-[color:var(--workspace-row-border)]">
                      <td className="px-2 py-2 font-medium text-[color:var(--workspace-text)]">{doc.name}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{TYPE_LABEL[doc.type]}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{doc.template}</td>
                      <td className="px-2 py-2">
                        <span className="inline-flex items-center gap-1 text-[color:var(--workspace-text)]">
                          <ShieldCheck className="size-3.5 text-[color:var(--gold)]" />
                          {STATUS_LABEL[doc.status]}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{doc.dealRef}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{doc.leadLabel ?? '—'}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{doc.assignee}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text)]">{doc.signer}</td>
                      <td className="px-2 py-2 text-[color:var(--workspace-text-muted)]">{doc.updated}</td>
                      <td className={doc.daysInReview >= 5 ? 'px-2 py-2 text-amber-300' : 'px-2 py-2 text-[color:var(--workspace-text)]'}>
                        {doc.status === 'review' ? doc.daysInReview : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            <div className="space-y-3">
              <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <PenLine className="size-4 text-[color:var(--gold)]" />
                  <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Шаблоны</h2>
                </div>
                <ul className="space-y-1.5">
                  {templates.slice(0, 6).map((tpl) => (
                    <li key={tpl} className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2.5 py-1.5 text-sm text-[color:var(--workspace-text)]">
                      {tpl}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Workflow className="size-4 text-amber-300" />
                  <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Маршруты согласования</h2>
                </div>
                <ul className="space-y-1.5">
                  {Array.from(new Set(docs.map((d) => d.approvalRoute))).slice(0, 4).map((route) => (
                    <li key={route} className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2.5 py-1.5 text-sm text-[color:var(--workspace-text)]">
                      {route}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-300" />
                  <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Согласование (роль: собственник)</h2>
                </div>
                <ul className="space-y-2">
                  {ownerApprovalDocs.map((doc) => {
                    const routeSteps = doc.approvalRoute.split('→').map((step) => step.trim()).filter(Boolean)
                    const ownerStepIx = routeSteps.findIndex((step) => /директор|роп|собственник/i.test(step))
                    const currentStepIx = doc.status === 'draft' ? 0 : ownerStepIx >= 0 ? ownerStepIx : Math.max(0, routeSteps.length - 1)
                    return (
                      <li key={doc.id} className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-2">
                        <p className="text-sm font-semibold text-[color:var(--workspace-text)]">{doc.name}</p>
                        <p className="mt-0.5 text-xs text-[color:var(--workspace-text-muted)]">
                          {doc.dealRef} · {doc.signer}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {routeSteps.map((step, ix) => (
                            <span
                              key={`${doc.id}-${step}-${ix}`}
                              className={
                                ix === currentStepIx
                                  ? 'rounded-md border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-200'
                                  : ix < currentStepIx
                                    ? 'rounded-md border border-sky-400/35 bg-sky-500/15 px-2 py-0.5 text-[11px] text-sky-200'
                                    : 'rounded-md border border-[color:var(--workspace-row-border)] bg-[color:var(--workspace-row-bg)] px-2 py-0.5 text-[11px] text-[color:var(--workspace-text-muted)]'
                              }
                            >
                              {step}
                            </span>
                          ))}
                        </div>
                      </li>
                    )
                  })}
                  {ownerApprovalDocs.length === 0 ? (
                    <li className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 text-sm text-emerald-200">
                      <CheckCircle2 className="mr-1 inline size-3.5" />
                      В очереди согласования пусто
                    </li>
                  ) : null}
                </ul>
              </section>

              <section className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-400" />
                  <h2 className="text-sm font-semibold text-[color:var(--theme-accent-heading)]">Ключевые сигналы</h2>
                </div>
                <ul className="space-y-2">
                  {stuck.map((d) => (
                    <li key={d.id} className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-sm text-amber-200">
                      <Clock3 className="mr-1 inline size-3.5" />
                      {d.name} · {d.daysInReview} дн. в согласовании
                    </li>
                  ))}
                  {blockingDocs.map((d) => (
                    <li key={d.id} className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5 text-sm text-violet-200">
                      <AlertTriangle className="mr-1 inline size-3.5" />
                      {d.name} · блокирует {d.dealRef}
                    </li>
                  ))}
                  {kpi.expired > 0 ? (
                    <li className="rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-sm text-red-200">
                      <AlertTriangle className="mr-1 inline size-3.5" />
                      Просроченных документов: {kpi.expired}
                    </li>
                  ) : null}
                  {stuck.length === 0 && blockingDocs.length === 0 && kpi.expired === 0 ? (
                    <li className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 text-sm text-emerald-200">
                      <CheckCircle2 className="mr-1 inline size-3.5" />
                      Критичных сигналов нет
                    </li>
                  ) : null}
                </ul>
              </section>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}
