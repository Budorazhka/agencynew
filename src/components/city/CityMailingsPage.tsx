import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MailingsEditor } from '@/components/mailings/MailingsEditor'
import { useDashboard } from '@/context/DashboardContext'
import { getCityById, getCountryByCityId } from '@/data/mock'
import type { Mailing } from '@/types/mailings'
import { Button } from '@/components/ui/button'

export function CityMailingsPage() {
  const { cityId } = useParams<{ cityId: string }>()
  const { state, dispatch } = useDashboard()

  const city = cityId ? getCityById(state.cities, cityId) : undefined
  const country = city ? getCountryByCityId(city.id) : undefined
  const allPartners = state.cities.flatMap((c) => c.partners)

  if (!city) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Город не найден</p>
      </div>
    )
  }

  const handleAddMailing = (mailing: Mailing) => {
    dispatch({ type: 'ADD_MAILING', mailing })
  }

  const handleCancelScheduledMailing = (mailingId: string) => {
    dispatch({ type: 'CANCEL_SCHEDULED_MAILING', mailingId })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to={`/dashboard/city/${city.id}`} aria-label="Назад к городу">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Редактор рассылок</h1>
            <p className="text-muted-foreground">
              {country?.name} · {city.name}
            </p>
          </div>
        </div>
      </div>

      <MailingsEditor
        city={city}
        country={country}
        cities={state.cities}
        allPartners={allPartners}
        mailings={state.mailings}
        onAddMailing={handleAddMailing}
        onCancelScheduled={handleCancelScheduledMailing}
      />
    </div>
  )
}
