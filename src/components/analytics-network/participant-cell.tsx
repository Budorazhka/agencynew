// [DOC-RU]
// Если ты меняешь этот файл, сначала держи прежний смысл метрик и полей, чтобы UI не разъехался.
// Смысл файла: ячейка участника с онлайн-статусом; если ты меняешь статусную логику, держи ее одинаковой с сервером.
// После правок ты проверяешь экран руками и сверяешь ключевые цифры/периоды.

import { cn } from "@/lib/utils";
import type { ActivityMarker, PartnerRow } from "@/types/analytics";

interface ParticipantCellProps {
    partner: PartnerRow;
}

export function ParticipantCell({ partner }: ParticipantCellProps) {
    const totalMinutesToday = partner.platformMinutesToday + partner.crmMinutesToday;
    const markerMeta = getMarkerMeta(partner.activityMarker);
    const onlineDotClassName = partner.isOnline ? "bg-emerald-500" : "bg-slate-400";

    return (
        <div className="flex items-center gap-3">
            <div>
                <img
                    src={partner.avatarUrl}
                    alt={partner.name}
                    className="h-10 w-10 rounded-full object-cover"
                    width={40}
                    height={40}
                />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center">
                    <p className="font-semibold text-sm text-slate-900 truncate">{partner.name}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                    {partner.isOnline ? (
                        <span className="font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                            Онлайн
                        </span>
                    ) : (
                        <span className="text-muted-foreground">был онлайн {formatLastSeen(partner.lastSeenMinutesAgo)}</span>
                    )}
                    <span className={cn("h-2 w-2 rounded-full", onlineDotClassName)} aria-hidden />
                </div>
                <p className="text-xs text-muted-foreground">
                    {partner.activityMarker === "red" ? (
                        <span className={markerMeta.textClassName}>Не был сегодня</span>
                    ) : (
                        <span className={markerMeta.textClassName}>
                            Сегодня {totalMinutesToday} мин
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}

function formatLastSeen(minutes: number | null): string {
    if (minutes === null) return "только что";
    if (minutes < 60) return `${minutes} мин назад`;

    const hours = Math.floor(minutes / 60);
    return `${hours} ч назад`;
}

function getMarkerMeta(marker: ActivityMarker): { textClassName: string } {
    if (marker === "green") {
        return {
            textClassName: "text-emerald-600 dark:text-emerald-400",
        };
    }

    if (marker === "yellow") {
        return {
            textClassName: "text-amber-600 dark:text-amber-400",
        };
    }

    return {
        textClassName: "text-rose-600 dark:text-rose-400",
    };
}

