import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Phone, Mail, Calendar, X, Pencil, Trash2, Users, ShieldOff, ShieldCheck, ArrowLeft } from 'lucide-react'
import { useAuth, MOCK_USERS } from '@/context/AuthContext'
import {
  MOCK_EMPLOYEES,
  ROLE_LABELS,
  type Employee,
  type EmployeeRole,
} from '@/data/personnel-mock'
import { ROLE_LABEL } from '@/lib/permissions'
import type { UserRole } from '@/types/auth'

// ─── Цвета ролей (в тон дашборду: #031712, золото, изумруд) ───────────────────

const ROLE_FELT: Record<EmployeeRole, { suit: string; accent: string; badge: string; text: string; glow: string }> = {
  owner:    { suit: '♛', accent: '#e6c364', badge: 'rgba(201,168,76,0.12)', text: '#e6c364', glow: 'rgba(201,168,76,0.22)' },
  director: { suit: '◆', accent: '#7dd3fc', badge: 'rgba(125,211,252,0.1)', text: '#bae6fd', glow: 'rgba(125,211,252,0.18)' },
  rop:      { suit: '♠', accent: '#fbbf24', badge: 'rgba(251,191,36,0.1)', text: '#fcd34d', glow: 'rgba(251,191,36,0.18)' },
  manager:  { suit: '♣', accent: '#6ee7b7', badge: 'rgba(110,231,183,0.1)', text: '#a7f3d0', glow: 'rgba(52,211,153,0.15)' },
}

const LINE = 'rgba(201,168,76,0.2)'
const CARD_BORDER = 'rgba(201,168,76,0.28)'
const TEXT_MAIN = '#d0e8df'
const TEXT_MUTED = 'rgba(208,232,223,0.62)'

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
        border: `1px solid ${isSelected ? f.accent : CARD_BORDER}`,
        background: isSelected ? 'var(--green-card-hover)' : 'var(--green-card)',
        boxShadow: isSelected
          ? `0 0 0 1px ${f.glow}, 0 8px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)`
          : '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 8px',
        position: 'relative',
        transition: 'all 0.15s',
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
          background: `radial-gradient(circle at 35% 35%, ${f.badge}, rgba(3,23,18,0.5))`,
          border: `1.5px solid ${f.accent}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 19, fontWeight: 800, color: f.accent, letterSpacing: '-0.02em',
          boxShadow: `0 0 12px ${f.glow}`,
          position: 'relative', zIndex: 1,
        }}>
          {initials}
        </div>

        {/* Имя */}
        <div style={{ textAlign: 'center', lineHeight: 1.3, position: 'relative', zIndex: 1 }}>
          {employee.name.split(' ').map((part, i) => (
            <div key={i} style={{ fontSize: i === 0 ? 11.5 : 10.5, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? TEXT_MAIN : TEXT_MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 116 }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a1f1a', borderLeft: '1px solid var(--green-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(16,74,42,0.5)' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(208,232,223,0.55)', margin: 0 }}>Сотрудник</p>
        <button onClick={onClose} style={{ padding: 6, borderRadius: 8, color: 'rgba(208,232,223,0.45)', background: 'none', border: 'none', cursor: 'pointer' }}>
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
            <p style={{ fontWeight: 700, color: TEXT_MAIN, fontSize: 15, lineHeight: 1.3, margin: 0 }}>{employee.name}</p>
            <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 3 }}>{employee.position}</p>
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

        <div style={{ borderRadius: 10, border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(3,23,18,0.5)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {employee.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Phone size={13} style={{ color: f.accent, opacity: 0.6, flexShrink: 0 }} />
              <a href={`tel:${employee.phone}`} style={{ fontSize: 13, color: TEXT_MAIN, textDecoration: 'none' }}>{employee.phone}</a>
            </div>
          )}
          {employee.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Mail size={13} style={{ color: f.accent, opacity: 0.6, flexShrink: 0 }} />
              <a href={`mailto:${employee.email}`} style={{ fontSize: 12, color: TEXT_MAIN, textDecoration: 'none', wordBreak: 'break-all' }}>{employee.email}</a>
            </div>
          )}
          {employee.hireDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Calendar size={13} style={{ color: f.accent, opacity: 0.6, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: TEXT_MUTED }}>В команде с {formatDate(employee.hireDate)}</span>
            </div>
          )}
        </div>
      </div>

      {canEdit && (
        <div style={{ borderTop: '1px solid rgba(16,74,42,0.5)', padding: '12px 16px', display: 'flex', gap: 8 }}>
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

const iStyle: React.CSSProperties = { height: 34, width: '100%', borderRadius: 8, border: '1px solid rgba(30,74,42,0.85)', background: '#0a1f1a', color: '#d0e8df', fontSize: 12, padding: '0 10px', outline: 'none' }
const lStyle: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 600, color: 'rgba(208,232,223,0.55)', marginBottom: 4 }
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
              <option key={k} value={k} style={{ background: '#0a1f1a' }}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lStyle}>Руководитель</label>
          <select style={sStyle} value={form.managerId} onChange={(e) => set('managerId', e.target.value)}>
            <option value="" style={{ background: '#0a1f1a' }}>— нет —</option>
            {employees.map((e) => <option key={e.id} value={e.id} style={{ background: '#0a1f1a' }}>{e.name}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div><label style={lStyle}>Телефон</label><input style={iStyle} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+7 (999) ..." /></div>
        <div><label style={lStyle}>Email</label><input style={iStyle} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="ivan@company.ru" /></div>
        <div><label style={lStyle}>Дата начала</label><input type="date" style={{ ...iStyle, colorScheme: 'dark' }} value={form.hireDate} onChange={(e) => set('hireDate', e.target.value)} /></div>
      </div>
      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        <button onClick={() => valid && onSave(form)} disabled={!valid} style={{ flex: 1, height: 32, borderRadius: 8, border: '1px solid rgba(201,168,76,0.45)', background: valid ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)', color: valid ? '#e6c364' : 'rgba(208,232,223,0.25)', fontSize: 12, fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed' }}>
          Сохранить
        </button>
        <button onClick={onCancel} style={{ height: 32, paddingInline: 16, borderRadius: 8, border: '1px solid rgba(30,74,42,0.8)', background: 'transparent', color: 'rgba(208,232,223,0.5)', fontSize: 12, cursor: 'pointer' }}>
          Отмена
        </button>
      </div>
    </div>
  )
}

// ─── Цвета ролей для управления командой ──────────────────────────────────────

const MGMT_ROLE_STYLE: Record<UserRole, { accent: string; badge: string; text: string }> = {
  owner:            { accent: '#f2cf8d', badge: 'rgba(242,207,141,0.15)', text: '#f2cf8d' },
  director:         { accent: '#7ec8e3', badge: 'rgba(126,200,227,0.15)', text: '#7ec8e3' },
  rop:              { accent: '#f4b96a', badge: 'rgba(244,185,106,0.15)', text: '#f4b96a' },
  marketer:         { accent: '#c084fc', badge: 'rgba(192,132,252,0.15)', text: '#c084fc' },
  manager:          { accent: '#6fcf97', badge: 'rgba(111,207,151,0.15)', text: '#6fcf97' },
  lawyer:           { accent: '#22d3ee', badge: 'rgba(34,211,238,0.15)', text: '#22d3ee' },
  procurement_head: { accent: '#fb923c', badge: 'rgba(251,146,60,0.15)', text: '#fb923c' },
  partner:          { accent: '#f472b6', badge: 'rgba(244,114,182,0.15)', text: '#f472b6' },
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
        border: '1px solid rgba(201,168,76,0.28)',
        background: 'rgba(201,168,76,0.06)',
        fontSize: 12,
        color: 'rgba(208,232,223,0.85)',
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
              border: `1px solid ${blocked ? 'rgba(252,129,129,0.25)' : 'rgba(201,168,76,0.2)'}`,
              background: blocked ? 'rgba(252,129,129,0.05)' : 'var(--green-card)',
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
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_MAIN }}>{user.name}</span>
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
  const navigate = useNavigate()
  const backRoute = '/dashboard/team'

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
    <div className="flex w-full min-w-0 flex-row items-stretch bg-[#031712] text-[#d0e8df]">
      {/* Один фон в потоке: не наслаиваем absolute-слои на .app-theme-felt (иначе «два экрана») */}
      <div className="relative flex min-h-full min-w-0 flex-1 flex-col">
        {/* Header — sticky: при прокрутке страницы шапка остаётся; прокрутка на <main> в App */}
        <div
          className="border-b border-emerald-900/25 shadow-[0_1px_0_rgba(201,168,76,0.1)]"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            background: 'rgba(3,23,18,0.88)',
            backdropFilter: 'blur(12px)',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <button
              type="button"
              onClick={() => navigate(backRoute)}
              className="shrink-0 rounded-[10px] border border-[#e6c364]/35 bg-[#e6c364]/10 text-[#e6c364] hover:bg-[#e6c364]/18"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: 34,
                padding: '0 12px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <ArrowLeft size={16} strokeWidth={2} />
              Назад
            </button>
            <div
              className="flex items-center justify-center rounded-full border border-[#e6c364]/35 bg-[#0a1f1a] text-[#e6c364]"
              style={{ width: 34, height: 34 }}
            >
              <Users size={16} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(208,232,223,0.5)', margin: 0 }}>КОМАНДА</p>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#d0e8df', margin: '2px 0 0', letterSpacing: '0.02em' }}>
                {activeTab === 'org' ? 'Оргструктура' : 'Управление командой'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Табы — только для owner */}
            {isOwner && (
              <div className="flex overflow-hidden rounded-lg border border-emerald-900/30">
                {(['org', 'management'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      height: 30, paddingInline: 14, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                      background: activeTab === tab ? 'rgba(201,168,76,0.14)' : 'transparent',
                      color: activeTab === tab ? '#e6c364' : 'rgba(208,232,223,0.45)',
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
                <span style={{ fontSize: 12, color: 'rgba(208,232,223,0.45)' }}>{employees.length} сотрудников</span>
                {canEdit && !showForm && !editTarget && (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="rounded-lg border border-[#e6c364]/45 bg-[#e6c364]/10 text-[#e6c364] hover:bg-[#e6c364]/18"
                    style={{ height: 34, paddingInline: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    <UserPlus size={14} /> Добавить
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {activeTab === 'management' && isOwner
          ? (
            <div style={{ paddingBottom: 32 }}>
              <AccountManagementTab currentUserId={currentUser?.id ?? ''} />
            </div>
          ) : (
            <>
              {/* Form */}
              {(showForm || editTarget) && (
                <div className="border-b border-emerald-900/25" style={{ padding: '16px 24px', background: 'rgba(10,31,26,0.92)', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(208,232,223,0.5)', marginBottom: 12 }}>
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

              {/* Tree — высота по контенту; горизонтальный скролл при узком окне */}
              <div
                style={{
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  padding: '40px 24px 80px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
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
        <div style={{ position: 'relative', zIndex: 10, width: 272, flexShrink: 0, alignSelf: 'stretch' }}>
          <EmployeeDrawer employee={selected} canEdit={canEdit} onClose={() => setSelected(null)} onDelete={handleDelete} onEdit={startEdit} />
        </div>
      )}
    </div>
  )
}
