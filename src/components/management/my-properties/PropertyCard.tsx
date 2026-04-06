import { Pencil, Trash2 } from 'lucide-react'
import type { Property } from './types'
import { SaleStatusBadge, ConditionBadge } from './StatusBadge'
import { getConditionState, formatPrice } from './utils'

interface PropertyCardProps {
  property: Property
  readOnly: boolean
  onEdit: () => void
  onDelete: () => void
}

export function PropertyCard({ property, readOnly, onEdit, onDelete }: PropertyCardProps) {
  const condition = getConditionState(property.updatedAt)
  const priceLabel = property.details?.priceOnRequest ? 'Цена по запросу' : `$${formatPrice(property.price)}`
  const pricePerM2Label = property.details?.priceOnRequest ? 'Прайс скрыт' : `$${formatPrice(property.pricePerM2)} за м²`

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[color:var(--hub-card-border)] bg-[var(--green-deep)] shadow-[inset_0_0_0_1px_rgba(201,168,76,0.1)] transition-all hover:border-[color:var(--hub-card-border-hover)] hover:bg-[var(--hub-card-bg-hover)]">
      {/* Photo */}
      <div className="relative aspect-video bg-gradient-to-br from-[var(--gold)]/8 to-[rgba(0,0,0,0.25)]">
        {property.photo && (
          <img src={property.photo} alt={property.title} className="size-full object-cover" />
        )}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 min-w-0">
          <SaleStatusBadge status={property.status} />
          <ConditionBadge state={condition} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-[color:var(--workspace-text)]">{property.title}</p>
          <span className="mt-0.5 text-xs font-medium text-[color:var(--theme-accent-heading)]">{property.type}</span>
        </div>

        <p className="text-xs text-[color:var(--hub-stat-label)] line-clamp-1">{property.city}, {property.street}</p>

        <div className="mt-auto">
          <p className="text-base font-bold text-[color:var(--workspace-text)]">{priceLabel}</p>
          <p className="text-xs text-[color:var(--hub-stat-label)]">{pricePerM2Label}</p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1 border-t border-[var(--green-border)] pt-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-[color:var(--theme-accent-heading)] transition-colors hover:bg-[var(--nav-item-bg-active)]"
            >
              <Pencil className="size-3" />
              Изменить
            </button>
            <button onClick={onDelete} className="ml-auto rounded p-1.5 text-red-400/70 hover:bg-red-500/10 hover:text-red-300 transition-colors" title="Удалить">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
