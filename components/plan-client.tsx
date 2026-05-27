'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

/* ── fonts ── */
const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

/* ── props from the server component ── */
interface Props {
  sessionId: string
  platform: string
  buildType: string | null
}

/* ── markdown component overrides ── */
const mdComponents: Components = {
  h2: ({ children }) => (
    <h2 style={{
      fontFamily: FD, fontWeight: 700, fontSize: 24, color: '#F8FAFC',
      marginTop: 40, marginBottom: 12, paddingBottom: 8,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{
      fontFamily: FD, fontWeight: 600, fontSize: 18, color: '#F8FAFC',
      marginTop: 24, marginBottom: 8,
    }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{
      fontFamily: FB, fontSize: 15, color: '#94A3B8',
      lineHeight: 1.7, marginBottom: 16,
    }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ color: '#94A3B8', paddingLeft: 20, lineHeight: 1.8, marginBottom: 16 }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ color: '#94A3B8', paddingLeft: 20, lineHeight: 1.8, marginBottom: 16 }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ fontFamily: FB, fontSize: 15, marginBottom: 4 }}>{children}</li>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', marginBottom: 16 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{
      fontFamily: FD, fontWeight: 600, fontSize: 13, color: '#F8FAFC',
      background: '#232340', padding: '10px 14px', textAlign: 'left',
    }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{
      fontFamily: FB, fontSize: 14, color: '#94A3B8',
      padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>{children}</td>
  ),
  pre: ({ children }) => (
    <pre style={{
      background: '#0A0A16',
      border: '1px solid rgba(255,255,255,0.06)',
      borderLeft: '3px solid #7C3AED',
      borderRadius: 10,
      padding: 20,
      fontFamily: FM, fontSize: 13, color: '#F8FAFC',
      overflowX: 'auto', display: 'block', margin: '16px 0',
      whiteSpace: 'pre',
    }}>{children}</pre>
  ),
  code: ({ className, children }) => {
    const isBlock = !!className || String(children).includes('\n')
    if (isBlock) {
      return <code style={{ fontFamily: FM, fontSize: 13, background: 'none' }}>{children}</code>
    }
    return (
      <code style={{
        background: 'rgba(124,58,237,0.15)', color: '#9D5AF0',
        padding: '2px 6px', borderRadius: 4,
        fontFamily: FM, fontSize: 13,
      }}>{children}</code>
    )
  },
  strong: ({ children }) => (
    <strong style={{ color: '#F8FAFC', fontWeight: 600 }}>{children}</strong>
  ),
}

/* ── spinner ── */
function Spinner({ label, sublabel }: { label: string; sublabel?: string }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '3px solid rgba(124,58,237,0.2)',
        borderTopColor: '#7C3AED',
        animation: 'spin 0.9s linear infinite',
      }} />
      <p style={{ fontFamily: FD, fontSize: 15, color: '#94A3B8', margin: 0 }}>{label}</p>
      {sublabel && (
        <p style={{ fontFamily: FD, fontSize: 13, color: '#4A5568', margin: 0 }}>{sublabel}</p>
      )}
    </div>
  )
}

/* ── main component ── */
export default function PlanClient({ sessionId, platform, buildType }: Props) {
  const router = useRouter()

  const [content, setContent] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  /* revision state */
  const [showRevision, setShowRevision] = useState(false)
  const [revisionText, setRevisionText] = useState('')
  const [revising, setRevising] = useState(false)

  /* approve state */
  const [approving, setApproving] = useState(false)
  const [approveError, setApproveError] = useState<string | null>(null)

  const hasFired = useRef(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const platformLabel = ({
    'claude-code': 'Claude Code',
    codex: 'Codex',
    zapier: 'Zapier',
    make: 'Make',
  } as Record<string, string>)[platform] ?? platform

  const buildLabel = buildType === 'workflow' ? 'Workflow' : 'Product'

  /* ── on mount: check DB first, only generate if no plan exists ── */
  useEffect(() => {
    if (hasFired.current) return
    hasFired.current = true

    async function init() {
      try {
        // Step 1: check if a plan is already in the DB
        const statusRes = await fetch(`/api/sessions/${sessionId}/plan-status`)
        if (!statusRes.ok) throw new Error(`plan-status returned ${statusRes.status}`)
        const statusData = await statusRes.json()

        if (statusData.contentMarkdown) {
          // Plan already exists — render immediately, no Claude call needed
          setContent(statusData.contentMarkdown)
          setStatus('ready')
          return
        }

        // Step 2: no plan yet — kick off generation (check HTTP status for real errors)
        fetch(`/api/sessions/${sessionId}/generate-plan`, { method: 'POST' })
          .then(async res => {
            if (!res.ok) {
              const body = await res.json().catch(() => ({}))
              const msg = body.detail ?? body.error ?? `Generation failed (${res.status})`
              console.error('[plan-client] generate-plan error:', msg)
              if (pollRef.current) clearInterval(pollRef.current)
              setErrorMsg(msg)
              setStatus('error')
            }
            // on success the poll below will detect the saved row and stop
          })
          .catch(networkErr => {
            console.error('[plan-client] generate-plan network error:', networkErr)
            if (pollRef.current) clearInterval(pollRef.current)
            setErrorMsg('Network error — could not reach the server. Please refresh.')
            setStatus('error')
          })

        // Step 3: poll plan-status every 2 s until the row appears (90 s timeout)
        const pollStart = Date.now()
        pollRef.current = setInterval(async () => {
          // Safety timeout — if Claude hasn't responded in 90 s, tell the user
          if (Date.now() - pollStart > 90_000) {
            if (pollRef.current) clearInterval(pollRef.current)
            setErrorMsg('Plan generation timed out. Please refresh and try again.')
            setStatus('error')
            return
          }
          try {
            const res = await fetch(`/api/sessions/${sessionId}/plan-status`)
            if (!res.ok) return
            const data = await res.json()
            if (data.contentMarkdown) {
              if (pollRef.current) clearInterval(pollRef.current)
              setContent(data.contentMarkdown)
              setStatus('ready')
            }
          } catch {
            // swallow transient poll errors; next tick will retry
          }
        }, 2000)
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
        setStatus('error')
      }
    }

    init()

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [sessionId])

  /* ── revision handler ── */
  async function handleRevise() {
    if (!revisionText.trim() || revising) return
    setRevising(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/request-revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeRequest: revisionText.trim() }),
      })
      if (!res.ok) throw new Error('Revision failed')
      const data = await res.json()
      setContent(data.contentMarkdown)
      setRevisionText('')
      setShowRevision(false)
    } catch {
      // keep the form open so the user can retry
    } finally {
      setRevising(false)
    }
  }

  /* ── approve handler ── */
  async function handleApprove() {
    if (approving) return
    setApproving(true)
    setApproveError(null)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/generate-steps`, { method: 'POST' })
      if (res.ok) {
        router.push(`/sessions/${sessionId}/build/1`)
      } else {
        const body = await res.json().catch(() => ({}))
        const msg = body.detail ?? body.error ?? `Failed (${res.status})`
        console.error('[plan-client] generate-steps error:', msg)
        setApproveError(msg)
        setApproving(false)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error'
      console.error('[plan-client] generate-steps network error:', msg)
      setApproveError(msg)
      setApproving(false)
    }
  }

  /* ── render: error ── */
  if (status === 'error') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <p style={{ fontFamily: FD, fontSize: 15, color: '#F87171' }}>
          {errorMsg ?? 'Something went wrong.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            fontFamily: FD, fontSize: 14, fontWeight: 600,
            color: '#9D5AF0', background: 'none', border: 'none',
            cursor: 'pointer', textDecoration: 'underline',
          }}
        >
          Refresh and try again
        </button>
      </div>
    )
  }

  /* ── render: loading ── */
  if (status === 'loading' || !content) {
    return (
      <Spinner
        label="Generating your plan…"
        sublabel="This takes ~30–60 seconds — hang tight."
      />
    )
  }

  /* ── render: plan ready ── */
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>

      {/* header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', fontFamily: FM, fontSize: 11,
          background: 'rgba(124,58,237,0.15)', color: '#9D5AF0',
          border: '1px solid rgba(124,58,237,0.25)', borderRadius: 9999,
          padding: '3px 10px', letterSpacing: '0.04em', marginBottom: 16,
        }}>
          {platformLabel} · {buildLabel}
        </div>
        <h1 style={{
          fontFamily: FD, fontWeight: 700, fontSize: 32, color: '#F8FAFC',
          marginBottom: 8, lineHeight: 1.2,
        }}>
          Your Build Plan
        </h1>
        <p style={{ fontFamily: FB, fontSize: 15, color: '#94A3B8' }}>
          Review your plan below. Request changes or approve to start building.
        </p>
      </div>

      {/* plan markdown */}
      <div>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {content}
        </ReactMarkdown>
      </div>

      {/* divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '48px 0 32px' }} />

      {/* revision section */}
      <div style={{ marginBottom: 24 }}>
        {!showRevision ? (
          <button
            onClick={() => setShowRevision(true)}
            disabled={approving}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#94A3B8',
              padding: '10px 20px', borderRadius: 10,
              fontFamily: FD, fontWeight: 600, fontSize: 14,
              cursor: approving ? 'not-allowed' : 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              if (!approving) {
                e.currentTarget.style.color = '#F8FAFC'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#94A3B8'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
            }}
          >
            Request Revision
          </button>
        ) : (
          <div>
            <p style={{
              fontFamily: FD, fontWeight: 600, fontSize: 16, color: '#F8FAFC',
              marginBottom: 12,
            }}>
              What would you like to change?
            </p>
            <textarea
              value={revisionText}
              onChange={e => setRevisionText(e.target.value)}
              disabled={revising}
              placeholder="e.g. Add Stripe payments, make it mobile-first, remove the dashboard page…"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#1A1A2E',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '12px 14px',
                fontFamily: FB, fontSize: 14, color: '#F8FAFC',
                minHeight: 100, resize: 'vertical',
                outline: 'none', display: 'block', marginBottom: 12,
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
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleRevise}
                disabled={revising || !revisionText.trim()}
                style={{
                  background: revising || !revisionText.trim()
                    ? 'rgba(124,58,237,0.4)' : '#7C3AED',
                  color: 'white', border: 'none', borderRadius: 10,
                  padding: '10px 20px',
                  fontFamily: FD, fontWeight: 600, fontSize: 14,
                  cursor: revising || !revisionText.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {revising ? 'Updating…' : 'Submit'}
              </button>
              <button
                onClick={() => { setShowRevision(false); setRevisionText('') }}
                disabled={revising}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#94A3B8', padding: '10px 20px', borderRadius: 10,
                  fontFamily: FD, fontWeight: 600, fontSize: 14,
                  cursor: revising ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* approve error */}
      {approveError && (
        <p style={{
          fontFamily: FB, fontSize: 13, color: '#F87171',
          marginBottom: 12, padding: '10px 14px',
          background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 8,
        }}>
          Error: {approveError}
        </p>
      )}

      {/* approve button */}
      <button
        onClick={handleApprove}
        disabled={approving || revising || showRevision}
        style={{
          background: approving || revising || showRevision
            ? 'rgba(124,58,237,0.5)' : '#7C3AED',
          color: 'white', border: 'none', borderRadius: 16,
          padding: '14px 28px',
          fontFamily: FD, fontSize: 16, fontWeight: 600,
          width: '100%',
          cursor: approving || revising || showRevision ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
        }}
        onMouseEnter={e => {
          if (!approving && !revising && !showRevision) {
            e.currentTarget.style.background = '#9D5AF0'
            e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.35)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = approving || revising || showRevision
            ? 'rgba(124,58,237,0.5)' : '#7C3AED'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {approving ? 'Generating steps…' : 'Approve & Continue →'}
      </button>

    </div>
  )
}
