import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PartnerRole } from '@/types/dashboard'

const roleColors: Record<PartnerRole, string> = {
  Первичка: 'bg-green-50 text-green-700 border-green-200',
  'Первичка 2': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Вторичка: 'bg-violet-50 text-violet-700 border-violet-200',
  'Вторичка 2': 'bg-purple-50 text-purple-700 border-purple-200',
  Аренда: 'bg-amber-50 text-amber-700 border-amber-200',
}

const roleLabels: Record<PartnerRole, string> = {
  Первичка: 'Первичка',
  'Первичка 2': 'Первичка 2',
  Вторичка: 'Вторичка',
  'Вторичка 2': 'Вторичка 2',
  Аренда: 'Аренда',
}

interface RoleBadgeProps {
  role: PartnerRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge variant="outline" className={cn('text-sm font-medium', roleColors[role])}>
      {roleLabels[role]}
    </Badge>
  )
}
