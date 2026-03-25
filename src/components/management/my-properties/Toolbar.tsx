import { ArrowUpDown, Search, SlidersHorizontal, Grid2x2, LayoutList, AlignJustify } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TabValue = 'primary' | 'secondary' | 'rent' | 'commercial' | 'other' | 'archive'
export type ViewMode = 'table' | 'grid' | 'compact'

const tabs: { value: TabValue; label: string }[] = [
  { value: 'primary',   label: 'Первичка' },
  { value: 'secondary', label: 'Вторичка' },
  { value: 'rent',      label: 'Аренда' },
  { value: 'commercial', label: 'Коммерция' },
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
                  ? 'border-sky-500/35 bg-sky-950/40 text-sky-200 shadow-sm'
                  : 'border-[#e6c364]/45 bg-[#e6c364]/12 text-[#e6c364] shadow-sm'
                : 'border-emerald-800/45 bg-[#0a1f1a] text-emerald-100/70 hover:border-[#e6c364]/35 hover:text-[#d0e8df]',
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
        className="flex items-center gap-1.5 rounded-full border border-emerald-800/45 bg-[#0a1f1a] px-3.5 py-1.5 text-sm font-medium text-emerald-100/75 transition-colors hover:border-[#e6c364]/35 hover:text-[#d0e8df]"
      >
        <ArrowUpDown className="size-3.5 text-[#e6c364]/55" />
        {sortDesc ? 'От новых к старым' : 'От старых к новым'}
      </button>

      {/* Search */}
      <div className="relative min-w-[220px] flex-1 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#e6c364]/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Название, адрес или продавец"
          className="w-full rounded-full border border-emerald-800/50 bg-[#00110d] py-1.5 pl-9 pr-4 text-sm text-[#d0e8df] outline-none transition-all placeholder:text-emerald-100/40 focus:border-[#e6c364]/45 focus:ring-1 focus:ring-[#e6c364]/15"
        />
      </div>

      {/* Filters button */}
      <button
        onClick={onFiltersOpen}
        className={cn(
          'relative flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
          activeFiltersCount > 0
            ? 'border-[#e6c364]/45 bg-[#e6c364]/10 text-[#d0e8df]'
            : 'border-emerald-800/45 bg-[#0a1f1a] text-emerald-100/75 hover:border-[#e6c364]/35 hover:text-[#d0e8df]',
        )}
      >
        <SlidersHorizontal className="size-3.5" />
        Фильтры
        {activeFiltersCount > 0 && (
          <span className="flex size-4 items-center justify-center rounded-full bg-[#e6c364] text-[10px] font-bold text-[#3d2e00]">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* View mode switcher */}
      <div className="flex items-center rounded-lg border border-emerald-800/45 bg-[#0a1f1a] p-0.5">
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
                ? 'bg-[#e6c364]/15 text-[#e6c364]'
                : 'text-emerald-100/45 hover:text-emerald-100/80',
            )}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
    </div>
  )
}
