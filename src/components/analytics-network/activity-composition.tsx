"use client";
// [DOC-RU]
// Если ты меняешь этот файл, сначала держи прежний смысл метрик и полей, чтобы UI не разъехался.
// Смысл файла: круговая/составная аналитика активности; ты показываешь доли звонков, чатов и рассылок.
// После правок ты проверяешь экран руками и сверяешь ключевые цифры/периоды.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LayoutList, MessageCircle, Phone } from "lucide-react";
import { Pie, PieChart, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { getDailyQuote } from "@/lib/mock/daily-quotes";
import type { DynamicKpi } from "@/types/analytics";

interface ActivityCompositionProps {
    data: DynamicKpi;
    className?: string;
}

type ChannelKey = "calls" | "chats" | "selections";

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

const channelMeta: Record<
    ChannelKey,
    {
        label: string;
        Icon: typeof Phone;
        iconColor: string;
        iconBg: string;
    }
> = {
    calls: {
        label: "Звонки",
        Icon: Phone,
        iconColor: "text-orange-600",
        iconBg: "bg-orange-500/10",
    },
    chats: {
        label: "Чаты",
        Icon: MessageCircle,
        iconColor: "text-sky-600",
        iconBg: "bg-sky-500/10",
    },
    selections: {
        label: "Рассылки",
        Icon: LayoutList,
        iconColor: "text-violet-600",
        iconBg: "bg-violet-500/10",
    },
};

export function ActivityComposition({ data, className }: ActivityCompositionProps) {
    const items = [
        { key: "calls" as const, label: "Звонки", value: data.callClicks, color: "var(--color-calls)" },
        { key: "chats" as const, label: "Чаты", value: data.chatOpens, color: "var(--color-chats)" },
        { key: "selections" as const, label: "Рассылки", value: data.selectionsCreated, color: "var(--color-selections)" },
    ];

    const total = items.reduce((sum, item) => sum + item.value, 0);
    const sortedByValue = [...items].sort((a, b) => b.value - a.value);
    const leader = sortedByValue[0];
    const leaderShare = total > 0 ? Math.round((leader.value / total) * 100) : 0;
    const touchesPerLead = data.addedLeads > 0 ? total / data.addedLeads : 0;
    const touchesPerLeadLabel = new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(touchesPerLead);
    const touchesPerDeal = data.deals > 0 ? total / data.deals : null;
    const touchesPerDealLabel = touchesPerDeal
        ? new Intl.NumberFormat("ru-RU", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
          }).format(touchesPerDeal)
        : null;
    const touchToDeal = total > 0 ? Math.round((data.deals / total) * 100) : 0;
    const touchToDealTone =
        touchToDeal >= 12
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
            : touchToDeal >= 6
              ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
              : "border-rose-500/30 bg-rose-500/10 text-rose-700";
    const touchToDealGrade = touchToDeal >= 12 ? "Сильный" : touchToDeal >= 6 ? "Средний" : "Низкий";

    const hints = {
        calls: "Количество звонков за выбранный период.",
        chats: "Количество чатов за выбранный период.",
        selections: "Количество рассылок за выбранный период.",
        total: "Сумма всех активностей: звонки + чаты + рассылки.",
        leader: "Наибольшее количество активностей.",
        touchesPerLead:
            "Среднее число активностей на 1 лид. Формула: (звонки + чаты + рассылки) / новые лиды.",
        touchToDeal:
            "Коэффициент полезной активности. Показывает, какая доля активностей приводит к сделке. Формула: сделки / все активности x 100%.",
    };

    return (
        <Card className={cn(className)}>
            <CardHeader className="px-3 pb-2 pt-4 sm:px-4">
                <CardTitle className="text-center text-base font-semibold text-slate-900 sm:text-lg">Состав активности</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4 pt-2 sm:px-4">
                <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-center lg:gap-8">
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[280px] shrink-0 pr-2 sm:max-w-[300px] sm:pr-3">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Pie
                                data={items}
                                dataKey="value"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                innerRadius="30%"
                                outerRadius="60%"
                                strokeWidth={0}
                            >
                                {items.map((item) => (
                                    <Cell key={item.key} fill={item.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                    <div className="flex min-w-0 flex-row items-center justify-center gap-2.5 lg:flex-col lg:items-end">
                        {items.map((item) => {
                            const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
                            const channel = channelMeta[item.key];
                            return (
                                <div key={item.key} className="w-[5.25rem] rounded-md border bg-muted/20 py-2 sm:w-24">
                                    <div className="flex flex-col items-center gap-1.5 text-sm font-semibold text-slate-900 tabular-nums sm:text-base">
                                            <ChannelIconHint
                                                icon={channel.Icon}
                                                iconColor={channel.iconColor}
                                                iconBg={channel.iconBg}
                                                label={channel.label}
                                                hint={item.key === "calls" ? hints.calls : item.key === "chats" ? hints.chats : hints.selections}
                                            />
                                            <span>{percent}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-md border bg-muted/20 px-2.5 py-2 sm:px-3 sm:py-2.5">
                        <p className="text-xs font-medium text-slate-700 sm:text-sm">
                            <MetricHintLabel label="Всего активностей" hint={hints.total} />
                        </p>
                        <p className="text-lg font-semibold text-slate-900 tabular-nums sm:text-xl">{total.toLocaleString("ru-RU")}</p>
                    </div>
                    <div className="rounded-md border bg-muted/20 px-2.5 py-2 sm:px-3 sm:py-2.5">
                        <p className="text-xs font-medium text-slate-700 sm:text-sm">
                            <MetricHintLabel label="Ведущий канал" hint={hints.leader} />
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
                            <ChannelIconHint
                                icon={channelMeta[leader.key].Icon}
                                iconColor={channelMeta[leader.key].iconColor}
                                iconBg={channelMeta[leader.key].iconBg}
                                label={leader.label}
                                hint={hints.leader}
                            />
                            <span>{leaderShare}%</span>
                        </div>
                    </div>
                    <div className="rounded-md border bg-muted/20 px-2.5 py-2 sm:px-3 sm:py-2.5">
                        <p className="text-xs font-medium text-slate-700 sm:text-sm">
                            <MetricHintLabel label="Активностей на 1 лид" hint={hints.touchesPerLead} />
                        </p>
                        <p className="text-lg font-semibold text-slate-900 tabular-nums sm:text-xl">{touchesPerLeadLabel}</p>
                    </div>
                    <div className="rounded-md border bg-muted/20 px-2.5 py-2 sm:col-span-2 sm:px-3 sm:py-2.5">
                        <p className="text-sm font-medium text-slate-700">
                            <MetricHintLabel label="КПА: Активность -> Сделка" hint={hints.touchToDeal} />
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2.5">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-blue-500 transition-all"
                                    style={{ width: `${Math.min(100, Math.max(0, touchToDeal))}%` }}
                                />
                            </div>
                            <span className="text-base font-semibold text-slate-900 tabular-nums">{touchToDeal}%</span>
                            <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", touchToDealTone)}>
                                {touchToDealGrade}
                            </span>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-700">
                            {touchesPerDealLabel
                                ? `В среднем 1 сделка на ${touchesPerDealLabel} активностей.`
                                : "Пока нет сделок за период, поэтому коэффициент не набран."}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ActivityQuoteCard({
    className,
    quoteUserKey,
}: {
    className?: string;
    quoteUserKey?: string;
}) {
    const quote = getDailyQuote(quoteUserKey);
    const quoteLength = quote.text.length;
    const quoteTextClass =
        quoteLength > 180
            ? "text-[clamp(0.95rem,1.5vw,1.1rem)] leading-relaxed"
            : quoteLength > 120
              ? "text-[clamp(1rem,1.7vw,1.25rem)] leading-relaxed"
              : "text-[clamp(1.05rem,2vw,1.45rem)] leading-relaxed";

    return (
        <Card className={cn("h-full min-h-[240px]", className)}>
            <CardContent className="h-full px-4 py-4">
                <div className="flex h-full flex-col justify-start gap-4">
                    <p className="pt-1 text-center text-[clamp(0.95rem,1.4vw,1.1rem)] text-muted-foreground">Твоя цитата дня</p>
                    <p className={cn("whitespace-pre-line break-words text-pretty", quoteTextClass)}>«{quote.text}»</p>
                    <div className="flex items-center gap-2 text-[clamp(0.8rem,1.2vw,0.9rem)] text-muted-foreground">
                        <span>Автор: {quote.author}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ChannelIconHint({
    icon: Icon,
    iconColor,
    iconBg,
    label,
    hint,
}: {
    icon: typeof Phone;
    iconColor: string;
    iconBg: string;
    label: string;
    hint: string;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "inline-flex h-5 w-5 translate-y-[1px] items-center justify-center rounded-md border border-transparent focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        iconBg,
                        iconColor
                    )}
                    aria-label={label}
                >
                    <Icon className="size-3" />
                    <span className="sr-only">{label}</span>
                </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} className="max-w-[260px] text-center leading-relaxed">
                {hint}
            </TooltipContent>
        </Tooltip>
    );
}

function MetricHintLabel({ label, hint, className }: { label: string; hint: string; className?: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span
                    className={cn(
                        "cursor-help decoration-dotted underline underline-offset-2 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        className
                    )}
                    tabIndex={0}
                >
                    {label}
                </span>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} className="max-w-[260px] text-center leading-relaxed">
                {hint}
            </TooltipContent>
        </Tooltip>
    );
}
