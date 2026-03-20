import { useState } from 'react'
import { User, Building2, Bell, Settings, Users, CreditCard, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import { ProfileTab } from './ProfileTab'
import { CompanyTab } from './CompanyTab'
import { NotificationsTab } from './NotificationsTab'
import { BillingTab } from './BillingTab'
import { SecurityTab } from './SecurityTab'
import { LeadSettingsTab } from '@/components/leads/LeadSettingsTab'
import { LeadManagersTab } from '@/components/leads/LeadManagersTab'
import '@/components/leads/leads-secret-table.css'

type Section =
  | 'profile'
  | 'company'
  | 'notifications'
  | 'leads'
  | 'managers'
  | 'billing'
  | 'security'

interface NavItem {
  id: Section
  label: string
  icon: React.ReactNode
  separator?: boolean
}

export function SettingsPage() {
  const { isRopOrAbove, isDirectorOrAbove, isOwner } = useRolePermissions()

  const allItems: (NavItem & { visible: boolean })[] = [
    { id: 'profile',       label: 'Мой профиль',       icon: <User className="size-4" />,        visible: true },
    { id: 'company',       label: 'Компания',           icon: <Building2 className="size-4" />,   visible: isDirectorOrAbove },
    { id: 'notifications', label: 'Уведомления',        icon: <Bell className="size-4" />,        visible: true },
    { id: 'leads',         label: 'Передача лидов',     icon: <Settings className="size-4" />,    visible: isRopOrAbove, separator: true },
    { id: 'managers',      label: 'Менеджеры',          icon: <Users className="size-4" />,       visible: isRopOrAbove },
    { id: 'billing',       label: 'Тариф и оплата',     icon: <CreditCard className="size-4" />,  visible: isOwner, separator: true },
    { id: 'security',      label: 'Безопасность',       icon: <ShieldCheck className="size-4" />, visible: true },
  ]

  const visibleItems = allItems.filter((i) => i.visible)

  const [activeSection, setActiveSection] = useState<Section>(
    visibleItems[0]?.id ?? 'profile'
  )

  // Ensure activeSection is always valid
  const resolvedSection = visibleItems.find((i) => i.id === activeSection)
    ? activeSection
    : visibleItems[0]?.id ?? 'profile'

  return (
    <div className="leads-page-root -m-6 min-h-[calc(100vh+3rem)] lg:-m-8 lg:min-h-[calc(100vh+4rem)]">
      <div className="leads-page-bg" aria-hidden />
      <div className="leads-page-ornament" aria-hidden />
      <div className="leads-page relative z-10 p-6 lg:p-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-[rgba(242,207,141,0.45)] mb-1">Управление</p>
          <h1 className="text-3xl font-bold text-[#fcecc8]">Настройки</h1>
        </div>

        {/* Body: sidebar + content */}
        <div className="flex gap-8 items-start">

          {/* Sidebar — в том же стиле, что и блоки контента */}
          <nav className="w-52 shrink-0 rounded-xl border border-[rgba(242,207,141,0.12)] bg-[rgba(0,0,0,0.15)] p-2">
            {visibleItems.map((item, idx) => {
              const showSep = item.separator && idx > 0
              return (
                <div key={item.id}>
                  {showSep && (
                    <div className="my-2 h-px bg-[rgba(242,207,141,0.1)]" />
                  )}
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      'group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left',
                      resolvedSection === item.id
                        ? 'bg-[rgba(242,207,141,0.12)] text-[#fcecc8]'
                        : 'text-[rgba(242,207,141,0.5)] hover:bg-[rgba(242,207,141,0.06)] hover:text-[rgba(242,207,141,0.8)]'
                    )}
                  >
                    {resolvedSection === item.id && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[rgba(242,207,141,0.6)]" />
                    )}
                    <span className={cn(
                      'transition-colors',
                      resolvedSection === item.id
                        ? 'text-[rgba(242,207,141,0.8)]'
                        : 'text-[rgba(242,207,141,0.35)] group-hover:text-[rgba(242,207,141,0.6)]'
                    )}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                </div>
              )
            })}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {resolvedSection === 'profile'       && <ProfileTab />}
            {resolvedSection === 'company'       && <CompanyTab />}
            {resolvedSection === 'notifications' && <NotificationsTab />}
            {resolvedSection === 'leads'         && <LeadSettingsTab />}
            {resolvedSection === 'managers'      && <LeadManagersTab />}
            {resolvedSection === 'billing'       && <BillingTab />}
            {resolvedSection === 'security'      && <SecurityTab />}
          </div>
        </div>
      </div>
    </div>
  )
}
