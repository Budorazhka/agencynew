// [DOC-RU]
// Если ты меняешь этот файл, сначала держи прежний смысл метрик и полей, чтобы UI не разъехался.
// Смысл файла: карточки динамических KPI за период; если ты добавляешь метрику, добавь ее и в типы, и в источник данных.
// После правок ты проверяешь экран руками и сверяешь ключевые цифры/периоды.

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    UserPlus,
    UserCheck,
    Phone,
    MessageCircle,
    LayoutList,
    Trophy,
    Home,
    Users,
} from "lucide-react";
import type { DynamicKpi } from "@/types/analytics";

interface DynamicKpiCardsProps {
    data: DynamicKpi;
    todayData?: DynamicKpi;
    periodLabel: string;
    variant?: "full" | "directOnly";
}

const fullKpiConfig = [
    {
        key: "addedListings" as const,
        label: "Новые объекты",
        icon: Home,
        iconColor: "text-amber-600",
        iconBg: "bg-amber-500/10",
    },
    {
        key: "addedLeads" as const,
        label: "Новые лиды",
        icon: UserCheck,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-500/10",
    },
    {
        key: "addedLevel1Referrals" as const,
        label: "Добавлено рефералов L1",
        icon: UserPlus,
        iconColor: "text-violet-600",
        iconBg: "bg-violet-500/10",
    },
    {
        key: "addedLevel2Referrals" as const,
        label: "Добавлено рефералов L2",
        icon: Users,
        iconColor: "text-indigo-600",
        iconBg: "bg-indigo-500/10",
    },
    {
        key: "callClicks" as const,
        label: "Звонки",
        icon: Phone,
        iconColor: "text-orange-600",
        iconBg: "bg-orange-500/10",
    },
    {
        key: "chatOpens" as const,
        label: "Чаты",
        icon: MessageCircle,
        iconColor: "text-sky-600",
        iconBg: "bg-sky-500/10",
    },
    {
        key: "selectionsCreated" as const,
        label: "Рассылки",
        icon: LayoutList,
        iconColor: "text-violet-600",
        iconBg: "bg-violet-500/10",
    },
    {
        key: "deals" as const,
        label: "Сделки",
        icon: Trophy,
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-500/10",
    },
];

const directOnlyKpiKeys: (keyof DynamicKpi)[] = [
    "addedListings",
    "addedLeads",
    "callClicks",
    "chatOpens",
    "selectionsCreated",
    "deals",
];

export function DynamicKpiCards({ data, todayData, periodLabel, variant = "full" }: DynamicKpiCardsProps) {
    const kpiConfig =
        variant === "directOnly"
            ? fullKpiConfig.filter((kpi) => directOnlyKpiKeys.includes(kpi.key))
            : fullKpiConfig;
    const periodLabelLower = periodLabel.toLocaleLowerCase("ru-RU");

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-800">Период:</h3>
                <Badge variant="secondary" className="text-sm font-semibold text-slate-900">
                    {periodLabel}
                </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {kpiConfig.map((kpi) => {
                    const Icon = kpi.icon;
                    const value = data[kpi.key];
                    const todayValue = todayData?.[kpi.key] ?? 0;

                    return (
                        <Card key={kpi.key} className="p-4">
                            <CardContent className="flex min-h-[136px] flex-col gap-2 p-0">
                                <div className="flex items-center justify-between">
                                    <Badge className="max-w-[76%] bg-slate-100 text-slate-700 shadow-none text-sm font-semibold border border-slate-200">
                                        +{todayValue.toLocaleString("ru-RU")} за сегодня
                                    </Badge>
                                    <div className={`rounded-md p-2 ${kpi.iconBg}`}>
                                        <Icon className={`h-4 w-4 ${kpi.iconColor}`} />
                                    </div>
                                </div>
                                <div className="mt-1 text-center">
                                    <p className="text-xl font-bold leading-none text-slate-900 tabular-nums">
                                        {value.toLocaleString("ru-RU")}
                                    </p>
                                    <p className="mt-1 text-base font-semibold leading-snug text-slate-800 break-words">
                                        {kpi.label}
                                    </p>
                                    <p className="text-sm font-medium text-slate-700">за {periodLabelLower}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
