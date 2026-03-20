import { useParams } from 'react-router-dom'
import { CityDetailView } from './CityDetailView'
import { useDashboard } from '@/context/DashboardContext'
import { getCityById, getCountryByCityId, countries } from '@/data/mock'
import type { Partner, Permission, PartnerRole } from '@/types/dashboard'

export function CityPage() {
  const { cityId } = useParams<{ cityId: string }>()
  const { state, dispatch } = useDashboard()

  const city = cityId ? getCityById(state.cities, cityId) : undefined
  const country = city ? getCountryByCityId(city.id) : undefined
  const citiesInActiveCountry = country
    ? state.cities
        .filter((c) => country.cities.includes(c.id))
        .map((c) => ({ id: c.id, name: c.name }))
    : undefined

  if (!city) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Город не найден</p>
      </div>
    )
  }

  const handleUpdatePermissions = (partnerId: string, permissions: Permission[]) => {
    dispatch({
      type: 'UPDATE_PERMISSIONS',
      cityId: city.id,
      partnerId,
      permissions,
    })
  }

  const handleUpdateRoles = (partnerId: string, roles: PartnerRole[]) => {
    dispatch({
      type: 'UPDATE_ROLES',
      cityId: city.id,
      partnerId,
      roles,
    })
  }

  const handleAddPartner = (partner: Partner) => {
    dispatch({
      type: 'ADD_PARTNER',
      cityId: city.id,
      partner,
    })
  }

  return (
    <CityDetailView
      city={city}
      country={country}
      countries={countries}
      citiesInActiveCountry={citiesInActiveCountry}
      onUpdatePermissions={handleUpdatePermissions}
      onUpdateRoles={handleUpdateRoles}
      onAddPartner={handleAddPartner}
    />
  )
}
