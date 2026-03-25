/**
 * Единое отображение денежных сумм в USD (интерфейс).
 * Числа в моках трактуются как суммы в долларах.
 */

export const FMT_USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/** Крупные суммы: $12.8M */
export function formatUsdMillions(value: number, fractionDigits = 1): string {
  return `$${(value / 1_000_000).toFixed(fractionDigits)}M`
}

/** Тысячи: $256K */
export function formatUsdThousands(value: number): string {
  return `$${Math.round(value / 1_000)}K`
}

/** Компактно по величине */
export function formatUsdCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    const fd = abs % 1_000_000 < 1 ? 0 : 1
    return formatUsdMillions(value, fd)
  }
  if (abs >= 1_000) return formatUsdThousands(value)
  return FMT_USD.format(value)
}
