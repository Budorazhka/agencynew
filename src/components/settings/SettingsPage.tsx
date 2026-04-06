import { useLayoutEffect, useState } from 'react'
import { User, Building2, Bell, Settings, Users, CreditCard, ShieldCheck, Paintbrush } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import { ProfileTab } from './ProfileTab'
import { CompanyTab } from './CompanyTab'
import { NotificationsTab } from './NotificationsTab'
import { BillingTab } from './BillingTab'
import { SecurityTab } from './SecurityTab'
import { LeadSettingsTab } from '@/components/leads/LeadSettingsTab'
import { LeadManagersTab } from '@/components/leads/LeadManagersTab'
import { BrandingTab } from './BrandingTab'

type Section =
  | 'profile'
  | 'company'
  | 'notifications'
  | 'leads'
  | 'managers'
  | 'billing'
  | 'security'
  | 'branding'

interface NavItem {
  id: Section
  label: string
  icon: React.ReactNode
  separator?: boolean
}

export type SettingsPageProps = {
  /** Открыть указанную секцию при загрузке (например с маршрута /settings/branding). */
  initialSection?: Section
}

export function SettingsPage({ initialSection }: SettingsPageProps) {
  const { isRopOrAbove, isDirectorOrAbove, isOwner } = useRolePermissions()

  const allItems: (NavItem & { visible: boolean })[] = [
    { id: 'profile',       label: 'Мой профиль',       icon: <User className="size-4" />,        visible: true },
    { id: 'company',       label: 'Компания',           icon: <Building2 className="size-4" />,   visible: isDirectorOrAbove },
    { id: 'notifications', label: 'Уведомления',        icon: <Bell className="size-4" />,        visible: true },
    { id: 'leads',         label: 'Передача лидов',     icon: <Settings className="size-4" />,    visible: isRopOrAbove, separator: true },
    { id: 'managers',      label: 'Менеджеры',          icon: <Users className="size-4" />,       visible: isRopOrAbove },
    { id: 'billing',       label: 'Тариф и оплата',     icon: <CreditCard className="size-4" />,   visible: isOwner, separator: true },
    { id: 'security',      label: 'Безопасность',       icon: <ShieldCheck className="size-4" />,  visible: true },
    { id: 'branding',      label: 'Брендинг агентства', icon: <Paintbrush className="size-4" />,   visible: isOwner, separator: true },
  ]

  const visibleItems = allItems.filter((i) => i.visible)

  const [activeSection, setActiveSection] = useState<Section>(
    visibleItems[0]?.id ?? 'profile',
  )

  const visibleIdsKey = visibleItems.map((i) => i.id).join('|')

  useLayoutEffect(() => {
    if (initialSection && visibleItems.some((i) => i.id === initialSection)) {
      setActiveSection(initialSection)
    }
  }, [initialSection, visibleIdsKey])

  // Раздел activeSection всегда должен быть из списка секций
  const resolvedSection = visibleItems.find((i) => i.id === activeSection)
    ? activeSection
    : visibleItems[0]?.id ?? 'profile'

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="relative z-10 p-6 lg:p-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-[color:var(--hub-stat-label)] mb-1">Управление</p>
          <h1 className="text-3xl font-bold text-[color:var(--app-text)]">Настройки</h1>
        </div>

        {/* Body: sidebar + content */}
        <div className="flex gap-8 items-start">

          {/* Sidebar — в том же стиле, что и блоки контента */}
          <nav className="w-52 shrink-0 rounded-xl border border-[color:var(--hub-card-border)] bg-[var(--green-card)] p-2">
            {visibleItems.map((item, idx) => {
              const showSep = item.separator && idx > 0
              return (
                <div key={item.id}>
                  {showSep && (
                    <div className="my-2 h-px bg-[var(--hub-tile-icon-bg)]" />
                  )}
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      'group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left',
                      resolvedSection === item.id
                        ? 'bg-[var(--nav-item-bg-active)] text-[color:var(--app-text)]'
                        : 'text-[color:var(--hub-desc)] hover:bg-[var(--hub-action-hover)] hover:text-[color:var(--app-text-muted)]'
                    )}
                  >
                    {resolvedSection === item.id && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-[var(--gold)]" />
                    )}
                    <span className={cn(
                      'transition-colors',
                      resolvedSection === item.id
                        ? 'text-[color:var(--app-text-muted)]'
                        : 'text-[color:var(--theme-accent-icon-dim)] group-hover:text-[color:var(--theme-accent-link-dim)]'
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
            {resolvedSection === 'branding'      && (
              <div className="rounded-xl border border-[color:var(--hub-card-border)] bg-[var(--green-card)] p-6">
                <BrandingTab />
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

