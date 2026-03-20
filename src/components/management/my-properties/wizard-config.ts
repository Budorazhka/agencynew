import type {
  Property,
  PropertyCategory,
  PropertyDetails,
  PropertyFormKind,
  PropertyType,
  PropertyWizardStepId,
  PropertyWizardValues,
  SaleStatus,
} from './types'

export interface WizardOption<T extends string> {
  value: T
  label: string
  description?: string
}

export interface PropertyTypeOption extends WizardOption<PropertyType> {
  kind: PropertyFormKind
  categories: PropertyCategory[]
}

export interface PropertyWizardStep {
  id: PropertyWizardStepId
  title: string
  description: string
}

export interface PropertyWizardRules {
  supportsSummary: boolean
  supportsRooms: boolean
  supportsPriceOnRequest: boolean
  supportsViews: boolean
  supportsRoadType: boolean
  supportsShoreline: boolean
  supportsFloor: boolean
  supportsTotalFloors: boolean
  supportsRenovation: boolean
  supportsBathrooms: boolean
  supportsBalcony: boolean
  supportsCeilingHeight: boolean
  supportsMediaUpload: boolean
  supportsElevator: boolean
  supportsParking: boolean
  supportsPropertyUsage: boolean
  supportsWallMaterial: boolean
  supportsGas: boolean
  supportsWaterSupply: boolean
  supportsSewage: boolean
  supportsLandType: boolean
  supportsElectricity: boolean
  supportsDeveloperSeller: boolean
  amenityOptions: string[]
}

export interface PropertyWizardActor {
  id: string
  name: string
}

export const PROPERTY_CATEGORY_OPTIONS: WizardOption<PropertyCategory>[] = [
  { value: 'secondary', label: 'Вторичка', description: 'Готовые квартиры, дома и апартаменты.' },
  { value: 'rent', label: 'Аренда', description: 'Краткосрочная и долгосрочная аренда.' },
  { value: 'commercial', label: 'Коммерция', description: 'Офисы, ритейл, свободные площади.' },
  { value: 'other', label: 'Другое', description: 'Участки, проекты и нетиповые лоты.' },
]

export const PROPERTY_TYPE_OPTIONS: PropertyTypeOption[] = [
  { value: 'Квартира', label: 'Квартира', kind: 'apartment', categories: ['secondary', 'rent'] },
  { value: 'Апартаменты', label: 'Апартаменты', kind: 'apartment', categories: ['secondary', 'rent'] },
  { value: 'Дом', label: 'Дом', kind: 'house', categories: ['secondary', 'other'] },
  { value: 'Участок', label: 'Участок', kind: 'land', categories: ['other'] },
  { value: 'Коммерция', label: 'Коммерция', kind: 'commercial', categories: ['commercial', 'other'] },
  { value: 'Проект', label: 'Проект', kind: 'project', categories: ['commercial', 'other'] },
]

export const SALE_STATUS_OPTIONS: WizardOption<SaleStatus>[] = [
  { value: 'for_sale', label: 'В продаже' },
  { value: 'booked', label: 'Забронировано' },
  { value: 'sold', label: 'Продано' },
  { value: 'moderation', label: 'На модерации' },
  { value: 'draft', label: 'Черновик' },
  { value: 'archive', label: 'Архив' },
]

export const PROPERTY_WIZARD_STATUS_OPTIONS: WizardOption<SaleStatus>[] = [
  { value: 'for_sale', label: 'В продаже' },
  { value: 'draft', label: 'Черновик' },
]

export const PROPERTY_WIZARD_STEPS: PropertyWizardStep[] = [
  { id: 'format', title: 'Формат', description: 'Режим объекта, тип и публикация.' },
  { id: 'location', title: 'Локация', description: 'Адрес, карта и контекст объекта.' },
  { id: 'base', title: 'База', description: 'Название, цена и ключевые параметры.' },
  { id: 'specs', title: 'Характеристики', description: 'Планировка, инженерия и медиа.' },
  { id: 'deal', title: 'Сделка', description: 'Инфраструктура, комиссия и продавец.' },
]

export const COUNTRY_OPTIONS = ['Грузия', 'Тайланд'] as const

export const CITY_OPTIONS: Record<(typeof COUNTRY_OPTIONS)[number], string[]> = {
  Грузия: ['Тбилиси', 'Батуми', 'Кобулети'],
  Тайланд: ['Пхукет', 'Паттайя', 'Бангкок'],
}

export const VIEW_OPTIONS = ['На двор', 'На горы', 'На море', 'На город']
export const ROAD_OPTIONS = ['Асфальт', 'Грунтовка', 'Нет подъезда']
export const SHORELINE_OPTIONS = ['Первая линия', 'Вторая линия', 'Третья линия', 'Город']
export const RENOVATION_OPTIONS = [
  'Черный каркас',
  'Белый каркас',
  'Зеленый каркас',
  'Под ключ',
  'Косметический',
  'Дизайнерский',
  'Требует ремонта',
  'Требует капитального ремонта',
]
export const BATHROOM_TYPE_OPTIONS = ['Совмещенный', 'Раздельный']
export const BATHROOM_COUNT_OPTIONS = ['1', '2', '2+']
export const BALCONY_OPTIONS = ['Балкон', 'Лоджия', 'Нет']
export const CEILING_HEIGHT_OPTIONS = ['2.7', '2.8', '3.0', '3.2', '3.5', '4.0', '4.5', '5.0+']
export const ELEVATOR_OPTIONS = ['Пассажирский', 'Грузовой', 'Оба']
export const PARKING_OPTIONS = ['Подземный паркинг', 'Наземный паркинг']
export const PROPERTY_USAGE_OPTIONS = [
  'Офис',
  'Торговая площадь',
  'Казино',
  'Ресторан',
  'Склад',
  'Производство',
  'Помещение свободного назначения',
]
export const WALL_MATERIAL_OPTIONS = ['Монолит', 'Кирпич', 'Комбинированный', 'Панель', 'Блок', 'Дерево', 'Каркас']
export const WATER_SUPPLY_OPTIONS = ['Центральное', 'Скважина', 'Нет']
export const SEWAGE_OPTIONS = ['Центральная', 'Септик', 'Нет']
export const LAND_TYPE_OPTIONS = ['Сельскохозяйственные', 'Не сельскохозяйственные']
export const SELLER_OPTIONS = [
  { value: 'owner', label: 'Собственник' },
  { value: 'agent', label: 'Агент' },
] as const

const APARTMENT_AMENITIES = [
  'Школа рядом',
  'Садик рядом',
  'Охрана',
  'Терраса на крыше',
  'Детская площадка',
  'Консьерж',
  'Зона барбекю',
  'Спортзал',
  'SPA-центр',
  'Торговый центр',
  'Ресепшен',
  'Лаунж-бар',
  'Фонтан',
  'Горы',
  'Море',
]

const HOUSE_AMENITIES = [
  'Школа рядом',
  'Садик рядом',
  'Бассейн открытый',
  'Бассейн закрытый',
  'Терраса на крыше',
  'Зона барбекю',
  'Спортзал',
  'Сад',
  'Горы',
  'Море',
]

const LAND_AMENITIES = [
  'Хороший подъезд',
  'Участок огорожен',
  'Ровный участок',
  'Участок с деревьями / садом',
  'Выход к реке / озеру',
  'Тихое место',
  'Вблизи лес / природа',
  'В черте посёлка / деревни',
  'Под строительство дома',
  'Под сельское хозяйство',
  'Для инвестиций / туризма',
  'Без соседей рядом',
  'Горы',
  'Море',
]

const COMMERCIAL_AMENITIES = [
  'Казино-зал',
  'SPA-центр',
  'Торговый центр',
  'Ресепшен',
  'Лаунж-бар',
  'Бутики',
  'Фонтан',
  'Горы',
  'Море',
]

const PROJECT_AMENITIES = [
  'Охрана',
  'Бассейн открытый',
  'Бассейн закрытый',
  'Терраса на крыше',
  'Консьерж',
  'Спортзал',
  'Сад',
  'Вблизи лес / природа',
  'Для инвестиций / туризма',
  'Казино-зал',
  'SPA-центр',
  'Торговый центр',
  'Ресепшен',
  'Лаунж-бар',
  'Бутики',
  'Фонтан',
  'Горы',
  'Море',
]

const RULES_BY_KIND: Record<PropertyFormKind, PropertyWizardRules> = {
  apartment: {
    supportsSummary: false,
    supportsRooms: true,
    supportsPriceOnRequest: false,
    supportsViews: true,
    supportsRoadType: false,
    supportsShoreline: true,
    supportsFloor: true,
    supportsTotalFloors: true,
    supportsRenovation: true,
    supportsBathrooms: true,
    supportsBalcony: true,
    supportsCeilingHeight: true,
    supportsMediaUpload: false,
    supportsElevator: true,
    supportsParking: true,
    supportsPropertyUsage: false,
    supportsWallMaterial: true,
    supportsGas: true,
    supportsWaterSupply: true,
    supportsSewage: true,
    supportsLandType: false,
    supportsElectricity: false,
    supportsDeveloperSeller: false,
    amenityOptions: APARTMENT_AMENITIES,
  },
  house: {
    supportsSummary: false,
    supportsRooms: true,
    supportsPriceOnRequest: false,
    supportsViews: true,
    supportsRoadType: true,
    supportsShoreline: true,
    supportsFloor: false,
    supportsTotalFloors: true,
    supportsRenovation: true,
    supportsBathrooms: true,
    supportsBalcony: true,
    supportsCeilingHeight: false,
    supportsMediaUpload: false,
    supportsElevator: false,
    supportsParking: false,
    supportsPropertyUsage: false,
    supportsWallMaterial: true,
    supportsGas: true,
    supportsWaterSupply: true,
    supportsSewage: true,
    supportsLandType: false,
    supportsElectricity: false,
    supportsDeveloperSeller: false,
    amenityOptions: HOUSE_AMENITIES,
  },
  land: {
    supportsSummary: false,
    supportsRooms: false,
    supportsPriceOnRequest: false,
    supportsViews: false,
    supportsRoadType: true,
    supportsShoreline: true,
    supportsFloor: false,
    supportsTotalFloors: false,
    supportsRenovation: false,
    supportsBathrooms: false,
    supportsBalcony: false,
    supportsCeilingHeight: false,
    supportsMediaUpload: false,
    supportsElevator: false,
    supportsParking: false,
    supportsPropertyUsage: false,
    supportsWallMaterial: false,
    supportsGas: false,
    supportsWaterSupply: false,
    supportsSewage: false,
    supportsLandType: true,
    supportsElectricity: true,
    supportsDeveloperSeller: false,
    amenityOptions: LAND_AMENITIES,
  },
  commercial: {
    supportsSummary: false,
    supportsRooms: false,
    supportsPriceOnRequest: false,
    supportsViews: false,
    supportsRoadType: false,
    supportsShoreline: false,
    supportsFloor: true,
    supportsTotalFloors: true,
    supportsRenovation: true,
    supportsBathrooms: false,
    supportsBalcony: false,
    supportsCeilingHeight: true,
    supportsMediaUpload: false,
    supportsElevator: true,
    supportsParking: true,
    supportsPropertyUsage: true,
    supportsWallMaterial: false,
    supportsGas: true,
    supportsWaterSupply: false,
    supportsSewage: false,
    supportsLandType: false,
    supportsElectricity: false,
    supportsDeveloperSeller: true,
    amenityOptions: COMMERCIAL_AMENITIES,
  },
  project: {
    supportsSummary: true,
    supportsRooms: false,
    supportsPriceOnRequest: true,
    supportsViews: false,
    supportsRoadType: false,
    supportsShoreline: true,
    supportsFloor: true,
    supportsTotalFloors: true,
    supportsRenovation: true,
    supportsBathrooms: false,
    supportsBalcony: false,
    supportsCeilingHeight: false,
    supportsMediaUpload: true,
    supportsElevator: true,
    supportsParking: true,
    supportsPropertyUsage: true,
    supportsWallMaterial: false,
    supportsGas: false,
    supportsWaterSupply: false,
    supportsSewage: false,
    supportsLandType: false,
    supportsElectricity: true,
    supportsDeveloperSeller: true,
    amenityOptions: PROJECT_AMENITIES,
  },
}

const EMPTY_DETAILS: PropertyDetails = {
  searchValue: '',
  summary: '',
  description: '',
  address: '',
  mapLocationLabel: '',
  mapLat: '',
  mapLng: '',
  views: [],
  roadType: '',
  shoreline: '',
  renovation: '',
  bathroomType: '',
  bathroomsCount: '',
  balconyType: '',
  ceilingHeight: '',
  planFileName: '',
  mediaFileNames: [],
  elevatorOptions: [],
  parkingOptions: [],
  propertyUsage: [],
  wallMaterial: '',
  gas: '',
  waterSupply: '',
  sewage: '',
  landType: '',
  electricity: '',
  amenities: [],
  commissionPercent: '',
  sellerType: 'owner',
  mortgageAvailable: true,
  installmentAvailable: false,
  priceOnRequest: false,
}

export function getAllowedTypesForCategory(category: PropertyCategory): PropertyTypeOption[] {
  return PROPERTY_TYPE_OPTIONS.filter((option) => option.categories.includes(category))
}

export function getDefaultTypeForCategory(category: PropertyCategory): PropertyType {
  return getAllowedTypesForCategory(category)[0]?.value ?? 'Квартира'
}

export function ensureTypeForCategory(type: PropertyType, category: PropertyCategory): PropertyType {
  return getAllowedTypesForCategory(category).some((option) => option.value === type)
    ? type
    : getDefaultTypeForCategory(category)
}

export function getPropertyKind(type: PropertyType): PropertyFormKind {
  return PROPERTY_TYPE_OPTIONS.find((option) => option.value === type)?.kind ?? 'apartment'
}

export function getWizardRules(type: PropertyType): PropertyWizardRules {
  return RULES_BY_KIND[getPropertyKind(type)]
}

export function getInitialCity(country: string): string {
  return CITY_OPTIONS[(country as keyof typeof CITY_OPTIONS) ?? 'Грузия']?.[0] ?? 'Тбилиси'
}

export function normalizeWizardStatus(status?: SaleStatus): SaleStatus {
  return status === 'draft' ? 'draft' : 'for_sale'
}

export function createPropertyWizardValues(
  property?: Property,
  defaults: Partial<PropertyWizardValues> = {},
): PropertyWizardValues {
  const details = { ...EMPTY_DETAILS, ...property?.details }
  const category = defaults.category ?? property?.category ?? 'secondary'
  const rawType = defaults.type ?? property?.type ?? getDefaultTypeForCategory(category)
  const type = ensureTypeForCategory(rawType, category)
  const country = defaults.country ?? property?.country ?? 'Грузия'
  const city = defaults.city ?? property?.city ?? getInitialCity(country)

  return {
    category,
    type,
    country,
    city,
    status: normalizeWizardStatus(defaults.status ?? property?.status ?? 'draft'),
    title: defaults.title ?? property?.title ?? '',
    searchValue: defaults.searchValue ?? details.searchValue,
    summary: defaults.summary ?? details.summary,
    description: defaults.description ?? details.description,
    price: defaults.price ?? (property?.price ? String(property.price) : ''),
    pricePerM2: defaults.pricePerM2 ?? (property?.pricePerM2 ? String(property.pricePerM2) : ''),
    priceOnRequest: defaults.priceOnRequest ?? details.priceOnRequest,
    area: defaults.area ?? (property?.area ? String(property.area) : ''),
    rooms: defaults.rooms ?? (property?.rooms ? String(property.rooms) : ''),
    floor: defaults.floor ?? (property?.floor ? String(property.floor) : ''),
    totalFloors: defaults.totalFloors ?? (property?.totalFloors ? String(property.totalFloors) : ''),
    address: defaults.address ?? details.address ?? property?.street ?? '',
    mapLocationLabel: defaults.mapLocationLabel ?? details.mapLocationLabel,
    mapLat: defaults.mapLat ?? details.mapLat,
    mapLng: defaults.mapLng ?? details.mapLng,
    views: defaults.views ?? [...details.views],
    roadType: defaults.roadType ?? details.roadType,
    shoreline: defaults.shoreline ?? details.shoreline,
    renovation: defaults.renovation ?? details.renovation,
    bathroomType: defaults.bathroomType ?? details.bathroomType,
    bathroomsCount: defaults.bathroomsCount ?? details.bathroomsCount,
    balconyType: defaults.balconyType ?? details.balconyType,
    ceilingHeight: defaults.ceilingHeight ?? details.ceilingHeight,
    photo: defaults.photo ?? property?.photo ?? '',
    planFileName: defaults.planFileName ?? details.planFileName,
    mediaFileNames: defaults.mediaFileNames ?? [...details.mediaFileNames],
    elevatorOptions: defaults.elevatorOptions ?? [...details.elevatorOptions],
    parkingOptions: defaults.parkingOptions ?? [...details.parkingOptions],
    propertyUsage: defaults.propertyUsage ?? [...details.propertyUsage],
    wallMaterial: defaults.wallMaterial ?? details.wallMaterial,
    gas: defaults.gas ?? details.gas,
    waterSupply: defaults.waterSupply ?? details.waterSupply,
    sewage: defaults.sewage ?? details.sewage,
    landType: defaults.landType ?? details.landType,
    electricity: defaults.electricity ?? details.electricity,
    amenities: defaults.amenities ?? [...details.amenities],
    commissionPercent: defaults.commissionPercent ?? details.commissionPercent,
    sellerType: defaults.sellerType ?? details.sellerType,
    mortgageAvailable: defaults.mortgageAvailable ?? details.mortgageAvailable,
    installmentAvailable: defaults.installmentAvailable ?? details.installmentAvailable,
  }
}

function toNumber(value: string): number {
  const normalized = value.trim().replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function buildPropertyFromWizard(
  values: PropertyWizardValues,
  actor: PropertyWizardActor,
  existing?: Property,
): Property {
  const rules = getWizardRules(values.type)
  const price = values.priceOnRequest && !values.price.trim()
    ? existing?.price ?? 0
    : toNumber(values.price)
  const area = toNumber(values.area)
  const computedPricePerM2 = area > 0 && price > 0 ? Math.round(price / area) : 0
  const pricePerM2 = values.pricePerM2.trim() ? toNumber(values.pricePerM2) : computedPricePerM2
  const address = values.address.trim()
  const title = values.title.trim() || `${values.type} в ${values.city}`

  return {
    id: existing?.id ?? `property-${Date.now().toString(36)}`,
    photo: values.photo.trim() || existing?.photo,
    title,
    type: values.type,
    category: values.category,
    country: values.country,
    city: values.city,
    street: address || existing?.street || 'Адрес уточняется',
    floor: rules.supportsFloor ? toNumber(values.floor) : 0,
    totalFloors: rules.supportsTotalFloors ? toNumber(values.totalFloors) : 0,
    rooms: rules.supportsRooms ? toNumber(values.rooms) : 0,
    area,
    price,
    pricePerM2,
    listedAt: existing?.listedAt ?? getTodayIsoDate(),
    updatedAt: getTodayIsoDate(),
    status: normalizeWizardStatus(values.status),
    agentId: existing?.agentId ?? actor.id,
    agentName: existing?.agentName ?? actor.name,
    details: {
      searchValue: values.searchValue.trim(),
      summary: values.summary.trim(),
      description: values.description.trim(),
      address,
      mapLocationLabel: values.mapLocationLabel.trim(),
      mapLat: values.mapLat.trim(),
      mapLng: values.mapLng.trim(),
      views: uniq(values.views),
      roadType: values.roadType,
      shoreline: values.shoreline,
      renovation: rules.supportsRenovation ? values.renovation : '',
      bathroomType: rules.supportsBathrooms ? values.bathroomType : '',
      bathroomsCount: rules.supportsBathrooms ? values.bathroomsCount : '',
      balconyType: rules.supportsBalcony ? values.balconyType : '',
      ceilingHeight: rules.supportsCeilingHeight ? values.ceilingHeight : '',
      planFileName: values.planFileName.trim(),
      mediaFileNames: uniq(values.mediaFileNames),
      elevatorOptions: rules.supportsElevator ? uniq(values.elevatorOptions) : [],
      parkingOptions: rules.supportsParking ? uniq(values.parkingOptions) : [],
      propertyUsage: rules.supportsPropertyUsage ? uniq(values.propertyUsage) : [],
      wallMaterial: rules.supportsWallMaterial ? values.wallMaterial : '',
      gas: rules.supportsGas ? values.gas : '',
      waterSupply: rules.supportsWaterSupply ? values.waterSupply : '',
      sewage: rules.supportsSewage ? values.sewage : '',
      landType: rules.supportsLandType ? values.landType : '',
      electricity: rules.supportsElectricity ? values.electricity : '',
      amenities: uniq(values.amenities),
      commissionPercent: values.commissionPercent.trim(),
      sellerType: rules.supportsDeveloperSeller ? values.sellerType : values.sellerType === 'developer' ? 'owner' : values.sellerType,
      mortgageAvailable: values.mortgageAvailable,
      installmentAvailable: values.installmentAvailable,
      priceOnRequest: rules.supportsPriceOnRequest ? values.priceOnRequest : false,
    },
  }
}
