'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

interface Props {
  sessionId: string
  platform: string
  buildType: string | null
  initialMarkdown: string
}

/* ── markdown component overrides ── */
const mdComponents: Components = {
  h2: ({ children }) => (
    <h2 style={{
      fontFamily: FD, fontWeight: 700, fontSize: 24, color: '#F8FAFC',
      marginTop: 40, marginBottom: 12, paddingBottom: 8,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{
      fontFamily: FD, fontWeight: 600, fontSize: 18, color: '#F8FAFC',
      marginTop: 24, marginBottom: 8,
    }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{
      fontFamily: FB, fontSize: 15, color: '#94A3B8',
      lineHeight: 1.7, marginBottom: 16,
    }}>
      {children}
    </p>
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
    <li style={{ fontFamily: FB, fontSize: 15, marginBottom: 4 }}>
      {children}
    </li>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', marginBottom: 16 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{
      fontFamily: FD, fontWeight: 600, fontSize: 13, color: '#F8FAFC',
      background: '#232340', padding: '10px 14px', textAlign: 'left',
    }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{
      fontFamily: FB, fontSize: 14, color: '#94A3B8',
      padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {children}
    </td>
  ),
  pre: ({ children }) => (
    <pre style={{
      background: '#0A0A16',
      border: '1px solid rgba(255,255,255,0.06)',
      borderLeft: '3px solid #7C3AED',
      borderRadius: 10,
      padding: 20,
      fontFamily: FM,
      fontSize: 13,
      color: '#F8FAFC',
      overflowX: 'auto',
      display: 'block',
      margin: '16px 0',
      whiteSpace: 'pre',
    }}>
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    // Block code has className like "language-typescript"; inline doesn't.
    // Also guard against unlabeled fenced blocks by checking for newlines.
    const isBlock = !!className || String(children).includes('\n')
    if (isBlock) {
      return (
        <code style={{ fontFamily: FM, fontSize: 13, background: 'none' }}>
          {children}
        </code>
      )
    }
    return (
      <code style={{
        background: 'rgba(124,58,237,0.15)',
        color: '#9D5AF0',
        padding: '2px 6px',
        borderRadius: 4,
        fontFamily: FM,
        fontSize: 13,
      }}>
        {children}
      </code>
    )
  },
  strong: ({ children }) => (
    <strong style={{ color: '#F8FAFC', fontWeight: 600 }}>{children}</strong>
  ),
}

/* ── main component ── */
export default function PlanReview({ sessionId, platform, buildType, initialMarkdown }: Props) {
  const router = useRouter()
  const [markdown, setMarkdown] = useState(initialMarkdown)
  const [changeRequest, setChangeRequest] = useState('')
  const [revising, setRevising] = useState(false)
  const [approving, setApproving] = useState(false)

  const platformLabel = {
    'claude-code': 'Claude Code',
    codex: 'Codex',
    zapier: 'Zapier',
    make: 'Make',
  }[platform] ?? platform

  const buildLabel = buildType === 'workflow' ? 'Workflow' : 'Product'

  async function handleRevise() {
    if (!changeRequest.trim() || revising) return
    setRevising(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/request-revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeRequest: changeRequest.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setMarkdown(data.contentMarkdown)
        setChangeRequest('')
      }
    } finally {
      setRevising(false)
    }
  }

  async function handleApprove() {
    if (approving) return
    setApproving(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/generate-steps`, { method: 'POST' })
      if (res.ok) {
        router.push(`/sessions/${sessionId}/build/1`)
      } else {
        setApproving(false)
      }
    } catch {
      setApproving(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>

      {/* ── header ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex',
          fontFamily: FM, fontSize: 11,
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

      {/* ── plan markdown ── */}
      <div>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {markdown}
        </ReactMarkdown>
      </div>

      {/* ── revision section ── */}
      <div style={{ marginTop: 48 }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 32 }} />

        <p style={{
          fontFamily: FD, fontWeight: 600, fontSize: 16, color: '#F8FAFC',
          marginBottom: 12,
        }}>
          Want to make changes?
        </p>

        <textarea
          value={changeRequest}
          onChange={e => setChangeRequest(e.target.value)}
          disabled={revising || approving}
          placeholder="e.g. Add Stripe payments, make it mobile-first, remove the dashboard page..."
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#1A1A2E',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            padding: '12px 14px',
            fontFamily: FB, fontSize: 14, color: '#F8FAFC',
            minHeight: 100, resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            marginBottom: 12,
            display: 'block',
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
          onClick={handleRevise}
          disabled={revising || !changeRequest.trim() || approving}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.06)',
            color: revising || !changeRequest.trim() || approving ? '#4A5568' : '#94A3B8',
            padding: '10px 20px',
            borderRadius: 10,
            fontFamily: FD, fontWeight: 600, fontSize: 14,
            cursor: revising || !changeRequest.trim() || approving ? 'not-allowed' : 'pointer',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => {
            if (!revising && changeRequest.trim() && !approving) {
              const btn = e.currentTarget
              btn.style.color = '#F8FAFC'
              btn.style.borderColor = 'rgba(255,255,255,0.18)'
            }
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget
            btn.style.color = revising || !changeRequest.trim() || approving ? '#4A5568' : '#94A3B8'
            btn.style.borderColor = 'rgba(255,255,255,0.06)'
          }}
        >
          {revising ? 'Updating…' : 'Update Plan'}
        </button>
      </div>

      {/* ── approve button ── */}
      <div style={{ marginTop: 24 }}>
        <button
          onClick={handleApprove}
          disabled={approving || revising}
          style={{
            background: approving || revising ? 'rgba(124,58,237,0.5)' : '#7C3AED',
            color: 'white',
            border: 'none',
            borderRadius: 16,
            padding: '14px 28px',
            fontFamily: FD, fontSize: 16, fontWeight: 600,
            width: '100%',
            cursor: approving || revising ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => {
            if (!approving && !revising) {
              const btn = e.currentTarget
              btn.style.background = '#9D5AF0'
              btn.style.boxShadow = '0 0 24px rgba(124,58,237,0.35)'
              btn.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget
            btn.style.background = approving || revising ? 'rgba(124,58,237,0.5)' : '#7C3AED'
            btn.style.boxShadow = 'none'
            btn.style.transform = 'translateY(0)'
          }}
        >
          {approving ? 'Generating steps…' : 'Approve This Plan →'}
        </button>
      </div>

    </div>
  )
}
