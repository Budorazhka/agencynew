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
  'w-full rounded-xl border border-[color:var(--hub-card-border)] bg-[rgba(0,0,0,0.25)] px-4 py-2.5 text-sm text-[color:var(--app-text)] placeholder:text-[color:var(--shell-search-ph)] outline-none focus:border-[color:var(--hub-card-border-hover)] focus:ring-1 focus:ring-[color:var(--hub-card-border)] transition-all'

const LABEL = 'block text-xs font-medium uppercase tracking-wide text-[color:var(--hub-stat-label)] mb-1.5'

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
        <div className="flex items-start gap-3 rounded-xl border border-[color:var(--hub-card-border)] bg-[rgba(0,0,0,0.15)] px-4 py-3">
          <Info className="size-4 shrink-0 mt-0.5 text-[color:var(--hub-stat-label)]" />
          <p className="text-sm text-[color:var(--hub-stat-label)]">
            Добавление и редактирование менеджеров доступно только директору.
          </p>
        </div>
      )}

      {/* Panel */}
      <div className="rounded-xl border border-[color:var(--hub-card-border)] bg-[rgba(0,0,0,0.15)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[color:var(--hub-tile-icon-border)]">
          <h3 className="font-semibold text-[color:var(--app-text)]">Менеджеры по лидам</h3>
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
        <ul className="divide-y divide-[color:var(--hub-action-hover)]">
          {leadManagers.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--hub-action-hover)]">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--hub-tile-icon-bg)] text-sm font-semibold text-[color:var(--app-text)]">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <span className="font-medium text-[color:var(--app-text)]">{m.name}</span>
                  <span className="ml-2 text-sm text-[color:var(--hub-stat-label)]">{m.login}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {m.sourceTypes.map((s) => (
                  <span key={s} className="rounded-full border border-[color:var(--hub-card-border)] bg-[var(--nav-item-bg-active)] px-2.5 py-0.5 text-xs text-[color:var(--app-text-muted)]">
                    {SOURCE_LABELS[s]}
                  </span>
                ))}
                {canManageTeam && (
                  <>
                    <button
                      type="button"
                      onClick={() => openEdit(m)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-[color:var(--hub-stat-label)] hover:text-[color:var(--app-text)] hover:bg-[var(--hub-action-hover)] transition-colors"
                    >
                      <Pencil className="size-3.5" />
                      Редактировать
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'REMOVE_LEAD_MANAGER', managerId: m.id })}
                      className="rounded-lg px-2.5 py-1.5 text-sm text-[color:var(--workspace-text-muted)] hover:text-red-400 hover:bg-red-900/15 transition-colors"
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
        <DialogContent showCloseButton={false} className="max-w-md rounded-2xl border border-[color:var(--hub-card-border)] bg-[linear-gradient(180deg,rgba(9,36,28,0.99),rgba(6,20,16,0.98))] p-0 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[color:var(--hub-tile-icon-border)] px-6 py-4">
            <h2 className="text-base font-semibold text-[color:var(--app-text)]">
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
                          : 'border-[color:var(--hub-card-border)] bg-[var(--hub-action-hover)] text-[color:var(--hub-stat-label)] hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--app-text)]'
                      )}
                    >
                      {SOURCE_LABELS[s]}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-[11px] text-[color:var(--theme-accent-icon-dim)]">
                Выберите очереди, к которым у менеджера есть доступ.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[color:var(--hub-tile-icon-border)] px-6 py-4">
            <button
              type="button"
              onClick={closeDialog}
              className="rounded-full border border-[color:var(--hub-card-border)] px-5 py-2 text-sm font-medium text-[color:var(--hub-body)] hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--app-text)] transition-colors"
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
