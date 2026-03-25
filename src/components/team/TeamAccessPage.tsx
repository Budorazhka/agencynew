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

const ACTION_GROUPS: { group: string; actions: { key: PermissionAction; label: string }[] }[] = [
  {
    group: 'Команда и лиды',
    actions: [
      { key: 'manage_team',         label: 'Управление командой' },
      { key: 'view_all_leads',      label: 'Видеть все лиды' },
      { key: 'transfer_leads',      label: 'Передача лидов' },
      { key: 'assign_lead',         label: 'Назначение лида' },
      { key: 'change_distribution', label: 'Правила распределения' },
      { key: 'add_lead_source',     label: 'Добавить источник' },
    ],
  },
  {
    group: 'Сделки и брони',
    actions: [
      { key: 'create_deal',         label: 'Создать сделку' },
      { key: 'approve_deal',        label: 'Согласовать сделку' },
      { key: 'legal_approve',       label: 'Юр. апрув сделки' },
      { key: 'manage_bookings',     label: 'Управление бронями' },
    ],
  },
  {
    group: 'Объекты',
    actions: [
      { key: 'manage_properties',   label: 'Управление объектами' },
    ],
  },
  {
    group: 'Аналитика и финансы',
    actions: [
      { key: 'see_analytics',       label: 'BI-дашборды' },
      { key: 'view_network_analytics', label: 'Аналитика сети' },
      { key: 'view_lead_analytics', label: 'Аналитика лидов' },
      { key: 'see_finance',         label: 'Финансы' },
      { key: 'view_commissions',    label: 'Комиссии' },
      { key: 'export_data',         label: 'Экспорт данных' },
    ],
  },
  {
    group: 'Администрирование',
    actions: [
      { key: 'manage_partners',     label: 'Управление партнёрами' },
      { key: 'manage_mailings',     label: 'Рассылки' },
      { key: 'block_account',       label: 'Блокировка аккаунтов' },
      { key: 'set_substitute',      label: 'Подменный дежурный' },
      { key: 'view_all_stages',     label: 'Все стадии воронки' },
    ],
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

  return (
    <DashboardShell>
      <div style={{ padding: '24px 28px 40px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 4 }}>Матрица доступов сотрудников</div>
          <div style={{ fontSize: 12, color: C.whiteLow }}>
            Права назначаются конкретным людям. База берётся из роли, индивидуальные правки доступны собственнику.
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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 11, color: C.whiteLow, fontWeight: 600, width: 260 }}>
                    Действие
                  </th>
                  <th style={{ padding: '14px 10px', textAlign: 'center', minWidth: 120, fontSize: 11, color: C.whiteLow, fontWeight: 600 }}>
                    Доступ
                  </th>
                </tr>
              </thead>
              <tbody>
                {ACTION_GROUPS.flatMap(({ group, actions }) => {
                  const rows: ReactNode[] = [
                    (
                      <tr key={`group-${group}`}>
                        <td colSpan={2} style={{
                          padding: '10px 18px 6px',
                          fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                          color: C.gold, background: 'rgba(201,168,76,0.04)',
                          borderTop: `1px solid ${C.border}`,
                        }}>
                          {group}
                        </td>
                      </tr>
                    ),
                  ]

                  actions.forEach((action, i) => {
                    const allowed = selectedPerson && selectedRole
                      ? hasPermission(selectedPerson.id, selectedRole, action.key)
                      : false
                    rows.push(
                      <tr key={action.key} style={{ borderBottom: i < actions.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                        <td style={{ padding: '10px 18px', fontSize: 12, color: C.whiteMid }}>{action.label}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button
                            type="button"
                            disabled={!canEdit || !selectedPerson || !selectedRole}
                            onClick={() => selectedPerson && selectedRole && togglePermission(selectedPerson.id, selectedRole, action.key)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: canEdit ? 'pointer' : 'default',
                              padding: 0,
                            }}
                          >
                            {allowed
                              ? <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: 'rgba(74,222,128,0.12)' }}>
                                  <Check size={13} color="#4ade80" />
                                </div>
                              : <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}>
                                  <X size={13} color="rgba(255,255,255,0.18)" />
                                </div>
                            }
                          </button>
                        </td>
                      </tr>,
                    )
                  })

                  return rows
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
