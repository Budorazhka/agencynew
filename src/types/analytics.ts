// [DOC-RU]
// Если ты меняешь этот файл, сначала держи прежний смысл метрик и полей, чтобы UI не разъехался.
// Смысл файла: главный контракт данных аналитики; перед изменением ты проверяешь все места, где эти типы читаются.
// После правок ты проверяешь экран руками и сверяешь ключевые цифры/периоды.

export type AnalyticsPeriod = "week" | "month" | "allTime";

export interface StaticKpi {
    level1Referrals: number;
    totalListings: number;
    totalLeads: number;
    totalDeals: number;
}

export interface DynamicKpi {
    addedListings: number;
    addedLevel1Referrals: number;
    addedLevel2Referrals: number;
    addedLeads: number;
    callClicks: number;
    chatOpens: number;
    selectionsCreated: number;
    deals: number;
}

export interface LeadsTimeseriesPoint {
    date: string;
    leads: number;
}

export interface ActivityTimeseriesPoint {
    date: string;
    calls: number;
    chats: number;
    selections: number;
}

export type FunnelId = "sales" | "network" | "owner" | "broker";

export interface FunnelStage {
    id: string;
    name: string;
    order: number;
    count: number;
}

export interface FunnelColumn {
    id: string;
    name: string;
    count: number;
    stages: FunnelStage[];
}

export interface FunnelBoard {
    id: FunnelId;
    name: string;
    shortName: string;
    totalCount: number;
    activeCount: number;
    rejectionCount: number;
    closedCount: number;
    columns: FunnelColumn[];
}

export type ActivityMarker = "green" | "yellow" | "red";

export interface PartnerRow {
    id: string;
    avatarUrl: string;
    name: string;
    isOnline: boolean;
    lastSeenMinutesAgo: number | null;
    activityMarker: ActivityMarker;
    platformMinutesToday: number;
    crmMinutesToday: number;
    level1Count: number;
    level2Count: number;

    leadsAdded: number;

    callClicks: number;
    chatOpens: number;
    selectionsCreated: number;
    activityTotal: number;

    stageChangesCount: number;
    // считаем прогресс как любое изменение статуса лида за период

    onlineDaysLast7: number;
    onlineWeekMarkers: ActivityMarker[];
    // календарная неделя Пн-Вс, одинаковая сетка дней для всех

    commissionUsd: number;
}

export type SortColumn =
    | "leadsAdded"
    | "stageChangesCount"
    | "activityTotal"
    | "onlineDaysLast7"
    | "commissionUsd";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
    column: SortColumn;
    direction: SortDirection;
}

export interface AnalyticsData {
    period: AnalyticsPeriod;
    periodLabel: string;
    staticKpi: StaticKpi;
    dynamicKpi: DynamicKpi;
    leadsTimeseries: LeadsTimeseriesPoint[];
    activityTimeseries: ActivityTimeseriesPoint[];
    funnels: FunnelBoard[];
    partners: PartnerRow[];
    maxLeadsAdded: number;
    maxStageChangesCount: number;
}

export interface PersonProfile {
    id: string;
    name: string;
    avatarUrl: string;
    isOnline: boolean;
    lastSeenMinutesAgo: number | null;
    activityMarker: ActivityMarker;
    platformMinutesToday: number;
    crmMinutesToday: number;
    level2Count: number;
    onlineDaysLast7: number;
}

export interface PersonAnalyticsData {
    period: AnalyticsPeriod;
    periodLabel: string;
    person: PersonProfile;
    staticKpi: StaticKpi;
    dynamicKpi: DynamicKpi;
    leadsTimeseries: LeadsTimeseriesPoint[];
    activityTimeseries: ActivityTimeseriesPoint[];
    funnels: FunnelBoard[];
    referrals: PartnerRow[];
    maxLeadsAdded: number;
    maxStageChangesCount: number;
}
