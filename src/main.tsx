import { type ReactNode, Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom'
import { DashboardProvider } from '@/context/DashboardContext'
import { LeadsProvider } from '@/context/LeadsContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { NewsFeedProvider } from '@/context/NewsFeedContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { MockProvider } from '@/providers/MockProvider'
import { LoadingProvider } from '@/providers/LoadingProvider'
import App from './App'
import HomePage from '@/pages/HomePage'
import { DashboardAccessDeniedPage } from '@/pages/DashboardAccessDeniedPage'
import { OverviewGuard } from '@/components/dashboard/OverviewGuard'
import { MyReportPage } from '@/components/dashboard/MyReportPage'
import { CityPage } from '@/components/city/CityPage'
import { CityMailingsPage } from '@/components/city/CityMailingsPage'
import { SupremeOwnerDashboardPage } from '@/components/owner/SupremeOwnerDashboardPage'
import { ProductPage } from '@/components/product/ProductPage'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { LeadsAdminPage } from '@/components/leads/LeadsAdminPage'
import { LeadsPokerPage } from '@/components/leads/LeadsPokerPage'
import { RuntimeErrorBoundary } from '@/components/common/RuntimeErrorBoundary'
import {
  LeadsErrorBoundary,
  DashboardErrorBoundary,
  ProductErrorBoundary,
  SettingsErrorBoundary,
} from '@/components/common/ModuleErrorBoundary'
import { AgencyOnboarding } from '@/components/onboarding/AgencyOnboarding'
import { LoginPage } from '@/components/auth/LoginPage'
import { LMSPage } from '@/components/lms/LMSPage'
import { MyPropertiesPage } from '@/components/management/my-properties/MyPropertiesPage'
import { ClientsListPage } from '@/components/clients/ClientsListPage'
import { ClientCardPage } from '@/components/clients/ClientCardPage'
import { DealsKanbanPage } from '@/components/deals/DealsKanbanPage'
import { DealCardPage } from '@/components/deals/DealCardPage'
import { DealsReportPage } from '@/components/deals/DealsReportPage'
import { TasksPage as TasksPageFull } from '@/components/tasks/TasksPage'
import { BookingsPage as BookingsPageFull } from '@/components/bookings/BookingsPage'
import { CalendarPage as CalendarPageFull } from '@/components/calendar/CalendarPage'
import { PartnersListPage } from '@/components/partners/PartnersListPage'
import { PartnerCardPage } from '@/components/partners/PartnerCardPage'
import { TeamOrgPage } from '@/components/team/TeamOrgPage'
import { TeamAccessPage } from '@/components/team/TeamAccessPage'
import BranchesPage from '@/components/team/BranchesPage'
import { NotificationsSettingsPage } from '@/components/settings/NotificationsSettingsPage'
import { ThemeSettingsPage } from '@/components/settings/ThemeSettingsPage'
import { TariffPage } from '@/components/settings/TariffPage'
import { NewsPage } from '@/components/info/NewsPage'
import { RemindersPage } from '@/components/info/RemindersPage'
import { ObjectsListPage } from '@/components/objects/ObjectsListPage'
import { ObjectCardPage } from '@/components/objects/ObjectCardPage'
import { CoursePage } from '@/components/lms/CoursePage'
import { LessonPage } from '@/components/lms/LessonPage'
import { TestPage } from '@/components/lms/TestPage'
import { SelectionsListPage } from '@/components/selections/SelectionsListPage'
import { SelectionCardPage } from '@/components/selections/SelectionCardPage'
import { SelectionsNewPage } from '@/components/selections/SelectionsNewPage'
import { SelectionsHubPage } from '@/components/selections/SelectionsHubPage'
import MarketplacePage from '@/pages/modules/MarketplacePage'
import CRMPage from '@/pages/modules/CRMPage'
import DashboardsPage from '@/pages/modules/DashboardsPage'
import LeadsHubPage from '@/pages/modules/LeadsHubPage'
import ClientsPage from '@/pages/modules/ClientsPage'
import PartnersMlmAnalyticsPage from '@/pages/modules/PartnersMlmAnalyticsPage'
import MlsHubPage from '@/pages/modules/MlsHubPage'
import FinanceHubPage from '@/pages/modules/FinanceHubPage'
import CommunityHubPage from '@/pages/modules/CommunityHubPage'
import NewBuildingsHubPage from '@/pages/modules/NewBuildingsHubPage'
import ObjectsPage from '@/pages/modules/ObjectsPage'
import BookingsHubPage from '@/pages/modules/BookingsHubPage'
import DealsPage from '@/pages/modules/DealsPage'
import TasksHubPage from '@/pages/modules/TasksHubPage'
import CalendarPage from '@/pages/modules/CalendarPage'
import TeamPage from '@/pages/modules/TeamPage'
import LearningPage from '@/pages/modules/LearningPage'
import InfoPage from '@/pages/modules/InfoPage'
import SettingsHubPage from '@/pages/modules/SettingsHubPage'
import SettingsNewsMailingsHubPage from '@/pages/modules/SettingsNewsMailingsHubPage'
import NewsManagementSettingsPage from '@/pages/modules/NewsManagementSettingsPage'
import MailingsManagementSettingsPage from '@/pages/modules/MailingsManagementSettingsPage'
import RegistrationsPage from '@/components/newbuild/RegistrationsPage'
import NewBuildingsCatalogPage from '@/components/newbuild/NewBuildingsCatalogPage'
import NewBuildingsObjectsCommissionsPage from '@/components/newbuild/NewBuildingsObjectsCommissionsPage'
import NewBuildingsPartnersPage from '@/components/newbuild/NewBuildingsPartnersPage'
import PrimaryPartnersReportPage from '@/components/newbuild/PrimaryPartnersReportPage'
import NewBuildingsBookingsRegistrationsPage from '@/pages/modules/NewBuildingsBookingsRegistrationsPage'
import ManagerReportPage from '@/components/reports/ManagerReportPage'
import TeamReportPage from '@/components/reports/TeamReportPage'
import ReportsRegistryPage from '@/components/reports/ReportsRegistryPage'
import AgencyStatusesPage from '@/components/settings/AgencyStatusesPage'
import FinancePanelPage from '@/components/finance/FinancePanelPage'
import FinanceReportPage from '@/components/finance/FinanceReportPage'
import CommunityPanelPage from '@/components/community/CommunityPanelPage'
import CommunityPartnersReportPage from '@/components/community/CommunityPartnersReportPage'
import MlsSecondaryPage from '@/components/mls/MlsSecondaryPage'
import MlsVerificationSecondaryPage from '@/components/mls/MlsVerificationSecondaryPage'
import MlsRentPage from '@/components/mls/MlsRentPage'
import MlsVerificationRentPage from '@/components/mls/MlsVerificationRentPage'
import MlsSummaryReportPage from '@/components/mls/MlsSummaryReportPage'
import MlsPartnersSecondaryReportPage from '@/components/mls/MlsPartnersSecondaryReportPage'
import MlsPartnersRentReportPage from '@/components/mls/MlsPartnersRentReportPage'
import DocumentsPage from '@/components/crm/DocumentsPage'
import ObjectsReportPage from '@/components/objects/ObjectsReportPage'
import AutomationTriggersPage from '@/components/settings/AutomationTriggersPage'
import AiAutomationsPage from '@/components/settings/AiAutomationsPage'
import SystemSettingsPage from '@/components/settings/SystemSettingsPage'
import LeadSourcesPage from '@/components/leads/LeadSourcesPage'
import LeadsGeneralReportPage from '@/components/leads/LeadsGeneralReportPage'
import LeadsMarketingReportPage from '@/components/leads/LeadsMarketingReportPage'
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/500.css'
import '@fontsource/montserrat/600.css'
import '@fontsource/montserrat/700.css'
import './index.css'

function LegacySelectionCardRedirect() {
  const { selectionId } = useParams<{ selectionId: string }>()
  const to = selectionId
    ? `/dashboard/objects/selections/${selectionId}`
    : '/dashboard/objects/selections'
  return <Navigate to={to} replace />
}

function RequireAuth() {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/" replace />
  return <Outlet />
}

function EntryRoute() {
  const { currentUser } = useAuth()
  if (currentUser) return <Navigate to="/dashboard" replace />
  return <LoginPage />
}

class RootErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('RootErrorBoundary:', error)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "'Montserrat', sans-serif", maxWidth: 560 }}>
          <h2 style={{ color: '#b91c1c' }}>Ошибка загрузки приложения</h2>
          <p style={{ marginTop: 8, color: '#374151' }}>{this.state.error.message}</p>
          <p style={{ marginTop: 16, fontSize: 14, color: '#6b7280' }}>
            Откройте консоль браузера (F12 → Console), чтобы увидеть подробности.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <AuthProvider>
        <MockProvider>
          <LoadingProvider>
            <HashRouter>
              <ThemeProvider>
                <DashboardProvider>
                  <LeadsProvider>
                    <Routes>
                      {/* Публичные маршруты */}
                      <Route element={<Outlet />}>
                        <Route path="/" element={<EntryRoute />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<AgencyOnboarding />} />
                        <Route path="/register/agency" element={<AgencyOnboarding />} />
                      </Route>

                      {/* Защищённые маршруты */}
                      <Route element={<RequireAuth />}>
                        <Route path="/dashboard" element={<NewsFeedProvider><App /></NewsFeedProvider>}>
                          {/* Главный экран — наша новая HomePage */}
                          <Route index element={<DashboardErrorBoundary><HomePage /></DashboardErrorBoundary>} />
                          <Route path="access-denied" element={<DashboardAccessDeniedPage />} />

                          {/* Hub-страницы 15 модулей */}
                          <Route path="marketplace" element={<MarketplacePage />} />
                          <Route path="new-buildings" element={<Outlet />}>
                            <Route index element={<NewBuildingsHubPage />} />
                            <Route
                              path="objects"
                              element={<NewBuildingsObjectsCommissionsPage />}
                            />
                            <Route
                              path="bookings-registrations"
                              element={<NewBuildingsBookingsRegistrationsPage />}
                            />
                            <Route path="registration" element={<RegistrationsPage />} />
                            <Route
                              path="catalog"
                              element={<NewBuildingsCatalogPage />}
                            />
                            <Route
                              path="partners"
                              element={<NewBuildingsPartnersPage />}
                            />
                            <Route
                              path="report-partners"
                              element={<PrimaryPartnersReportPage />}
                            />
                            <Route path="selections" element={<SelectionsHubPage market="newbuild" />} />
                            <Route path="selections/list" element={<SelectionsListPage />} />
                            <Route path="selections/new" element={<SelectionsNewPage />} />
                            <Route path="selections/:selectionId" element={<SelectionCardPage />} />
                          </Route>
                          <Route path="finance" element={<Outlet />}>
                            <Route index element={<FinanceHubPage />} />
                            <Route
                              path="panel"
                              element={<FinancePanelPage />}
                            />
                            <Route
                              path="report"
                              element={<FinanceReportPage />}
                            />
                          </Route>
                          <Route path="community" element={<Outlet />}>
                            <Route index element={<CommunityHubPage />} />
                            <Route
                              path="panel"
                              element={<CommunityPanelPage />}
                            />
                            <Route
                              path="partners"
                              element={<Navigate to="/dashboard/partners/list" replace />}
                            />
                            <Route
                              path="report"
                              element={<CommunityPartnersReportPage />}
                            />
                          </Route>
                          <Route
                            path="crm/documents"
                            element={<DocumentsPage />}
                          />
                          <Route path="crm" element={<CRMPage />} />
                          <Route path="dashboards" element={<DashboardsPage />} />
                          <Route path="leads-hub" element={<LeadsHubPage />} />
                          <Route path="clients" element={<ClientsPage />} />
                          <Route path="clients/list" element={<ClientsListPage />} />
                          <Route path="clients/:clientId" element={<ClientCardPage />} />
                          <Route path="deals/kanban" element={<DealsKanbanPage />} />
                          <Route path="deals/report" element={<DealsReportPage />} />
                          <Route path="deals/:dealId" element={<DealCardPage />} />
                          <Route path="tasks/new" element={<TasksPageFull />} />
                          <Route path="tasks/my" element={<TasksPageFull />} />
                          <Route path="tasks/team" element={<TasksPageFull />} />
                          <Route path="tasks/auto" element={<TasksPageFull />} />
                          <Route path="bookings/register-client" element={<BookingsPageFull />} />
                          <Route path="bookings/register-buyer" element={<BookingsPageFull />} />
                          <Route path="bookings/client" element={<BookingsPageFull />} />
                          <Route path="bookings/apartment" element={<BookingsPageFull />} />
                          <Route path="bookings/history" element={<BookingsPageFull />} />
                          <Route path="calendar/personal" element={<CalendarPageFull />} />
                          <Route path="calendar/team" element={<CalendarPageFull />} />
                          <Route path="mls" element={<Outlet />}>
                            <Route index element={<MlsHubPage />} />
                            <Route
                              path="secondary"
                              element={<MlsSecondaryPage />}
                            />
                            <Route
                              path="verification-secondary"
                              element={<MlsVerificationSecondaryPage />}
                            />
                            <Route
                              path="rent"
                              element={<MlsRentPage />}
                            />
                            <Route
                              path="verification-rent"
                              element={<MlsVerificationRentPage />}
                            />
                            <Route
                              path="reports/summary"
                              element={<MlsSummaryReportPage />}
                            />
                            <Route
                              path="reports/partners-secondary"
                              element={<MlsPartnersSecondaryReportPage />}
                            />
                            <Route
                              path="reports/partners-rent"
                              element={<MlsPartnersRentReportPage />}
                            />
                          </Route>
                          <Route path="partners" element={<Navigate to="/dashboard/partners/list" replace />} />
                          <Route path="partners/mlm" element={<PartnersMlmAnalyticsPage />} />
                          <Route path="partners/list" element={<PartnersListPage />} />
                          <Route path="partners/:partnerId" element={<PartnerCardPage />} />
                          <Route path="selections" element={<Navigate to="/dashboard/objects/selections" replace />} />
                          <Route path="selections/list" element={<Navigate to="/dashboard/objects/selections/list" replace />} />
                          <Route path="selections/new" element={<Navigate to="/dashboard/objects/selections/new" replace />} />
                          <Route path="selections/:selectionId" element={<LegacySelectionCardRedirect />} />
                          <Route path="objects" element={<ObjectsPage />} />
                          <Route path="objects/selections" element={<SelectionsHubPage market="secondary" />} />
                          <Route path="objects/selections/list" element={<SelectionsListPage />} />
                          <Route path="objects/selections/new" element={<SelectionsNewPage />} />
                          <Route path="objects/selections/:selectionId" element={<SelectionCardPage />} />
                          <Route path="objects/list" element={<ObjectsListPage />} />
                          <Route
                            path="objects/report"
                            element={<ObjectsReportPage />}
                          />
                          <Route path="objects/:propertyId" element={<ObjectCardPage />} />
                          <Route path="bookings" element={<BookingsHubPage />} />
                          <Route path="deals" element={<DealsPage />} />
                          <Route path="tasks" element={<TasksHubPage />} />
                          <Route path="calendar" element={<CalendarPage />} />
                          <Route path="team" element={<TeamPage />} />
                          <Route path="team/org" element={<TeamOrgPage />} />
                          <Route path="team/branches" element={<BranchesPage />} />
                          <Route path="team/kpi" element={<TeamReportPage />} />
                          <Route path="team/access" element={<TeamAccessPage />} />
                          <Route path="reports/registry" element={<ReportsRegistryPage />} />
                          <Route path="reports/manager" element={<ManagerReportPage />} />
                          <Route path="reports/team" element={<TeamReportPage />} />
                          <Route path="learning" element={<LearningPage />} />
                          <Route path="lms/browse" element={<LMSPage />} />
                          <Route path="lms/add" element={<LMSPage />} />
                          <Route path="lms/course/:courseId" element={<CoursePage />} />
                          <Route path="lms/lesson/:lessonId" element={<LessonPage />} />
                          <Route path="lms/test/:lessonId" element={<TestPage />} />
                          <Route path="info" element={<Navigate to="/dashboard/settings/info" replace />} />
                          <Route path="info/news" element={<Navigate to="/dashboard/settings/info/news" replace />} />
                          <Route path="info/reminders" element={<Navigate to="/dashboard/settings/info/reminders" replace />} />
                          <Route path="settings/info" element={<InfoPage />} />
                          <Route path="settings/info/news" element={<NewsPage />} />
                          <Route path="settings/info/reminders" element={<RemindersPage />} />
                          <Route path="settings-hub" element={<SettingsHubPage />} />
                          <Route path="settings/pipeline" element={<Navigate to="/dashboard/settings-hub" replace />} />
                          <Route
                            path="settings/automation"
                            element={<AutomationTriggersPage />}
                          />
                          <Route
                            path="settings/ai-automation"
                            element={<AiAutomationsPage />}
                          />
                          <Route
                            path="settings/agency-statuses"
                            element={<AgencyStatusesPage />}
                          />
                          <Route
                            path="settings/system"
                            element={<SystemSettingsPage />}
                          />
                          <Route path="settings/notifications" element={<NotificationsSettingsPage />} />
                          <Route path="settings/theme" element={<ThemeSettingsPage />} />
                          <Route path="settings/tariff" element={<TariffPage />} />
                          <Route path="settings/news-mailings" element={<SettingsNewsMailingsHubPage />} />
                          <Route path="settings/news-mailings/news" element={<NewsManagementSettingsPage />} />
                          <Route path="settings/news-mailings/mailings" element={<MailingsManagementSettingsPage />} />

                          {/* Рабочие страницы из agency */}
                          <Route path="overview" element={<DashboardErrorBoundary><OverviewGuard /></DashboardErrorBoundary>} />
                          <Route path="my-report" element={<MyReportPage />} />
                          <Route
                            path="leads/sources"
                            element={<LeadSourcesPage />}
                          />
                          <Route
                            path="leads/report/general"
                            element={<LeadsGeneralReportPage />}
                          />
                          <Route
                            path="leads/report/marketing"
                            element={<LeadsMarketingReportPage />}
                          />
                          <Route path="leads" element={<LeadsErrorBoundary><RuntimeErrorBoundary><LeadsAdminPage /></RuntimeErrorBoundary></LeadsErrorBoundary>} />
                          <Route path="leads/poker" element={<LeadsErrorBoundary><RuntimeErrorBoundary><LeadsPokerPage /></RuntimeErrorBoundary></LeadsErrorBoundary>} />
                          <Route path="leads/analytics" element={<Navigate to="/dashboard/leads" replace />} />
                          <Route path="my-properties" element={<MyPropertiesPage />} />
                          <Route path="personnel" element={<Navigate to="/dashboard/team/org" replace />} />
                          <Route path="lms" element={<Navigate to="/dashboard/learning" replace />} />
                          <Route
                            path="settings/branding"
                            element={(
                              <SettingsErrorBoundary>
                                <SettingsPage key="settings-branding" initialSection="branding" />
                              </SettingsErrorBoundary>
                            )}
                          />
                          <Route
                            path="settings"
                            element={(
                              <SettingsErrorBoundary>
                                <SettingsPage key="settings-root" />
                              </SettingsErrorBoundary>
                            )}
                          />
                          <Route path="product" element={<ProductErrorBoundary><RuntimeErrorBoundary><ProductPage /></RuntimeErrorBoundary></ProductErrorBoundary>} />
                          <Route path="city/:cityId" element={<CityPage />} />
                          <Route path="city/:cityId/mailings" element={<CityMailingsPage />} />
                          <Route path="city/:cityId/partner" element={<RuntimeErrorBoundary><SupremeOwnerDashboardPage /></RuntimeErrorBoundary>} />
                          <Route path="city/:cityId/partner/:partnerId" element={<RuntimeErrorBoundary><SupremeOwnerDashboardPage /></RuntimeErrorBoundary>} />
                        </Route>
                      </Route>

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </LeadsProvider>
                </DashboardProvider>
              </ThemeProvider>
            </HashRouter>
          </LoadingProvider>
        </MockProvider>
      </AuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
)
