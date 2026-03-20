import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Star, TrendingUp, Users, X } from "lucide-react"
import {
  ActivityCalendarCard,
  ActivityChart,
  ActivityComposition,
  ConversionOverviewChart,
  DynamicKpiCards,
  FunnelKanban,
  LeaderboardTable,
  LeadsChart,
  PartnersActivityDistribution,
  PeriodTabs,
  StaticKpiCards,
  TopReferralsChart,
} from "@/components/analytics-network"
import { CabinetSwitcher } from "@/components/analytics-network/cabinet-switcher"
import { AnalyticsNavLinks } from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PersonalAnalyticsInsights } from "@/components/analytics-network/personal-analytics-insights"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDashboard } from "@/context/DashboardContext"
import { getOwnerDashboardContext } from "@/lib/mock/owner-dashboard"
import { MailingsInbox } from "@/components/mailings/MailingsInbox"
import { GamesBreakPanel } from "@/components/owner/SolitaireBreakPanel"
import {
  getAnalyticsData,
  getPeriodDateRange,
  getPersonAnalyticsData,
  getPartnerSummary,
} from "@/lib/mock/analytics-network"
import { cn } from "@/lib/utils"
import type {
  ActivityMarker,
  AnalyticsPeriod,
  DynamicKpi,
  FunnelBoard,
  PartnerRow,
  SortColumn,
  SortDirection,
  StaticKpi,
} from "@/types/analytics"
import type {
  OwnerCabinetOption,
  OwnerHierarchyNode,
} from "@/types/owner-dashboard"

const defaultSortColumn: SortColumn = "leadsAdded"
const defaultSortDirection: SortDirection = "desc"

type NormalizedAnalyticsData = {
  periodLabel: string
  staticKpi: StaticKpi
  dynamicKpi: DynamicKpi
  funnels: FunnelBoard[]
  partners: PartnerRow[]
  leadsTimeseries: { date: string; leads: number }[]
  activityTimeseries: { date: string; calls: number; chats: number; selections: number }[]
}

function getCabinetAnalyticsData(
  cabinet: OwnerCabinetOption | undefined,
  period: AnalyticsPeriod,
  analyticsPersonIdByPersonId: Record<string, string>
): NormalizedAnalyticsData | null {
  const normalizeNetworkData = () => {
    const networkData = getAnalyticsData(period)
    return {
      periodLabel: networkData.periodLabel,
      staticKpi: networkData.staticKpi,
      dynamicKpi: networkData.dynamicKpi,
      funnels: networkData.funnels,
      partners: networkData.partners,
      leadsTimeseries: networkData.leadsTimeseries,
      activityTimeseries: networkData.activityTimeseries,
    }
  }

  if (!cabinet || cabinet.scope === "network") {
    return normalizeNetworkData()
  }

  if (!cabinet.personId) return null
  const analyticsPersonId =
    analyticsPersonIdByPersonId[cabinet.personId] ?? cabinet.personId
  const personData = getPersonAnalyticsData(analyticsPersonId, period)
  if (!personData) return normalizeNetworkData()

  return {
    periodLabel: personData.periodLabel,
    staticKpi: personData.staticKpi,
    dynamicKpi: personData.dynamicKpi,
    funnels: personData.funnels,
    partners: personData.referrals,
    leadsTimeseries: personData.leadsTimeseries,
    activityTimeseries: personData.activityTimeseries,
  }
}

export function SupremeOwnerDashboardPage() {
  const navigate = useNavigate()
  const { cityId, partnerId } = useParams<{ cityId: string; partnerId: string }>()
  const { state: dashboardState } = useDashboard()
  const cityPartners = useMemo(
    () => dashboardState.cities.find((city) => city.id === cityId)?.partners ?? [],
    [dashboardState.cities, cityId]
  )
  const ownerContext = useMemo(
    () => getOwnerDashboardContext(cityPartners),
    [cityPartners]
  )
  const initialCabinetId =
    ownerContext.availableCabinets.find((cabinet) => cabinet.personId === partnerId)?.id ??
    ownerContext.availableCabinets[0]?.id ??
    "network"
  const [selectedCabinetId, setSelectedCabinetId] = useState(
    initialCabinetId
  )

  const [globalPeriod, setGlobalPeriod] = useState<AnalyticsPeriod>("week")
  const [leadsPeriod, setLeadsPeriod] = useState<AnalyticsPeriod>("week")
  const [activityPeriod, setActivityPeriod] = useState<AnalyticsPeriod>("week")
  const [topReferralsPeriod, setTopReferralsPeriod] =
    useState<AnalyticsPeriod>("week")
  const [engagementPeriod, setEngagementPeriod] = useState<AnalyticsPeriod>("week")

  const [sortColumn, setSortColumn] = useState<SortColumn>(defaultSortColumn)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    defaultSortDirection
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [onlyOnline, setOnlyOnline] = useState(false)
  const [inactiveLast7, setInactiveLast7] = useState(false)
  const [selectedActivityMarker, setSelectedActivityMarker] =
    useState<ActivityMarker | null>(null)
  const [partnerListSearch, setPartnerListSearch] = useState("")
  const [selectedPartners, setSelectedPartners] = useState<Set<string>>(new Set())
  const [allPartnersModalOpen, setAllPartnersModalOpen] = useState(false)
  const [hierarchyDialogOpen, setHierarchyDialogOpen] = useState(false)
  /** В кабинете партнёра: "analytics" — только его аналитика, "network" — его сеть с лидербордом */
  const [partnerViewMode, setPartnerViewMode] = useState<"analytics" | "network">("analytics")

  const selectedCabinet = useMemo(
    () =>
      ownerContext.availableCabinets.find(
        (cabinet) => cabinet.id === selectedCabinetId
      ) ?? ownerContext.availableCabinets[0],
    [ownerContext.availableCabinets, selectedCabinetId]
  )

  const rootPartnerPersonIds = useMemo(() => {
    const rootNode =
      ownerContext.hierarchy.find((node) => node.role === "supreme_owner") ?? null
    if (!rootNode) return new Set<string>()
    const byId = new Map(ownerContext.hierarchy.map((node) => [node.id, node]))
    return new Set(
      rootNode.childrenIds
        .map((nodeId) => byId.get(nodeId)?.personId)
        .filter((personId): personId is string => Boolean(personId))
    )
  }, [ownerContext.hierarchy])

  const cabinetSwitcherOptions = useMemo(() => {
    const compactOptions = ownerContext.availableCabinets.filter((cabinet) => {
      if (cabinet.scope !== "partner") return true
      return Boolean(cabinet.personId && rootPartnerPersonIds.has(cabinet.personId))
    })
    const selectedOption = ownerContext.availableCabinets.find(
      (cabinet) => cabinet.id === selectedCabinetId
    )
    if (selectedOption && !compactOptions.some((cabinet) => cabinet.id === selectedOption.id)) {
      return [...compactOptions, selectedOption]
    }
    return compactOptions
  }, [ownerContext.availableCabinets, rootPartnerPersonIds, selectedCabinetId])

  useEffect(() => {
    if (!partnerId) return
    const byRoute = ownerContext.availableCabinets.find((cabinet) => cabinet.personId === partnerId)
    if (byRoute && byRoute.id !== selectedCabinetId) {
      setSelectedCabinetId(byRoute.id)
    }
  }, [ownerContext.availableCabinets, partnerId, selectedCabinetId])

  useEffect(() => {
    if (partnerId) return
    if (selectedCabinetId !== "network") {
      setSelectedCabinetId("network")
    }
  }, [partnerId, selectedCabinetId])

  useEffect(() => {
    const exists = ownerContext.availableCabinets.some(
      (cabinet) => cabinet.id === selectedCabinetId
    )
    if (!exists) {
      setSelectedCabinetId(ownerContext.availableCabinets[0]?.id ?? "network")
    }
  }, [ownerContext.availableCabinets, selectedCabinetId])

  const globalData = useMemo(
    () =>
      getCabinetAnalyticsData(
        selectedCabinet,
        globalPeriod,
        ownerContext.analyticsPersonIdByPersonId
      ),
    [ownerContext.analyticsPersonIdByPersonId, selectedCabinet, globalPeriod]
  )
  const todayData = useMemo(
    () =>
      getCabinetAnalyticsData(
        selectedCabinet,
        "week",
        ownerContext.analyticsPersonIdByPersonId
      ),
    [ownerContext.analyticsPersonIdByPersonId, selectedCabinet]
  )
  const leadsData = useMemo(
    () =>
      getCabinetAnalyticsData(
        selectedCabinet,
        leadsPeriod,
        ownerContext.analyticsPersonIdByPersonId
      )?.leadsTimeseries ?? [],
    [ownerContext.analyticsPersonIdByPersonId, selectedCabinet, leadsPeriod]
  )
  const activityData = useMemo(
    () =>
      getCabinetAnalyticsData(
        selectedCabinet,
        activityPeriod,
        ownerContext.analyticsPersonIdByPersonId
      )
        ?.activityTimeseries ?? [],
    [ownerContext.analyticsPersonIdByPersonId, selectedCabinet, activityPeriod]
  )
  const monthCalendarData = useMemo(
    () =>
      getCabinetAnalyticsData(
        selectedCabinet,
        "month",
        ownerContext.analyticsPersonIdByPersonId
      )?.activityTimeseries ?? [],
    [ownerContext.analyticsPersonIdByPersonId, selectedCabinet]
  )
  const allTimeCalendarData = useMemo(
    () =>
      getCabinetAnalyticsData(
        selectedCabinet,
        "allTime",
        ownerContext.analyticsPersonIdByPersonId
      )
        ?.activityTimeseries ?? [],
    [ownerContext.analyticsPersonIdByPersonId, selectedCabinet]
  )
  const topReferralsPartners = useMemo(
    () =>
      getCabinetAnalyticsData(
        selectedCabinet,
        topReferralsPeriod,
        ownerContext.analyticsPersonIdByPersonId
      )?.partners ?? [],
    [ownerContext.analyticsPersonIdByPersonId, selectedCabinet, topReferralsPeriod]
  )
  const engagementPartners = useMemo(
    () =>
      getCabinetAnalyticsData(
        selectedCabinet,
        engagementPeriod,
        ownerContext.analyticsPersonIdByPersonId
      )?.partners ?? [],
    [ownerContext.analyticsPersonIdByPersonId, selectedCabinet, engagementPeriod]
  )

  const selectedActivityPartners = useMemo(
    () =>
      selectedActivityMarker
        ? engagementPartners.filter(
            (partner) => partner.activityMarker === selectedActivityMarker
          )
        : [],
    [engagementPartners, selectedActivityMarker]
  )

  const partnerListFiltered = useMemo(() => {
    if (!globalData) return []
    const q = partnerListSearch.trim().toLowerCase()
    const list = globalData.partners
    return q ? list.filter((p) => p.name.toLowerCase().includes(q)) : list
  }, [globalData, partnerListSearch])

  const range = useMemo(() => getPeriodDateRange(globalPeriod), [globalPeriod])
  const monthRangeForCalendar = useMemo(() => getPeriodDateRange("month"), [])
  const rangeLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("ru-RU", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    return `${formatter.format(range.start)} - ${formatter.format(range.end)}`
  }, [range])

  const filteredPartners = useMemo(() => {
    if (!globalData) return []
    const query = searchQuery.trim().toLowerCase()
    let partners = globalData.partners

    if (query) {
      partners = partners.filter((partner) =>
        partner.name.toLowerCase().includes(query)
      )
    }
    if (onlyOnline) {
      partners = partners.filter((partner) => partner.isOnline)
    }
    if (inactiveLast7) {
      partners = partners.filter((partner) => partner.onlineDaysLast7 === 0)
    }

    return partners
  }, [globalData, inactiveLast7, onlyOnline, searchQuery])

  const maxLeadsAdded = useMemo(
    () => Math.max(...filteredPartners.map((partner) => partner.leadsAdded), 1),
    [filteredPartners]
  )
  const maxStageChangesCount = useMemo(
    () =>
      Math.max(...filteredPartners.map((partner) => partner.stageChangesCount), 1),
    [filteredPartners]
  )
  const sortedPartners = useMemo(() => {
    return [...filteredPartners].sort((a, b) => {
      const diff = a[sortColumn] - b[sortColumn]
      if (diff !== 0) {
        return sortDirection === "asc" ? diff : -diff
      }
      return a.name.localeCompare(b.name, "ru", { sensitivity: "base" })
    })
  }, [filteredPartners, sortColumn, sortDirection])

  const level2ReferralsTotal = useMemo(
    () => sortedPartners.reduce((sum, partner) => sum + partner.level2Count, 0),
    [sortedPartners]
  )
  const salesFunnel = useMemo(
    () => globalData?.funnels.find((funnel) => funnel.id === "sales"),
    [globalData]
  )

  const handleSortChange = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
      return
    }
    setSortColumn(column)
    setSortDirection("desc")
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setOnlyOnline(false)
    setInactiveLast7(false)
    setSortColumn(defaultSortColumn)
    setSortDirection(defaultSortDirection)
  }

  const handleSelectAllPartners = () => {
    const allPartnerIds = new Set(globalData?.partners.map(p => p.id) || [])
    setSelectedPartners(allPartnerIds)
  }

  const handleTogglePartnerSelection = (partnerId: string) => {
    setSelectedPartners(prev => {
      const next = new Set(prev)
      if (next.has(partnerId)) {
        next.delete(partnerId)
      } else {
        next.add(partnerId)
      }
      return next
    })
  }

  if (!globalData) {
    return (
      <div className="w-full space-y-4 px-3 py-4 sm:px-5">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-base font-medium">Кабинет недоступен</p>
            <p className="text-sm text-muted-foreground">
              Не удалось загрузить данные выбранного кабинета.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full space-y-4 overflow-x-hidden px-3 py-4 sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-readable-xs text-muted-high-contrast">
            <span>{rangeLabel}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-readable-2xl font-medium text-high-contrast">Дашборд сети</h1>
            <Badge variant="outline" className="text-readable-xs">
              {globalData.periodLabel}
            </Badge>
            <Badge
              variant="secondary"
              className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
            >
              {selectedCabinet?.label}
            </Badge>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 justify-center">
          <AnalyticsNavLinks />
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Button
            size="sm"
            className="border border-emerald-500/35 bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/18"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="size-4" />
            Вернуться на главный дашборд
          </Button>
          <PeriodTabs selectedPeriod={globalPeriod} onPeriodChange={setGlobalPeriod} />
        </div>
      </div>

      <CabinetSwitcher
        value={selectedCabinetId}
        options={cabinetSwitcherOptions}
        onValueChange={(value) => {
          setSelectedCabinetId(value)
          const selected = ownerContext.availableCabinets.find((cabinet) => cabinet.id === value)
          if (!cityId || !selected) return
          if (selected.scope === "network") {
            navigate(`/dashboard/city/${cityId}/partner`)
            return
          }
          if (selected.personId) {
            navigate(`/dashboard/city/${cityId}/partner/${selected.personId}`)
          }
        }}
      />

      {selectedCabinet?.scope === "partner" && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={partnerViewMode === "analytics" ? "default" : "outline"}
            size="sm"
            className={partnerViewMode === "analytics" ? "bg-emerald-700 hover:bg-emerald-600" : "border-slate-300"}
            onClick={() => setPartnerViewMode("analytics")}
          >
            Аналитика {selectedCabinet.label}
          </Button>
          <Button
            variant={partnerViewMode === "network" ? "default" : "outline"}
            size="sm"
            className={partnerViewMode === "network" ? "bg-emerald-700 hover:bg-emerald-600" : "border-slate-300"}
            onClick={() => setPartnerViewMode("network")}
          >
            Сеть {selectedCabinet.label}
          </Button>
        </div>
      )}

      <div className="grid items-stretch gap-5 lg:grid-cols-[380px_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <StaticKpiCards
            data={globalData.staticKpi}
            referralsLabel="Рефералы L1"
            secondMetric={{ label: "Рефералы L2", value: level2ReferralsTotal }}
          />
          <DynamicKpiCards
            data={globalData.dynamicKpi}
            todayData={todayData?.dynamicKpi}
            periodLabel={globalData.periodLabel}
          />
          <ActivityComposition data={globalData.dynamicKpi} />
          <HierarchyPreview
            hierarchy={ownerContext.hierarchy}
            activePersonId={selectedCabinet?.personId ?? null}
            onOpenTree={() => setHierarchyDialogOpen(true)}
          />
          <HierarchyTreeDialog
            open={hierarchyDialogOpen}
            onOpenChange={setHierarchyDialogOpen}
            hierarchy={ownerContext.hierarchy}
            cityId={cityId ?? undefined}
            activePersonId={selectedCabinet?.personId ?? null}
            onSelectPartner={(personId) => {
              const cabinet = ownerContext.availableCabinets.find((item) => item.personId === personId)
              if (cabinet) {
                setSelectedCabinetId(cabinet.id)
              }
              if (cityId) {
                navigate(`/dashboard/city/${cityId}/partner/${personId}`)
                setHierarchyDialogOpen(false)
              }
            }}
            onOpenOwnerCabinet={
              cityId
                ? () => {
                    navigate(`/dashboard/city/${cityId}/partner`)
                    setHierarchyDialogOpen(false)
                  }
                : undefined
            }
          />
          <MailingsInbox
            mailings={dashboardState.mailings}
            variant="cabinet"
            title="Оповещения"
            description="Рассылки в личный кабинет"
          />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-readable-sm text-high-contrast">Партнёры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              <Input
                value={partnerListSearch}
                onChange={(e) => setPartnerListSearch(e.target.value)}
                placeholder="Поиск по имени"
                className="h-10 text-readable-sm"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAllPartnersModalOpen(true)}
                  className="text-readable-xs"
                >
                  Посмотреть всех партнёров
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllPartners}
                  className="text-readable-xs"
                >
                  Выбрать весь список
                </Button>
                {selectedPartners.size > 0 && (
                  <span className="text-readable-xs text-muted-high-contrast self-center">
                    Выбрано: {selectedPartners.size}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "space-y-0.5 rounded-md border bg-muted/20",
                  partnerListFiltered.length > 10 && "max-h-[280px] overflow-y-auto"
                )}
              >
                {partnerListFiltered.length === 0 ? (
                  <div className="px-3 py-4 text-center text-readable-sm text-muted-high-contrast">
                    {partnerListSearch.trim() ? "Ничего не найдено" : "Нет партнёров"}
                  </div>
                ) : (
                  partnerListFiltered.map((partner) => (
                    <div
                      key={partner.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-3 text-readable-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        selectedCabinet?.personId === partner.id &&
                          "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPartners.has(partner.id)}
                        onChange={() => handleTogglePartnerSelection(partner.id)}
                        className="size-4 shrink-0 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (cityId) navigate(`/dashboard/city/${cityId}/partner/${partner.id}`)
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="truncate">{partner.name}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          <GamesBreakPanel cityId={cityId} />
        </div>

        <div className="flex min-w-0 w-full min-h-0 flex-col gap-4 self-start">
          {selectedCabinet?.scope === "partner" && partnerViewMode === "analytics" ? (
            <div className="flex flex-col gap-4">
              <div className="grid items-start gap-4 xl:grid-cols-12">
                <ActivityCalendarCard
                  period={globalPeriod}
                  range={range}
                  monthRange={monthRangeForCalendar}
                  monthData={monthCalendarData}
                  allTimeData={allTimeCalendarData}
                  className="h-full xl:col-span-8"
                />
                {salesFunnel ? (
                  <ConversionOverviewChart funnel={salesFunnel} className="h-full xl:col-span-4" />
                ) : (
                  <Card className="h-full xl:col-span-4">
                    <CardContent className="flex h-full items-center justify-center p-6 text-readable-sm text-muted-high-contrast">
                      Нет данных по воронке продаж.
                    </CardContent>
                  </Card>
                )}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <LeadsChart data={leadsData} period={leadsPeriod} onPeriodChange={setLeadsPeriod} />
                <ActivityChart
                  data={activityData}
                  period={activityPeriod}
                  onPeriodChange={setActivityPeriod}
                />
              </div>
              <PersonalAnalyticsInsights
                dynamicKpi={globalData.dynamicKpi}
                funnels={globalData.funnels}
                period={globalPeriod}
                allowPlanEditing={false}
                onViewNetwork={() => setPartnerViewMode("network")}
              />
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-xl font-semibold text-slate-900 sm:text-2xl">Активность партнеров</p>
                  <p className="text-base text-slate-700">
                    Топ по лидам и распределение по активности за выбранный период.
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <TopReferralsChart
                    partners={topReferralsPartners}
                    period={topReferralsPeriod}
                    onPeriodChange={setTopReferralsPeriod}
                  />
                  <PartnersActivityDistribution
                    partners={engagementPartners}
                    period={engagementPeriod}
                    onPeriodChange={setEngagementPeriod}
                    onSegmentClick={(marker) => setSelectedActivityMarker(marker)}
                  />
                </div>
              </div>
              <div className="mt-8">
                <FunnelKanban funnels={globalData.funnels} />
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 rounded-lg border bg-card px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-4">
                <div className="min-w-0 flex-1">
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Поиск партнёра"
                    className="h-10 text-readable-base"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="owner-only-online"
                    checked={onlyOnline}
                    onCheckedChange={setOnlyOnline}
                  />
                  <Label htmlFor="owner-only-online" className="text-readable-sm font-normal text-high-contrast">
                    Только онлайн
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="owner-inactive-last7"
                    checked={inactiveLast7}
                    onCheckedChange={setInactiveLast7}
                  />
                  <Label
                    htmlFor="owner-inactive-last7"
                    className="text-readable-sm font-normal text-high-contrast"
                  >
                    Не активные 7 дней
                  </Label>
                </div>
              </div>
              <LeaderboardTable
                partners={sortedPartners}
                maxLeadsAdded={maxLeadsAdded}
                maxStageChangesCount={maxStageChangesCount}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                onResetFilters={handleResetFilters}
                className="w-full flex-1 min-h-0"
              />
            </>
          )}
        </div>
      </div>

      {((selectedCabinet?.scope !== "partner") || (selectedCabinet?.scope === "partner" && partnerViewMode === "network")) && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <LeadsChart data={leadsData} period={leadsPeriod} onPeriodChange={setLeadsPeriod} />
            <ActivityChart
              data={activityData}
              period={activityPeriod}
              onPeriodChange={setActivityPeriod}
            />
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-12">
            <ActivityCalendarCard
              period={globalPeriod}
              range={range}
              monthRange={monthRangeForCalendar}
              monthData={monthCalendarData}
              allTimeData={allTimeCalendarData}
              className="h-full xl:col-span-8"
            />
            {salesFunnel ? (
              <ConversionOverviewChart funnel={salesFunnel} className="h-full xl:col-span-4" />
            ) : (
              <Card className="h-full xl:col-span-4">
                <CardContent className="flex h-full items-center justify-center p-6 text-readable-sm text-muted-high-contrast">
                  Нет данных по воронке продаж.
                </CardContent>
              </Card>
            )}
          </div>

          <PersonalAnalyticsInsights
            dynamicKpi={globalData.dynamicKpi}
            funnels={globalData.funnels}
            period={globalPeriod}
            allowPlanEditing={selectedCabinet?.scope === "me"}
          />

          <div className="space-y-3">
            <div className="text-center">
              <p className="text-xl font-semibold text-slate-900 sm:text-2xl">Активность партнеров</p>
              <p className="text-base text-slate-700">
                Топ по лидам и распределение по активности за выбранный период.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <TopReferralsChart
                partners={topReferralsPartners}
                period={topReferralsPeriod}
                onPeriodChange={setTopReferralsPeriod}
              />
              <PartnersActivityDistribution
                partners={engagementPartners}
                period={engagementPeriod}
                onPeriodChange={setEngagementPeriod}
                onSegmentClick={(marker) => setSelectedActivityMarker(marker)}
              />
            </div>
          </div>

          <div className="mt-8">
            <FunnelKanban funnels={globalData.funnels} />
          </div>
        </>
      )}

      {selectedActivityMarker !== null && (
        <Dialog
          open={true}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedActivityMarker(null)
          }}
        >
          <DialogContent className="max-w-lg sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedActivityMarker === "green"
                  ? "Активные партнёры"
                  : selectedActivityMarker === "yellow"
                    ? "Средние партнёры"
                    : "Пассивные партнёры"}
              </DialogTitle>
              <DialogDescription>
                {selectedActivityPartners.length}{" "}
                {selectedActivityPartners.length === 1 ? "партнёр" : "партнёров"} РІ
                этой группе.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 max-h-[400px] space-y-3 overflow-y-auto">
              {selectedActivityPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex flex-col gap-2 rounded-md border p-2 sm:flex-row sm:items-center sm:p-1"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-readable-sm font-medium text-high-contrast">{partner.name}</div>
                    <p className="text-readable-xs text-muted-high-contrast">
                      Лиды: {partner.leadsAdded.toLocaleString("ru-RU")} · Активность:{" "}
                      {partner.activityTotal.toLocaleString("ru-RU")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full shrink-0 sm:w-auto"
                    onClick={() => {
                      if (!cityId) return
                      navigate(`/dashboard/city/${cityId}/partner/${partner.id}`)
                      setSelectedActivityMarker(null)
                    }}
                  >
                    Карточка
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {allPartnersModalOpen && (
        <Dialog
          open={true}
          onOpenChange={(isOpen) => {
            if (!isOpen) setAllPartnersModalOpen(false)
          }}
        >
          <DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-readable-xl font-medium text-high-contrast">
                Все партнёры сети
              </DialogTitle>
              <DialogDescription className="text-readable-base text-muted-high-contrast">
                Полный список всех партнёров в сети. Вы можете выбрать партнёров для массовых действий.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex-1 overflow-y-auto">
              <div className="space-y-2">
                {globalData?.partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPartners.has(partner.id)}
                      onChange={() => handleTogglePartnerSelection(partner.id)}
                      className="size-4 shrink-0 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Avatar className="size-10 shrink-0">
                      <AvatarFallback className="text-readable-sm bg-gradient-to-br from-emerald-500 to-amber-500 text-white font-semibold">
                        {partner.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-readable-base font-medium text-high-contrast">
                        {partner.name}
                      </div>
                      <div className="text-readable-xs text-muted-high-contrast">
                        Лиды: {partner.leadsAdded.toLocaleString("ru-RU")} · 
                        Рефералы L1: {partner.level1Count} · 
                        Рефералы L2: {partner.level2Count}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (cityId) {
                          navigate(`/dashboard/city/${cityId}/partner/${partner.id}`)
                          setAllPartnersModalOpen(false)
                        }
                      }}
                      className="text-readable-xs"
                    >
                      Открыть
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 border-t pt-4 flex justify-between items-center">
              <span className="text-readable-sm text-muted-high-contrast">
                Всего партнёров: {globalData?.partners.length || 0} · 
                Выбрано: {selectedPartners.size}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPartners(new Set())}
                  className="text-readable-xs"
                >
                  Очистить выбор
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setAllPartnersModalOpen(false)
                  }}
                  className="text-readable-xs"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function HierarchyPreview({
  hierarchy,
  activePersonId,
  onOpenTree,
}: {
  hierarchy: OwnerHierarchyNode[]
  activePersonId: string | null
  onOpenTree?: () => void
}) {
  const root = hierarchy.find((node) => node.role === "supreme_owner")
  const byId = new Map(hierarchy.map((node) => [node.id, node]))
  const masters = root
    ? root.childrenIds
        .map((id) => byId.get(id))
        .filter((node): node is OwnerHierarchyNode => Boolean(node))
    : []
  const partnersCount = Math.max(0, hierarchy.length - 1)
  const selectedLabel = activePersonId
    ? hierarchy.find((node) => node.personId === activePersonId)?.label ?? "не выбран"
    : "не выбран"

  const cardContent = (
    <>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-readable-sm font-semibold text-high-contrast">
            {"Расклад рефералов MLM"}
          </CardTitle>
          <span className="text-xs font-medium text-slate-600">3 линии города</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        <p className="text-readable-sm text-high-contrast">
          {"Всего в структуре:"} <span className="font-bold">{partnersCount}</span>
        </p>
        <p className="text-readable-sm text-high-contrast">
          {"Текущий фокус:"} <span className="font-bold">{selectedLabel}</span>
        </p>
        <div className="space-y-2 rounded-md border border-slate-300/80 bg-[linear-gradient(165deg,#ffffff_0%,#f8fafc_62%,#f1f5f9_100%)] px-3 py-2">
          {masters.map((master) => (
            <div
              key={master.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/90 bg-white/85 px-2.5 py-1.5"
            >
              <span className="truncate text-readable-sm font-medium text-high-contrast">
                {master.label}
              </span>
              <Badge variant="outline" className="text-readable-xs">
                {master.childrenIds.length} {"реф."}
              </Badge>
            </div>
          ))}
          {masters.length === 0 && (
            <div className="text-readable-xs text-muted-high-contrast">
              {"Нет данных по иерархии."}
            </div>
          )}
        </div>
      </CardContent>
    </>
  )

  if (onOpenTree) {
    return (
      <Card
        role="button"
        tabIndex={0}
        className="cursor-pointer border-slate-300 bg-[repeating-linear-gradient(45deg,rgba(30,64,175,0.04)_0px,rgba(30,64,175,0.04)_8px,rgba(255,255,255,0.95)_8px,rgba(255,255,255,0.95)_18px)] transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onOpenTree}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onOpenTree()
          }
        }}
      >
        {cardContent}
      </Card>
    )
  }

  return (
    <Card className="border-slate-300 bg-[repeating-linear-gradient(45deg,rgba(30,64,175,0.04)_0px,rgba(30,64,175,0.04)_8px,rgba(255,255,255,0.95)_8px,rgba(255,255,255,0.95)_18px)]">
      {cardContent}
    </Card>
  )
}

function countBranchPartners(
  branchRootId: string,
  byId: Map<string, OwnerHierarchyNode>
) {
  let count = 0
  const queue = [...(byId.get(branchRootId)?.childrenIds ?? [])]

  while (queue.length > 0) {
    const nextId = queue.shift()
    if (!nextId) continue
    const node = byId.get(nextId)
    if (!node) continue
    count += 1
    queue.push(...node.childrenIds)
  }

  return count
}

type DeckThickness = "thin" | "medium" | "thick"

function resolveDeckThickness(size: number): DeckThickness {
  if (size >= 7) return "thick"
  if (size >= 3) return "medium"
  return "thin"
}

function getDeckLayerOffsets(thickness: DeckThickness): number[] {
  if (thickness === "thick") return [8, 14, 20]
  if (thickness === "medium") return [8, 14]
  return [8]
}

function getRoleLabel(role: OwnerHierarchyNode["role"]) {
  if (role === "supreme_owner") return "Собственник"
  if (role === "master_partner") return "Мастер-партнёр"
  return "Партнёр"
}

type HierarchyBranchColumnProps = {
  branchRoot: OwnerHierarchyNode
  focusNode: OwnerHierarchyNode
  childNodes: OwnerHierarchyNode[]
  branchPartnersCount: number
  isActiveBranch: boolean
  onSelectNode: (personId: string) => void
  onStepBack: () => void
}

function HierarchyBranchColumn({
  branchRoot,
  focusNode,
  childNodes,
  branchPartnersCount,
  isActiveBranch,
  onSelectNode,
  onStepBack,
}: HierarchyBranchColumnProps) {
  const focusSummary = getPartnerSummary(focusNode.personId)
  const focusPartnerCount = childNodes.length
  const focusDeckThickness = resolveDeckThickness(focusPartnerCount)
  const isRootFocus = focusNode.id === branchRoot.id
  const focusLevel2Count = childNodes.reduce((total, node) => total + node.childrenIds.length, 0)

  return (
    <div
      className={cn(
        "rounded-2xl border p-3",
        isActiveBranch
          ? "border-emerald-200/70 bg-emerald-950/65 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
          : "border-emerald-800/80 bg-emerald-950/45"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-emerald-50">{branchRoot.label}</p>
          <p className="text-sm text-emerald-100/85">В линии: {branchPartnersCount} рефералов</p>
        </div>
        <Badge className="border-emerald-100/45 bg-emerald-900/70 px-2.5 py-1 text-sm font-semibold text-emerald-50">
          {focusPartnerCount} рефералов
        </Badge>
      </div>

      <div className="rounded-2xl border border-emerald-800/70 bg-[radial-gradient(circle_at_center,rgba(6,78,59,0.34),rgba(2,44,34,0.82))] p-3">
        <div className="relative mx-auto w-full max-w-[360px] pt-4">
          {getDeckLayerOffsets(focusDeckThickness).map((offset, index) => (
            <span
              key={`${focusNode.id}-deck-${index}`}
              aria-hidden
              className="absolute inset-x-1 rounded-2xl border border-slate-300/55 bg-[repeating-linear-gradient(45deg,rgba(30,64,175,0.14)_0px,rgba(30,64,175,0.14)_5px,rgba(255,255,255,0.93)_5px,rgba(255,255,255,0.93)_12px)]"
              style={{
                top: `${offset}px`,
                bottom: "-6px",
              }}
            />
          ))}

          <button
            type="button"
            onClick={() => onSelectNode(focusNode.personId)}
            className={cn(
              "relative z-10 w-full rounded-2xl border border-slate-300 bg-[linear-gradient(160deg,#ffffff_0%,#f8fafc_62%,#eef2f7_100%)] p-4 text-left shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg",
              isActiveBranch && "ring-2 ring-emerald-300/80"
            )}
          >
            <span className="absolute right-3 top-2.5 text-lg font-semibold text-slate-800/30">{"\u2666"}</span>
            <div className="flex items-center gap-3">
              <Avatar className="size-11 border-2 border-white shadow">
                {focusSummary?.avatarUrl ? (
                  <AvatarImage src={focusSummary.avatarUrl} alt={focusNode.label} />
                ) : null}
                <AvatarFallback className="bg-slate-700 text-base font-semibold text-white">
                  {focusNode.label.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-slate-900">{focusNode.label}</p>
                <p className="text-base text-slate-600">{getRoleLabel(focusNode.role)}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-sm font-semibold text-blue-700">
                Реф. L1: {focusNode.childrenIds.length}
              </span>
              <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-sm font-semibold text-violet-700">
                Реф. L2: {focusLevel2Count}
              </span>
            </div>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-sm text-emerald-100/85">Ниже прямые рефералы выбранного партнёра</p>
          <Button
            variant="outline"
            size="sm"
            disabled={isRootFocus}
            onClick={onStepBack}
            className="border-emerald-200/45 bg-emerald-900/45 text-emerald-50 hover:bg-emerald-900/70"
          >
            Назад
          </Button>
        </div>

        <div className="mt-3 space-y-2">
          {childNodes.length === 0 ? (
            <div className="rounded-xl border border-emerald-800/70 bg-emerald-950/65 px-3 py-3 text-base text-emerald-100/75">
              У этого реферала сейчас нет прямых приглашений
            </div>
          ) : (
            childNodes.map((childNode) => {
              const childPartnerCount = childNode.childrenIds.length
              return (
                <button
                  key={childNode.id}
                  type="button"
                  onClick={() => onSelectNode(childNode.personId)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-slate-50/97 px-3 py-2.5 text-left transition hover:bg-white"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-900">{childNode.label}</p>
                    <p className="text-sm text-slate-600">Прямые: {childNode.childrenIds.length}</p>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-sm font-semibold text-emerald-700">
                    {childPartnerCount} рефералов
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function HierarchyTreeDialog({
  open,
  onOpenChange,
  hierarchy,
  cityId,
  activePersonId,
  onSelectPartner,
  onOpenOwnerCabinet,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hierarchy: OwnerHierarchyNode[]
  cityId?: string
  activePersonId: string | null
  onSelectPartner: (personId: string) => void
  onOpenOwnerCabinet?: () => void
}) {
  const [view, setView] = useState<"table" | "analytics">("table")
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [focusByBranchRootId, setFocusByBranchRootId] = useState<
    Record<string, string>
  >({})

  const byId = useMemo(
    () => new Map(hierarchy.map((node) => [node.id, node])),
    [hierarchy]
  )
  const nodeIdByPersonId = useMemo(
    () => new Map(hierarchy.map((node) => [node.personId, node.id] as const)),
    [hierarchy]
  )
  const rootNode = useMemo(
    () => hierarchy.find((node) => node.role === "supreme_owner") ?? null,
    [hierarchy]
  )
  const rootPartners = useMemo(() => {
    if (!rootNode) return []
    return rootNode.childrenIds
      .map((childId) => byId.get(childId))
      .filter((node): node is OwnerHierarchyNode => Boolean(node))
  }, [byId, rootNode])
  const branchNodeIdsByRootId = useMemo(() => {
    const map = new Map<string, Set<string>>()
    rootPartners.forEach((rootPartner) => {
      const branchNodeIds = new Set<string>([rootPartner.id])
      const queue = [...rootPartner.childrenIds]
      while (queue.length > 0) {
        const nextId = queue.shift()
        if (!nextId || branchNodeIds.has(nextId)) continue
        branchNodeIds.add(nextId)
        const nextNode = byId.get(nextId)
        if (!nextNode) continue
        queue.push(...nextNode.childrenIds)
      }
      map.set(rootPartner.id, branchNodeIds)
    })
    return map
  }, [byId, rootPartners])
  const branchPartnersCountByRootId = useMemo(() => {
    const map = new Map<string, number>()
    rootPartners.forEach((rootPartner) => {
      map.set(rootPartner.id, countBranchPartners(rootPartner.id, byId))
    })
    return map
  }, [byId, rootPartners])

  useEffect(() => {
    if (!open) return

    const nextFocus: Record<string, string> = {}
    rootPartners.forEach((rootPartner) => {
      nextFocus[rootPartner.id] = rootPartner.personId
    })

    if (activePersonId) {
      const activeNodeId = nodeIdByPersonId.get(activePersonId)
      if (activeNodeId) {
        const selectedBranchRoot = rootPartners.find((rootPartner) =>
          branchNodeIdsByRootId.get(rootPartner.id)?.has(activeNodeId)
        )
        if (selectedBranchRoot) {
          nextFocus[selectedBranchRoot.id] = activePersonId
        }
      }
    }

    setFocusByBranchRootId(nextFocus)
    setSelectedPersonId(activePersonId ?? rootPartners[0]?.personId ?? null)
    setView("table")
  }, [
    open,
    rootPartners,
    activePersonId,
    nodeIdByPersonId,
    branchNodeIdsByRootId,
  ])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setView("table")
      setSelectedPersonId(null)
      setFocusByBranchRootId({})
    }
    onOpenChange(nextOpen)
  }

  const handleSelectInBranch = (branchRootId: string, personId: string) => {
    setFocusByBranchRootId((current) => ({
      ...current,
      [branchRootId]: personId,
    }))
    setSelectedPersonId(personId)
  }

  const handleStepBackInBranch = (branchRootId: string) => {
    const branchRoot = rootPartners.find((node) => node.id === branchRootId)
    if (!branchRoot) return

    setFocusByBranchRootId((current) => {
      const currentPersonId = current[branchRootId] ?? branchRoot.personId
      const currentNodeId = nodeIdByPersonId.get(currentPersonId)
      const currentNode = currentNodeId ? byId.get(currentNodeId) : null

      let nextPersonId = branchRoot.personId
      if (currentNode?.parentId) {
        const parentNode = byId.get(currentNode.parentId)
        if (parentNode && parentNode.id !== rootNode?.id) {
          nextPersonId = parentNode.personId
        }
      }

      setSelectedPersonId(nextPersonId)

      return {
        ...current,
        [branchRootId]: nextPersonId,
      }
    })
  }

  const handleBackToTable = () => {
    setView("table")
  }

  const handleOpenCabinet = (personId: string) => {
    onSelectPartner(personId)
    handleOpenChange(false)
  }

  const selectedNode = useMemo(() => {
    if (!selectedPersonId) return null
    const selectedNodeId = nodeIdByPersonId.get(selectedPersonId)
    if (!selectedNodeId) return null
    return byId.get(selectedNodeId) ?? null
  }, [byId, nodeIdByPersonId, selectedPersonId])

  const selectedBranchRoot = useMemo(() => {
    if (!selectedNode) return null
    return (
      rootPartners.find((rootPartner) =>
        branchNodeIdsByRootId.get(rootPartner.id)?.has(selectedNode.id)
      ) ?? null
    )
  }, [branchNodeIdsByRootId, rootPartners, selectedNode])

  const rootSummary = rootNode ? getPartnerSummary(rootNode.personId) : null
  const selectedNodeLevel2Count = selectedNode
    ? selectedNode.childrenIds.reduce((total, childId) => {
        const child = byId.get(childId)
        return total + (child?.childrenIds.length ?? 0)
      }, 0)
    : 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!fixed !inset-0 !top-0 !left-0 !translate-x-0 !translate-y-0 !m-0 !h-screen !w-screen !max-w-none !rounded-none !border-0 !p-0 overflow-hidden flex flex-col bg-emerald-950"
      >
        <DialogHeader className="shrink-0 border-b border-emerald-700/60 bg-emerald-900 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="text-4xl font-semibold text-emerald-50">
                Карточный стол MLM
              </DialogTitle>
              <DialogDescription className="text-xl text-emerald-100/90">
                На столе только карточные линии. Выбирайте карту, смотрите
                рефералов в колоде и проваливайтесь глубже.
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              className="shrink-0 gap-1.5 border-emerald-200/35 bg-emerald-950/45 text-emerald-50 hover:bg-emerald-900/90"
            >
              <X className="size-4" />
              Закрыть
            </Button>
          </div>
        </DialogHeader>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.24),rgba(2,44,34,0.96))]">
          <div
            className={cn(
              "absolute inset-0 overflow-auto transition-all duration-500 ease-in-out",
              view === "table"
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-6 pointer-events-none"
            )}
          >
            <div className="mx-auto flex h-full w-full max-w-[1800px] flex-col gap-4 p-4 lg:flex-row">
              <section className="min-h-0 flex-1 rounded-3xl border border-emerald-800/70 bg-emerald-950/35 p-4 shadow-inner shadow-black/20">
                <div className="rounded-xl border border-emerald-700/70 bg-emerald-950/55 px-4 py-3 text-xl font-semibold text-emerald-50">
                  {selectedNode
                    ? `Фокус ветки: ${selectedNode.label}. Нажимайте рефералов ниже, чтобы смотреть следующую глубину.`
                    : "Фокус ветки: Вы. Выбирайте карту и смотрите его рефералов справа."}
                </div>

                {rootPartners.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-emerald-700/70 bg-emerald-950/55 px-4 py-6 text-lg text-emerald-100/90">
                    Нет данных по реферальным линиям для отображения.
                  </div>
                ) : (
                  <div
                    className={cn(
                      "mt-4 grid gap-4",
                      rootPartners.length >= 3
                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                        : rootPartners.length === 2
                          ? "grid-cols-1 md:grid-cols-2"
                          : "grid-cols-1"
                    )}
                  >
                    {rootPartners.map((rootPartner) => {
                      const focusedPersonId =
                        focusByBranchRootId[rootPartner.id] ?? rootPartner.personId
                      const focusedNodeId =
                        nodeIdByPersonId.get(focusedPersonId) ?? rootPartner.id
                      const focusedNode = byId.get(focusedNodeId) ?? rootPartner
                      const childNodes = focusedNode.childrenIds
                        .map((childId) => byId.get(childId))
                        .filter((node): node is OwnerHierarchyNode => Boolean(node))

                      return (
                        <HierarchyBranchColumn
                          key={rootPartner.id}
                          branchRoot={rootPartner}
                          focusNode={focusedNode}
                          childNodes={childNodes}
                          branchPartnersCount={
                            branchPartnersCountByRootId.get(rootPartner.id) ?? 0
                          }
                          isActiveBranch={selectedBranchRoot?.id === rootPartner.id}
                          onSelectNode={(personId) =>
                            handleSelectInBranch(rootPartner.id, personId)
                          }
                          onStepBack={() => handleStepBackInBranch(rootPartner.id)}
                        />
                      )
                    })}
                  </div>
                )}
              </section>

              <aside className="w-full shrink-0 rounded-3xl border border-emerald-700/70 bg-emerald-50/90 p-4 lg:w-[360px]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-300 bg-white/85 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-14 border-2 border-white shadow">
                        {rootSummary?.avatarUrl ? (
                          <AvatarImage src={rootSummary.avatarUrl} alt={rootNode?.label ?? "Вы"} />
                        ) : null}
                        <AvatarFallback className="bg-slate-500 text-lg font-semibold text-white">
                          {(rootNode?.label ?? "Вы").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-2xl font-semibold text-slate-900">
                          {rootNode?.label ?? "Вы"}
                        </p>
                        <p className="text-base text-slate-600">Собственник</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-2">
                        <p className="text-sm text-slate-600">Прямые</p>
                        <p className="text-2xl font-semibold text-slate-900">
                          {rootPartners.length}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-2">
                        <p className="text-sm text-slate-600">Вся ветка</p>
                        <p className="text-2xl font-semibold text-slate-900">
                          {Math.max(0, hierarchy.length - 1)}
                        </p>
                      </div>
                    </div>
                    {onOpenOwnerCabinet && (
                      <Button
                        variant="outline"
                        className="mt-3 w-full border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                        onClick={onOpenOwnerCabinet}
                      >
                        Кабинет собственника
                      </Button>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-base font-semibold uppercase tracking-wide text-slate-700">
                      Рефералы 1 линии
                    </p>
                    <div className="space-y-2">
                      {rootPartners.map((rootPartner) => (
                        <button
                          key={rootPartner.id}
                          type="button"
                          onClick={() =>
                            handleSelectInBranch(rootPartner.id, rootPartner.personId)
                          }
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition",
                            selectedBranchRoot?.id === rootPartner.id
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-slate-300 bg-white hover:bg-slate-50"
                          )}
                        >
                          <span className="truncate text-lg font-medium text-slate-900">
                            {rootPartner.label}
                          </span>
                          <Badge
                            variant="outline"
                            className="border-blue-200 bg-blue-50 text-sm text-blue-700"
                          >
                            Реф. L1: {rootPartner.childrenIds.length}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedNode && (
                    <div className="rounded-2xl border border-slate-300 bg-white/90 p-3">
                      <p className="truncate text-2xl font-semibold text-slate-900">
                        {selectedNode.label}
                      </p>
                      <p className="text-base text-slate-600">
                        {getRoleLabel(selectedNode.role)}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-2">
                          <p className="text-sm text-slate-600">Рефералы L1</p>
                          <p className="text-xl font-semibold text-slate-900">
                            {selectedNode.childrenIds.length}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-2">
                          <p className="text-sm text-slate-600">Рефералы L2</p>
                          <p className="text-xl font-semibold text-slate-900">
                            {selectedNodeLevel2Count}
                          </p>
                        </div>
                      </div>
                      <Button
                        className="mt-3 w-full bg-emerald-700 text-base text-white hover:bg-emerald-600"
                        onClick={() => {
                          if (!selectedPersonId) return
                          setView("analytics")
                        }}
                        disabled={!selectedPersonId}
                      >
                        Открыть аналитику реферала
                      </Button>
                      {cityId && selectedPersonId && (
                        <Button
                          variant="outline"
                          className="mt-2 w-full border-slate-300 bg-white text-base text-slate-800 hover:bg-slate-100"
                          onClick={() => handleOpenCabinet(selectedPersonId)}
                        >
                          Открыть кабинет реферала
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>

          <div
            className={cn(
              "absolute inset-0 overflow-auto transition-all duration-500 ease-in-out",
              view === "analytics"
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-6 pointer-events-none"
            )}
          >
            {selectedPersonId && (
              <PartnerAnalyticsPanel
                personId={selectedPersonId}
                onBack={handleBackToTable}
                onOpenCabinet={cityId ? () => handleOpenCabinet(selectedPersonId) : undefined}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PartnerAnalyticsPanel({
  personId,
  onBack,
  onOpenCabinet,
}: {
  personId: string
  onBack: () => void
  onOpenCabinet?: () => void
}) {
  const summary = getPartnerSummary(personId)
  const analytics = getPersonAnalyticsData(personId, "week")

  if (!summary || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <Button variant="ghost" onClick={onBack} className="self-start">
          <ArrowLeft className="size-4 mr-2" />
          Назад
        </Button>
        <p className="text-muted-high-contrast">Данные реферала не найдены.</p>
      </div>
    )
  }

  const { person, staticKpi, dynamicKpi } = analytics

  const activityConfig: Record<ActivityMarker, { label: string; color: string }> = {
    green: { label: "Активный", color: "bg-emerald-500" },
    yellow: { label: "Средний", color: "bg-amber-500" },
    red: { label: "Пассивный", color: "bg-rose-500" },
  }
  const activity = activityConfig[person.activityMarker]

  const kpiCards = [
    {
      label: "Лиды (неделя)",
      value: dynamicKpi.addedLeads,
      icon: <TrendingUp className="size-5 text-emerald-600" />,
      colorClass: "bg-emerald-50 border-emerald-100",
    },
    {
      label: "Рефералы L1",
      value: staticKpi.level1Referrals,
      icon: <Users className="size-5 text-amber-600" />,
      colorClass: "bg-amber-50 border-amber-100",
    },
    {
      label: "Рефералы L2",
      value: person.level2Count,
      icon: <Star className="size-5 text-amber-600" />,
      colorClass: "bg-amber-50 border-amber-100",
    },
    {
      label: "Сделки (всего)",
      value: staticKpi.totalDeals,
      icon: <TrendingUp className="size-5 text-emerald-600" />,
      colorClass: "bg-emerald-50 border-emerald-100",
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="-ml-2 self-start text-muted-high-contrast hover:text-high-contrast"
      >
        <ArrowLeft className="size-4 mr-2" />
        Вернуться к карточному столу
      </Button>

      {/* Identity block */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <Avatar className="size-24 border-4 border-white shadow-lg">
            {person.avatarUrl ? (
              <AvatarImage src={person.avatarUrl} alt={person.name} />
            ) : null}
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-emerald-500 to-amber-500 text-white">
              {person.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {person.isOnline && (
            <span className="absolute bottom-1 right-1 size-4 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>

        <div className="min-w-0 flex flex-col gap-2">
          <h2 className="text-readable-2xl font-bold text-high-contrast truncate">
            {person.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-readable-xs">
              {person.isOnline ? "Онлайн сейчас" : "Не в сети"}
            </Badge>
            <div className="flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-full shrink-0", activity.color)} />
              <span className="text-readable-xs text-muted-high-contrast">{activity.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className={cn("border", kpi.colorClass)}>
            <CardContent className="flex flex-col items-center gap-1.5 p-4 text-center">
              {kpi.icon}
              <span className="text-2xl font-bold text-high-contrast">
                {kpi.value.toLocaleString("ru-RU")}
              </span>
              <span className="text-[11px] text-muted-high-contrast leading-tight">
                {kpi.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Open cabinet */}
      {onOpenCabinet && (
        <Button
          onClick={onOpenCabinet}
          size="lg"
          className="self-start"
        >
          Открыть кабинет реферала
        </Button>
      )}
    </div>
  )
}

