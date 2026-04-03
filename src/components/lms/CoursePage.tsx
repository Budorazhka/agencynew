import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, MessageSquare, CheckCircle2, Circle, GraduationCap } from 'lucide-react'
import { LMS_COURSES } from '@/data/lms-mock'
import { DashboardShell } from '@/components/layout/DashboardShell'

const S = {
  root: { fontFamily: 'Inter, sans-serif', padding: '28px 28px 64px' } as React.CSSProperties,
  gold: 'var(--gold)',
  white: 'rgba(255,255,255,0.85)',
  dim:   'rgba(255,255,255,0.4)',
  card:  {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: '14px 18px',
  } as React.CSSProperties,
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  article: <BookOpen size={14} />,
  script:  <MessageSquare size={14} />,
  quiz:    <GraduationCap size={14} />,
}

const TYPE_LABEL: Record<string, string> = {
  article: 'Статья',
  script:  'Скрипт',
  quiz:    'Тест',
}

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  // Track completed lessons in state (demo: persists during session)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const course = LMS_COURSES.find(c => c.id === courseId)
  if (!course) {
    return (
      <DashboardShell topBack={{ label: 'Назад', route: '/dashboard/learning' }}>
        <div style={{ ...S.root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: S.dim, fontSize: 14 }}>Курс не найден</span>
        </div>
      </DashboardShell>
    )
  }

  const progress = course.lessons.length > 0 ? Math.round((completed.size / course.lessons.length) * 100) : 0

  return (
    <DashboardShell topBack={{ label: 'Назад', route: '/dashboard/learning' }}>
    <div style={S.root}>
      {/* Back */}
      <button
        onClick={() => navigate('/dashboard/lms/browse?tab=courses')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: S.dim, fontSize: 12, marginBottom: 24 }}
      >
        <ArrowLeft size={14} />
        К обучению
      </button>

      {/* Hero */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{course.emoji}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: S.gold, marginBottom: 6 }}>{course.title}</div>
        <div style={{ fontSize: 13, color: S.dim, maxWidth: 540, lineHeight: 1.6, marginBottom: 20 }}>{course.description}</div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, maxWidth: 320, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: progress === 100 ? '#4ade80' : 'var(--gold)',
              borderRadius: 3, transition: 'width 0.3s',
            }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: progress === 100 ? '#4ade80' : S.gold }}>
            {progress}% пройдено
          </span>
          <span style={{ fontSize: 11, color: S.dim }}>
            {completed.size} / {course.lessons.length} уроков
          </span>
        </div>
      </div>

      {/* Lessons list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 680 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.dim, marginBottom: 4 }}>
          Программа курса
        </div>
        {course.lessons.map((lesson, idx) => {
          const done = completed.has(lesson.id)
          return (
            <div
              key={lesson.id}
              onClick={() => navigate(`/dashboard/lms/lesson/${lesson.id}?courseId=${course.id}`)}
              style={{
                ...S.card,
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer',
                borderColor: done ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.07)',
                background: done ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.03)',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { if (!done) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!done) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' }}
            >
              {/* Number / check */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: done ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done
                  ? <CheckCircle2 size={16} color="#4ade80" />
                  : <span style={{ fontSize: 12, fontWeight: 700, color: S.dim }}>{idx + 1}</span>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: done ? '#4ade80' : S.white }}>{lesson.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 10, color: S.dim,
                  }}>
                    {TYPE_ICON[lesson.type]}{TYPE_LABEL[lesson.type]}
                  </span>
                  <span style={{ fontSize: 10, color: S.dim }}>·</span>
                  <span style={{ fontSize: 10, color: S.dim }}>{lesson.duration}</span>
                </div>
              </div>

              <div style={{ color: done ? '#4ade80' : S.dim, fontSize: 12 }}>
                {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mark all done button (demo) */}
      {completed.size < course.lessons.length && (
        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          <button
            onClick={() => setCompleted(new Set(course.lessons.map(l => l.id)))}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
              color: 'var(--gold)', cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >
            Отметить всё пройденным (демо)
          </button>
        </div>
      )}
    </div>
    </DashboardShell>
  )
}
