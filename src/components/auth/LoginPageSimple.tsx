import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Building2 } from 'lucide-react'
import { useAuth, MOCK_USERS } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROLE_LABEL, ROLE_COLOR } from '@/lib/permissions'
import type { UserRole } from '@/types/auth'
import { cn } from '@/lib/utils'

const ROLES: UserRole[] = ['owner', 'director', 'rop', 'marketer', 'manager']

export function LoginPageSimple() {
  const { login, enterAs } = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [loginVal, setLoginVal] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const result = login(loginVal, password)
      setLoading(false)
      if (result === 'ok') {
        navigate('/dashboard', { replace: true })
      } else if (result === 'blocked') {
        setError('Аккаунт заблокирован. Обратитесь к руководителю.')
      } else {
        setError('Неверный логин или пароль')
      }
    }, 400)
  }

  function handleEnterAs() {
    if (selectedRole) {
      enterAs('agency', selectedRole)
      navigate('/dashboard', { replace: true })
    }
  }

  function quickLogin(userLogin: string) {
    const result = login(userLogin, '1')
    if (result === 'ok') navigate('/dashboard', { replace: true })
    else if (result === 'blocked') setError('Аккаунт заблокирован. Обратитесь к руководителю.')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-200/80">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-foreground font-bold text-xl tracking-tight">
              Baza<span className="font-normal text-muted-foreground">.sale</span>
            </span>
          </div>
          <h2 className="text-lg font-semibold text-foreground mt-6 mb-1">
            Войти по роли (демо)
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            В этой версии доступно только агентство. Выберите роль и откроется нужный кабинет
          </p>

          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#0d3d2f]/15 bg-[#0d3d2f]/05 px-4 py-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#0d3d2f]/10 text-[#0d3d2f]">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Тип кабинета</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Агентство</p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={cn(
                  'rounded-full border-2 px-4 py-2 text-sm font-medium transition-all',
                  selectedRole === role
                    ? 'border-[#0d3d2f] bg-[#0d3d2f] text-white'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600',
                )}
              >
                {ROLE_LABEL[role]}
              </button>
            ))}
          </div>

          <Button
            type="button"
            onClick={handleEnterAs}
            disabled={!selectedRole}
            className="w-full bg-[#0d3d2f] hover:bg-[#0a2f24] text-white"
          >
            Войти в кабинет
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-slate-50/50">
        <div className="w-full max-w-sm">
          <h2 className="text-lg font-semibold text-foreground mb-1">Вход по логину</h2>
          <p className="text-sm text-muted-foreground mb-6">Логин и пароль для доступа к кабинету</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="login" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Логин
              </label>
              <Input
                id="login"
                autoComplete="username"
                placeholder="owner / director / rop / marketer / manager"
                value={loginVal}
                onChange={(e) => setLoginVal(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Пароль
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">Пароль для демо-пользователей: 1</p>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs text-muted-foreground mb-2">Быстрый вход:</p>
            <div className="flex flex-wrap gap-2">
              {MOCK_USERS.filter((u) => u.accountType === 'agency').map((u) => (
                <button
                  key={u.id}
                  onClick={() => quickLogin(u.login)}
                  className={cn(
                    'text-xs px-2 py-1 rounded border font-medium transition-colors',
                    ROLE_COLOR[u.role],
                  )}
                >
                  {ROLE_LABEL[u.role]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
