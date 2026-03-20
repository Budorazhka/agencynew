import { type ReactNode, Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { DashboardProvider } from '@/context/DashboardContext'
import { LeadsProvider } from '@/context/LeadsContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { MockProvider } from '@/providers/MockProvider'
import { LoadingProvider } from '@/providers/LoadingProvider'
import App from './App'
import HomePage from '@/pages/HomePage'
import { OverviewGuard } from '@/components/dashboard/OverviewGuard'
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
  PersonnelErrorBoundary,
  SettingsErrorBoundary,
} from '@/components/common/ModuleErrorBoundary'
import { AgencyOnboarding } from '@/components/onboarding/AgencyOnboarding'
import { LoginPage } from '@/components/auth/LoginPage'
import { LMSPage } from '@/components/lms/LMSPage'
import { PersonnelPage } from '@/components/personnel/PersonnelPage'
import { MyPropertiesPage } from '@/components/management/my-properties/MyPropertiesPage'
import MarketplacePage from '@/pages/modules/MarketplacePage'
import CRMPage from '@/pages/modules/CRMPage'
import DashboardsPage from '@/pages/modules/DashboardsPage'
import LeadsHubPage from '@/pages/modules/LeadsHubPage'
import ClientsPage from '@/pages/modules/ClientsPage'
import PartnersPage from '@/pages/modules/PartnersPage'
import ObjectsPage from '@/pages/modules/ObjectsPage'
import BookingsPage from '@/pages/modules/BookingsPage'
import DealsPage from '@/pages/modules/DealsPage'
import TasksPage from '@/pages/modules/TasksPage'
import CalendarPage from '@/pages/modules/CalendarPage'
import TeamPage from '@/pages/modules/TeamPage'
import LearningPage from '@/pages/modules/LearningPage'
import InfoPage from '@/pages/modules/InfoPage'
import SettingsHubPage from '@/pages/modules/SettingsHubPage'
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/500.css'
import '@fontsource/montserrat/600.css'
import '@fontsource/montserrat/700.css'
import './index.css'

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
        <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 560 }}>
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
                        <Route path="/dashboard" element={<App />}>
                          {/* Главный экран — наша новая HomePage */}
                          <Route index element={<DashboardErrorBoundary><HomePage /></DashboardErrorBoundary>} />

                          {/* Hub-страницы 15 модулей */}
                          <Route path="marketplace" element={<MarketplacePage />} />
                          <Route path="crm" element={<CRMPage />} />
                          <Route path="dashboards" element={<DashboardsPage />} />
                          <Route path="leads-hub" element={<LeadsHubPage />} />
                          <Route path="clients" element={<ClientsPage />} />
                          <Route path="partners" element={<PartnersPage />} />
                          <Route path="objects" element={<ObjectsPage />} />
                          <Route path="bookings" element={<BookingsPage />} />
                          <Route path="deals" element={<DealsPage />} />
                          <Route path="tasks" element={<TasksPage />} />
                          <Route path="calendar" element={<CalendarPage />} />
                          <Route path="team" element={<TeamPage />} />
                          <Route path="learning" element={<LearningPage />} />
                          <Route path="info" element={<InfoPage />} />
                          <Route path="settings-hub" element={<SettingsHubPage />} />

                          {/* Рабочие страницы из agency */}
                          <Route path="overview" element={<DashboardErrorBoundary><OverviewGuard /></DashboardErrorBoundary>} />
                          <Route path="leads" element={<LeadsErrorBoundary><RuntimeErrorBoundary><LeadsAdminPage /></RuntimeErrorBoundary></LeadsErrorBoundary>} />
                          <Route path="leads/poker" element={<LeadsErrorBoundary><RuntimeErrorBoundary><LeadsPokerPage /></RuntimeErrorBoundary></LeadsErrorBoundary>} />
                          <Route path="leads/analytics" element={<Navigate to="/dashboard/leads" replace />} />
                          <Route path="my-properties" element={<MyPropertiesPage />} />
                          <Route path="personnel" element={<PersonnelErrorBoundary><PersonnelPage /></PersonnelErrorBoundary>} />
                          <Route path="lms" element={<LMSPage />} />
                          <Route path="settings" element={<SettingsErrorBoundary><SettingsPage /></SettingsErrorBoundary>} />
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
