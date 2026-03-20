import {
  getAllPartnerIds,
  getCurrentUserId,
  getDirectReferralIds,
  getPartnerSummary,
} from "@/lib/mock/analytics-network"
import type { Partner } from "@/types/dashboard"
import type {
  CabinetRole,
  OwnerCabinetOption,
  OwnerDashboardContext,
  OwnerHierarchyNode,
} from "@/types/owner-dashboard"

const ROOT_OWNER_NODE_ID = "supreme-owner-root"

const rolePriority: Record<CabinetRole, number> = {
  supreme_owner: 0,
  master_partner: 1,
  partner: 2,
}

const CITY_NAME_TO_ANALYTICS_PERSON_ID: Record<string, string> = {
  "mike tyson": "partner-2",
  "майк тайсон": "partner-2",
  "muhammad ali": "partner-1",
  "мухаммед али": "partner-1",
  "floyd mayweather": "partner-6",
  "флойд мейвезер": "partner-6",
  "manny pacquiao": "partner-7",
  "мэнни пакьяо": "partner-7",
  "canelo alvarez": "partner-8",
  "сауль альварес": "partner-8",
  "gennadiy golovkin": "partner-9",
  "геннадий головкин": "partner-9",
  "oleksandr usyk": "partner-12",
  "александр усик": "partner-12",
  "tyson fury": "partner-18",
  "тайсон фьюри": "partner-18",
  "vasyl lomachenko": "partner-13",
  "василий ломаченко": "partner-13",
}

type CityPartner = Pick<Partner, "id" | "name" | "type" | "masterId">

type OwnerHierarchyBuildResult = {
  hierarchy: OwnerHierarchyNode[]
  analyticsPersonIdByPersonId: Record<string, string>
}

function getPartnerLabel(partnerId: string, fallback: string) {
  return getPartnerSummary(partnerId)?.name ?? fallback
}

function normalizePersonName(value: string) {
  return value
    .toLowerCase()
    .replace(/['`".,]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function hashFromString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getNodeCapacity(role: CabinetRole, personId: string) {
  const baseHash = hashFromString(personId)
  if (role === "master_partner") {
    return 3 + (baseHash % 2) // 3..4
  }
  if (role === "partner") {
    return 1 + (baseHash % 2) // 1..2
  }
  return 0
}

function resolveCityPartnerAnalyticsId(
  cityPartnerName: string,
  analyticsPool: string[],
  usedAnalyticsIds: Set<string>
) {
  const normalizedName = normalizePersonName(cityPartnerName)
  const preferredId = CITY_NAME_TO_ANALYTICS_PERSON_ID[normalizedName]
  if (preferredId && !usedAnalyticsIds.has(preferredId)) {
    return preferredId
  }

  const byExactName = analyticsPool.find((partnerId) => {
    if (usedAnalyticsIds.has(partnerId)) return false
    const partner = getPartnerSummary(partnerId)
    if (!partner) return false
    return normalizePersonName(partner.name) === normalizedName
  })
  if (byExactName) {
    return byExactName
  }

  const fallbackId = analyticsPool.find((partnerId) => !usedAnalyticsIds.has(partnerId))
  return fallbackId ?? getCurrentUserId()
}

function createCityNodeId(cityPartnerId: string) {
  return `city-partner-${cityPartnerId}`
}

function createHierarchy(cityPartners: CityPartner[] = []): OwnerHierarchyBuildResult {
  const currentUserId = getCurrentUserId()
  const analyticsPool = getAllPartnerIds().filter((id) => id !== currentUserId)
  const usedAnalyticsIds = new Set<string>()
  const analyticsPersonIdByPersonId: Record<string, string> = {}

  const rootNodeIds: string[] = []
  const nodes: OwnerHierarchyNode[] = [
    {
      id: ROOT_OWNER_NODE_ID,
      role: "supreme_owner",
      label: "\u0412\u044b",
      personId: currentUserId,
      parentId: null,
      childrenIds: rootNodeIds,
    },
  ]

  const nodesById = new Map<string, OwnerHierarchyNode>()
  nodesById.set(ROOT_OWNER_NODE_ID, nodes[0])
  const cityNodeIdByPartnerId = new Map<string, string>()

  const addNode = (node: OwnerHierarchyNode) => {
    nodes.push(node)
    nodesById.set(node.id, node)
  }

  if (cityPartners.length > 0) {
    const rootCityPartnersByType = cityPartners.filter((partner) => partner.type === "master")
    const rootCityPartnersByNoMaster = cityPartners.filter((partner) => !partner.masterId)
    const rootCityPartners =
      rootCityPartnersByNoMaster.length > 0
        ? rootCityPartnersByNoMaster
        : rootCityPartnersByType.length > 0
          ? rootCityPartnersByType
          : cityPartners

    const rootPartnerIdSet = new Set(rootCityPartners.map((partner) => partner.id))

    rootCityPartners.forEach((cityPartner) => {
      const nodeId = createCityNodeId(cityPartner.id)
      const analyticsPersonId = resolveCityPartnerAnalyticsId(
        cityPartner.name,
        analyticsPool,
        usedAnalyticsIds
      )
      usedAnalyticsIds.add(analyticsPersonId)
      analyticsPersonIdByPersonId[cityPartner.id] = analyticsPersonId
      analyticsPersonIdByPersonId[analyticsPersonId] = analyticsPersonId

      const node: OwnerHierarchyNode = {
        id: nodeId,
        role: cityPartner.type === "master" ? "master_partner" : "partner",
        label: getPartnerLabel(analyticsPersonId, cityPartner.name),
        personId: analyticsPersonId,
        parentId: ROOT_OWNER_NODE_ID,
        childrenIds: [],
      }
      addNode(node)
      rootNodeIds.push(nodeId)
      cityNodeIdByPartnerId.set(cityPartner.id, nodeId)
    })

    const pendingPartners = cityPartners.filter((partner) => !rootPartnerIdSet.has(partner.id))
    let unresolvedPartners = pendingPartners
    let safetyPasses = 0

    while (unresolvedPartners.length > 0 && safetyPasses < cityPartners.length + 2) {
      safetyPasses += 1
      const nextUnresolved: CityPartner[] = []

      unresolvedPartners.forEach((cityPartner) => {
        const analyticsPersonId = resolveCityPartnerAnalyticsId(
          cityPartner.name,
          analyticsPool,
          usedAnalyticsIds
        )
        usedAnalyticsIds.add(analyticsPersonId)
        analyticsPersonIdByPersonId[cityPartner.id] = analyticsPersonId
        analyticsPersonIdByPersonId[analyticsPersonId] = analyticsPersonId

        const parentNodeId = cityPartner.masterId
          ? cityNodeIdByPartnerId.get(cityPartner.masterId) ?? null
          : ROOT_OWNER_NODE_ID

        if (!parentNodeId) {
          nextUnresolved.push(cityPartner)
          return
        }

        const parentNode = nodesById.get(parentNodeId)
        if (!parentNode) {
          nextUnresolved.push(cityPartner)
          return
        }

        const nodeId = createCityNodeId(cityPartner.id)
        const node: OwnerHierarchyNode = {
          id: nodeId,
          role: cityPartner.type === "master" ? "master_partner" : "partner",
          label: getPartnerLabel(analyticsPersonId, cityPartner.name),
          personId: analyticsPersonId,
          parentId: parentNodeId,
          childrenIds: [],
        }
        addNode(node)
        parentNode.childrenIds.push(nodeId)
        cityNodeIdByPartnerId.set(cityPartner.id, nodeId)
      })

      if (nextUnresolved.length === unresolvedPartners.length) {
        break
      }
      unresolvedPartners = nextUnresolved
    }

    // Attach any broken references directly to owner to keep tree visible and avoid data loss.
    unresolvedPartners.forEach((cityPartner) => {
      const analyticsPersonId = resolveCityPartnerAnalyticsId(
        cityPartner.name,
        analyticsPool,
        usedAnalyticsIds
      )
      usedAnalyticsIds.add(analyticsPersonId)
      analyticsPersonIdByPersonId[cityPartner.id] = analyticsPersonId
      analyticsPersonIdByPersonId[analyticsPersonId] = analyticsPersonId

      const nodeId = createCityNodeId(cityPartner.id)
      const node: OwnerHierarchyNode = {
        id: nodeId,
        role: cityPartner.type === "master" ? "master_partner" : "partner",
        label: getPartnerLabel(analyticsPersonId, cityPartner.name),
        personId: analyticsPersonId,
        parentId: ROOT_OWNER_NODE_ID,
        childrenIds: [],
      }
      addNode(node)
      nodes[0].childrenIds.push(nodeId)
      cityNodeIdByPartnerId.set(cityPartner.id, nodeId)
    })

    const attachAnalyticsDownline = (startNodeId: string, startPersonId: string) => {
      const queue: Array<{ nodeId: string; personId: string; depth: number }> = [
        { nodeId: startNodeId, personId: startPersonId, depth: 0 },
      ]
      const maxDepth = 7

      while (queue.length > 0) {
        const current = queue.shift()
        if (!current || current.depth >= maxDepth) continue

        const parentNode = nodesById.get(current.nodeId)
        if (!parentNode) continue

        const referralIds = getDirectReferralIds(current.personId)
        referralIds.forEach((referralId) => {
          if (referralId === currentUserId) return
          if (usedAnalyticsIds.has(referralId)) return

          usedAnalyticsIds.add(referralId)
          analyticsPersonIdByPersonId[referralId] = referralId

          const nodeId = `analytics-partner-${referralId}`
          const node: OwnerHierarchyNode = {
            id: nodeId,
            role: "partner",
            label: getPartnerLabel(referralId, referralId),
            personId: referralId,
            parentId: parentNode.id,
            childrenIds: [],
          }

          addNode(node)
          parentNode.childrenIds.push(nodeId)
          queue.push({ nodeId, personId: referralId, depth: current.depth + 1 })
        })
      }
    }

    rootCityPartners.forEach((cityPartner) => {
      const rootNodeId = cityNodeIdByPartnerId.get(cityPartner.id)
      const rootAnalyticsPersonId = analyticsPersonIdByPersonId[cityPartner.id]
      if (!rootNodeId || !rootAnalyticsPersonId) return
      attachAnalyticsDownline(rootNodeId, rootAnalyticsPersonId)
    })

    return {
      hierarchy: nodes,
      analyticsPersonIdByPersonId,
    }
  }

  const fallbackRootLines = 3
  const fallbackRootAnalyticsIds = analyticsPool.slice(0, fallbackRootLines)
  fallbackRootAnalyticsIds.forEach((analyticsPersonId, index) => {
    usedAnalyticsIds.add(analyticsPersonId)
    analyticsPersonIdByPersonId[analyticsPersonId] = analyticsPersonId
    const nodeId = `master-${analyticsPersonId}`
    const node: OwnerHierarchyNode = {
      id: nodeId,
      role: "master_partner",
      label: getPartnerLabel(analyticsPersonId, `Master ${index + 1}`),
      personId: analyticsPersonId,
      parentId: ROOT_OWNER_NODE_ID,
      childrenIds: [],
    }
    addNode(node)
    rootNodeIds.push(nodeId)
  })

  if (rootNodeIds.length > 0) {
    const childrenCountByNodeId = new Map<string, number>(
      nodes.map((node) => [node.id, node.childrenIds.length])
    )
    const capacityByNodeId = new Map<string, number>()
    nodes.forEach((node) => {
      if (node.role === "supreme_owner") return
      const analyticsPersonId = analyticsPersonIdByPersonId[node.personId] ?? node.personId
      capacityByNodeId.set(node.id, getNodeCapacity(node.role, analyticsPersonId))
    })

    const branchQueueByRootId = new Map<string, string[]>()
    rootNodeIds.forEach((rootNodeId) => {
      branchQueueByRootId.set(rootNodeId, [rootNodeId])
    })

    const generatedAnalyticsIds = analyticsPool.filter(
      (partnerId) => !usedAnalyticsIds.has(partnerId)
    )

    generatedAnalyticsIds.forEach((analyticsPersonId, index) => {
      analyticsPersonIdByPersonId[analyticsPersonId] = analyticsPersonId
      const branchRootNodeId = rootNodeIds[index % rootNodeIds.length]
      const branchQueue = branchQueueByRootId.get(branchRootNodeId)
      if (!branchQueue) return

      while (branchQueue.length > 0) {
        const candidateNodeId = branchQueue[0]
        const candidateChildrenCount = childrenCountByNodeId.get(candidateNodeId) ?? 0
        const candidateCapacity = capacityByNodeId.get(candidateNodeId) ?? 0
        if (candidateChildrenCount < candidateCapacity) break
        branchQueue.shift()
      }

      const parentNodeId = branchQueue[0] ?? branchRootNodeId
      const parentNode = nodesById.get(parentNodeId)
      if (!parentNode) return

      const generatedNodeId = `partner-${analyticsPersonId}`
      const generatedNode: OwnerHierarchyNode = {
        id: generatedNodeId,
        role: "partner",
        label: getPartnerLabel(analyticsPersonId, `Partner ${index + 1}`),
        personId: analyticsPersonId,
        parentId: parentNodeId,
        childrenIds: [],
      }

      addNode(generatedNode)
      parentNode.childrenIds.push(generatedNodeId)
      childrenCountByNodeId.set(
        parentNodeId,
        (childrenCountByNodeId.get(parentNodeId) ?? 0) + 1
      )
      childrenCountByNodeId.set(generatedNodeId, 0)
      capacityByNodeId.set(generatedNodeId, getNodeCapacity("partner", analyticsPersonId))
      branchQueue.push(generatedNodeId)
    })
  }

  return {
    hierarchy: nodes,
    analyticsPersonIdByPersonId,
  }
}

function createCabinets(
  currentUserId: string,
  hierarchy: OwnerHierarchyNode[],
  includeAnalyticsFallback: boolean
): OwnerCabinetOption[] {
  const networkOption: OwnerCabinetOption = {
    id: "network",
    scope: "network",
    role: "supreme_owner",
    label: "\u0412\u0441\u044f \u0441\u0435\u0442\u044c",
  }

  const personalOption: OwnerCabinetOption = {
    id: "me",
    scope: "me",
    role: "master_partner",
    label: "\u041c\u043e\u0439 \u043a\u0430\u0431\u0438\u043d\u0435\u0442",
    personId: currentUserId,
  }

  const seenPersonIds = new Set<string>()
  const hierarchyPartnerOptions = hierarchy
    .filter((node) => node.role !== "supreme_owner")
    .filter((node) => {
      if (node.personId === currentUserId) return false
      if (seenPersonIds.has(node.personId)) return false
      seenPersonIds.add(node.personId)
      return true
    })
    .map<OwnerCabinetOption>((node) => ({
      id: `partner-${node.personId}`,
      scope: "partner",
      role: node.role,
      label: node.label,
      personId: node.personId,
    }))

  const analyticsFallbackOptions = includeAnalyticsFallback
    ? getAllPartnerIds()
        .filter((partnerId) => partnerId !== currentUserId && !seenPersonIds.has(partnerId))
        .map<OwnerCabinetOption>((partnerId) => ({
          id: `partner-${partnerId}`,
          scope: "partner",
          role: "partner",
          label: getPartnerLabel(partnerId, partnerId),
          personId: partnerId,
        }))
    : []

  const partnerOptions = [...hierarchyPartnerOptions, ...analyticsFallbackOptions].sort(
    (a, b) => {
      const roleDiff = rolePriority[a.role] - rolePriority[b.role]
      if (roleDiff !== 0) return roleDiff
      return a.label.localeCompare(b.label, "ru", { sensitivity: "base" })
    }
  )

  return [networkOption, personalOption, ...partnerOptions]
}

export function getOwnerDashboardContext(
  cityPartners: CityPartner[] = []
): OwnerDashboardContext {
  const currentUserId = getCurrentUserId()
  const { hierarchy, analyticsPersonIdByPersonId } = createHierarchy(cityPartners)
  const availableCabinets = createCabinets(
    currentUserId,
    hierarchy,
    cityPartners.length === 0
  )

  return {
    currentUserId,
    availableCabinets,
    hierarchy,
    analyticsPersonIdByPersonId,
  }
}
