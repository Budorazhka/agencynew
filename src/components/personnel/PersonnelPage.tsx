import { useState } from 'react'
import { UserPlus, Phone, Mail, Calendar, X, Pencil, Trash2, Users, ShieldOff, ShieldCheck } from 'lucide-react'
import { useAuth, MOCK_USERS } from '@/context/AuthContext'
import {
  MOCK_EMPLOYEES,
  ROLE_LABELS,
  type Employee,
  type EmployeeRole,
} from '@/data/personnel-mock'
import { ROLE_LABEL } from '@/lib/permissions'
import type { UserRole } from '@/types/auth'

// ─── Цвета ролей ──────────────────────────────────────────────────────────────

const ROLE_FELT: Record<EmployeeRole, { suit: string; accent: string; badge: string; text: string; glow: string }> = {
  owner:    { suit: '♛', accent: '#f2cf8d', badge: 'rgba(242,207,141,0.15)', text: '#f2cf8d', glow: 'rgba(242,207,141,0.3)' },
  director: { suit: '◆', accent: '#7ec8e3', badge: 'rgba(126,200,227,0.15)', text: '#7ec8e3', glow: 'rgba(126,200,227,0.25)' },
  rop:      { suit: '♠', accent: '#f4b96a', badge: 'rgba(244,185,106,0.15)', text: '#f4b96a', glow: 'rgba(244,185,106,0.25)' },
  manager:  { suit: '♣', accent: '#6fcf97', badge: 'rgba(111,207,151,0.15)', text: '#6fcf97', glow: 'rgba(111,207,151,0.2)'  },
}

const LINE = 'rgba(242,207,141,0.22)'

// ─── Утилиты ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}
function buildChildren(employees: Employee[], parentId: string) {
  return employees.filter((e) => e.managerId === parentId)
}

// ─── Карточка сотрудника (стиль игральной карты) ─────────────────────────────

function EmployeeCard({
  employee,
  isSelected,
  onClick,
}: {
  employee: Employee
  isSelected: boolean
  onClick: () => void
}) {
  const f = ROLE_FELT[employee.role]
  const initials = getInitials(employee.name)

  return (
    <button
      onClick={onClick}
      style={{
        width: 148,
        height: 196,
        borderRadius: 14,
        border: `1px solid ${isSelected ? f.accent : 'rgba(229,196,136,0.25)'}`,
        background: isSelected
          ? `linear-gradient(160deg, rgba(9,59,48,0.98) 0%, rgba(6,35,28,0.98) 100%)`
          : `linear-gradient(160deg, rgba(9,47,38,0.92) 0%, rgba(6,28,22,0.92) 100%)`,
        boxShadow: isSelected
          ? `0 0 0 2px ${f.glow}, 0 10px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)`
          : `0 6px 22px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 8px',
        position: 'relative',
        transition: 'all 0.15s',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Углы карты */}
      <div style={{ position: 'absolute', top: 8, left: 9, lineHeight: 1, textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: f.accent, letterSpacing: '-0.02em' }}>{initials[0]}</div>
        <div style={{ fontSize: 11, color: f.accent, opacity: 0.75, marginTop: 2 }}>{f.suit}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 8, right: 9, lineHeight: 1, textAlign: 'center', transform: 'rotate(180deg)' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: f.accent, letterSpacing: '-0.02em' }}>{initials[0]}</div>
        <div style={{ fontSize: 11, color: f.accent, opacity: 0.75, marginTop: 2 }}>{f.suit}</div>
      </div>

      {/* Центр */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, paddingInline: 6 }}>
        {/* Круг с инициалами */}
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${f.badge}, rgba(0,0,0,0.35))`,
          border: `1.5px solid ${f.accent}45`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 19, fontWeight: 800, color: f.accent, letterSpacing: '-0.02em',
          boxShadow: `0 0 18px ${f.glow}`,
          position: 'relative', zIndex: 1,
        }}>
          {initials}
        </div>

        {/* Имя */}
        <div style={{ textAlign: 'center', lineHeight: 1.3, position: 'relative', zIndex: 1 }}>
          {employee.name.split(' ').map((part, i) => (
            <div key={i} style={{ fontSize: i === 0 ? 11.5 : 10.5, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#f7ecd4' : 'rgba(247,236,212,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 116 }}>
              {part}
            </div>
          ))}
        </div>
      </div>

      {/* Роль (снизу) */}
      <div style={{
        fontSize: 8.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: f.text, background: f.badge,
        border: `1px solid ${f.accent}50`,
        borderRadius: 5, padding: '3px 8px',
        marginBottom: 2, position: 'relative', zIndex: 1,
      }}>
        {ROLE_LABELS[employee.role]}
      </div>
    </button>
  )
}

// ─── Узел дерева ──────────────────────────────────────────────────────────────

function OrgNode({
  employee,
  allEmployees,
  onSelect,
  selectedId,
}: {
  employee: Employee
  allEmployees: Employee[]
  onSelect: (e: Employee) => void
  selectedId: string | null
}) {
  const children = buildChildren(allEmployees, employee.id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <EmployeeCard
        employee={employee}
        isSelected={selectedId === employee.id}
        onClick={() => onSelect(employee)}
      />

      {children.length > 0 && (
        <>
          <div style={{ width: 1, height: 36, background: LINE }} />
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {children.map((child, i) => {
              const isFirst = i === 0
              const isLast = i === children.length - 1
              const isOnly = children.length === 1
              // Узлы с поддеревом (РОПы) — широкий отступ, листы (менеджеры) — узкий
              const hasGrandchildren = allEmployees.some((e) => e.managerId === child.id)
              const hPad = hasGrandchildren ? 32 : 14
              return (
                <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', paddingInline: hPad }}>
                  <div style={{ height: 36, width: '100%', position: 'relative' }}>
                    {!isOnly && !isFirst && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: '50%', height: 1, background: LINE }} />
                    )}
                    {!isOnly && !isLast && (
                      <div style={{ position: 'absolute', top: 0, left: '50%', right: 0, height: 1, background: LINE }} />
                    )}
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', marginLeft: -0.5, width: 1, background: LINE }} />
                  </div>
                  <OrgNode
                    employee={child}
                    allEmployees={allEmployees}
                    onSelect={onSelect}
                    selectedId={selectedId}
                  />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Боковая панель ───────────────────────────────────────────────────────────

function EmployeeDrawer({
  employee,
  canEdit,
  onClose,
  onDelete,
  onEdit,
}: {
  employee: Employee
  canEdit: boolean
  onClose: () => void
  onDelete: (id: string) => void
  onEdit: (e: Employee) => void
}) {
  const f = ROLE_FELT[employee.role]
  const initials = getInitials(employee.name)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(5,28,22,0.97)', borderLeft: '1px solid rgba(229,196,136,0.18)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(229,196,136,0.1)' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(243,225,188,0.55)', margin: 0 }}>Сотрудник</p>
        <button onClick={onClose} style={{ padding: 6, borderRadius: 8, color: 'rgba(247,236,212,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Мини-карта */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${f.badge}, rgba(0,0,0,0.3))`,
            border: `1.5px solid ${f.accent}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: f.accent,
            boxShadow: `0 0 16px ${f.glow}`,
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#f7ecd4', fontSize: 15, lineHeight: 1.3, margin: 0 }}>{employee.name}</p>
            <p style={{ fontSize: 12, color: 'rgba(247,236,212,0.5)', marginTop: 3 }}>{employee.position}</p>
            <span style={{
              display: 'inline-block', marginTop: 5, fontSize: 9.5, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: f.text, background: f.badge,
              border: `1px solid ${f.accent}50`,
              borderRadius: 5, padding: '2px 8px',
            }}>
              {ROLE_LABELS[employee.role]}
            </span>
          </div>
        </div>

        <div style={{ borderRadius: 10, border: '1px solid rgba(229,196,136,0.13)', background: 'rgba(255,255,255,0.03)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {employee.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Phone size={13} style={{ color: f.accent, opacity: 0.6, flexShrink: 0 }} />
              <a href={`tel:${employee.phone}`} style={{ fontSize: 13, color: '#f7ecd4', textDecoration: 'none' }}>{employee.phone}</a>
            </div>
          )}
          {employee.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Mail size={13} style={{ color: f.accent, opacity: 0.6, flexShrink: 0 }} />
              <a href={`mailto:${employee.email}`} style={{ fontSize: 12, color: '#f7ecd4', textDecoration: 'none', wordBreak: 'break-all' }}>{employee.email}</a>
            </div>
          )}
          {employee.hireDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Calendar size={13} style={{ color: f.accent, opacity: 0.6, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'rgba(247,236,212,0.65)' }}>В команде с {formatDate(employee.hireDate)}</span>
            </div>
          )}
        </div>
      </div>

      {canEdit && (
        <div style={{ borderTop: '1px solid rgba(229,196,136,0.1)', padding: '12px 16px', display: 'flex', gap: 8 }}>
          <button onClick={() => onEdit(employee)} style={{ flex: 1, height: 32, borderRadius: 8, border: `1px solid ${ROLE_FELT[employee.role].accent}40`, background: ROLE_FELT[employee.role].badge, color: ROLE_FELT[employee.role].text, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Pencil size={12} /> Редактировать
          </button>
          <button onClick={() => onDelete(employee.id)} style={{ height: 32, paddingInline: 12, borderRadius: 8, border: '1px solid rgba(252,129,129,0.3)', background: 'rgba(252,129,129,0.08)', color: '#fc8181', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Форма ────────────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: '', role: 'manager' as EmployeeRole, position: '', managerId: '', phone: '', email: '', hireDate: '' }

const iStyle: React.CSSProperties = { height: 34, width: '100%', borderRadius: 8, border: '1px solid rgba(229,196,136,0.22)', background: 'rgba(255,255,255,0.05)', color: '#f7ecd4', fontSize: 12, padding: '0 10px', outline: 'none' }
const lStyle: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 600, color: 'rgba(243,225,188,0.65)', marginBottom: 4 }
const sStyle: React.CSSProperties = { ...iStyle, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }

function EmployeeForm({ initial, employees, onSave, onCancel }: {
  initial?: Partial<typeof EMPTY_FORM>
  employees: Employee[]
  onSave: (data: typeof EMPTY_FORM) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial })
  const set = (k: keyof typeof EMPTY_FORM, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const valid = form.name.trim() && form.position.trim()

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><label style={lStyle}>Имя *</label><input style={iStyle} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Иван Иванов" /></div>
        <div><label style={lStyle}>Должность *</label><input style={iStyle} value={form.position} onChange={(e) => set('position', e.target.value)} placeholder="Менеджер по продажам" /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={lStyle}>Роль</label>
          <select style={sStyle} value={form.role} onChange={(e) => set('role', e.target.value)}>
            {(Object.entries(ROLE_LABELS) as [EmployeeRole, string][]).map(([k, v]) => (
              <option key={k} value={k} style={{ background: '#093b30' }}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lStyle}>Руководитель</label>
          <select style={sStyle} value={form.managerId} onChange={(e) => set('managerId', e.target.value)}>
            <option value="" style={{ background: '#093b30' }}>— нет —</option>
            {employees.map((e) => <option key={e.id} value={e.id} style={{ background: '#093b30' }}>{e.name}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div><label style={lStyle}>Телефон</label><input style={iStyle} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+7 (999) ..." /></div>
        <div><label style={lStyle}>Email</label><input style={iStyle} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="ivan@company.ru" /></div>
        <div><label style={lStyle}>Дата начала</label><input type="date" style={{ ...iStyle, colorScheme: 'dark' }} value={form.hireDate} onChange={(e) => set('hireDate', e.target.value)} /></div>
      </div>
      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        <button onClick={() => valid && onSave(form)} disabled={!valid} style={{ flex: 1, height: 32, borderRadius: 8, border: '1px solid rgba(242,207,141,0.4)', background: valid ? 'rgba(242,207,141,0.12)' : 'rgba(255,255,255,0.03)', color: valid ? '#f2cf8d' : 'rgba(247,236,212,0.25)', fontSize: 12, fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed' }}>
          Сохранить
        </button>
        <button onClick={onCancel} style={{ height: 32, paddingInline: 16, borderRadius: 8, border: '1px solid rgba(229,196,136,0.2)', background: 'transparent', color: 'rgba(247,236,212,0.5)', fontSize: 12, cursor: 'pointer' }}>
          Отмена
        </button>
      </div>
    </div>
  )
}

// ─── Цвета ролей для управления командой ──────────────────────────────────────

const MGMT_ROLE_STYLE: Record<UserRole, { accent: string; badge: string; text: string }> = {
  owner:    { accent: '#f2cf8d', badge: 'rgba(242,207,141,0.15)', text: '#f2cf8d' },
  director: { accent: '#7ec8e3', badge: 'rgba(126,200,227,0.15)', text: '#7ec8e3' },
  rop:      { accent: '#f4b96a', badge: 'rgba(244,185,106,0.15)', text: '#f4b96a' },
  marketer: { accent: '#c084fc', badge: 'rgba(192,132,252,0.15)', text: '#c084fc' },
  manager:  { accent: '#6fcf97', badge: 'rgba(111,207,151,0.15)', text: '#6fcf97' },
}

// ─── Вкладка управления аккаунтами ────────────────────────────────────────────

function AccountManagementTab({ currentUserId }: { currentUserId: string }) {
  const { toggleBlockUser, isUserBlocked } = useAuth()
  const agencyUsers = MOCK_USERS.filter((u) => u.accountType === 'agency')

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        padding: '12px 16px',
        borderRadius: 10,
        border: '1px solid rgba(244,185,106,0.3)',
        background: 'rgba(244,185,106,0.07)',
        fontSize: 12,
        color: 'rgba(244,185,106,0.9)',
        marginBottom: 4,
      }}>
        Заблокированный сотрудник не сможет войти в систему. Все его данные сохраняются.
      </div>

      {agencyUsers.map((user) => {
        const isSelf = user.id === currentUserId
        const blocked = isUserBlocked(user.id)
        const style = MGMT_ROLE_STYLE[user.role as UserRole] ?? MGMT_ROLE_STYLE.manager
        const initials = user.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

        return (
          <div
            key={user.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 16px',
              borderRadius: 12,
              border: `1px solid ${blocked ? 'rgba(252,129,129,0.25)' : 'rgba(229,196,136,0.15)'}`,
              background: blocked ? 'rgba(252,129,129,0.05)' : 'rgba(255,255,255,0.03)',
              opacity: blocked ? 0.75 : 1,
              transition: 'all 0.15s',
            }}
          >
            {/* Аватар */}
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: `radial-gradient(circle at 35% 35%, ${style.badge}, rgba(0,0,0,0.3))`,
              border: `1.5px solid ${style.accent}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 800, color: style.accent,
            }}>
              {initials}
            </div>

            {/* Инфо */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#f7ecd4' }}>{user.name}</span>
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: style.text, background: style.badge,
                  border: `1px solid ${style.accent}40`,
                  borderRadius: 5, padding: '2px 7px',
                }}>
                  {ROLE_LABEL[user.role as UserRole]}
                </span>
                {blocked && (
                  <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: '#fc8181', background: 'rgba(252,129,129,0.12)',
                    border: '1px solid rgba(252,129,129,0.3)',
                    borderRadius: 5, padding: '2px 7px',
                  }}>
                    Заблокирован
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: 'rgba(247,236,212,0.4)', marginTop: 2, display: 'block' }}>
                @{user.login}
              </span>
            </div>

            {/* Кнопка */}
            <button
              disabled={isSelf}
              onClick={() => toggleBlockUser(user.id)}
              title={isSelf ? 'Нельзя заблокировать себя' : blocked ? 'Разблокировать' : 'Заблокировать'}
              style={{
                height: 34, paddingInline: 14, borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 600, cursor: isSelf ? 'not-allowed' : 'pointer',
                opacity: isSelf ? 0.35 : 1,
                border: blocked
                  ? '1px solid rgba(111,207,151,0.4)'
                  : '1px solid rgba(252,129,129,0.35)',
                background: blocked
                  ? 'rgba(111,207,151,0.08)'
                  : 'rgba(252,129,129,0.08)',
                color: blocked ? '#6fcf97' : '#fc8181',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
            >
              {blocked
                ? <><ShieldCheck size={13} /> Разблокировать</>
                : <><ShieldOff size={13} /> Заблокировать</>
              }
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ─── Главная страница ──────────────────────────────────────────────────────────

export function PersonnelPage() {
  const { currentUser } = useAuth()
  const userRole = currentUser?.role ?? 'manager'
  const canEdit = userRole === 'owner' || userRole === 'director'
  const isOwner = userRole === 'owner'

  const [activeTab, setActiveTab] = useState<'org' | 'management'>('org')
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES)
  const [selected, setSelected] = useState<Employee | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Employee | null>(null)

  const roots = employees.filter((e) => !e.managerId)

  const handleAdd = (data: typeof EMPTY_FORM) => {
    setEmployees((prev) => [...prev, { id: `emp-${Date.now()}`, name: data.name.trim(), role: data.role, position: data.position.trim(), managerId: data.managerId || null, phone: data.phone || undefined, email: data.email || undefined, hireDate: data.hireDate || undefined }])
    setShowForm(false)
  }
  const handleEdit = (data: typeof EMPTY_FORM) => {
    if (!editTarget) return
    setEmployees((prev) => prev.map((e) => e.id === editTarget.id ? { ...e, name: data.name, role: data.role, position: data.position, managerId: data.managerId || null, phone: data.phone || undefined, email: data.email || undefined, hireDate: data.hireDate || undefined } : e))
    if (selected?.id === editTarget.id) setSelected(null)
    setEditTarget(null)
  }
  const handleDelete = (id: string) => { setEmployees((prev) => prev.filter((e) => e.id !== id && e.managerId !== id)); setSelected(null) }
  const startEdit = (emp: Employee) => { setEditTarget(emp); setSelected(null); setShowForm(false) }

  return (
    <div className="-m-6 lg:-m-8" style={{ display: 'flex', minHeight: 'calc(100vh - 0px)', position: 'relative', isolation: 'isolate', overflow: 'hidden' }}>
      {/* Фон сукно */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(130% 90% at 50% 46%, #1f765e 0%, #115745 45%, #093b30 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 0.55px, transparent 0.55px), radial-gradient(rgba(0,0,0,0.08) 0.7px, transparent 0.7px)', backgroundSize: '3px 3px, 5px 5px', backgroundPosition: '0 0, 1px 1px', mixBlendMode: 'soft-light', opacity: 0.5 }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, boxShadow: 'inset 0 0 0 2px rgba(236,194,112,0.18), inset 0 0 80px rgba(0,0,0,0.5)' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid rgba(229,196,136,0.13)', background: 'rgba(5,28,22,0.65)', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(244,205,133,0.45)', background: 'radial-gradient(circle at 30% 30%, rgba(255,233,176,0.34), rgba(111,68,23,0.26))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f7dc9d' }}>
              <Users size={16} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(243,225,188,0.65)', margin: 0 }}>КОМАНДА</p>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#fff4d7', margin: '2px 0 0', letterSpacing: '0.02em' }}>
                {activeTab === 'org' ? 'Оргструктура' : 'Управление командой'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Табы — только для owner */}
            {isOwner && (
              <div style={{ display: 'flex', borderRadius: 8, border: '1px solid rgba(229,196,136,0.2)', overflow: 'hidden' }}>
                {(['org', 'management'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      height: 30, paddingInline: 14, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                      background: activeTab === tab ? 'rgba(242,207,141,0.15)' : 'transparent',
                      color: activeTab === tab ? '#f2cf8d' : 'rgba(247,236,212,0.4)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tab === 'org' ? 'Оргструктура' : 'Управление'}
                  </button>
                ))}
              </div>
            )}
            {activeTab === 'org' && (
              <>
                <span style={{ fontSize: 12, color: 'rgba(247,236,212,0.45)' }}>{employees.length} сотрудников</span>
                {canEdit && !showForm && !editTarget && (
                  <button onClick={() => setShowForm(true)} style={{ height: 34, paddingInline: 14, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(242,207,141,0.38)', background: 'rgba(242,207,141,0.1)', color: '#f2cf8d', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    <UserPlus size={14} /> Добавить
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {activeTab === 'management' && isOwner
          ? (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <AccountManagementTab currentUserId={currentUser?.id ?? ''} />
            </div>
          ) : (
            <>
              {/* Form */}
              {(showForm || editTarget) && (
                <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(229,196,136,0.13)', background: 'rgba(5,28,22,0.7)', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(243,225,188,0.55)', marginBottom: 12 }}>
                    {editTarget ? 'Редактировать сотрудника' : 'Новый сотрудник'}
                  </p>
                  <EmployeeForm
                    initial={editTarget ? { name: editTarget.name, role: editTarget.role, position: editTarget.position, managerId: editTarget.managerId ?? '', phone: editTarget.phone ?? '', email: editTarget.email ?? '', hireDate: editTarget.hireDate ?? '' } : undefined}
                    employees={employees}
                    onSave={editTarget ? handleEdit : handleAdd}
                    onCancel={() => { setShowForm(false); setEditTarget(null) }}
                  />
                </div>
              )}

              {/* Tree */}
              <div style={{ flex: 1, overflow: 'auto', padding: '40px 40px 60px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 'max-content', gap: 0 }}>
                  {roots.map((root) => (
                    <OrgNode key={root.id} employee={root} allEmployees={employees} onSelect={setSelected} selectedId={selected?.id ?? null} />
                  ))}
                </div>
              </div>
            </>
          )
        }
      </div>

      {/* Drawer */}
      {selected && (
        <div style={{ position: 'relative', zIndex: 10, width: 272, flexShrink: 0 }}>
          <EmployeeDrawer employee={selected} canEdit={canEdit} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={startEdit} />
        </div>
      )}
    </div>
  )
}
