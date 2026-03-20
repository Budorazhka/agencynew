// [DOC-RU]
// Если ты меняешь этот файл, сначала держи прежний смысл метрик и полей, чтобы UI не разъехался.
// Смысл файла: референс-логика моков и формул; если ты меняешь формулы, проверь совпадение с UI и документацией.
// После правок ты проверяешь экран руками и сверяешь ключевые цифры/периоды.

import type {
    ActivityMarker,
    AnalyticsPeriod,
    AnalyticsData,
    PersonAnalyticsData,
    PersonProfile,
    StaticKpi,
    DynamicKpi,
    LeadsTimeseriesPoint,
    ActivityTimeseriesPoint,
    PartnerRow,
    FunnelBoard,
    FunnelId,
} from "@/types/analytics";

// TODO: заменить на реальные API:
// - GET /api/analytics/kpi?period={period}
// - GET /api/analytics/timeseries/leads?period={period}
// - GET /api/analytics/timeseries/activity?period={period}
// - GET /api/analytics/funnels?period={period}
// - GET /api/analytics/partners?period={period}&sort={column}&direction={asc|desc}

const periodLabels: Record<AnalyticsPeriod, string> = {
    week: "Эта неделя",
    month: "Этот месяц",
    allTime: "За всё время",
};

const staticKpi: StaticKpi = {
    level1Referrals: 247,
    totalListings: 1892,
    totalLeads: 4521,
    totalDeals: 89,
};

const dynamicKpiByPeriod: Record<AnalyticsPeriod, DynamicKpi> = {
    week: {
        addedListings: 32,
        addedLevel1Referrals: 14,
        addedLevel2Referrals: 6,
        addedLeads: 67,
        callClicks: 312,
        chatOpens: 189,
        selectionsCreated: 42,
        deals: 5,
    },
    month: {
        addedListings: 138,
        addedLevel1Referrals: 48,
        addedLevel2Referrals: 21,
        addedLeads: 234,
        callClicks: 1247,
        chatOpens: 756,
        selectionsCreated: 156,
        deals: 18,
    },
    allTime: {
        addedListings: 892,
        addedLevel1Referrals: 189,
        addedLevel2Referrals: 97,
        addedLeads: 1456,
        callClicks: 8934,
        chatOpens: 5621,
        selectionsCreated: 1287,
        deals: 89,
    },
};

type FunnelTemplateColumn = {
    id: string;
    name: string;
    weight: number;
    stages: string[];
};

type FunnelTemplate = {
    id: FunnelId;
    name: string;
    shortName: string;
    columns: FunnelTemplateColumn[];
};

const funnelTemplates: FunnelTemplate[] = [
    {
        id: "sales",
        name: "Продажи",
        shortName: "Продажи",
        columns: [
            {
                id: "rejection",
                name: "Отказ",
                weight: 0.32,
                stages: [
                    "Бракованный лид",
                    "Отказ",
                    "Недозвонился 3",
                    "Недозвонился 2",
                    "Недозвонился 1",
                ],
            },
            {
                id: "in_progress",
                name: "В работе",
                weight: 0.53,
                stages: [
                    "Новый лид",
                    "Попросил связаться позже",
                    "Презентовали компанию",
                    "Обсудили ситуацию в стране",
                    "Выявлена потребность",
                    "Потребность скорректирована",
                    "Отправлено КП",
                    "Отработка возражений",
                    "Отложенный спрос",
                    "Прогрев",
                    "Показ",
                    "Задаток получен",
                    "Заключен договор",
                ],
            },
            {
                id: "success",
                name: "Купили",
                weight: 0.15,
                stages: [
                    "Золотой фонд",
                    "Узнал как дела",
                    "Взять рекомендацию",
                    "Выявление потребности о новых сделках",
                ],
            },
        ],
    },
    {
        id: "network",
        name: "Сеть",
        shortName: "Сеть",
        columns: [
            {
                id: "rejection",
                name: "Отказ",
                weight: 0.34,
                stages: [
                    "Бракованный лид",
                    "Отказ",
                    "Недозвонился 3",
                    "Недозвонился 2",
                    "Недозвонился 1",
                ],
            },
            {
                id: "in_progress",
                name: "В работе",
                weight: 0.56,
                stages: [
                    "Новый лид",
                    "Попросил связаться позже",
                    "Презентовали компанию и стратегию",
                    "Презентовали платформу",
                    "Вручили офер",
                    "Работа с возражениями",
                    "Отложенный спрос",
                    "Согласие",
                    "Заполнена анкета",
                    "Регистрация в личном кабинете",
                    "Подписание оферты",
                    "Начало работы",
                ],
            },
            {
                id: "active",
                name: "Активный",
                weight: 0.1,
                stages: ["Активный партнёр"],
            },
        ],
    },
    {
        id: "owner",
        name: "Собственник",
        shortName: "Собственник",
        columns: [
            {
                id: "rejection",
                name: "Отказ",
                weight: 0.3,
                stages: [
                    "Бракованный контакт",
                    "Отказ собственника",
                    "Недозвонился 3",
                    "Недозвонился 2",
                    "Недозвонился 1",
                ],
            },
            {
                id: "preparation",
                name: "Подготовка",
                weight: 0.42,
                stages: [
                    "Новый собственник",
                    "Попросил связаться позже",
                    "Презентовали компанию",
                    "Обсудили объект и условия",
                    "Предложили фотосессию",
                    "Предложен эксклюзив",
                    "Отработали возражения",
                    "Договорились о сотрудничестве",
                ],
            },
            {
                id: "in_progress",
                name: "В работе",
                weight: 0.28,
                stages: [
                    "Объект активен в продаже",
                    "Взять рекомендацию",
                    "Узнать о новом объекте",
                ],
            },
        ],
    },
    {
        id: "broker",
        name: "Партнёры",
        shortName: "Партнёры",
        columns: [
            {
                id: "rejection",
                name: "Отказ",
                weight: 0.34,
                stages: [
                    "Бракованный контакт",
                    "Отказ",
                    "Недозвонился 3",
                    "Недозвонился 2",
                    "Недозвонился 1",
                ],
            },
            {
                id: "in_progress",
                name: "В работе",
                weight: 0.5,
                stages: [
                    "Новый посредник",
                    "Попросил связаться позже",
                    "Презентовали компанию",
                    "Формат сотрудничества",
                    "Работа с возражениями",
                    "Согласие сотрудничать",
                ],
            },
            {
                id: "active",
                name: "Активный",
                weight: 0.16,
                stages: ["Активный посредник"],
            },
        ],
    },
];

const SALES_DEAL_STAGE_NAME = "Заключен договор";

function getStageCumulativeCount(board: FunnelBoard, stageName: string): number {
    let count = 0;
    let found = false;
    const flowColumnIds = ["in_progress", "active", "success"];

    for (const colId of flowColumnIds) {
        const column = board.columns.find((item) => item.id === colId);
        if (!column) continue;

        for (const stage of column.stages) {
            if (stage.name === stageName) {
                found = true;
            }
            if (found) {
                count += stage.count;
            }
        }
    }

    return count;
}

function getDealsFromFunnels(funnels: FunnelBoard[]): number {
    const salesBoard = funnels.find((board) => board.id === "sales");
    if (!salesBoard) return 0;
    return getStageCumulativeCount(salesBoard, SALES_DEAL_STAGE_NAME);
}

type BasePartner = {
    id: string;
    name: string;
    avatarUrl: string;
    level1Count: number;
    level2Count: number;
    leadsAdded: number;
    onlineDaysLast7: number;
    onlineWeekMarkers: ActivityMarker[];
    isOnline: boolean;
    lastSeenMinutesAgo: number | null;
    activityMarker: ActivityMarker;
    platformMinutesToday: number;
    crmMinutesToday: number;
};

const partnerRoster: { name: string; avatar: string }[] = [
    { name: "Мухаммед Али", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Майк Тайсон", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Рой Джонс", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Бернард Хопкинс", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Эвандер Холифилд", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Флойд Мейвезер", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Мэнни Пакьяо", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Сауль Альварес", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Геннадий Головкин", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Владимир Кличко", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Джо Льюис", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Александр Усик", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Василий Ломаченко", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Теренс Кроуфорд", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Эррол Спенс", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Дмитрий Бивол", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Артур Бетербиев", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Тайсон Фьюри", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Энтони Джошуа", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Деонтей Уайлдер", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Леннокс Льюис", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Джо Фрейзер", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Джордж Форман", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Шугар Рэй Леонард", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Шугар Рэй Робинсон", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Марвин Хаглер", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Томас Хирнс", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Роберто Дюран", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Шугар Рэй Робинсон", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Оскар Де Ла Хойя", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Хулио Сезар Чавес", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Пернелл Уитакер", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Феликс Тринидад", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Хуан Мануэль Маркес", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Серхио Мартинес", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Джо Кальзаге", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Карл Фроч", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Насим Хамед", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Рикки Хаттон", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Амир Хан", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Костя Цзю", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Заб Джуда", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Шейн Мозли", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Дэвид Туа", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Сонни Листон", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
    { name: "Ларри Холмс", avatar: "https://ui-avatars.com/api/?background=64748b&color=ffffff&size=128&font-size=0.6&bold=true&format=svg" },
];

function createRng(seed: number) {
    let state = seed % 2147483647;
    if (state <= 0) state += 2147483646;
    return () => {
        state = (state * 16807) % 2147483647;
        return (state - 1) / 2147483646;
    };
}

function seedFromString(value: string) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) + 1;
}

function getActivityMarker(platformMinutes: number, crmMinutes: number): ActivityMarker {
    if (platformMinutes > 20 || crmMinutes > 20) {
        return "green";
    }

    if (platformMinutes + crmMinutes > 0) {
        return "yellow";
    }

    return "red";
}

function getDailyMinutes(rng: () => number): { platformMinutes: number; crmMinutes: number } {
    const roll = rng();

    if (roll < 0.3) {
        return { platformMinutes: 0, crmMinutes: 0 };
    }

    if (roll < 0.6) {
        const total = Math.floor(rng() * 20) + 1;
        const platformMinutes = Math.floor(rng() * (total + 1));
        return { platformMinutes, crmMinutes: total - platformMinutes };
    }

    const greenOnPlatform = rng() > 0.5;
    if (greenOnPlatform) {
        return {
            platformMinutes: Math.floor(rng() * 80) + 21,
            crmMinutes: Math.floor(rng() * 21),
        };
    }

    return {
        platformMinutes: Math.floor(rng() * 21),
        crmMinutes: Math.floor(rng() * 80) + 21,
    };
}

function ensureNonZeroMinutesIfOnline(
    minutes: { platformMinutes: number; crmMinutes: number },
    isOnline: boolean
) {
    if (!isOnline) return minutes;
    if (minutes.platformMinutes + minutes.crmMinutes > 0) return minutes;
    // Keep "online now" logically consistent with today's activity.
    return { platformMinutes: 1, crmMinutes: 0 };
}

const currentWeekRange = getPeriodDateRange("week");
const currentWeekSeedKey = currentWeekRange.start.toISOString().slice(0, 10);
const currentWeekDayIndex = getDayIndexFromMonday(new Date());

function buildCalendarWeekPresence(seed: number) {
    const weekRng = createRng(seed + seedFromString(`calendar-week-${currentWeekSeedKey}`));
    const dailyMinutes = Array.from({ length: 7 }, () => getDailyMinutes(weekRng));
    const onlineWeekMarkers = dailyMinutes.map((minutes) =>
        getActivityMarker(minutes.platformMinutes, minutes.crmMinutes)
    );
    const todayMinutes = dailyMinutes[currentWeekDayIndex];
    const activityMarker = onlineWeekMarkers[currentWeekDayIndex];
    const onlineDaysLast7 = onlineWeekMarkers.filter((marker) => marker !== "red").length;
    const isOnline = activityMarker !== "red" && weekRng() > 0.4;

    return {
        onlineWeekMarkers,
        onlineDaysLast7,
        isOnline,
        lastSeenMinutesAgo: isOnline ? null : Math.floor(weekRng() * 1200) + 60,
        activityMarker,
        platformMinutesToday: todayMinutes.platformMinutes,
        crmMinutesToday: todayMinutes.crmMinutes,
    };
}

const basePartners: BasePartner[] = partnerRoster.map((partner, index) => {
    const seed = seedFromString(partner.name) + index * 17;
    const presence = buildCalendarWeekPresence(seed);
    const rng = createRng(seed + seedFromString("levels"));
    const level1Count = Math.floor(rng() * 8) + 1;
    const level2Count = Math.floor(rng() * 12) + 1;
    const leadsRng = createRng(seed + seedFromString("leads"));
    const leadsAdded = Math.floor(leadsRng() * 48) + 3;

    return {
        id: `partner-${index + 1}`,
        name: partner.name,
        avatarUrl: partner.avatar,
        level1Count,
        level2Count,
        leadsAdded,
        onlineDaysLast7: presence.onlineDaysLast7,
        onlineWeekMarkers: presence.onlineWeekMarkers,
        isOnline: presence.isOnline,
        lastSeenMinutesAgo: presence.lastSeenMinutesAgo,
        activityMarker: presence.activityMarker,
        platformMinutesToday: presence.platformMinutesToday,
        crmMinutesToday: presence.crmMinutesToday,
    };
});

export const CURRENT_USER_ID = "partner-11";

const BATUMI_PRIMARY_PARTNER_IDS = ["partner-2", "partner-1", "partner-6"];

function buildReferralChildrenMap() {
    const allPartnerIds = basePartners.map((partner) => partner.id);
    const validPrimaryPartners: string[] = BATUMI_PRIMARY_PARTNER_IDS.filter((partnerId) =>
        allPartnerIds.includes(partnerId)
    );

    const map = new Map<string, string[]>();
    map.set(CURRENT_USER_ID, []);
    allPartnerIds.forEach((partnerId) => {
        map.set(partnerId, []);
    });

    // Owner has exactly three key Batumi lines in this scenario.
    validPrimaryPartners.forEach((partnerId) => {
        map.get(CURRENT_USER_ID)?.push(partnerId);
    });

    const assigned = new Set<string>(validPrimaryPartners);
    const remaining = allPartnerIds.filter(
        (partnerId) => partnerId !== CURRENT_USER_ID && !assigned.has(partnerId)
    );

    // First distribute a direct layer under the three key partners.
    const directSeed = createRng(seedFromString("mlm-direct-distribution-v1"));
    const firstWaveCount = Math.min(remaining.length, 18);
    const branchQueue = [...validPrimaryPartners];

    for (let index = 0; index < firstWaveCount; index += 1) {
        const childId = remaining[index];
        const fallbackParent = validPrimaryPartners[index % Math.max(validPrimaryPartners.length, 1)];
        const parentIndex = Math.floor(directSeed() * Math.max(validPrimaryPartners.length, 1));
        const parentId = validPrimaryPartners[parentIndex] ?? fallbackParent;
        if (!parentId) continue;

        map.get(parentId)?.push(childId);
        assigned.add(childId);
        branchQueue.push(childId);
    }

    // Then deepen branches to make visible "deck thickness" and MLM lines.
    const deepSeed = createRng(seedFromString("mlm-depth-distribution-v1"));
    for (let index = firstWaveCount; index < remaining.length; index += 1) {
        const childId = remaining[index];
        if (branchQueue.length === 0) {
            const fallback = validPrimaryPartners[index % Math.max(validPrimaryPartners.length, 1)];
            if (fallback) branchQueue.push(fallback);
        }
        if (branchQueue.length === 0) continue;

        const sampleSize = Math.min(branchQueue.length, 10);
        const sampledIndex = Math.floor(deepSeed() * sampleSize);
        const parentId = branchQueue[sampledIndex];
        if (!parentId) continue;

        map.get(parentId)?.push(childId);
        assigned.add(childId);

        // Rotate queue to keep branches balanced but still hierarchical.
        branchQueue.splice(sampledIndex, 1);
        branchQueue.push(parentId, childId);
    }

    return map;
}

const referralChildrenByPartnerId = buildReferralChildrenMap();

export function getPartnerSummary(id: string) {
    return basePartners.find((partner) => partner.id === id) ?? null;
}

export function getAllPartnerIds() {
    return basePartners.map((partner) => partner.id);
}

function distributeTotal(total: number, buckets: number, seed: number): number[] {
    if (buckets <= 0) return [];
    if (total <= 0) return Array.from({ length: buckets }, () => 0);

    const rng = createRng(seed);
    const weights = Array.from({ length: buckets }, () => rng() + 0.15);
    const weightSum = weights.reduce((sum, value) => sum + value, 0);
    const raw = weights.map((weight) => (weight / weightSum) * total);
    const base = raw.map((value) => Math.floor(value));
    let remainder = total - base.reduce((sum, value) => sum + value, 0);

    const remainders = raw.map((value, index) => ({ index, fraction: value - base[index] }));
    remainders.sort((a, b) => b.fraction - a.fraction);

    let i = 0;
    while (remainder > 0) {
        base[remainders[i % remainders.length].index] += 1;
        remainder -= 1;
        i += 1;
    }

    return base;
}

function distributeByWeights(total: number, weights: number[]): number[] {
    if (weights.length === 0) return [];
    if (total <= 0) return Array.from({ length: weights.length }, () => 0);

    const safeWeights = weights.map((weight) => Math.max(weight, 0));
    const totalWeight = safeWeights.reduce((sum, weight) => sum + weight, 0) || 1;
    const raw = safeWeights.map((weight) => (weight / totalWeight) * total);
    const base = raw.map((value) => Math.floor(value));
    let remainder = total - base.reduce((sum, value) => sum + value, 0);

    const remainders = raw
        .map((value, index) => ({ index, fraction: value - base[index] }))
        .sort((a, b) => b.fraction - a.fraction);

    let i = 0;
    while (remainder > 0 && remainders.length > 0) {
        base[remainders[i % remainders.length].index] += 1;
        remainder -= 1;
        i += 1;
    }

    return base;
}

function getDateRangeDays(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);

    const last = new Date(end);
    last.setHours(0, 0, 0, 0);

    while (current <= last) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

function getMonthRange(start: Date, end: Date): Date[] {
    const months: Date[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= last) {
        months.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
    }

    return months;
}

function getPeriodBuckets(period: AnalyticsPeriod, range: { start: Date; end: Date }) {
    if (period === "allTime") {
        return {
            bucketDates: getMonthRange(range.start, range.end),
            formatter: (date: Date) => date.toLocaleDateString("ru-RU", { month: "short" }),
        };
    }

    return {
        bucketDates: getDateRangeDays(range.start, range.end),
        formatter: (date: Date) => date.toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
    };
}

function generateLeadsTimeseries(period: AnalyticsPeriod, range: { start: Date; end: Date }, totalLeads: number) {
    const { bucketDates, formatter } = getPeriodBuckets(period, range);
    const values = distributeTotal(totalLeads, bucketDates.length, seedFromString(`leads-${period}`));

    return bucketDates.map((date, index) => ({
        date: formatter(date),
        leads: values[index],
    }));
}

function generateActivityTimeseries(
    period: AnalyticsPeriod,
    range: { start: Date; end: Date },
    totals: { calls: number; chats: number; selections: number }
) {
    const { bucketDates, formatter } = getPeriodBuckets(period, range);

    const calls = distributeTotal(totals.calls, bucketDates.length, seedFromString(`calls-${period}`));
    const chats = distributeTotal(totals.chats, bucketDates.length, seedFromString(`chats-${period}`));
    const selections = distributeTotal(
        totals.selections,
        bucketDates.length,
        seedFromString(`selections-${period}`)
    );

    return bucketDates.map((date, index) => ({
        date: formatter(date),
        calls: calls[index],
        chats: chats[index],
        selections: selections[index],
    }));
}

function generatePartners(period: AnalyticsPeriod, totals: DynamicKpi): PartnerRow[] {
    const count = basePartners.length;
    const leadsDistribution = distributeTotal(totals.addedLeads, count, seedFromString(`leads-${period}-partners`));
    const callsDistribution = distributeTotal(totals.callClicks, count, seedFromString(`calls-${period}-partners`));
    const chatsDistribution = distributeTotal(totals.chatOpens, count, seedFromString(`chats-${period}-partners`));
    const selectionsDistribution = distributeTotal(
        totals.selectionsCreated,
        count,
        seedFromString(`selections-${period}-partners`)
    );

    const stageTotal = Math.max(1, Math.round(totals.addedLeads * 1.6 + totals.selectionsCreated * 0.5));
    const stageDistribution = distributeTotal(stageTotal, count, seedFromString(`stage-${period}-partners`));

    return basePartners.map((partner, index) => {
        const callClicks = callsDistribution[index];
        const chatOpens = chatsDistribution[index];
        const selectionsCreated = selectionsDistribution[index];

        // Для графика вовлечённости activityMarker оставляем периодным,
        // но поле "Онлайн 7 дней" фиксировано по календарной неделе (Пн-Вс).
        const activitySeed = seedFromString(`activity-${period}-${partner.id}`);
        const activityRng = createRng(activitySeed);
        const periodMinutes = ensureNonZeroMinutesIfOnline(getDailyMinutes(activityRng), partner.isOnline);
        const activityMarker = getActivityMarker(periodMinutes.platformMinutes, periodMinutes.crmMinutes);
        const isOnline = partner.isOnline && activityMarker !== "red";

        return {
            id: partner.id,
            avatarUrl: partner.avatarUrl,
            name: partner.name,
            isOnline,
            lastSeenMinutesAgo: isOnline ? null : partner.lastSeenMinutesAgo,
            activityMarker,
            platformMinutesToday: periodMinutes.platformMinutes,
            crmMinutesToday: periodMinutes.crmMinutes,
            level1Count: partner.level1Count,
            level2Count: partner.level2Count,
            leadsAdded: leadsDistribution[index],
            callClicks,
            chatOpens,
            selectionsCreated,
            activityTotal: callClicks + chatOpens + selectionsCreated,
            stageChangesCount: stageDistribution[index],
            onlineDaysLast7: partner.onlineDaysLast7,
            onlineWeekMarkers: partner.onlineWeekMarkers,
            commissionUsd: Math.floor(1200 + (totals.deals * 320) + (index + 1) * 110),
        };
    });
}

function getFunnelTotal(id: FunnelId, totals: DynamicKpi) {
    const leadBase = totals.addedLeads;
    const referralBase = totals.addedLevel1Referrals;
    const dealBase = totals.deals;

    switch (id) {
        case "sales":
            return Math.max(8, Math.round(leadBase * 1.35 + dealBase * 5));
        case "network":
            return Math.max(6, Math.round(referralBase * 5 + leadBase * 0.45));
        case "owner":
            return Math.max(6, Math.round(leadBase * 0.85 + dealBase * 3));
        case "broker":
            return Math.max(6, Math.round(leadBase * 0.7 + referralBase * 1.8));
        default:
            return Math.max(6, leadBase);
    }
}

function generateFunnels(period: AnalyticsPeriod, totals: DynamicKpi): FunnelBoard[] {
    return funnelTemplates.map((template) => {
        const totalCount = getFunnelTotal(template.id, totals);
        const columnCounts = distributeByWeights(
            totalCount,
            template.columns.map((column) => column.weight)
        );

        const columns = template.columns.map((column, columnIndex) => {
            const stageCounts = distributeTotal(
                columnCounts[columnIndex],
                column.stages.length,
                seedFromString(`funnel-${period}-${template.id}-${column.id}`)
            );

            return {
                id: column.id,
                name: column.name,
                count: columnCounts[columnIndex],
                stages: column.stages.map((stageName, stageIndex) => ({
                    id: `${template.id}-${column.id}-${stageIndex + 1}`,
                    name: stageName,
                    order: stageIndex + 1,
                    count: stageCounts[stageIndex],
                })),
            };
        });

        const rejectionCount = columns
            .filter((column) => column.id === "rejection")
            .reduce((sum, column) => sum + column.count, 0);
        const closedCount = columns
            .filter((column) => column.id === "success" || column.id === "active")
            .reduce((sum, column) => sum + column.count, 0);
        const activeCount = totalCount - rejectionCount - closedCount;

        return {
            id: template.id,
            name: template.name,
            shortName: template.shortName,
            totalCount,
            activeCount: Math.max(activeCount, 0),
            rejectionCount,
            closedCount,
            columns,
        };
    });
}

type PeriodCache = {
    leadsTimeseries: LeadsTimeseriesPoint[];
    activityTimeseries: ActivityTimeseriesPoint[];
    funnels: FunnelBoard[];
    partners: PartnerRow[];
};

const periodCache: Partial<Record<AnalyticsPeriod, PeriodCache>> = {};

function getPeriodCache(period: AnalyticsPeriod): PeriodCache {
    if (!periodCache[period]) {
        const range = getPeriodDateRange(period);
        const totals = dynamicKpiByPeriod[period];
        const funnels = generateFunnels(period, totals);
        const normalizedTotals: DynamicKpi = {
            ...totals,
            deals: getDealsFromFunnels(funnels),
        };

        periodCache[period] = {
            leadsTimeseries: generateLeadsTimeseries(period, range, normalizedTotals.addedLeads),
            activityTimeseries: generateActivityTimeseries(period, range, {
                calls: normalizedTotals.callClicks,
                chats: normalizedTotals.chatOpens,
                selections: normalizedTotals.selectionsCreated,
            }),
            funnels,
            partners: generatePartners(period, normalizedTotals),
        };
    }

    return periodCache[period]!;
}

export function getAnalyticsData(period: AnalyticsPeriod): AnalyticsData {
    const cache = getPeriodCache(period);
    const allTimeCache = getPeriodCache("allTime");
    const deals = getDealsFromFunnels(cache.funnels);
    const maxLeadsAdded = Math.max(...cache.partners.map((p) => p.leadsAdded), 1);
    const maxStageChangesCount = Math.max(...cache.partners.map((p) => p.stageChangesCount), 1);

    return {
        period,
        periodLabel: periodLabels[period],
        staticKpi: {
            ...staticKpi,
            totalDeals: getDealsFromFunnels(allTimeCache.funnels),
        },
        dynamicKpi: {
            ...dynamicKpiByPeriod[period],
            deals,
        },
        leadsTimeseries: cache.leadsTimeseries,
        activityTimeseries: cache.activityTimeseries,
        funnels: cache.funnels,
        partners: cache.partners,
        maxLeadsAdded,
        maxStageChangesCount,
    };
}

const personPeriodCache: Record<string, PersonAnalyticsData> = {};

function getPartnerIndex(partnerId: string): number {
    return basePartners.findIndex((partner) => partner.id === partnerId);
}

function getPersonDynamicKpi(personId: string, period: AnalyticsPeriod): DynamicKpi {
    const networkTotals = dynamicKpiByPeriod[period];
    const partnerIndex = Math.max(getPartnerIndex(personId), 0);
    const rng = createRng(seedFromString(`self-kpi-${personId}-${period}`));

    const baseIntensity = 0.07 + (partnerIndex % 8) * 0.015 + rng() * 0.03;
    const periodMultiplier = period === "week" ? 1 : period === "month" ? 1.4 : 1.9;
    const scale = (value: number, min = 0) =>
        Math.max(min, Math.round(value * baseIntensity * periodMultiplier));

    return {
        addedListings: scale(networkTotals.addedListings, period === "allTime" ? 1 : 0),
        addedLevel1Referrals: scale(networkTotals.addedLevel1Referrals),
        addedLevel2Referrals: scale(networkTotals.addedLevel2Referrals),
        addedLeads: scale(networkTotals.addedLeads, 1),
        callClicks: scale(networkTotals.callClicks),
        chatOpens: scale(networkTotals.chatOpens),
        selectionsCreated: scale(networkTotals.selectionsCreated),
        deals: scale(networkTotals.deals, period === "allTime" ? 1 : 0),
    };
}

/** KPI по всей сети партнёра: он сам + все прямые рефералы (для календаря активности и блоков «Сеть [имя]»). */
function getPersonNetworkDynamicKpi(personId: string, period: AnalyticsPeriod): DynamicKpi {
    const self = getPersonDynamicKpi(personId, period);
    const referralIds = getDirectReferralIds(personId);
    if (referralIds.length === 0) return self;

    const referralKpis = referralIds.map((id) => getPersonDynamicKpi(id, period));
    const sum = (key: keyof DynamicKpi): number =>
        (referralKpis.reduce((acc, kpi) => acc + (kpi[key] as number), 0) as number) + (self[key] as number);

    return {
        addedListings: sum("addedListings"),
        addedLevel1Referrals: sum("addedLevel1Referrals"),
        addedLevel2Referrals: sum("addedLevel2Referrals"),
        addedLeads: sum("addedLeads"),
        callClicks: sum("callClicks"),
        chatOpens: sum("chatOpens"),
        selectionsCreated: sum("selectionsCreated"),
        deals: sum("deals"),
    };
}

export function getDirectReferralIds(personId: string): string[] {
    return referralChildrenByPartnerId.get(personId) ?? [];
}

function getPresence(
    basePartner: BasePartner,
    period: AnalyticsPeriod,
    seedKey: string
): Pick<
    PersonProfile,
    "isOnline" | "lastSeenMinutesAgo" | "activityMarker" | "platformMinutesToday" | "crmMinutesToday" | "onlineDaysLast7"
> {
    const minutesRng = createRng(seedFromString(`presence-minutes-${seedKey}-${period}`));
    const periodMinutes = getDailyMinutes(minutesRng);
    let platformMinutesToday = periodMinutes.platformMinutes;
    let crmMinutesToday = periodMinutes.crmMinutes;

    if (platformMinutesToday + crmMinutesToday === 0 && (basePartner.platformMinutesToday + basePartner.crmMinutesToday > 0)) {
        platformMinutesToday = basePartner.platformMinutesToday;
        crmMinutesToday = basePartner.crmMinutesToday;
    }

    const activityMarker = getActivityMarker(platformMinutesToday, crmMinutesToday);

    const onlineRng = createRng(seedFromString(`presence-online-${seedKey}-${period}`));
    const onlineBase = Math.floor(onlineRng() * 8);
    const periodBump = period === "month" ? 1 : period === "allTime" ? 2 : 0;
    const onlineDaysLast7 = Math.min(7, Math.max(0, onlineBase + periodBump));
    const isOnline = activityMarker !== "red" && onlineRng() > 0.35;

    return {
        isOnline,
        lastSeenMinutesAgo: isOnline ? null : Math.floor(onlineRng() * 1200) + 30,
        activityMarker,
        platformMinutesToday,
        crmMinutesToday,
        onlineDaysLast7,
    };
}

function buildPersonStaticKpi(
    personId: string,
    referralsCount: number,
    allTimeKpi?: DynamicKpi
): StaticKpi {
    const kpi = allTimeKpi ?? getPersonDynamicKpi(personId, "allTime");
    const allTimeFunnels = generateFunnels("allTime", kpi);
    const allTimeDeals = getDealsFromFunnels(allTimeFunnels);
    const seed = seedFromString(`self-static-${personId}`);

    return {
        level1Referrals: referralsCount,
        totalListings: Math.max(18, kpi.addedListings + 24 + (seed % 28)),
        totalLeads: Math.max(42, kpi.addedLeads + 72 + (seed % 110)),
        totalDeals: Math.max(1, allTimeDeals),
    };
}

function generatePersonReferrals(
    personId: string,
    period: AnalyticsPeriod,
    totals: DynamicKpi
): PartnerRow[] {
    const referralIds = getDirectReferralIds(personId);
    const referralPartners = referralIds
        .map((id) => getPartnerSummary(id))
        .filter((partner): partner is BasePartner => partner !== null && partner.id !== personId);

    if (referralPartners.length === 0) return [];

    const leadsDistribution = distributeTotal(
        Math.max(totals.addedLeads * 2, referralPartners.length),
        referralPartners.length,
        seedFromString(`self-ref-leads-${personId}-${period}`)
    );
    const callsDistribution = distributeTotal(
        Math.max(totals.callClicks, referralPartners.length),
        referralPartners.length,
        seedFromString(`self-ref-calls-${personId}-${period}`)
    );
    const chatsDistribution = distributeTotal(
        Math.max(totals.chatOpens, referralPartners.length),
        referralPartners.length,
        seedFromString(`self-ref-chats-${personId}-${period}`)
    );
    const selectionsDistribution = distributeTotal(
        Math.max(totals.selectionsCreated, referralPartners.length),
        referralPartners.length,
        seedFromString(`self-ref-selections-${personId}-${period}`)
    );
    const stageDistribution = distributeTotal(
        Math.max(
            referralPartners.length,
            Math.round(totals.addedLeads * 1.3 + totals.selectionsCreated * 0.8)
        ),
        referralPartners.length,
        seedFromString(`self-ref-stage-${personId}-${period}`)
    );
    const commissionDistribution = distributeTotal(
        Math.max(referralPartners.length * 120, totals.deals * 580),
        referralPartners.length,
        seedFromString(`self-ref-commission-${personId}-${period}`)
    );

    return referralPartners.map((partner, index) => {
        const calls = callsDistribution[index];
        const chats = chatsDistribution[index];
        const selections = selectionsDistribution[index];
        const presence = getPresence(partner, period, `${personId}-${partner.id}`);

        return {
            id: partner.id,
            avatarUrl: partner.avatarUrl,
            name: partner.name,
            isOnline: presence.isOnline,
            lastSeenMinutesAgo: presence.lastSeenMinutesAgo,
            activityMarker: presence.activityMarker,
            platformMinutesToday: presence.platformMinutesToday,
            crmMinutesToday: presence.crmMinutesToday,
            level1Count: partner.level1Count,
            level2Count: partner.level2Count,
            leadsAdded: leadsDistribution[index],
            callClicks: calls,
            chatOpens: chats,
            selectionsCreated: selections,
            activityTotal: calls + chats + selections,
            stageChangesCount: stageDistribution[index],
            onlineDaysLast7: partner.onlineDaysLast7,
            onlineWeekMarkers: partner.onlineWeekMarkers,
            commissionUsd: Math.max(180, commissionDistribution[index] + (index + 1) * 35),
        };
    });
}

export function getCurrentUserId() {
    return CURRENT_USER_ID;
}

export function getPersonAnalyticsData(
    personId: string,
    period: AnalyticsPeriod
): PersonAnalyticsData | null {
    const basePartner = getPartnerSummary(personId);
    if (!basePartner) return null;

    const cacheKey = `${personId}-${period}`;
    if (personPeriodCache[cacheKey]) {
        return personPeriodCache[cacheKey];
    }

    const baseTotals = getPersonNetworkDynamicKpi(personId, period);
    const funnels = generateFunnels(period, baseTotals);
    const totals: DynamicKpi = {
        ...baseTotals,
        deals: getDealsFromFunnels(funnels),
    };
    const referrals = generatePersonReferrals(personId, period, totals);
    const allTimeNetworkKpi = getPersonNetworkDynamicKpi(personId, "allTime");
    const staticKpiData = buildPersonStaticKpi(personId, referrals.length, allTimeNetworkKpi);
    const range = getPeriodDateRange(period);
    const presence = getPresence(basePartner, period, personId);

    const result: PersonAnalyticsData = {
        period,
        periodLabel: periodLabels[period],
        person: {
            id: basePartner.id,
            name: basePartner.name,
            avatarUrl: basePartner.avatarUrl,
            isOnline: presence.isOnline,
            lastSeenMinutesAgo: presence.lastSeenMinutesAgo,
            activityMarker: presence.activityMarker,
            platformMinutesToday: presence.platformMinutesToday,
            crmMinutesToday: presence.crmMinutesToday,
            level2Count: basePartner.level2Count,
            onlineDaysLast7: presence.onlineDaysLast7,
        },
        staticKpi: staticKpiData,
        dynamicKpi: totals,
        leadsTimeseries: generateLeadsTimeseries(period, range, totals.addedLeads),
        activityTimeseries: generateActivityTimeseries(period, range, {
            calls: totals.callClicks,
            chats: totals.chatOpens,
            selections: totals.selectionsCreated,
        }),
        funnels,
        referrals,
        maxLeadsAdded: Math.max(...referrals.map((item) => item.leadsAdded), 1),
        maxStageChangesCount: Math.max(...referrals.map((item) => item.stageChangesCount), 1),
    };

    personPeriodCache[cacheKey] = result;
    return result;
}

function getDayIndexFromMonday(date: Date): number {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

export function getPeriodDateRange(period: AnalyticsPeriod): { start: Date; end: Date } {
    const now = new Date();
    let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    let start: Date;

    switch (period) {
        case "week": {
            const diffToMonday = getDayIndexFromMonday(now);
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
            // End of the week (Sunday)
            end = new Date(start);
            end.setDate(end.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            break;
        }
        case "month":
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            // End of the month
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
        case "allTime":
            start = new Date(2020, 0, 1);
            break;
        default:
            start = new Date(now);
    }

    return { start, end };
}
