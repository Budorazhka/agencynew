import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import { useAuth } from '@/context/AuthContext'
import { mockProperties } from './mock-data'
import { PropertyAlerts, type AlertFilter } from './PropertyAlerts'
import { Toolbar, type TabValue, type ViewMode } from './Toolbar'
import { PropertyTable } from './PropertyTable'
import { BulkBar } from './BulkBar'
import { FilterPanel } from './FilterPanel'
import { ScopeToggle, type Scope } from './ScopeToggle'
import { PropertyWizardDialog } from './PropertyWizardDialog'
import { getConditionState } from './utils'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { FiltersState, PropertyCategory, PropertyWizardValues, SaleStatus } from './types'
import { EMPTY_FILTERS } from './types'
import '@/components/leads/leads-secret-table.css'

const PROPERTIES_STORAGE_KEY = 'agency.product.properties'

export function MyPropertiesPage() {
  const navigate = useNavigate()
  const { isManager, isMarketer } = useRolePermissions()
  const { currentUser } = useAuth()

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]   = useState<TabValue>('secondary')
  const [search, setSearch]         = useState('')
  const [viewMode, setViewMode]     = useState<ViewMode>('table')
  const [sortDesc, setSortDesc]     = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters]       = useState<FiltersState>(EMPTY_FILTERS)
  const [alertFilter, setAlertFilter] = useState<AlertFilter>(null)
  const [agentFilter, setAgentFilter] = useState<string | null>(null)
  const [wizardState, setWizardState] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    propertyId?: string
    defaults?: Partial<PropertyWizardValues>
  }>({
    open: false,
    mode: 'create',
  })

  // Scope: менеджер начинает с "мои", РОП+ сразу "все"
  const [scope, setScope] = useState<Scope>(isManager ? 'my' : 'all')
  const readOnly  = isMarketer || (isManager && scope === 'all')
  const isBulkMode = selectedIds.size > 0 && !readOnly
  const isArchive  = activeTab === 'archive'

  // ── Data ───────────────────────────────────────────────────────────────────
  const [properties, setProperties] = useState(() => {
    try {
      const raw = window.localStorage.getItem(PROPERTIES_STORAGE_KEY)
      if (!raw) return mockProperties
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : mockProperties
    } catch {
      return mockProperties
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties))
    } catch {
      // Ignore storage errors and keep working with in-memory state.
    }
  }, [properties])

  /** Базовый список по scope (до tab/search/filters) */
  const scopedProperties = useMemo(() => {
    return scope === 'my'
      ? properties.filter((p) => p.agentId === currentUser?.id)
      : properties
  }, [properties, scope, currentUser])

  /** Статистика менеджеров для фильтра РОП+ (только scope=all) */
  const agentStats = useMemo(() => {
    if (scope !== 'all') return []
    const map = new Map<string, { agentId: string; agentName: string; total: number; overdue: number }>()
    for (const p of scopedProperties) {
      if (p.status === 'archive') continue
      const entry = map.get(p.agentId)
      const isOverdue = getConditionState(p.updatedAt) === 'needs_update'
      if (entry) {
        entry.total++
        if (isOverdue) entry.overdue++
      } else {
        map.set(p.agentId, { agentId: p.agentId, agentName: p.agentName, total: 1, overdue: isOverdue ? 1 : 0 })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.overdue - a.overdue)
  }, [scopedProperties, scope])

  /** Счётчики для панели управления (только активные, не архив) */
  const alertCounts = useMemo(() => {
    const active = scopedProperties.filter((p) => p.status !== 'archive' && p.status !== 'draft')
    return {
      upToDate:       active.filter((p) => getConditionState(p.updatedAt) === 'up_to_date').length,
      needsAttention: active.filter((p) => getConditionState(p.updatedAt) === 'needs_attention').length,
      needsUpdate:    active.filter((p) => getConditionState(p.updatedAt) === 'needs_update').length,
      drafts:         scopedProperties.filter((p) => p.status === 'draft').length,
      archived:       properties.filter((p) => p.status === 'archive' && (scope === 'all' || p.agentId === currentUser?.id)).length,
    }
  }, [scopedProperties, properties, scope, currentUser])

  /** Итоговый отфильтрованный список */
  const filtered = useMemo(() => {
    let list = scopedProperties

    // Tab / category
    if (isArchive) {
      list = list.filter((p) => p.status === 'archive')
    } else {
      const catMap: Record<TabValue, string> = {
        secondary: 'secondary', rent: 'rent', commercial: 'commercial', other: 'other', archive: '',
      }
      list = list.filter((p) => p.category === catMap[activeTab] && p.status !== 'archive')
    }

    // Alert quick-filter (переопределяет обычные фильтры для быстрого доступа)
    if (alertFilter) {
      if (alertFilter === 'up_to_date')      list = list.filter((p) => getConditionState(p.updatedAt) === 'up_to_date')
      if (alertFilter === 'needs_attention') list = list.filter((p) => getConditionState(p.updatedAt) === 'needs_attention')
      if (alertFilter === 'needs_update')    list = list.filter((p) => getConditionState(p.updatedAt) === 'needs_update')
      if (alertFilter === 'draft')           list = list.filter((p) => p.status === 'draft')
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.street.toLowerCase().includes(q),
      )
    }

    // Agent filter (только РОП+ в scope=all)
    if (agentFilter) list = list.filter((p) => p.agentId === agentFilter)

    // Advanced filters
    if (filters.types.length)      list = list.filter((p) => filters.types.includes(p.type))
    if (filters.statuses.length)   list = list.filter((p) => filters.statuses.includes(p.status))
    if (filters.conditions.length) list = list.filter((p) => filters.conditions.includes(getConditionState(p.updatedAt)))
    if (filters.priceMin)          list = list.filter((p) => p.price >= +filters.priceMin)
    if (filters.priceMax)          list = list.filter((p) => p.price <= +filters.priceMax)
    if (filters.areaMin)           list = list.filter((p) => p.area >= +filters.areaMin)
    if (filters.areaMax)           list = list.filter((p) => p.area <= +filters.areaMax)

    return [...list].sort((a, b) => {
      const da = new Date(a.listedAt).getTime()
      const db = new Date(b.listedAt).getTime()
      return sortDesc ? db - da : da - db
    })
  }, [scopedProperties, activeTab, alertFilter, agentFilter, search, sortDesc, filters, isArchive])

  const totalCount = scopedProperties.filter((p) => p.status !== 'archive').length
  const editingProperty = wizardState.propertyId
    ? properties.find((property) => property.id === wizardState.propertyId) ?? null
    : null

  const activeFiltersCount = useMemo(() => {
    let n = 0
    if (filters.types.length)      n++
    if (filters.statuses.length)   n++
    if (filters.conditions.length) n++
    if (filters.priceMin)          n++
    if (filters.priceMax)          n++
    if (filters.areaMin)           n++
    if (filters.areaMax)           n++
    return n
  }, [filters])

  // ── Handlers ───────────────────────────────────────────────────────────────

  function toggleSelect(id: string) {
    if (readOnly) return
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function toggleAll() {
    if (readOnly) return
    const ids = filtered.map((p) => p.id)
    const all = ids.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const n = new Set(prev)
      all ? ids.forEach((id) => n.delete(id)) : ids.forEach((id) => n.add(id))
      return n
    })
  }

  function handleBulkApply(status: SaleStatus) {
    setProperties((prev) => prev.map((p) => selectedIds.has(p.id) ? { ...p, status } : p))
    setSelectedIds(new Set())
  }

  function handleDeleteSelected() {
    setProperties((prev) => prev.filter((p) => !selectedIds.has(p.id)))
    setSelectedIds(new Set())
  }

  function handleDelete(id: string) {
    setProperties((prev) => prev.filter((p) => p.id !== id))
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n })
  }

  function handleRestore(id: string) {
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, status: 'for_sale' as const } : p))
  }

  function handleScopeChange(s: Scope) {
    setScope(s)
    setSelectedIds(new Set())
    setActiveTab('secondary')
    setSearch('')
    setFilters(EMPTY_FILTERS)
    setAlertFilter(null)
    setAgentFilter(null)
  }

  function handleAlertFilter(f: AlertFilter) {
    setAlertFilter(f)
    // При выборе фильтра из блока управления — сбрасываем таб на 'secondary'
    if (f && f !== 'archive') setActiveTab('secondary')
    if (f === 'archive') setActiveTab('archive')
    setSelectedIds(new Set())
  }

  function closeWizard() {
    setWizardState((prev) => ({ ...prev, open: false, propertyId: undefined, defaults: undefined }))
  }

  function openCreateWizard() {
    const categoryFromTab: PropertyCategory =
      activeTab === 'secondary' || activeTab === 'rent' || activeTab === 'commercial' || activeTab === 'other'
        ? activeTab
        : 'secondary'

    setWizardState({
      open: true,
      mode: 'create',
      defaults: {
        category: categoryFromTab,
        status: activeTab === 'archive' ? 'draft' : 'for_sale',
      },
    })
  }

  function openEditWizard(id: string) {
    setWizardState({
      open: true,
      mode: 'edit',
      propertyId: id,
    })
  }

  function handleWizardSave(nextProperty: (typeof properties)[number]) {
    const isEdit = wizardState.mode === 'edit'

    setProperties((prev) => {
      if (isEdit) {
        return prev.map((property) => (property.id === nextProperty.id ? nextProperty : property))
      }
      return [nextProperty, ...prev]
    })

    setSelectedIds(new Set())
    setSearch('')
    setAlertFilter(nextProperty.status === 'archive' ? 'archive' : nextProperty.status === 'draft' ? 'draft' : null)
    setActiveTab(nextProperty.status === 'archive' ? 'archive' : nextProperty.category)
    closeWizard()
  }

  const wizardActor = {
    id: currentUser?.id ?? 'lm-1',
    name: currentUser?.name ?? 'Менеджер',
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const pageTitle = scope === 'my' ? 'МОИ ОБЪЕКТЫ' : 'ВСЕ ОБЪЕКТЫ'

  return (
    <div className="leads-page-root -m-6 min-h-[calc(100vh+3rem)] lg:-m-8 lg:min-h-[calc(100vh+4rem)]">
      <div className="leads-page-bg" aria-hidden />
      <div className="leads-page-ornament" aria-hidden />
      <div className="leads-page relative z-10 space-y-4 p-6 lg:p-8">

        {/* ── Header ── */}
        <div className="flex items-center gap-4 pb-4 border-b border-[rgba(242,207,141,0.15)]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium text-[rgba(242,207,141,0.5)] hover:text-[#fcecc8] transition-colors"
          >
            <ArrowLeft className="size-4" />
            Вернуться
          </button>

          <div className="flex-1 flex items-center gap-2.5">
            <h1 className="text-lg font-bold tracking-tight text-[#fcecc8]">{pageTitle}</h1>
            <span className="rounded-full border border-[rgba(242,207,141,0.2)] bg-[rgba(242,207,141,0.07)] px-2.5 py-0.5 text-xs font-semibold text-[rgba(242,207,141,0.6)]">
              {totalCount} объектов
            </span>
          </div>

          {!readOnly && (
            <button
              onClick={openCreateWizard}
              className="flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="size-4" />
              Добавить объект
            </button>
          )}
        </div>

        {/* ── Scope toggle (только для менеджера) ── */}
        {isManager && (
          <ScopeToggle scope={scope} onChange={handleScopeChange} />
        )}

        {/* ── Фильтр по менеджерам (РОП+ в scope=all) ── */}
        {scope === 'all' && !isManager && agentStats.length > 0 && (
          <Select value={agentFilter ?? 'all'} onValueChange={(v) => setAgentFilter(v === 'all' ? null : v)}>
            <SelectTrigger className="h-9 w-64 rounded-xl border border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.35)] text-sm text-[#fcecc8] shadow-none focus:ring-1 focus:ring-[rgba(242,207,141,0.2)] focus:border-[rgba(242,207,141,0.5)] [&>span]:text-[#fcecc8]">
              <SelectValue placeholder="Все менеджеры" />
            </SelectTrigger>
            <SelectContent className="border-[rgba(242,207,141,0.2)] bg-[rgba(9,36,28,0.98)] text-[#fcecc8] backdrop-blur-sm">
              <SelectItem value="all" className="text-[#fcecc8] focus:bg-[rgba(242,207,141,0.1)] focus:text-[#fcecc8]">
                Все менеджеры
              </SelectItem>
              {agentStats.map((a) => (
                <SelectItem key={a.agentId} value={a.agentId} className="text-[#fcecc8] focus:bg-[rgba(242,207,141,0.1)] focus:text-[#fcecc8]">
                  <span className="flex items-center gap-2">
                    {a.agentName}
                    {a.overdue > 0 && (
                      <span className="rounded-full bg-red-500/20 border border-red-500/30 px-1.5 text-[10px] font-semibold text-red-400">
                        {a.overdue} просрочки
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* ── Обзор / быстрый фильтр ── */}
        <PropertyAlerts
          upToDate={alertCounts.upToDate}
          needsAttention={alertCounts.needsAttention}
          needsUpdate={alertCounts.needsUpdate}
          drafts={alertCounts.drafts}
          archived={alertCounts.archived}
          activeFilter={alertFilter}
          onFilterChange={handleAlertFilter}
        />

        {/* ── Toolbar ── */}
        <Toolbar
          activeTab={activeTab}
          onTabChange={(tab) => { setActiveTab(tab); setSelectedIds(new Set()); setAlertFilter(null) }}
          search={search}
          onSearchChange={setSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortDesc={sortDesc}
          onSortToggle={() => setSortDesc((v) => !v)}
          onFiltersOpen={() => setFiltersOpen(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* ── Bulk bar (не-архив, не readOnly) ── */}
        {!isArchive && !readOnly && (
          <BulkBar
            selectedCount={selectedIds.size}
            onApply={handleBulkApply}
            onDeleteSelected={handleDeleteSelected}
          />
        )}

        {/* ── Table / Grid / Compact ── */}
        <PropertyTable
          properties={filtered}
          isArchive={isArchive}
          isBulkMode={isBulkMode}
          selectedIds={selectedIds}
          viewMode={viewMode}
          readOnly={readOnly}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          onEdit={openEditWizard}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />

        {/* ── Filter dialog ── */}
        <FilterPanel
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          filters={filters}
          onApply={setFilters}
        />

        {!readOnly && (
          <PropertyWizardDialog
            open={wizardState.open}
            mode={wizardState.mode}
            actor={wizardActor}
            property={editingProperty}
            defaults={wizardState.defaults}
            onClose={closeWizard}
            onSave={handleWizardSave}
          />
        )}

      </div>
    </div>
  )
}
