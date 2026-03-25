import { useState } from 'react'
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
import AgencyBrandingModal from '@/components/AgencyBrandingModal'
import { getBranding, type AgencyBranding } from '@/store/agencyStore'

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

export function SettingsPage() {
  const { isRopOrAbove, isDirectorOrAbove, isOwner } = useRolePermissions()
  const [branding, setBranding] = useState<AgencyBranding>(() => getBranding())
  const [showBrandingModal, setShowBrandingModal] = useState(false)

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
    visibleItems[0]?.id ?? 'profile'
  )

  // Ensure activeSection is always valid
  const resolvedSection = visibleItems.find((i) => i.id === activeSection)
    ? activeSection
    : visibleItems[0]?.id ?? 'profile'

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="relative z-10 p-6 lg:p-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-[rgba(242,207,141,0.45)] mb-1">Управление</p>
          <h1 className="text-3xl font-bold text-[#fcecc8]">Настройки</h1>
        </div>

        {/* Body: sidebar + content */}
        <div className="flex gap-8 items-start">

          {/* Sidebar — в том же стиле, что и блоки контента */}
          <nav className="w-52 shrink-0 rounded-xl border border-[rgba(242,207,141,0.14)] bg-[var(--green-card)] p-2">
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
            {resolvedSection === 'branding'      && (
              <div className="rounded-xl border border-[rgba(242,207,141,0.14)] bg-[var(--green-card)] p-6">
                <p className="text-xs uppercase tracking-widest text-[rgba(242,207,141,0.45)] mb-1">Оформление</p>
                <h2 className="text-xl font-bold text-[#fcecc8] mb-4">Брендинг агентства</h2>
                <p className="text-sm text-[rgba(242,207,141,0.5)] mb-6">
                  Загрузите логотип и укажите название агентства — они отображаются на главном экране.
                </p>
                {branding.logoDataUrl && (
                  <img src={branding.logoDataUrl} alt="logo" className="h-16 mb-4 object-contain opacity-80" />
                )}
                {branding.name && (
                  <p className="text-[rgba(201,168,76,0.6)] font-bold tracking-widest uppercase text-sm mb-6">{branding.name}</p>
                )}
                <button
                  onClick={() => setShowBrandingModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(242,207,141,0.25)] text-[rgba(242,207,141,0.7)] text-sm font-semibold hover:bg-[rgba(242,207,141,0.08)] transition-colors"
                >
                  <Paintbrush className="size-4" /> Изменить брендинг
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBrandingModal && (
        <AgencyBrandingModal
          current={branding}
          onClose={() => setShowBrandingModal(false)}
          onSave={(b) => { setBranding(b) }}
        />
      )}
    </div>
  )
}

