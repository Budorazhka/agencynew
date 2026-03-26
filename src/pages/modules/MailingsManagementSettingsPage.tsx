import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { MailingsEditor } from '@/components/mailings/MailingsEditor'
import { useDashboard } from '@/context/DashboardContext'
import { getCountryByCityId } from '@/data/mock'
import type { Mailing } from '@/types/mailings'
import { Button } from '@/components/ui/button'

export default function MailingsManagementSettingsPage() {
  const { state, dispatch } = useDashboard()
  const city = state.cities[0]
  const country = city ? getCountryByCityId(city.id) : undefined
  const allPartners = state.cities.flatMap((c) => c.partners)

  const handleAddMailing = (mailing: Mailing) => {
    dispatch({ type: 'ADD_MAILING', mailing })
  }

  const handleCancelScheduledMailing = (mailingId: string) => {
    dispatch({ type: 'CANCEL_SCHEDULED_MAILING', mailingId })
  }

  if (!city) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-[var(--app-bg)] p-8 text-[color:var(--app-text)]">
        <p className="text-[color:var(--app-text-muted)]">Нет городов в демо-данных — рассылки недоступны.</p>
        <Button variant="outline" asChild className="border-[var(--green-border)] text-[color:var(--app-text)]">
          <Link to="/dashboard/settings/news-mailings">Назад</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-full space-y-6 bg-[var(--app-bg)] p-6 text-[color:var(--app-text)] lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="shrink-0 text-[color:var(--app-text-muted)] hover:bg-[var(--dropdown-hover)] hover:text-[color:var(--app-text)]"
          >
            <Link to="/dashboard/settings/news-mailings" aria-label="Назад">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--app-text)]">Рассылки</h1>
            <p className="text-[color:var(--app-text-muted)]">
              {country?.name ? `${country.name} · ` : ''}
              {city.name} — аудитория и каналы доставки
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
