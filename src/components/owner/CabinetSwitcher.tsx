import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { CabinetRole, OwnerCabinetOption } from '@/types/owner-dashboard'

interface CabinetSwitcherProps {
  value: string
  options: OwnerCabinetOption[]
  onValueChange: (value: string) => void
  className?: string
}

const roleMeta: Record<CabinetRole, { label: string; className: string }> = {
  supreme_owner: {
    label: 'Главный собственник сети',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  master_partner: {
    label: 'Master-партнер',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  partner: {
    label: 'Партнер',
    className: 'border-violet-200 bg-violet-50 text-violet-700',
  },
}

export function CabinetSwitcher({ value, options, onValueChange, className }: CabinetSwitcherProps) {
  const selectedOption = options.find((option) => option.id === value) ?? options[0]

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <p className="text-xs text-muted-foreground">Активный кабинет</p>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="h-9 w-full bg-white sm:max-w-[320px]">
            <SelectValue placeholder="Выберите кабинет" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedOption && (
          <Badge
            variant="outline"
            className={cn('w-fit border text-xs font-medium shadow-none', roleMeta[selectedOption.role].className)}
          >
            {roleMeta[selectedOption.role].label}
          </Badge>
        )}
      </div>
    </div>
  )
}
