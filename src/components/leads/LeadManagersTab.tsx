import { useState } from 'react'
import { Pencil, UserPlus, Info } from 'lucide-react'
import { useLeads } from '@/context/LeadsContext'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import type { LeadManager, LeadSource } from '@/types/leads'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const SOURCE_LABELS: Record<LeadSource, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
  rent: 'Аренда',
  ad_campaigns: 'Рекламные кампании',
}

const FIELD =
  'w-full rounded-xl border border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.25)] px-4 py-2.5 text-sm text-[#fcecc8] placeholder:text-[rgba(242,207,141,0.3)] outline-none focus:border-[rgba(242,207,141,0.5)] focus:ring-1 focus:ring-[rgba(242,207,141,0.2)] transition-all'

const LABEL = 'block text-xs font-medium uppercase tracking-wide text-[rgba(242,207,141,0.55)] mb-1.5'

export function LeadManagersTab() {
  const { state, dispatch } = useLeads()
  const { canManageTeam } = useRolePermissions()
  const { leadManagers } = state
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [login, setLogin] = useState('')
  const [name, setName] = useState('')
  const [sourceTypes, setSourceTypes] = useState<LeadSource[]>(['primary'])

  const isEdit = !!editingId

  const toggleSource = (s: LeadSource) => {
    setSourceTypes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const openAdd = () => {
    setEditingId(null); setLogin(''); setName(''); setSourceTypes(['primary']); setOpen(true)
  }

  const openEdit = (m: LeadManager) => {
    setEditingId(m.id); setLogin(m.login); setName(m.name); setSourceTypes([...m.sourceTypes]); setOpen(true)
  }

  const handleSave = () => {
    if (!login.trim() || !name.trim() || sourceTypes.length === 0) return
    if (isEdit && editingId) {
      dispatch({ type: 'UPDATE_LEAD_MANAGER', managerId: editingId, patch: { login: login.trim(), name: name.trim(), sourceTypes: [...sourceTypes] } })
    } else {
      dispatch({ type: 'ADD_LEAD_MANAGER', manager: { id: `lm-${Date.now()}`, login: login.trim(), name: name.trim(), sourceTypes: [...sourceTypes] } })
    }
    closeDialog()
  }

  const closeDialog = () => {
    setOpen(false); setEditingId(null); setLogin(''); setName(''); setSourceTypes(['primary'])
  }

  return (
    <div className="space-y-5 max-w-2xl">

      {!canManageTeam && (
        <div className="flex items-start gap-3 rounded-xl border border-[rgba(242,207,141,0.15)] bg-[rgba(0,0,0,0.15)] px-4 py-3">
          <Info className="size-4 shrink-0 mt-0.5 text-[rgba(242,207,141,0.45)]" />
          <p className="text-sm text-[rgba(242,207,141,0.55)]">
            Добавление и редактирование менеджеров доступно только директору.
          </p>
        </div>
      )}

      {/* Panel */}
      <div className="rounded-xl border border-[rgba(242,207,141,0.15)] bg-[rgba(0,0,0,0.15)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[rgba(242,207,141,0.1)]">
          <h3 className="font-semibold text-[#fcecc8]">Менеджеры по лидам</h3>
          {canManageTeam && (
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/60 transition-colors"
            >
              <UserPlus className="size-4" />
              Добавить менеджера
            </button>
          )}
        </div>

        {/* List */}
        <ul className="divide-y divide-[rgba(242,207,141,0.07)]">
          {leadManagers.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[rgba(242,207,141,0.04)]">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[rgba(242,207,141,0.1)] text-sm font-semibold text-[#fcecc8]">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <span className="font-medium text-[#fcecc8]">{m.name}</span>
                  <span className="ml-2 text-sm text-[rgba(242,207,141,0.45)]">{m.login}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {m.sourceTypes.map((s) => (
                  <span key={s} className="rounded-full border border-[rgba(242,207,141,0.2)] bg-[rgba(242,207,141,0.08)] px-2.5 py-0.5 text-xs text-[rgba(242,207,141,0.75)]">
                    {SOURCE_LABELS[s]}
                  </span>
                ))}
                {canManageTeam && (
                  <>
                    <button
                      type="button"
                      onClick={() => openEdit(m)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-[rgba(242,207,141,0.55)] hover:text-[#fcecc8] hover:bg-[rgba(242,207,141,0.07)] transition-colors"
                    >
                      <Pencil className="size-3.5" />
                      Редактировать
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'REMOVE_LEAD_MANAGER', managerId: m.id })}
                      className="rounded-lg px-2.5 py-1.5 text-sm text-[rgba(242,207,141,0.4)] hover:text-red-400 hover:bg-red-900/15 transition-colors"
                    >
                      Удалить
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(v) => !v && closeDialog()}>
        <DialogContent showCloseButton={false} className="max-w-md rounded-2xl border border-[rgba(242,207,141,0.16)] bg-[linear-gradient(180deg,rgba(9,36,28,0.99),rgba(6,20,16,0.98))] p-0 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[rgba(242,207,141,0.1)] px-6 py-4">
            <h2 className="text-base font-semibold text-[#fcecc8]">
              {isEdit ? 'Редактировать менеджера' : 'Добавить менеджера'}
            </h2>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div>
              <label className={LABEL}>Логин (email)</label>
              <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="manager@example.com" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Имя</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Менеджеров" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Очереди лидов</label>
              <div className="flex flex-wrap gap-2">
                {(['primary', 'secondary', 'rent', 'ad_campaigns'] as LeadSource[]).map((s) => {
                  const active = sourceTypes.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSource(s)}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
                        active
                          ? 'border-emerald-400/60 bg-emerald-400/12 text-emerald-300'
                          : 'border-[rgba(242,207,141,0.2)] bg-[rgba(242,207,141,0.06)] text-[rgba(242,207,141,0.55)] hover:border-[rgba(242,207,141,0.4)] hover:text-[#fcecc8]'
                      )}
                    >
                      {SOURCE_LABELS[s]}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-[11px] text-[rgba(242,207,141,0.35)]">
                Выберите очереди, к которым у менеджера есть доступ.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[rgba(242,207,141,0.1)] px-6 py-4">
            <button
              type="button"
              onClick={closeDialog}
              className="rounded-full border border-[rgba(242,207,141,0.2)] px-5 py-2 text-sm font-medium text-[rgba(242,207,141,0.65)] hover:border-[rgba(242,207,141,0.4)] hover:text-[#fcecc8] transition-colors"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!login.trim() || !name.trim() || sourceTypes.length === 0}
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isEdit ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
