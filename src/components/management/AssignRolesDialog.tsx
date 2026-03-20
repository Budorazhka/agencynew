import { useEffect, useState } from 'react'
import { ChevronRight, Shield, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { createPermissions } from '@/data/mock'
import { PermissionRow } from './PermissionRow'
import { ConfirmationDialog } from './ConfirmationDialog'
import type { Partner, Permission, PartnerRole } from '@/types/dashboard'

const ALL_ROLES: PartnerRole[] = [
  'Первичка',
  'Первичка 2',
  'Вторичка',
  'Вторичка 2',
  'Аренда',
]

interface AssignRolesDialogProps {
  partner: Partner | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSavePermissions: (partnerId: string, permissions: Permission[]) => void
  onSaveRoles: (partnerId: string, roles: PartnerRole[]) => void
}

interface PendingToggle {
  id: string
  checked: boolean
}

export function AssignRolesDialog({
  partner,
  open,
  onOpenChange,
  onSavePermissions,
  onSaveRoles,
}: AssignRolesDialogProps) {
  const [localRoles, setLocalRoles] = useState<PartnerRole[]>([])
  const [localPermissions, setLocalPermissions] = useState<Permission[]>([])
  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(null)

  // При открытии модалки всегда подставляем полный список прав (onOpenChange при open=true может не вызваться)
  useEffect(() => {
    if (open && partner) {
      setLocalRoles([...partner.roles])
      const fullList = createPermissions()
      const merged = fullList.map((perm) => {
        const fromPartner = partner.permissions.find((p) => p.id === perm.id)
        return {
          ...perm,
          enabled: fromPartner?.enabled ?? perm.enabled,
        }
      })
      setLocalPermissions(merged)
    }
  }, [open, partner])

  const handleOpen = (isOpen: boolean) => {
    if (!isOpen) setPendingToggle(null)
    onOpenChange(isOpen)
  }

  const toggleRole = (role: PartnerRole) => {
    if (!partner) return
    const next = localRoles.includes(role)
      ? localRoles.filter((r) => r !== role)
      : [...localRoles, role]
    setLocalRoles(next)
    onSaveRoles(partner.id, next)
  }

  const requestPermissionToggle = (id: string, checked: boolean) => {
    setPendingToggle({ id, checked })
  }

  const confirmPermissionToggle = () => {
    if (!partner || !pendingToggle) return
    const updated = localPermissions.map((p) =>
      p.id === pendingToggle.id ? { ...p, enabled: pendingToggle.checked } : p
    )
    setLocalPermissions(updated)
    onSavePermissions(partner.id, updated)
    setPendingToggle(null)
  }

  if (!partner) return null

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent
          showCloseButton={false}
          className="min-h-[70vh] max-h-[90vh] w-full max-w-md p-0 overflow-hidden border border-slate-200/80 bg-white shadow-xl rounded-2xl"
        >
          <div className="flex flex-col min-h-[70vh] max-h-[90vh]">
            {/* Шапка как в Telegram */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <button
                type="button"
                className="text-sm text-sky-600 hover:text-sky-800"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </button>
              <DialogHeader className="flex-1 min-w-0 py-0 px-1">
                <DialogTitle className="flex items-center justify-center gap-1.5 text-base font-semibold text-slate-900">
                  <Shield className="size-4 text-sky-500 shrink-0" />
                  <span className="truncate">Доступы</span>
                </DialogTitle>
                <DialogDescription className="text-center text-xs font-normal text-slate-500 mt-0.5 truncate">
                  {partner.name} · {partner.login}
                </DialogDescription>
              </DialogHeader>
              <button
                type="button"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700"
                onClick={() => onOpenChange(false)}
                aria-label="Закрыть"
              >
                <X className="size-5" />
              </button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              {/* Роли — как назначение прав админа в Telegram */}
              <div className="px-3 pt-3 pb-1">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium px-1 mb-2">
                  Роли
                </p>
                <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden">
                  {ALL_ROLES.map((role, index) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 active:bg-slate-100 ${
                        index > 0 ? 'border-t border-slate-100' : ''
                      }`}
                    >
                      <span className="text-sm font-medium text-slate-800">{role}</span>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={localRoles.includes(role)}
                          onCheckedChange={() => toggleRole(role)}
                          onClick={(e) => e.stopPropagation()}
                          className="data-[state=checked]:bg-sky-500"
                        />
                        <ChevronRight className="size-4 text-slate-300" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Права доступа */}
              <div className="px-3 pt-4 pb-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium px-1 mb-2">
                  Права доступа
                </p>
                <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden">
                  {localPermissions.map((permission) => (
                    <PermissionRow
                      key={permission.id}
                      label={permission.label}
                      description={permission.description}
                      checked={permission.enabled}
                      onCheckedChange={(checked) =>
                        requestPermissionToggle(permission.id, checked)
                      }
                    />
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={Boolean(pendingToggle)}
        title="Подтвердите изменение"
        description="Вы уверены? Это изменит права доступа партнера"
        onConfirm={confirmPermissionToggle}
        onCancel={() => setPendingToggle(null)}
      />
    </>
  )
}
