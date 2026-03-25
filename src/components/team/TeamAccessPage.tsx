import { useMemo, useState, type ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { ROLE_PERMISSIONS, type UserRole, type PermissionAction } from '@/types/auth'
import { ROLE_LABEL } from '@/lib/permissions'
import { useAuth, MOCK_USERS } from '@/context/AuthContext'

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
}

type AccessPerson = {
  id: string
  name: string
  role: UserRole
  position: string
}

const ROLE_ACCENT: Record<UserRole, string> = {
  owner:            '#f2cf8d',
  director:         '#7ec8e3',
  rop:              '#fb923c',
  manager:          '#4ade80',
  marketer:         '#f472b6',
  lawyer:           '#22d3ee',
  procurement_head: '#a78bfa',
  partner:          '#94a3b8',
}

type AccessColumn = {
  key:
    | 'view'
    | 'create'
    | 'edit'
    | 'delete'
    | 'assign'
    | 'export'
    | 'approve'
    | 'finance'
    | 'analytics'
    | 'manage'
  label: string
  width?: number
}

const ACCESS_COLUMNS: AccessColumn[] = [
  { key: 'view',      label: 'Просмотр', width: 110 },
  { key: 'create',    label: 'Создать', width: 110 },
  { key: 'edit',      label: 'Редакт.', width: 110 },
  { key: 'delete',    label: 'Удалить', width: 110 },
  { key: 'assign',    label: 'Назнач.', width: 110 },
  { key: 'export',    label: 'Экспорт', width: 110 },
  { key: 'approve',   label: 'Апрув', width: 110 },
  { key: 'finance',   label: 'Финансы', width: 110 },
  { key: 'analytics', label: 'Аналит.', width: 110 },
  { key: 'manage',    label: 'Доступы', width: 120 },
]

type AccessRow = {
  group: string
  resource: string
  description?: string
  map: Partial<Record<AccessColumn['key'], PermissionAction | PermissionAction[]>>
}

const ACCESS_ROWS: AccessRow[] = [
  {
    group: 'CRM',
    resource: 'Лиды',
    description: 'Очередь, распределение, контроль',
    map: {
      view: ['view_all_leads', 'view_all_stages'],
      assign: ['assign_lead', 'transfer_leads', 'change_distribution'],
      analytics: 'view_lead_analytics',
      manage: 'manage_team',
    },
  },
  {
    group: 'CRM',
    resource: 'Сделки',
    description: 'Создание и согласование этапов',
    map: {
      create: 'create_deal',
      approve: ['approve_deal', 'legal_approve'],
      finance: ['see_finance', 'view_commissions'],
      export: 'export_data',
    },
  },
  {
    group: 'CRM',
    resource: 'Брони / Регистрации',
    description: 'Бронирования клиента и квартиры',
    map: {
      edit: 'manage_bookings',
      finance: ['see_finance', 'view_commissions'],
    },
  },
  {
    group: 'Каталог',
    resource: 'Объекты',
    description: 'Каталог и карточки объектов',
    map: {
      edit: 'manage_properties',
    },
  },
  {
    group: 'Партнёры',
    resource: 'Партнёры',
    description: 'Рефералы, посредники, собственники',
    map: {
      edit: 'manage_partners',
      export: 'export_data',
      analytics: 'view_network_analytics',
    },
  },
  {
    group: 'Аналитика',
    resource: 'BI / Дашборды',
    description: 'Агрегированные показатели',
    map: {
      view: 'see_analytics',
      finance: 'see_finance',
      analytics: ['see_analytics', 'view_network_analytics', 'view_lead_analytics'],
    },
  },
  {
    group: 'Админ',
    resource: 'Система',
    description: 'Рассылки, блокировки, подмены',
    map: {
      edit: ['manage_mailings', 'block_account', 'set_substitute', 'add_lead_source'],
      export: 'export_data',
      manage: 'manage_team',
    },
  },
]

export function TeamAccessPage() {
  const { currentUser } = useAuth()
  const canEdit = currentUser?.role === 'owner'

  const people = useMemo<AccessPerson[]>(
    () =>
      MOCK_USERS
        .filter((u) => u.accountType === 'agency')
        .map((u) => ({ id: u.id, name: u.name, role: u.role, position: ROLE_LABEL[u.role] })),
    [],
  )

  const [selectedPersonId, setSelectedPersonId] = useState<string>(people[0]?.id ?? '')
  const [overrides, setOverrides] = useState<Record<string, Partial<Record<PermissionAction, boolean>>>>({})

  const selectedPerson = people.find((p) => p.id === selectedPersonId) ?? people[0]
  const selectedRole = selectedPerson?.role

  const hasPermission = (personId: string, role: UserRole, action: PermissionAction) => {
    const override = overrides[personId]?.[action]
    if (typeof override === 'boolean') return override
    return ROLE_PERMISSIONS[role].includes(action)
  }

  const togglePermission = (personId: string, role: UserRole, action: PermissionAction) => {
    if (!canEdit) return
    const base = ROLE_PERMISSIONS[role].includes(action)
    const current = hasPermission(personId, role, action)
    const next = !current
    setOverrides((prev) => {
      const personOverrides = { ...(prev[personId] ?? {}) }
      if (next === base) {
        delete personOverrides[action]
      } else {
        personOverrides[action] = next
      }
      return { ...prev, [personId]: personOverrides }
    })
  }

  const selectedOverridesCount = selectedPerson ? Object.keys(overrides[selectedPerson.id] ?? {}).length : 0

  const columnKeys = ACCESS_COLUMNS.map((c) => c.key)

  const getAllowed = (personId: string, role: UserRole, actionOrActions: PermissionAction | PermissionAction[] | undefined) => {
    if (!actionOrActions) return false
    const actions = Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions]
    return actions.some((a) => hasPermission(personId, role, a))
  }

  const toggleCell = (personId: string, role: UserRole, actionOrActions: PermissionAction | PermissionAction[] | undefined) => {
    if (!actionOrActions) return
    const actions = Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions]
    if (actions.length === 0) return

    // Если в ячейке несколько разрешений — переключаем "все" в одно состояние:
    // если хоть одно выключено → включаем все, иначе выключаем все.
    const anyOff = actions.some((a) => !hasPermission(personId, role, a))
    const desired = anyOff

    actions.forEach((a) => {
      const current = hasPermission(personId, role, a)
      if (current === desired) return
      togglePermission(personId, role, a)
    })
  }

  return (
    <DashboardShell>
      <div style={{ padding: '24px 28px 40px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 4 }}>Матрица доступов сотрудников</div>
          <div style={{ fontSize: 12, color: C.whiteLow }}>
            Формула по ТЗ: действие + сущность. База берётся из роли, индивидуальные правки доступны собственнику.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 14 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.whiteLow }}>
              Сотрудники
            </div>
            <div style={{ maxHeight: '66vh', overflowY: 'auto' }}>
              {people.map((person) => {
                const active = selectedPerson?.id === person.id
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setSelectedPersonId(person.id)}
                    style={{
                      width: '100%',
                      border: 'none',
                      borderBottom: `1px solid ${C.border}`,
                      background: active ? 'rgba(201,168,76,0.08)' : 'transparent',
                      padding: '10px 12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 12, color: C.white, fontWeight: 600 }}>{person.name}</div>
                    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.07em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: 20,
                          background: `${ROLE_ACCENT[person.role]}18`,
                          border: `1px solid ${ROLE_ACCENT[person.role]}44`,
                          color: ROLE_ACCENT[person.role],
                          display: 'inline-block',
                        }}
                      >
                        {person.position}
                      </span>
                      <span style={{ fontSize: 10, color: C.whiteLow }}>
                        правок: {Object.keys(overrides[person.id] ?? {}).length}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'auto' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, color: C.white, fontWeight: 700 }}>
                  {selectedPerson ? `${selectedPerson.name} — персональные доступы` : 'Выберите сотрудника'}
                </div>
                <div style={{ marginTop: 2, fontSize: 11, color: C.whiteLow }}>
                  Роль: {selectedRole ? ROLE_LABEL[selectedRole] : '-'} · Индивидуальных правок: {selectedOverridesCount}
                </div>
              </div>
              {!canEdit && (
                <div style={{ fontSize: 10, color: C.whiteLow }}>
                  Только собственник может редактировать
                </div>
              )}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 11, color: C.whiteLow, fontWeight: 600, width: 260 }}>
                    Сущность
                  </th>
                  {ACCESS_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        padding: '14px 10px',
                        textAlign: 'center',
                        fontSize: 11,
                        color: C.whiteLow,
                        fontWeight: 600,
                        width: col.width,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(new Set(ACCESS_ROWS.map((r) => r.group))).flatMap((group) => {
                  const rowsInGroup = ACCESS_ROWS.filter((r) => r.group === group)
                  const groupRows: ReactNode[] = [
                    (
                      <tr key={`group-${group}`}>
                        <td
                          colSpan={1 + columnKeys.length}
                          style={{
                            padding: '10px 18px 6px',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: C.gold,
                            background: 'rgba(201,168,76,0.04)',
                            borderTop: `1px solid ${C.border}`,
                          }}
                        >
                          {group}
                        </td>
                      </tr>
                    ),
                  ]

                  rowsInGroup.forEach((row, idx) => {
                    groupRows.push(
                      <tr
                        key={`${group}-${row.resource}`}
                        style={{
                          borderBottom:
                            idx < rowsInGroup.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none',
                        }}
                      >
                        <td style={{ padding: '12px 18px' }}>
                          <div style={{ fontSize: 12, color: C.whiteMid, fontWeight: 700 }}>{row.resource}</div>
                          {row.description && (
                            <div style={{ marginTop: 3, fontSize: 10, color: C.whiteLow }}>
                              {row.description}
                            </div>
                          )}
                        </td>
                        {ACCESS_COLUMNS.map((col) => {
                          const actionOrActions = row.map[col.key]
                          const allowed =
                            selectedPerson && selectedRole
                              ? getAllowed(selectedPerson.id, selectedRole, actionOrActions)
                              : false

                          const clickable = Boolean(actionOrActions) && canEdit && selectedPerson && selectedRole

                          return (
                            <td key={`${row.resource}-${col.key}`} style={{ padding: '10px', textAlign: 'center' }}>
                              <button
                                type="button"
                                disabled={!clickable}
                                onClick={() =>
                                  selectedPerson && selectedRole &&
                                  toggleCell(selectedPerson.id, selectedRole, actionOrActions)
                                }
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: clickable ? 'pointer' : 'default',
                                  padding: 0,
                                  opacity: actionOrActions ? 1 : 0.35,
                                }}
                                title={!actionOrActions ? 'Не применяется' : undefined}
                              >
                                {allowed ? (
                                  <div
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      background: 'rgba(74,222,128,0.12)',
                                    }}
                                  >
                                    <Check size={13} color="#4ade80" />
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      background: 'rgba(255,255,255,0.04)',
                                    }}
                                  >
                                    <X size={13} color="rgba(255,255,255,0.18)" />
                                  </div>
                                )}
                              </button>
                            </td>
                          )
                        })}
                      </tr>,
                    )
                  })

                  return groupRows
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.whiteLow }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={10} color="#4ade80" />
            </div>
            Разрешено
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.whiteLow }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={10} color="rgba(255,255,255,0.18)" />
            </div>
            Нет доступа
          </div>
          <div style={{ fontSize: 11, color: C.whiteLow }}>
            База: права роли, затем персональные правки
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
