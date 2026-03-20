import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  LayoutDashboard,
  Package,
  Users,
  GraduationCap,
  Settings,
  Users2,
  Building2,
  Handshake,
  DollarSign,
  Megaphone,
  AlertCircle,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useLeads } from '@/context/LeadsContext'
import { getDashboardBlocks } from '@/config/dashboard-blocks'
import type { DashboardBlockConfig } from '@/config/dashboard-blocks'
import { getAnalyticsData } from '@/lib/mock/analytics-network'
import { LEAD_STAGES, LEAD_STAGE_COLUMN } from '@/data/leads-mock'
import { cn } from '@/lib/utils'
import {
  INITIAL_CAMPAIGNS,
  formatDollars,
  formatDollarsCompact,
  getCampaignSummary,
} from '@/components/leads/leadAnalyticsShared'
import productHouseCrown from '@/assets/product-house-crown.png'
import personnelEmblem from '@/assets/personnel-emblem.png'
import leadsRoulette from '@/assets/leads-roulette.png'
import settingsGears from '@/assets/settings-gears.png'
import trainingBookCards from '@/assets/training-book-cards.png'

const ICON_MAP: Record<DashboardBlockConfig['icon'], LucideIcon> = {
  LayoutDashboard, Package, Users, GraduationCap, Settings,
}

const BLOCK_IMAGES: Partial<Record<string, string>> = {
  product: productHouseCrown,
  leads: leadsRoulette,
  personnel: personnelEmblem,
  training: trainingBookCards,
  settings: settingsGears,
}

const STAGE_NAME = Object.fromEntries(LEAD_STAGES.map((s) => [s.id, s.name]))

const SOURCE_LABEL: Record<string, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
  rent: 'Аренда',
  ad_campaigns: 'Реклама',
}

const SOURCE_CLASS: Record<string, string> = {
  primary: 'luxury-card-accent-sapphire',
  secondary: 'luxury-card-accent-ruby',
  rent: 'luxury-card-accent-emerald',
  ad_campaigns: 'luxury-card-accent-topaz',
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'только что'
  if (mins < 60) return `${mins} мин`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h} ч`
  return `${Math.floor(h / 24)} д`
}

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString()
}

function isWithin7Days(iso: string): boolean {
  return new Date(iso).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000
}

function isWithin30Days(iso: string): boolean {
  return new Date(iso).getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000
}

function isSuccessStage(stageId: string): boolean {
  return LEAD_STAGE_COLUMN[stageId] === 'success' || stageId === 'deal'
}

function formatUsd(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`
  return `$${usd}`
}

interface StatRow { value: string | number; label: string }

function StatCard({ icon: Icon, title, rows, accentClass }: {
  icon: LucideIcon; title: string; rows: [StatRow, StatRow]; accentClass: string
}) {
  return (
    <div className={cn('luxury-stat-card', accentClass)}>
      <div className="luxury-stat-header">
        <Icon size={13} strokeWidth={2} />
        <span>{title}</span>
      </div>
      <div className="luxury-stat-divider" />
      <div className="luxury-stat-rows">
        {rows.map((row) => (
          <div key={row.label} className="luxury-stat-row">
            <span className="luxury-stat-row-value">{row.value}</span>
            <span className="luxury-stat-row-label">{row.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NavCard({ block }: { block: DashboardBlockConfig }) {
  const navigate = useNavigate()
  const Icon = ICON_MAP[block.icon]
  const imgSrc = BLOCK_IMAGES[block.id]

  return (
    <button
      type="button"
      onClick={() => navigate(block.route)}
      className={cn('luxury-nav-card', block.gemColor && `luxury-card-accent-${block.gemColor}`)}
    >
      <span className="luxury-nav-card-img-wrap">
        {imgSrc
          ? <img src={imgSrc} alt="" className="luxury-nav-card-img" />
          : <Icon className="luxury-card-icon" strokeWidth={1.6} />}
      </span>
      <p className="luxury-nav-card-label">{block.label}</p>
      <span className="luxury-card-gem-line" aria-hidden />
      <span className="luxury-card-action">
        Открыть <ArrowRight size={11} strokeWidth={2.5} />
      </span>
    </button>
  )
}

export function MainScreen() {
  const { currentUser } = useAuth()
  const { state } = useLeads()
  const accountType = currentUser?.accountType ?? 'agency'
  const isMarketer = currentUser?.role === 'marketer'
  const isManager = currentUser?.role === 'manager'
  const managerId = isManager ? currentUser?.id ?? null : null
  const blocks = getDashboardBlocks(accountType)

  const pool = managerId
    ? state.leadPool.filter((l) => l.managerId === managerId)
    : state.leadPool

  const weekAnalytics = getAnalyticsData('week')
  const monthAnalytics = getAnalyticsData('month')

  const leadsToday   = pool.filter((l) => isToday(l.createdAt)).length
  const leadsWeek   = pool.filter((l) => isWithin7Days(l.createdAt)).length
  const listingsWeek = isManager ? 0 : weekAnalytics.dynamicKpi.addedListings
  const dealsMonth   = isManager
    ? pool.filter((l) => isSuccessStage(l.stageId) && isWithin30Days(l.createdAt)).length
    : monthAnalytics.dynamicKpi.deals
  const dealsTotal   = isManager
    ? pool.filter((l) => isSuccessStage(l.stageId)).length
    : weekAnalytics.staticKpi.totalDeals
  const pipelineUsd  = pool.reduce((s, l) => s + (l.commissionUsd ?? 0), 0)
  const avgCommission = pool.length > 0 ? Math.round(pipelineUsd / pool.length) : 0
  const marketingStats = getCampaignSummary(INITIAL_CAMPAIGNS)

  const recentLeads  = [...pool]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
  const overdueTasks = pool.filter((l) => l.taskOverdue)
  const pendingTasks = pool.filter((l) => l.hasTask && !l.taskOverdue)

  return (
    <div className="luxury-main-wrap">
      <div className="luxury-main-inner">
        <div className="luxury-main-glow luxury-main-glow-tl" aria-hidden />
        <div className="luxury-main-glow luxury-main-glow-br" aria-hidden />

        <header className="luxury-main-header">
          <span className="luxury-main-bread">РАЗДЕЛЫ</span>
          <span className="luxury-main-bread-sep">/</span>
          <span className="luxury-main-bread-current">Главный экран</span>
        </header>

        {/* Двухколоночная сетка */}
        <div className="luxury-body-grid">

          {/* ── Левая колонка: статы + навигация ── */}
          <div className="luxury-left-col">
            <div className="luxury-stats-grid">
              <StatCard
                icon={Users2} title="Лиды"
                rows={[{ value: leadsToday, label: 'сегодня' }, { value: leadsWeek, label: 'за 7 дней' }]}
                accentClass="luxury-card-accent-sapphire"
              />
              {!isManager && (
                <StatCard
                  icon={Building2} title="Объекты"
                  rows={[{ value: `+${Math.round(listingsWeek / 7)}`, label: 'добавлено сегодня' }, { value: `+${listingsWeek}`, label: 'за 7 дней' }]}
                  accentClass="luxury-card-accent-ruby"
                />
              )}
              <StatCard
                icon={Handshake} title="Сделки"
                rows={[{ value: dealsMonth, label: 'за месяц' }, { value: dealsTotal, label: 'всего закрыто' }]}
                accentClass="luxury-card-accent-topaz"
              />
              {isMarketer ? (
                    <StatCard
                  icon={Megaphone} title="Реклама"
                  rows={[
                    { value: formatDollarsCompact(marketingStats.totalSpent), label: `израсходовано (${marketingStats.budgetUsedPct}% бюджета)` },
                    { value: formatDollars(marketingStats.avgCpl), label: 'средний CPL' },
                  ]}
                  accentClass="luxury-card-accent-emerald"
                />
              ) : (
                <StatCard
                  icon={DollarSign} title="Комиссии"
                  rows={[{ value: formatUsd(pipelineUsd), label: 'с начала месяца' }, { value: formatUsd(avgCommission), label: 'средний чек' }]}
                  accentClass="luxury-card-accent-emerald"
                />
              )}
            </div>

            <div className="luxury-main-section-label">
              <span>Навигация</span>
            </div>

            <div className="luxury-cards-grid">
              {blocks.map((block) => <NavCard key={block.id} block={block} />)}
            </div>
          </div>

          {/* ── Правая колонка: задачи + последние лиды ── */}
          <div className="luxury-right-col">

            {/* Задачи */}
            <div className="luxury-widget-card">
              <div className="luxury-widget-header">
                <ClipboardList size={13} strokeWidth={2} />
                <span>Задачи</span>
              </div>
              <div className="luxury-tasks-body">
                <div className="luxury-tasks-summary">
                  <div className="luxury-tasks-count luxury-tasks-overdue">
                    <AlertCircle size={15} strokeWidth={1.8} />
                    <span className="luxury-tasks-count-value">{overdueTasks.length}</span>
                    <span className="luxury-tasks-count-label">просрочено</span>
                  </div>
                  <div className="luxury-tasks-count luxury-tasks-pending">
                    <ClipboardList size={15} strokeWidth={1.8} />
                    <span className="luxury-tasks-count-value">{pendingTasks.length}</span>
                    <span className="luxury-tasks-count-label">активных</span>
                  </div>
                </div>
                <div className="luxury-overdue-list">
                  {overdueTasks.slice(0, 4).map((lead) => (
                    <div key={lead.id} className="luxury-overdue-row">
                      <span className="luxury-overdue-name">{lead.name ?? '—'}</span>
                      <span className="luxury-overdue-stage">{STAGE_NAME[lead.stageId] ?? lead.stageId}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Последние лиды */}
            <div className="luxury-widget-card luxury-widget-card--flex">
              <div className="luxury-widget-header">
                <Users2 size={13} strokeWidth={2} />
                <span>Последние лиды</span>
              </div>
              <div className="luxury-leads-list">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className={cn('luxury-lead-row', SOURCE_CLASS[lead.source])}>
                    <span className="luxury-lead-source">{SOURCE_LABEL[lead.source] ?? lead.source}</span>
                    <span className="luxury-lead-info">
                      <span className="luxury-lead-name">{lead.name ?? '—'}</span>
                      <span className="luxury-lead-stage">{STAGE_NAME[lead.stageId] ?? lead.stageId}</span>
                    </span>
                    <span className="luxury-lead-time">{timeAgo(lead.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
