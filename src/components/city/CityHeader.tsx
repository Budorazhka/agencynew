import { Clock, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCrmTime } from '@/data/mock'
import type { City } from '@/types/dashboard'

interface CityHeaderProps {
  city: City
  totalCrmMinutes: number
}

export function CityHeader({ city, totalCrmMinutes }: CityHeaderProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card className="py-4">
        <CardContent className="p-0 px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50">
              <Clock className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Время в системе</p>
              <p className="text-xl font-semibold tracking-tight">{formatCrmTime(totalCrmMinutes)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent className="p-0 px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50">
              <Users className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Партнеров в городе</p>
              <p className="text-xl font-semibold tracking-tight">{city.partners.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
