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
import { EisenhowerChips } from "@/components/shared/EisenhowerChips"

const TASK_EVENT_TYPES: LeadEventType[] = ['task_created', 'task', 'task_completed', 'overdue']

const TASK_SET_BY_ROLE_LABEL: Record<TaskSetByRole, string> = {
  owner: 'Собственник',
  director: 'Директор',
  rop: 'РОП',
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

  const getDefaultDeadline = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  const [newComment, setNewComment] = useState("")
  const [inputType, setInputType] = useState<"comment" | "task">(initialInputType)
  const [taskDeadline, setTaskDeadline] = useState(() => initialInputType === "task" ? getDefaultDeadline() : "")
  const [taskAssignee, setTaskAssignee] = useState("")
  const [taskEisenhowerUrgent, setTaskEisenhowerUrgent] = useState<boolean>(false)
  const [taskEisenhowerImportant, setTaskEisenhowerImportant] = useState<boolean>(false)

  // Фильтр: только задачи
  const [onlyTasks, setOnlyTasks] = useState(false)

  // Состояние правки прямо в списке
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
    setTaskDeadline(getDefaultDeadline())
    setTaskAssignee('')
    setTaskEisenhowerUrgent(false)
    setTaskEisenhowerImportant(false)
  }

  const handleStartEdit = (event: LeadEvent) => {
    setEditingEventId(event.id)
    setEditTaskName(event.payload.taskName ?? '')
    setEditEisenhowerUrgent(event.payload.eisenhowerUrgent ?? false)
    setEditEisenhowerImportant(event.payload.eisenhowerImportant ?? false)
    // Переводим ISO в формат поля datetime-local
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

    // Пишем изменение как комментарий в историю
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-4 scroll-smooth font-sans lead-history-scroll">
        <div className="mx-auto pb-3">
          {/* Filter toggle */}
          <div className="flex items-center justify-end mb-2">
            <button
              onClick={() => setOnlyTasks((v) => !v)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide border transition-colors",
                onlyTasks
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
              )}
            >
              <ListFilter className="size-3" />
              Только задачи
            </button>
          </div>

          <div className="space-y-4">
            {groupedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <MessageSquare className="size-7 mb-2 opacity-50" />
                <p className="text-[11px] font-medium">История пока пуста</p>
                <p className="text-[10px]">Оставьте первый комментарий ниже</p>
              </div>
            ) : (
              groupedEvents.map((group) => (
                <div key={group.dateLabel} className="relative">
                  {/* Date header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
                      {group.dateLabel}
                    </span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  {/* Timeline Line */}
                  <div className="absolute left-6 md:left-[36px] top-7 bottom-0 w-px bg-gradient-to-b from-slate-200 to-transparent" />

                  <div className="space-y-2.5">
                    {group.events.map((event) => {
                      const isEditing = editingEventId === event.id
                      return (
                        <div key={event.id} className="relative flex gap-2 md:gap-3 group">
                          {/* Time */}
                          <div className="w-10 pt-1 text-right shrink-0">
                            <span className="text-[10px] font-medium text-slate-400 tabular-nums">
                              {formatTime(event.timestamp)}
                            </span>
                          </div>

                          {/* Icon */}
                          <div className="relative z-10 mt-0.5 flex items-center justify-center">
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={cn(
                                    "flex size-6 items-center justify-center rounded-full border bg-white shadow-sm ring-2 ring-white transition-all duration-300 group-hover:scale-110 [&>svg]:size-3",
                                    getEventColorClass(event.type)
                                  )}>
                                    {getEventIcon(event.type)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-semibold px-2 py-0.5 text-[10px]">
                                  {getEventTypeName(event.type)}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-0 pb-0.5">
                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                              <div className="flex items-start justify-between mb-1 gap-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={cn(
                                    "text-[10px] font-bold truncate",
                                    event.type === 'overdue' ? "text-rose-600" : "text-slate-900"
                                  )}>
                                    {event.type === 'overdue'
                                      ? 'Просрочка!'
                                      : event.type === 'task_created' && event.payload.setByRole
                                        ? `${TASK_SET_BY_ROLE_LABEL[event.payload.setByRole]} ${event.authorName}`
                                        : event.authorName}
                                  </span>
                                  <span className={cn(
                                    "text-[8px] uppercase tracking-wider font-semibold shrink-0 bg-slate-100 px-1.5 py-0.5 rounded",
                                    event.type === 'overdue' ? "text-rose-600 bg-rose-50 border-rose-100 border" : "text-slate-500"
                                  )}>
                                    {getEventTypeName(event.type)}
                                  </span>
                                </div>

                                {(event.type === 'comment' || event.type === 'task' || event.type === 'task_created') && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-slate-600">
                                        <MoreHorizontal className="size-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-36">
                                      {event.type === 'task_created' && (
                                        <DropdownMenuItem
                                          className="cursor-pointer text-[11px]"
                                          onClick={() => handleStartEdit(event)}
                                        >
                                          <Pencil className="size-3 mr-1.5" />
                                          Редактировать
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer text-[11px]"
                                        onClick={() => {
                                          if (!leadId) return
                                          dispatch({ type: 'DELETE_LEAD_EVENT', leadId, eventId: event.id })
                                        }}
                                      >
                                        <Trash2 className="size-3 mr-1.5" />
                                        Удалить
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>

                              {isEditing ? (
                                <div className="space-y-1.5 mt-0.5">
                                  <Input
                                    value={editTaskName}
                                    onChange={(e) => setEditTaskName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(event) }}
                                    placeholder="Название задачи"
                                    className="text-[11px] h-7"
                                    autoFocus
                                  />
                                  <div>
                                    <p className="text-[9px] uppercase text-slate-500 font-bold tracking-wide mb-1">Срочность и важность</p>
                                    <EisenhowerChips
                                      urgent={editEisenhowerUrgent}
                                      important={editEisenhowerImportant}
                                      onChangeUrgent={setEditEisenhowerUrgent}
                                      onChangeImportant={setEditEisenhowerImportant}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wide shrink-0">Срок:</span>
                                    <input
                                      type="datetime-local"
                                      value={editDeadline}
                                      onChange={(e) => setEditDeadline(e.target.value)}
                                      className="h-7 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1.5 pt-0.5">
                                    <Button size="sm" onClick={() => handleSaveEdit(event)} className="h-6 px-2.5 text-[10px]">
                                      Сохранить
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-6 px-2.5 text-[10px]">
                                      Отмена
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[11px] text-slate-700 leading-snug">
                                  {event.type === 'stage_change' ? (
                                    <span>
                                      → <span className="font-semibold text-slate-900">{
                                        LEAD_STAGES.find(s => s.id === event.payload.toStage)?.name
                                        || event.payload.toStageName
                                        || event.payload.toStage
                                      }</span>
                                    </span>
                                  ) : event.type === 'assign' ? (
                                    <span>
                                      Менеджер: <span className="font-semibold text-slate-900">{event.payload.managerName}</span>
                                    </span>
                                  ) : event.type === 'created' ? (
                                    <span>Лид поступил в систему</span>
                                  ) : event.type === 'task_created' ? (
                                    <div className="space-y-1.5">
                                      <span className="text-slate-900 font-medium">{event.payload.taskName}</span>
                                      {(event.payload.eisenhowerUrgent !== undefined || event.payload.eisenhowerImportant !== undefined) && (
                                        <EisenhowerChips
                                          readOnly
                                          urgent={event.payload.eisenhowerUrgent === true}
                                          important={event.payload.eisenhowerImportant === true}
                                        />
                                      )}
                                      {event.payload.deadline && (
                                        <div className="flex items-center gap-1 text-[9px] font-medium text-amber-700 bg-amber-50 w-fit px-2 py-0.5 rounded border border-amber-200">
                                          <Clock className="size-3" />
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

      {/* Input bar — comment by default, task form replaces it on toggle */}
      <div className={cn(
        "shrink-0 border-t bg-white px-3 z-20",
        inputType === "task" ? "border-amber-200 py-2" : "border-slate-200 py-1.5"
      )}>
        {inputType === "comment" ? (
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleAddEvent() }}
                placeholder="Комментарий..."
                className="w-full h-7 rounded-lg border-slate-200 bg-slate-50 px-3 py-1 pr-8 text-[11px] text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300"
              />
              <Button
                size="sm"
                onClick={handleAddEvent}
                className="absolute right-0.5 top-0.5 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
              >
                <Send className="size-3 ml-px" />
              </Button>
            </div>
            <button
              onClick={() => { setInputType("task"); if (!taskDeadline) setTaskDeadline(getDefaultDeadline()) }}
              className="shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wide border border-slate-200 bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-colors"
            >
              <Plus className="size-3" />
              Задача
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleAddEvent() }}
                placeholder="Опишите задачу..."
                className="flex-1 h-7 rounded-lg border-amber-200 bg-amber-50/40 px-3 py-1 text-[11px] text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-amber-300"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleAddEvent}
                className="shrink-0 h-7 px-3 text-[9px] font-bold uppercase tracking-wide bg-amber-500 text-white hover:bg-amber-600 rounded-lg"
              >
                <Send className="size-3 mr-1" />
                Задача
              </Button>
              <button
                onClick={() => setInputType("comment")}
                className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >✕</button>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {!isManager && (
                <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                  <SelectTrigger className="h-6 w-[130px] text-[9px] bg-white border-slate-200">
                    <SelectValue placeholder="Исполнитель" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lm-1">Текущий менеджер</SelectItem>
                    {leadManagers?.map(mgr => (
                      <SelectItem key={mgr.id} value={mgr.id}>{mgr.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="flex items-center gap-1">
                <span className="text-[8px] uppercase text-slate-400 font-bold">Срок:</span>
                <input
                  type="datetime-local"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  className="h-6 rounded border border-slate-200 bg-white px-1.5 text-[9px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-200"
                />
              </div>
              <EisenhowerChips
                urgent={taskEisenhowerUrgent}
                important={taskEisenhowerImportant}
                onChangeUrgent={setTaskEisenhowerUrgent}
                onChangeImportant={setTaskEisenhowerImportant}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
