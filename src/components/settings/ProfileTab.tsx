import { useState } from 'react'
import { Camera, KeyRound, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ROLE_LABEL } from '@/lib/permissions'
import type { UserRole } from '@/types/auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Поле ввода в стиле темы «сукно»
function FeltInput({
  label,
  value,
  onChange,
  readOnly,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  readOnly?: boolean
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-[color:var(--hub-stat-label)] uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[color:var(--hub-card-border)] bg-[rgba(0,0,0,0.25)] px-4 py-2.5 text-sm text-[color:var(--app-text)] placeholder:text-[color:var(--theme-accent-icon-dim)] outline-none focus:border-[color:var(--hub-card-border-hover)] focus:ring-1 focus:ring-[color:var(--hub-card-border)] transition-all read-only:opacity-50 read-only:cursor-default"
      />
    </div>
  )
}

export function ProfileTab() {
  const { currentUser } = useAuth()

  const [name,  setName]  = useState(currentUser?.name  ?? '')
  const [phone, setPhone] = useState('+7 (999) 123-45-67')
  const [email, setEmail] = useState(currentUser?.login ?? '')
  const [saved, setSaved] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [oldPwd, setOldPwd]   = useState('')
  const [newPwd, setNewPwd]   = useState('')
  const [confPwd, setConfPwd] = useState('')

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handlePasswordSave() {
    setPwdOpen(false)
    setOldPwd(''); setNewPwd(''); setConfPwd('')
  }

  const role = currentUser?.role as UserRole | undefined
  const roleLabel = role ? ROLE_LABEL[role] : '—'

  return (
    <div className="space-y-8 max-w-xl">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="flex size-20 items-center justify-center rounded-full border-2 border-[color:var(--hub-card-border-hover)] bg-[var(--hub-tile-icon-bg)] text-2xl font-bold text-[color:var(--app-text)]">
            {(currentUser?.name ?? 'U').slice(0, 1).toUpperCase()}
          </div>
          <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-[color:var(--hub-card-border-hover)] bg-[rgba(9,47,38,0.9)] text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--app-text)] transition-colors">
            <Camera className="size-3.5" />
          </button>
        </div>
        <div>
          <p className="font-semibold text-[color:var(--app-text)]">{currentUser?.name}</p>
          <p className="text-sm text-[color:var(--hub-desc)]">{currentUser?.companyName}</p>
          <span className="mt-1 inline-block rounded-full border border-[color:var(--hub-tile-icon-border)] bg-[var(--nav-item-bg-active)] px-2.5 py-0.5 text-xs font-medium text-[color:var(--theme-accent-link-dim)]">
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FeltInput label="Имя" value={name} onChange={setName} placeholder="Ваше имя" />
        <FeltInput label="Должность / Роль" value={roleLabel} readOnly />
        <FeltInput label="Телефон" value={phone} onChange={setPhone} type="tel" placeholder="+7 (___) ___-__-__" />
        <FeltInput label="E-mail" value={email} onChange={setEmail} type="email" placeholder="email@company.ru" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
        >
          {saved ? <><Check className="size-4" /> Сохранено</> : 'Сохранить изменения'}
        </button>
        <button
          onClick={() => setPwdOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-[color:var(--hub-card-border)] px-5 py-2.5 text-sm font-medium text-[color:var(--theme-accent-link-dim)] hover:border-[color:var(--hub-card-border-hover)] hover:text-[color:var(--app-text)] transition-colors"
        >
          <KeyRound className="size-4" />
          Изменить пароль
        </button>
      </div>

      {/* Password dialog */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent className="max-w-sm bg-[rgba(9,40,32,0.98)] border-[color:var(--hub-card-border)] text-[color:var(--app-text)]">
          <DialogHeader>
            <DialogTitle className="text-[color:var(--app-text)]">Изменить пароль</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <FeltInput label="Текущий пароль" value={oldPwd} onChange={setOldPwd} type="password" placeholder="••••••••" />
            <FeltInput label="Новый пароль" value={newPwd} onChange={setNewPwd} type="password" placeholder="••••••••" />
            <FeltInput label="Подтверждение" value={confPwd} onChange={setConfPwd} type="password" placeholder="••••••••" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setPwdOpen(false)} className="rounded-xl border border-[color:var(--hub-card-border)] px-4 py-2 text-sm text-[color:var(--hub-badge-soon-fg)] hover:text-[color:var(--app-text)] transition-colors">
              Отмена
            </button>
            <button
              onClick={handlePasswordSave}
              disabled={!oldPwd || !newPwd || newPwd !== confPwd}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Сохранить
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
