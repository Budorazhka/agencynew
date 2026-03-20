"use client";
// [DOC-RU]
// Если ты меняешь этот файл, сначала держи прежний смысл метрик и полей, чтобы UI не разъехался.
// Смысл файла: доска воронок; тут ты показываешь стадии и конверсии, поэтому не ломай логику подсчетов.
// После правок ты проверяешь экран руками и сверяешь ключевые цифры/периоды.


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FunnelBoard, FunnelColumn } from "@/types/analytics";

interface FunnelKanbanProps {
    funnels: FunnelBoard[];
    /** Тема «сукно» для страницы лидов */
    variant?: "default" | "leads";
}

function getColumnTone({
    boardId,
    columnId,
    isFinalColumn,
}: {
    boardId: FunnelBoard["id"];
    columnId: string;
    isFinalColumn: boolean;
}) {
    if (columnId === "rejection") {
        return {
            pill: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
            bar: "bg-rose-500",
        };
    }

    if (columnId === "success" || (boardId !== "sales" && isFinalColumn)) {
        return {
            pill: "bg-amber-400/20 text-amber-700 dark:text-amber-300",
            bar: "bg-amber-500",
        };
    }

    if (columnId === "in_progress" || columnId === "preparation" || columnId === "active") {
        return {
            pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            bar: "bg-emerald-500",
        };
    }

    return {
        pill: "bg-muted text-muted-foreground",
        bar: "bg-primary",
    };
}

function getStageCumulativeCount(board: FunnelBoard, stageName: string): number {
    let count = 0;
    let found = false;

    // Iterate through columns to find stages
    // We assume a flow from left to right (rejection -> in_progress -> success/active)
    // Actually, usually "rejection" is a separate sink. "success" is a sink.
    // "in_progress" is the main flow.
    // For calculation "From X to Y", we usually want:
    // Count(X) + Count(After X) ... 
    // But in Kanban snapshot it's hard. 
    // Standard approach: Cumulative Flow.
    // We sum up all items in the stage X and all stages that are "after" X.

    // Order of columns for flow: in_progress -> (active?) -> success.
    // Rejection is excluded from flow typically, or handled separately.

    const flowColumnIds = ["in_progress", "active", "success"];

    for (const colId of flowColumnIds) {
        const column = board.columns.find(c => c.id === colId);
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

function calculateConversion(board: FunnelBoard, fromStage: string, toStage: string): number {
    const fromCount = getStageCumulativeCount(board, fromStage);
    const toCount = getStageCumulativeCount(board, toStage);

    if (fromCount === 0) return 0;

    return Math.round((toCount / fromCount) * 100);
}

function ConversionsDropdown({ board, variant }: { board: FunnelBoard; variant?: "default" | "leads" }) {
    if (board.id !== "sales") return null;
    const isLeads = variant === "leads";

    const conversions = [
        { label: "Новый лид → Презентация", from: "Новый лид", to: "Презентовали компанию" },
        { label: "Презентация → Показ", from: "Презентовали компанию", to: "Показ" },
        { label: "Показ → Сделка", from: "Показ", to: "Заключен договор" },
        { label: "Лид → Сделка", from: "Новый лид", to: "Заключен договор" },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "ml-auto gap-2",
                        isLeads && "border-[rgba(229,196,136,0.5)] bg-[rgba(68,43,18,0.6)] text-[#fcecc8] hover:bg-[rgba(88,57,25,0.7)]"
                    )}
                >
                    <Percent className="h-4 w-4" />
                    Конверсии
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className={cn("w-[280px]", isLeads && "border-[rgba(229,196,136,0.4)] bg-[rgba(38,28,16,0.98)] text-[#f7ecd4]")}
            >
                {conversions.map((item, idx) => {
                    const val = calculateConversion(board, item.from, item.to);
                    return (
                        <DropdownMenuItem
                            key={idx}
                            className={cn("flex justify-between gap-2", isLeads && "focus:bg-[rgba(68,43,18,0.7)] focus:text-[#fcecc8]")}
                        >
                            <span className={cn("truncate", isLeads ? "text-[#e8dcc4]" : "text-muted-foreground")}>{item.label}</span>
                            <span className={cn("font-medium", isLeads && "text-[#fcecc8]")}>{val}%</span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const leadsCardClass =
    "leads-card border border-[rgba(229,196,136,0.35)] bg-gradient-to-b from-[rgba(45,32,18,0.92)] to-[rgba(32,22,12,0.9)] text-[#f7ecd4] shadow-[0_4px_16px_rgba(0,0,0,0.25)]";

export function FunnelKanban({ funnels, variant = "default" }: FunnelKanbanProps) {
    const isLeads = variant === "leads";

    if (funnels.length === 0) {
        return (
            <Card className={cn(isLeads && leadsCardClass)}>
                <CardHeader>
                    <CardTitle className={cn(isLeads && "text-[#fcecc8]")}>Воронки</CardTitle>
                    <CardDescription className={cn(isLeads && "text-[#e8dcc4]")}>Нет данных для отображения.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className={cn(isLeads && leadsCardClass)}>
            <Tabs defaultValue={funnels[0].id}>
                <CardHeader className="gap-3">
                    <div className="space-y-1 text-center">
                        <CardTitle className={cn("text-base font-medium sm:text-lg", isLeads && "text-[#fcecc8]")}>
                            Воронки в канбане
                        </CardTitle>
                        <CardDescription className={cn(isLeads && "text-[#e8dcc4]")}>
                            Все этапы отражены полностью.
                        </CardDescription>
                    </div>
                    <TabsList
                        className={cn(
                            "h-auto w-full flex-wrap justify-center",
                            isLeads && "border-[rgba(229,196,136,0.4)] bg-[rgba(40,27,14,0.94)] p-1"
                        )}
                    >
                        {funnels.map((board) => (
                            <TabsTrigger
                                key={board.id}
                                value={board.id}
                                className={cn(
                                    "text-center text-sm font-medium whitespace-normal leading-tight sm:text-base sm:whitespace-nowrap",
                                    isLeads &&
                                        "text-[#e8dcc4] data-[state=active]:bg-[rgba(236,194,112,0.25)] data-[state=active]:text-[#fcecc8] data-[state=active]:border data-[state=active]:border-[rgba(229,196,136,0.5)]"
                                )}
                            >
                                {board.shortName}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </CardHeader>
                <CardContent className="space-y-3">
                    {funnels.map((board) => (
                        <TabsContent key={board.id} value={board.id} className="m-0 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className={cn(isLeads && "border-[rgba(229,196,136,0.3)] bg-[rgba(68,43,18,0.5)] text-[#e8dcc4]")}
                                >
                                    Всего: {board.totalCount.toLocaleString("ru-RU")}
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className={cn(isLeads && "border-[rgba(229,196,136,0.3)] bg-[rgba(68,43,18,0.5)] text-[#e8dcc4]")}
                                >
                                    В работе: {board.activeCount.toLocaleString("ru-RU")}
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className={cn(isLeads && "border-[rgba(229,196,136,0.3)] bg-[rgba(68,43,18,0.5)] text-[#e8dcc4]")}
                                >
                                    Отказ: {board.rejectionCount.toLocaleString("ru-RU")}
                                </Badge>
                                {board.closedCount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className={cn(isLeads && "border-[rgba(229,196,136,0.3)] bg-[rgba(68,43,18,0.5)] text-[#e8dcc4]")}
                                    >
                                        Закрыто: {board.closedCount.toLocaleString("ru-RU")}
                                    </Badge>
                                )}
                                <ConversionsDropdown board={board} variant={variant} />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {board.columns.map((column, columnIndex) => (
                                    <FunnelColumnCard
                                        key={`${board.id}-${column.id}`}
                                        boardId={board.id}
                                        column={column}
                                        isFinalColumn={columnIndex === board.columns.length - 1}
                                        variant={variant}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                </CardContent>
            </Tabs>
        </Card>
    );
}

function FunnelColumnCard({
    boardId,
    column,
    isFinalColumn,
    variant = "default",
}: {
    boardId: FunnelBoard["id"];
    column: FunnelColumn;
    isFinalColumn: boolean;
    variant?: "default" | "leads";
}) {
    const isLeads = variant === "leads";
    const tone = getColumnTone({ boardId, columnId: column.id, isFinalColumn });
    const maxStageCount = Math.max(...column.stages.map((stage) => stage.count), 1);

    return (
        <div
            className={cn(
                "rounded-xl border p-3",
                isLeads ? "border-[rgba(229,196,136,0.25)] bg-[rgba(36,26,14,0.6)]" : "bg-muted/20"
            )}
        >
            <div className="flex min-w-0 items-center justify-between gap-2">
                <p className={cn("min-w-0 break-words text-sm font-medium", isLeads && "text-[#e8dcc4]")}>{column.name}</p>
                <Badge className={cn("shadow-none", tone.pill, isLeads && "border-[rgba(229,196,136,0.3)] bg-[rgba(68,43,18,0.5)] text-[#e8dcc4]")}>
                    {column.count.toLocaleString("ru-RU")}
                </Badge>
            </div>
            <Separator className={cn("my-2", isLeads && "bg-[rgba(229,196,136,0.25)]")} />
            <div className="space-y-2">
                {column.stages.map((stage) => {
                    const width = Math.max(6, Math.round((stage.count / maxStageCount) * 100));
                    return (
                        <div
                            key={stage.id}
                            className={cn(
                                "rounded-lg border p-2",
                                isLeads ? "border-[rgba(229,196,136,0.2)] bg-[rgba(32,22,12,0.5)]" : "bg-background"
                            )}
                        >
                            <div className="flex min-w-0 items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className={cn("text-[11px]", isLeads ? "text-[#e8dcc4]/80" : "text-muted-foreground")}>
                                        Этап {stage.order}
                                    </p>
                                    <p className={cn("break-words text-sm leading-tight", isLeads && "text-[#f7ecd4]")}>{stage.name}</p>
                                </div>
                                <span className={cn("text-sm font-medium tabular-nums", isLeads && "text-[#fcecc8]")}>
                                    {stage.count.toLocaleString("ru-RU")}
                                </span>
                            </div>
                            <div className={cn("mt-2 h-1.5 rounded-full", isLeads ? "bg-[rgba(0,0,0,0.3)]" : "bg-muted")}>
                                <div
                                    className={cn("h-full rounded-full", tone.bar)}
                                    style={{ width: `${width}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}




