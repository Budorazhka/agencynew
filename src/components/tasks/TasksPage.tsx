import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Zap, Clock, AlertTriangle, CheckCircle, Circle, MapPin, ListChecks, Paperclip, Flame, Target, Timer, Archive } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal'
import { useAuth } from '@/context/AuthContext'
import { TASKS_MOCK } from '@/data/tasks-mock'
import {
  PRIORITY_COLORS, STATUS_LABELS,
  type Task, type TaskStatus
} from '@/types/tasks'

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
  green: '#4ade80',
  red: '#f87171',
  orange: '#fb923c',
}

type Filter = 'my' | 'today' | 'overdue' | 'team' | 'auto' | 'archive' | 'all'
type EisenhowerKey = 'do' | 'schedule' | 'delegate' | 'eliminate'

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  pending:     <Circle size={14} color="rgba(255,255,255,0.4)" />,
  in_progress: <Clock size={14} color="#60a5fa" />,
  done:        <CheckCircle size={14} color="#4ade80" />,
  overdue:     <AlertTriangle size={14} color="#f87171" />,
}

const EISENHOWER_PRIORITY_LABELS: Record<Task['priority'], string> = {
  critical: 'Срочно и важно',
  high: 'Срочно, не важно',
  medium: 'Важно, не срочно',
  low: 'Не срочно и не важно',
}

export function TasksPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const createSuccessRef = useRef(false)
  const { currentUser } = useAuth()
  const [filter, setFilter] = useState<Filter>('my')
  const [tasks, setTasks] = useState(TASKS_MOCK)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const p = location.pathname
    if (p.includes('/tasks/new')) setCreateOpen(true)
    if (p.includes('/tasks/my')) setFilter('my')
    else if (p.includes('/tasks/team')) setFilter('team')
    else if (p.includes('/tasks/auto')) setFilter('auto')
    else if (p.includes('/tasks/archive')) setFilter('archive')
  }, [location.pathname])

  const filtered = useMemo(() => {
    const isPersonalTask = (t: Task) => t.taskCategory === 'personal' || t.entityType === 'none'
    const isMyScope = (t: Task) =>
      isPersonalTask(t) || t.assignedToId === currentUser?.id
    switch (filter) {
      case 'my':
        return tasks.filter(t => isMyScope(t) && t.status !== 'done')
      case 'today':
        return tasks.filter(t => isMyScope(t) && t.dueDate === today && t.status !== 'done')
      case 'overdue':
        return tasks.filter(t => isMyScope(t) && (t.status === 'overdue' || (t.dueDate < today && t.status !== 'done')))
      case 'team':
        return tasks.filter(t => t.status !== 'done')
      case 'auto':
        return tasks.filter(t => isMyScope(t) && t.isAutomatic && t.status !== 'done')
      case 'archive':
        return tasks.filter(t => isMyScope(t) && t.status === 'done')
      default:
        return tasks
    }
  }, [filter, tasks, currentUser?.id, today])

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedTaskId(null)
      return
    }
    setSelectedTaskId(prev => (prev && filtered.some(t => t.id === prev) ? prev : filtered[0].id))
  }, [filtered])

  const selectedTask = useMemo(
    () => filtered.find(t => t.id === selectedTaskId) ?? null,
    [filtered, selectedTaskId],
  )

  const eisenhower = useMemo(() => {
    const buckets: Record<EisenhowerKey, Task[]> = {
      do: [],
      schedule: [],
      delegate: [],
      eliminate: [],
    }
    for (const t of filtered) {
      if (t.status === 'done') continue
      if (t.priority === 'critical') buckets.do.push(t)
      else if (t.priority === 'high') buckets.delegate.push(t)
      else if (t.priority === 'medium') buckets.schedule.push(t)
      else buckets.eliminate.push(t)
    }
    return buckets
  }, [filtered])

  function toggleDone(taskId: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return { ...t, status: t.status === 'done' ? 'pending' : 'done' }
    }))
  }

  const FILTERS: { key: Filter; label: string; count: () => number }[] = [
    { key: 'my', label: 'Мои задачи', count: () => tasks.filter(t => (t.taskCategory === 'personal' || t.entityType === 'none' || t.assignedToId === currentUser?.id) && t.status !== 'done').length },
    { key: 'today', label: 'Сегодня', count: () => tasks.filter(t => (t.taskCategory === 'personal' || t.entityType === 'none' || t.assignedToId === currentUser?.id) && t.dueDate === today && t.status !== 'done').length },
    { key: 'overdue', label: 'Просроченные', count: () => tasks.filter(t => (t.taskCategory === 'personal' || t.entityType === 'none' || t.assignedToId === currentUser?.id) && (t.status === 'overdue' || (t.dueDate < today && t.status !== 'done'))).length },
    { key: 'auto', label: 'Автоматические', count: () => tasks.filter(t => (t.taskCategory === 'personal' || t.entityType === 'none' || t.assignedToId === currentUser?.id) && t.isAutomatic && t.status !== 'done').length },
    { key: 'archive', label: 'Архив', count: () => tasks.filter(t => (t.taskCategory === 'personal' || t.entityType === 'none' || t.assignedToId === currentUser?.id) && t.status === 'done').length },
    { key: 'team', label: 'Вся команда', count: () => tasks.filter(t => t.status !== 'done').length },
    { key: 'all', label: 'Все', count: () => tasks.length },
  ]

  return (
    <DashboardShell>
      <div style={{ padding: '28px 28px 40px', width: '100%', maxWidth: 'none' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.white, letterSpacing: '-0.01em' }}>Задачи</div>
            <div style={{ fontSize: 13, color: C.whiteLow, marginTop: 4 }}>Личный и командный трекер задач</div>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px',
              background: 'var(--gold-dark)',
              border: 'none',
              borderRadius: 7,
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              cursor: 'pointer',
            }}
          >
            <Plus size={20} strokeWidth={2} /> Новая задача
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' as const }}>
          {FILTERS.map(f => {
            const count = f.count()
            const isOverdue = f.key === 'overdue'
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 6,
                  border: `1px solid ${filter === f.key ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  background: filter === f.key ? 'rgba(201,168,76,0.1)' : 'transparent',
                  color: filter === f.key ? C.gold : (isOverdue && count > 0 ? C.red : C.whiteLow),
                  fontSize: 12,
                  fontWeight: filter === f.key ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {isOverdue && count > 0 && <AlertTriangle size={11} />}
                {f.label}
                {count > 0 && (
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: isOverdue ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.1)',
                    color: isOverdue ? C.red : C.whiteLow,
                    padding: '1px 6px',
                    borderRadius: 10,
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Workspace */}
        <div
          style={{
            minHeight: 'calc(100vh - 220px)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,2.5fr) minmax(300px,1fr)',
            gap: 12,
            alignItems: 'start',
          }}
        >
          {/* Left: matrix + list */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                background: C.card,
                padding: 10,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
                <MatrixCard
                  title="Сделать сейчас"
                  subtitle="Срочно + важно"
                  icon={<Flame size={14} color="#f87171" />}
                  accent="rgba(248,113,113,0.35)"
                  items={eisenhower.do}
                  onPick={setSelectedTaskId}
                />
                <MatrixCard
                  title="Запланировать"
                  subtitle="Не срочно + важно"
                  icon={<Target size={14} color="#60a5fa" />}
                  accent="rgba(96,165,250,0.35)"
                  items={eisenhower.schedule}
                  onPick={setSelectedTaskId}
                />
                <MatrixCard
                  title="Делегировать"
                  subtitle="Срочно + не важно"
                  icon={<Timer size={14} color="#fb923c" />}
                  accent="rgba(251,146,60,0.35)"
                  items={eisenhower.delegate}
                  onPick={setSelectedTaskId}
                />
                <MatrixCard
                  title="Снизить приоритет"
                  subtitle="Не срочно + не важно"
                  icon={<Archive size={14} color="#94a3b8" />}
                  accent="rgba(148,163,184,0.35)"
                  items={eisenhower.eliminate}
                  onPick={setSelectedTaskId}
                />
              </div>
            </div>

            <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center' as const, color: C.whiteLow }}>
                  Задач не найдено
                </div>
              )}
              <div style={{ minHeight: 0, maxHeight: '52vh', overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={() => toggleDone(task.id)}
                    active={selectedTaskId === task.id}
                    onOpen={() => setSelectedTaskId(task.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: details */}
          <TaskDetailsPanel task={selectedTask} today={today} total={filtered.length} />
        </div>
      </div>

      <CreateTaskModal
        open={createOpen}
        onOpenChange={open => {
          setCreateOpen(open)
          if (!open) {
            if (createSuccessRef.current) {
              createSuccessRef.current = false
              return
            }
            if (location.pathname.includes('/tasks/new')) {
              navigate('/dashboard/tasks')
            }
          }
        }}
        onCreate={task => {
          createSuccessRef.current = true
          setTasks(prev => [task, ...prev])
          navigate('/dashboard/tasks/my', { replace: true })
        }}
      />
    </DashboardShell>
  )
}

function TaskRow({
  task,
  onToggle,
  active,
  onOpen,
}: {
  task: Task
  onToggle: () => void
  active?: boolean
  onOpen?: () => void
}) {
  const isOverdue = task.status === 'overdue' || (task.dueDate < new Date().toISOString().split('T')[0] && task.status !== 'done')
  const accentColor = task.colorHex && task.colorHex.length >= 4 ? task.colorHex : PRIORITY_COLORS[task.priority]
  const priorityColor = PRIORITY_COLORS[task.priority]

  return (
    <div style={{
      background: 'var(--green-card)',
      border: `1px solid ${isOverdue ? 'rgba(248,113,113,0.2)' : 'var(--green-border)'}`,
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: 8,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      boxShadow: active ? 'inset 0 0 0 1px rgba(201,168,76,0.45)' : 'none',
      cursor: onOpen ? 'pointer' : 'default',
    }}>
      {/* Done toggle */}
      <div onClick={onToggle} style={{ cursor: 'pointer', marginTop: 1, flexShrink: 0 }}>
        {STATUS_ICON[task.status]}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }} onClick={onOpen}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: task.status === 'done' ? 'rgba(255,255,255,0.35)' : '#ffffff',
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
          }}>
            {task.isAutomatic && <Zap size={12} color="#fb923c" style={{ display: 'inline', marginRight: 5 }} />}
            {task.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 10,
              background: priorityColor.startsWith('#') ? `${priorityColor}22` : 'rgba(255,255,255,0.08)',
              border: priorityColor.startsWith('#') ? `1px solid ${priorityColor}55` : '1px solid rgba(255,255,255,0.12)',
              color: priorityColor,
            }}>
              {EISENHOWER_PRIORITY_LABELS[task.priority]}
            </span>
          </div>
        </div>

        {task.description && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{task.description}</div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' as const }}>
          {task.taskCategory === 'personal' && (
            <span style={{ fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--gold)' }}>
              <MapPin size={11} /> Личная
            </span>
          )}

          {/* Assignee */}
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
            👤 {task.assignedToName}
          </span>

          {task.startDate && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={10} />
              Начало: {task.startDate}{task.startTime ? ` ${task.startTime}` : ''}
            </span>
          )}

          {/* Due date */}
          <span style={{ fontSize: 11, color: isOverdue ? '#f87171' : 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 3 }}>
            {isOverdue && <AlertTriangle size={10} />}
            До: {task.dueDate}{task.dueTime ? ` ${task.dueTime}` : ''}
          </span>

          {task.subtasks && task.subtasks.length > 0 && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ListChecks size={11} />
              Подзадач: {task.subtasks.length}
            </span>
          )}

          {task.attachmentFileNames && task.attachmentFileNames.length > 0 && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Paperclip size={11} />
              {task.attachmentFileNames.length} файл(ов)
            </span>
          )}

          {/* Entity link */}
          {task.entityLabel && (
            <span style={{ fontSize: 11, color: 'rgba(201,168,76,0.6)' }}>
              🔗 {task.entityLabel}
            </span>
          )}

          {/* Auto badge */}
          {task.isAutomatic && (
            <span style={{ fontSize: 10, color: '#fb923c', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Zap size={10} /> Автоматическая
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function MatrixCard({
  title,
  subtitle,
  icon,
  accent,
  items,
  onPick,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  accent: string
  items: Task[]
  onPick: (id: string) => void
}) {
  return (
    <div
      style={{
        border: `1px solid ${accent}`,
        borderRadius: 10,
        padding: 10,
        background: 'rgba(0,0,0,0.15)',
        minHeight: 220,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {icon}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{title}</div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{items.length}</span>
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>{subtitle}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 156, overflowY: 'auto', paddingRight: 2 }}>
        {items.slice(0, 8).map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(t.id)}
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.88)',
              borderRadius: 6,
              textAlign: 'left',
              padding: '6px 8px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {t.title}
          </button>
        ))}
        {items.length === 0 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Пусто</span>}
      </div>
    </div>
  )
}

function TaskDetailsPanel({
  task,
  today,
  total,
}: {
  task: Task | null
  today: string
  total: number
}) {
  if (!task) {
    return (
      <div style={{ border: '1px solid var(--green-border)', borderRadius: 10, background: 'var(--green-card)', padding: 16, color: 'rgba(255,255,255,0.65)' }}>
        Выбери задачу слева, чтобы увидеть детали.
      </div>
    )
  }

  const isOverdue = task.status === 'overdue' || (task.dueDate < today && task.status !== 'done')
  return (
    <div style={{ minWidth: 0, border: '1px solid var(--green-border)', borderRadius: 10, background: 'var(--green-card)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 440, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Карточка задачи</div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>В списке: {total}</span>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10, background: 'rgba(0,0,0,0.12)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 5 }}>{task.title}</div>
        {task.description && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>{task.description}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Meta label="Статус" value={STATUS_LABELS[task.status]} warn={isOverdue} />
          <Meta label="Приоритет" value={EISENHOWER_PRIORITY_LABELS[task.priority]} />
          <Meta label="Исполнитель" value={task.assignedToName} />
          <Meta label="Создал" value={task.createdByName} />
          <Meta label="Срок" value={`${task.dueDate}${task.dueTime ? ` ${task.dueTime}` : ''}`} warn={isOverdue} />
          <Meta label="Тип" value={task.isAutomatic ? 'Автоматическая' : 'Ручная'} />
        </div>
      </div>

      {task.entityLabel && (
        <div style={{ border: '1px solid rgba(201,168,76,0.25)', borderRadius: 8, padding: 10, color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
          Связано: {task.entityLabel}
        </div>
      )}

      {task.subtasks && task.subtasks.length > 0 && (
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Подзадачи</div>
          <ul style={{ margin: 0, paddingLeft: 16, color: 'rgba(255,255,255,0.72)', fontSize: 12 }}>
            {task.subtasks.map(st => <li key={st.id}>{st.title}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

function Meta({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '7px 8px', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{label}</div>
      <div style={{ fontSize: 12, color: warn ? '#f87171' : 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{value}</div>
    </div>
  )
}
