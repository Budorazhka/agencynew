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
                  : 'border-[color:var(--hub-card-border-hover)] bg-[var(--nav-item-bg-active)] text-[color:var(--theme-accent-heading)] shadow-sm'
                : 'border-[var(--green-border)] bg-[var(--green-deep)] text-[color:var(--app-text-muted)] hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--workspace-text)]',
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
        className="flex items-center gap-1.5 rounded-full border border-[var(--green-border)] bg-[var(--green-deep)] px-3.5 py-1.5 text-sm font-medium text-[color:var(--app-text-muted)] transition-colors hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--workspace-text)]"
      >
        <ArrowUpDown className="size-3.5 text-[color:var(--theme-accent-icon-dim)]" />
        {sortDesc ? 'От новых к старым' : 'От старых к новым'}
      </button>

      {/* Search */}
      <div className="relative min-w-[220px] flex-1 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[color:var(--theme-accent-icon-dim)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Название, адрес или продавец"
          className="w-full rounded-full border border-[var(--shell-search-border)] bg-[var(--shell-search-bg)] py-1.5 pl-9 pr-4 text-sm text-[color:var(--shell-search-fg)] outline-none transition-all placeholder:text-[color:var(--shell-search-ph)] focus:border-[color:var(--hub-card-border-hover)] focus:ring-1 focus:ring-[color:var(--hub-card-border)]"
        />
      </div>

      {/* Filters button */}
      <button
        onClick={onFiltersOpen}
        className={cn(
          'relative flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
          activeFiltersCount > 0
            ? 'border-[color:var(--hub-card-border-hover)] bg-[var(--nav-item-bg-active)] text-[color:var(--workspace-text)]'
            : 'border-[var(--green-border)] bg-[var(--green-deep)] text-[color:var(--app-text-muted)] hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--workspace-text)]',
        )}
      >
        <SlidersHorizontal className="size-3.5" />
        Фильтры
        {activeFiltersCount > 0 && (
          <span className="flex size-4 items-center justify-center rounded-full bg-[var(--gold)] text-[10px] font-bold text-[color:var(--hub-tile-icon-hover-fg)]">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* View mode switcher */}
      <div className="flex items-center rounded-lg border border-[var(--green-border)] bg-[var(--green-deep)] p-0.5">
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
                ? 'bg-[var(--nav-item-bg-active)] text-[color:var(--theme-accent-heading)]'
                : 'text-[color:var(--app-text-subtle)] hover:text-[color:var(--app-text)]',
            )}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
    </div>
  )
}
