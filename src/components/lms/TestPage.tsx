import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, Trophy } from 'lucide-react'
import { LMS_COURSES } from '@/data/lms-mock'
import { DashboardShell } from '@/components/layout/DashboardShell'

const S = {
  root: { fontFamily: 'Inter, sans-serif', padding: '28px 28px 64px', maxWidth: 640 } as React.CSSProperties,
  gold: 'var(--gold)',
  white: 'rgba(255,255,255,0.9)',
  dim:   'rgba(255,255,255,0.4)',
}

export function TestPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const [searchParams] = useSearchParams()
  void searchParams.get('courseId')
  const navigate = useNavigate()

  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  // Find lesson
  let lesson = null
  let course = null
  for (const c of LMS_COURSES) {
    const idx = c.lessons.findIndex(l => l.id === lessonId)
    if (idx !== -1) {
      lesson = c.lessons[idx]
      course = c
      break
    }
  }

  if (!lesson?.quiz || !course) {
    return (
      <DashboardShell>
        <div style={{ ...S.root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: S.dim, fontSize: 14 }}>Тест не найден</span>
        </div>
      </DashboardShell>
    )
  }

  const questions = lesson.quiz
  const allAnswered = Object.keys(answers).length === questions.length

  function submit() {
    if (!allAnswered) return
    setSubmitted(true)
  }

  const score = submitted
    ? Math.round((questions.filter((q, i) => answers[i] === q.correct).length / questions.length) * 100)
    : 0
  const passed = score >= course.passingScore

  return (
    <DashboardShell>
    <div style={S.root}>
      {/* Back */}
      <button
        onClick={() => navigate(`/dashboard/lms/lesson/${lesson!.id}?courseId=${course!.id}`)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: S.dim, fontSize: 12, marginBottom: 24 }}
      >
        <ArrowLeft size={14} />
        Назад к уроку
      </button>

      <div style={{ fontSize: 22, fontWeight: 700, color: S.gold, marginBottom: 4 }}>{lesson.title}</div>
      <div style={{ fontSize: 12, color: S.dim, marginBottom: 28 }}>
        Проходной балл: {course.passingScore}% · {questions.length} вопросов
      </div>

      {/* Result screen */}
      {submitted ? (
        <div style={{
          background: passed ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.06)',
          border: `1px solid ${passed ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: 16, padding: '32px 28px', textAlign: 'center', marginBottom: 28,
        }}>
          {passed
            ? <Trophy size={40} color="#4ade80" style={{ margin: '0 auto 12px' }} />
            : <XCircle size={40} color="#ef4444" style={{ margin: '0 auto 12px' }} />
          }
          <div style={{ fontSize: 32, fontWeight: 800, color: passed ? '#4ade80' : '#ef4444', marginBottom: 4 }}>
            {score}%
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: S.white, marginBottom: 6 }}>
            {passed ? 'Тест пройден!' : 'Тест не пройден'}
          </div>
          <div style={{ fontSize: 13, color: S.dim, marginBottom: 24 }}>
            Правильных ответов: {questions.filter((q, i) => answers[i] === q.correct).length} из {questions.length}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {!passed && (
              <button
                onClick={() => { setAnswers({}); setSubmitted(false) }}
                style={{
                  padding: '9px 20px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: S.white,
                }}
              >
                Попробовать снова
              </button>
            )}
            <button
              onClick={() => navigate(`/dashboard/lms/course/${course!.id}`)}
              style={{
                padding: '9px 20px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: passed ? 'rgba(74,222,128,0.12)' : 'rgba(201,168,76,0.1)',
                border: `1px solid ${passed ? 'rgba(74,222,128,0.3)' : 'rgba(201,168,76,0.3)'}`,
                color: passed ? '#4ade80' : 'var(--gold)',
              }}
            >
              К курсу
            </button>
          </div>
        </div>
      ) : null}

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {questions.map((q, qi) => {
          const answered = answers[qi] !== undefined
          const isCorrect = submitted && answers[qi] === q.correct
          const isWrong = submitted && answered && answers[qi] !== q.correct
          return (
            <div key={qi} style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${submitted ? (isCorrect ? 'rgba(74,222,128,0.2)' : isWrong ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)') : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 12, padding: '18px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                {submitted && (isCorrect
                  ? <CheckCircle2 size={16} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} />
                  : isWrong
                    ? <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                    : <span style={{ width: 16, flexShrink: 0 }} />
                )}
                <div style={{ fontSize: 14, fontWeight: 600, color: S.white, lineHeight: 1.5 }}>
                  {qi + 1}. {q.question}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi
                  const isCorrectOpt = submitted && oi === q.correct
                  const isWrongOpt = submitted && selected && oi !== q.correct
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', borderRadius: 8, textAlign: 'left', cursor: submitted ? 'default' : 'pointer',
                        background: isCorrectOpt
                          ? 'rgba(74,222,128,0.1)'
                          : isWrongOpt
                            ? 'rgba(239,68,68,0.1)'
                            : selected
                              ? 'rgba(201,168,76,0.1)'
                              : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isCorrectOpt
                          ? 'rgba(74,222,128,0.35)'
                          : isWrongOpt
                            ? 'rgba(239,68,68,0.35)'
                            : selected
                              ? 'rgba(201,168,76,0.35)'
                              : 'rgba(255,255,255,0.07)'}`,
                        transition: 'all 0.12s',
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${isCorrectOpt ? '#4ade80' : isWrongOpt ? '#ef4444' : selected ? 'var(--gold)' : 'rgba(255,255,255,0.2)'}`,
                        background: (selected || isCorrectOpt) ? (isCorrectOpt ? 'rgba(74,222,128,0.2)' : isWrongOpt ? 'rgba(239,68,68,0.2)' : 'rgba(201,168,76,0.2)') : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {(selected || isCorrectOpt) && (
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isCorrectOpt ? '#4ade80' : isWrongOpt ? '#ef4444' : 'var(--gold)' }} />
                        )}
                      </div>
                      <span style={{ fontSize: 13, color: isCorrectOpt ? '#4ade80' : isWrongOpt ? '#ef4444' : S.white }}>{opt}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Submit */}
      {!submitted && (
        <button
          onClick={submit}
          disabled={!allAnswered}
          style={{
            marginTop: 24, width: '100%', padding: '12px 0', borderRadius: 10,
            fontSize: 13, fontWeight: 700, cursor: allAnswered ? 'pointer' : 'default',
            background: allAnswered ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${allAnswered ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: allAnswered ? 'var(--gold)' : S.dim,
            letterSpacing: '0.05em',
          }}
        >
          {allAnswered ? 'Завершить тест' : `Ответьте на все вопросы (${Object.keys(answers).length}/${questions.length})`}
        </button>
      )}
    </div>
    </DashboardShell>
  )
}
