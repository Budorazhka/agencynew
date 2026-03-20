import { useState } from 'react'
import { Mail, UserPlus } from 'lucide-react'
import { useLeads } from '@/context/LeadsContext'
import { isLeadAdminDirector } from '@/lib/portal-user'
import type { LeadPartnerByEmail, LeadSource } from '@/types/leads'
import { useDashboard } from '@/context/DashboardContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

const SOURCE_LABELS: Record<LeadSource, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
  rent: 'Аренда',
  ad_campaigns: 'Рекламные кампании',
}

export function LeadPartnersTab() {
  const { state, dispatch } = useLeads()
  const { state: dashboardState } = useDashboard()
  const isDirector = isLeadAdminDirector()
  const { leadPartners } = state
  const { cities } = dashboardState
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sourceType, setSourceType] = useState<LeadSource>('primary')
  const [cityId, setCityId] = useState<string>('')

  const handleAdd = () => {
    if (!email.trim()) return
    const newPartner: LeadPartnerByEmail = {
      id: `lp-${Date.now()}`,
      email: email.trim(),
      sourceType,
      cityId: cityId || undefined,
    }
    dispatch({ type: 'ADD_LEAD_PARTNER', partner: newPartner })
    setEmail('')
    setSourceType('primary')
    setCityId('')
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      {!isDirector && (
        <p className="text-sm text-slate-600">
          Выдавать доступ к разделу «Контроль лидов» может только директор.
        </p>
      )}

      <Card className="leads-card">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base font-semibold">Кто имеет доступ к разделу «Контроль лидов»</CardTitle>
            <p className="mt-1 text-sm text-slate-600">
              Пользователи, которым открыт этот раздел (видят облако лидов, настройки, менеджеров и т.д.). Добавляются по email личного кабинета.
            </p>
          </div>
          {isDirector && (
            <Button className="rounded-full gap-2" size="sm" onClick={() => setOpen(true)}>
              <UserPlus className="size-4" />
              Выдать доступ
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {leadPartners.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">{p.email}</span>
                    <Badge variant="secondary" className="ml-2 font-normal">
                      {SOURCE_LABELS[p.sourceType]}
                    </Badge>
                    {p.cityId && (
                      <span className="ml-2 text-sm text-slate-500">
                        {cities.find((c) => c.id === p.cityId)?.name ?? p.cityId}
                      </span>
                    )}
                  </div>
                </div>
                {isDirector && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-red-600"
                    onClick={() => dispatch({ type: 'REMOVE_LEAD_PARTNER', partnerId: p.id })}
                  >
                    Удалить
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выдать доступ по email личного кабинета</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email личного кабинета</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Очередь (тип лидов)</Label>
              <Select
                value={sourceType}
                onValueChange={(v: LeadSource) => setSourceType(v)}
              >
                <SelectTrigger className="leads-select-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="leads-select-content">
                  {(Object.keys(SOURCE_LABELS) as LeadSource[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {SOURCE_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Город (необязательно)</Label>
              <Select value={cityId || '_none'} onValueChange={(v) => setCityId(v === '_none' ? '' : v)}>
                <SelectTrigger className="leads-select-trigger">
                  <SelectValue placeholder="Не выбран" />
                </SelectTrigger>
                <SelectContent className="leads-select-content">
                  <SelectItem value="_none">Не выбран</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAdd} disabled={!email.trim()}>
              Выдать доступ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
