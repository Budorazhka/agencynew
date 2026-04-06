import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export type SectionStubPanel = {
  label: string
  hint?: string
  /** Если задан — карточка ведёт на вложенную заглушку панели. */
  to?: string
}

/**
 * Заглушка панели/отчёта ALPHABASE.sale — те же токены, что у {@link ModuleHub} (единый визуальный язык ТЗ §3).
 */
export function SectionStubPage({
  title,
  subtitle,
  panels,
  footerLink,
}: {
  title: string
  subtitle?: string
  panels?: readonly SectionStubPanel[]
  /** Доп. ссылка под карточкой (например «классические настройки» для п. 6.10 ТЗ). */
  footerLink?: { to: string; label: string }
}) {
  const body =
    subtitle ??
    'По ТЗ здесь появятся панели управления и отчёты этого блока. Данные подключит бэкенд; сейчас вёрстка под дизайн-систему хабов.'

  return (
    <div className="min-h-full w-full overflow-y-auto bg-[var(--app-bg)] font-sans">
      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10 sm:py-10">
        <div
          className={cn(
            'rounded-2xl border border-[color:var(--hub-card-border)] bg-[var(--hub-card-bg)] p-6 sm:p-8',
            'shadow-[inset_0_0_0_1px_var(--hub-card-border)]',
          )}
        >
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--hub-desc)]">
            ALPHABASE.sale · раздел в работе
          </p>
          <h1 className="text-[1.35rem] font-black uppercase leading-tight tracking-[0.04em] text-[color:var(--theme-accent-heading)] sm:text-[1.65rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-prose text-[13px] leading-relaxed text-[color:var(--hub-body)] sm:text-[14px]">{body}</p>

          {panels && panels.length > 0 ? (
            <div className="mt-8 border-t border-[color:var(--hub-card-border)] pt-6">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--hub-desc)]">
                Плановые панели
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {panels.map((p) => {
                  const cardClass = cn(
                    'rounded-md px-4 py-3 transition-[background,box-shadow] duration-150',
                    'bg-[var(--hub-card-bg)] shadow-[inset_0_0_0_1px_var(--hub-card-border)]',
                  )
                  const inner = (
                    <>
                      <p className="text-[14px] font-semibold text-[color:var(--app-text)]">{p.label}</p>
                      {p.hint ? (
                        <p className="mt-1 text-[12px] leading-snug text-[color:var(--hub-body)]">{p.hint}</p>
                      ) : null}
                      {p.to ? (
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--theme-accent-link-dim)]">
                          Открыть панель →
                        </p>
                      ) : null}
                    </>
                  )
                  const key = p.to ?? p.label
                  return (
                    <li key={key}>
                      {p.to ? (
                        <Link
                          to={p.to}
                          className={cn(
                            cardClass,
                            'block outline-none backdrop-blur-xl',
                            'hover:bg-[var(--hub-card-bg-hover)] hover:shadow-[inset_0_0_0_1px_var(--hub-card-border-hover)]',
                            'focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--gold)_35%,transparent)]',
                          )}
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className={cn(cardClass, 'backdrop-blur-xl')}>{inner}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
        </div>

        {footerLink ? (
          <p className="mt-6 text-center text-[13px] text-[color:var(--hub-body)]">
            <Link
              to={footerLink.to}
              className="font-semibold text-[color:var(--theme-accent-link-dim)] underline-offset-2 hover:text-[color:var(--theme-accent-link)] hover:underline"
            >
              {footerLink.label}
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  )
}
