"use client"

import { useEffect, useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { ArrowLeft, CheckCircle2, Clock, Filter, Search, UserCheck, X, Eye, Phone, MessageSquare, ListTodo, LayoutList, LayoutGrid } from "lucide-react"
import { useLeads } from "@/context/LeadsContext"
import { useAuth } from "@/context/AuthContext"
import { useRolePermissions } from "@/hooks/useRolePermissions"
import { LeadsSecretDistributionDialog } from "@/components/leads/LeadsSecretDistributionDialog"
import type { Lead } from "@/types/leads"
import { LEAD_STAGES, LEAD_STAGE_COLUMN } from "@/data/leads-mock"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { LeadHistoryTimeline } from "@/components/leads/LeadHistoryTimeline"
import { cn } from "@/lib/utils"
import "./leads-secret-table.css"

const IN_PROGRESS_STAGES = LEAD_STAGES.filter(
  (stage) => LEAD_STAGE_COLUMN[stage.id] === "in_progress"
)
const REJECTION_STAGES = LEAD_STAGES.filter(
  (stage) => LEAD_STAGE_COLUMN[stage.id] === "rejection"
)
const SUCCESS_STAGES = LEAD_STAGES.filter(
  (stage) => LEAD_STAGE_COLUMN[stage.id] === "success"
)

const REJECTION_STAGE_IDS = new Set(
  LEAD_STAGES.filter((stage) => LEAD_STAGE_COLUMN[stage.id] === "rejection").map((stage) => stage.id)
)

function managerInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function getLeadProblemState(lead: Lead): "neutral" | "critical" {
  if (REJECTION_STAGE_IDS.has(lead.stageId)) return "critical"
  if (!lead.managerId || lead.hasTask === false || lead.taskOverdue) return "critical"
  return "neutral"
}

function getDeckVisualState(stageId: string, leads: Lead[]): "neutral" | "critical" {
  if (REJECTION_STAGE_IDS.has(stageId)) return "critical"
  if (leads.length === 0) return "neutral"
  return leads.some((lead) => getLeadProblemState(lead) === "neutral") ? "neutral" : "critical"
}

function managerLabel(managerId: string | null, managerNameById: Record<string, string>): string {
  if (!managerId) return "Не назначен"
  return managerNameById[managerId] ?? managerId
}

function stageTopArcPosition(index: number, total: number): { x: number; y: number } {
  const ratio = total <= 1 ? 0 : index / (total - 1)
  const x = 5 + ratio * 90
  const arc = Math.sin(ratio * Math.PI)
  const y = 14 - arc * 14
  return { x, y }
}

function formatUsd(amount?: number | null): string {
  if (!amount || amount <= 0) return "—"
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

function visibleLeadCards(leads: Lead[], cursor: number): Lead[] {
  if (leads.length === 0) return []
  const index = cursor % leads.length
  return [leads[index]]
}

/** Карточка лида для DragOverlay (тот же вид, что в StageDeckPile) */
function DraggedCardOverlay({ lead, compact = false }: { lead: Lead; compact?: boolean }) {
  const cardWidth = compact ? 76 : 95
  const cardHeight = compact ? 114 : 142
  const isCritical = getLeadProblemState(lead) === "critical"
  const columnId = LEAD_STAGE_COLUMN[lead.stageId] ?? "in_progress"

  return (
    <div
      className={cn(
        "v2-card-face overflow-hidden px-1.5 py-1.5 text-center shadow-[0_8px_24px_rgba(0,0,0,0.4)]",
        compact ? "rounded-[11px]" : "rounded-[14px]",
        isCritical && "is-critical"
      )}
      style={{ width: cardWidth, height: cardHeight }}
    >
      {isCritical && (
        <span
          aria-hidden
          className={cn("pointer-events-none absolute inset-0", compact ? "rounded-[11px]" : "rounded-[14px]")}
          style={{
            background:
              "repeating-linear-gradient(145deg,rgba(251,113,133,0.09) 0px,rgba(251,113,133,0.09) 3px,transparent 3px,transparent 16px)",
            zIndex: 0,
          }}
        />
      )}
      <p
        className={cn(
          "relative z-10 font-medium leading-tight text-black",
          compact ? "mt-2 text-[11px]" : "mt-4 text-[13px]",
          "line-clamp-3 whitespace-normal break-words"
        )}
      >
        {lead.name ?? lead.id}
      </p>
      {columnId === "in_progress" && lead.commissionUsd != null && (
        <p className={cn("relative z-10 font-medium text-black", compact ? "mt-0.5 text-[9px]" : "mt-1 text-[10px]")}>
          {formatUsd(lead.commissionUsd)}
        </p>
      )}
    </div>
  )
}

export type LeadsCardTableViewVariant = "dialog" | "page"

export function LeadsCardTableView({
  variant,
  selectedManagerId,
  onSelectedManagerIdChange,
  onClose,
  onBack,
}: {
  variant: LeadsCardTableViewVariant
  selectedManagerId: string
  onSelectedManagerIdChange: (id: string) => void
  onClose?: () => void
  /** В режиме page — опциональная кнопка «Назад» */
  onBack?: () => void
}) {
  const { state, dispatch } = useLeads()
  const { currentUser } = useAuth()
  const { isRopOrAbove } = useRolePermissions()
  const isManager = currentUser?.role === "manager"
  const [distributionOpen, setDistributionOpen] = useState(false)
  // Кнопка видна РОПу+ или менеджеру назначенному дежурным в ручном режиме
  const canOpenDistribution = isRopOrAbove || (isManager && state.manualDistributorId === currentUser?.id)
  const { leadPool, leadManagers } = state
  const [cursorByStageId, setCursorByStageId] = useState<Record<string, number>>({})
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [filterNoTask, setFilterNoTask] = useState(false)
  const [filterNoManager, setFilterNoManager] = useState(false)
  const [filterOverdue, setFilterOverdue] = useState(false)

  // Force selectedManagerId for manager role
  useEffect(() => {
    if (isManager && currentUser?.id && selectedManagerId !== currentUser.id) {
      onSelectedManagerIdChange(currentUser.id)
    }
  }, [isManager, currentUser?.id, selectedManagerId, onSelectedManagerIdChange])
  const [onlyCritical, setOnlyCritical] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [transferConfirm, setTransferConfirm] = useState<{ newManagerId: string | null; newManagerName: string } | null>(null)
  const [dealSession, setDealSession] = useState(0)
  const [draggingLead, setDraggingLead] = useState<Lead | null>(null)
  const [viewMode, setViewMode] = useState<"poker" | "list">("poker")
  const [historyInitialMode, setHistoryInitialMode] = useState<"comment" | "task">("comment")

  const enableDnD = variant === "page"

  useEffect(() => {
    if (variant === "dialog") {
      setDealSession((s) => s + 1)
    }
  }, [variant])

  const managerNameById = useMemo(() => {
    const map: Record<string, string> = {}
    leadManagers.forEach((manager) => {
      map[manager.id] = manager.name
    })
    return map
  }, [leadManagers])

  const filteredLeads = useMemo(() => {
    let list = leadPool
    
    if (selectedManagerId === "_unassigned") list = list.filter((lead) => !lead.managerId)
    else if (selectedManagerId !== "_all") list = list.filter((lead) => lead.managerId === selectedManagerId)

    const term = q.trim().toLowerCase()
    if (term) {
      list = list.filter((lead) => (lead.name ?? lead.id).toLowerCase().includes(term))
    }

    if (filterNoTask || filterNoManager || filterOverdue) {
      list = list.filter((lead) => {
        const noTask = lead.hasTask === false
        const noManager = !lead.managerId
        const overdue = lead.taskOverdue === true
        const conditions: boolean[] = []
        if (filterNoTask) conditions.push(noTask)
        if (filterNoManager) conditions.push(noManager)
        if (filterOverdue) conditions.push(overdue)
        return conditions.some(Boolean)
      })
    }

    if (onlyCritical) {
      list = list.filter((lead) => getLeadProblemState(lead) === "critical")
    }

    if (dateFrom || dateTo) {
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null
      if (toDate) toDate.setHours(23, 59, 59, 999)
      list = list.filter((lead) => {
        const created = new Date(lead.createdAt)
        if (Number.isNaN(created.getTime())) return true
        if (fromDate && created < fromDate) return false
        if (toDate && created > toDate) return false
        return true
      })
    }

    return list
  }, [leadPool, selectedManagerId, q, filterNoTask, filterNoManager, filterOverdue, onlyCritical, dateFrom, dateTo])

  const leadsByStage = useMemo(() => {
    const map: Record<string, Lead[]> = {}
    LEAD_STAGES.forEach((stage) => {
      map[stage.id] = []
    })
    filteredLeads.forEach((lead) => {
      if (map[lead.stageId]) map[lead.stageId].push(lead)
    })
    return map
  }, [filteredLeads])

  const totals = useMemo(() => {
    const critical = filteredLeads.filter((lead) => getLeadProblemState(lead) === "critical").length
    const totalCommission = filteredLeads.reduce((sum, lead) => sum + (lead.commissionUsd ?? 0), 0)
    const criticalCommission = filteredLeads.reduce(
      (sum, lead) =>
        sum + (getLeadProblemState(lead) === "critical" ? (lead.commissionUsd ?? 0) : 0),
      0
    )
    return {
      total: filteredLeads.length,
      critical,
      totalCommission,
      criticalCommission,
    }
  }, [filteredLeads])

  const dealerName =
    selectedManagerId === "_all"
      ? "Менеджеры: вся сеть"
      : selectedManagerId === "_unassigned"
        ? "Не назначен"
        : leadManagers.find((manager) => manager.id === selectedManagerId)?.name ?? selectedManagerId

  const dealOrderByLeadId = useMemo(() => {
    const order: Record<string, number> = {}
    let idx = 0
    const addStages = (stages: typeof IN_PROGRESS_STAGES) => {
      stages.forEach((stage) => {
        const leads = leadsByStage[stage.id] ?? []
        const cursor = cursorByStageId[stage.id] ?? 0
        const [front] = visibleLeadCards(leads, cursor)
        if (front) order[front.id] = idx++
      })
    }
    addStages(IN_PROGRESS_STAGES)
    addStages(REJECTION_STAGES)
    addStages(SUCCESS_STAGES)
    return order
  }, [leadsByStage, cursorByStageId])

  const fallbackLead = filteredLeads[0] ?? null
  const activeLead =
    selectedLeadId
      ? filteredLeads.find((lead) => lead.id === selectedLeadId) ?? fallbackLead
      : fallbackLead
  const activeStage = activeLead
    ? LEAD_STAGES.find((stage) => stage.id === activeLead.stageId) ?? null
    : null
  const activityDate = activeLead
    ? new Date(activeLead.updatedAt ?? activeLead.createdAt)
    : null
  const activityLabel = activityDate
    ? `${activityDate.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}, ${activityDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`
    : "—"
  const createdLabel = activeLead
    ? new Date(activeLead.createdAt).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—"
  const taskOk = activeLead ? activeLead.hasTask !== false : false
  const managerOk = activeLead ? Boolean(activeLead.managerId) : false
  const overdue = activeLead ? activeLead.taskOverdue === true : false
  const activeLeadCommission = activeLead?.commissionUsd ?? null

  const stepStage = (stageId: string, leads: Lead[], direction: 1 | -1) => {
    if (leads.length === 0) return
    setCursorByStageId((current) => {
      const safeCurrent = (current[stageId] ?? 0) % leads.length
      const next =
        direction === 1
          ? (safeCurrent + 1) % leads.length
          : (safeCurrent - 1 + leads.length) % leads.length
      setSelectedLeadId(leads[next]?.id ?? leads[0]?.id ?? null)
      return { ...current, [stageId]: next }
    })
  }

  const handleMoveLead = (leadId: string, newStageId: string) => {
    dispatch({ type: "UPDATE_LEAD_STAGE", leadId, stageId: newStageId })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const lead = filteredLeads.find((l) => l.id === event.active.id)
    if (lead) setDraggingLead(lead)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingLead(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const leadId = String(active.id)
    const toStageId = String(over.id)
    const lead = filteredLeads.find((l) => l.id === leadId)
    if (!lead || lead.stageId === toStageId) return
    handleMoveLead(leadId, toStageId)
  }

  const tableContent = (
    <div className="v2-table-root flex h-full min-h-0 flex-col">
      <div className="v2-table-bg" aria-hidden />
      <div className="v2-table-ornament" aria-hidden />

      <header className="v2-table-hud !flex-row !flex-nowrap !gap-2 !text-left sm:!text-left">
        <Label className="shrink-0 text-[10px] uppercase tracking-wide text-[#f2dfb6]">Менеджер</Label>
        {isManager ? (
          <div className="h-7 w-[150px] shrink-0 border border-[rgba(238,204,141,0.28)] bg-[rgba(22,15,8,0.75)] px-2 text-[11px] text-[#fff1cb] flex items-center rounded-md opacity-80 cursor-default">
            {currentUser?.name}
          </div>
        ) : (
          <Select value={selectedManagerId} onValueChange={onSelectedManagerIdChange}>
            <SelectTrigger className="h-7 w-[150px] shrink-0 border-[rgba(238,204,141,0.28)] bg-[rgba(22,15,8,0.75)] px-2 text-[11px] text-[#fff1cb] focus:ring-[rgba(152,219,252,0.3)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[rgba(239,205,142,0.24)] bg-[rgba(24,17,10,0.98)] text-[#f7e8c6]">
              <SelectItem value="_all">Вся сеть</SelectItem>
              {leadManagers.map((manager) => (
                <SelectItem key={manager.id} value={manager.id}>
                  {manager.name}
                </SelectItem>
              ))}
              <SelectItem value="_unassigned">Не назначен</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Label className="shrink-0 text-[10px] uppercase tracking-wide text-[#f2dfb6]">Дата</Label>
        <div className="flex shrink-0 items-center gap-1">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-7 w-[112px] border-[rgba(238,204,141,0.28)] bg-[rgba(22,15,8,0.75)] px-1.5 text-[11px] text-[#fff1cb] [color-scheme:dark]"
          />
          <span className="text-[10px] text-[#f2dfb6]">—</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-7 w-[112px] border-[rgba(238,204,141,0.28)] bg-[rgba(22,15,8,0.75)] px-1.5 text-[11px] text-[#fff1cb] [color-scheme:dark]"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 shrink-0 gap-1 border-[rgba(241,208,146,0.28)] bg-[rgba(51,35,18,0.66)] px-1.5 text-[11px] text-[rgba(247,232,198,0.86)] hover:bg-[rgba(88,57,25,0.74)]"
            >
              <Filter className="size-3" />
              Фильтры
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="top"
            sideOffset={6}
            className="min-w-[190px] border-[rgba(239,205,142,0.24)] bg-[rgba(24,17,10,0.98)] text-[#f7e8c6] z-[100]"
          >
            <DropdownMenuLabel className="text-xs uppercase tracking-wide text-[rgba(249,230,190,0.95)]">
              Показать
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={onlyCritical}
              onCheckedChange={(v) => setOnlyCritical(v === true)}
              className="text-sm focus:bg-[rgba(77,53,24,0.45)] focus:text-[#f7e8c6]"
            >
              Только проблемные
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator className="border-[rgba(242,207,141,0.2)]" />
            <DropdownMenuCheckboxItem
              checked={filterNoTask}
              onCheckedChange={(v) => setFilterNoTask(v === true)}
              className="text-sm focus:bg-[rgba(77,53,24,0.45)] focus:text-[#f7e8c6]"
            >
              Без задач
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filterNoManager}
              onCheckedChange={(v) => setFilterNoManager(v === true)}
              className="text-sm focus:bg-[rgba(77,53,24,0.45)] focus:text-[#f7e8c6]"
            >
              Без менеджера
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filterOverdue}
              onCheckedChange={(v) => setFilterOverdue(v === true)}
              className="text-sm focus:bg-[rgba(77,53,24,0.45)] focus:text-[#f7e8c6]"
            >
              Просрочка по задаче
            </DropdownMenuCheckboxItem>
            {!isManager && (
              <>
                <DropdownMenuSeparator className="border-[rgba(242,207,141,0.2)]" />
                <DropdownMenuCheckboxItem
                  checked={showStats}
                  onCheckedChange={(v) => setShowStats(v === true)}
                  className="text-sm focus:bg-[rgba(77,53,24,0.45)] focus:text-[#f7e8c6]"
                >
                  Показать общую статистику
                </DropdownMenuCheckboxItem>
              </>
            )}
            
            {(filterNoTask || filterNoManager || filterOverdue) && (
              <>
                <DropdownMenuSeparator className="border-[rgba(242,207,141,0.2)]" />
                <div 
                  className="px-2 py-1.5 text-xs text-rose-300 font-medium cursor-pointer hover:bg-rose-950/40 hover:text-rose-200 transition-colors text-center"
                  onClick={() => {
                    setFilterNoTask(false)
                    setFilterNoManager(false)
                    setFilterOverdue(false)
                  }}
                >
                  Сбросить фильтры
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>



        <div className="relative min-w-0 w-[200px] flex gap-3 items-center">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-[rgba(241,225,189,0.66)]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по имени"
              className="h-7 w-full border-[rgba(238,204,141,0.28)] bg-[rgba(22,15,8,0.75)] pl-7 text-[11px] text-[#fff1cb] placeholder:text-[rgba(243,224,189,0.56)]"
            />
          </div>
        </div>

        {canOpenDistribution && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDistributionOpen(true)}
            className="h-7 shrink-0 gap-1.5 px-2.5 text-[11px] font-medium border-[rgba(229,196,136,0.6)] bg-[rgba(68,43,18,0.5)] text-[#fcecc8] hover:border-[rgba(236,194,112,0.7)] hover:bg-[rgba(88,57,25,0.65)]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 shrink-0">
              <rect x="3" y="1" width="15" height="21" rx="2.2" />
              <rect x="7" y="3" width="15" height="21" rx="2.2" />
              <path d="M19.5 8.5l1.5 2.5-1.5 2.5-1.5-2.5 1.5-2.5z" fill="currentColor" stroke="none" />
            </svg>
            Распределение
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode((m) => (m === "poker" ? "list" : "poker"))}
          className="h-7 shrink-0 gap-1 px-2 text-[11px] font-medium border-[rgba(241,208,146,0.28)] bg-[rgba(51,35,18,0.66)] text-[rgba(247,232,198,0.86)] hover:bg-[rgba(88,57,25,0.74)]"
          title={viewMode === "poker" ? "Список лидов" : "Покерный стол"}
        >
          {viewMode === "poker" ? <LayoutList className="size-3" /> : <LayoutGrid className="size-3" />}
          {viewMode === "poker" ? "Список" : "Стол"}
        </Button>

        {variant === "dialog" && onClose && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="v2-close-btn ml-auto h-7 shrink-0 gap-1 px-2 text-[11px] font-medium"
          >
            <X className="size-3" />
            Закрыть
          </Button>
        )}
        {variant === "page" && onBack && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="ml-auto h-7 shrink-0 gap-1 px-2 text-[11px] font-medium border-[rgba(241,208,146,0.45)] bg-[rgba(51,35,18,0.66)] text-[rgba(247,232,198,0.86)] hover:bg-[rgba(88,57,25,0.74)]"
          >
            <ArrowLeft className="size-3" />
            Назад
          </Button>
        )}
      </header>

      <LeadsSecretDistributionDialog open={distributionOpen} onOpenChange={setDistributionOpen} />

      {viewMode === "list" && (
        <div className="relative z-10 min-h-0 flex-1 overflow-auto p-6" style={{ fontFamily: "Montserrat, sans-serif" }}>
          <div className="rounded-xl border border-[rgba(243,209,139,0.25)] bg-[rgba(18,45,36,0.5)] shadow-[0_4px_24px_rgba(0,0,0,0.25)] overflow-hidden">
            {filteredLeads.length === 0 ? (
              <div className="py-16 text-center text-[12px] font-medium text-[rgba(243,225,188,0.5)]">
                Нет лидов по выбранным фильтрам
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(243,209,139,0.2)] bg-[rgba(0,0,0,0.2)]">
                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[rgba(243,225,188,0.7)] px-4 py-3">Этап</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[rgba(243,225,188,0.7)] px-4 py-3">Лид</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[rgba(243,225,188,0.7)] px-4 py-3">Менеджер</th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[rgba(243,225,188,0.7)] px-4 py-3">Комиссия</th>
                    <th className="text-center text-[10px] font-bold uppercase tracking-widest text-[rgba(243,225,188,0.7)] px-4 py-3 w-20">Задача</th>
                    <th className="text-center text-[10px] font-bold uppercase tracking-widest text-[rgba(243,225,188,0.7)] px-4 py-3 w-20">Проср.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(243,209,139,0.08)]">
                  {filteredLeads
                    .slice()
                    .sort((a, b) => {
                      const stageOrderA = LEAD_STAGES.findIndex((s) => s.id === a.stageId)
                      const stageOrderB = LEAD_STAGES.findIndex((s) => s.id === b.stageId)
                      if (stageOrderA !== stageOrderB) return stageOrderA - stageOrderB
                      return (a.name ?? a.id).localeCompare(b.name ?? b.id)
                    })
                    .map((lead) => {
                      const isActive = activeLead?.id === lead.id
                      const isCritical = getLeadProblemState(lead) === "critical"
                      const stage = LEAD_STAGES.find((s) => s.id === lead.stageId)
                      const col = stage ? LEAD_STAGE_COLUMN[stage.id] : null
                      return (
                        <tr
                          key={lead.id}
                          onClick={() => { setSelectedLeadId(lead.id); setHistoryOpen(true) }}
                          className={cn(
                            "cursor-pointer transition-colors",
                            isActive
                              ? "bg-[rgba(243,209,139,0.12)] border-l-2 border-l-[rgba(243,209,139,0.6)]"
                              : "hover:bg-[rgba(243,209,139,0.06)]",
                            isCritical && "bg-[rgba(120,30,30,0.35)] border-l-2 border-l-rose-400/60 hover:bg-[rgba(120,30,30,0.45)]"
                          )}
                        >
                          <td className="px-4 py-2.5">
                            <span className={cn(
                              "text-[11px] font-semibold",
                              col === "rejection" ? "text-rose-300" : col === "success" ? "text-emerald-300" : "text-[rgba(243,225,188,0.85)]"
                            )}>
                              {stage?.name ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={cn(
                              "text-[12px] font-semibold",
                              isCritical ? "text-rose-200" : "text-[#fcecc8]"
                            )}>
                              {lead.name ?? lead.id}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-[11px] text-[rgba(243,225,188,0.7)]">
                            {lead.managerId ? (managerNameById[lead.managerId] ?? "—") : "Не назначен"}
                          </td>
                          <td className="px-4 py-2.5">
                            {lead.commissionUsd != null && lead.commissionUsd > 0 ? (
                              <span className="text-[11px] font-bold text-[#ffe4a8]">{formatUsd(lead.commissionUsd)}</span>
                            ) : (
                              <span className="text-[11px] text-[rgba(243,225,188,0.4)]">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={cn(
                              "text-[10px] font-bold uppercase",
                              lead.hasTask !== false ? "text-emerald-400" : "text-rose-400"
                            )}>
                              {lead.hasTask !== false ? "Да" : "Нет"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={cn(
                              "text-[10px] font-bold uppercase",
                              lead.taskOverdue ? "text-rose-400" : "text-[rgba(243,225,188,0.5)]"
                            )}>
                              {lead.taskOverdue ? "Да" : "—"}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>
      )}

      {viewMode === "poker" && (
      <div className="relative z-10 min-h-0 flex-1 overflow-auto">
        <div
          className="relative mx-auto h-full min-h-[780px] min-w-[1460px]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <div className="absolute left-8 right-8 top-0 h-[405px]">
            {IN_PROGRESS_STAGES.map((stage, index) => {
              const leads = leadsByStage[stage.id] ?? []
              const baseCursor = cursorByStageId[stage.id] ?? 0
              const safeCursor = leads.length > 0 ? baseCursor % leads.length : 0
              const pos = stageTopArcPosition(index, IN_PROGRESS_STAGES.length)
              return (
                <div
                  key={stage.id}
                  className="absolute w-[104px]"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, 0)" }}
                >
                  <StageDeckPile
                    stageId={stage.id}
                    stageLabel={stage.name}
                    stageName={undefined}
                    leads={leads}
                    cursor={safeCursor}
                    onStep={stepStage}
                    onSelect={setSelectedLeadId}
                    activeLeadId={activeLead?.id ?? null}
                    showControls={leads.length > 1}
                    showStats={showStats}
                    dealOrderByLeadId={dealOrderByLeadId}
                    dealSession={dealSession}
                    enableDnD={enableDnD}
                    onMoveLead={enableDnD ? handleMoveLead : undefined}
                  />
                </div>
              )
            })}
          </div>

          <div className="absolute left-1/2 top-[56%] h-[360px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-[rgba(243,209,139,0.44)] pointer-events-none shadow-[inset_0_0_0_1px_rgba(254,235,186,0.13),0_0_26px_rgba(232,192,122,0.08)]">
            <div className="absolute inset-[20px] rounded-[50%] border border-[rgba(245,224,176,0.16)] border-dashed" />
          </div>

          <div className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 w-full max-w-[400px]">
            {!showStats ? (
              <div
                className="w-full flex flex-col justify-center text-[#fff4d7] [text-shadow:_0_2px_8px_rgba(0,0,0,0.75),_0_1px_2px_rgba(0,0,0,0.9)]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <div className="flex w-full items-center justify-between gap-3 mb-1.5">
                  <p className="text-[12px] font-extrabold uppercase tracking-widest text-[rgba(243,225,188,0.85)]">
                    Расклад
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryOpen(true)}
                    className="h-6 px-3 text-[10px] font-bold tracking-wide rounded-full border border-[rgba(244,211,147,0.4)] bg-[rgba(68,43,18,0.78)] text-[#fcecc8] hover:bg-[rgba(88,57,25,0.88)] hover:text-[#fff4d7] shadow-[inset_0_1px_0_rgba(255,235,190,0.18)]"
                  >
                    История
                  </Button>
                </div>
                <p className="mb-3 text-[10px] font-medium text-[rgba(239,224,192,0.88)] w-full text-left">
                  От: {createdLabel}
                </p>
                <div className="w-full flex flex-col items-center mb-3">
                  <p className="line-clamp-2 text-center text-[22px] font-black leading-tight text-white mb-0.5">
                    {activeLead?.name ?? "—"}
                  </p>
                  <p className="line-clamp-1 text-center text-[13px] font-semibold text-[#e7fff2]">
                    {activeStage?.name ?? "Нет этапа"}
                  </p>
                </div>
                <div className="w-full grid grid-cols-3 gap-3 mb-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center gap-1 cursor-help">
                        <CheckCircle2 className={cn("size-6 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]", taskOk ? "text-[#9bf2ce]" : "text-rose-400")} />
                        <span className="text-[9px] uppercase tracking-widest text-[rgba(243,225,188,0.85)] mt-0.5">Задача</span>
                        <span className={cn("text-[13px] font-black leading-none", taskOk ? "text-[#c8f0d8]" : "text-rose-300")}>{taskOk ? "Да" : "Нет"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={6} className="text-sm font-medium">Задача</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center gap-1 cursor-help">
                        <UserCheck className={cn("size-6 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]", managerOk ? "text-[#9bf2ce]" : "text-rose-400")} />
                        <span className="text-[9px] uppercase tracking-widest text-[rgba(243,225,188,0.85)] mt-0.5">Менеджер</span>
                        <span className={cn("text-[13px] font-black leading-none", managerOk ? "text-[#c8f0d8]" : "text-rose-300")}>{managerOk ? "Да" : "Нет"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={6} className="text-sm font-medium">
                      Менеджер: {activeLead ? managerLabel(activeLead.managerId, managerNameById) : "—"}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center gap-1 cursor-help">
                        <Clock className={cn("size-6 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]", overdue ? "text-rose-400" : "text-[#9bf2ce]")} />
                        <span className="text-[9px] uppercase tracking-widest text-[rgba(243,225,188,0.85)] mt-0.5">Проср.</span>
                        <span className={cn("text-[13px] font-black leading-none", overdue ? "text-rose-300" : "text-[#c8f0d8]")}>{overdue ? "Да" : "Нет"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={6} className="text-sm font-medium">Просрочка по задаче</TooltipContent>
                  </Tooltip>
                </div>

                {/* Action buttons */}
                {activeLead && (
                  <div className="w-full flex items-center justify-center gap-3 mb-3">
                    <button
                      type="button"
                      className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-[rgba(243,209,139,0.3)] bg-[rgba(18,45,36,0.7)] text-[rgba(243,225,188,0.85)] hover:bg-[rgba(18,65,46,0.9)] hover:border-[rgba(243,225,188,0.5)] transition-colors"
                      title="Позвонить"
                    >
                      <Phone className="size-4" />
                      <span className="text-[8px] uppercase tracking-widest font-bold">Звонок</span>
                    </button>
                    <button
                      type="button"
                      className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-[rgba(243,209,139,0.3)] bg-[rgba(18,45,36,0.7)] text-[rgba(243,225,188,0.85)] hover:bg-[rgba(18,65,46,0.9)] hover:border-[rgba(243,225,188,0.5)] transition-colors"
                      title="Написать"
                    >
                      <MessageSquare className="size-4" />
                      <span className="text-[8px] uppercase tracking-widest font-bold">Написать</span>
                    </button>
                    <button
                      onClick={() => { setHistoryInitialMode("task"); setHistoryOpen(true) }}
                      className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-[rgba(243,209,139,0.3)] bg-[rgba(18,45,36,0.7)] text-[rgba(243,225,188,0.85)] hover:bg-[rgba(18,65,46,0.9)] hover:border-[rgba(243,225,188,0.5)] transition-colors"
                      title="Поставить задачу"
                    >
                      <ListTodo className="size-4" />
                      <span className="text-[8px] uppercase tracking-widest font-bold">Задача</span>
                    </button>
                  </div>
                )}

                <div className="w-full flex items-center justify-between border-t border-[rgba(243,209,139,0.25)] pt-2.5">
                  <div className="text-left">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-[rgba(243,225,188,0.85)] mb-0.5">Прогресс</p>
                    <p className="text-[13px] font-bold leading-none text-[#fff0cb]">{activityLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-[rgba(243,225,188,0.85)] mb-0.5">Комиссия</p>
                    <p className="text-[16px] font-bold leading-none text-[#ffe4a8]">{formatUsd(activeLeadCommission)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="grid grid-cols-2 gap-x-8 gap-y-3 rounded-[12px] border border-[rgba(242,210,146,0.35)] bg-[rgba(18,45,36,0.96)] px-6 py-4 text-[#f2e4c1] shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <p className="col-span-2 mb-1 text-center text-[10px] font-bold uppercase tracking-widest text-[rgba(249,230,190,0.95)]">Количество по всем этапам</p>
                <div className="text-center">
                  <p className="mb-0.5 text-[11px] uppercase tracking-widest text-[rgba(249,230,190,0.9)]">Всего лидов</p>
                  <p className="text-[24px] font-black leading-none text-white">{totals.total}</p>
                </div>
                <div className="text-center">
                  <p className="mb-0.5 text-[11px] uppercase tracking-widest text-rose-200/80">Проблемные</p>
                  <p className="text-[24px] font-black leading-none text-rose-200">{totals.critical}</p>
                </div>
                <div className="text-center">
                  <p className="mb-0.5 text-[11px] uppercase tracking-widest text-[rgba(249,230,190,0.9)]">Доля проблемных</p>
                  <p className="text-[24px] font-black leading-none text-[#ffeab4]">
                    {totals.total > 0 ? Math.round((totals.critical / totals.total) * 100) : 0}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="mb-0.5 text-[11px] uppercase tracking-widest text-[rgba(249,230,190,0.9)]">Комиссия</p>
                  <p className="text-[24px] font-black leading-none text-[#c8f0d8]">{formatUsd(totals.totalCommission)}</p>
                </div>
                <div className="col-span-2 pt-1 text-center border-t border-[rgba(243,209,139,0.25)] mt-1">
                  <p className="mb-0.5 text-[11px] uppercase tracking-widest text-rose-200/80">Комиссия по проблемным</p>
                  <p className="text-[20px] font-black leading-none text-rose-200">{formatUsd(totals.criticalCommission)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-10 left-10 flex items-end gap-5">
            {REJECTION_STAGES.map((stage) => {
              const leads = leadsByStage[stage.id] ?? []
              const baseCursor = cursorByStageId[stage.id] ?? 0
              const safeCursor = leads.length > 0 ? baseCursor % leads.length : 0
              return (
                <div key={stage.id} className="w-[104px]">
                  <StageDeckPile
                    stageId={stage.id}
                    stageLabel={stage.name}
                    leads={leads}
                    cursor={safeCursor}
                    onStep={stepStage}
                    onSelect={setSelectedLeadId}
                    activeLeadId={activeLead?.id ?? null}
                    showControls={leads.length > 1}
                    showStats={showStats}
                    compact
                    dealOrderByLeadId={dealOrderByLeadId}
                    dealSession={dealSession}
                    enableDnD={enableDnD}
                    onMoveLead={enableDnD ? handleMoveLead : undefined}
                  />
                </div>
              )
            })}
          </div>

          <div className="absolute bottom-10 right-10 flex items-end gap-5">
            {SUCCESS_STAGES.map((stage) => {
              const leads = leadsByStage[stage.id] ?? []
              const baseCursor = cursorByStageId[stage.id] ?? 0
              const safeCursor = leads.length > 0 ? baseCursor % leads.length : 0
              return (
                <div key={stage.id} className="w-[104px]">
                  <StageDeckPile
                    stageId={stage.id}
                    stageLabel={stage.name}
                    leads={leads}
                    cursor={safeCursor}
                    onStep={stepStage}
                    onSelect={setSelectedLeadId}
                    activeLeadId={activeLead?.id ?? null}
                    showControls={leads.length > 1}
                    showStats={showStats}
                    compact
                    dealOrderByLeadId={dealOrderByLeadId}
                    dealSession={dealSession}
                    enableDnD={enableDnD}
                    onMoveLead={enableDnD ? handleMoveLead : undefined}
                  />
                </div>
              )
            })}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="v2-dealer-block flex h-[66px] min-w-[208px] items-center gap-2 px-3 py-2">
              <span className="v2-dealer-avatar">{managerInitials(dealerName || "MN")}</span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[rgba(247,229,189,0.82)]">Менеджер</p>
                <p className="truncate text-[16px] font-semibold leading-tight text-[#ffefca]">{dealerName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )

  const wrapWithDnD = (node: React.ReactNode) =>
    enableDnD ? (
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {node}
        <DragOverlay dropAnimation={null}>
          {draggingLead ? <DraggedCardOverlay lead={draggingLead} /> : null}
        </DragOverlay>
      </DndContext>
    ) : (
      node
    )

  return (
    <>
      {wrapWithDnD(tableContent)}

      <Dialog open={historyOpen} onOpenChange={(open) => { setHistoryOpen(open); if (!open) setHistoryInitialMode("comment") }}>
        <DialogContent className="sm:max-w-5xl w-full h-[90vh] max-h-[900px] flex flex-col p-0 border-none bg-slate-50 shadow-2xl overflow-hidden rounded-xl">
          <DialogHeader className="shrink-0 px-6 py-5 border-b border-slate-200 bg-white flex flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
                Карточка лида
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500">
                {activeLead?.name ? activeLead.name : "Выберите лида"}
              </DialogDescription>
            </div>

            {activeLead && !isManager && (
              <div className="flex items-center gap-3 mr-8">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Передать:
                </span>
                <Select
                  value={activeLead.managerId || "unassigned"}
                  onValueChange={(val) => {
                    const newManagerId = val === "unassigned" ? null : val
                    const newManagerName = newManagerId
                      ? (leadManagers.find((m) => m.id === newManagerId)?.name ?? "Неизвестный менеджер")
                      : ""
                    setTransferConfirm({ newManagerId, newManagerName })
                  }}
                >
                  <SelectTrigger className="h-9 w-[220px] bg-white border-slate-200 text-sm">
                    <SelectValue placeholder="Выберите менеджера" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned" className="text-slate-500 italic">Выберите менеджера</SelectItem>
                    {leadManagers.map((mgr) => (
                      <SelectItem key={mgr.id} value={mgr.id}>
                        {mgr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </DialogHeader>
          <div className="flex-1 min-h-0 bg-slate-50/50">
             <LeadHistoryTimeline leadId={activeLead?.id ?? null} initialInputType={historyInitialMode} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Подтверждение передачи лида */}
      <Dialog open={!!transferConfirm} onOpenChange={(open) => { if (!open) setTransferConfirm(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Передать лида?</DialogTitle>
            <DialogDescription>
              {transferConfirm && activeLead && (
                transferConfirm.newManagerId
                  ? <>Вы уверены, что хотите передать лида <strong>{activeLead.name ?? activeLead.id}</strong> менеджеру <strong>{transferConfirm.newManagerName}</strong>?</>
                  : <>Вы уверены, что хотите снять назначение с лида <strong>{activeLead.name ?? activeLead.id}</strong>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setTransferConfirm(null)}>
              Отмена
            </Button>
            <Button
              onClick={() => {
                if (!activeLead || !transferConfirm) return
                if (transferConfirm.newManagerId) {
                  dispatch({ type: "ASSIGN_LEAD", leadId: activeLead.id, managerId: transferConfirm.newManagerId })
                  dispatch({
                    type: "ADD_LEAD_EVENT",
                    leadId: activeLead.id,
                    event: {
                      id: `evt-${Date.now()}`,
                      type: "assign",
                      timestamp: new Date().toISOString(),
                      authorId: "lm-1",
                      authorName: "Текущий Пользователь",
                      payload: {
                        managerId: transferConfirm.newManagerId,
                        managerName: transferConfirm.newManagerName,
                      },
                    },
                  })
                } else {
                  dispatch({ type: "UNASSIGN_LEAD", leadId: activeLead.id })
                }
                setTransferConfirm(null)
              }}
            >
              Подтвердить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  )
}

// ─── StageDeckPile (карты этапа; при enableDnD — передняя карта тянется, колода — drop-зона) ─────

function StageDeckPile({
  stageId,
  stageLabel,
  stageName,
  leads,
  cursor,
  onStep,
  onSelect,
  activeLeadId,
  showControls,
  showStats,
  compact = false,
  dealOrderByLeadId = {},
  dealSession = 0,
  enableDnD = false,
  onMoveLead,
}: {
  stageId: string
  stageLabel: string
  stageName?: string
  leads: Lead[]
  cursor: number
  onStep: (stageId: string, leads: Lead[], direction: 1 | -1) => void
  onSelect: (leadId: string) => void
  activeLeadId: string | null
  showControls: boolean
  showStats: boolean
  dealOrderByLeadId?: Record<string, number>
  dealSession?: number
  compact?: boolean
  enableDnD?: boolean
  onMoveLead?: (leadId: string, newStageId: string) => void
}) {
  const cards = visibleLeadCards(leads, cursor)
  const hiddenCount = Math.max(0, leads.length - cards.length)
  const hiddenLayers = Math.min(compact ? 7 : 10, hiddenCount)
  const deckTone = getDeckVisualState(stageId, leads)

  const totalLeads = leads.length
  const criticalLeads = leads.filter((lead) => getLeadProblemState(lead) === "critical").length
  const columnCommission = leads.reduce((sum, lead) => sum + (lead.commissionUsd ?? 0), 0)

  const cardWidth = compact ? 76 : 95
  const cardHeight = compact ? 114 : 142
  const cardStep = compact ? 22 : 27
  const pileHeight = hiddenLayers * (compact ? 2 : 3) + 4 + cardHeight + (compact ? 6 : 8)

  const columnId = LEAD_STAGE_COLUMN[stageId] ?? "in_progress"
  const [showLocalStats, setShowLocalStats] = useState(false)
  const hasCompactStageLabel = stageId === "callback" || stageId === "country_discussed"

  const { setNodeRef: setDroppableRef, isOver } = useDroppable(
    enableDnD ? { id: stageId } : { id: `noop-${stageId}` }
  )

  return (
    <>
      <div>
        {!compact && (
          <div className="mb-1 flex justify-center">
            <button
              onClick={() => setShowLocalStats((v) => !v)}
              className="text-[rgba(247,232,198,0.6)] hover:text-[#f7ecd4] transition-colors focus:outline-none"
              title="Показать статистику по этапу"
            >
              <Eye className="size-4" />
            </button>
          </div>
        )}
        <div className="relative z-20 mb-3 flex h-6 items-center justify-center gap-1.5">
          {showControls ? (
            <>
              <button
                type="button"
                onClick={() => onStep(stageId, leads, -1)}
                className="v2-stage-nav-btn h-5 min-w-[32px] px-1 text-[11px]"
              >
                &#8249;&#8249;
              </button>
              <button
                type="button"
                onClick={() => onStep(stageId, leads, 1)}
                className="v2-stage-nav-btn h-5 min-w-[32px] px-1 text-[11px]"
              >
                &#8250;&#8250;
              </button>
            </>
          ) : (
            <>
              <span className="h-5 min-w-[32px] opacity-0">&#8249;&#8249;</span>
              <span className="h-5 min-w-[32px] opacity-0">&#8250;&#8250;</span>
            </>
          )}
        </div>
        <div className={cn("mb-2 flex items-center justify-center", compact ? "h-8" : "h-5")}>
          <p
            className={cn(
              "text-center font-bold text-[#f2dfb6]",
              compact
                ? hasCompactStageLabel
                  ? "line-clamp-2 text-[10px] leading-tight tracking-[0.01em]"
                  : "line-clamp-2 text-[11px] tracking-wide"
                : hasCompactStageLabel
                  ? "text-[10px] uppercase leading-tight tracking-[0.04em]"
                  : "text-[11px] uppercase tracking-wide"
            )}
          >
            {stageLabel}
          </p>
        </div>
        {!compact && (showStats || showLocalStats) && (
          <div className="mb-1 flex flex-col items-center gap-0.5 [text-shadow:_0_1px_3px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3.5 text-[11px] font-semibold leading-none text-[#f7ecd4]">
              <span>Всего: {totalLeads}</span>
              <span className="text-rose-300">Пробл: {criticalLeads}</span>
            </div>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-bold leading-none",
                criticalLeads / Math.max(totalLeads, 1) > 0.5
                  ? "bg-rose-600 text-white"
                  : criticalLeads / Math.max(totalLeads, 1) > 0.25
                    ? "bg-[rgba(88,57,25,0.88)] text-[#fcecc8] border border-[rgba(244,214,150,0.55)]"
                    : "bg-[rgba(24,106,78,0.84)] text-[#e7ffef] border border-[rgba(150,255,217,0.62)]"
              )}
            >
              {totalLeads > 0 ? Math.round((criticalLeads / totalLeads) * 100) : 0}% пробл.
            </span>
          </div>
        )}
        {stageName && (
          <div className="flex h-8 items-start justify-center">
            <p className="line-clamp-2 text-center text-[11px] font-semibold leading-tight text-[#f2dfb6]">
              {stageName}
            </p>
          </div>
        )}
      </div>
      <div className="mb-4" />

      <div
        ref={enableDnD ? setDroppableRef : undefined}
        className={cn("relative mx-auto transition-all", enableDnD && isOver && "ring-2 ring-[rgba(243,209,139,0.6)] rounded-[14px]")}
        style={{ width: cardWidth, height: pileHeight }}
      >
        {hiddenLayers > 0 &&
          Array.from({ length: hiddenLayers }).map((_, layerIndex) => (
            <span
              key={`back-${stageId}-${layerIndex}`}
              aria-hidden
              className={cn(
                "absolute shadow-[0_3px_8px_rgba(0,0,0,0.25)]",
                compact ? "rounded-[11px]" : "rounded-[14px]",
                "v2-card-back",
                deckTone === "critical" && "border-rose-300/90"
              )}
              style={{
                width: cardWidth,
                height: cardHeight,
                top: layerIndex * (compact ? 2 : 3),
                left: 0,
                zIndex: layerIndex + 1,
              }}
            />
          ))}

        {cards.map((lead, cardIndex) => {
          const isFrontCard = cardIndex === cards.length - 1
          const isCritical = getLeadProblemState(lead) === "critical"
          const dealIndex = dealOrderByLeadId[lead.id] ?? 0
          const delayMs = dealIndex * 70
          const showAsDraggable = enableDnD && isFrontCard && Boolean(onMoveLead)

          return (
            <StageDeckCard
              key={lead.id + "-" + dealSession}
              lead={lead}
              stageId={stageId}
              compact={compact}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              isFrontCard={isFrontCard}
              isCritical={isCritical}
              activeLeadId={activeLeadId}
              columnId={columnId}
              hiddenLayers={hiddenLayers}
              cardStep={cardStep}
              cardIndex={cardIndex}
              delayMs={delayMs}
              onSelect={onSelect}
              draggable={showAsDraggable}
            />
          )
        })}

        {leads.length === 0 && (
          <span
            className={cn(
              "v2-card-back absolute border border-dashed border-[rgba(238,209,152,0.4)] opacity-60",
              compact ? "rounded-[11px]" : "rounded-[14px]"
            )}
            style={{ width: cardWidth, height: cardHeight, top: 0, left: 0 }}
          />
        )}
      </div>

      {!compact && (showStats || showLocalStats) && columnCommission > 0 && (
        <div className="mt-0.5 text-center text-[13px] font-bold leading-none text-[#fcecc8] [text-shadow:_0_1px_3px_rgba(0,0,0,0.75)]">
          {formatUsd(columnCommission)}
        </div>
      )}
    </>
  )
}

function StageDeckCard({
  lead,
  stageId,
  compact,
  cardWidth,
  cardHeight,
  isFrontCard,
  isCritical,
  activeLeadId,
  columnId,
  hiddenLayers,
  cardStep,
  cardIndex,
  delayMs,
  onSelect,
  draggable,
}: {
  lead: Lead
  stageId: string
  compact: boolean
  cardWidth: number
  cardHeight: number
  isFrontCard: boolean
  isCritical: boolean
  activeLeadId: string | null
  columnId: string
  hiddenLayers: number
  cardStep: number
  cardIndex: number
  delayMs: number
  onSelect: (leadId: string) => void
  draggable: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable(
    draggable ? { id: lead.id, data: { lead, fromStageId: stageId } } : { id: `noop-${lead.id}-${stageId}` }
  )

  const topOffset = hiddenLayers * (compact ? 2 : 3) + 4 + cardIndex * cardStep

  const cardEl = (
    <button
      ref={draggable ? setNodeRef : undefined}
      {...(draggable ? { ...listeners, ...attributes } : {})}
      type="button"
      onClick={() => onSelect(lead.id)}
      className={cn(
        "absolute overflow-hidden px-1.5 py-1.5 text-center shadow-[0_4px_10px_rgba(0,0,0,0.26)] v2-card-face",
        compact ? "rounded-[11px]" : "rounded-[14px]",
        isCritical && "is-critical",
        activeLeadId === lead.id && "ring-2 ring-[rgba(243,209,139,0.6)]",
        draggable && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
      style={{
        width: cardWidth,
        height: cardHeight,
        top: topOffset,
        left: 0,
        zIndex: 20 + cardIndex,
        animationName: "dealCard",
        animationDuration: "420ms",
        animationDelay: `${delayMs}ms`,
        animationTimingFunction: "cubic-bezier(0.18, 0.89, 0.32, 1.28)",
        animationFillMode: "backwards",
      }}
    >
      {isCritical && (
        <span
          aria-hidden
          className={cn("pointer-events-none absolute inset-0", compact ? "rounded-[11px]" : "rounded-[14px]")}
          style={{
            background:
              "repeating-linear-gradient(145deg,rgba(251,113,133,0.09) 0px,rgba(251,113,133,0.09) 3px,transparent 3px,transparent 16px)",
            zIndex: 0,
          }}
        />
      )}
      {!isFrontCard && (
        <span className="relative z-10 absolute left-1 right-1 top-1 rounded-[4px] border border-[rgba(217,201,171,0.5)] bg-[#f8f4ec]/95 px-1 py-0.5 text-[10px] font-medium leading-none text-black">
          <span className="block truncate">{lead.name ?? lead.id}</span>
        </span>
      )}
      <p
        className={cn(
          "relative z-10 font-medium leading-tight text-black",
          compact ? "mt-2 text-[11px]" : "mt-4 text-[13px]",
          isFrontCard ? "line-clamp-3 whitespace-normal break-words" : "line-clamp-2"
        )}
      >
        {lead.name ?? lead.id}
      </p>
      {columnId === "in_progress" && lead.commissionUsd != null && (
        <p className={cn("relative z-10 font-medium text-black", compact ? "mt-0.5 text-[9px]" : "mt-1 text-[10px]")}>
          {formatUsd(lead.commissionUsd)}
        </p>
      )}
    </button>
  )

  return cardEl
}
