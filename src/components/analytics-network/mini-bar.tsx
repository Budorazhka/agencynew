// [DOC-RU]
// Если ты меняешь этот файл, сначала держи прежний смысл метрик и полей, чтобы UI не разъехался.
// Смысл файла: маленький прогресс-бар для визуального сравнения значений; ты подаешь value и maxValue.
// После правок ты проверяешь экран руками и сверяешь ключевые цифры/периоды.

import { cn } from "@/lib/utils";

interface MiniBarProps {
    value: number;
    maxValue: number;
    color?: string;
    className?: string;
    showValue?: boolean;
}

export function MiniBar({
    value,
    maxValue,
    color = "bg-emerald-500",
    className,
    showValue = true
}: MiniBarProps) {
    const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {showValue && (
                <span className="min-w-0 text-sm font-semibold text-slate-900 text-right tabular-nums sm:min-w-[2rem]">
                    {value.toLocaleString("ru-RU")}
                </span>
            )}
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted sm:min-w-[60px]">
                <div
                    className={cn("h-full rounded-full transition-all duration-300", color)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
