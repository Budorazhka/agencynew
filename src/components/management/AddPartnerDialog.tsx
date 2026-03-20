import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createPermissions } from '@/data/mock'
import type { Partner, PartnerRole, PartnerType } from '@/types/dashboard'

const ALL_ROLES: PartnerRole[] = ['Первичка', 'Первичка 2', 'Вторичка', 'Вторичка 2', 'Аренда']

const roleCheckboxColors: Record<PartnerRole, string> = {
  Первичка: 'accent-green-600',
  'Первичка 2': 'accent-emerald-600',
  Вторичка: 'accent-purple-600',
  'Вторичка 2': 'accent-violet-600',
  Аренда: 'accent-amber-600',
}

interface AddPartnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cityId: string
  existingMasters: Partner[]
  onAdd: (partner: Partner) => void
}

export function AddPartnerDialog({
  open,
  onOpenChange,
  cityId,
  existingMasters,
  onAdd,
}: AddPartnerDialogProps) {
  const [login, setLogin] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<PartnerType>('sub')
  const [masterId, setMasterId] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<PartnerRole[]>([])

  const reset = () => {
    setLogin('')
    setName('')
    setType('sub')
    setMasterId('')
    setSelectedRoles([])
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset()
    onOpenChange(isOpen)
  }

  const toggleRole = (role: PartnerRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((selected) => selected !== role) : [...prev, role]
    )
  }

  const handleSubmit = () => {
    const normalizedLogin = login.trim()
    if (!normalizedLogin) return

    const partner: Partner = {
      id: `${cityId}-${Date.now()}`,
      name: name.trim() || normalizedLogin,
      login: normalizedLogin,
      type,
      roles: selectedRoles,
      permissions: createPermissions(),
      crmMinutes: 0,
      secondaryObjectsCount: 0,
      ...(type === 'sub' && masterId ? { masterId } : {}),
    }

    onAdd(partner)
    handleOpenChange(false)
  }

  const isValid = Boolean(login.trim()) && (type === 'master' || Boolean(masterId))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-emerald-500" />
            Добавить партнера
          </DialogTitle>
          <DialogDescription>
            Логин партнера обязателен для связки с бэкендом. Имя можно заполнить позже.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="partner-login" className="text-sm font-medium">
              Логин партнера *
            </Label>
            <Input
              id="partner-login"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              placeholder="Например: partner01@testmail.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="partner-name" className="text-sm font-medium">
              Имя партнера
            </Label>
            <Input
              id="partner-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Опционально"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Тип</Label>
            <div className="flex gap-2">
              <Button
                variant={type === 'master' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setType('master')}
              >
                Мастер-партнер
              </Button>
              <Button
                variant={type === 'sub' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setType('sub')}
              >
                Суб-партнер
              </Button>
            </div>
          </div>

          {type === 'sub' && existingMasters.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Привязать к мастеру</Label>
              <div className="flex flex-col gap-1.5">
                {existingMasters.map((master) => (
                  <button
                    key={master.id}
                    type="button"
                    onClick={() => setMasterId(master.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      masterId === master.id
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {master.name} <span className="text-muted-foreground">{master.login}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === 'sub' && existingMasters.length === 0 && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Сначала добавьте хотя бы одного City Master или выберите тип «Мастер-партнер».
            </p>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Роли</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map((role) => (
                <label key={role} className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className={`rounded ${roleCheckboxColors[role]}`}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
