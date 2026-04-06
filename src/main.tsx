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
import { SectionStubPage } from '@/pages/SectionStubPage'
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
import { TeamKpiPage } from '@/components/team/TeamKpiPage'
import { TeamAccessPage } from '@/components/team/TeamAccessPage'
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
                              element={(
                                <SectionStubPage
                                  title="Объекты и комиссии"
                                  subtitle="Списки объектов первички, комиссионные сетки и привязка к сделкам. Раздел в разработке до подключения API."
                                />
                              )}
                            />
                            <Route
                              path="bookings-registrations"
                              element={(
                                <SectionStubPage
                                  title="Брони и регистрации"
                                  subtitle="Сводная панель по бронированиям и регистрациям. Операционный модуль — раздел «Брони» в этом же контуре."
                                />
                              )}
                            />
                            <Route
                              path="catalog"
                              element={(
                                <SectionStubPage
                                  title="Каталог ЖК"
                                  subtitle="Жилые комплексы, юниты и статусы лотов. Отдельно от вторички; данные появятся после интеграции API."
                                />
                              )}
                            />
                            <Route
                              path="partners"
                              element={(
                                <SectionStubPage
                                  title="Партнёры первичного рынка"
                                  subtitle="Застройщики, контакты и условия сотрудничества. Наполнение после интеграции CRM и партнёрского контура."
                                />
                              )}
                            />
                            <Route
                              path="report-partners"
                              element={(
                                <SectionStubPage
                                  title="Отчёт: работа партнёров по первичке"
                                  subtitle="Выгрузки и дашборды по партнёрам и застройщикам первичного рынка. Подключение к API на следующих этапах."
                                />
                              )}
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
                              element={(
                                <SectionStubPage
                                  title="Финансы"
                                  subtitle="Панель управления: табличный учёт операций — п. 6.8 ТЗ; данные подключатся к API."
                                />
                              )}
                            />
                            <Route
                              path="report"
                              element={(
                                <SectionStubPage
                                  title="Отчёт по финансам"
                                  subtitle="Сводки и выгрузки по финансовому контуру — п. 6.8 ТЗ."
                                />
                              )}
                            />
                          </Route>
                          <Route path="community" element={<Outlet />}>
                            <Route index element={<CommunityHubPage />} />
                            <Route
                              path="panel"
                              element={(
                                <SectionStubPage
                                  title="Сообщество"
                                  subtitle="Панель управления: лента и коммуникации партнёров — п. 6.9 ТЗ."
                                />
                              )}
                            />
                            <Route
                              path="partners"
                              element={<Navigate to="/dashboard/partners/list" replace />}
                            />
                            <Route
                              path="report"
                              element={(
                                <SectionStubPage
                                  title="Отчёт: о формировании сообщества партнёров"
                                  subtitle="Метрики роста и вовлечённости сети — п. 6.9 ТЗ."
                                />
                              )}
                            />
                          </Route>
                          <Route
                            path="crm/documents"
                            element={(
                              <SectionStubPage
                                title="Документы"
                                subtitle="Реестр и хранилище документов CRM — п. 6.2 ТЗ; интеграция с карточками сделок и клиентов на следующих этапах."
                              />
                            )}
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
                              element={(
                                <SectionStubPage
                                  title="MLS вторичного рынка"
                                  subtitle="Панель партнёрской сети по вторичке — п. 6.6 ТЗ; данные MLS."
                                />
                              )}
                            />
                            <Route
                              path="verification-secondary"
                              element={(
                                <SectionStubPage
                                  title="Верификация партнёров MLS вторичного рынка"
                                  subtitle="Проверка партнёров вторички — п. 6.6 ТЗ."
                                />
                              )}
                            />
                            <Route
                              path="rent"
                              element={(
                                <SectionStubPage
                                  title="MLS аренды"
                                  subtitle="Контур аренды в партнёрской сети — п. 6.6 ТЗ."
                                />
                              )}
                            />
                            <Route
                              path="verification-rent"
                              element={(
                                <SectionStubPage
                                  title="Верификация партнёров MLS аренды"
                                  subtitle="Допуск партнёров к аренде — п. 6.6 ТЗ."
                                />
                              )}
                            />
                            <Route
                              path="reports/summary"
                              element={(
                                <SectionStubPage
                                  title="Отчёт: по MLS"
                                  subtitle="Сводные показатели сети — п. 6.6 ТЗ."
                                />
                              )}
                            />
                            <Route
                              path="reports/partners-secondary"
                              element={(
                                <SectionStubPage
                                  title="Отчёт: о работе MLS-партнёров по вторичному рынку"
                                  subtitle="Активность партнёров вторички — п. 6.6 ТЗ."
                                />
                              )}
                            />
                            <Route
                              path="reports/partners-rent"
                              element={(
                                <SectionStubPage
                                  title="Отчёт: о работе MLS-партнёров по аренде"
                                  subtitle="Показатели арендного контура MLS — п. 6.6 ТЗ."
                                />
                              )}
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
                            element={(
                              <SectionStubPage
                                title="Отчёт: по объектам"
                                subtitle="Аналитика по объектам вторичного рынка — п. 6.5 ТЗ."
                              />
                            )}
                          />
                          <Route path="objects/:propertyId" element={<ObjectCardPage />} />
                          <Route path="bookings" element={<BookingsHubPage />} />
                          <Route path="deals" element={<DealsPage />} />
                          <Route path="tasks" element={<TasksHubPage />} />
                          <Route path="calendar" element={<CalendarPage />} />
                          <Route path="team" element={<TeamPage />} />
                          <Route path="team/org" element={<TeamOrgPage />} />
                          <Route path="team/kpi" element={<TeamKpiPage />} />
                          <Route path="team/access" element={<TeamAccessPage />} />
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
                            element={(
                              <SectionStubPage
                                title="Автозадачи и триггеры"
                                subtitle="Правила постановки задач по этапам и событиям — п. 6.10 ТЗ; редактор сценариев подключится к API."
                              />
                            )}
                          />
                          <Route
                            path="settings/ai-automation"
                            element={(
                              <SectionStubPage
                                title="AI-автоматизации"
                                subtitle="Панель из матрицы ALPHABASE (xlsx): сценарии ИИ и автоматизация процессов; интеграция с моделями и политиками доступа — на этапе API."
                              />
                            )}
                          />
                          <Route
                            path="settings/system"
                            element={(
                              <SectionStubPage
                                title="Настройки системы"
                                subtitle="Профиль агентства, интеграции и системные параметры — п. 6.10 ТЗ."
                                footerLink={{ to: '/dashboard/settings', label: 'Расширенные настройки (брендинг, компания…)' }}
                              />
                            )}
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
                            element={(
                              <SectionStubPage
                                title="Источники лидов"
                                subtitle="Каналы, UTM и объёмы по источникам — п. 6.3 ТЗ; отчёты и фильтры подключатся к API."
                              />
                            )}
                          />
                          <Route
                            path="leads/report/general"
                            element={(
                              <SectionStubPage
                                title="Отчёт: общий отчёт по лидам"
                                subtitle="Сводная воронка и конверсии — п. 6.3 ТЗ."
                              />
                            )}
                          />
                          <Route
                            path="leads/report/marketing"
                            element={(
                              <SectionStubPage
                                title="Отчёт: маркетинговый отчёт по лидам"
                                subtitle="Эффективность маркетинговых каналов — п. 6.3 ТЗ."
                              />
                            )}
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
