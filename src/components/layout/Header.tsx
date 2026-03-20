import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Breadcrumb, Country } from '@/types/dashboard'
import georgiaFlag from '@/assets/flags/georgia.svg'
import thailandFlag from '@/assets/flags/thailand.svg'
import turkeyFlag from '@/assets/flags/turkey.svg'

const countryFlags: Record<string, string> = {
  georgia: georgiaFlag,
  thailand: thailandFlag,
  turkey: turkeyFlag,
}

interface CityOption {
  id: string
  name: string
}

interface HeaderProps {
  title: string
  breadcrumbs: Breadcrumb[]
  countries?: Country[]
  activeCityId?: string
  citiesInActiveCountry?: CityOption[]
  /** Увеличенные шрифты для страницы города */
  size?: 'default' | 'large'
}

export function Header({ title, breadcrumbs, countries, activeCityId, citiesInActiveCountry, size = 'default' }: HeaderProps) {
  const navigate = useNavigate()
  const showCitySelector = citiesInActiveCountry && citiesInActiveCountry.length > 1
  const isLarge = size === 'large'

  return (
    <div className={isLarge ? 'mb-8' : 'mb-6'}>
      <nav className={`mb-2 flex items-center gap-2 ${isLarge ? 'text-base text-muted-foreground' : 'text-sm text-muted-foreground'}`}>
        {breadcrumbs.map((crumb, index) => (
          <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className={isLarge ? 'size-4' : 'size-3.5'} />}
            {crumb.href ? (
              <button
                type="button"
                onClick={() => navigate(crumb.href!)}
                className="transition-colors hover:text-foreground"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <h1 className={`page-title ${isLarge ? 'text-3xl' : 'text-2xl'}`}>{title}</h1>

      {countries && countries.length > 0 && (
        <div className={isLarge ? 'mt-5 flex flex-col gap-3' : 'mt-4 flex flex-col gap-2'}>
          <div className="flex flex-wrap gap-2">
            {countries.map((country) => {
              const isActive = country.cities.includes(activeCityId ?? '')

              return (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => navigate(`/dashboard/city/${country.cities[0]}`)}
                  className={
                    `inline-flex items-center gap-2 rounded-full border font-medium transition-colors ${isLarge ? 'px-4 py-2 text-sm' : 'px-2.5 py-1 text-xs'} ` +
                    (isActive
                      ? 'border-slate-300 bg-slate-100 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')
                  }
                >
                  {countryFlags[country.id] ? (
                    <img
                      src={countryFlags[country.id]}
                      alt={`Флаг ${country.name}`}
                      className={isLarge ? 'h-4 w-6 rounded-sm border border-slate-200/80 object-cover' : 'h-3.5 w-5 rounded-sm border border-slate-200/80 object-cover'}
                    />
                  ) : (
                    <span>{country.flag}</span>
                  )}
                  <span>{country.name}</span>
                </button>
              )
            })}
          </div>
          {showCitySelector && (
            <div className={`flex flex-wrap gap-2 pl-0.5 ${isLarge ? 'gap-2.5' : ''}`}>
              <span className={`mr-1 self-center font-medium text-slate-500 ${isLarge ? 'text-sm' : 'text-xs'}`}>Город:</span>
              {citiesInActiveCountry.map((city) => {
                const isActive = city.id === activeCityId
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => navigate(`/dashboard/city/${city.id}`)}
                    className={
                      `rounded-full border font-medium transition-colors ${isLarge ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-[11px]'} ` +
                      (isActive
                        ? 'border-slate-400 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')
                    }
                  >
                    {city.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
