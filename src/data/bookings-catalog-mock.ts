/**
 * Каталоги для бронирования — позже подменятся загрузкой с API.
 * Новостройка: два шага — ЖК, затем квартира (шахматка / список лотов).
 * Вторичка: объекты из внутренней базы агентства.
 */

export type NewBuildComplex = {
  id: string
  name: string
  developerName: string
}

export type NewBuildApartment = {
  id: string
  rcId: string
  /** Подпись лота (как с шахматки / реестра) */
  label: string
  typology: string
}

export type AgencySecondaryLot = {
  id: string
  address: string
  propertyType: string
}

export const NEW_BUILD_COMPLEXES_MOCK: NewBuildComplex[] = [
  { id: 'rc-olymp', name: 'ЖК Олимп', developerName: 'Группа ПИК' },
  { id: 'rc-samolet', name: 'ЖК Самолёт Парк', developerName: 'Самолёт' },
  { id: 'rc-bunin', name: 'ЖК Бунинские луга', developerName: 'ПИК' },
]

export const NEW_BUILD_APARTMENTS_MOCK: NewBuildApartment[] = [
  { id: 'apt-ol-1', rcId: 'rc-olymp', label: 'корп. 3, кв. 45', typology: '3к, 78 м²' },
  { id: 'apt-ol-2', rcId: 'rc-olymp', label: 'корп. 2, кв. 12', typology: '2к, 56 м²' },
  { id: 'apt-ol-3', rcId: 'rc-olymp', label: 'корп. 1, кв. 201', typology: 'Студия, 28 м²' },
  { id: 'apt-sm-1', rcId: 'rc-samolet', label: 'корп. А, кв. 88', typology: '2к, 54 м²' },
  { id: 'apt-sm-2', rcId: 'rc-samolet', label: 'корп. Б, кв. 15', typology: '1к, 38 м²' },
  { id: 'apt-bn-1', rcId: 'rc-bunin', label: 'секция 4, кв. 7', typology: '3к, 82 м²' },
]

/** Лоты вторички из «своей» базы агентства */
export const AGENCY_SECONDARY_LOTS_MOCK: AgencySecondaryLot[] = [
  { id: 'lot-sec-1', address: 'ул. Садовая, д. 12, кв. 34', propertyType: '2к, 54 м²' },
  { id: 'lot-sec-2', address: 'пр. Мира, д. 88, кв. 7', propertyType: '4к, 110 м²' },
  { id: 'lot-sec-3', address: 'Нижняя Радищевская, д. 5, кв. 11', propertyType: '3к, 71 м²' },
]
