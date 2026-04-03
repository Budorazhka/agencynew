import { useState, useMemo, useEffect, useRef, type CSSProperties } from 'react'
import { Plus, Zap, Clock, AlertTriangle, CheckCircle, Circle, MapPin, ListChecks, Paperclip, ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal'
import { useAuth } from '@/context/AuthContext'
import { TASKS_MOCK } from '@/data/tasks-mock'
import {
  PRIORITY_LABELS, PRIORITY_COLORS,
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

const backToTasksHubBtn: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  height: 36,
  padding: '0 14px',
  background: 'rgba(201,168,76,0.1)',
  border: '1px solid rgba(201,168,76,0.35)',
  borderRadius: 10,
  color: '#e6c364',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.06em',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

type Filter = 'my' | 'today' | 'overdue' | 'team' | 'auto' | 'all'

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  pending:     <Circle size={14} color="rgba(255,255,255,0.4)" />,
  in_progress: <Clock size={14} color="#60a5fa" />,
  done:        <CheckCircle size={14} color="#4ade80" />,
  overdue:     <AlertTriangle size={14} color="#f87171" />,
}

export function TasksPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const createSuccessRef = useRef(false)
  const { currentUser } = useAuth()
  const [filter, setFilter] = useState<Filter>('my')
  const [tasks, setTasks] = useState(TASKS_MOCK)
  const [createOpen, setCreateOpen] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const p = location.pathname
    if (p.includes('/tasks/new')) setCreateOpen(true)
    if (p.includes('/tasks/my')) setFilter('my')
    else if (p.includes('/tasks/team')) setFilter('team')
    else if (p.includes('/tasks/auto')) setFilter('auto')
  }, [location.pathname])

  const filtered = useMemo(() => {
    switch (filter) {
      case 'my':
        return tasks.filter(t => t.assignedToId === currentUser?.id && t.status !== 'done')
      case 'today':
        return tasks.filter(t => t.dueDate === today && t.status !== 'done')
      case 'overdue':
        return tasks.filter(t => t.status === 'overdue' || (t.dueDate < today && t.status !== 'done'))
      case 'team':
        return tasks.filter(t => t.status !== 'done')
      case 'auto':
        return tasks.filter(t => t.isAutomatic)
      default:
        return tasks
    }
  }, [filter, tasks, currentUser?.id, today])

  function toggleDone(taskId: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return { ...t, status: t.status === 'done' ? 'pending' : 'done' }
    }))
  }

  const FILTERS: { key: Filter; label: string; count: () => number }[] = [
    { key: 'my', label: 'Мои задачи', count: () => tasks.filter(t => t.assignedToId === currentUser?.id && t.status !== 'done').length },
    { key: 'today', label: 'Сегодня', count: () => tasks.filter(t => t.dueDate === today && t.status !== 'done').length },
    { key: 'overdue', label: 'Просроченные', count: () => tasks.filter(t => t.status === 'overdue' || (t.dueDate < today && t.status !== 'done')).length },
    { key: 'auto', label: 'Автоматические', count: () => tasks.filter(t => t.isAutomatic).length },
    { key: 'team', label: 'Вся команда', count: () => tasks.filter(t => t.status !== 'done').length },
    { key: 'all', label: 'Все', count: () => tasks.length },
  ]

  return (
    <DashboardShell topBack={{ label: 'Назад', route: '/dashboard/tasks' }}>
      <div style={{ padding: '28px 28px 40px', maxWidth: 1000 }}>
        <div style={{ marginBottom: 20 }}>
          <button type="button" onClick={() => navigate('/dashboard/tasks')} style={backToTasksHubBtn}>
            <ArrowLeft size={20} strokeWidth={2} />
            Назад
          </button>
        </div>
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

        {/* Task list */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center' as const, color: C.whiteLow }}>
              Задач не найдено
            </div>
          )}
          {filtered.map(task => (
            <TaskRow key={task.id} task={task} onToggle={() => toggleDone(task.id)} />
          ))}
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

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
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
    }}>
      {/* Done toggle */}
      <div onClick={onToggle} style={{ cursor: 'pointer', marginTop: 1, flexShrink: 0 }}>
        {STATUS_ICON[task.status]}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
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
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>
        </div>

        {task.description && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{task.description}</div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' as const }}>
          {task.taskCategory === 'personal' && (
            <span style={{ fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, color: '#e6c364' }}>
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
