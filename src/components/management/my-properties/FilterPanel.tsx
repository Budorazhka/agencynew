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
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100/50">{label}</p>
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
                  ? 'border-[#e6c364]/60 bg-[#e6c364]/15 text-[#e6c364]'
                  : 'border-emerald-800/50 bg-[#00110d] text-[#d0e8df] hover:border-[#e6c364]/35',
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
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100/50">
        {label}, {unit}
      </p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="От"
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
          className="w-full rounded-lg border border-emerald-800/50 bg-[#00110d] px-3 py-1.5 text-sm text-[#d0e8df] outline-none transition-all placeholder:text-emerald-100/35 focus:border-[#e6c364]/50 focus:ring-1 focus:ring-[#e6c364]/20"
        />
        <span className="shrink-0 text-emerald-100/45">—</span>
        <input
          type="number"
          placeholder="До"
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value)}
          className="w-full rounded-lg border border-emerald-800/50 bg-[#00110d] px-3 py-1.5 text-sm text-[#d0e8df] outline-none transition-all placeholder:text-emerald-100/35 focus:border-[#e6c364]/50 focus:ring-1 focus:ring-[#e6c364]/20"
        />
      </div>
    </div>
  )
}

export function FilterPanel({ open, onClose, filters, onApply }: FilterPanelProps) {
  // Local state — applied only on "Применить"
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

  // Sync local when dialog opens
  function handleOpenAutoFocus() {
    setLocal(filters)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg border-emerald-900/40 bg-[#0a1f1a] text-[#d0e8df] shadow-xl"
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <DialogHeader>
          <DialogTitle className="text-white">Фильтры</DialogTitle>
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

        <div className="flex items-center justify-between gap-3 border-t border-emerald-900/40 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-emerald-800/50 px-5 py-2 text-sm font-medium text-emerald-100/60 transition-colors hover:border-[#e6c364]/40 hover:text-[#d0e8df]"
          >
            Сбросить
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-sm bg-[#e6c364] px-6 py-2 text-sm font-semibold text-[#3d2e00] transition-all hover:brightness-110"
          >
            Применить
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
