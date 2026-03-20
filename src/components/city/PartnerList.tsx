import { PartnerCard } from './PartnerCard'
import { getMasterPartners, getSubPartners } from '@/data/mock'
import type { Partner } from '@/types/dashboard'

interface PartnerListProps {
  partners: Partner[]
  countryFlag?: string
  onAssignRoles: (partner: Partner) => void
}

export function PartnerList({ partners, countryFlag, onAssignRoles }: PartnerListProps) {
  const masters = getMasterPartners(partners)

  if (partners.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">В этом городе пока нет партнеров</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Партнеры</h2>
      <div className="space-y-3">
        {masters.map((master) => {
          const subs = getSubPartners(partners, master.id)
          return (
            <PartnerCard
              key={master.id}
              partner={master}
              countryFlag={countryFlag}
              isMaster={true}
              onAssignRoles={() => onAssignRoles(master)}
            >
              {subs.length > 0 &&
                subs.map((sub) => (
                  <PartnerCard
                    key={sub.id}
                    partner={sub}
                    countryFlag={countryFlag}
                    isMaster={false}
                    onAssignRoles={() => onAssignRoles(sub)}
                  />
                ))}
            </PartnerCard>
          )
        })}
      </div>
    </div>
  )
}
