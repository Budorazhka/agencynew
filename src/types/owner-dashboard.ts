export type CabinetRole = "supreme_owner" | "master_partner" | "partner"

export type CabinetScope = "network" | "me" | "partner"

export interface OwnerCabinetOption {
  id: string
  scope: CabinetScope
  role: CabinetRole
  label: string
  personId?: string
}

export interface OwnerHierarchyNode {
  id: string
  role: CabinetRole
  label: string
  personId: string
  parentId: string | null
  childrenIds: string[]
}

export interface OwnerDashboardContext {
  currentUserId: string
  availableCabinets: OwnerCabinetOption[]
  hierarchy: OwnerHierarchyNode[]
  analyticsPersonIdByPersonId: Record<string, string>
}
