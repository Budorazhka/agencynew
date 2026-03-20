import { Pencil, Trash2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Property } from './types'
import type { ViewMode } from './Toolbar'
import { SaleStatusBadge, ConditionBadge } from './StatusBadge'
import { PropertyCard } from './PropertyCard'
import { getConditionState, formatPrice, formatDate } from './utils'

// ─── Table: column header ─────────────────────────────────────────────────────

function TableHeader({ isArchive, showCheckbox, allSelected, onToggleAll }: {
  isArchive: boolean
  showCheckbox: boolean
  allSelected: boolean
  onToggleAll: () => void
}) {
  return (
    <div className={cn(
      'grid items-center gap-4 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[rgba(242,207,141,0.62)] bg-[rgba(0,0,0,0.25)] border-b border-[rgba(242,207,141,0.1)]',
      showCheckbox
        ? 'grid-cols-[2rem_3.5rem_1fr_1fr_1fr_1fr_1fr_1fr_auto]'
        : 'grid-cols-[3.5rem_1fr_1fr_1fr_1fr_1fr_1fr_auto]',
    )}>
      {showCheckbox && (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleAll}
            className="accent-emerald-400 size-4 cursor-pointer"
          />
        </div>
      )}
      <div>Фото</div>
      <div>Название/тип</div>
      <div>Расположение</div>
      <div>Параметры</div>
      <div>Цена</div>
      <div>Размещено/Статус</div>
      <div>{isArchive ? 'Обновлено' : 'Дата/Состояние'}</div>
      <div>Действия</div>
    </div>
  )
}

// ─── Table: single row ────────────────────────────────────────────────────────

interface PropertyRowProps {
  property: Property
  isArchive: boolean
  showCheckbox: boolean
  isSelected: boolean
  readOnly: boolean
  onToggleSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onRestore: () => void
}

function PropertyRow({
  property, isArchive, showCheckbox, isSelected, readOnly,
  onToggleSelect, onEdit, onDelete, onRestore,
}: PropertyRowProps) {
  const condition = getConditionState(property.updatedAt)
  const hasFloorData = property.floor > 0 || property.totalFloors > 0
  const priceOnRequest = property.details?.priceOnRequest
  const priceLabel = priceOnRequest ? 'Цена по запросу' : `$${formatPrice(property.price)}`
  const pricePerM2Label = priceOnRequest ? 'Прайс скрыт в витрине' : `$${formatPrice(property.pricePerM2)} за м²`

  return (
    <div
      className={cn(
        'group grid items-center gap-4 px-4 py-3 border-b border-[rgba(242,207,141,0.08)] last:border-0 transition-colors hover:bg-[rgba(242,207,141,0.04)]',
        showCheckbox
          ? 'grid-cols-[2rem_3.5rem_1fr_1fr_1fr_1fr_1fr_1fr_auto]'
          : 'grid-cols-[3.5rem_1fr_1fr_1fr_1fr_1fr_1fr_auto]',
        isSelected && 'bg-[rgba(242,207,141,0.08)]',
      )}
    >
      {/* Checkbox — всегда в колонке, видно при ховере или если выбран */}
      {showCheckbox && (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className={cn(
              'accent-emerald-400 size-4 cursor-pointer transition-opacity',
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            )}
          />
        </div>
      )}

      {/* Photo */}
      <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-[rgba(0,0,0,0.3)]">
        {property.photo
          ? <img src={property.photo} alt={property.title} className="size-full object-cover" />
          : <div className="size-full bg-gradient-to-br from-[rgba(242,207,141,0.1)] to-[rgba(0,0,0,0.2)]" />
        }
      </div>

      {/* Title / type */}
      <div className="min-w-0">
        <p className="font-semibold text-sm leading-snug line-clamp-2 text-[#fcecc8]">{property.title}</p>
        <span className="mt-0.5 text-xs font-medium text-emerald-400">{property.type}</span>
        {!readOnly && (
          <p className="mt-0.5 text-[10px] text-[rgba(242,207,141,0.52)]">{property.agentName}</p>
        )}
      </div>

      {/* Location */}
      <div className="min-w-0 space-y-0.5 text-xs text-[rgba(242,207,141,0.62)]">
        <p>{property.country}</p>
        <p>{property.city}</p>
        <p className="truncate">{property.street}</p>
      </div>

      {/* Parameters */}
      <div className="space-y-0.5 text-xs text-[rgba(242,207,141,0.58)]">
        {hasFloorData && (
          <p>
            {property.floor > 0
              ? <>Этаж: <span className="text-[#fcecc8] font-medium">{property.floor} из {property.totalFloors}</span></>
              : <>Этажей: <span className="text-[#fcecc8] font-medium">{property.totalFloors}</span></>}
          </p>
        )}
        {property.rooms > 0 && (
          <p>Комнат: <span className="text-[#fcecc8] font-medium">{property.rooms}+1</span></p>
        )}
        <p>Площадь: <span className="text-[#fcecc8] font-medium">{property.area} м²</span></p>
      </div>

      {/* Price */}
      <div className="min-w-0">
        <p className="text-base font-bold text-[#fcecc8]">{priceLabel}</p>
        <p className="text-xs text-[rgba(242,207,141,0.58)]">{pricePerM2Label}</p>
      </div>

      {/* Listed date + sale status */}
      <div className="space-y-1.5">
        <p className="text-xs text-[rgba(242,207,141,0.58)]">
          Размещено: <span className="text-[rgba(242,207,141,0.88)]">{formatDate(property.listedAt)}</span>
        </p>
        <SaleStatusBadge status={property.status} />
      </div>

      {/* Date + condition */}
      <div className="space-y-1.5">
        <p className="text-xs text-[rgba(242,207,141,0.58)]">
          Обновлено <span className="text-[rgba(242,207,141,0.88)]">{formatDate(property.updatedAt)}</span>
        </p>
        {!isArchive && <ConditionBadge state={condition} />}
      </div>

      {/* Actions */}
      {isArchive ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={onRestore}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="size-3.5" />
            Восстановить
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/25 px-3 py-1.5 text-xs font-semibold text-red-400/70 hover:bg-red-500/10 hover:text-red-300 transition-colors whitespace-nowrap"
          >
            <Trash2 className="size-3.5" />
            Удалить
          </button>
        </div>
      ) : readOnly ? (
        <div className="text-xs text-[rgba(242,207,141,0.48)] italic">Только просмотр</div>
      ) : (
        <div className="flex items-center gap-1">
          <ActionButton onClick={onEdit} icon={<Pencil className="size-3.5" />} label="Изменить" />
          <IconButton onClick={onDelete} icon={<Trash2 className="size-3.5" />} aria-label="Удалить" danger />
        </div>
      )}
    </div>
  )
}

// ─── Compact row ──────────────────────────────────────────────────────────────

function CompactRow({
  property, isArchive, showCheckbox, isSelected, readOnly,
  onToggleSelect, onEdit, onDelete, onRestore,
}: Omit<PropertyRowProps, 'isBulkMode'>) {
  const condition = getConditionState(property.updatedAt)
  const priceLabel = property.details?.priceOnRequest ? 'По запросу' : `$${formatPrice(property.price)}`

  return (
    <div
      className={cn(
        'group grid items-center gap-3 px-4 py-1.5 border-b border-[rgba(242,207,141,0.08)] last:border-0 transition-colors hover:bg-[rgba(242,207,141,0.04)] text-sm',
        showCheckbox
          ? 'grid-cols-[2rem_1fr_1fr_auto_auto_auto_auto]'
          : 'grid-cols-[1fr_1fr_auto_auto_auto_auto]',
        isSelected && 'bg-[rgba(242,207,141,0.08)]',
      )}
    >
      {showCheckbox && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className={cn(
            'accent-emerald-400 size-4 cursor-pointer transition-opacity',
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        />
      )}
      <div className="min-w-0">
        <p className="font-medium truncate text-[#fcecc8]">{property.title}</p>
        <p className="text-xs text-emerald-400">{property.type}</p>
      </div>
      <div className="text-xs text-[rgba(242,207,141,0.62)] truncate">{property.city}, {property.street}</div>
      <p className="font-bold whitespace-nowrap text-[#fcecc8]">{priceLabel}</p>
      <SaleStatusBadge status={property.status} />
      {!isArchive && <ConditionBadge state={condition} />}
      {isArchive ? (
        <div className="flex gap-1">
          <button onClick={onRestore} className="rounded p-1 text-emerald-400 hover:bg-[rgba(242,207,141,0.07)] transition-colors" title="Восстановить">
            <RotateCcw className="size-3.5" />
          </button>
          <button onClick={onDelete} className="rounded p-1 text-red-400/70 hover:bg-red-500/10 hover:text-red-300 transition-colors" title="Удалить">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ) : readOnly ? null : (
        <div className="flex gap-1">
          <button onClick={onEdit} className="rounded p-1 text-emerald-400 hover:bg-[rgba(242,207,141,0.07)] transition-colors" title="Изменить">
            <Pencil className="size-3.5" />
          </button>
          <button onClick={onDelete} className="rounded p-1 text-red-400/70 hover:bg-red-500/10 hover:text-red-300 transition-colors" title="Удалить">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function ActionButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-[rgba(242,207,141,0.07)] transition-colors">
      {icon}{label}
    </button>
  )
}

function IconButton({ onClick, icon, danger, 'aria-label': ariaLabel }: {
  onClick: () => void; icon: React.ReactNode; danger?: boolean; 'aria-label': string
}) {
  return (
    <button onClick={onClick} aria-label={ariaLabel}
      className={cn('rounded p-1.5 transition-colors',
        danger ? 'text-red-400/70 hover:bg-red-500/10 hover:text-red-300' : 'text-[rgba(242,207,141,0.58)] hover:bg-[rgba(242,207,141,0.07)] hover:text-[#fcecc8]',
      )}>
      {icon}
    </button>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface PropertyTableProps {
  properties: Property[]
  isArchive: boolean
  isBulkMode: boolean
  selectedIds: Set<string>
  viewMode: ViewMode
  readOnly: boolean
  onToggleSelect: (id: string) => void
  onToggleAll: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
}

export function PropertyTable({
  properties, isArchive, isBulkMode: _isBulkMode, selectedIds, viewMode, readOnly,
  onToggleSelect, onToggleAll, onEdit, onDelete, onRestore,
}: PropertyTableProps) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-[rgba(242,207,141,0.58)]">
        <p className="text-2xl mb-2">🏠</p>
        <p className="font-medium">Объекты не найдены</p>
        <p className="text-sm mt-1">Попробуйте изменить фильтры или добавьте новый объект</p>
      </div>
    )
  }

  // Чекбоксы показываем всегда для редактируемых строк (не архив, не readOnly)
  const showCheckbox = !readOnly && !isArchive
  const allSelected = properties.length > 0 && properties.every((p) => selectedIds.has(p.id))

  // ── Grid view ──
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {properties.map((p) => (
          <PropertyCard
            key={p.id}
            property={p}
            readOnly={readOnly || isArchive}
            onEdit={() => onEdit(p.id)}
            onDelete={() => onDelete(p.id)}
          />
        ))}
      </div>
    )
  }

  // ── Compact view ──
  if (viewMode === 'compact') {
    return (
      <div className="rounded-xl border border-[rgba(242,207,141,0.12)] bg-[rgba(0,0,0,0.15)] overflow-hidden">
        {properties.map((p) => (
          <CompactRow
            key={p.id}
            property={p}
            isArchive={isArchive}
            showCheckbox={showCheckbox}
            isSelected={selectedIds.has(p.id)}
            readOnly={readOnly}
            onToggleSelect={() => onToggleSelect(p.id)}
            onEdit={() => onEdit(p.id)}
            onDelete={() => onDelete(p.id)}
            onRestore={() => onRestore(p.id)}
          />
        ))}
      </div>
    )
  }

  // ── Table view (default) ──
  return (
    <div className="rounded-xl border border-[rgba(242,207,141,0.12)] bg-[rgba(0,0,0,0.15)] overflow-hidden">
      <TableHeader
        isArchive={isArchive}
        showCheckbox={showCheckbox}
        allSelected={allSelected}
        onToggleAll={onToggleAll}
      />
      {properties.map((p) => (
        <PropertyRow
          key={p.id}
          property={p}
          isArchive={isArchive}
          showCheckbox={showCheckbox}
          isSelected={selectedIds.has(p.id)}
          readOnly={readOnly}
          onToggleSelect={() => onToggleSelect(p.id)}
          onEdit={() => onEdit(p.id)}
          onDelete={() => onDelete(p.id)}
          onRestore={() => onRestore(p.id)}
        />
      ))}
    </div>
  )
}
