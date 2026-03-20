"use client";
// [DOC-RU]
// Если ты меняешь этот файл, сначала держи стабильную геометрию календаря: для недели и месяца сетка одинаковая.
// Смысл файла: календарь активности для главной аналитики с drilldown по составу (звонки/чаты/рассылки).
// После правок ты проверяешь экран руками и сверяешь выделение недели и цифры в модалке.

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ActivityTimeseriesPoint, AnalyticsPeriod } from "@/types/analytics";

type CalendarEntry = {
    key: string;
    labelShort: string;
    labelLong: string;
    dateNumber?: number;
    total: number;
    calls: number;
    chats: number;
    selections: number;
    inSelectedRange?: boolean;
    isFuture?: boolean;
    isPast?: boolean;
};

interface ActivityCalendarCardProps {
    period: AnalyticsPeriod;
    range: { start: Date; end: Date };
    monthRange: { start: Date; end: Date };
    monthData: ActivityTimeseriesPoint[];
    allTimeData: ActivityTimeseriesPoint[];
    className?: string;
    highContrast?: boolean;
}

function getDayIndexFromMonday(date: Date) {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
}

function getTrafficTone(total: number, isPast: boolean) {
    if (total === 0) {
        if (isPast) {
            return {
                label: "Нет активностей (прошедший день)",
                className:
                    "bg-slate-200 border-slate-300 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100",
            };
        }
        return {
            label: "Нет действий",
            className:
                "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
        };
    }

    if (total < 5) {
        if (isPast) {
            return {
                label: "Низкая активность (прошедший день)",
                className:
                    "bg-amber-200 border-amber-300 text-slate-900 hover:bg-amber-300 dark:bg-amber-700 dark:border-amber-600 dark:text-slate-100",
            };
        }
        return {
            label: "Низкая активность",
            className:
                "bg-amber-200 border-amber-300 text-slate-900 hover:bg-amber-300 dark:bg-amber-700 dark:border-amber-600 dark:text-slate-100",
        };
    }

    if (isPast) {
        return {
            label: "Активный день (прошедший день)",
            className:
                "bg-emerald-200 border-emerald-300 text-slate-900 hover:bg-emerald-300 dark:bg-emerald-700 dark:border-emerald-600 dark:text-slate-100",
        };
    }

    return {
        label: "Активный день",
        className:
            "bg-emerald-200 border-emerald-300 text-slate-900 hover:bg-emerald-300 dark:bg-emerald-700 dark:border-emerald-600 dark:text-slate-100",
    };
}

function normalizeDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildMonthEntries(
    range: { start: Date; end: Date },
    monthData: ActivityTimeseriesPoint[],
    selectedRange: { start: Date; end: Date } | null
) {
    const monthStart = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
    const monthEnd = new Date(range.start.getFullYear(), range.start.getMonth() + 1, 0);
    const selectedStart = selectedRange ? normalizeDate(selectedRange.start) : null;
    const selectedEnd = selectedRange ? normalizeDate(selectedRange.end) : null;

    const today = normalizeDate(new Date());
    const entries: CalendarEntry[] = [];
    let dayIndex = 0;
    const cursor = new Date(monthStart);
    while (cursor <= monthEnd) {
        const cursorDate = normalizeDate(cursor);
        const isFuture = cursorDate.getTime() > today.getTime();
        const isPast = cursorDate.getTime() < today.getTime();
        const point = monthData[dayIndex];
        const calls = isFuture ? 0 : point?.calls ?? 0;
        const chats = isFuture ? 0 : point?.chats ?? 0;
        const selections = isFuture ? 0 : point?.selections ?? 0;
        const total = calls + chats + selections;

        entries.push({
            key: cursor.toISOString().slice(0, 10),
            labelShort: cursor.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
            labelLong: cursor.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" }),
            dateNumber: cursor.getDate(),
            total,
            calls,
            chats,
            selections,
            isFuture,
            isPast,
            inSelectedRange: Boolean(
                selectedStart &&
                    selectedEnd &&
                    cursorDate.getTime() >= selectedStart.getTime() &&
                    cursorDate.getTime() <= selectedEnd.getTime()
            ),
        });

        cursor.setDate(cursor.getDate() + 1);
        dayIndex += 1;
    }

    return entries;
}

function buildAllTimeEntries(allTimeData: ActivityTimeseriesPoint[]): CalendarEntry[] {
    return allTimeData.slice(-12).map((point, index) => ({
        key: `month-${index}`,
        labelShort: point.date,
        labelLong: point.date,
        total: point.calls + point.chats + point.selections,
        calls: point.calls,
        chats: point.chats,
        selections: point.selections,
    }));
}

export function ActivityCalendarCard({
    period,
    range,
    monthRange,
    monthData,
    allTimeData,
    className,
    highContrast = false,
}: ActivityCalendarCardProps) {
    const [selectedEntryKey, setSelectedEntryKey] = useState<string | null>(null);
    const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);

    const monthEntries = useMemo(
        () => buildMonthEntries(monthRange, monthData, period === "week" ? range : null),
        [monthRange, monthData, period, range]
    );
    const allTimeEntries = useMemo(() => buildAllTimeEntries(allTimeData), [allTimeData]);
    const entries = period === "allTime" ? allTimeEntries : monthEntries;

    const monthStart = useMemo(
        () => new Date(monthRange.start.getFullYear(), monthRange.start.getMonth(), 1),
        [monthRange]
    );
    const dayOffset = useMemo(() => getDayIndexFromMonday(monthStart), [monthStart]);

    useEffect(() => {
        setSelectedEntryKey(entries[0]?.key ?? null);
    }, [entries]);

    const selectedEntry = entries.find((entry) => entry.key === selectedEntryKey) ?? entries[0] ?? null;
    const weekDayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

    const caption = useMemo(() => {
        if (period === "allTime") return "Последние 12 месяцев";
        const monthLabel = monthStart.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
        if (period === "week") {
            const start = range.start.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
            const end = range.end.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
            return `${monthLabel} · неделя ${start} - ${end}`;
        }
        return monthLabel;
    }, [period, monthStart, range]);

    const openDrilldown = (entryKey: string) => {
        const entry = monthEntries.find((item) => item.key === entryKey) ?? allTimeEntries.find((item) => item.key === entryKey);
        if (entry?.isFuture) return;
        setSelectedEntryKey(entryKey);
        setIsDrilldownOpen(true);
    };
    const weekStartKey = period === "week" ? normalizeDate(range.start).toISOString().slice(0, 10) : null;
    const weekEndKey = period === "week" ? normalizeDate(range.end).toISOString().slice(0, 10) : null;

    return (
        <Card className={cn(className)}>
            <CardHeader className="pb-2">
                <div className="flex flex-col items-center gap-1 text-center">
                    <CardTitle className={cn("text-center text-xl font-semibold text-slate-900 sm:text-2xl", highContrast && "text-2xl sm:text-3xl")}>
                        Календарь активности
                    </CardTitle>
                    <span className={cn("text-base font-medium text-slate-700 sm:text-lg", highContrast && "text-lg text-slate-900")}>
                        {caption}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 px-2 pt-1 sm:px-6">
                {period !== "allTime" ? (
                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                        {weekDayLabels.map((dayLabel) => (
                            <div key={dayLabel} className={cn("pb-2 text-center text-base font-bold text-slate-800", highContrast && "text-lg text-slate-900")}>
                                {dayLabel}
                            </div>
                        ))}

                        {Array.from({ length: dayOffset }).map((_, index) => (
                            <div key={`empty-${index}`} className="min-h-[88px] rounded-xl border border-dashed border-slate-200" />
                        ))}

                        {monthEntries.map((entry) => {
                            const tone = getTrafficTone(entry.total, entry.isPast || false);
                            const isActive = selectedEntry?.key === entry.key;
                            const isWeekStart = weekStartKey === entry.key;
                            const isWeekEnd = weekEndKey === entry.key;

                            return (
                                <button
                                    key={entry.key}
                                    type="button"
                                    onClick={() => openDrilldown(entry.key)}
                                    className={cn(
                                        "min-h-[88px] rounded-xl border border-slate-200 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        entry.isFuture
                                            ? "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                                            : tone.className,
                                        entry.inSelectedRange &&
                                            "border-primary ring-2 ring-primary/45 shadow-[0_0_0_1px_rgba(59,130,246,0.28)_inset]",
                                        isWeekStart && "ring-primary",
                                        isWeekEnd && "ring-primary",
                                        isActive && "ring-2 ring-primary",
                                        entry.isFuture && "cursor-not-allowed"
                                    )}
                                    title={
                                        entry.isFuture
                                            ? `${entry.labelLong}: будущая дата (факт еще не наступил)`
                                            : `${entry.labelLong}: ${entry.total.toLocaleString("ru-RU")} активностей`
                                    }
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-2xl font-bold leading-none opacity-100 text-slate-900">
                                            {entry.dateNumber}
                                        </span>
                                        <span className="text-lg font-bold opacity-100 text-slate-900">
                                            {entry.total}
                                        </span>
                                    </div>
                                    <p className="text-base font-medium leading-snug opacity-100 text-slate-800 truncate">
                                        {entry.isFuture ? "Будущий день" : tone.label}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                        {allTimeEntries.map((entry) => {
                            const tone = getTrafficTone(entry.total, false);
                            const isActive = selectedEntry?.key === entry.key;
                            return (
                                <button
                                    key={entry.key}
                                    type="button"
                                    onClick={() => openDrilldown(entry.key)}
                                    className={cn(
                                        "h-14 rounded-md border p-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        tone.className,
                                        isActive && "ring-2 ring-primary"
                                    )}
                                >
                                    <p className={cn("truncate text-xs font-medium", highContrast && "text-sm text-foreground/90")}>{entry.labelShort}</p>
                                    <p className={cn("mt-1 text-xs font-medium", highContrast && "text-sm font-semibold")}>{entry.total.toLocaleString("ru-RU")}</p>
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 text-base text-slate-800", highContrast && "text-lg text-slate-900")}>
                    {period === "week" && (
                        <span className="inline-flex items-center gap-2">
                            <span className="h-3 w-3 rounded-sm border border-primary/70 bg-primary/20" />
                            Выделенная неделя
                        </span>
                    )}
                    <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-slate-300 border border-slate-200" />
                        0 активностей
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-amber-400" />
                        1-4 активности
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-emerald-400" />
                        5+ активностей
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-slate-400" />
                        Прошедшие дни
                    </span>
                </div>

                {selectedEntry && (
                    <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
                        <p className={cn("text-lg font-bold text-slate-900", highContrast && "text-xl")}>{selectedEntry.labelLong}</p>
                        <div className={cn("mt-2 flex flex-wrap items-center gap-4 text-base text-slate-800", highContrast && "text-lg text-slate-900")}>
                            <span className="font-semibold">Всего: {selectedEntry.total.toLocaleString("ru-RU")}</span>
                            <span className="font-semibold">Звонки: {selectedEntry.calls.toLocaleString("ru-RU")}</span>
                            <span className="font-semibold">Чаты: {selectedEntry.chats.toLocaleString("ru-RU")}</span>
                            <span className="font-semibold">Рассылки: {selectedEntry.selections.toLocaleString("ru-RU")}</span>
                        </div>
                    </div>
                )}
            </CardContent>

            <Dialog open={isDrilldownOpen} onOpenChange={setIsDrilldownOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            {selectedEntry
                                ? `Состав активностей: ${selectedEntry.labelLong}`
                                : "Состав активностей"}
                        </DialogTitle>
                        <DialogDescription className="text-lg text-slate-800">
                            {selectedEntry
                                ? `Всего активностей: ${selectedEntry.total.toLocaleString("ru-RU")}`
                                : "Выбери день или месяц в календаре."}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEntry ? (
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
                                <p className="text-base font-bold text-slate-900">Звонки</p>
                                <p className="text-2xl font-bold text-slate-900">{selectedEntry.calls.toLocaleString("ru-RU")}</p>
                                <p className="text-base font-semibold text-slate-800">
                                    {selectedEntry.total > 0
                                        ? `${Math.round((selectedEntry.calls / selectedEntry.total) * 100)}% от активностей`
                                        : "—"}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
                                <p className="text-base font-bold text-slate-900">Рассылки</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {selectedEntry.selections.toLocaleString("ru-RU")}
                                </p>
                                <p className="text-base font-semibold text-slate-800">
                                    {selectedEntry.total > 0
                                        ? `${Math.round((selectedEntry.selections / selectedEntry.total) * 100)}% от активностей`
                                        : "—"}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
                                <p className="text-base font-bold text-slate-900">Чаты</p>
                                <p className="text-2xl font-bold text-slate-900">{selectedEntry.chats.toLocaleString("ru-RU")}</p>
                                <p className="text-base font-semibold text-slate-800">
                                    {selectedEntry.total > 0
                                        ? `${Math.round((selectedEntry.chats / selectedEntry.total) * 100)}% от активностей`
                                        : "—"}
                                </p>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
