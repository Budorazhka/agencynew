import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Users, GraduationCap, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  getDashboardBlocks,
  getActiveBlockId,
} from '@/config/dashboard-blocks'
import type { DashboardBlockConfig } from '@/config/dashboard-blocks'

const SIDEBAR_ICONS: Record<DashboardBlockConfig['icon'], typeof LayoutDashboard> = {
  LayoutDashboard,
  Package,
  Users,
  GraduationCap,
  Settings,
}

interface SidebarProps {
  /** Тема «сукно»: сайдбар и контент в стиле лидов / internal */
  useFeltStyle?: boolean
}

export function Sidebar({ useFeltStyle = false }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, logout } = useAuth()
  const accountType = currentUser?.accountType ?? 'agency'
  const blocks = getDashboardBlocks(accountType)
  const activeId = getActiveBlockId(location.pathname, accountType)
  const isOnDashboardIndex = location.pathname === '/dashboard' || location.pathname === '/dashboard/'

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <aside
      className={cn(
        'flex w-16 shrink-0 flex-col items-center gap-1 border-r py-4',
        useFeltStyle ? 'sidebar-leads' : 'border-slate-200/80 bg-sidebar-bg',
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={cn(
              'relative flex size-10 items-center justify-center rounded-xl transition-colors',
              useFeltStyle
                ? 'text-[#e8dcc4] hover:bg-[rgba(68,43,18,0.5)] hover:text-[#fcecc8]'
                : isOnDashboardIndex
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
            )}
          >
            {isOnDashboardIndex && !useFeltStyle && (
              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-slate-400" />
            )}
            <LayoutDashboard className="size-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Главная</TooltipContent>
      </Tooltip>

      {blocks.map((block) => {
        const Icon = SIDEBAR_ICONS[block.icon]
        const isActive = activeId === block.id
        return (
          <Tooltip key={block.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => navigate(block.route)}
                className={cn(
                  'relative flex size-10 items-center justify-center rounded-xl transition-colors',
                  useFeltStyle
                    ? isActive
                      ? 'bg-[rgba(236,194,112,0.22)] text-[#fcecc8]'
                      : 'text-[#e8dcc4] hover:bg-[rgba(68,43,18,0.5)] hover:text-[#fcecc8]'
                    : isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
                )}
              >
                {isActive && (
                  <span
                    className={cn(
                      'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full',
                      useFeltStyle ? 'bg-[rgba(236,194,112,0.7)]' : 'bg-slate-400',
                    )}
                  />
                )}
                <Icon className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{block.label}</TooltipContent>
          </Tooltip>
        )
      })}

      <div className="flex-1" />

      {currentUser && (
        <div className="flex flex-col items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                  useFeltStyle
                    ? 'bg-[rgba(242,207,141,0.2)] text-[#fcecc8]'
                    : 'bg-slate-200 text-slate-700',
                )}
              >
                {currentUser.name.charAt(0)}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              {currentUser.name}<br />
              <span className="text-xs opacity-70">{currentUser.role}</span>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg transition-colors',
                  useFeltStyle
                    ? 'text-[rgba(242,207,141,0.5)] hover:text-[#fcecc8] hover:bg-[rgba(68,43,18,0.5)]'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
                )}
              >
                <LogOut className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Выйти</TooltipContent>
          </Tooltip>
        </div>
      )}
    </aside>
  )
}
