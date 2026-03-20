import { useState } from 'react'
import { Camera, KeyRound, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const ROLE_LABELS: Record<string, string> = {
  owner:    'Собственник',
  director: 'Директор',
  rop:      'РОП',
  manager:  'Менеджер',
}

// Styled input for felt theme
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
      <label className="block text-xs font-medium text-[rgba(242,207,141,0.55)] uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[rgba(242,207,141,0.2)] bg-[rgba(0,0,0,0.25)] px-4 py-2.5 text-sm text-[#fcecc8] placeholder:text-[rgba(242,207,141,0.3)] outline-none focus:border-[rgba(242,207,141,0.5)] focus:ring-1 focus:ring-[rgba(242,207,141,0.2)] transition-all read-only:opacity-50 read-only:cursor-default"
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

  const roleLabel = ROLE_LABELS[currentUser?.role ?? ''] ?? currentUser?.role ?? '—'

  return (
    <div className="space-y-8 max-w-xl">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="flex size-20 items-center justify-center rounded-full border-2 border-[rgba(242,207,141,0.3)] bg-[rgba(242,207,141,0.1)] text-2xl font-bold text-[#fcecc8]">
            {(currentUser?.name ?? 'U').slice(0, 1).toUpperCase()}
          </div>
          <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-[rgba(242,207,141,0.3)] bg-[rgba(9,47,38,0.9)] text-[rgba(242,207,141,0.7)] hover:text-[#fcecc8] transition-colors">
            <Camera className="size-3.5" />
          </button>
        </div>
        <div>
          <p className="font-semibold text-[#fcecc8]">{currentUser?.name}</p>
          <p className="text-sm text-[rgba(242,207,141,0.5)]">{currentUser?.companyName}</p>
          <span className="mt-1 inline-block rounded-full border border-[rgba(242,207,141,0.25)] bg-[rgba(242,207,141,0.08)] px-2.5 py-0.5 text-xs font-medium text-[rgba(242,207,141,0.7)]">
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
          className="flex items-center gap-2 rounded-xl border border-[rgba(242,207,141,0.2)] px-5 py-2.5 text-sm font-medium text-[rgba(242,207,141,0.7)] hover:border-[rgba(242,207,141,0.4)] hover:text-[#fcecc8] transition-colors"
        >
          <KeyRound className="size-4" />
          Изменить пароль
        </button>
      </div>

      {/* Password dialog */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent className="max-w-sm bg-[rgba(9,40,32,0.98)] border-[rgba(242,207,141,0.2)] text-[#fcecc8]">
          <DialogHeader>
            <DialogTitle className="text-[#fcecc8]">Изменить пароль</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <FeltInput label="Текущий пароль" value={oldPwd} onChange={setOldPwd} type="password" placeholder="••••••••" />
            <FeltInput label="Новый пароль" value={newPwd} onChange={setNewPwd} type="password" placeholder="••••••••" />
            <FeltInput label="Подтверждение" value={confPwd} onChange={setConfPwd} type="password" placeholder="••••••••" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setPwdOpen(false)} className="rounded-xl border border-[rgba(242,207,141,0.2)] px-4 py-2 text-sm text-[rgba(242,207,141,0.6)] hover:text-[#fcecc8] transition-colors">
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
