import { DashboardWorkspace } from '@/components/dashboard/DashboardWorkspace'

export default function HomePage() {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)] font-sans text-[color:var(--workspace-text)] antialiased">
      <main className="min-h-0 min-w-0 flex-1 overflow-hidden px-2 pb-2 pt-0 sm:px-2.5 sm:pb-2 lg:px-4 lg:pb-2">
        <div className="flex h-full w-full min-w-0 flex-col">
          <div className="min-h-0 flex-1">
            <DashboardWorkspace />
          </div>
        </div>
      </main>
    </div>
  )
}
