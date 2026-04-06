import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const files = [
  'src/components/leads/LeadsCardTableView.tsx',
  'src/components/leads/LeadsPokerPage.tsx',
  'src/components/leads/LeadsAdminPage.tsx',
  'src/components/leads/LeadSettingsTab.tsx',
  'src/components/leads/LeadAnalyticsTab.tsx',
  'src/components/leads/LeadCloudTab.tsx',
  'src/components/leads/LeadsPokerTable.tsx',
  'src/components/leads/LeadManagersTab.tsx',
  'src/components/product/ProductPage.tsx',
  'src/components/analytics-network/funnel-kanban.tsx',
  'src/components/analytics-network/conversion-overview-chart.tsx',
  'src/components/tasks/CreateTaskModal.tsx',
  'src/components/tasks/TasksPage.tsx',
  'src/components/shared/EisenhowerChips.tsx',
  'src/components/mailings/MailingPreview.tsx',
  'src/components/mailings/MailingsEditor.tsx',
  'src/components/mailings/AudienceSelector.tsx',
  'src/components/dashboard/MyReportPage.tsx',
  'src/components/dashboard/MiniCalendar.tsx',
  'src/components/dashboard/WorkspaceDayEventsMenu.tsx',
  'src/components/dashboard/WorkspaceStreakPanel.tsx',
  'src/components/dashboard/DashboardWorkspace.tsx',
  'src/components/dashboard/DashboardPlaceholder.tsx',
  'src/components/ModuleHub.tsx',
  'src/components/layout/Sidebar.tsx',
  'src/components/deals/DealCardPage.tsx',
  'src/components/deals/DealsReportPage.tsx',
  'src/components/management/my-properties/StatusBadge.tsx',
  'src/components/management/my-properties/PropertyAlerts.tsx',
  'src/pages/SectionStubPage.tsx',
  'src/components/personnel/PersonnelPage.tsx',
  'src/components/team/TeamAccessPage.tsx',
  'src/components/team/TeamKpiPage.tsx',
  'src/components/partners/PartnerCardPage.tsx',
  'src/components/partners/PartnersListPage.tsx',
  'src/components/clients/CreateClientModal.tsx',
  'src/components/leads/leadAnalyticsShared.ts',
].map((f) => path.join(root, f))

const cssFiles = [path.join(root, 'src/components/leads/leads-secret-table.css')]

/** Longest keys first */
const pairs = [
  ['placeholder:text-[rgba(242,207,141,0.3)]', 'placeholder:text-[color:var(--shell-search-ph)]'],
  ['decoration-[rgba(242,207,141,0.25)]', 'decoration-[color:var(--hub-tile-icon-border)]'],
  ['focus:text-[color:var(--app-text)]', 'focus:text-[color:var(--app-text)]'],
  ['hover:text-[color:var(--app-text)]', 'hover:text-[color:var(--app-text)]'],
  ['text-[rgba(242,207,141,0.75)]', 'text-[color:var(--app-text-muted)]'],
  ['text-[rgba(242,207,141,0.8)]', 'text-[color:var(--app-text-muted)]'],
  ['text-[rgba(242,207,141,0.65)]', 'text-[color:var(--hub-body)]'],
  ['text-[rgba(242,207,141,0.7)]', 'text-[color:var(--theme-accent-link-dim)]'],
  ['text-[rgba(242,207,141,0.6)]', 'text-[color:var(--hub-badge-soon-fg)]'],
  ['text-[rgba(242,207,141,0.55)]', 'text-[color:var(--hub-stat-label)]'],
  ['text-[rgba(242,207,141,0.5)]', 'text-[color:var(--hub-desc)]'],
  ['text-[rgba(242,207,141,0.45)]', 'text-[color:var(--hub-stat-label)]'],
  ['text-[rgba(242,207,141,0.42)]', 'text-[color:var(--workspace-text-muted)]'],
  ['text-[rgba(242,207,141,0.4)]', 'text-[color:var(--workspace-text-muted)]'],
  ['text-[rgba(242,207,141,0.35)]', 'text-[color:var(--theme-accent-icon-dim)]'],
  ['text-[rgba(242,207,141,0.3)]', 'text-[color:var(--theme-accent-icon-dim)]'],
  ['text-[rgba(242,207,141,0.25)]', 'text-[color:var(--theme-accent-icon-dim)]'],
  ['text-[rgba(242,207,141,0.9)]', 'text-[color:var(--theme-accent-heading)]'],
  ['hover:text-[#fcecc8]', 'hover:text-[color:var(--app-text)]'],
  ['focus:text-[#fcecc8]', 'focus:text-[color:var(--app-text)]'],
  ['text-[#fcecc8]', 'text-[color:var(--app-text)]'],
  ['text-[#f2cf8d]', 'text-[color:var(--gold-light)]'],
  ['border-[rgba(242,207,141,0.5)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(242,207,141,0.45)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(242,207,141,0.4)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(242,207,141,0.35)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(242,207,141,0.3)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(242,207,141,0.25)]', 'border-[color:var(--hub-tile-icon-border)]'],
  ['border-[rgba(242,207,141,0.22)]', 'border-[color:var(--hub-card-border)]'],
  ['border-[rgba(242,207,141,0.2)]', 'border-[color:var(--hub-card-border)]'],
  ['border-[rgba(242,207,141,0.18)]', 'border-[color:var(--hub-card-border)]'],
  ['border-[rgba(242,207,141,0.16)]', 'border-[color:var(--hub-card-border)]'],
  ['border-[rgba(242,207,141,0.15)]', 'border-[color:var(--hub-card-border)]'],
  ['border-[rgba(242,207,141,0.14)]', 'border-[color:var(--hub-card-border)]'],
  ['border-[rgba(242,207,141,0.12)]', 'border-[color:var(--hub-tile-icon-border)]'],
  ['border-[rgba(242,207,141,0.1)]', 'border-[color:var(--hub-tile-icon-border)]'],
  ['border-[rgba(242,207,141,0.08)]', 'border-[color:var(--hub-card-border)]'],
  ['border-t border-[rgba(242,207,141,0.1)]', 'border-t border-[color:var(--hub-tile-icon-border)]'],
  ['border-b border-[rgba(242,207,141,0.1)]', 'border-b border-[color:var(--hub-tile-icon-border)]'],
  ['border-l border-[rgba(242,207,141,0.1)]', 'border-l border-[color:var(--hub-tile-icon-border)]'],
  ['border-r border-[rgba(242,207,141,0.1)]', 'border-r border-[color:var(--hub-tile-icon-border)]'],
  ['divide-[rgba(242,207,141,0.08)]', 'divide-[color:var(--hub-card-border)]'],
  ['divide-[rgba(242,207,141,0.06)]', 'divide-[color:var(--hub-card-border)]'],
  ['hover:border-[rgba(242,207,141,0.45)]', 'hover:border-[color:var(--hub-card-border-hover)]'],
  ['hover:border-[rgba(242,207,141,0.4)]', 'hover:border-[color:var(--hub-card-border-hover)]'],
  ['hover:border-[rgba(242,207,141,0.35)]', 'hover:border-[color:var(--hub-card-border-hover)]'],
  ['hover:border-[rgba(242,207,141,0.3)]', 'hover:border-[color:var(--hub-card-border-hover)]'],
  ['focus:border-[rgba(242,207,141,0.5)]', 'focus:border-[color:var(--hub-card-border-hover)]'],
  ['focus:ring-[rgba(242,207,141,0.2)]', 'focus:ring-[color:var(--hub-card-border)]'],
  ['focus:bg-[rgba(242,207,141,0.1)]', 'focus:bg-[var(--hub-tile-icon-bg)]'],
  ['bg-[rgba(242,207,141,0.22)]', 'bg-[var(--gold)]/22'],
  ['bg-[rgba(242,207,141,0.15)]', 'bg-[var(--nav-item-bg-active)]'],
  ['bg-[rgba(242,207,141,0.12)]', 'bg-[var(--nav-item-bg-active)]'],
  ['bg-[rgba(242,207,141,0.1)]', 'bg-[var(--hub-tile-icon-bg)]'],
  ['bg-[rgba(242,207,141,0.08)]', 'bg-[var(--nav-item-bg-active)]'],
  ['bg-[rgba(242,207,141,0.07)]', 'bg-[var(--hub-action-hover)]'],
  ['bg-[rgba(242,207,141,0.06)]', 'bg-[var(--hub-action-hover)]'],
  ['bg-[rgba(242,207,141,0.05)]', 'bg-[var(--hub-action-hover)]'],
  ['bg-[rgba(242,207,141,0.04)]', 'bg-[var(--hub-action-hover)]'],
  ['bg-[rgba(242,207,141,0.03)]', 'bg-[var(--hub-action-hover)]'],
  ['bg-[rgba(242,207,141,0.35)]', 'bg-[var(--gold)]/35'],
  ['bg-[rgba(242,207,141,0.3)]', 'bg-[var(--gold)]/30'],
  ['bg-[rgba(242,207,141,0.25)]', 'bg-[var(--gold)]/25'],
  ['hover:bg-[rgba(242,207,141,0.12)]', 'hover:bg-[var(--nav-item-bg-active)]'],
  ['hover:bg-[rgba(242,207,141,0.08)]', 'hover:bg-[var(--nav-item-bg-active)]'],
  ['hover:bg-[rgba(242,207,141,0.35)]', 'hover:bg-[var(--gold)]/35'],
  ['from-[rgba(242,207,141,0.08)]', 'from-[var(--gold)]/8'],
  ['to-[rgba(242,207,141,0.02)]', 'to-[var(--gold)]/2'],
  ['shadow-[rgba(242,207,141,0.15)]', 'shadow-[color:var(--hub-card-border)]'],
  ['ring-[rgba(242,207,141,0.2)]', 'ring-[color:var(--hub-card-border)]'],
  ['text-[#e6c364]', 'text-[color:var(--theme-accent-heading)]'],
  ['border-[#e6c364]', 'border-[color:var(--gold)]'],
  ['bg-[#e6c364]', 'bg-[var(--gold)]'],
  ['accent-[#e6c364]', 'accent-[var(--gold)]'],
  ['[#e6c364]', '[color:var(--theme-accent-heading)]'],
]

const pairs230 = [
  ['text-[rgba(230,195,100,0.85)]', 'text-[color:var(--theme-accent-link-dim)]'],
  ['text-[rgba(230,195,100,0.78)]', 'text-[color:var(--theme-accent-link-dim)]'],
  ['text-[rgba(230,195,100,0.72)]', 'text-[color:var(--theme-accent-link-dim)]'],
  ['text-[rgba(230,195,100,0.7)]', 'text-[color:var(--theme-accent-link-dim)]'],
  ['text-[rgba(230,195,100,0.62)]', 'text-[color:var(--hub-stat-label)]'],
  ['text-[rgba(230,195,100,0.58)]', 'text-[color:var(--hub-stat-label)]'],
  ['text-[rgba(230,195,100,0.55)]', 'text-[color:var(--hub-stat-label)]'],
  ['text-[rgba(230,195,100,0.52)]', 'text-[color:var(--hub-stat-label)]'],
  ['text-[rgba(230,195,100,0.5)]', 'text-[color:var(--hub-desc)]'],
  ['text-[rgba(230,195,100,0.48)]', 'text-[color:var(--hub-desc)]'],
  ['text-[rgba(230,195,100,0.46)]', 'text-[color:var(--hub-desc)]'],
  ['text-[rgba(230,195,100,0.45)]', 'text-[color:var(--hub-stat-label)]'],
  ['text-[rgba(230,195,100,0.4)]', 'text-[color:var(--workspace-text-muted)]'],
  ['text-[rgba(230,195,100,0.35)]', 'text-[color:var(--theme-accent-icon-dim)]'],
  ['text-[rgba(230,195,100,0.34)]', 'text-[color:var(--theme-accent-icon-dim)]'],
  ['text-[rgba(230,195,100,0.32)]', 'text-[color:var(--theme-accent-icon-dim)]'],
  ['text-[rgba(230,195,100,0.3)]', 'text-[color:var(--theme-accent-icon-dim)]'],
  ['text-[rgba(230,195,100,0.28)]', 'text-[color:var(--theme-accent-icon-dim)]'],
  ['border-[rgba(230,195,100,0.45)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(230,195,100,0.4)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(230,195,100,0.35)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(230,195,100,0.32)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(230,195,100,0.28)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(230,195,100,0.25)]', 'border-[color:var(--hub-tile-icon-border)]'],
  ['border-[rgba(230,195,100,0.22)]', 'border-[color:var(--hub-card-border)]'],
  ['border-[rgba(230,195,100,0.2)]', 'border-[color:var(--hub-card-border)]'],
  ['border-[rgba(230,195,100,0.18)]', 'border-[color:var(--hub-card-border)]'],
  ['border-[rgba(230,195,100,0.16)]', 'border-[color:var(--hub-card-border)]'],
  ['border-[rgba(230,195,100,0.14)]', 'border-[color:var(--hub-card-border)]'],
  ['border-[rgba(230,195,100,0.12)]', 'border-[color:var(--hub-tile-icon-border)]'],
  ['border-[rgba(230,195,100,0.1)]', 'border-[color:var(--hub-tile-icon-border)]'],
  ['hover:border-[rgba(230,195,100,0.4)]', 'hover:border-[color:var(--hub-card-border-hover)]'],
  ['hover:border-[rgba(230,195,100,0.35)]', 'hover:border-[color:var(--hub-card-border-hover)]'],
  ['hover:border-[rgba(230,195,100,0.28)]', 'hover:border-[color:var(--hub-card-border-hover)]'],
  ['bg-[rgba(230,195,100,0.15)]', 'bg-[var(--nav-item-bg-active)]'],
  ['bg-[rgba(230,195,100,0.12)]', 'bg-[var(--nav-item-bg-active)]'],
  ['bg-[rgba(230,195,100,0.1)]', 'bg-[var(--hub-tile-icon-bg)]'],
  ['bg-[rgba(230,195,100,0.08)]', 'bg-[var(--nav-item-bg-active)]'],
  ['bg-[rgba(230,195,100,0.07)]', 'bg-[var(--hub-action-hover)]'],
  ['bg-[rgba(230,195,100,0.06)]', 'bg-[var(--hub-tile-icon-bg)]'],
  ['bg-[rgba(230,195,100,0.05)]', 'bg-[var(--hub-action-hover)]'],
  ['bg-[rgba(230,195,100,0.04)]', 'bg-[var(--hub-action-hover)]'],
  ['hover:bg-[rgba(230,195,100,0.12)]', 'hover:bg-[var(--nav-item-bg-active)]'],
  ['hover:bg-[rgba(230,195,100,0.1)]', 'hover:bg-[var(--hub-tile-icon-bg)]'],
  ['hover:bg-[rgba(230,195,100,0.08)]', 'hover:bg-[var(--nav-item-bg-active)]'],
  ['from-[rgba(230,195,100,0.14)]', 'from-[var(--gold)]/14'],
  ['via-[rgba(230,195,100,0.06)]', 'via-[var(--gold)]/6'],
  ['to-[rgba(230,195,100,0.02)]', 'to-[var(--gold)]/2'],
  ['shadow-[0_0_0_1px_rgba(230,195,100,0.12)]', 'shadow-[0_0_0_1px_var(--hub-tile-icon-border)]'],
  ['shadow-[0_0_20px_rgba(230,195,100,0.06)]', 'shadow-[0_0_20px_var(--hub-action-hover)]'],
]

const pairsRound2 = [
  ['text-[rgba(242,207,141,0.85)]', 'text-[color:var(--app-text-muted)]'],
  ['hover:text-[rgba(242,207,141,0.85)]', 'hover:text-[color:var(--app-text-muted)]'],
  ['text-[rgba(242,207,141,0.62)]', 'text-[color:var(--hub-stat-label)]'],
  ['text-[rgba(242,207,141,0.64)]', 'text-[color:var(--hub-body)]'],
  ['border-[rgba(242,207,141,0.32)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['hover:border-[rgba(242,207,141,0.56)]', 'hover:border-[color:var(--hub-card-border-hover)]'],
  ['hover:border-[rgba(242,207,141,0.44)]', 'hover:border-[color:var(--hub-card-border-hover)]'],
  ['group-hover:border-[rgba(242,207,141,0.44)]', 'group-hover:border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(242,207,141,0.24)]', 'border-[color:var(--hub-card-border)]'],
  ['text-[rgba(252,236,200,0.86)]', 'text-[color:var(--app-text-muted)]'],
  ['ring-[rgba(242,207,141,0.6)]', 'ring-[color-mix(in_srgb,var(--gold)_60%,transparent)]'],
  ["ring-[rgba(242,207,141,1)]", 'ring-[var(--gold)]'],
  ['text-[rgba(242,207,141,0.2)]', 'text-[color:var(--hub-card-border)]'],
  ['placeholder:text-[rgba(242,207,141,0.2)]', 'placeholder:text-[color:var(--hub-card-border)]'],
  ['via-[rgba(242,207,141,0.5)]', 'via-[color-mix(in_srgb,var(--gold)_50%,transparent)]'],
  ['border-[rgba(242,207,141,0.13)]', 'border-[color:var(--hub-tile-icon-border)]'],
  ['bg-[rgba(242,207,141,0.18)]', 'bg-[color-mix(in_srgb,var(--gold)_18%,transparent)]'],
  ['text-[rgba(255,244,215,0.8)]', 'text-[color:var(--app-text-muted)]'],
  ['bg-[linear-gradient(180deg,rgba(242,207,141,0.14),rgba(242,207,141,0))]', 'bg-[linear-gradient(180deg,color-mix(in_srgb,var(--gold)_14%,transparent),transparent)]'],
  ['circle_at_top,rgba(242,207,141,0.08),', 'circle_at_top,color-mix(in_srgb,var(--gold)_8%,transparent),'],
]

/** Poker / bronze tokens used in LeadsCardTableView */
const pairsBronze = [
  ['border-[rgba(229,196,136,0.6)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(236,194,112,0.7)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(244,211,147,0.4)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['border-[rgba(244,214,150,0.55)]', 'border-[color:var(--hub-card-border-hover)]'],
  ['bg-[rgba(68,43,18,0.5)]', 'bg-[color-mix(in_srgb,var(--gold-dark)_45%,transparent)]'],
  ['bg-[rgba(68,43,18,0.78)]', 'bg-[color-mix(in_srgb,var(--gold-dark)_62%,transparent)]'],
  ['bg-[rgba(88,57,25,0.65)]', 'bg-[color-mix(in_srgb,var(--gold-dark)_55%,transparent)]'],
  ['bg-[rgba(88,57,25,0.88)]', 'bg-[color-mix(in_srgb,var(--gold-dark)_70%,transparent)]'],
  ['hover:bg-[rgba(88,57,25,0.88)]', 'hover:bg-[color-mix(in_srgb,var(--gold-dark)_70%,transparent)]'],
  ['hover:border-[rgba(236,194,112,0.7)]', 'hover:border-[color:var(--hub-card-border-hover)]'],
  ['hover:text-[#fff4d7]', 'hover:text-[color:var(--app-text)]'],
  ['text-[#fff4d7]', 'text-[color:var(--app-text)]'],
]

function apply(s, list) {
  let out = s
  for (const [a, b] of list) {
    if (a === b) continue
    out = out.split(a).join(b)
  }
  return out
}

for (const fp of files) {
  if (!fs.existsSync(fp)) {
    console.warn('skip missing', fp)
    continue
  }
  let s = fs.readFileSync(fp, 'utf8')
  const before = s
  s = apply(s, pairs)
  s = apply(s, pairs230)
  s = apply(s, pairsBronze)
  s = apply(s, pairsRound2)
  if (s !== before) {
    fs.writeFileSync(fp, s)
    console.log('patched', path.relative(root, fp))
  }
}

const cssPairs = [
  ['rgba(229, 196, 136, 0.2)', 'color-mix(in srgb, var(--gold) 22%, transparent)'],
  ['rgba(244, 205, 133, 0.45)', 'color-mix(in srgb, var(--gold-light) 45%, transparent)'],
  ['rgba(236, 194, 112, 0.18)', 'color-mix(in srgb, var(--gold) 18%, transparent)'],
  ['rgba(241, 213, 147, 0.2)', 'color-mix(in srgb, var(--gold-light) 20%, transparent)'],
  ['#f7ecd4', 'var(--app-text)'],
  ['#fff4d7', 'var(--app-text)'],
  ['#f7dc9d', 'var(--gold-light)'],
  ['rgba(243, 225, 188, 0.74)', 'color-mix(in srgb, var(--app-text) 74%, transparent)'],
]

for (const fp of cssFiles) {
  if (!fs.existsSync(fp)) continue
  let s = fs.readFileSync(fp, 'utf8')
  const before = s
  s = apply(s, cssPairs)
  if (s !== before) {
    fs.writeFileSync(fp, s)
    console.log('patched css', path.relative(root, fp))
  }
}

console.log('sprint-tokens done')
