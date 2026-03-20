import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CurrentUser } from '@/types/auth'
import type { AccountType, UserRole } from '@/types/auth'
import { ROLE_LABEL, ACCOUNT_TYPE_LABEL } from '@/lib/permissions'

/** Mock-пользователи для демонстрации (по одному на каждую роль) */
export const MOCK_USERS: (CurrentUser & { password: string })[] = [
  {
    id: 'u1',
    name: 'Артём Власов',
    login: 'owner',
    password: '1',
    role: 'owner',
    accountType: 'agency',
    companyId: 'c1',
    companyName: 'Estate Group',
    avatarUrl: undefined,
  },
  {
    id: 'u2',
    name: 'Марина Петрова',
    login: 'director',
    password: '1',
    role: 'director',
    accountType: 'agency',
    companyId: 'c1',
    companyName: 'Estate Group',
    avatarUrl: undefined,
  },
  {
    id: 'u3',
    name: 'Дмитрий Коваль',
    login: 'rop',
    password: '1',
    role: 'rop',
    accountType: 'agency',
    companyId: 'c1',
    companyName: 'Estate Group',
    avatarUrl: undefined,
  },
  {
    id: 'lm-1',
    name: 'Анна Первичкина',
    login: 'manager',
    password: '1',
    role: 'manager',
    accountType: 'agency',
    companyId: 'c1',
    companyName: 'Estate Group',
    avatarUrl: undefined,
  },
  {
    id: 'u-marketer',
    name: 'Олег Маркетов',
    login: 'marketer',
    password: '1',
    role: 'marketer',
    accountType: 'agency',
    companyId: 'c1',
    companyName: 'Estate Group',
    avatarUrl: undefined,
  },
  {
    id: 'u5',
    name: 'Админ Системы',
    login: 'admin',
    password: '1',
    role: 'owner',
    accountType: 'internal',
    companyId: 'platform',
    companyName: 'Платформа',
    avatarUrl: undefined,
  },
]

export type LoginResult = 'ok' | 'blocked' | 'invalid'

interface AuthContextValue {
  currentUser: CurrentUser | null
  login: (login: string, password: string) => LoginResult
  /** Войти в кабинет как выбранный тип и роль (демо, без пароля) */
  enterAs: (accountType: AccountType, role: UserRole) => void
  logout: () => void
  toggleBlockUser: (userId: string) => void
  isUserBlocked: (userId: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)
const AUTH_STORAGE_KEY = 'agency.auth.current-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
      return raw ? (JSON.parse(raw) as CurrentUser) : null
    } catch {
      return null
    }
  })
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      if (currentUser) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser))
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    } catch {
      // Ignore storage failures and keep auth state in memory.
    }
  }, [currentUser])

  function login(login: string, password: string): LoginResult {
    const normalizedLogin = login.trim().toLowerCase()
    const found = MOCK_USERS.find(
      (u) => u.login.toLowerCase() === normalizedLogin && u.password === password,
    )
    if (!found) return 'invalid'
    if (blockedUserIds.has(found.id)) return 'blocked'
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...user } = found
    setCurrentUser(user)
    return 'ok'
  }

  function toggleBlockUser(userId: string) {
    setBlockedUserIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  function isUserBlocked(userId: string): boolean {
    return blockedUserIds.has(userId)
  }

  function enterAs(accountType: AccountType, role: UserRole) {
    const companyName =
      accountType === 'internal' ? 'Платформа' : accountType === 'developer' ? 'Застройщик' : 'Estate Group'
      
    let id = `demo-${accountType}-${role}`
    let name = `${ROLE_LABEL[role]} · ${ACCOUNT_TYPE_LABEL[accountType]}`
    
    // Map demo agency manager strictly to our mock user for testing CRM history
    if (accountType === 'agency' && role === 'manager') {
      id = 'lm-1'
      name = 'Анна Первичкина'
    }

    setCurrentUser({
      id,
      name,
      login: 'demo',
      role,
      accountType,
      companyId: accountType === 'internal' ? 'platform' : 'c1',
      companyName,
      avatarUrl: undefined,
    })
  }

  function logout() {
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, enterAs, logout, toggleBlockUser, isUserBlocked }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
