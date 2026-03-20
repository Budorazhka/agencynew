import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'

interface PermissionRowProps {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function PermissionRow({ label, description, checked, onCheckedChange }: PermissionRowProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex items-center justify-between gap-4 px-1 py-3.5 border-b border-slate-100 last:border-b-0 cursor-pointer select-none"
          onClick={() => onCheckedChange(!checked)}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 leading-tight">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-tight">{description}</p>
          </div>
          <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px]">
        {description}
      </TooltipContent>
    </Tooltip>
  )
}
