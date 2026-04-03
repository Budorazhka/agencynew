import { useState } from 'react'
import { AlarmClock, Plus, Check, Trash2, Briefcase, User, CheckSquare, Bookmark } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { REMINDERS_MOCK, type Reminder } from '@/data/info-mock'

const C = {
  gold: 'var(--gold)',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.7)',
  whiteLow: 'rgba(255,255,255,0.4)',
  border: 'var(--green-border)',
  card: 'var(--green-card)',
}

const PRIORITY_META = {
  high:   { label: 'Высокий',  color: '#f87171' },
  medium: { label: 'Средний',  color: '#fb923c' },
  low:    { label: 'Низкий',   color: '#4ade80' },
}

const ENTITY_ICON: Record<string, React.ReactNode> = {
  deal:    <Briefcase size={10} />,
  client:  <User size={10} />,
  task:    <CheckSquare size={10} />,
  booking: <Bookmark size={10} />,
}

function formatDue(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffH = Math.round(diffMs / 3_600_000)
  if (diffH < 0) return { text: 'Просрочено', color: '#ef4444' }
  if (diffH < 3) return { text: `через ${diffH}ч`, color: '#fb923c' }
  if (diffH < 24) return { text: `сегодня в ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`, color: C.gold }
  return { text: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), color: C.whiteLow }
}

type FilterTab = 'all' | 'pending' | 'done'

export function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>(REMINDERS_MOCK)
  const [filter, setFilter] = useState<FilterTab>('pending')
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDue, setNewDue] = useState('')
  const [newPriority, setNewPriority] = useState<Reminder['priority']>('medium')

  function toggleDone(id: string) {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r))
  }

  function remove(id: string) {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  function addReminder() {
    if (!newTitle.trim() || !newDue) return
    setReminders(prev => [...prev, {
      id: `rem-${Date.now()}`,
      title: newTitle.trim(),
      dueAt: newDue,
      done: false,
      priority: newPriority,
    }])
    setNewTitle('')
    setNewDue('')
    setNewPriority('medium')
    setShowAdd(false)
  }

  const visible = reminders.filter(r =>
    filter === 'all' ? true : filter === 'done' ? r.done : !r.done
  )

  const pendingCount = reminders.filter(r => !r.done).length
  const overdueCount = reminders.filter(r => !r.done && new Date(r.dueAt) < new Date()).length

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: 'pending', label: `Активные (${pendingCount})` },
    { key: 'done',    label: 'Выполненные' },
    { key: 'all',     label: 'Все' },
  ]

  return (
    <DashboardShell topBack={{ label: 'Назад', route: '/dashboard/info' }}>
      <div style={{ padding: '24px 28px 48px', maxWidth: 700 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 4 }}>Напоминания</div>
            <div style={{ fontSize: 12, color: C.whiteLow }}>
              {overdueCount > 0
                ? <span style={{ color: '#f87171' }}>⚠ {overdueCount} просрочено · </span>
                : null
              }
              {pendingCount} активных
            </div>
          </div>
          <button
            onClick={() => setShowAdd(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
              color: C.gold,
            }}
          >
            <Plus size={12} /> Добавить
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Название напоминания..."
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, padding: '8px 12px', fontSize: 13, color: C.white, fontFamily: 'inherit', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="datetime-local"
                  value={newDue}
                  onChange={e => setNewDue(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, padding: '7px 10px', fontSize: 12, color: C.whiteMid, fontFamily: 'inherit', outline: 'none', colorScheme: 'dark' }}
                />
                {(['high', 'medium', 'low'] as Reminder['priority'][]).map(p => (
                  <button key={p} onClick={() => setNewPriority(p)} style={{
                    padding: '5px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    background: newPriority === p ? `${PRIORITY_META[p].color}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${newPriority === p ? `${PRIORITY_META[p].color}55` : 'rgba(255,255,255,0.1)'}`,
                    color: newPriority === p ? PRIORITY_META[p].color : C.whiteLow,
                  }}>
                    {PRIORITY_META[p].label}
                  </button>
                ))}
                <button
                  onClick={addReminder}
                  disabled={!newTitle.trim() || !newDue}
                  style={{
                    padding: '7px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: !newTitle.trim() || !newDue ? 'default' : 'pointer',
                    background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
                    color: '#4ade80', opacity: !newTitle.trim() || !newDue ? 0.4 : 1,
                  }}
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
          {FILTER_TABS.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)} style={{
              padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
              fontWeight: filter === t.key ? 700 : 400,
              background: filter === t.key ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: filter === t.key ? C.gold : C.whiteLow,
              borderBottom: filter === t.key ? '2px solid var(--gold)' : '2px solid transparent',
            }}>{t.label}</button>
          ))}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: C.whiteLow, fontSize: 13 }}>Нет напоминаний</div>
          )}
          {visible.map(r => {
            const due = formatDue(r.dueAt)
            const pMeta = PRIORITY_META[r.priority]
            const isOverdue = !r.done && new Date(r.dueAt) < new Date()
            return (
              <div key={r.id} style={{
                background: r.done ? 'rgba(255,255,255,0.02)' : C.card,
                border: `1px solid ${isOverdue ? 'rgba(248,113,113,0.3)' : C.border}`,
                borderRadius: 10, padding: '12px 14px',
                opacity: r.done ? 0.6 : 1,
                transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Done button */}
                  <button
                    onClick={() => toggleDone(r.id)}
                    style={{
                      flexShrink: 0, width: 22, height: 22, borderRadius: '50%', marginTop: 1,
                      background: r.done ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
                      border: `1.5px solid ${r.done ? '#4ade80' : 'rgba(255,255,255,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}
                  >
                    {r.done && <Check size={11} color="#4ade80" />}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: r.done ? C.whiteLow : C.white, textDecoration: r.done ? 'line-through' : 'none', marginBottom: 4 }}>
                      {r.title}
                    </div>
                    {r.body && !r.done && (
                      <div style={{ fontSize: 11, color: C.whiteLow, marginBottom: 4 }}>{r.body}</div>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: due.color }}>
                        <AlarmClock size={10} /> {due.text}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 20, background: `${pMeta.color}15`, border: `1px solid ${pMeta.color}40`, color: pMeta.color }}>
                        {pMeta.label}
                      </span>
                      {r.entityType && r.entityLabel && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: C.whiteLow }}>
                          {ENTITY_ICON[r.entityType]} {r.entityLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => remove(r.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', flexShrink: 0, padding: 2 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardShell>
  )
}
