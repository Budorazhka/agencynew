"use client"

import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { OwnerCabinetOption, CabinetRole } from "@/types/owner-dashboard"

interface CabinetSwitcherProps {
  value: string
  options: OwnerCabinetOption[]
  onValueChange: (value: string) => void
  className?: string
}

const roleMeta: Record<CabinetRole, { label: string; className: string }> = {
  supreme_owner: {
    label: "Хозяин сети",
    className: "border-emerald-400/40 bg-emerald-950/45 text-emerald-100",
  },
  master_partner: {
    label: "Master-партнер",
    className: "border-amber-400/40 bg-amber-950/40 text-amber-100",
  },
  partner: {
    label: "Партнер",
    className: "border-white/20 bg-white/[0.06] text-[color:var(--app-text-muted)]",
  },
}

export function CabinetSwitcher({
  value,
  options,
  onValueChange,
  className,
}: CabinetSwitcherProps) {
  const selectedOption = options.find((option) => option.id === value) ?? options[0]

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <p className="text-[0.8125rem] font-medium text-[color:var(--app-text-muted)]">Активный кабинет</p>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="h-9 w-full sm:max-w-[320px]">
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
            className={cn(
              "w-fit border text-xs font-medium shadow-none",
              roleMeta[selectedOption.role].className
            )}
          >
            {roleMeta[selectedOption.role].label}
          </Badge>
        )}
      </div>
    </div>
  )
}
