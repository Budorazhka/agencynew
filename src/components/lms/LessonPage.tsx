import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { LMS_COURSES } from '@/data/lms-mock'
import { DashboardShell } from '@/components/layout/DashboardShell'

const S = {
  root: { fontFamily: 'Inter, sans-serif', padding: '28px 28px 64px', maxWidth: 760 } as React.CSSProperties,
  gold: 'var(--gold)',
  white: 'rgba(255,255,255,0.9)',
  dim:   'rgba(255,255,255,0.4)',
}

/** Простой рендерер маркдауна → HTML (только h2, bold, lists) */
function MarkdownBody({ body }: { body: string }) {
  const lines = body.split('\n')
  return (
    <div style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.75)' }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <div key={i} style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)', marginTop: 20, marginBottom: 8 }}>{line.slice(3)}</div>
        }
        if (line.startsWith('### ')) {
          return <div key={i} style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginTop: 14, marginBottom: 4 }}>{line.slice(4)}</div>
        }
        if (line.match(/^\d+\. /)) {
          const text = line.replace(/^\d+\. /, '').replace(/\*\*(.*?)\*\*/g, '$1')
          return <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>{line.match(/^\d+/)![0]}.</span>
            <span>{text}</span>
          </div>
        }
        if (line.startsWith('- ')) {
          const text = line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')
          return <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <span style={{ color: 'var(--gold)', flexShrink: 0 }}>·</span>
            <span>{text}</span>
          </div>
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <div key={i} style={{ fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginTop: 12, marginBottom: 4 }}>{line.slice(2, -2)}</div>
        }
        if (line.trim() === '') return <div key={i} style={{ height: 8 }} />
        // Inline bold
        const parts = line.split(/\*\*(.*?)\*\*/)
        return (
          <div key={i} style={{ marginBottom: 4 }}>
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>{p}</strong> : p)}
          </div>
        )
      })}
    </div>
  )
}

/** Скрипт: диалог менеджер/клиент */
function ScriptBody({ body }: { body: string }) {
  const lines = body.split('\n').filter(l => l.trim())
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {lines.map((line, i) => {
        const isManager = line.startsWith('**Менеджер:**')
        const text = line.replace(/^\*\*(Менеджер|Клиент):\*\*\s*/, '')
        return (
          <div key={i} style={{
            display: 'flex', gap: 12,
            flexDirection: isManager ? 'row' : 'row-reverse',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: isManager ? 'rgba(201,168,76,0.15)' : 'rgba(96,165,250,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              color: isManager ? 'var(--gold)' : '#60a5fa',
            }}>
              {isManager ? 'М' : 'К'}
            </div>
            <div style={{
              maxWidth: '75%',
              background: isManager ? 'rgba(201,168,76,0.08)' : 'rgba(96,165,250,0.08)',
              border: `1px solid ${isManager ? 'rgba(201,168,76,0.2)' : 'rgba(96,165,250,0.2)'}`,
              borderRadius: 10, padding: '10px 14px',
              fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isManager ? 'var(--gold)' : '#60a5fa', marginBottom: 4 }}>
                {isManager ? 'Менеджер' : 'Клиент'}
              </div>
              {text}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const [searchParams] = useSearchParams()
  void searchParams.get('courseId')
  const navigate = useNavigate()

  // Find lesson across all courses
  let lesson = null
  let course = null
  let lessonIdx = -1
  for (const c of LMS_COURSES) {
    const idx = c.lessons.findIndex(l => l.id === lessonId)
    if (idx !== -1) {
      lesson = c.lessons[idx]
      course = c
      lessonIdx = idx
      break
    }
  }

  if (!lesson || !course) {
    return (
      <DashboardShell>
        <div style={{ ...S.root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: S.dim, fontSize: 14 }}>Урок не найден</span>
        </div>
      </DashboardShell>
    )
  }

  const prevLesson = lessonIdx > 0 ? course.lessons[lessonIdx - 1] : null
  const nextLesson = lessonIdx < course.lessons.length - 1 ? course.lessons[lessonIdx + 1] : null

  return (
    <DashboardShell>
    <div style={S.root}>
      {/* Back */}
      <button
        onClick={() => navigate(`/dashboard/lms/course/${course.id}`)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: S.dim, fontSize: 12, marginBottom: 6 }}
      >
        <ArrowLeft size={14} />
        {course.title}
      </button>
      <div style={{ fontSize: 10, color: S.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
        Урок {lessonIdx + 1} из {course.lessons.length}
      </div>

      <div style={{ fontSize: 22, fontWeight: 700, color: S.gold, marginBottom: 6 }}>{lesson.title}</div>
      <div style={{ fontSize: 11, color: S.dim, marginBottom: 28 }}>
        {lesson.type === 'article' ? 'Статья' : lesson.type === 'script' ? 'Скрипт' : 'Тест'} · {lesson.duration}
      </div>

      {/* Content */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: '24px 28px', marginBottom: 32,
      }}>
        {lesson.type === 'quiz' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: S.gold, marginBottom: 8 }}>Тест по материалу</div>
            <div style={{ fontSize: 13, color: S.dim, marginBottom: 20 }}>
              {lesson.quiz?.length ?? 0} вопросов · Проходной балл: {course.passingScore}%
            </div>
            <button
              onClick={() => navigate(`/dashboard/lms/test/${lesson.id}?courseId=${course.id}`)}
              style={{
                padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)',
                color: 'var(--gold)', cursor: 'pointer',
              }}
            >
              Начать тест
            </button>
          </div>
        ) : lesson.type === 'script' && lesson.body ? (
          <ScriptBody body={lesson.body} />
        ) : lesson.body ? (
          <MarkdownBody body={lesson.body} />
        ) : null}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <button
          onClick={() => prevLesson && navigate(`/dashboard/lms/lesson/${prevLesson.id}?courseId=${course.id}`)}
          disabled={!prevLesson}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
            borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: prevLesson ? 'pointer' : 'default',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: prevLesson ? S.white : 'rgba(255,255,255,0.2)',
          }}
        >
          <ArrowLeft size={13} />
          {prevLesson?.title ?? 'Назад'}
        </button>

        {nextLesson ? (
          <button
            onClick={() => navigate(`/dashboard/lms/lesson/${nextLesson.id}?courseId=${course.id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
              borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
              color: 'var(--gold)',
            }}
          >
            {nextLesson.title}
            <ArrowRight size={13} />
          </button>
        ) : (
          <button
            onClick={() => navigate(`/dashboard/lms/course/${course.id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
              borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
              color: '#4ade80',
            }}
          >
            Завершить курс
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
    </DashboardShell>
  )
}
