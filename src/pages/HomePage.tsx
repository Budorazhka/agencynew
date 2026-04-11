import { DashboardWorkspace } from '@/components/dashboard/DashboardWorkspace'

export default function HomePage() {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)] font-sans text-[color:var(--workspace-text)] antialiased">
      <main className="min-h-0 min-w-0 flex-1 overflow-hidden px-2 pb-0 pt-0 sm:px-2.5 lg:px-3">
        <DashboardWorkspace />
      </main>
    </div>
  )
}
