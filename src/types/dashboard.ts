export type PartnerRole =
  | 'Первичка'
  | 'Первичка 2'
  | 'Вторичка'
  | 'Вторичка 2'
  | 'Аренда'

export interface Permission {
  id: string
  label: string
  description: string
  enabled: boolean
}

export type PartnerType = 'master' | 'sub'

export interface Partner {
  id: string
  name: string
  login: string
  type: PartnerType
  roles: PartnerRole[]
  permissions: Permission[]
  crmMinutes: number
  /** Количество объектов вторичной недвижимости */
  secondaryObjectsCount?: number
  masterId?: string
}

export interface City {
  id: string
  name: string
  countryId: string
  partners: Partner[]
}

export interface Country {
  id: string
  name: string
  flag: string
  cities: string[]
}

export interface CityMapPoint {
  id: string
  name: string
  countryId: string
  coordinates: [number, number] // [longitude, latitude]
  labelOffset?: [number, number] // [x, y] in marker-local SVG units
  partnersCount: number
  totalRevenue: number
}

export interface GlobalStats {
  totalPartners: number
  totalRevenue: number
  totalDeals: number
  activeCities: number
  totalCrmHours: number
}

export interface Breadcrumb {
  label: string
  href?: string
}

