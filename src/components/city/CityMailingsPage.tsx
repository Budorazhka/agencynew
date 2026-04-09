import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
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
      <div className="flex min-h-[50vh] items-center justify-center bg-[var(--app-bg)] text-[color:var(--app-text-muted)]">
        <p>Город не найден</p>
      </div>
    )
  }

  const handleAddMailing = (mailing: Mailing) => {
    dispatch({ type: 'ADD_MAILING', mailing })
  }

  const handleCancelScheduledMailing = (mailingId: string) => {
    dispatch({ type: 'CANCEL_SCHEDULED_MAILING', mailingId })
  }

  const cityMailings = useMemo(
    () => state.mailings.filter((m) => m.scopeCityId === city.id),
    [state.mailings, city.id],
  )

  const mailingKpi = useMemo(() => {
    const now = Date.now()
    let sent = 0
    let scheduled = 0
    let overdue = 0
    let dualChannel = 0
    for (const m of cityMailings) {
      if (m.sentAt) {
        sent += 1
        if (m.channels.includes('crm') && m.channels.includes('cabinet')) dualChannel += 1
      } else if (m.scheduledAt) {
        scheduled += 1
        if (new Date(m.scheduledAt).getTime() < now) overdue += 1
      }
    }
    return { total: cityMailings.length, sent, scheduled, overdue, dualChannel }
  }, [cityMailings])

  const overdueMailings = useMemo(() => {
    const now = Date.now()
    return cityMailings.filter(
      (m) => m.scheduledAt && !m.sentAt && new Date(m.scheduledAt).getTime() < now,
    )
  }, [cityMailings])

  return (
    <div className="space-y-6 text-[color:var(--app-text)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="shrink-0 text-[color:var(--app-text-muted)] hover:bg-[var(--dropdown-hover)] hover:text-[color:var(--app-text)]"
          >
            <Link to={`/dashboard/city/${city.id}`} aria-label="Назад к городу">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--app-text)]">Редактор рассылок</h1>
            <p className="text-[color:var(--app-text-muted)]">
              {country?.name} · {city.name}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-[color:var(--app-text-muted)]">
        Сводка и история ниже — только рассылки с привязкой к этому городу (scopeCityId).
      </p>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
          <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Всего</p>
          <p className="text-xl font-bold text-[color:var(--gold)]">{mailingKpi.total}</p>
        </div>
        <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
          <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Отправлено</p>
          <p className="text-xl font-bold text-emerald-300">{mailingKpi.sent}</p>
        </div>
        <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
          <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">В плане</p>
          <p className="text-xl font-bold text-sky-300">{mailingKpi.scheduled}</p>
        </div>
        <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3">
          <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">Просрочено</p>
          <p className="text-xl font-bold text-orange-300">{mailingKpi.overdue}</p>
        </div>
        <div className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] p-3 md:col-span-1 col-span-2">
          <p className="text-[10px] uppercase text-[color:var(--app-text-subtle)]">CRM + ЛК</p>
          <p className="text-xl font-bold text-violet-300">{mailingKpi.dualChannel}</p>
        </div>
      </div>

      {overdueMailings.length > 0 && (
        <div className="rounded-xl border border-orange-500/35 bg-orange-500/[0.07] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-orange-200">
            <AlertTriangle className="size-3.5 shrink-0" />
            Запланировано, но время уже прошло
          </div>
          <ul className="m-0 list-none space-y-1.5 p-0">
            {overdueMailings.map((m: Mailing) => (
              <li
                key={m.id}
                className="rounded-lg border border-[var(--hub-card-border)] bg-[var(--hub-card-bg)] px-3 py-2 text-xs text-[color:var(--app-text-muted)]"
              >
                <span className="font-semibold text-[color:var(--app-text)]">{m.title}</span>
                {m.scheduledAt && (
                  <span className="ml-2 text-[10px]">
                    план: {new Date(m.scheduledAt).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <MailingsEditor
        city={city}
        country={country}
        cities={state.cities}
        allPartners={allPartners}
        mailings={cityMailings}
        onAddMailing={handleAddMailing}
        onCancelScheduled={handleCancelScheduledMailing}
      />
    </div>
  )
}
