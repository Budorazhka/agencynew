import { useMemo, useState } from 'react'
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
} from '@dnd-kit/core'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
  History,
  User,
  CheckSquare,
} from 'lucide-react'
import { useLeads } from '@/context/LeadsContext'
import { LEAD_STAGES, LEAD_STAGE_COLUMN } from '@/data/leads-mock'
import type { Lead } from '@/types/leads'
import { cn } from '@/lib/utils'
import { LeadDetailPanel } from './LeadDetailPanel'

const IN_PROGRESS = LEAD_STAGES.filter((s) => LEAD_STAGE_COLUMN[s.id] === 'in_progress')
const REJECTION   = LEAD_STAGES.filter((s) => LEAD_STAGE_COLUMN[s.id] === 'rejection')
const SUCCESS     = LEAD_STAGES.filter((s) => LEAD_STAGE_COLUMN[s.id] === 'success')

function fmt(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

// ─── Playing Card (референс: v2-card-face из вкладки Аналитика / карточный стол V2) ─────

function PlayingCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        'v2-card-face relative w-[90px] min-h-[100px] rounded-[14px] px-2 py-2 flex flex-col justify-center cursor-grab active:cursor-grabbing select-none shadow-[0_4px_10px_rgba(0,0,0,0.26)]',
        lead.taskOverdue && 'v2-card-face is-critical',
        isDragging && 'opacity-50 scale-105 shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
      )}
    >
      <p className="text-[11px] font-medium leading-tight text-[#2a2318] line-clamp-2">
        {lead.name ?? lead.id}
      </p>
      <p className={cn('text-[10px] mt-1 font-medium', lead.commissionUsd ? 'text-emerald-700' : 'text-slate-400')}>
        {lead.commissionUsd ? `$${lead.commissionUsd.toLocaleString('en-US')}` : 'Нет'}
      </p>
      {lead.taskOverdue && (
        <span className="absolute -top-1 -right-1 w-[10px] h-[10px] rounded-full bg-rose-500 flex items-center justify-center z-10">
          <Clock className="w-1.5 h-1.5 text-white" />
        </span>
      )}
    </div>
  )
}

function OverlayCard({ lead }: { lead: Lead }) {
  return (
    <div className="v2-card-face w-[90px] min-h-[100px] rounded-[14px] px-2 py-2 flex flex-col justify-center pointer-events-none shadow-[0_8px_24px_rgba(0,0,0,0.4)] rotate-2 scale-105">
      <p className="text-[11px] font-medium leading-tight text-[#2a2318] line-clamp-2">
        {lead.name ?? lead.id}
      </p>
      <p className={cn('text-[10px] mt-1 font-medium', lead.commissionUsd ? 'text-emerald-700' : 'text-slate-400')}>
        {lead.commissionUsd ? `$${lead.commissionUsd.toLocaleString('en-US')}` : 'Нет'}
      </p>
    </div>
  )
}

// ─── Stage Column ──────────────────────────────────────────────────────────────

function StageColumn({
  stageId, stageName, leads, onSelect, selectedId,
}: {
  stageId: string
  stageName: string
  leads: Lead[]
  onSelect: (lead: Lead) => void
  selectedId: string | null
}) {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const { setNodeRef, isOver } = useDroppable({ id: stageId })

  const clampedIdx = Math.min(idx, Math.max(0, leads.length - 1))
  const current = leads[clampedIdx] ?? null

  return (
    <div className="flex flex-col items-center gap-0.5 flex-shrink-0" style={{ width: 102 }}>
      {/* Eye */}
      <button onClick={() => setVisible((v) => !v)} className="text-[rgba(242,207,141,0.35)] hover:text-[rgba(242,207,141,0.8)] transition-colors mb-0.5">
        {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      </button>
      {/* Name */}
      <p className="text-[9px] font-bold uppercase tracking-wide text-[rgba(242,207,141,0.7)] text-center leading-tight min-h-[28px] flex items-end justify-center w-full px-1">
        {stageName}
      </p>
      {/* Arrows + card */}
      <div className="flex items-center gap-0.5 mt-1">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={clampedIdx === 0}
          className="text-[rgba(242,207,141,0.35)] hover:text-[rgba(242,207,141,0.85)] disabled:opacity-20 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div
          ref={setNodeRef}
          className={cn('rounded-[6px] transition-all', isOver && 'ring-2 ring-[rgba(242,207,141,0.6)]')}
        >
          {visible && current ? (
            <div className={cn('rounded-[5px]', selectedId === current.id && 'ring-2 ring-[rgba(242,207,141,1)]')}>
              <PlayingCard lead={current} onClick={() => onSelect(current)} />
            </div>
          ) : (
            <div className="w-[90px] min-h-[100px] rounded-[14px] border border-dashed border-[rgba(238,209,152,0.4)] flex items-center justify-center v2-card-back opacity-60">
              <span className="text-[10px] text-[rgba(247,232,198,0.6)]">{!visible ? '—' : 'пусто'}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIdx((i) => Math.min(leads.length - 1, i + 1))}
          disabled={clampedIdx >= leads.length - 1}
          className="text-[rgba(242,207,141,0.35)] hover:text-[rgba(242,207,141,0.85)] disabled:opacity-20 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Count */}
      <p className="text-[9px] text-[rgba(242,207,141,0.3)] mt-0.5">
        {leads.length > 0 ? `${clampedIdx + 1}/${leads.length}` : '0'}
      </p>
    </div>
  )
}

// ─── Center Oval ───────────────────────────────────────────────────────────────

function CenterOval({ lead, managerName, onHistory }: {
  lead: Lead | null
  managerName: string | null
  onHistory?: () => void
}) {
  const stageName = lead ? (LEAD_STAGES.find((s) => s.id === lead.stageId)?.name ?? lead.stageId) : null

  return (
    <div className="relative flex items-center justify-center" style={{ width: 380, height: 200 }}>
      <div
        className="absolute inset-0 rounded-[50%]"
        style={{
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.22) 100%)',
          border: '1.5px solid rgba(242,207,141,0.18)',
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.35)',
        }}
      />
      <div className="relative z-10 text-center px-10 w-full">
        {lead ? (
          <>
            <div className="flex items-center justify-center gap-3 mb-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[rgba(242,207,141,0.45)]">Расклад</p>
              <button
                onClick={onHistory}
                className="flex items-center gap-1 rounded-full border border-[rgba(242,207,141,0.25)] px-2 py-0.5
                  text-[9px] text-[rgba(242,207,141,0.55)] hover:text-[rgba(242,207,141,0.9)] hover:border-[rgba(242,207,141,0.5)] transition-colors"
              >
                <History className="w-2 h-2" />
                История
              </button>
            </div>
            <p className="text-[9px] text-[rgba(242,207,141,0.25)] mb-0.5">От: {fmt(lead.createdAt)}</p>
            <p className="text-xl font-bold text-[rgba(255,244,215,0.95)] leading-tight">{lead.name ?? 'Без имени'}</p>
            <p className="text-[10px] text-[rgba(242,207,141,0.5)] mb-2">{stageName}</p>
            <div className="flex items-center justify-center gap-5 mb-2">
              {[
                { label: 'Задача', icon: <CheckSquare className="w-2.5 h-2.5" />, value: 'Нет', bad: false },
                { label: 'Менеджер', icon: <User className="w-2.5 h-2.5" />, value: managerName ? 'Да' : 'Нет', bad: !managerName },
                { label: 'Просрочка', icon: <Clock className="w-2.5 h-2.5" />, value: lead.taskOverdue ? 'Да' : 'Нет', bad: !!lead.taskOverdue },
              ].map(({ label, icon, value, bad }) => (
                <div key={label} className="text-center">
                  <div className={cn('flex justify-center mb-0.5', bad ? 'text-rose-400' : 'text-[rgba(242,207,141,0.4)]')}>{icon}</div>
                  <p className="text-[8px] uppercase tracking-wide text-[rgba(242,207,141,0.3)]">{label}</p>
                  <p className={cn('text-[10px] font-bold', bad ? 'text-rose-400' : 'text-[rgba(242,207,141,0.55)]')}>{value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6">
              <div>
                <p className="text-[8px] uppercase tracking-wide text-[rgba(242,207,141,0.3)]">Прогресс</p>
                <p className="text-[10px] font-semibold text-[rgba(255,244,215,0.6)]">{fmt(lead.createdAt)}</p>
              </div>
              {lead.commissionUsd != null && (
                <div>
                  <p className="text-[8px] uppercase tracking-wide text-[rgba(242,207,141,0.3)]">Комиссия</p>
                  <p className="text-[12px] font-bold text-emerald-400">${lead.commissionUsd.toLocaleString('en-US')}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-[rgba(242,207,141,0.2)] text-sm">Выберите карточку</p>
        )}
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export function LeadsPokerTable() {
  const { state, dispatch } = useLeads()
  const { leadPool, leadManagers } = state

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [filterManager, setFilterManager] = useState('all')
  const [search, setSearch] = useState('')
  const [showDetail, setShowDetail] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const filteredPool = useMemo(() => {
    let pool = leadPool
    if (filterManager !== 'all') pool = pool.filter((l) => l.managerId === filterManager)
    if (search.trim()) {
      const q = search.toLowerCase()
      pool = pool.filter((l) => (l.name ?? '').toLowerCase().includes(q))
    }
    return pool
  }, [leadPool, filterManager, search])

  const byStage = useMemo(() => {
    const map: Record<string, Lead[]> = {}
    LEAD_STAGES.forEach((s) => { map[s.id] = [] })
    filteredPool.forEach((l) => { map[l.stageId]?.push(l) })
    return map
  }, [filteredPool])

  const selectedManager = selectedLead
    ? (leadManagers.find((m) => m.id === selectedLead.managerId) ?? null)
    : null

  function handleDragStart(e: DragStartEvent) {
    setActiveLead(e.active.data.current?.lead ?? null)
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveLead(null)
    const lead = e.active.data.current?.lead as Lead | undefined
    if (!lead || !e.over) return
    const newStageId = e.over.id as string
    if (newStageId === lead.stageId) return
    dispatch({ type: 'UPDATE_LEAD_STAGE', leadId: lead.id, stageId: newStageId })
    if (selectedLead?.id === lead.id) setSelectedLead({ ...lead, stageId: newStageId })
  }

  const displayedManager = filterManager === 'all'
    ? 'Менеджеры: вся сеть'
    : (leadManagers.find((m) => m.id === filterManager)?.name ?? '')

  const avatarText = filterManager === 'all'
    ? 'ВС'
    : (leadManagers.find((m) => m.id === filterManager)?.name.slice(0, 2).toUpperCase() ?? '?')

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className="relative rounded-xl overflow-hidden border border-[rgba(242,207,141,0.18)]"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(18,58,44,0.98) 0%, rgba(10,38,28,0.99) 60%, rgba(6,24,18,1) 100%)',
        }}
      >
        {/* Gold rail */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(242,207,141,0.5)] to-transparent pointer-events-none" />

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-[rgba(242,207,141,0.1)] flex-wrap">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[rgba(242,207,141,0.45)]">Менеджер</span>
          <select
            value={filterManager}
            onChange={(e) => setFilterManager(e.target.value)}
            className="bg-[rgba(0,0,0,0.3)] border border-[rgba(242,207,141,0.2)] rounded text-[11px]
              text-[rgba(255,244,215,0.8)] px-2 py-0.5 outline-none cursor-pointer
              hover:border-[rgba(242,207,141,0.45)] transition-colors"
          >
            <option value="all">Вся сеть</option>
            {leadManagers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div className="flex-1" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени"
            className="bg-[rgba(0,0,0,0.25)] border border-[rgba(242,207,141,0.15)] rounded text-[11px]
              text-[rgba(255,244,215,0.8)] placeholder:text-[rgba(242,207,141,0.2)]
              px-3 py-0.5 outline-none w-40 focus:border-[rgba(242,207,141,0.4)] transition-colors"
          />
        </div>

        <div className="p-4 space-y-4">

          {/* TOP ROW: in_progress */}
          <div className="flex gap-0 overflow-x-auto">
            {IN_PROGRESS.map((s) => (
              <StageColumn
                key={s.id}
                stageId={s.id}
                stageName={s.name}
                leads={byStage[s.id] ?? []}
                onSelect={(l) => { setSelectedLead(l); setShowDetail(false) }}
                selectedId={selectedLead?.id ?? null}
              />
            ))}
          </div>

          {/* BOTTOM ROW: rejection | oval | success */}
          <div className="flex items-center justify-between gap-2">

            {/* Rejection */}
            <div className="flex gap-0">
              {REJECTION.map((s) => (
                <StageColumn
                  key={s.id}
                  stageId={s.id}
                  stageName={s.name}
                  leads={byStage[s.id] ?? []}
                  onSelect={(l) => { setSelectedLead(l); setShowDetail(false) }}
                  selectedId={selectedLead?.id ?? null}
                />
              ))}
            </div>

            {/* Oval */}
            <CenterOval
              lead={selectedLead}
              managerName={selectedManager?.name ?? null}
              onHistory={() => setShowDetail(true)}
            />

            {/* Success */}
            <div className="flex gap-0">
              {SUCCESS.map((s) => (
                <StageColumn
                  key={s.id}
                  stageId={s.id}
                  stageName={s.name}
                  leads={byStage[s.id] ?? []}
                  onSelect={(l) => { setSelectedLead(l); setShowDetail(false) }}
                  selectedId={selectedLead?.id ?? null}
                />
              ))}
            </div>

          </div>

          {/* Manager bar */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-[rgba(0,0,0,0.4)] border border-[rgba(242,207,141,0.13)] px-4 py-1.5">
              <div className="w-6 h-6 rounded-full bg-[rgba(242,207,141,0.18)] border border-[rgba(242,207,141,0.3)] flex items-center justify-center text-[9px] font-bold text-[rgba(242,207,141,0.85)]">
                {avatarText}
              </div>
              <p className="text-[11px] font-semibold text-[rgba(255,244,215,0.65)]">
                <span className="text-[rgba(242,207,141,0.4)] uppercase tracking-wide text-[8px] mr-1">Менеджер:</span>
                {displayedManager}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Detail panel */}
      {showDetail && selectedLead && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden max-h-[500px] overflow-y-auto">
          <LeadDetailPanel lead={selectedLead} onClose={() => setShowDetail(false)} />
        </div>
      )}

      <DragOverlay dropAnimation={null}>
        {activeLead ? <OverlayCard lead={activeLead} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
