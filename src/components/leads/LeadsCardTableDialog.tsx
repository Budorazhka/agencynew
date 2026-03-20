"use client"

import { useMemo, useState, useCallback } from 'react'
import { X, Search, Filter } from 'lucide-react'
import { useLeads } from '@/context/LeadsContext'
import type { Lead, LeadStage } from '@/types/leads'
import type { AnalyticsPeriod } from '@/types/analytics'
import {
  LEAD_STAGES,
  LEAD_STAGE_COLUMN,
  LEAD_STAGE_ORDER,
} from '@/data/leads-mock'
import type { FunnelColumnId } from '@/data/leads-mock'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

/* ── Config ── */

interface ColDef { id: FunnelColumnId; name: string; accent: string; badge: string }
const COLS: ColDef[] = [
  { id: 'rejection',   name: 'Отказ',        accent: 'border-blue-500',    badge: 'bg-blue-600 text-white' },
  { id: 'in_progress', name: 'В работе',     accent: 'border-emerald-500', badge: 'bg-emerald-600 text-white' },
  { id: 'success',     name: 'Золотой фонд', accent: 'border-amber-500',   badge: 'bg-amber-500 text-amber-950' },
]

function stagesOf(c: FunnelColumnId) { return LEAD_STAGES.filter((s) => LEAD_STAGE_COLUMN[s.id] === c) }

function deckLayers(count: number): number {
  if (count >= 7) return 3
  if (count >= 4) return 2
  if (count >= 2) return 1
  return 0
}

function isProblem(lead: Lead): boolean {
  return !lead.hasTask || !lead.managerId
}

/* ── Dialog ── */

export function LeadsCardTableDialog({
  open, onOpenChange, selectedManagerId, onSelectedManagerIdChange, period, onPeriodChange,
}: {
  open: boolean; onOpenChange: (v: boolean) => void
  selectedManagerId: string; onSelectedManagerIdChange: (id: string) => void
  period: AnalyticsPeriod; onPeriodChange: (p: AnalyticsPeriod) => void
}) {
  const { state } = useLeads()
  const { leadPool, leadManagers } = state
  const [selId, setSelId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [filterNoTask, setFilterNoTask] = useState(false)
  const [filterNoManager, setFilterNoManager] = useState(false)
  const [idx, setIdx] = useState<Record<string, number>>({})

  const leads = useMemo(() => {
    let l = leadPool
    if (selectedManagerId === '_unassigned') l = l.filter((x) => !x.managerId)
    else if (selectedManagerId !== '_all') l = l.filter((x) => x.managerId === selectedManagerId)
    if (q.trim()) { const s = q.trim().toLowerCase(); l = l.filter((x) => (x.name ?? x.id).toLowerCase().includes(s)) }
    if (filterNoTask || filterNoManager) {
      l = l.filter((lead) => {
        if (filterNoTask && filterNoManager) return isProblem(lead)
        if (filterNoTask) return !lead.hasTask
        return !lead.managerId
      })
    }
    return l
  }, [leadPool, selectedManagerId, q, filterNoTask, filterNoManager])

  const byStage = useMemo(() => {
    const m: Record<string, Lead[]> = {}
    LEAD_STAGE_ORDER.forEach((id) => { m[id] = leads.filter((l) => l.stageId === id) })
    return m
  }, [leads])

  const sel = useMemo(() => selId ? leads.find((l) => l.id === selId) ?? null : null, [selId, leads])

  const flip = useCallback((sid: string, d: 1 | -1) => {
    setIdx((p) => ({ ...p, [sid]: Math.max(0, (p[sid] ?? 0) + d) }))
  }, [])

  const mgrName = (id: string) => id === '_all' ? 'Вся сеть' : id === '_unassigned' ? 'Не назначен' : leadManagers.find((m) => m.id === id)?.name ?? id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}
        className="!fixed !inset-0 !top-0 !left-0 !translate-x-0 !translate-y-0 !m-0 !h-screen !w-screen !max-w-none !rounded-none !border-0 !p-0 overflow-hidden flex flex-col bg-emerald-950 font-sans">

        <DialogHeader className="shrink-0 border-b-2 border-emerald-600 bg-emerald-900 px-4 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-bold text-white">♠ Карточный стол лидов</DialogTitle>
              <DialogDescription className="text-xs text-emerald-300">♦ — листать колоду</DialogDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-emerald-200 text-xs whitespace-nowrap">Менеджер</Label>
                <Select value={selectedManagerId} onValueChange={onSelectedManagerIdChange}>
                  <SelectTrigger className="border-emerald-600 bg-emerald-900/60 text-white h-8 text-xs w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Вся сеть</SelectItem>
                    {leadManagers.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    <SelectItem value="_unassigned">Не назначен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1.5">
                <Label className="text-emerald-200 text-xs whitespace-nowrap">Период</Label>
                <Select value={period} onValueChange={(v) => onPeriodChange(v as AnalyticsPeriod)}>
                  <SelectTrigger className="border-emerald-600 bg-emerald-900/60 text-white h-8 text-xs w-[100px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Неделя</SelectItem>
                    <SelectItem value="month">Месяц</SelectItem>
                    <SelectItem value="allTime">Всё время</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm"
                    className="h-8 gap-1.5 border-emerald-500 bg-emerald-900/60 text-emerald-50 hover:bg-emerald-800 text-xs">
                    <Filter className="size-3.5" />
                    Фильтры
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-emerald-950 border-emerald-600 text-emerald-50 min-w-[200px]">
                  <DropdownMenuLabel className="text-emerald-200 text-xs">Показать</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={filterNoTask}
                    onCheckedChange={(v) => setFilterNoTask(v === true)}
                    className="text-sm focus:bg-emerald-800 focus:text-white"
                  >
                    Без задач
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterNoManager}
                    onCheckedChange={(v) => setFilterNoManager(v === true)}
                    className="text-sm focus:bg-emerald-800 focus:text-white"
                  >
                    Без менеджера
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-emerald-400" />
                <Input placeholder="Поиск..." value={q} onChange={(e) => setQ(e.target.value)}
                  className="pl-7 w-32 h-8 border-emerald-600 bg-emerald-900/80 text-white placeholder:text-emerald-400 text-xs" />
              </div>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}
                className="h-8 gap-1 border-emerald-500 bg-emerald-900/60 text-emerald-50 hover:bg-emerald-800 text-xs">
                <X className="size-3.5" />
                Закрыть
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Felt */}
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_40%_20%,rgba(16,185,129,0.45),rgba(2,44,34,0.98)_70%)]">
          <div className="absolute inset-0 overflow-auto">
            <div className="mx-auto flex h-full w-full max-w-[2400px] gap-4 p-4">
              <div className="flex flex-1 gap-4 min-w-0">
                {COLS.map((col) => (
                  <FunnelCol key={col.id} col={col} stages={stagesOf(col.id)} byStage={byStage}
                    idx={idx} flip={flip} selId={selId} setSel={setSelId} />
                ))}
              </div>

              {/* Sidebar */}
              <aside className="w-[300px] shrink-0 rounded-2xl border-2 border-emerald-600 bg-emerald-50/95 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Расклад</p>
                {sel ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border-2 border-slate-300 bg-white p-3 shadow-sm font-sans">
                      <p className="text-base font-bold text-slate-900 text-center">{sel.name ?? sel.id}</p>
                      <p className="text-sm text-slate-400 mt-0.5 text-center">{LEAD_STAGES.find((s) => s.id === sel.stageId)?.name}</p>
                    </div>
                    <div className={cn('rounded-lg border-2 px-3 py-2 font-sans', sel.hasTask ? 'border-emerald-300 bg-emerald-50' : 'border-rose-400 bg-rose-50')}>
                      <p className="text-xs font-bold text-slate-500">Задача</p>
                      <p className={cn('text-sm font-bold', sel.hasTask ? 'text-emerald-700' : 'text-rose-600')}>{sel.hasTask ? 'Да' : 'Нет'}</p>
                    </div>
                    <div className={cn('rounded-lg border-2 px-3 py-2 font-sans', sel.managerId ? 'border-emerald-300 bg-emerald-50' : 'border-rose-400 bg-rose-50')}>
                      <p className="text-xs font-bold text-slate-500">Менеджер</p>
                      <p className={cn('text-sm font-bold', sel.managerId ? 'text-emerald-700' : 'text-rose-600')}>{sel.managerId ? mgrName(sel.managerId) : 'Не назначен'}</p>
                    </div>
                    <div className="rounded-lg border-2 border-slate-200 bg-slate-50 px-3 py-2 font-sans">
                      <p className="text-xs font-bold text-slate-500">Активность</p>
                      <p className="text-sm font-bold text-slate-800">
                        {(sel.updatedAt ? new Date(sel.updatedAt) : new Date(sel.createdAt))
                          .toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/80 p-8 text-center">
                    <p className="text-5xl text-rose-300">♦</p>
                    <p className="mt-2 text-sm text-slate-400">Выберите карту</p>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ── Column ── */

function FunnelCol({ col, stages, byStage, idx, flip, selId, setSel }: {
  col: ColDef; stages: LeadStage[]; byStage: Record<string, Lead[]>
  idx: Record<string, number>; flip: (s: string, d: 1 | -1) => void
  selId: string | null; setSel: (id: string) => void
}) {
  const total = stages.reduce((s, st) => s + (byStage[st.id]?.length ?? 0), 0)
  return (
    <div className="flex-1 min-w-[200px]">
      <div className={cn('mb-3 rounded-xl border-2 py-2 bg-emerald-900/70 text-center font-sans', col.accent)}>
        <p className="text-lg font-bold text-white">{col.name}</p>
        <Badge className={cn('text-xs font-bold mt-1', col.badge)}>{total}</Badge>
      </div>
      <div className="space-y-3">
        {stages.map((stage) => {
          const list = byStage[stage.id] ?? []
          const ci = Math.min(idx[stage.id] ?? 0, Math.max(0, list.length - 1))
          return <Deck key={stage.id} stage={stage} leads={list} ci={ci}
            flip={(d) => flip(stage.id, d)} selId={selId} setSel={setSel} />
        })}
      </div>
    </div>
  )
}

/* ── Deck (one stage = one card pile) ── */

const BACK_PATTERN = 'bg-[repeating-linear-gradient(45deg,rgba(185,28,28,0.14)_0px,rgba(185,28,28,0.14)_4px,rgba(255,255,255,0.92)_4px,rgba(255,255,255,0.92)_9px)]'

function Deck({ stage, leads, ci, flip, selId, setSel }: {
  stage: LeadStage; leads: Lead[]; ci: number
  flip: (d: 1 | -1) => void
  selId: string | null; setSel: (id: string) => void
}) {
  const n = leads.length
  const main = leads[ci] ?? null
  const peekIdx: number[] = []
  if (ci + 1 < n) peekIdx.push(ci + 1)
  if (ci + 2 < n) peekIdx.push(ci + 2)
  if (peekIdx.length < 2 && ci - 1 >= 0) peekIdx.push(ci - 1)
  if (peekIdx.length < 2 && ci - 2 >= 0) peekIdx.push(ci - 2)
  const peeks = peekIdx.map((i) => leads[i])
  const layers = deckLayers(n)
  const canPrev = ci > 0
  const canNext = ci < n - 1

  if (n === 0) {
    return (
      <div className="flex flex-col items-center w-full">
        <p className="text-sm font-bold text-emerald-200/80 mb-1 text-center font-sans">{stage.name}</p>
        <div className="w-3/4 max-w-[220px] aspect-[5/2] rounded-xl border-2 border-dashed border-emerald-700/30 bg-white/5" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm font-bold text-emerald-200/80 mb-1.5 text-center">{stage.name}</p>

      <div className="w-3/4 max-w-[220px] flex flex-col items-stretch">
        {/* Card backs (deck thickness) — stacked upward */}
        {layers > 0 && (
          <div className="relative w-full" style={{ height: layers * 4 }}>
            {Array.from({ length: layers }).map((_, i) => (
              <span key={i} aria-hidden
                className={cn('absolute left-0.5 right-0.5 rounded-t-xl border border-b-0 border-slate-300/50', BACK_PATTERN)}
                style={{ top: i * 4, height: 8, zIndex: i }} />
            ))}
          </div>
        )}

        {/* Peek strips — name по центру + problem flag */}
        {peeks.map((p) => (
          <div key={p.id}
            className={cn(
              'w-full h-6 flex items-center justify-center px-2 flex-shrink-0 relative',
              isProblem(p) ? 'border-x border-t border-rose-300/60 bg-rose-50/90' : 'border-x border-t border-slate-200 bg-white'
            )}>
            <span className={cn('text-xs font-medium truncate max-w-[85%] text-center', isProblem(p) ? 'text-rose-600' : 'text-slate-700')}>
              {p.name ?? p.id}
            </span>
            {!isProblem(p) && <span className="absolute right-1.5 text-emerald-500 text-xs font-bold">✓</span>}
          </div>
        ))}

        {/* Main card — по высоте меньше, 3/4 колонки */}
        {main && (
          <button type="button" onClick={() => setSel(main.id)}
            className={cn(
              'relative w-full aspect-[5/2] overflow-hidden border-2 shadow-md transition-all hover:shadow-lg text-left',
              peeks.length > 0 || layers > 0 ? 'rounded-b-xl' : 'rounded-xl',
              peeks.length === 0 && layers === 0 && 'rounded-t-xl',
              isProblem(main)
                ? 'border-rose-400/80 bg-[linear-gradient(165deg,#fff5f5_0%,#ffe4e6_40%,#fecdd3_100%)]'
                : 'border-slate-300/90 bg-[linear-gradient(165deg,#ffffff_0%,#fafbfc_50%,#f1f5f9_100%)]',
              selId === main.id && 'ring-2 ring-emerald-400 ring-offset-2'
            )}>
            <div className="absolute inset-1 rounded-lg border border-slate-200/50 pointer-events-none" aria-hidden />
            <div className="relative h-full flex flex-col items-center justify-center py-1.5 px-2">
              <p className="text-sm font-semibold text-slate-900 text-center leading-tight line-clamp-2 w-full font-sans">
                {main.name ?? main.id}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                {!isProblem(main) && <span className="text-emerald-500 text-xs font-bold">✓</span>}
                <span className="text-xs font-medium text-slate-400 tabular-nums">{ci + 1}/{n}</span>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Navigation only — при листании обновляем расклад справа */}
      {n > 1 && (
        <div className="flex items-center justify-center gap-4 mt-1">
          <button type="button" onClick={() => { flip(-1); const prev = leads[ci - 1]; if (prev) setSel(prev.id) }} disabled={!canPrev}
            className="text-rose-500 text-3xl font-bold disabled:opacity-20 hover:scale-110 active:scale-95 transition-transform select-none leading-none">
            ◂♦
          </button>
          <button type="button" onClick={() => { flip(1); const next = leads[ci + 1]; if (next) setSel(next.id) }} disabled={!canNext}
            className="text-rose-500 text-3xl font-bold disabled:opacity-20 hover:scale-110 active:scale-95 transition-transform select-none leading-none">
            ♦▸
          </button>
        </div>
      )}
    </div>
  )
}
