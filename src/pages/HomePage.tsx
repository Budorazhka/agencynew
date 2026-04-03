import { useAgencyBranding } from '@/hooks/useAgencyBranding'
import { useAuth } from '@/context/AuthContext'
import { DashboardWorkspace } from '@/components/dashboard/DashboardWorkspace'
import { WorkspaceAddButton } from '@/components/dashboard/WorkspaceAddButton'

export default function HomePage() {
  const { currentUser } = useAuth()
  const branding = useAgencyBranding()

  const userName = currentUser?.name ?? 'Пользователь'
  const firstName = userName.trim().split(/\s+/)[0] || userName
  const productTitle = branding.name || 'Sovereign Analyst'

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)] font-[Inter,sans-serif] text-[color:var(--workspace-text)] antialiased">
      <main className="min-h-0 min-w-0 flex-1 overflow-hidden p-2 sm:p-2.5 lg:px-4 lg:py-3">
        <div className="flex h-full w-full min-w-0 flex-col">
          <header className="mb-1.5 flex shrink-0 items-center justify-between gap-3 lg:mb-2">
            <div className="min-w-0">
              <h2 className="mb-px text-[1.25rem] font-extrabold leading-tight tracking-tight text-[color:var(--app-text)] sm:text-[1.4rem] lg:text-[1.45rem]">
                Добро пожаловать, {firstName}
              </h2>
              <p className="text-[12px] leading-snug text-[color:var(--app-text-muted)] sm:text-[13px]">
                {productTitle}
              </p>
            </div>
            <WorkspaceAddButton variant="header" />
          </header>
          <div className="min-h-0 flex-1">
            <DashboardWorkspace />
          </div>
        </div>
      </main>
    </div>
  )
}
