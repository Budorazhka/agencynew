import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'

type AccessDeniedState = { from?: string }

/**
 * Показ при переходе на URL, закрытом для роли (rail или настройки по матрице ALPHABASE).
 */
export function DashboardAccessDeniedPage() {
  const { state } = useLocation()
  const from = (state as AccessDeniedState | null)?.from

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-7">
      <div className="rounded-xl border border-[color:var(--green-border)]/35 bg-[color:var(--green-card)] px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_40px_rgba(0,0,0,0.1)] sm:px-8 sm:py-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--app-text-muted)]">
          baza.sale · доступ
        </p>
        <h1 className="text-[1.4rem] font-bold leading-tight tracking-tight text-[color:var(--app-text)] sm:text-[1.65rem]">
          Нет доступа к разделу
        </h1>
        <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-[color:var(--app-text-muted)]">
          Этот адрес не входит в доступные для вашей роли разделы или относится к настройкам агентства, к которым у вас нет
          прав. Обратитесь к руководителю, если считаете, что доступ нужен.
        </p>
        {from && from !== '/dashboard/access-denied' ? (
          <p className="mt-3 break-all font-mono text-[13px] text-[color:var(--app-text-muted)]">
            Запрос: <span className="text-[color:var(--app-text)]">{from}</span>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/dashboard">На рабочий стол</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
