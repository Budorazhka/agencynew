import { GlobeMap } from './GlobeMap'
import type { CityMapPoint } from '@/types/dashboard'

interface WorldMapProps {
  cities: CityMapPoint[]
}

export function WorldMap({ cities }: WorldMapProps) {
  return <GlobeMap cities={cities} />
}
