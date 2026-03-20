"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { format, isToday, isYesterday } from "date-fns"
import { ru } from "date-fns/locale"
import {
  MessageSquare,
  Phone,
  CheckSquare,
  ArrowUpRight,
  UserPlus,
  CalendarDays,
  Send,
  Plus,
  AlertTriangle,
  Clock,
  ListTodo,
  MoreHorizontal,
  Trash2,
  Pencil,
  ListFilter,
} from "lucide-react"

import { useLeads } from "@/context/LeadsContext"
import type { LeadEvent, LeadEventType, TaskSetByRole } from "@/types/leads"
import { LEAD_STAGES } from "@/data/leads-mock"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/context/AuthContext"
import { useRolePermissions } from "@/hooks/useRolePermissions"

const TASK_EVENT_TYPES: LeadEventType[] = ['task_created', 'task', 'task_completed', 'overdue']

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
      className="size-3.5 shrink-0"
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
      className="size-3.5 shrink-0"
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

/** Чипы срочности и важности в стиле дизайна: красный/серый (молния), жёлтый/серый (закладка) */
function EisenhowerChips({
  urgent,
  important,
  onChangeUrgent,
  onChangeImportant,
  readOnly,
}: {
  urgent: boolean
  important: boolean
  onChangeUrgent?: (v: boolean) => void
  onChangeImportant?: (v: boolean) => void
  readOnly?: boolean
}) {
  const isInteractive = !readOnly && (onChangeUrgent != null || onChangeImportant != null)

  /* Цвета по референсу: срочно — красно-розовый, важно — жёлтый, не выбран — серый */
  const urgentActive = "bg-rose-50 text-[#ff3b30] border-rose-200"
  const urgentInactive = "bg-slate-100 text-slate-700 border-slate-200"
  const importantActive = "bg-amber-50 text-[#f2a900] border-amber-200"
  const importantInactive = "bg-slate-100 text-slate-700 border-slate-200"

  if (readOnly) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
          urgent ? urgentActive : urgentInactive
        )}>
          <UrgentMarkIcon active={urgent} />
          {urgent ? "Срочно" : "Не срочно"}
        </span>
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
          important ? importantActive : importantInactive
        )}>
          <ImportantMarkIcon active={important} />
          {important ? "Важно" : "Не важно"}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => onChangeUrgent?.(true)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-r border-slate-200",
            urgent ? urgentActive : "bg-slate-50 text-slate-700",
            isInteractive && "hover:opacity-90 cursor-pointer"
          )}
        >
          <UrgentMarkIcon active />
          Срочно
        </button>
        <button
          type="button"
          onClick={() => onChangeUrgent?.(false)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
            !urgent ? urgentInactive : "bg-white text-slate-500",
            isInteractive && "hover:opacity-90 cursor-pointer"
          )}
        >
          <UrgentMarkIcon active={false} />
          Не срочно
        </button>
      </div>
      <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => onChangeImportant?.(true)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-r border-slate-200",
            important ? importantActive : "bg-slate-50 text-slate-700",
            isInteractive && "hover:opacity-90 cursor-pointer"
          )}
        >
          <ImportantMarkIcon active />
          Важно
        </button>
        <button
          type="button"
          onClick={() => onChangeImportant?.(false)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
            !important ? importantInactive : "bg-white text-slate-500",
            isInteractive && "hover:opacity-90 cursor-pointer"
          )}
        >
          <ImportantMarkIcon active={false} />
          Не важно
        </button>
      </div>
    </div>
  )
}

function getEventIcon(type: LeadEventType) {
  switch (type) {
    case "created":
      return <UserPlus className="size-4" />
    case "stage_change":
      return <ArrowUpRight className="size-4" />
    case "comment":
      return <MessageSquare className="size-4" />
    case "call":
      return <Phone className="size-4" />
    case "task":
    case "task_completed":
      return <CheckSquare className="size-4" />
    case "task_created":
      return <ListTodo className="size-4" />
    case "overdue":
      return <AlertTriangle className="size-4 stroke-[2.5px]" />
    case "assign":
      return <UserPlus className="size-4" />
    case "buyer_registration":
      return <CalendarDays className="size-4" />
    default:
      return <MessageSquare className="size-4" />
  }
}

function getEventColorClass(type: LeadEventType) {
  switch (type) {
    case "created":
    case "stage_change":
    case "buyer_registration":
    case "task_completed":
      return "text-emerald-600 bg-emerald-50 border-emerald-200"
    case "task":
    case "task_created":
    case "call":
    case "assign":
      return "text-amber-600 bg-amber-50 border-amber-200"
    case "overdue":
      return "text-rose-600 bg-rose-50 border-rose-200"
    case "comment":
      return "text-sky-600 bg-sky-50 border-sky-200"
    default:
      return "text-slate-500 bg-slate-50 border-slate-200"
  }
}

function formatDateHeader(dateString: string) {
  const date = new Date(dateString)
  if (isToday(date)) return "Сегодня"
  if (isYesterday(date)) return "Вчера"
  return format(date, "d MMMM yyyy", { locale: ru })
}

function formatTime(dateString: string) {
  return format(new Date(dateString), "HH:mm")
}

function getEventTypeName(type: LeadEvent['type']) {
  switch(type) {
    case 'stage_change': return 'Смена этапа'
    case 'assign': return 'Назначение'
    case 'created': return 'Создание'
    case 'call': return 'Звонок'
    case 'task_created': return 'Новая задача'
    case 'task_completed': return 'Задача выполнена'
    case 'task': return 'Задача'
    case 'overdue': return 'Просрочка'
    case 'buyer_registration': return 'Регистрация покупателя'
    default: return 'Комментарий'
  }
}

export function LeadHistoryTimeline({
  leadId,
  initialInputType = "comment",
}: {
  leadId: string | null
  initialInputType?: "comment" | "task"
}) {
  const { getLeadWithHistory, dispatch, leadManagers } = useLeads()
  const { currentUser } = useAuth()
  const { isRopOrAbove, role } = useRolePermissions()
  const isManager = currentUser?.role === "manager"
  const scrollRef = useRef<HTMLDivElement>(null)

  const [newComment, setNewComment] = useState("")
  const [inputType, setInputType] = useState<"comment" | "task">(initialInputType)
  const [taskDeadline, setTaskDeadline] = useState("")
  const [taskAssignee, setTaskAssignee] = useState("")
  const [taskEisenhowerUrgent, setTaskEisenhowerUrgent] = useState<boolean>(false)
  const [taskEisenhowerImportant, setTaskEisenhowerImportant] = useState<boolean>(false)

  // Filter: only tasks
  const [onlyTasks, setOnlyTasks] = useState(false)

  // Inline edit state
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editTaskName, setEditTaskName] = useState("")
  const [editDeadline, setEditDeadline] = useState("")
  const [editEisenhowerUrgent, setEditEisenhowerUrgent] = useState<boolean>(false)
  const [editEisenhowerImportant, setEditEisenhowerImportant] = useState<boolean>(false)

  const handleAddEvent = () => {
    if (!leadId) return
    if (!newComment.trim()) return

    const now = new Date().toISOString()

    const authorId = currentUser?.id ?? 'lm-1'
    const authorName = currentUser?.name ?? 'Текущий Пользователь'
    let submitManagerId = authorId
    let submitManagerName = authorName

    if (inputType === 'task' && taskAssignee) {
      submitManagerId = taskAssignee
      const mgr = leadManagers?.find(m => m.id === taskAssignee)
      if (mgr) submitManagerName = mgr.name
    }

    const setByRole: TaskSetByRole | undefined =
      inputType === 'task' && isRopOrAbove && (role === 'owner' || role === 'director' || role === 'rop')
        ? role
        : undefined

    const event: LeadEvent = {
       id: `evt-${Date.now()}`,
       type: inputType === 'task' ? 'task_created' : 'comment',
       timestamp: now,
       authorId,
       authorName,
       payload: inputType === 'task'
         ? {
             taskName: newComment,
             deadline: taskDeadline || now,
             managerId: submitManagerId,
             managerName: submitManagerName,
             setByRole,
             eisenhowerUrgent: taskEisenhowerUrgent,
             eisenhowerImportant: taskEisenhowerImportant,
           }
         : { comment: newComment }
    }

    dispatch({ type: 'ADD_LEAD_EVENT', leadId, event })
    setNewComment('')
    setTaskDeadline('')
    setTaskAssignee('')
    setTaskEisenhowerUrgent(false)
    setTaskEisenhowerImportant(false)
  }

  const handleStartEdit = (event: LeadEvent) => {
    setEditingEventId(event.id)
    setEditTaskName(event.payload.taskName ?? '')
    setEditEisenhowerUrgent(event.payload.eisenhowerUrgent ?? false)
    setEditEisenhowerImportant(event.payload.eisenhowerImportant ?? false)
    // Convert ISO to datetime-local format
    if (event.payload.deadline) {
      const d = new Date(event.payload.deadline)
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setEditDeadline(local)
    } else {
      setEditDeadline('')
    }
  }

  const handleSaveEdit = (event: LeadEvent) => {
    if (!leadId || !editingEventId) return
    const deadlineIso = editDeadline ? new Date(editDeadline).toISOString() : event.payload.deadline

    dispatch({
      type: 'EDIT_LEAD_EVENT',
      leadId,
      eventId: editingEventId,
      patch: {
        taskName: editTaskName,
        deadline: deadlineIso,
        eisenhowerUrgent: editEisenhowerUrgent,
        eisenhowerImportant: editEisenhowerImportant,
      },
    })

    // Log change as a comment
    const oldName = event.payload.taskName ?? ''
    const changedParts: string[] = []
    if (editTaskName !== oldName) changedParts.push(`задача: «${editTaskName}»`)
    if (deadlineIso !== event.payload.deadline) changedParts.push(`срок: ${formatDateHeader(deadlineIso ?? '')}`)
    if (changedParts.length > 0) {
      dispatch({
        type: 'ADD_LEAD_EVENT',
        leadId,
        event: {
          id: `evt-${Date.now()}`,
          type: 'comment',
          timestamp: new Date().toISOString(),
          authorId: currentUser?.id ?? 'lm-1',
          authorName: currentUser?.name ?? 'Текущий Пользователь',
          payload: { comment: `Задача отредактирована: ${changedParts.join(', ')}` },
        },
      })
    }

    setEditingEventId(null)
    setEditTaskName('')
    setEditDeadline('')
  }

  const handleCancelEdit = () => {
    setEditingEventId(null)
    setEditTaskName('')
    setEditDeadline('')
    setEditEisenhowerUrgent(false)
    setEditEisenhowerImportant(false)
  }

  const lead = useMemo(() => {
    if (!leadId) return null
    return getLeadWithHistory(leadId)
  }, [leadId, getLeadWithHistory])

  const groupedEvents = useMemo(() => {
    if (!lead || !lead.history) return []

    const groups: { dateLabel: string; events: LeadEvent[] }[] = []

    const sorted = [...lead.history].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    const filtered = onlyTasks
      ? sorted.filter((e) => TASK_EVENT_TYPES.includes(e.type))
      : sorted

    let currentDateLabel = ""
    let currentGroup: LeadEvent[] = []

    filtered.forEach((event) => {
      const label = formatDateHeader(event.timestamp)
      if (label !== currentDateLabel) {
        if (currentGroup.length > 0) {
          groups.push({ dateLabel: currentDateLabel, events: currentGroup })
        }
        currentDateLabel = label
        currentGroup = [event]
      } else {
        currentGroup.push(event)
      }
    })

    if (currentGroup.length > 0) {
      groups.push({ dateLabel: currentDateLabel, events: currentGroup })
    }

    return groups
  }, [lead, onlyTasks])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [leadId])

  if (!lead) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        Выберите лида для просмотра истории
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-white overflow-hidden font-sans">
      {/* Scrollable Timeline Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="max-w-4xl mx-auto pb-6">
          {/* Filter toggle */}
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={() => setOnlyTasks((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-colors",
                onlyTasks
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
              )}
            >
              <ListFilter className="size-3.5" />
              Только задачи
            </button>
          </div>

          <div className="space-y-10">
            {groupedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <MessageSquare className="size-10 mb-4 opacity-50" />
                <p className="font-medium">История пока пуста</p>
                <p className="text-sm">Оставьте первый комментарий ниже</p>
              </div>
            ) : (
              groupedEvents.map((group) => (
                <div key={group.dateLabel} className="relative">
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
                      {group.dateLabel}
                    </span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  {/* Timeline Line */}
                  <div className="absolute left-8 md:left-[52px] top-10 bottom-0 w-px bg-gradient-to-b from-slate-200 to-transparent" />

                  <div className="space-y-6">
                    {group.events.map((event) => {
                      const isEditing = editingEventId === event.id
                      return (
                        <div key={event.id} className="relative flex gap-4 md:gap-6 group">
                          {/* Time */}
                          <div className="w-16 pt-1.5 text-right shrink-0">
                            <span className="text-xs font-medium text-slate-400 tabular-nums">
                              {formatTime(event.timestamp)}
                            </span>
                          </div>

                          {/* Icon */}
                          <div className="relative z-10 mt-1 flex items-center justify-center">
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={cn(
                                    "flex size-8 items-center justify-center rounded-full border bg-white shadow-sm ring-4 ring-white transition-all duration-300 group-hover:scale-110",
                                    getEventColorClass(event.type)
                                  )}>
                                    {getEventIcon(event.type)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-semibold px-2.5 py-1">
                                  {getEventTypeName(event.type)}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-0.5 pb-2">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                              <div className="flex items-start justify-between mb-2 gap-2">
                                <div className="flex flex-col gap-1 items-start">
                                  <span className={cn(
                                    "text-[12px] font-bold truncate",
                                    event.type === 'overdue' ? "text-rose-600" : "text-slate-900"
                                  )}>
                                    {event.type === 'overdue'
                                      ? 'Внимание, просрочка!'
                                      : event.type === 'task_created' && event.payload.setByRole
                                        ? `Задача поставлена: ${TASK_SET_BY_ROLE_LABEL[event.payload.setByRole]} ${event.authorName}`
                                        : event.authorName}
                                  </span>
                                  <span className={cn(
                                    "text-[10px] uppercase tracking-wider font-semibold shrink-0 bg-slate-100 px-2 py-0.5 rounded-md",
                                    event.type === 'overdue' ? "text-rose-600 bg-rose-50 border-rose-100 border" : "text-slate-500"
                                  )}>
                                    {getEventTypeName(event.type)}
                                  </span>
                                </div>

                                {/* Actions Menu */}
                                {(event.type === 'comment' || event.type === 'task' || event.type === 'task_created') && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-600">
                                        <MoreHorizontal className="size-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      {event.type === 'task_created' && (
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={() => handleStartEdit(event)}
                                        >
                                          <Pencil className="size-4 mr-2" />
                                          Редактировать
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
                                        onClick={() => {
                                          if (!leadId) return
                                          dispatch({ type: 'DELETE_LEAD_EVENT', leadId, eventId: event.id })
                                        }}
                                      >
                                        <Trash2 className="size-4 mr-2" />
                                        Удалить
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>

                              {/* Inline edit form */}
                              {isEditing ? (
                                <div className="space-y-2 mt-1">
                                  <Input
                                    value={editTaskName}
                                    onChange={(e) => setEditTaskName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(event) }}
                                    placeholder="Название задачи"
                                    className="text-sm"
                                    autoFocus
                                  />
                                  <div>
                                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wide mb-1.5">Срочность и важность</p>
                                    <EisenhowerChips
                                      urgent={editEisenhowerUrgent}
                                      important={editEisenhowerImportant}
                                      onChangeUrgent={setEditEisenhowerUrgent}
                                      onChangeImportant={setEditEisenhowerImportant}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wide shrink-0">Срок:</span>
                                    <input
                                      type="datetime-local"
                                      value={editDeadline}
                                      onChange={(e) => setEditDeadline(e.target.value)}
                                      className="h-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 pt-1">
                                    <Button size="sm" onClick={() => handleSaveEdit(event)} className="h-7 px-3 text-xs">
                                      Сохранить
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 px-3 text-xs">
                                      Отмена
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[13px] text-slate-700 leading-relaxed max-w-2xl">
                                  {event.type === 'stage_change' ? (
                                    <span>
                                      Перевод на этап <span className="font-semibold text-slate-900">«{
                                        LEAD_STAGES.find(s => s.id === event.payload.toStage)?.name
                                        || event.payload.toStageName
                                        || event.payload.toStage
                                      }»</span>
                                    </span>
                                  ) : event.type === 'assign' ? (
                                    <span>
                                      Назначен менеджер <span className="font-semibold text-slate-900">{event.payload.managerName}</span>
                                    </span>
                                  ) : event.type === 'created' ? (
                                    <span>Лид поступил в систему</span>
                                  ) : event.type === 'task_created' ? (
                                    <div className="space-y-2.5">
                                      <span className="text-slate-900 font-medium">{event.payload.taskName}</span>
                                      {(event.payload.eisenhowerUrgent !== undefined || event.payload.eisenhowerImportant !== undefined) && (
                                        <EisenhowerChips
                                          readOnly
                                          urgent={event.payload.eisenhowerUrgent === true}
                                          important={event.payload.eisenhowerImportant === true}
                                        />
                                      )}
                                      {event.payload.deadline && (
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 w-fit px-2.5 py-1 rounded-md border border-amber-200">
                                          <Clock className="size-3.5" />
                                          <span>Срок: {formatDateHeader(event.payload.deadline)}, {formatTime(event.payload.deadline)}</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : event.type === 'task_completed' ? (
                                    <span className="text-slate-400 line-through decoration-slate-300">
                                      {event.payload.taskName}
                                    </span>
                                  ) : event.type === 'overdue' ? (
                                    <span className="text-rose-600 font-medium">
                                      {event.payload.comment}
                                    </span>
                                  ) : (
                                    <span>{event.payload.comment}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-slate-200 bg-white p-4 pt-3 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] z-20">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 px-12">
            <button
              onClick={() => setInputType("comment")}
              className={cn(
                "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors",
                inputType === "comment"
                  ? "bg-slate-100 text-slate-800 border border-slate-200"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent"
              )}
            >
              Комментарий
            </button>
            <button
              onClick={() => setInputType("task")}
              className={cn(
                "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors",
                inputType === "task"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent"
              )}
            >
              Задача
            </button>
          </div>

          {/* Input field */}
          <div className="flex items-end gap-3">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 size-11 rounded-full border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-sm"
              title="Прикрепить файл"
            >
              <Plus className="size-5" />
            </Button>

            <div className="relative flex-1 flex flex-col gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleAddEvent() }}
                placeholder={inputType === "comment" ? "Написать комментарий..." : "Опишите задачу..."}
                className={cn(
                  "w-full min-h-[44px] rounded-xl border-slate-200 bg-slate-50 px-4 py-2 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:border-slate-300 shadow-inner",
                  inputType === "task" && "border-amber-200 bg-amber-50/30 focus-visible:ring-amber-300 focus-visible:border-amber-300"
                )}
              />

              {inputType === "task" && (
                <div className="flex flex-wrap items-center gap-4 pl-1 mb-1">
                  {!isManager && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wide">Исполнитель:</span>
                      <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                        <SelectTrigger className="h-8 w-[160px] text-xs">
                          <SelectValue placeholder="Текущий менеджер" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lm-1">Текущий менеджер</SelectItem>
                          {leadManagers?.map(mgr => (
                            <SelectItem key={mgr.id} value={mgr.id}>{mgr.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wide mb-1.5">Срочность и важность</p>
                    <EisenhowerChips
                      urgent={taskEisenhowerUrgent}
                      important={taskEisenhowerImportant}
                      onChangeUrgent={setTaskEisenhowerUrgent}
                      onChangeImportant={setTaskEisenhowerImportant}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wide">Крайний срок:</span>
                    <Input
                      type="datetime-local"
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      className="h-8 w-auto border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 rounded-md shadow-sm"
                    />
                  </div>
                </div>
              )}

              <Button
                size="sm"
                onClick={handleAddEvent}
                className={cn(
                  "absolute right-1.5 top-1.5 h-8 w-8 rounded-full p-0 flex items-center justify-center transition-colors shadow-sm",
                  inputType === "task"
                    ? "bg-amber-500 text-amber-50 hover:bg-amber-600"
                    : "bg-emerald-500 text-emerald-50 hover:bg-emerald-600"
                )}
                title={inputType === "task" ? "Поставить задачу" : "Отправить"}
              >
                <Send className="size-4 ml-0.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
