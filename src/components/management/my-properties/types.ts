export type PropertyCategory = 'secondary' | 'rent' | 'commercial' | 'other'
export type PropertyType = 'Квартира' | 'Дом' | 'Коммерция' | 'Участок' | 'Апартаменты' | 'Проект'
export type SaleStatus = 'for_sale' | 'booked' | 'sold' | 'moderation' | 'draft' | 'archive'

export type ConditionState = 'up_to_date' | 'needs_attention' | 'needs_update'
export type SellerType = 'owner' | 'agent' | 'developer'
export type BooleanChoice = 'yes' | 'no' | ''
export type PropertyFormKind = 'apartment' | 'house' | 'land' | 'commercial' | 'project'
export type PropertyWizardStepId = 'format' | 'base' | 'location' | 'specs' | 'deal'

export interface PropertyDetails {
  searchValue: string
  summary: string
  description: string
  address: string
  mapLocationLabel: string
  mapLat: string
  mapLng: string
  views: string[]
  roadType: string
  shoreline: string
  renovation: string
  bathroomType: string
  bathroomsCount: string
  balconyType: string
  ceilingHeight: string
  planFileName: string
  mediaFileNames: string[]
  elevatorOptions: string[]
  parkingOptions: string[]
  propertyUsage: string[]
  wallMaterial: string
  gas: BooleanChoice
  waterSupply: string
  sewage: string
  landType: string
  electricity: BooleanChoice
  amenities: string[]
  commissionPercent: string
  sellerType: SellerType
  mortgageAvailable: boolean
  installmentAvailable: boolean
  priceOnRequest: boolean
}

export interface Property {
  id: string
  photo?: string
  title: string
  type: PropertyType
  category: PropertyCategory
  country: string
  city: string
  street: string
  floor: number
  totalFloors: number
  rooms: number
  area: number
  price: number
  pricePerM2: number
  listedAt: string   // ISO date string
  updatedAt: string  // ISO date string
  status: SaleStatus
  agentId: string
  agentName: string
  details?: PropertyDetails
}

export interface PropertyWizardValues {
  category: PropertyCategory
  type: PropertyType
  country: string
  city: string
  status: SaleStatus
  title: string
  searchValue: string
  summary: string
  description: string
  price: string
  pricePerM2: string
  priceOnRequest: boolean
  area: string
  rooms: string
  floor: string
  totalFloors: string
  address: string
  mapLocationLabel: string
  mapLat: string
  mapLng: string
  views: string[]
  roadType: string
  shoreline: string
  renovation: string
  bathroomType: string
  bathroomsCount: string
  balconyType: string
  ceilingHeight: string
  photo: string
  planFileName: string
  mediaFileNames: string[]
  elevatorOptions: string[]
  parkingOptions: string[]
  propertyUsage: string[]
  wallMaterial: string
  gas: BooleanChoice
  waterSupply: string
  sewage: string
  landType: string
  electricity: BooleanChoice
  amenities: string[]
  commissionPercent: string
  sellerType: SellerType
  mortgageAvailable: boolean
  installmentAvailable: boolean
}

export interface FiltersState {
  types: PropertyType[]
  statuses: SaleStatus[]
  conditions: ConditionState[]
  priceMin: string
  priceMax: string
  areaMin: string
  areaMax: string
}

export const EMPTY_FILTERS: FiltersState = {
  types: [],
  statuses: [],
  conditions: [],
  priceMin: '',
  priceMax: '',
  areaMin: '',
  areaMax: '',
}
