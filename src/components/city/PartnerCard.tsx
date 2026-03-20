import { Crown, Settings, Clock, AtSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RoleBadge } from './RoleBadge'
import { formatCrmTime } from '@/data/mock'
import { cn } from '@/lib/utils'
import type { Partner } from '@/types/dashboard'

interface PartnerCardProps {
  partner: Partner
  countryFlag?: string
  isMaster: boolean
  onAssignRoles: () => void
  children?: React.ReactNode
}

export function PartnerCard({ partner, countryFlag, isMaster, onAssignRoles, children }: PartnerCardProps) {
  const initials = partner.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={cn(isMaster ? '' : 'ml-8')}>
      <Card className={cn('py-4', isMaster && 'border-l-4 border-l-blue-500')}>
        <CardContent className="p-0 px-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex items-center justify-center size-10 shrink-0 rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                {countryFlag ?? initials}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{partner.name}</span>
                  {isMaster && <Crown className="size-4 text-amber-500 shrink-0" />}
                  {isMaster && (
                    <span className="text-xs text-amber-600 font-medium">Мастер-партнер</span>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                  <AtSign className="size-3" />
                  <span>{partner.login}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {partner.roles.map((role) => (
                    <RoleBadge key={role} role={role} />
                  ))}
                </div>

                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  <span>{formatCrmTime(partner.crmMinutes)}</span>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={onAssignRoles} className="shrink-0">
              <Settings className="size-3.5 mr-1.5" />
              Роли
            </Button>
          </div>
        </CardContent>
      </Card>

      {children && (
        <div className="mt-2 space-y-2 relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
          {children}
        </div>
      )}
    </div>
  )
}
