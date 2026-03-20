"use client";
// [DOC-RU]
// Если ты меняешь этот файл, сначала держи прежний смысл метрик и полей, чтобы UI не разъехался.
// Смысл файла: график активности по каналам; если ты меняешь формат данных, синхронизируй его с типами и API.
// После правок ты проверяешь экран руками и сверяешь ключевые цифры/периоды.


import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import type { ActivityTimeseriesPoint, AnalyticsPeriod } from "@/types/analytics";

interface ActivityChartProps {
    data: ActivityTimeseriesPoint[];
    period: AnalyticsPeriod;
    onPeriodChange: (period: AnalyticsPeriod) => void;
}

const chartConfig = {
    calls: {
        label: "Звонки",
        color: "hsl(22, 90%, 52%)",
    },
    chats: {
        label: "Чаты",
        color: "hsl(199, 89%, 48%)",
    },
    selections: {
        label: "Рассылки",
        color: "hsl(262, 72%, 58%)",
    },
} satisfies ChartConfig;

const legendItems = [
    { key: "calls", label: "Звонки", color: "bg-orange-500" },
    { key: "chats", label: "Чаты", color: "bg-sky-500" },
    { key: "selections", label: "Рассылки", color: "bg-violet-500" },
];

const periods: { value: AnalyticsPeriod; label: string }[] = [
    { value: "week", label: "Неделя" },
    { value: "month", label: "Месяц" },
    { value: "allTime", label: "За всё время" },
];

export function ActivityChart({ data, period, onPeriodChange }: ActivityChartProps) {
    const [activeSeries, setActiveSeries] = useState<string[]>(["calls", "chats", "selections"]);

    const toggleSeries = (key: string) => {
        setActiveSeries((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const totalActivity = data.reduce((sum, point) => {
        let dailySum = 0;
        if (activeSeries.includes("calls")) dailySum += point.calls;
        if (activeSeries.includes("chats")) dailySum += point.chats;
        if (activeSeries.includes("selections")) dailySum += point.selections;
        return sum + dailySum;
    }, 0);

    return (
        <Card className="w-full">
            <CardHeader className="px-4 pb-2 pt-4">
                <div className="flex flex-col gap-3">
                    <CardTitle className="text-center text-lg font-semibold text-slate-900 sm:text-xl">Активность</CardTitle>
                    <div className="flex justify-center">
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

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1">
                            <span className="text-4xl font-bold leading-none text-slate-900">{totalActivity.toLocaleString("ru-RU")}</span>
                            <span className="mb-1 self-end text-base text-slate-700">действий</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {legendItems.map((item) => {
                                const isActive = activeSeries.includes(item.key);
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => toggleSeries(item.key)}
                                        className={cn(
                                            "flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-opacity",
                                            isActive ? "opacity-100" : "opacity-40 grayscale"
                                        )}
                                    >
                                        <span className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                    <LineChart accessibilityLayer data={data} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
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
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        {activeSeries.includes("calls") && (
                            <Line
                                type="monotone"
                                dataKey="calls"
                                stroke="var(--color-calls)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: "var(--color-calls)" }}
                            />
                        )}
                        {activeSeries.includes("chats") && (
                            <Line
                                type="monotone"
                                dataKey="chats"
                                stroke="var(--color-chats)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: "var(--color-chats)" }}
                            />
                        )}
                        {activeSeries.includes("selections") && (
                            <Line
                                type="monotone"
                                dataKey="selections"
                                stroke="var(--color-selections)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: "var(--color-selections)" }}
                            />
                        )}
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

