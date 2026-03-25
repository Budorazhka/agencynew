import { useAuth } from '@/context/AuthContext'
import { DashboardShell } from '@/components/layout/DashboardShell'
import {
  OwnerDashboard,
  DirectorDashboard,
  RopDashboard,
  ManagerDashboard,
  ProcurementDashboard,
  LawyerDashboard,
  MarketerDashboard,
  PartnerDashboard,
} from '@/components/dashboard/roles'

/** Роутит на нужный ролевой дашборд */
export default function DashboardsPage() {
  const { currentUser } = useAuth()

  function renderDashboard() {
    if (!currentUser) return null
    switch (currentUser.role) {
      case 'owner':           return <OwnerDashboard />
      case 'director':        return <DirectorDashboard />
      case 'rop':             return <RopDashboard />
      case 'manager':         return <ManagerDashboard />
      case 'procurement_head':return <ProcurementDashboard />
      case 'lawyer':          return <LawyerDashboard />
      case 'marketer':        return <MarketerDashboard />
      case 'partner':         return <PartnerDashboard />
      default:                return <ManagerDashboard />
    }
  }

  return (
    <DashboardShell>
      {renderDashboard()}
    </DashboardShell>
  )
}
