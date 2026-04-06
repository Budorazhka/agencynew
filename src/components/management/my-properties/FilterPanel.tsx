import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { FiltersState, PropertyType, SaleStatus, ConditionState } from './types'
import { EMPTY_FILTERS } from './types'
import { PROPERTY_TYPE_OPTIONS, SALE_STATUS_OPTIONS } from './wizard-config'

interface FilterPanelProps {
  open: boolean
  onClose: () => void
  filters: FiltersState
  onApply: (f: FiltersState) => void
}

const SALE_STATUSES: { value: SaleStatus; label: string }[] = [
  ...SALE_STATUS_OPTIONS.filter((option) => option.value !== 'archive'),
]
const CONDITIONS: { value: ConditionState; label: string }[] = [
  { value: 'up_to_date',      label: 'Актуально' },
  { value: 'needs_attention', label: 'Требует внимания' },
  { value: 'needs_update',    label: 'Нужно обновить' },
]

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
}

function CheckboxGroup<T extends string>({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string
  items: { value: T; label: string }[]
  selected: T[]
  onToggle: (v: T) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--app-text-subtle)]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = selected.includes(item.value)
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onToggle(item.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-[color:var(--hub-card-border-hover)] bg-[var(--nav-item-bg-active)] text-[color:var(--theme-accent-heading)]'
                  : 'border-[var(--green-border)] bg-[var(--rail-bg)] text-[color:var(--workspace-text)] hover:border-[color:var(--hub-card-border-hover)]',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function RangeInputs({
  label,
  unit,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: {
  label: string
  unit: string
  minValue: string
  maxValue: string
  onMinChange: (v: string) => void
  onMaxChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--app-text-subtle)]">
        {label}, {unit}
      </p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="От"
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
          className="w-full rounded-lg border border-[var(--green-border)] bg-[var(--rail-bg)] px-3 py-1.5 text-sm text-[color:var(--workspace-text)] outline-none transition-all placeholder:text-[color:var(--app-text-subtle)] focus:border-[color:var(--hub-card-border-hover)] focus:ring-1 focus:ring-[color:var(--hub-card-border)]"
        />
        <span className="shrink-0 text-[color:var(--app-text-subtle)]">—</span>
        <input
          type="number"
          placeholder="До"
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value)}
          className="w-full rounded-lg border border-[var(--green-border)] bg-[var(--rail-bg)] px-3 py-1.5 text-sm text-[color:var(--workspace-text)] outline-none transition-all placeholder:text-[color:var(--app-text-subtle)] focus:border-[color:var(--hub-card-border-hover)] focus:ring-1 focus:ring-[color:var(--hub-card-border)]"
        />
      </div>
    </div>
  )
}

export function FilterPanel({ open, onClose, filters, onApply }: FilterPanelProps) {
  // Локальное состояние — применяется только по кнопке «Применить»
  const [local, setLocal] = useState<FiltersState>(filters)

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) onClose()
  }

  function handleApply() {
    onApply(local)
    onClose()
  }

  function handleReset() {
    setLocal(EMPTY_FILTERS)
  }

  // При открытии окна подтягиваем значения в локальное состояние
  function handleOpenAutoFocus() {
    setLocal(filters)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg border-[var(--green-border)] bg-[var(--green-deep)] text-[color:var(--workspace-text)] shadow-xl"
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <DialogHeader>
          <DialogTitle className="text-[color:var(--app-text)]">Фильтры</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <CheckboxGroup<PropertyType>
            label="Тип объекта"
            items={PROPERTY_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            selected={local.types}
            onToggle={(v) => setLocal((f) => ({ ...f, types: toggleItem(f.types, v) }))}
          />

          <CheckboxGroup<SaleStatus>
            label="Статус продажи"
            items={SALE_STATUSES}
            selected={local.statuses}
            onToggle={(v) => setLocal((f) => ({ ...f, statuses: toggleItem(f.statuses, v) }))}
          />

          <CheckboxGroup<ConditionState>
            label="Состояние"
            items={CONDITIONS}
            selected={local.conditions}
            onToggle={(v) => setLocal((f) => ({ ...f, conditions: toggleItem(f.conditions, v) }))}
          />

          <RangeInputs
            label="Цена"
            unit="$"
            minValue={local.priceMin}
            maxValue={local.priceMax}
            onMinChange={(v) => setLocal((f) => ({ ...f, priceMin: v }))}
            onMaxChange={(v) => setLocal((f) => ({ ...f, priceMax: v }))}
          />

          <RangeInputs
            label="Площадь"
            unit="м²"
            minValue={local.areaMin}
            maxValue={local.areaMax}
            onMinChange={(v) => setLocal((f) => ({ ...f, areaMin: v }))}
            onMaxChange={(v) => setLocal((f) => ({ ...f, areaMax: v }))}
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--green-border)] pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-[var(--green-border)] px-5 py-2 text-sm font-medium text-[color:var(--app-text-subtle)] transition-colors hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--workspace-text)]"
          >
            Сбросить
          </button>
          <button type="button" onClick={handleApply} className="alphabase-section-primary !normal-case px-6 py-2">
            Применить
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
