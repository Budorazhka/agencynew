"use client";
// [DOC-RU]
// Если ты меняешь этот файл, сначала держи прежний смысл метрик и полей, чтобы UI не разъехался.
// Смысл файла: график топ-рефералов; тут ты показываешь лидеров по лидам в выбранном периоде.
// После правок ты проверяешь экран руками и сверяешь ключевые цифры/периоды.


import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { PartnerRow, AnalyticsPeriod } from "@/types/analytics";

interface TopReferralsChartProps {
    partners: PartnerRow[];
    period: AnalyticsPeriod;
    onPeriodChange: (period: AnalyticsPeriod) => void;
}

const chartConfig = {
    referrals: {
        label: "Новые лиды",
        color: "hsl(142, 76%, 36%)",
    },
} satisfies ChartConfig;

const periods: { value: AnalyticsPeriod; label: string }[] = [
    { value: "week", label: "Неделя" },
    { value: "month", label: "Месяц" },
    { value: "allTime", label: "За всё время" },
];

export function TopReferralsChart({ partners, period, onPeriodChange }: TopReferralsChartProps) {
    const topPartners = [...partners]
        .sort((a, b) => {
            const diff = b.leadsAdded - a.leadsAdded;
            if (diff !== 0) return diff;
            return a.name.localeCompare(b.name, "ru", { sensitivity: "base" });
        })
        .slice(0, 5)
        .map((partner) => ({
            name: partner.name,
            value: partner.leadsAdded,
        }));

    if (topPartners.length === 0) {
        return null;
    }

    const totalLeads = topPartners.reduce((sum, partner) => sum + partner.value, 0);

    return (
        <Card className="w-full">
            <CardHeader className="px-4 pb-2 pt-4">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                        <CardTitle className="text-center text-lg font-semibold text-slate-900 sm:text-xl">Топ-5 партнёров по лидам</CardTitle>
                        <span className="text-sm text-slate-700">
                            Всего: <span className="font-medium">{totalLeads.toLocaleString("ru-RU")}</span>
                        </span>
                    </div>
                    <Tabs value={period} onValueChange={(v) => onPeriodChange(v as AnalyticsPeriod)} className="h-auto">
                        <TabsList className="h-auto flex-wrap p-0.5">
                            {periods.map((p) => (
                                <TabsTrigger
                                    key={p.value}
                                    value={p.value}
                                    className="h-8 px-3 text-base font-medium data-[state=active]:bg-background"
                                >
                                    {p.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
                <ChartContainer config={chartConfig} className="h-[320px] w-full min-h-0">
                    <BarChart
                        data={topPartners}
                        layout="vertical"
                        margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                    >
                        <CartesianGrid
                            horizontal={false}
                            strokeDasharray="3 3"
                            stroke="rgba(144, 164, 174, 0.3)"
                        />
                        <XAxis
                            type="number"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#475569", fontSize: 14, fontWeight: 500 }}
                            allowDecimals={false}
                            tickFormatter={(value) => Number(value).toFixed(0)}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            width={200}
                            tick={{ fill: "#475569", fontSize: 14, fontWeight: 500 }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar
                            dataKey="value"
                            fill="var(--color-referrals)"
                            radius={[4, 4, 4, 4]}
                            barSize={22}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

