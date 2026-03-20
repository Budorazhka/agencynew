// [DOC-RU]
// Если ты меняешь этот файл, сначала держи прежний смысл метрик и полей, чтобы UI не разъехался.
// Смысл файла: карточки статических KPI (накопительные значения); если ты меняешь подписи, синхронизируй с продуктовой терминологией.
// После правок ты проверяешь экран руками и сверяешь ключевые цифры/периоды.

import { Card, CardContent } from "@/components/ui/card";
import { Users, Home, UserCheck, Handshake } from "lucide-react";
import type { StaticKpi } from "@/types/analytics";

interface StaticKpiCardsProps {
    data: StaticKpi;
    referralsLabel?: string;
    secondMetric?: {
        label: string;
        value: number;
    };
}

function getKpiConfig(referralsLabel: string, secondMetricLabel: string) {
    return [
        {
            key: "level1Referrals" as const,
            label: referralsLabel,
            icon: Users,
            iconColor: "text-violet-600",
            iconBg: "bg-violet-500/10",
        },
        {
            key: "totalListings" as const,
            label: secondMetricLabel,
            icon: Home,
            iconColor: "text-amber-600",
            iconBg: "bg-amber-500/10",
        },
        {
            key: "totalLeads" as const,
            label: "Лиды",
            icon: UserCheck,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-500/10",
        },
        {
            key: "totalDeals" as const,
            label: "Сделки",
            icon: Handshake,
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-500/10",
        },
    ];
}

export function StaticKpiCards({ data, referralsLabel = "Рефералы L1", secondMetric }: StaticKpiCardsProps) {
    const kpiConfig = getKpiConfig(referralsLabel, secondMetric?.label ?? "Объекты");

    return (
        <div className="grid grid-cols-2 gap-3">
            {kpiConfig.map((kpi) => {
                const Icon = kpi.icon;
                const value = kpi.key === "totalListings" && secondMetric ? secondMetric.value : data[kpi.key];

                return (
                    <Card key={kpi.key} className="p-4">
                        <CardContent className="flex min-h-[120px] flex-col items-center justify-center gap-2.5 p-0 text-center">
                            <div className={`rounded-lg p-2.5 ${kpi.iconBg}`}>
                                <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-medium leading-snug text-slate-800 break-words">{kpi.label}</p>
                                <p className="text-2xl font-bold leading-none text-slate-900 tabular-nums">
                                    {value.toLocaleString("ru-RU")}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

