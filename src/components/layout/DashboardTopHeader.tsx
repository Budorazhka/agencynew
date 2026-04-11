import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { WorkspaceAddButton } from '@/components/dashboard/WorkspaceAddButton'
import { DashboardBackButton } from '@/components/layout/DashboardBackButton'
import { isDashboardPathAllowedForRole, roleCanAccessSettingsHub } from '@/config/dashboard-rail'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DASHBOARD_NOTIFICATIONS_PREVIEW } from '@/data/home-workspace-mock'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

/** Прямая ссылка на витрину (п. 5 ТЗ). */
const MARKETPLACE_HREF = 'https://baza.sale'

/** Сквозной верхний бар: AI, Marketplace, уведомления, быстрые действия, профиль. */
export function DashboardTopHeader() {
  const [aiOpen, setAiOpen] = useState(false)
  const { currentUser } = useAuth()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const userName = currentUser?.name ?? 'Пользователь'
  const role = currentUser?.role ?? 'manager'
  const profileTo = roleCanAccessSettingsHub(role) ? '/dashboard/settings-hub' : '/dashboard/settings/info'
  const profileTitle = roleCanAccessSettingsHub(role)
    ? `${userName} — настройки`
    : `${userName} — профиль и новости`
  const canInfo = isDashboardPathAllowedForRole('/dashboard/settings/info', role)
  const initials =
    userName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'П'

  const btn = cn(
    'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] font-normal transition-colors',
    isLight
      ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
      : 'text-emerald-100/85 hover:bg-emerald-900/35 hover:text-emerald-50',
  )

  const iconBtn = cn(btn, 'min-w-10 px-0 sm:px-3')

  /** Та же поверхность, что у выпадающих панелей хедера — единый приподнятый слой. */
  const headerPopoverSurface = cn(
    isLight
      ? 'border-slate-200/90 bg-white text-slate-800 shadow-lg'
      : 'border-[color:var(--dropdown-border)] bg-[var(--dropdown-bg)] text-[color:var(--dropdown-text)] shadow-[var(--dropdown-shadow)]',
  )

  const notifPanelClass = cn(
    'w-[min(100vw-2rem,22rem)] max-h-[min(72vh,26rem)] overflow-hidden rounded-lg border p-0',
    headerPopoverSurface,
  )

  const notifMuted = isLight ? 'text-slate-500' : 'text-[color:var(--dropdown-text-muted)]'

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex min-h-[52px] shrink-0 items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4',
        isLight
          ? 'bg-white/92 backdrop-blur-md'
          : 'bg-[color-mix(in_srgb,var(--app-bg)_92%,transparent)] backdrop-blur-md',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <DashboardBackButton />
      </div>

      <nav
        className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-2"
        aria-label="Панель управления"
      >
        <button
          type="button"
          className={cn(
            btn,
            'min-h-10 gap-2 px-3.5 py-2 text-[13px] font-normal',
            'ring-1 ring-transparent hover:ring-[color-mix(in_srgb,var(--gold)_42%,transparent)]',
          )}
          title="AI — быстрые сценарии"
          aria-label="AI — быстрые сценарии"
          aria-haspopup="dialog"
          aria-expanded={aiOpen}
          onClick={() => setAiOpen(true)}
        >
          <Sparkles className="size-[22px] shrink-0 text-[color:var(--gold)]" strokeWidth={2} />
          <span>AI</span>
        </button>

        <a
          href={MARKETPLACE_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[var(--section-cta-radius)] px-3.5 py-2 text-[13px] font-light uppercase text-white transition-[filter,transform] hover:brightness-110 active:scale-[0.98]',
            'bg-[var(--corporate-green)] shadow-sm shadow-black/20',
            'tracking-[0.26em]',
          )}
          title="Перейти на baza.sale"
          aria-label="Marketplace — baza.sale"
        >
          Marketplace
        </a>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={iconBtn}
              title="Уведомления"
              aria-label="Уведомления"
            >
              <Bell className="size-[18px]" strokeWidth={2} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className={notifPanelClass}>
            <DropdownMenuLabel className="px-3 py-2 text-[13px] font-normal">
              Уведомления
            </DropdownMenuLabel>
            <div className="max-h-[min(52vh,18rem)] overflow-y-auto px-1 pb-1">
              {DASHBOARD_NOTIFICATIONS_PREVIEW.slice(0, 5).map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className={cn(
                    'mb-0.5 cursor-default flex flex-col items-start gap-0.5 rounded-md py-2.5 whitespace-normal',
                    isLight ? 'focus:bg-slate-100' : 'focus:bg-emerald-950/50',
                  )}
                  onSelect={(e) => e.preventDefault()}
                >
                  <span className="text-[13px] font-normal leading-snug">{n.title}</span>
                  <span className={cn('text-[11px] leading-snug', notifMuted)}>{n.body}</span>
                  <span className={cn('text-[10px]', notifMuted)}>{n.time}</span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator className={isLight ? 'bg-slate-200' : 'bg-emerald-800/40'} />
            {canInfo ? (
              <DropdownMenuItem asChild className="cursor-pointer font-normal">
                <Link to="/dashboard/settings/info">Все в разделе «Инфо»…</Link>
              </DropdownMenuItem>
            ) : (
              <p className={cn('px-2 py-2 text-center text-[11px]', notifMuted)}>
                Полный список — в разделе «Инфо» (нет доступа по роли).
              </p>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <WorkspaceAddButton variant="header" className="shrink-0" />

        <Link
          to={profileTo}
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full border text-xs font-normal transition-colors',
            isLight
              ? 'border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              : 'border-emerald-800/50 bg-emerald-950/40 text-emerald-100 hover:border-[color:var(--gold)]/40 hover:bg-emerald-900/30',
          )}
          title={profileTitle}
          aria-label={roleCanAccessSettingsHub(role) ? 'Профиль и настройки' : 'Профиль, раздел Инфо'}
        >
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt=""
              className="size-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </Link>
      </nav>

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent
          showCloseButton
          className={cn(
            'gap-0 overflow-hidden border p-0 sm:max-w-md',
            headerPopoverSurface,
          )}
        >
          <div className="flex gap-3 px-4 pb-4 pt-4 pr-14 sm:pr-16">
            <div
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-xl border',
                'border-[color:var(--hub-tile-icon-border)] bg-[var(--hub-tile-icon-bg)] text-[color:var(--hub-tile-icon-fg)]',
              )}
            >
              <Sparkles className="size-5" strokeWidth={2} />
            </div>
            <DialogHeader className="min-w-0 flex-1 space-y-2 text-left">
              <DialogTitle className="text-[1.05rem] font-normal uppercase leading-tight tracking-[0.05em] text-[color:var(--theme-accent-heading)]">
                AI-ассистент
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed text-[color:var(--hub-body)]">
                Сейчас доступны быстрые переходы в ключевые разделы. Диалог с моделью по сделкам, лидам и документам
                подключается при готовности API.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex flex-col gap-2 border-t border-[color:var(--workspace-row-border)] px-4 py-4">
            <p className="text-[11px] font-normal uppercase tracking-wide text-[color:var(--app-text-subtle)]">
              Быстрый переход
            </p>
            <div className="flex flex-col gap-2">
              <Link
                to="/dashboard/leads"
                onClick={() => setAiOpen(false)}
                className="rounded-lg border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2.5 text-[13px] font-medium text-[color:var(--workspace-text)] transition-colors hover:border-[color:color-mix(in_srgb,var(--gold)_40%,transparent)]"
              >
                Лиды и воронка
              </Link>
              <Link
                to="/dashboard/deals"
                onClick={() => setAiOpen(false)}
                className="rounded-lg border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2.5 text-[13px] font-medium text-[color:var(--workspace-text)] transition-colors hover:border-[color:color-mix(in_srgb,var(--gold)_40%,transparent)]"
              >
                Сделки
              </Link>
              <Link
                to="/dashboard/objects/list"
                onClick={() => setAiOpen(false)}
                className="rounded-lg border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2.5 text-[13px] font-medium text-[color:var(--workspace-text)] transition-colors hover:border-[color:color-mix(in_srgb,var(--gold)_40%,transparent)]"
              >
                Объекты
              </Link>
            </div>
            <label className="mt-1 text-[11px] text-[color:var(--app-text-subtle)]">
              <span className="mb-1 block">Запрос ассистенту (скоро)</span>
              <textarea
                readOnly
                rows={2}
                placeholder="Например: кратко по сделке deal-12…"
                className="w-full resize-none rounded-md border border-[color:var(--workspace-row-border)] bg-[color-mix(in_srgb,var(--app-bg)_88%,transparent)] px-2 py-1.5 text-[12px] text-[color:var(--workspace-text-muted)] outline-none"
              />
            </label>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
