"use client";
// [DOC-RU]
// Если ты меняешь этот файл, сначала держи прежний смысл метрик и полей, чтобы UI не разъехался.
// Смысл файла: график лидов по периодам; если ты меняешь агрегацию, проверяй совместимость с period week/month/allTime.
// После правок ты проверяешь экран руками и сверяешь ключевые цифры/периоды.


import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { LeadsTimeseriesPoint, AnalyticsPeriod } from "@/types/analytics";

interface LeadsChartProps {
    data: LeadsTimeseriesPoint[];
    period: AnalyticsPeriod;
    onPeriodChange: (period: AnalyticsPeriod) => void;
}

const chartConfig = {
    leads: {
        label: "Лиды",
        color: "hsl(142, 76%, 36%)",
    },
} satisfies ChartConfig;

const periods: { value: AnalyticsPeriod; label: string }[] = [
    { value: "week", label: "Неделя" },
    { value: "month", label: "Месяц" },
    { value: "allTime", label: "За всё время" },
];

export function LeadsChart({ data, period, onPeriodChange }: LeadsChartProps) {
    const totalLeads = data.reduce((sum, point) => sum + point.leads, 0);

    return (
        <Card className="w-full">
            <CardHeader className="px-4 pb-2 pt-4">
                <div className="flex flex-col items-center gap-2">
                    <CardTitle className="text-center text-lg font-semibold text-slate-900 sm:text-xl">Динамика лидов</CardTitle>
                    <div className="flex items-center justify-center gap-2">
                        <Tabs
                            value={period}
                            onValueChange={(v) => onPeriodChange(v as AnalyticsPeriod)}
                            className="h-auto"
                        >
                            <TabsList className="h-auto w-full flex-wrap justify-center p-0.5">
                                {periods.map((p) => (
                                    <TabsTrigger
                                        key={p.value}
                                        value={p.value}
                                        className="h-8 px-3 text-center text-base font-medium whitespace-normal leading-tight data-[state=active]:bg-background sm:whitespace-nowrap"
                                    >
                                        {p.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
                <div className="mt-1 text-center">
                    <span className="text-4xl font-bold leading-none text-slate-900">{totalLeads.toLocaleString("ru-RU")}</span>
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                    <AreaChart accessibilityLayer data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="rgba(144, 164, 174, 0.3)"
                        />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            fontSize={11}
                            minTickGap={30}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            fontSize={11}
                            width={30}
                            allowDecimals={false}
                            tickFormatter={(value) => Number(value).toFixed(0)}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                            type="monotone"
                            dataKey="leads"
                            stroke="hsl(142, 76%, 36%)"
                            strokeWidth={3}
                            fill="url(#leadsGradient)"
                            fillOpacity={1}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

