import { useMemo, useState } from 'react'
import { Building2, DollarSign, Globe2, MapPin, Users2 } from 'lucide-react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { CityMapPoint } from '@/types/dashboard'

interface GlobeMapProps {
  cities: CityMapPoint[]
}

const GEO_URL =
  'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'

const COUNTRY_CONFIG = [
  {
    id: 'georgia',
    name: 'Грузия',
    englishName: 'Georgia',
    center: [43.5, 42.1] as [number, number],
    zoom: 4.6,
  },
  {
    id: 'thailand',
    name: 'Таиланд',
    englishName: 'Thailand',
    center: [100.8, 15.9] as [number, number],
    zoom: 4.2,
  },
  {
    id: 'turkey',
    name: 'Турция',
    englishName: 'Turkey',
    center: [35.2, 39.0] as [number, number],
    zoom: 4.3,
  },
] as const

type CountryId = (typeof COUNTRY_CONFIG)[number]['id']

const COUNTRY_ID_BY_ENGLISH_NAME: Record<string, CountryId> = {
  Georgia: 'georgia',
  Thailand: 'thailand',
  Turkey: 'turkey',
}

const MAP_OCEAN_COLOR = '#0b1220'
const MAP_LAND_BASE = '#c7d0de'
const MAP_LAND_STROKE = 'rgba(120, 136, 158, 0.42)'
const MAP_HEAT_LOW = '#94b7ff'
const MAP_HEAT_HIGH = '#275cd9'
const CITY_BUBBLE_FILL = 'rgba(59, 130, 246, 0.28)'
const CITY_BUBBLE_STROKE = 'rgba(96, 165, 250, 0.92)'
const CITY_BUBBLE_INNER = 'rgba(191, 219, 254, 0.95)'
const CITY_BUBBLE_ACTIVE = 'rgba(99, 102, 241, 0.75)'

function isCountryId(value: string): value is CountryId {
  return COUNTRY_CONFIG.some((country) => country.id === value)
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3
    ? normalized.split('').map((part) => part + part).join('')
    : normalized
  const parsed = Number.parseInt(value, 16)
  const r = (parsed >> 16) & 255
  const g = (parsed >> 8) & 255
  const b = parsed & 255
  return [r, g, b]
}

function mixHexColor(fromHex: string, toHex: string, amount: number): string {
  const t = clamp01(amount)
  const [r1, g1, b1] = hexToRgb(fromHex)
  const [r2, g2, b2] = hexToRgb(toHex)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  return `rgb(${r}, ${g}, ${b})`
}

function getCountryHeatColor(value: number, maxValue: number): string {
  if (maxValue <= 0 || value <= 0) return MAP_LAND_BASE
  const normalized = Math.sqrt(value / maxValue)
  return mixHexColor(MAP_HEAT_LOW, MAP_HEAT_HIGH, normalized)
}

function getCityBubbleRadius(
  partnersCount: number,
  revenue: number,
  maxPartners: number,
  maxRevenue: number
): number {
  const partnersWeight = maxPartners > 0 ? partnersCount / maxPartners : 0
  const revenueWeight = maxRevenue > 0 ? revenue / maxRevenue : 0
  const score = clamp01(partnersWeight * 0.55 + revenueWeight * 0.45)
  return 6 + score * 10
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString('ru-RU')}`
}

const CITY_FOCUS_ZOOM = 7.4
const MAP_MIN_ZOOM = 2.6
const MAP_MAX_ZOOM = 9.5

export function GlobeMap({ cities }: GlobeMapProps) {
  const navigate = useNavigate()

  const availableCountryIds = useMemo(() => {
    return Array.from(
      new Set(
        cities
          .map((city) => city.countryId)
          .filter((countryId): countryId is CountryId => isCountryId(countryId))
      )
    )
  }, [cities])

  const countryOptions = useMemo(
    () => COUNTRY_CONFIG.filter((country) => availableCountryIds.includes(country.id)),
    [availableCountryIds]
  )

  const [focusedCountryId, setFocusedCountryId] = useState<CountryId>(
    countryOptions[0]?.id ?? COUNTRY_CONFIG[0].id
  )
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null)
  const [hoveredCityId, setHoveredCityId] = useState<string | null>(null)
  const [hoveredCountryId, setHoveredCountryId] = useState<CountryId | null>(null)

  const focusedCountry = useMemo(() => {
    return (
      countryOptions.find((country) => country.id === focusedCountryId) ??
      countryOptions[0] ??
      COUNTRY_CONFIG[0]
    )
  }, [countryOptions, focusedCountryId])

  const focusedCountryCities = useMemo(
    () => cities.filter((city) => city.countryId === focusedCountry.id),
    [cities, focusedCountry.id]
  )

  const selectedCity = useMemo(() => {
    if (!selectedCityId) return null
    return cities.find((city) => city.id === selectedCityId) ?? null
  }, [cities, selectedCityId])

  const hoveredCity = useMemo(() => {
    if (!hoveredCityId) return null
    return cities.find((city) => city.id === hoveredCityId) ?? null
  }, [cities, hoveredCityId])

  const panelCity = selectedCity ?? hoveredCity ?? focusedCountryCities[0] ?? null

  const countryStatsById = useMemo(() => {
    const initial: Record<CountryId, { cityCount: number; referralsCount: number; revenue: number }> = {
      georgia: { cityCount: 0, referralsCount: 0, revenue: 0 },
      thailand: { cityCount: 0, referralsCount: 0, revenue: 0 },
      turkey: { cityCount: 0, referralsCount: 0, revenue: 0 },
    }

    cities.forEach((city) => {
      if (!isCountryId(city.countryId)) return
      initial[city.countryId].cityCount += 1
      initial[city.countryId].referralsCount += city.partnersCount
      initial[city.countryId].revenue += city.totalRevenue
    })

    return initial
  }, [cities])

  const maxCountryRevenue = useMemo(
    () =>
      Math.max(
        ...Object.values(countryStatsById).map((stat) => stat.revenue),
        0
      ),
    [countryStatsById]
  )

  const maxCityPartners = useMemo(
    () => Math.max(...cities.map((city) => city.partnersCount), 0),
    [cities]
  )

  const maxCityRevenue = useMemo(
    () => Math.max(...cities.map((city) => city.totalRevenue), 0),
    [cities]
  )

  const networkStats = useMemo(() => {
    return {
      cityCount: cities.length,
      referralsCount: cities.reduce((sum, city) => sum + city.partnersCount, 0),
      revenue: cities.reduce((sum, city) => sum + city.totalRevenue, 0),
    }
  }, [cities])

  const focusedCountryStats = useMemo(() => {
    return {
      cityCount: focusedCountryCities.length,
      referralsCount: focusedCountryCities.reduce((sum, city) => sum + city.partnersCount, 0),
      revenue: focusedCountryCities.reduce((sum, city) => sum + city.totalRevenue, 0),
    }
  }, [focusedCountryCities])

  const mapCenter: [number, number] = selectedCity?.coordinates ?? focusedCountry.center
  const mapZoom = selectedCity ? CITY_FOCUS_ZOOM : focusedCountry.zoom
  const activeLabelCityId = hoveredCityId ?? selectedCityId
  const hoveredCountryStats = hoveredCountryId ? countryStatsById[hoveredCountryId] : null
  const hoveredCountryName =
    hoveredCountryId
      ? COUNTRY_CONFIG.find((country) => country.id === hoveredCountryId)?.name ?? null
      : null

  const focusCountry = (countryId: CountryId) => {
    setFocusedCountryId(countryId)
    setHoveredCountryId(null)
    setHoveredCityId(null)
    setSelectedCityId((currentCityId) => {
      if (!currentCityId) return null
      const currentCity = cities.find((city) => city.id === currentCityId)
      return currentCity?.countryId === countryId ? currentCityId : null
    })
  }

  const focusCity = (city: CityMapPoint) => {
    if (isCountryId(city.countryId)) {
      setFocusedCountryId(city.countryId)
    }

    if (selectedCityId === city.id) {
      navigate(`/dashboard/city/${city.id}`)
      return
    }

    setHoveredCityId(city.id)
    setSelectedCityId(city.id)
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-sm">
      <header className="border-b border-slate-800 bg-slate-900 px-5 py-4 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold leading-tight">Карта сети MLM</h2>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2">
              <p className="text-xs text-slate-300">Городов</p>
              <p className="text-xl font-semibold">{networkStats.cityCount}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2">
              <p className="text-xs text-slate-300">Рефералов</p>
              <p className="text-xl font-semibold">{networkStats.referralsCount}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2">
              <p className="text-xs text-slate-300">Выручка</p>
              <p className="text-xl font-semibold">{formatMoney(networkStats.revenue)}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {countryOptions.map((country) => {
              const isActive = country.id === focusedCountry.id
              const countryStats = countryStatsById[country.id]
              return (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => focusCountry(country.id)}
                  className={[
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition',
                    isActive
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500 hover:bg-slate-100',
                  ].join(' ')}
                >
                  <span>{country.name}</span>
                  <span
                    className={[
                      'rounded-full border px-2 py-0.5 text-xs font-semibold',
                      isActive
                        ? 'border-slate-500 bg-slate-800 text-slate-100'
                        : 'border-slate-300 bg-slate-100 text-slate-700',
                    ].join(' ')}
                  >
                    • {countryStats.referralsCount}
                  </span>
                </button>
              )
            })}

            <button
              type="button"
              onClick={() => {
                setHoveredCountryId(null)
                setHoveredCityId(null)
                setSelectedCityId(null)
              }}
              className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Сбросить фокус
            </button>
          </div>

          <div
            className="relative h-[560px] overflow-hidden rounded-2xl border border-slate-300"
            style={{
              background: `radial-gradient(circle at 18% 24%, #162236 0%, ${MAP_OCEAN_COLOR} 58%, #0a101d 100%)`,
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(203,213,225,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(203,213,225,0.06)_1px,transparent_1px)] bg-[length:56px_56px]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_55%_0%,rgba(148,163,184,0.14)_0%,rgba(15,23,42,0)_55%)]" />

            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 142 }}
              width={980}
              height={560}
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup
                center={mapCenter}
                zoom={mapZoom}
                minZoom={MAP_MIN_ZOOM}
                maxZoom={MAP_MAX_ZOOM}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const geoName =
                        (geo.properties?.name as string | undefined) ??
                        (geo.properties?.NAME as string | undefined) ??
                        ''
                      const geoCountryId = COUNTRY_ID_BY_ENGLISH_NAME[geoName]
                      const isFocusedCountry = geoCountryId === focusedCountry.id
                      const countryStats = geoCountryId ? countryStatsById[geoCountryId] : null
                      const hasNetworkCity = Boolean(countryStats && countryStats.cityCount > 0)
                      const heatFill =
                        hasNetworkCity && countryStats
                          ? getCountryHeatColor(countryStats.revenue, maxCountryRevenue)
                          : MAP_LAND_BASE
                      const hoverFill =
                        hasNetworkCity
                          ? mixHexColor(heatFill, '#d8e4ff', 0.24)
                          : '#d8e0ec'
                      const pressedFill =
                        hasNetworkCity
                          ? mixHexColor(heatFill, '#f8fbff', 0.1)
                          : '#cfd8e4'
                      const countryName =
                        geoCountryId
                          ? COUNTRY_CONFIG.find((country) => country.id === geoCountryId)?.name ?? geoName
                          : geoName

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => setHoveredCountryId(hasNetworkCity && geoCountryId ? geoCountryId : null)}
                          onMouseLeave={() =>
                            setHoveredCountryId((currentCountryId) =>
                              currentCountryId === geoCountryId ? null : currentCountryId
                            )
                          }
                          stroke={isFocusedCountry ? 'rgba(148, 163, 184, 0.9)' : MAP_LAND_STROKE}
                          strokeWidth={isFocusedCountry ? 1.1 : hasNetworkCity ? 0.82 : 0.56}
                          style={{
                            default: {
                              fill: heatFill,
                              outline: 'none',
                            },
                            hover: {
                              fill: hoverFill,
                              outline: 'none',
                            },
                            pressed: {
                              fill: pressedFill,
                              outline: 'none',
                            },
                          }}
                        >
                          {hasNetworkCity && countryStats && (
                            <title>
                              {`${countryName}\nВыручка: ${formatMoney(countryStats.revenue)}\nРефералов: ${countryStats.referralsCount}`}
                            </title>
                          )}
                        </Geography>
                      )
                    })
                  }
                </Geographies>

                {cities.map((city) => {
                  const isFocused = city.countryId === focusedCountry.id
                  const isSelected = selectedCity?.id === city.id
                  const isHovered = hoveredCity?.id === city.id
                  const showLabel = activeLabelCityId === city.id
                  const zoomCompensation = 1 / mapZoom
                  const labelOffset = city.labelOffset ?? ([12, -10] as [number, number])
                  const markerRadius =
                    getCityBubbleRadius(
                      city.partnersCount,
                      city.totalRevenue,
                      maxCityPartners,
                      maxCityRevenue
                    ) * zoomCompensation
                  const isTopCity =
                    city.totalRevenue >= maxCityRevenue * 0.82 ||
                    city.partnersCount >= maxCityPartners * 0.82
                  const bubbleFill = isSelected
                    ? CITY_BUBBLE_ACTIVE
                    : isHovered
                      ? 'rgba(59, 130, 246, 0.42)'
                      : isFocused
                        ? CITY_BUBBLE_FILL
                        : 'rgba(148, 163, 184, 0.22)'
                  const bubbleStroke = isSelected
                    ? 'rgba(165, 180, 252, 1)'
                    : isHovered
                      ? 'rgba(125, 211, 252, 0.98)'
                      : isFocused
                        ? CITY_BUBBLE_STROKE
                        : 'rgba(148, 163, 184, 0.72)'

                  return (
                    <Marker key={city.id} coordinates={city.coordinates}>
                      <g
                        transform={`translate(0,${-10 * zoomCompensation})`}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredCityId(city.id)}
                        onMouseLeave={() => {
                          setHoveredCityId((currentCityId) =>
                            currentCityId === city.id ? null : currentCityId
                          )
                        }}
                        onClick={() => focusCity(city)}
                      >
                        {isTopCity && (
                          <circle
                            r={markerRadius * 1.22}
                            fill="none"
                            stroke="rgba(129, 140, 248, 0.65)"
                            strokeWidth={1.35 * zoomCompensation}
                          >
                            <animate
                              attributeName="r"
                              values={`${markerRadius * 1.08};${markerRadius * 1.6};${markerRadius * 1.08}`}
                              dur="2.4s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="0.9;0.2;0.9"
                              dur="2.4s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                        {(isSelected || isHovered) && (
                          <circle
                            r={markerRadius * 1.65}
                            fill={isSelected ? 'rgba(129, 140, 248, 0.28)' : 'rgba(56, 189, 248, 0.2)'}
                          />
                        )}
                        <circle
                          r={markerRadius}
                          fill={bubbleFill}
                          stroke={bubbleStroke}
                          strokeWidth={1.7 * zoomCompensation}
                        />
                        <circle
                          r={Math.max(markerRadius * 0.48, 1.8)}
                          fill={CITY_BUBBLE_INNER}
                        />

                        {showLabel && (
                          <g
                            transform={`translate(${labelOffset[0] * zoomCompensation},${labelOffset[1] * zoomCompensation})`}
                          >
                            <rect
                              width={126 * zoomCompensation}
                              height={38 * zoomCompensation}
                              rx={9 * zoomCompensation}
                              fill="rgba(15, 23, 42, 0.92)"
                              stroke="rgba(148, 163, 184, 0.45)"
                              strokeWidth={1 * zoomCompensation}
                            />
                            <text
                              x={9 * zoomCompensation}
                              y={15 * zoomCompensation}
                              style={{
                                fontSize: `${11.5 * zoomCompensation}px`,
                                fontWeight: 700,
                                fill: '#f8fafc',
                              }}
                            >
                              {city.name}
                            </text>
                            <text
                              x={9 * zoomCompensation}
                              y={29 * zoomCompensation}
                              style={{
                                fontSize: `${10 * zoomCompensation}px`,
                                fontWeight: 600,
                                fill: '#bfdbfe',
                              }}
                            >
                              {city.partnersCount} рефералов
                            </text>
                          </g>
                        )}
                      </g>
                    </Marker>
                  )
                })}
              </ZoomableGroup>
            </ComposableMap>

            {hoveredCountryStats && hoveredCountryName && (
              <div className="pointer-events-none absolute right-3 top-3 rounded-lg border border-slate-500/50 bg-slate-900/90 px-3 py-2 text-xs text-slate-100 shadow-xl backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">{hoveredCountryName}</p>
                <p className="mt-1 text-sm font-semibold">{formatMoney(hoveredCountryStats.revenue)}</p>
                <p className="text-[11px] text-slate-300">{hoveredCountryStats.referralsCount} рефералов</p>
              </div>
            )}

            <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-slate-500/50 bg-slate-900/80 px-3 py-2 text-xs text-slate-200 shadow-lg">
              Наведите на город для подсветки. Клик выбирает, повторный клик открывает страницу.
            </div>
          </div>
        </div>

        <aside className="border-t border-slate-200 bg-slate-50 p-4 xl:border-l xl:border-t-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Текущий фокус</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-900">{focusedCountry.name}</h3>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-1 text-slate-600">
                  <Building2 className="h-4 w-4" />
                  <span className="text-xs">Городов</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {focusedCountryStats.cityCount}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-1 text-slate-600">
                  <Users2 className="h-4 w-4" />
                  <span className="text-xs">Рефералов</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {focusedCountryStats.referralsCount}
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-1 text-slate-600">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Выручка страны</span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatMoney(focusedCountryStats.revenue)}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {focusedCountryCities.map((city) => {
              const isActive = panelCity?.id === city.id
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => focusCity(city)}
                  onDoubleClick={() => navigate(`/dashboard/city/${city.id}`)}
                  title="Клик — выбрать город. Повторный клик или двойной клик — открыть аналитику."
                  className={[
                    'group w-full rounded-2xl border px-3 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500',
                    isActive
                      ? 'border-slate-900 bg-slate-900 text-white shadow-[0_8px_18px_rgba(15,23,42,0.33)]'
                      : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold">{city.name}</p>
                      <p
                        className={[
                          'text-sm',
                          isActive ? 'text-slate-300' : 'text-slate-600',
                        ].join(' ')}
                      >
                        {city.partnersCount} рефералов
                      </p>
                      <p
                        className={[
                          'mt-0.5 text-[11px] leading-none',
                          isActive ? 'text-slate-400' : 'text-slate-500',
                        ].join(' ')}
                      >
                        Клик — выбрать, еще клик — открыть
                      </p>
                    </div>
                    <div
                      className={[
                        'shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold transition',
                        isActive
                          ? 'border-slate-500 text-slate-200'
                          : 'border-blue-300 bg-blue-50 text-blue-700 group-hover:border-blue-400 group-hover:bg-blue-100',
                      ].join(' ')}
                    >
                      {formatMoney(city.totalRevenue)}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-600">
              {panelCity ? `Выбран город: ${panelCity.name}` : 'Город не выбран'}
            </p>
            <div className="mt-2 grid gap-2 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="h-4 w-4" />
                <span>{panelCity ? `${panelCity.coordinates[1]}, ${panelCity.coordinates[0]}` : '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Users2 className="h-4 w-4" />
                <span>{panelCity ? `${panelCity.partnersCount} рефералов` : '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Globe2 className="h-4 w-4" />
                <span>{panelCity ? formatMoney(panelCity.totalRevenue) : '-'}</span>
              </div>
            </div>

            <Button
              className="mt-4 w-full bg-slate-900 text-white hover:bg-slate-800"
              disabled={!panelCity}
              onClick={() => {
                if (!panelCity) return
                navigate(`/dashboard/city/${panelCity.id}`)
              }}
            >
              Открыть аналитику города
            </Button>
          </div>
        </aside>
      </div>
    </section>
  )
}
