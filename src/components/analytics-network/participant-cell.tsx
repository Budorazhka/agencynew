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
    const onlineDotClassName = partner.isOnline ? "bg-emerald-400" : "bg-white/35";

    return (
        <div className="flex items-center gap-3">
            <div>
                <img
                    src={partner.avatarUrl}
                    alt={partner.name}
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-white/15"
                    width={40}
                    height={40}
                />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center">
                    <p className="truncate text-[0.9375rem] font-semibold leading-snug text-[color:var(--app-text)]">
                        {partner.name}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-[0.8125rem] leading-snug">
                    {partner.isOnline ? (
                        <span className="font-semibold uppercase tracking-wide text-emerald-700">
                            Онлайн
                        </span>
                    ) : (
                        <span className="text-[color:var(--app-text-muted)]">
                            был онлайн {formatLastSeen(partner.lastSeenMinutesAgo)}
                        </span>
                    )}
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", onlineDotClassName)} aria-hidden />
                </div>
                <p className="mt-0.5 text-[0.8125rem] leading-snug text-[color:var(--app-text-muted)]">
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
            textClassName: "font-medium text-emerald-700",
        };
    }

    if (marker === "yellow") {
        return {
            textClassName: "font-medium text-amber-800",
        };
    }

    return {
        textClassName: "font-medium text-rose-700",
    };
}

