import { ArrowUpDown, Search, SlidersHorizontal, Grid2x2, LayoutList, AlignJustify } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TabValue = 'secondary' | 'rent' | 'commercial' | 'other' | 'archive'
export type ViewMode = 'table' | 'grid' | 'compact'

const tabs: { value: TabValue; label: string }[] = [
  { value: 'secondary', label: 'Вторичка' },
  { value: 'rent',      label: 'Аренда' },
  { value: 'commercial',label: 'Коммерция' },
  { value: 'other',     label: 'Другое' },
  { value: 'archive',   label: 'Архив' },
]

interface ToolbarProps {
  activeTab: TabValue
  onTabChange: (tab: TabValue) => void
  search: string
  onSearchChange: (v: string) => void
  viewMode: ViewMode
  onViewModeChange: (v: ViewMode) => void
  sortDesc: boolean
  onSortToggle: () => void
  onFiltersOpen: () => void
  activeFiltersCount: number
}

export function Toolbar({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortDesc,
  onSortToggle,
  onFiltersOpen,
  activeFiltersCount,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Tab pills */}
      <div className="flex items-center gap-1 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
              activeTab === tab.value
                ? tab.value === 'archive'
                  ? 'border-[rgba(100,140,200,0.4)] bg-[rgba(100,140,200,0.12)] text-[rgba(180,200,240,0.9)] shadow-sm'
                  : 'border-[rgba(242,207,141,0.5)] bg-[rgba(242,207,141,0.15)] text-[#fcecc8] shadow-sm'
                : 'border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.2)] text-[rgba(242,207,141,0.82)] hover:border-[rgba(242,207,141,0.4)] hover:text-[#fcecc8]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Sort */}
      <button
        onClick={onSortToggle}
        className="flex items-center gap-1.5 rounded-full border border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.2)] px-3.5 py-1.5 text-sm font-medium text-[rgba(242,207,141,0.82)] hover:border-[rgba(242,207,141,0.4)] hover:text-[#fcecc8] transition-colors"
      >
        <ArrowUpDown className="size-3.5 text-[rgba(242,207,141,0.55)]" />
        {sortDesc ? 'От новых к старым' : 'От старых к новым'}
      </button>

      {/* Search */}
      <div className="relative min-w-[220px] flex-1 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[rgba(242,207,141,0.55)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Название, адрес или продавец"
          className="w-full rounded-full border border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.25)] pl-9 pr-4 py-1.5 text-sm text-[#fcecc8] outline-none focus:border-[rgba(242,207,141,0.5)] focus:ring-1 focus:ring-[rgba(242,207,141,0.15)] transition-all placeholder:text-[rgba(242,207,141,0.45)]"
        />
      </div>

      {/* Filters button */}
      <button
        onClick={onFiltersOpen}
        className={cn(
          'relative flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
          activeFiltersCount > 0
            ? 'border-[rgba(242,207,141,0.5)] bg-[rgba(242,207,141,0.1)] text-[#fcecc8]'
            : 'border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.2)] text-[rgba(242,207,141,0.82)] hover:border-[rgba(242,207,141,0.4)] hover:text-[#fcecc8]',
        )}
      >
        <SlidersHorizontal className="size-3.5" />
        Фильтры
        {activeFiltersCount > 0 && (
          <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* View mode switcher */}
      <div className="flex items-center rounded-lg border border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.2)] p-0.5">
        {([
          { mode: 'table',   Icon: AlignJustify, label: 'Таблица' },
          { mode: 'grid',    Icon: Grid2x2,      label: 'Плитка' },
          { mode: 'compact', Icon: LayoutList,   label: 'Компакт' },
        ] as const).map(({ mode, Icon, label }) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            title={label}
            className={cn(
              'rounded p-1.5 transition-colors',
              viewMode === mode
                ? 'bg-[rgba(242,207,141,0.15)] text-[#fcecc8]'
                : 'text-[rgba(242,207,141,0.55)] hover:text-[rgba(242,207,141,0.8)]',
            )}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
    </div>
  )
}
