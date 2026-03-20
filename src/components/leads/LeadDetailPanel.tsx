import { useState } from 'react'
import {
  X,
  MessageSquare,
  ArrowRight,
  Plus,
  Phone,
  FileText,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ListTodo,
} from 'lucide-react'
import { useLeads } from '@/context/LeadsContext'
import { LEAD_STAGES, LEAD_STAGE_COLUMN } from '@/data/leads-mock'
import type { Lead, LeadEventType, TaskSetByRole } from '@/types/leads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { BuyerRegistrationForm } from './BuyerRegistrationForm'

const TASK_SET_BY_ROLE_LABEL: Record<TaskSetByRole, string> = {
  owner: 'Собственник',
  director: 'Директор',
  rop: 'РОП',
}

function UrgentMarkIcon({ active }: { active: boolean }) {
  const color = active ? '#ff3b30' : '#475569'

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3 shrink-0"
      fill={active ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  )
}

function ImportantMarkIcon({ active }: { active: boolean }) {
  const color = active ? '#f2a900' : '#475569'

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3 shrink-0"
      fill={active ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  )
}

const SOURCE_LABEL: Record<string, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
  rent: 'Аренда',
  ad_campaigns: 'Реклама',
}

const EVENT_ICON: Record<LeadEventType, React.ReactNode> = {
  created: <Plus className="w-3.5 h-3.5" />,
  stage_change: <ArrowRight className="w-3.5 h-3.5" />,
  comment: <MessageSquare className="w-3.5 h-3.5" />,
  buyer_registration: <FileText className="w-3.5 h-3.5" />,
  call: <Phone className="w-3.5 h-3.5" />,
  task: <CheckCircle2 className="w-3.5 h-3.5" />,
  task_created: <ListTodo className="w-3.5 h-3.5" />,
  task_completed: <CheckCircle2 className="w-3.5 h-3.5" />,
  overdue: <AlertTriangle className="w-3.5 h-3.5" />,
  assign: <User className="w-3.5 h-3.5" />,
}

const EVENT_COLOR: Record<LeadEventType, string> = {
  created: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  stage_change: 'bg-blue-100 text-blue-600 border-blue-200',
  comment: 'bg-slate-100 text-slate-500 border-slate-200',
  buyer_registration: 'bg-amber-100 text-amber-600 border-amber-200',
  call: 'bg-violet-100 text-violet-600 border-violet-200',
  task: 'bg-teal-100 text-teal-600 border-teal-200',
  task_created: 'bg-teal-100 text-teal-600 border-teal-200',
  task_completed: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  overdue: 'bg-rose-100 text-rose-600 border-rose-200',
  assign: 'bg-orange-100 text-orange-600 border-orange-200',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function LeadDetailPanel({
  lead,
  onClose,
}: {
  lead: Lead
  onClose: () => void
}) {
  const { state, dispatch, getLeadWithHistory } = useLeads()
  const leadWithHistory = getLeadWithHistory(lead.id)
  const [comment, setComment] = useState('')
  const [showRegForm, setShowRegForm] = useState(false)

  const manager = state.leadManagers.find((m) => m.id === lead.managerId)
  const stage = LEAD_STAGES.find((s) => s.id === lead.stageId)
  const columnId = LEAD_STAGE_COLUMN[lead.stageId]

  const columnColor =
    columnId === 'rejection'
      ? 'text-rose-600 bg-rose-50 border-rose-200'
      : columnId === 'success'
        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
        : 'text-blue-700 bg-blue-50 border-blue-200'

  function addComment() {
    if (!comment.trim()) return
    dispatch({
      type: 'ADD_LEAD_EVENT',
      leadId: lead.id,
      event: {
        id: `evt-${Date.now()}`,
        type: 'comment',
        timestamp: new Date().toISOString(),
        authorId: 'current-user',
        authorName: 'Вы',
        payload: { comment: comment.trim() },
      },
    })
    setComment('')
  }

  const history = leadWithHistory?.history ?? []
  const registrations = leadWithHistory?.registrations ?? []

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
            {SOURCE_LABEL[lead.source] ?? lead.source}
            {' · '}
            <span className="font-mono text-slate-300">{lead.id}</span>
          </p>
          <h2 className="text-xl font-bold text-slate-900 leading-tight truncate">
            {lead.name ?? 'Без имени'}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', columnColor)}>
              {stage?.name ?? lead.stageId}
            </span>
            {lead.taskOverdue && (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600">
                <Clock className="w-3 h-3" />
                Просрочка
              </span>
            )}
            {!lead.managerId && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                <AlertTriangle className="w-3 h-3" />
                Не назначен
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-0.5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-5">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Менеджер</p>
          <p className="text-sm font-semibold text-slate-800">
            {manager ? manager.name : <span className="text-slate-400 font-normal italic">Не назначен</span>}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Поступил</p>
          <p className="text-sm font-semibold text-slate-800">
            {new Date(lead.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        {lead.commissionUsd != null && (
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Комиссия</p>
            <p className="text-sm font-bold text-emerald-700">
              ${lead.commissionUsd.toLocaleString('en-US')}
            </p>
          </div>
        )}
        {lead.channel && (
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Канал</p>
            <p className="text-sm font-semibold text-slate-800 capitalize">{lead.channel}</p>
          </div>
        )}
      </div>

      {/* Registrations */}
      {registrations.length > 0 && (
        <div className="border-b border-slate-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
            Регистрации покупателя
          </p>
          <div className="space-y-2">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">{reg.projectName}</span>
                </div>
                <p className="text-xs text-amber-700">
                  {reg.clientName} · {reg.managerName} · {new Date(reg.date).toLocaleDateString('ru-RU')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
          История
        </p>

        {history.length === 0 && (
          <p className="text-sm text-slate-400 italic py-4 text-center">
            История событий пока пуста
          </p>
        )}

        {[...history].reverse().map((event) => (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn(
                'w-6 h-6 rounded-full border flex items-center justify-center shrink-0',
                EVENT_COLOR[event.type],
              )}>
                {EVENT_ICON[event.type]}
              </span>
              <div className="w-px flex-1 bg-slate-100 mt-1" />
            </div>
            <div className="min-w-0 pb-3">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-slate-700">{event.authorName}</span>
                <span className="text-xs text-slate-400">{formatDate(event.timestamp)}</span>
              </div>
              {event.type === 'stage_change' && (
                <p className="text-sm text-slate-600">
                  Переведён:{' '}
                  <span className="font-medium">{event.payload.fromStageName ?? event.payload.fromStage ?? '—'}</span>
                  {' → '}
                  <span className="font-medium text-blue-700">{event.payload.toStageName ?? event.payload.toStage ?? '—'}</span>
                </p>
              )}
              {event.type === 'comment' && (
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  {event.payload.comment}
                </p>
              )}
              {event.type === 'buyer_registration' && event.payload.registrationData && (
                <p className="text-sm text-amber-700">
                  Акт осмотра: <span className="font-medium">{event.payload.registrationData.projectName}</span>
                </p>
              )}
              {event.type === 'created' && (
                <p className="text-sm text-slate-600">Лид добавлен в систему</p>
              )}
              {event.type === 'call' && (
                <p className="text-sm text-slate-600">{event.payload.comment ?? 'Звонок'}</p>
              )}
              {event.type === 'assign' && (
                <p className="text-sm text-slate-600">
                  Назначен менеджер: <span className="font-medium">{event.payload.managerName}</span>
                </p>
              )}
              {event.type === 'task_created' && (
                <div className="text-sm text-slate-700">
                  {event.payload.setByRole && (
                    <p className="text-xs text-slate-500 mb-0.5">
                      Задача поставлена: {TASK_SET_BY_ROLE_LABEL[event.payload.setByRole]} {event.authorName}
                    </p>
                  )}
                  <p className="font-medium text-slate-900">{event.payload.taskName}</p>
                  {(event.payload.eisenhowerUrgent !== undefined || event.payload.eisenhowerImportant !== undefined) && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border",
                        event.payload.eisenhowerUrgent === true
                          ? "bg-rose-50 text-rose-700 border-rose-300"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        <UrgentMarkIcon active={event.payload.eisenhowerUrgent === true} />
                        {event.payload.eisenhowerUrgent === true ? "Срочно" : "Не срочно"}
                      </span>
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border",
                        event.payload.eisenhowerImportant === true
                          ? "bg-yellow-50 text-yellow-800 border-yellow-300"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        <ImportantMarkIcon active={event.payload.eisenhowerImportant === true} />
                        {event.payload.eisenhowerImportant === true ? "Важно" : "Не важно"}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {event.type === 'task_completed' && (
                <p className="text-sm text-slate-500 line-through">{event.payload.taskName}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions footer */}
      <div className="border-t border-slate-100 p-4 space-y-3">
        {showRegForm ? (
          <BuyerRegistrationForm
            lead={lead}
            onClose={() => setShowRegForm(false)}
          />
        ) : (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Добавить комментарий..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addComment()}
                className="flex-1 text-sm"
              />
              <Button size="sm" onClick={addComment} disabled={!comment.trim()}>
                <MessageSquare className="w-3.5 h-3.5" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50"
              onClick={() => setShowRegForm(true)}
            >
              <FileText className="w-3.5 h-3.5" />
              Регистрация покупателя
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
