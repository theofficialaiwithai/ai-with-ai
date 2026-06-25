'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { flushSync } from 'react-dom'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

/* ── types ── */
interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface Resource {
  title: string
  url: string
  type: 'docs' | 'video' | 'example'
}

interface Lesson {
  id: string
  lessonNumber: number
  title: string
  conceptualFrame: string
  demonstrationExample: string
  microTask: string
  microTaskType: string
  quizQuestions: QuizQuestion[] | null
  resources: Resource[] | null
  status: string
  completedAt: Date | null
}

interface LessonStub {
  lessonNumber: number
  title: string
  status: string
}

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  sessionId: string
  lesson: Lesson
  allLessons: LessonStub[]
  totalLessons: number
}

/* ── detect code-like content ── */
function looksLikeCode(text: string): boolean {
  return (
    /^\s{2,}/m.test(text) ||
    /^(import|const|let|var|function|class|if|for|while|def|return)\s/m.test(text) ||
    /^[#{]/m.test(text) ||
    text.includes('```') ||
    (text.includes('\n') && (text.includes('{') || text.includes('=>') || text.includes('::')))
  )
}

/* ── sidebar lesson item ── */
function SidebarLesson({
  lesson,
  isCurrent,
  onClick,
}: {
  lesson: LessonStub
  isCurrent: boolean
  onClick?: () => void
}) {
  const isComplete = lesson.status === 'completed'
  const isLocked = lesson.status === 'locked'

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      style={{
        display: 'flex', gap: 10, alignItems: 'flex-start',
        padding: '10px 12px', borderRadius: 8,
        background: isCurrent ? 'rgba(245,158,11,0.1)' : 'transparent',
        border: isCurrent ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
        cursor: isLocked ? 'default' : 'pointer',
        opacity: isLocked ? 0.4 : 1,
        transition: 'background 0.15s',
      }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
        background: isComplete
          ? 'rgba(16,185,129,0.15)'
          : isCurrent
          ? 'rgba(245,158,11,0.2)'
          : 'rgba(255,255,255,0.05)',
        border: isComplete
          ? '1px solid rgba(16,185,129,0.4)'
          : isCurrent
          ? '1px solid rgba(245,158,11,0.5)'
          : '1px solid rgba(255,255,255,0.08)',
      }}>
        {isComplete ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : isLocked ? (
          <span style={{ fontSize: 9, color: '#4A5568' }}>🔒</span>
        ) : (
          <span style={{ fontFamily: FM, fontSize: 10, fontWeight: 600, color: '#F59E0B' }}>
            {lesson.lessonNumber}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontFamily: FD, fontSize: 13, fontWeight: 600, color: isCurrent ? '#F59E0B' : isComplete ? '#10B981' : '#F8FAFC', lineHeight: 1.3 }}>
          {lesson.title}
        </div>
        <div style={{ fontFamily: FM, fontSize: 10, color: '#4A5568', marginTop: 2 }}>
          Lesson {lesson.lessonNumber}
        </div>
      </div>
    </div>
  )
}

/* ── quiz section ── */
function QuizSection({
  questions,
  sessionId,
  lessonNum,
  onComplete,
}: {
  questions: QuizQuestion[]
  sessionId: string
  lessonNum: number
  onComplete: (score: number) => void
}) {
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[qIndex]
  const total = questions.length

  function submit() {
    if (selected === null) return
    const isCorrect = selected === q.correctIndex
    if (isCorrect) setCorrectCount(c => c + 1)
    setRevealed(true)
  }

  function next() {
    if (qIndex + 1 >= total) {
      setDone(true)
    } else {
      setQIndex(i => i + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  if (done) {
    const score = correctCount + (revealed && selected === q.correctIndex ? 0 : 0) // already counted
    return (
      <div>
        <div style={{
          background: 'var(--surface-2,#232340)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: '24px 28px', marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>
            {correctCount >= total * 0.8 ? '🎉' : '📝'}
          </div>
          <div style={{ fontFamily: FD, fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>
            {correctCount} of {total} correct
          </div>
          <div style={{ fontFamily: FB, fontSize: 14, color: '#94A3B8' }}>
            {correctCount === total ? 'Perfect score!' : correctCount >= total * 0.8 ? 'Great work!' : 'Review the lesson and try again on your next session.'}
          </div>
        </div>
        <button
          onClick={() => onComplete(correctCount)}
          style={{
            background: '#10B981', color: '#fff', border: 'none',
            borderRadius: 10, padding: '12px 28px', fontFamily: FD,
            fontWeight: 600, fontSize: 15, cursor: 'pointer', width: '100%',
          }}
        >
          Continue →
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ fontFamily: FM, fontSize: 11, color: '#94A3B8' }}>
          Question {qIndex + 1} of {total}
        </span>
        <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
          <div style={{ width: `${((qIndex + 1) / total) * 100}%`, height: '100%', background: '#7C3AED', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ fontFamily: FD, fontSize: 16, fontWeight: 600, color: '#F8FAFC', marginBottom: 20, lineHeight: 1.5 }}>
        {q.question}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {q.options.map((opt, i) => {
          let bg = 'var(--surface-2,#232340)'
          let border = '1px solid rgba(255,255,255,0.06)'
          let color = '#F8FAFC'
          if (revealed) {
            if (i === q.correctIndex) { bg = 'rgba(16,185,129,0.12)'; border = '1px solid rgba(16,185,129,0.4)'; color = '#10B981' }
            else if (i === selected) { bg = 'rgba(239,68,68,0.1)'; border = '1px solid rgba(239,68,68,0.35)'; color = '#EF4444' }
          } else if (selected === i) {
            bg = 'var(--violet-dim,rgba(124,58,237,0.15))'
            border = '1px solid #7C3AED'
          }
          return (
            <button
              key={i}
              onClick={() => !revealed && setSelected(i)}
              disabled={revealed}
              style={{
                background: bg, border, borderRadius: 10,
                padding: '12px 16px', textAlign: 'left',
                fontFamily: FB, fontSize: 14, color,
                cursor: revealed ? 'default' : 'pointer',
                transition: 'all 0.15s', display: 'flex', gap: 10, alignItems: 'center',
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(255,255,255,0.06)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: FM, fontSize: 11, fontWeight: 600,
              }}>
                {['A','B','C','D'][i]}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div style={{
          background: selected === q.correctIndex ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${selected === q.correctIndex ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          fontFamily: FB, fontSize: 14, color: '#94A3B8', lineHeight: 1.6,
        }}>
          <strong style={{ color: selected === q.correctIndex ? '#10B981' : '#EF4444' }}>
            {selected === q.correctIndex ? '✓ Correct!' : '✗ Incorrect'}
          </strong>{' '}
          {q.explanation}
        </div>
      )}

      {!revealed ? (
        <button
          onClick={submit}
          disabled={selected === null}
          style={{
            background: selected === null ? 'rgba(124,58,237,0.35)' : '#7C3AED',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '12px 28px', fontFamily: FD, fontWeight: 600, fontSize: 15,
            cursor: selected === null ? 'not-allowed' : 'pointer', width: '100%',
          }}
        >
          Submit Answer
        </button>
      ) : (
        <button
          onClick={next}
          style={{
            background: '#7C3AED', color: '#fff', border: 'none',
            borderRadius: 10, padding: '12px 28px', fontFamily: FD,
            fontWeight: 600, fontSize: 15, cursor: 'pointer', width: '100%',
          }}
        >
          {qIndex + 1 >= total ? 'See Results →' : 'Next Question →'}
        </button>
      )}
    </div>
  )
}

/* ── main component ── */
export default function LearnLessonClient({ sessionId, lesson, allLessons, totalLessons }: Props) {
  const router = useRouter()
  const [taskChecked, setTaskChecked] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatStreaming, setChatStreaming] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  const isQuiz = lesson.microTaskType === 'quiz'
  const isCompleted = lesson.status === 'completed'
  const isLast = lesson.lessonNumber >= totalLessons
  const codeView = looksLikeCode(lesson.demonstrationExample)

  /* auto-scroll chat */
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMsgs, chatStreaming])

  async function completeLesson(quizScore?: number) {
    if (completing) return
    setCompleting(true)

    const res = await fetch(
      `/api/sessions/${sessionId}/learn/${lesson.lessonNumber}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizScore: quizScore ?? null }),
      }
    )
    const data = await res.json()

    setCompleting(false)
    setShowComplete(true)

    setTimeout(() => {
      setShowNext(true)
      if (data.isLastLesson) {
        setTimeout(() => router.push(`/sessions/${sessionId}/complete`), 300)
      }
    }, 1500)
  }

  function handleDoComplete() {
    if (!taskChecked || completing) return
    completeLesson()
  }

  const sendChat = useCallback(async () => {
    const text = chatInput.trim()
    if (!text || chatStreaming) return
    setChatInput('')
    if (chatInputRef.current) chatInputRef.current.style.height = '44px'

    const newUserMsg: ChatMsg = { role: 'user', content: text }
    setChatMsgs(prev => [...prev, newUserMsg])
    setChatStreaming(true)

    const history = [...chatMsgs, newUserMsg]

    try {
      const res = await fetch(
        `/api/sessions/${sessionId}/learn/${lesson.lessonNumber}/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: history.slice(-10),
            lessonTitle: lesson.title,
            lessonConcept: lesson.conceptualFrame,
          }),
        }
      )
      if (!res.ok || !res.body) { setChatStreaming(false); return }

      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let full = ''

      setChatMsgs(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = dec.decode(value, { stream: true })
        full += chunk
        flushSync(() => {
          setChatMsgs(prev => {
            const msgs = [...prev]
            msgs[msgs.length - 1] = { role: 'assistant', content: full }
            return msgs
          })
        })
      }
    } catch {
      /* ignore */
    }
    setChatStreaming(false)
  }, [chatInput, chatStreaming, chatMsgs, sessionId, lesson])

  const sidebarCompletedCount = allLessons.filter(l => l.status === 'completed').length
  const progressPct = (sidebarCompletedCount / totalLessons) * 100

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg,#0D0D1A)' }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{
        width: 280, flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: FD, fontSize: 13, fontWeight: 700, color: '#F59E0B', marginBottom: 4 }}>
            Learn Mode
          </div>
          <div style={{ fontFamily: FM, fontSize: 10, color: '#4A5568', marginBottom: 16 }}>
            {sidebarCompletedCount} of {totalLessons} complete
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: '#10B981', borderRadius: 2, transition: 'width 0.4s' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {allLessons.map(l => (
            <SidebarLesson
              key={l.lessonNumber}
              lesson={l}
              isCurrent={l.lessonNumber === lesson.lessonNumber}
              onClick={() => router.push(`/sessions/${sessionId}/learn/${l.lessonNumber}`)}
            />
          ))}
        </div>
      </div>

      {/* ── MAIN PANEL ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px', maxWidth: 760 }}>

        {/* Lesson header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: FM, fontSize: 11, color: '#4A5568', marginBottom: 8 }}>
            LESSON {lesson.lessonNumber} OF {totalLessons}
          </div>
          <h1 style={{ fontFamily: FD, fontSize: 28, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 0 }}>
            {lesson.title}
          </h1>
        </div>

        {/* ── SECTION 1: The Key Idea ── */}
        <section style={{ marginBottom: 36 }}>
          <SectionHeader title="The Key Idea" color="#7C3AED" />
          <p style={{
            fontFamily: FB, fontSize: 15, color: '#94A3B8',
            lineHeight: 1.75, whiteSpace: 'pre-wrap',
          }}>
            {lesson.conceptualFrame}
          </p>
        </section>

        {/* ── SECTION 2: See It In Action ── */}
        <section style={{ marginBottom: 36 }}>
          <SectionHeader title="See It In Action" />
          {codeView ? (
            <div style={{
              background: '#0A0A16',
              borderLeft: '3px solid #7C3AED',
              borderRadius: '0 10px 10px 0',
              padding: '20px 24px',
              overflowX: 'auto',
            }}>
              <pre style={{ fontFamily: FM, fontSize: 13, color: '#F8FAFC', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                {lesson.demonstrationExample}
              </pre>
            </div>
          ) : (
            <div style={{
              background: 'var(--surface-2,#232340)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '20px 24px',
            }}>
              <p style={{ fontFamily: FB, fontSize: 15, color: '#94A3B8', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
                {lesson.demonstrationExample}
              </p>
            </div>
          )}
        </section>

        {/* ── SECTION 3: Your Turn ── */}
        <section style={{ marginBottom: 36 }}>
          <SectionHeader title="Your Turn" color="#F59E0B" />
          <div style={{
            background: 'rgba(245,158,11,0.07)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 12, padding: '20px 24px', marginBottom: 20,
          }}>
            <p style={{ fontFamily: FB, fontSize: 15, color: '#94A3B8', lineHeight: 1.7, margin: 0 }}>
              {lesson.microTask}
            </p>
          </div>

          {/* Completion overlay */}
          {(showComplete || isCompleted) ? (
            <CompletionDisplay
              showNext={showNext || isCompleted}
              isLast={isLast}
              lessonNumber={lesson.lessonNumber}
              sessionId={sessionId}
              router={router}
            />
          ) : isQuiz && lesson.quizQuestions ? (
            <QuizSection
              questions={lesson.quizQuestions}
              sessionId={sessionId}
              lessonNum={lesson.lessonNumber}
              onComplete={(score) => completeLesson(score)}
            />
          ) : (
            <div>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                fontFamily: FB, fontSize: 15, color: '#F8FAFC', marginBottom: 20,
                padding: '14px 16px',
                background: taskChecked ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${taskChecked ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 10, transition: 'all 0.2s',
              }}>
                <input
                  type="checkbox"
                  checked={taskChecked}
                  onChange={e => setTaskChecked(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#10B981', cursor: 'pointer' }}
                />
                I completed this task
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <button
                  onClick={() => setChatOpen(v => !v)}
                  style={{
                    background: 'none', border: 'none', color: '#F59E0B',
                    fontFamily: FB, fontSize: 13, cursor: 'pointer', padding: 0,
                    textDecoration: 'underline', textDecorationStyle: 'dotted',
                  }}
                >
                  I&apos;m stuck
                </button>
              </div>

              <button
                onClick={handleDoComplete}
                disabled={!taskChecked || completing}
                style={{
                  background: !taskChecked ? 'rgba(16,185,129,0.3)' : '#10B981',
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '13px 28px', fontFamily: FD, fontWeight: 600, fontSize: 15,
                  cursor: !taskChecked ? 'not-allowed' : 'pointer',
                  opacity: !taskChecked ? 0.6 : 1,
                  width: '100%', transition: 'all 0.2s',
                }}
              >
                {completing ? 'Saving…' : 'Mark as Complete'}
              </button>
              {!taskChecked && (
                <p style={{ fontFamily: FB, fontSize: 12, color: '#4A5568', marginTop: 8, textAlign: 'center' }}>
                  Complete the task above to continue
                </p>
              )}
            </div>
          )}
        </section>

        {/* ── SECTION 4: Resources ── */}
        {lesson.resources && lesson.resources.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <SectionHeader title="Resources" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lesson.resources.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    background: 'var(--surface,#1A1A2E)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10, textDecoration: 'none',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <span style={{
                    fontFamily: FM, fontSize: 10, fontWeight: 600,
                    padding: '2px 8px', borderRadius: 4,
                    background: r.type === 'docs' ? 'rgba(124,58,237,0.15)' : r.type === 'video' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
                    color: r.type === 'docs' ? '#9D5AF0' : r.type === 'video' ? '#F59E0B' : '#94A3B8',
                    border: `1px solid ${r.type === 'docs' ? 'rgba(124,58,237,0.25)' : r.type === 'video' ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.1)'}`,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {r.type}
                  </span>
                  <span style={{ fontFamily: FB, fontSize: 14, color: '#F8FAFC', flex: 1 }}>
                    {r.title}
                  </span>
                  <span style={{ color: '#4A5568', fontSize: 12 }}>↗</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── CHAT PANEL ── */}
        {chatOpen && (
          <section style={{ marginBottom: 40 }}>
            <div style={{
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 12, overflow: 'hidden',
            }}>
              <div style={{
                background: 'rgba(245,158,11,0.08)', padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: FD, fontSize: 14, fontWeight: 600, color: '#F59E0B' }}>
                  🤔 Ask for help
                </span>
                <button
                  onClick={() => setChatOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>

              <div style={{
                minHeight: 160, maxHeight: 320, overflowY: 'auto',
                padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
                background: 'var(--surface,#1A1A2E)',
              }}>
                {chatMsgs.length === 0 && (
                  <p style={{ fontFamily: FB, fontSize: 13, color: '#4A5568', margin: 0 }}>
                    Ask anything about this lesson — I&apos;ll help you work through it.
                  </p>
                )}
                {chatMsgs.map((m, i) => (
                  <div key={i} style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: m.role === 'user' ? '#7C3AED' : '#232340',
                    border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: m.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                    padding: '8px 12px',
                    fontFamily: FB, fontSize: 13, color: '#F8FAFC',
                    lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  }}>
                    {m.content}
                    {m.role === 'assistant' && chatStreaming && i === chatMsgs.length - 1 && (
                      <span style={{
                        display: 'inline-block', width: 2, height: 12,
                        background: '#9D5AF0', marginLeft: 2, verticalAlign: 'middle',
                        animation: 'blink 1s step-end infinite',
                      }} />
                    )}
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              <div style={{
                padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'var(--surface,#1A1A2E)', display: 'flex', gap: 8,
              }}>
                <textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={e => {
                    setChatInput(e.target.value)
                    e.target.style.height = '44px'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
                  disabled={chatStreaming}
                  placeholder="Ask a question…"
                  rows={1}
                  style={{
                    flex: 1, background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 8, padding: '10px 12px', fontFamily: FB, fontSize: 13,
                    color: '#F8FAFC', outline: 'none', resize: 'none',
                    minHeight: 44, maxHeight: 120,
                  }}
                />
                <button
                  onClick={sendChat}
                  disabled={chatStreaming || !chatInput.trim()}
                  style={{
                    background: chatStreaming || !chatInput.trim() ? 'rgba(124,58,237,0.4)' : '#7C3AED',
                    color: '#fff', border: 'none', borderRadius: 8,
                    padding: '0 16px', fontFamily: FD, fontWeight: 600, fontSize: 13,
                    cursor: chatStreaming || !chatInput.trim() ? 'not-allowed' : 'pointer',
                    height: 44, alignSelf: 'flex-end',
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

/* ── sub-components ── */
function SectionHeader({ title, color = '#F8FAFC' }: { title: string; color?: string }) {
  return (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <h2 style={{ fontFamily: FD, fontSize: 16, fontWeight: 600, color, margin: 0 }}>
        {title}
      </h2>
      <div style={{ flex: 1, height: 1, background: `${color}22` }} />
    </div>
  )
}

function CompletionDisplay({
  showNext,
  isLast,
  lessonNumber,
  sessionId,
  router,
}: {
  showNext: boolean
  isLast: boolean
  lessonNumber: number
  sessionId: string
  router: ReturnType<typeof useRouter>
}) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(16,185,129,0.15)',
        border: '2px solid rgba(16,185,129,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
        animation: 'scaleIn 0.3s ease-out',
      }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M5 14L11 20L23 8" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ fontFamily: FD, fontSize: 16, fontWeight: 600, color: '#10B981', marginBottom: 4 }}>
        Lesson complete!
      </div>
      <div style={{ fontFamily: FB, fontSize: 14, color: '#94A3B8', marginBottom: 24 }}>
        {isLast ? 'You finished all lessons.' : 'Ready for the next one?'}
      </div>
      {showNext && !isLast && (
        <button
          onClick={() => router.push(`/sessions/${sessionId}/learn/${lessonNumber + 1}`)}
          style={{
            background: '#10B981', color: '#fff', border: 'none',
            borderRadius: 10, padding: '12px 32px', fontFamily: FD,
            fontWeight: 600, fontSize: 15, cursor: 'pointer',
          }}
        >
          Next Lesson →
        </button>
      )}
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
