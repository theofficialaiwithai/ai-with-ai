'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { flushSync } from 'react-dom'

/* ── font tokens ── */
const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

/* ── types ── */
interface Step {
  stepNumber: number
  title: string
  whatItBuilds: string
  promptToPaste: string
  verificationChecklist: string[]
  status: string
  completedAt: Date | null
}

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
  imagePreview?: string // data-URL for display only
}

interface Props {
  sessionId: string
  step: Step
  allSteps: Step[]
  totalSteps: number
}

/* ── sidebar step item ── */
function SidebarStep({ step, isCurrent }: { step: Step; isCurrent: boolean }) {
  const isCompleted = step.status === 'completed'
  const isLocked = step.status === 'locked' && !isCurrent
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      padding: '10px 12px', borderRadius: 8,
      background: isCurrent ? 'rgba(124,58,237,0.12)' : 'transparent',
      border: isCurrent ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
        background: isCompleted ? 'rgba(16,185,129,0.15)' : isCurrent ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.05)',
        border: isCompleted ? '1px solid rgba(16,185,129,0.4)' : isCurrent ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)',
      }}>
        {isCompleted ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <span style={{ fontFamily: FM, fontSize: 10, fontWeight: 600, color: isCurrent ? '#9D5AF0' : '#4A5568' }}>
            {step.stepNumber}
          </span>
        )}
      </div>
      <span style={{
        fontFamily: FD, fontSize: 13, fontWeight: isCurrent ? 600 : 400,
        color: isCompleted ? '#10B981' : isCurrent ? '#F8FAFC' : isLocked ? '#374151' : '#6B7280',
        lineHeight: 1.4,
      }}>{step.title}</span>
    </div>
  )
}

/* ── copy button ── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* silent */ }
  }
  return (
    <button onClick={handleCopy} style={{
      position: 'absolute', top: 10, right: 10,
      background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
      border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 6, padding: '4px 10px',
      fontFamily: FM, fontSize: 11, color: copied ? '#10B981' : '#94A3B8',
      cursor: 'pointer', transition: 'all 0.15s', zIndex: 1,
    }}>{copied ? '✓ Copied' : 'Copy'}</button>
  )
}

/* ── interactive checklist item ── */
function CheckItem({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <li onClick={onToggle} style={{
      display: 'flex', gap: 12, alignItems: 'flex-start',
      cursor: 'pointer', userSelect: 'none', padding: '6px 0',
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: checked ? '#10B981' : 'rgba(16,185,129,0.06)',
        border: `1.5px solid ${checked ? '#10B981' : 'rgba(16,185,129,0.35)'}`,
        transition: 'background 0.15s, border-color 0.15s',
      }}>
        {checked && (
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1.5 5.5L4.5 8.5L9.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span style={{
        fontFamily: FB, fontSize: 14, lineHeight: 1.55,
        color: checked ? '#4A5568' : '#94A3B8',
        textDecoration: checked ? 'line-through' : 'none',
        transition: 'color 0.15s',
      }}>{label}</span>
    </li>
  )
}

/* ── typing indicator ── */
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '4px 2px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#7C3AED',
          animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  )
}

/* ── chat bubble ── */
function ChatBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      gap: 4, marginBottom: 12,
    }}>
      {msg.imagePreview && (
        <img
          src={msg.imagePreview}
          alt="screenshot"
          style={{
            maxWidth: 200, maxHeight: 160, borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            objectFit: 'cover',
          }}
        />
      )}
      {msg.content && (
        <div style={{
          maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
          background: isUser ? '#7C3AED' : '#1A1A2E',
          border: isUser ? 'none' : '1px solid rgba(255,255,255,0.06)',
          fontFamily: FB, fontSize: 14, lineHeight: 1.55,
          color: isUser ? '#fff' : '#CBD5E1',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          borderBottomRightRadius: isUser ? 4 : 12,
          borderBottomLeftRadius: isUser ? 12 : 4,
        }}>
          {msg.content}
        </div>
      )}
    </div>
  )
}

/* ── main component ── */
export default function BuildStepClient({ sessionId, step, allSteps, totalSteps }: Props) {
  const router = useRouter()

  /* checklist */
  const [checked, setChecked] = useState<Set<number>>(new Set())

  /* complete */
  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  /* chat */
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatStreaming, setChatStreaming] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)   // data-URL for preview
  const [imageBase64, setImageBase64] = useState<string | null>(null)     // raw base64 for API
  const [imageMimeType, setImageMimeType] = useState('image/png')

  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  const checklist = step.verificationChecklist ?? []
  const allChecked = checklist.length === 0 || checked.size === checklist.length
  const completedCount = allSteps.filter(s => s.status === 'completed').length

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, showChat, chatStreaming])

  // Focus input when chat opens
  useEffect(() => {
    if (showChat) setTimeout(() => chatInputRef.current?.focus(), 200)
  }, [showChat])

  function toggleCheck(idx: number) {
    setChecked(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n })
  }

  /* ── image picker ── */
  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageMimeType(file.type || 'image/png')
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setImagePreview(dataUrl)
      // Strip prefix: "data:image/png;base64," → raw base64
      setImageBase64(dataUrl.split(',')[1])
    }
    reader.readAsDataURL(file)
    // Reset file input so the same file can be picked again
    e.target.value = ''
  }

  /* ── send chat message ── */
  async function handleSend() {
    const text = chatInput.trim()
    if ((!text && !imageBase64) || chatStreaming) return

    // Add user message to history
    const userMsg: ChatMsg = {
      role: 'user',
      content: text,
      imagePreview: imagePreview ?? undefined,
    }
    const historyForApi = chatMessages.map(m => ({ role: m.role, content: m.content }))
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setImagePreview(null)

    // Capture & clear image state before async work
    const b64 = imageBase64
    const mime = imageMimeType
    setImageBase64(null)

    // Add empty assistant message that we'll stream into
    setChatMessages(prev => [...prev, { role: 'assistant', content: '' }])
    setChatStreaming(true)

    try {
      const res = await fetch(
        `/api/sessions/${sessionId}/build/${step.stepNumber}/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: historyForApi,
            stepTitle: step.title,
            stepInstructions: step.promptToPaste,
            imageBase64: b64,
            imageMimeType: mime,
          }),
        }
      )

      if (!res.ok || !res.body) {
        throw new Error(`Chat failed (${res.status})`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        flushSync(() => {
          setChatMessages(prev => {
            const msgs = [...prev]
            const last = msgs[msgs.length - 1]
            if (last?.role === 'assistant') {
              msgs[msgs.length - 1] = { ...last, content: last.content + chunk }
            }
            return msgs
          })
        })
      }
    } catch (err) {
      flushSync(() => {
        setChatMessages(prev => {
          const msgs = [...prev]
          const last = msgs[msgs.length - 1]
          if (last?.role === 'assistant' && last.content === '') {
            msgs[msgs.length - 1] = { role: 'assistant', content: '⚠️ ' + (err instanceof Error ? err.message : 'Something went wrong') }
          }
          return msgs
        })
      })
    } finally {
      setChatStreaming(false)
    }
  }

  /* ── mark complete ── */
  async function handleComplete() {
    if (completing || !allChecked) return
    setCompleting(true)
    setCompleteError(null)
    try {
      const res = await fetch(
        `/api/sessions/${sessionId}/build/${step.stepNumber}/complete`,
        { method: 'POST' }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Failed (${res.status})`)
      }
      const data = await res.json()
      if (data.isLastStep) {
        router.push(`/sessions/${sessionId}/complete`)
      } else {
        router.push(`/sessions/${sessionId}/build/${data.nextStep}`)
      }
    } catch (err) {
      setCompleteError(err instanceof Error ? err.message : 'Something went wrong')
      setCompleting(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .prompt-scroll::-webkit-scrollbar { width: 6px; }
        .prompt-scroll::-webkit-scrollbar-track { background: transparent; }
        .prompt-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 3px; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0D0D1A', color: '#F8FAFC', display: 'flex' }}>

        {/* ══ SIDEBAR ══ */}
        <aside style={{
          width: 260, flexShrink: 0,
          background: '#1A1A2E',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        }}>
          <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.08em', color: '#4A5568', textTransform: 'uppercase', marginBottom: 6 }}>
              Build Progress
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0}%`,
                background: 'linear-gradient(90deg,#7C3AED,#9D5AF0)',
                borderRadius: 9999, transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontFamily: FD, fontSize: 12, color: '#6B7280', marginTop: 6 }}>
              {completedCount} / {totalSteps} steps done
            </div>
          </div>
          <div style={{ padding: '12px 8px', flex: 1, overflowY: 'auto' }}>
            {allSteps.map(s => (
              <SidebarStep key={s.stepNumber} step={s} isCurrent={s.stepNumber === step.stepNumber} />
            ))}
          </div>
        </aside>

        {/* ══ MAIN CONTENT ══ */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '48px 48px 80px', maxWidth: 860 }}>

          {/* step badge */}
          <div style={{
            display: 'inline-flex', fontFamily: FM, fontSize: 11, letterSpacing: '0.04em',
            background: 'rgba(124,58,237,0.15)', color: '#9D5AF0',
            border: '1px solid rgba(124,58,237,0.25)', borderRadius: 9999,
            padding: '4px 12px', marginBottom: 20,
          }}>
            Step {step.stepNumber} of {totalSteps}
          </div>

          {/* title */}
          <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: 32, color: '#F8FAFC', lineHeight: 1.2, marginBottom: 8 }}>
            {step.title}
          </h1>

          {/* what it builds */}
          <p style={{ fontFamily: FB, fontSize: 15, color: '#64748B', marginBottom: 36, lineHeight: 1.6 }}>
            {step.whatItBuilds}
          </p>

          {/* ── Instructions ── */}
          <section style={{
            background: '#1A1A2E',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 12, marginBottom: 28, overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C3AED' }} />
              <span style={{ fontFamily: FM, fontSize: 12, color: '#9D5AF0', letterSpacing: '0.04em' }}>Instructions</span>
              <span style={{ fontFamily: FB, fontSize: 12, color: '#4A5568', marginLeft: 4 }}>— paste into Claude Code</span>
            </div>
            <div style={{ position: 'relative' }}>
              <CopyButton text={step.promptToPaste} />
              <div className="prompt-scroll" style={{ maxHeight: '60vh', overflowY: 'auto', padding: 20, boxShadow: 'inset 0 -12px 16px -8px rgba(0,0,0,0.3)' }}>
                <pre style={{
                  fontFamily: FM, fontSize: 13, color: '#CBD5E1',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  lineHeight: 1.65, margin: 0, paddingRight: 56,
                }}>
                  {step.promptToPaste}
                </pre>
              </div>
            </div>
          </section>

          {/* ── Verify Checklist ── */}
          {checklist.length > 0 && (
            <section style={{
              background: '#1A1A2E',
              border: `1px solid ${allChecked ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 12, marginBottom: 28, overflow: 'hidden',
              transition: 'border-color 0.3s',
            }}>
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: allChecked ? '#10B981' : 'rgba(16,185,129,0.5)', transition: 'background 0.2s' }} />
                <span style={{ fontFamily: FM, fontSize: 12, color: allChecked ? '#10B981' : '#6B7280', letterSpacing: '0.04em', transition: 'color 0.2s' }}>Verify</span>
                <span style={{ fontFamily: FB, fontSize: 12, color: '#4A5568', marginLeft: 4 }}>— check off each item before continuing</span>
                <span style={{ marginLeft: 'auto', fontFamily: FM, fontSize: 11, color: allChecked ? '#10B981' : '#4A5568', transition: 'color 0.2s' }}>
                  {checked.size}/{checklist.length}
                </span>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: '12px 20px 16px', display: 'flex', flexDirection: 'column' }}>
                {checklist.map((item, idx) => (
                  <CheckItem key={idx} label={item} checked={checked.has(idx)} onToggle={() => toggleCheck(idx)} />
                ))}
              </ul>
            </section>
          )}

          {/* ── 🤔 Stuck? Ask Claude — toggle button ── */}
          <button
            onClick={() => setShowChat(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: showChat ? 'rgba(124,58,237,0.12)' : 'transparent',
              border: `1px solid ${showChat ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 10, padding: '10px 16px',
              fontFamily: FD, fontSize: 14, fontWeight: 600,
              color: showChat ? '#9D5AF0' : '#94A3B8',
              cursor: 'pointer', marginBottom: showChat ? 0 : 24,
              transition: 'all 0.2s',
              width: '100%', justifyContent: 'space-between',
            }}
          >
            <span>🤔 Stuck? Ask Claude</span>
            <span style={{
              fontFamily: FM, fontSize: 11, color: showChat ? '#9D5AF0' : '#4A5568',
              transform: showChat ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
              display: 'inline-block',
            }}>▼</span>
          </button>

          {/* ── Chat Panel ── */}
          {showChat && (
            <div style={{
              background: '#0F0F1E',
              border: '1px solid rgba(124,58,237,0.2)',
              borderTop: 'none',
              borderRadius: '0 0 12px 12px',
              marginBottom: 28,
              overflow: 'hidden',
              animation: 'slideDown 0.2s ease',
            }}>

              {/* message history */}
              <div
                className="chat-scroll"
                style={{
                  maxHeight: 300, overflowY: 'auto',
                  padding: '16px 16px 8px',
                  minHeight: 80,
                  display: 'flex', flexDirection: 'column',
                }}
              >
                {chatMessages.length === 0 && (
                  <p style={{ fontFamily: FB, fontSize: 13, color: '#4A5568', textAlign: 'center', margin: 'auto 0' }}>
                    Ask anything about this step — share error messages or screenshots 📸
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} />
                ))}
                {chatStreaming && chatMessages[chatMessages.length - 1]?.content === '' && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{
                      background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px 12px 12px 4px', padding: '10px 14px',
                    }}>
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* image preview strip */}
              {imagePreview && (
                <div style={{
                  padding: '8px 16px',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <img
                    src={imagePreview}
                    alt="preview"
                    style={{ width: 56, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(124,58,237,0.3)' }}
                  />
                  <span style={{ fontFamily: FB, fontSize: 12, color: '#6B7280' }}>Screenshot attached</span>
                  <button
                    onClick={() => { setImagePreview(null); setImageBase64(null) }}
                    style={{
                      marginLeft: 'auto', background: 'none', border: 'none',
                      color: '#4A5568', cursor: 'pointer', fontSize: 16, lineHeight: 1,
                    }}
                  >×</button>
                </div>
              )}

              {/* input row */}
              <div style={{
                display: 'flex', gap: 8, padding: '10px 12px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: '#1A1A2E',
              }}>
                {/* hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImagePick}
                />

                {/* paperclip */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach screenshot"
                  style={{
                    width: 36, height: 36, flexShrink: 0,
                    background: imagePreview ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${imagePreview ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 8, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: imagePreview ? '#9D5AF0' : '#6B7280',
                    fontSize: 16, transition: 'all 0.15s',
                  }}
                >
                  📎
                </button>

                {/* text input */}
                <input
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Ask about this step, paste an error…"
                  disabled={chatStreaming}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8, padding: '8px 12px',
                    fontFamily: FB, fontSize: 14, color: '#F8FAFC',
                    outline: 'none',
                  }}
                />

                {/* send button */}
                <button
                  onClick={handleSend}
                  disabled={chatStreaming || (!chatInput.trim() && !imageBase64)}
                  style={{
                    width: 36, height: 36, flexShrink: 0,
                    background: chatStreaming || (!chatInput.trim() && !imageBase64)
                      ? 'rgba(124,58,237,0.2)' : '#7C3AED',
                    border: 'none', borderRadius: 8, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, transition: 'background 0.15s',
                    opacity: chatStreaming || (!chatInput.trim() && !imageBase64) ? 0.5 : 1,
                  }}
                >
                  {chatStreaming ? (
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                  ) : '↑'}
                </button>
              </div>
            </div>
          )}

          {/* ── complete error ── */}
          {completeError && (
            <p style={{
              fontFamily: FB, fontSize: 13, color: '#F87171',
              padding: '10px 14px', background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, marginBottom: 16,
            }}>{completeError}</p>
          )}

          {/* ── Mark Complete button ── */}
          <button
            onClick={handleComplete}
            disabled={completing || !allChecked}
            style={{
              width: '100%', padding: '15px 24px',
              background: completing ? 'rgba(124,58,237,0.5)' : !allChecked ? 'rgba(124,58,237,0.2)' : '#7C3AED',
              border: 'none', borderRadius: 14,
              fontFamily: FD, fontSize: 16, fontWeight: 600, color: '#fff',
              cursor: completing || !allChecked ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.25s, box-shadow 0.2s, transform 0.15s',
              opacity: !allChecked && !completing ? 0.6 : 1,
            }}
            onMouseEnter={e => {
              if (!completing && allChecked) {
                e.currentTarget.style.background = '#9D5AF0'
                e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.35)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = completing ? 'rgba(124,58,237,0.5)' : !allChecked ? 'rgba(124,58,237,0.2)' : '#7C3AED'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {completing ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                Saving…
              </>
            ) : step.stepNumber === totalSteps ? '🎉 Complete Build →' : `Mark as Complete → Step ${step.stepNumber + 1}`}
          </button>

          {!allChecked && checklist.length > 0 && (
            <p style={{ fontFamily: FB, fontSize: 13, color: '#4A5568', textAlign: 'center', marginTop: 10 }}>
              Complete all verification items above to continue
            </p>
          )}

        </main>
      </div>
    </>
  )
}
