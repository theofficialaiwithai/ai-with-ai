'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useRouter } from 'next/navigation'

/* ── types ── */
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface SessionData {
  id: string
  mode: string | null
  platform: string
  buildType: string | null
  status: string
}

interface Props {
  session: SessionData
  initialMessages: ChatMessage[]
}

/* ── helpers ── */
function formatPlatform(p: string): string {
  const map: Record<string, string> = {
    'claude-code': 'Claude Code',
    codex: 'Codex',
    zapier: 'Zapier',
    make: 'Make',
  }
  return map[p] ?? p
}

function formatBuildType(bt: string | null): string {
  if (!bt) return 'Build session'
  if (bt === 'product') return 'Building a product'
  if (bt === 'workflow') return 'Building a workflow automation'
  return bt
}

/* ── streaming reader — reads plain text stream from toTextStreamResponse() ── */
async function readStream(
  sessionId: string,
  content: string,
  onChunk: (t: string) => void,
  onDone: (full: string) => void,
  onError: (e: string) => void
) {
  try {
    const res = await fetch(`/api/sessions/${sessionId}/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (!res.ok || !res.body) { onError('Request failed'); return }

    const reader = res.body.getReader()
    const dec = new TextDecoder()
    let full = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = dec.decode(value, { stream: true })
      full += text
      // flushSync forces React to render immediately for each chunk,
      // bypassing React 18 automatic batching that would collapse all
      // stream updates into a single render at the end.
      flushSync(() => onChunk(text))
    }
    onDone(full)
  } catch {
    onError('Network error. Please try again.')
  }
}

/* ── component ── */
const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

export default function IntakeChat({ session, initialMessages }: Props) {
  const router = useRouter()
  const [msgs, setMsgs] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamBuf, setStreamBuf] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasSentInit = useRef(false)

  const platformLabel = formatPlatform(session.platform)

  /* scroll to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, streamBuf])

  /* check completion */
  useEffect(() => {
    const lastAI = [...msgs].reverse().find(m => m.role === 'assistant')
    if (lastAI?.content.includes('I have everything I need')) setIsComplete(true)
  }, [msgs])

  useEffect(() => {
    if (streamBuf.includes('I have everything I need')) setIsComplete(true)
  }, [streamBuf])

  /* auto-init */
  useEffect(() => {
    if (hasSentInit.current || initialMessages.length > 0) return
    hasSentInit.current = true
    setStreaming(true)
    readStream(
      session.id, '__init__',
      (chunk) => setStreamBuf(prev => prev + chunk),
      (full) => {
        setMsgs(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: full }])
        setStreamBuf('')
        setStreaming(false)
      },
      () => setStreaming(false)
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* send message */
  const send = useCallback(async () => {
    if (!input.trim() || streaming) return
    const text = input.trim()
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = '44px'

    setMsgs(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }])
    setStreaming(true)
    setStreamBuf('')

    await readStream(
      session.id, text,
      (chunk) => setStreamBuf(prev => prev + chunk),
      (full) => {
        setMsgs(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: full }])
        setStreamBuf('')
        setStreaming(false)
      },
      () => setStreaming(false)
    )
  }, [input, streaming, session.id])

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = '44px'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  const isLearnMode = session.mode === 'learn'

  async function handleGeneratePlan() {
    setGeneratingPlan(true)
    if (isLearnMode) {
      try {
        const res = await fetch(`/api/sessions/${session.id}/generate-lessons`, { method: 'POST' })
        const data = await res.json()
        if (data.redirectTo) {
          router.push(data.redirectTo)
        } else {
          setGeneratingPlan(false)
        }
      } catch {
        setGeneratingPlan(false)
      }
    } else {
      router.push(`/sessions/${session.id}/plan`)
    }
  }

  /* ── render ── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0D1A' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: '40%', padding: 32, flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* platform badge */}
        <div style={{
          display: 'inline-flex', fontFamily: FM, fontSize: 11,
          background: 'rgba(124,58,237,0.15)', color: '#9D5AF0',
          border: '1px solid rgba(124,58,237,0.25)', borderRadius: 9999,
          padding: '3px 10px', letterSpacing: '0.04em', marginBottom: 16,
        }}>
          {platformLabel}
        </div>

        {/* build type */}
        <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>
          {formatBuildType(session.buildType)}
        </div>

        {/* blurb */}
        <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.7 }}>
          {"I'll ask you a few questions about what you want to build, then generate a complete step-by-step plan. Answer as specifically as you can \u2014 the more detail you give, the better your plan will be."}
        </p>

        {/* session id */}
        <div style={{ position: 'absolute', bottom: 32, left: 32, right: 32 }}>
          <div style={{ fontFamily: FM, fontSize: 10, color: '#4A5568', wordBreak: 'break-all' }}>
            {session.id}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ width: '60%', display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* chat area */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: 24,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {msgs.map(msg =>
            msg.role === 'assistant' ? (
              <div key={msg.id} style={{ alignSelf: 'flex-start', maxWidth: '85%', display: 'flex', gap: 12 }}>
                <Avatar />
                <Bubble role="assistant">{msg.content}</Bubble>
              </div>
            ) : (
              <div key={msg.id} style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
                <Bubble role="user">{msg.content}</Bubble>
              </div>
            )
          )}

          {/* streaming */}
          {streaming && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '85%', display: 'flex', gap: 12 }}>
              <Avatar />
              <div style={{
                background: '#232340', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, borderTopLeftRadius: 4,
                padding: '10px 14px', fontSize: 14, color: '#F8FAFC',
                lineHeight: 1.6, fontFamily: FB, whiteSpace: 'pre-wrap', minHeight: 20,
              }}>
                {streamBuf}
                <span style={{
                  display: 'inline-block', width: 2, height: 14,
                  background: '#9D5AF0', marginLeft: 2, verticalAlign: 'middle',
                  animation: 'blink 1s step-end infinite',
                }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* input area */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKey}
              disabled={streaming}
              placeholder="Type your answer…"
              style={{
                flex: 1, background: '#1A1A2E',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '11px 14px',
                fontFamily: FB, fontSize: 14, color: '#F8FAFC',
                outline: 'none', resize: 'none',
                minHeight: 44, maxHeight: 120,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#7C3AED'
                e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.06)'
                e.target.style.boxShadow = 'none'
              }}
            />
            <button
              onClick={send}
              disabled={streaming || !input.trim()}
              style={{
                background: streaming || !input.trim() ? 'rgba(124,58,237,0.4)' : '#7C3AED',
                color: 'white', border: 'none', borderRadius: 10,
                padding: '10px 20px', fontFamily: FD, fontSize: 14, fontWeight: 600,
                cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer',
                alignSelf: 'flex-end', height: 44,
                transition: 'background 0.2s',
              }}
            >
              Send
            </button>
          </div>

          {isComplete && (
            <button
              onClick={handleGeneratePlan}
              disabled={generatingPlan}
              style={{
                background: generatingPlan ? 'rgba(124,58,237,0.6)' : '#7C3AED',
                color: 'white', border: 'none', borderRadius: 16,
                padding: '14px 28px', fontFamily: FD, fontSize: 16, fontWeight: 600,
                width: '100%', cursor: generatingPlan ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => {
                if (!generatingPlan) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#9D5AF0'
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLButtonElement).style.background = generatingPlan ? 'rgba(124,58,237,0.6)' : '#7C3AED'
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
              }}
            >
              {generatingPlan
                ? (isLearnMode ? 'Generating lesson plan…' : 'Generating…')
                : (isLearnMode ? 'Generate My Lesson Plan →' : 'Generate My Plan →')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── sub-components ── */
function Avatar() {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(124,58,237,0.15)', color: '#9D5AF0',
      border: '1px solid rgba(124,58,237,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 600,
      fontFamily: FD,
    }}>
      A
    </div>
  )
}

function Bubble({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) {
  if (role === 'assistant') {
    return (
      <div style={{
        background: '#232340', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10, borderTopLeftRadius: 4,
        padding: '10px 14px', fontSize: 14, color: '#F8FAFC',
        lineHeight: 1.6, fontFamily: FB, whiteSpace: 'pre-wrap',
      }}>
        {children}
      </div>
    )
  }
  return (
    <div style={{
      background: '#7C3AED', color: 'white',
      borderRadius: 10, borderTopRightRadius: 4,
      padding: '10px 14px', fontSize: 14, lineHeight: 1.6,
      fontFamily: FB, whiteSpace: 'pre-wrap',
    }}>
      {children}
    </div>
  )
}
