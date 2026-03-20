"use client";
// [DOC-RU]
// Если ты меняешь этот файл, оставляй график и расшифровку читаемыми:
// пользователь должен сразу понимать, от какого этапа к какому считается процент.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import type { FunnelBoard } from "@/types/analytics";
import type { SVGProps } from "react";

interface ConversionOverviewChartProps {
    funnel: FunnelBoard;
    className?: string;
    /** При переданном колбэке в шапке карточки показывается кнопка «Сеть» (просмотр сети партнёра) */
    onViewNetwork?: () => void;
    /** Тема «сукно» для страницы лидов: тёмный фон, кремовый текст, золотистые акценты */
    variant?: "default" | "leads";
}

const chartConfig = {
    value: {
        label: "Конверсия",
        color: "hsl(214, 84%, 56%)",
    },
} satisfies ChartConfig;

type ConversionAxisTickProps = SVGProps<SVGTextElement> & {
    payload?: { value?: string };
};

type ConversionItem = {
    key: string;
    label: string;
    value: number;
    color: string;
    description: string;
};

type ConversionAxisTickPropsWithVariant = ConversionAxisTickProps & { variant?: "default" | "leads" };

function ConversionAxisTick({ x = 0, y = 0, payload, variant }: ConversionAxisTickPropsWithVariant) {
    const isLeads = variant === "leads";
    return (
        <text
            x={Number(x) - 4}
            y={Number(y) + 5}
            textAnchor="end"
            className={isLeads ? "text-[14px] font-medium" : ""}
            fill={isLeads ? "#e8dcc4" : undefined}
            style={isLeads ? { fill: "#e8dcc4" } : undefined}
        >
            {payload?.value ?? ""}
        </text>
    );
}

function getStageCumulativeCount(board: FunnelBoard, stageName: string): number {
    let count = 0;
    let found = false;
    const flowColumnIds = ["in_progress", "active", "success"];

    for (const colId of flowColumnIds) {
        const column = board.columns.find((item) => item.id === colId);
        if (!column) continue;

        for (const stage of column.stages) {
            if (stage.name === stageName) found = true;
            if (found) count += stage.count;
        }
    }

    return count;
}

function calculateConversion(board: FunnelBoard, fromStage: string, toStage: string): number {
    const fromCount = getStageCumulativeCount(board, fromStage);
    const toCount = getStageCumulativeCount(board, toStage);
    if (fromCount === 0) return 0;
    return Math.round((toCount / fromCount) * 100);
}

const LEADS_BAR_COLORS = {
    leadToPresentation: "hsl(45, 68%, 55%)",
    presentationToShowing: "hsl(180, 45%, 55%)",
    showingToDeal: "hsl(152, 45%, 52%)",
    leadToDeal: "hsl(35, 75%, 55%)",
} as const;

export function ConversionOverviewChart({ funnel, className, onViewNetwork, variant = "default" }: ConversionOverviewChartProps) {
    const isLeads = variant === "leads";
    const data: ConversionItem[] = [
        {
            key: "leadToPresentation",
            label: "Лид → През.",
            value: calculateConversion(funnel, "Новый лид", "Презентовали компанию"),
            color: isLeads ? LEADS_BAR_COLORS.leadToPresentation : "hsl(214, 84%, 56%)",
            description: "Из новых лидов дошли до презентации",
        },
        {
            key: "presentationToShowing",
            label: "Презент. → Показ",
            value: calculateConversion(funnel, "Презентовали компанию", "Показ"),
            color: isLeads ? LEADS_BAR_COLORS.presentationToShowing : "hsl(195, 92%, 45%)",
            description: "Из презентаций дошли до показа",
        },
        {
            key: "showingToDeal",
            label: "Показ → Сделка",
            value: calculateConversion(funnel, "Показ", "Заключен договор"),
            color: isLeads ? LEADS_BAR_COLORS.showingToDeal : "hsl(152, 72%, 37%)",
            description: "Из показов закрылись в сделку",
        },
        {
            key: "leadToDeal",
            label: "Лид → Сделка",
            value: calculateConversion(funnel, "Новый лид", "Заключен договор"),
            color: isLeads ? LEADS_BAR_COLORS.leadToDeal : "hsl(35, 92%, 50%)",
            description: "Сквозная конверсия от лида до сделки",
        },
    ];

    const tickFill = isLeads ? "#e8dcc4" : "#475569";
    const labelListClass = isLeads ? "text-[16px] font-semibold" : "fill-slate-900 text-[16px] font-semibold";

    return (
        <Card className={cn(className, isLeads && "leads-card border border-[rgba(229,196,136,0.35)] bg-gradient-to-b from-[rgba(45,32,18,0.92)] to-[rgba(32,22,12,0.9)] text-[#f7ecd4] shadow-[0_4px_16px_rgba(0,0,0,0.25)]")}>
            <CardHeader className="px-3 pb-2 sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <CardTitle className={cn(
                            "text-center text-xl font-semibold sm:text-left sm:text-3xl",
                            isLeads ? "text-[#fcecc8]" : "text-slate-900"
                        )}>
                            Конверсии
                        </CardTitle>
                        <p className={cn(
                            "mt-1 text-center text-sm font-medium sm:text-left sm:text-base",
                            isLeads ? "text-[#e8dcc4]" : "text-slate-700"
                        )}>
                            Процент лидов, перешедших на следующий шаг воронки.
                        </p>
                    </div>
                    {onViewNetwork && (
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "shrink-0",
                                isLeads
                                    ? "border-[rgba(229,196,136,0.5)] bg-[rgba(68,43,18,0.6)] text-[#fcecc8] hover:bg-[rgba(88,57,25,0.7)]"
                                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/20"
                            )}
                            onClick={onViewNetwork}
                        >
                            Сеть
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 px-2 pt-1 sm:px-6">
                <div className="overflow-hidden">
                    <ChartContainer config={chartConfig} className="h-[360px] w-full">
                        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 20, bottom: 8 }}>
                            <CartesianGrid
                                horizontal={true}
                                vertical={false}
                                strokeDasharray="3 3"
                                stroke={isLeads ? "rgba(229, 196, 136, 0.2)" : undefined}
                            />
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                                tick={{ fill: tickFill, fontSize: 13, fontWeight: 500 }}
                            />
                            <YAxis
                                type="category"
                                dataKey="label"
                                width={200}
                                tickLine={false}
                                axisLine={false}
                                tick={<ConversionAxisTick variant={variant} />}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, _name, item) => {
                                            const row = item?.payload as ConversionItem | undefined;
                                            return (
                                                <div className="w-full space-y-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className={isLeads ? "text-[#e8dcc4]" : "text-muted-foreground"}>{row?.label ?? "Конверсия"}</span>
                                                        <span className={cn("font-medium tabular-nums", isLeads && "text-[#fcecc8]")}>{Number(value)}%</span>
                                                    </div>
                                                    {row?.description && (
                                                        <p className={cn("text-[11px]", isLeads ? "text-[#e8dcc4]" : "text-muted-foreground")}>{row.description}</p>
                                                    )}
                                                </div>
                                            );
                                        }}
                                    />
                                }
                            />
                            <Bar dataKey="value" radius={6}>
                                <LabelList
                                    dataKey="value"
                                    position="right"
                                    formatter={(value) => `${value ?? 0}%`}
                                    className={labelListClass}
                                    fill={isLeads ? "#fcecc8" : undefined}
                                    style={isLeads ? { fill: "#fcecc8" } : undefined}
                                />
                                {data.map((item) => (
                                    <Cell key={item.key} fill={item.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
                    {data.map((item) => (
                        <div
                            key={item.key}
                            className={cn(
                                "rounded-lg border px-3 py-2.5 sm:px-3.5 sm:py-3",
                                isLeads
                                    ? "border-[rgba(229,196,136,0.25)] bg-[rgba(36,26,14,0.6)]"
                                    : "bg-muted/20"
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1 flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3" style={{ backgroundColor: item.color }} />
                                    <span className={cn("text-base font-medium break-words", isLeads ? "text-[#e8dcc4]" : "text-slate-700")}>{item.label}</span>
                                </div>
                                <span className={cn("shrink-0 text-xl font-bold leading-none tabular-nums", isLeads ? "text-[#fcecc8]" : "text-slate-900")}>{item.value}%</span>
                            </div>
                            <p className={cn("mt-1 text-sm leading-snug", isLeads ? "text-[#e8dcc4]" : "text-slate-700")}>{item.description}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
