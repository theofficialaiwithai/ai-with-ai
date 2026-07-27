'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FB = "var(--font-inter,'Inter'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const FS = "var(--font-sora,'Sora'),sans-serif"

const BG = '#0D0D1A'
const SURFACE = '#1A1A2E'
const BORDER = 'rgba(255,255,255,0.06)'
const VIOLET = '#7C3AED'

interface Section {
  id: number
  sectionNumber: number
  sectionName: string
  contentMarkdown: string
}

interface Props {
  projectId: number
  projectTitle: string
  section: Section
  approvedCount: number
  totalCount: number
}

const mdComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: ({ children }) => (
    <h1 style={{ fontFamily: FS, fontSize: 20, fontWeight: 700, color: '#F8FAFC', margin: '24px 0 10px' }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontFamily: FD, fontSize: 17, fontWeight: 700, color: '#F8FAFC', margin: '20px 0 8px' }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontFamily: FD, fontSize: 15, fontWeight: 600, color: '#E2E8F0', margin: '16px 0 6px' }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{ fontFamily: FB, fontSize: 14, color: '#CBD5E1', lineHeight: 1.75, margin: '0 0 14px' }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: '0 0 14px', paddingLeft: 22, color: '#CBD5E1' }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: '0 0 14px', paddingLeft: 22, color: '#CBD5E1' }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ fontFamily: FB, fontSize: 14, lineHeight: 1.75, marginBottom: 4 }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 700, color: '#F8FAFC' }}>{children}</strong>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-')
    if (isBlock) {
      return (
        <code style={{
          display: 'block', background: BG, border: `1px solid ${BORDER}`,
          borderRadius: 8, padding: '14px 16px',
          fontFamily: FM, fontSize: 12, color: '#CBD5E1', lineHeight: 1.7,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          margin: '8px 0',
        }}>{children}</code>
      )
    }
    return (
      <code style={{
        fontFamily: FM, fontSize: 12, color: '#C4B5FD',
        background: 'rgba(124,58,237,0.12)', borderRadius: 4,
        padding: '1px 6px',
      }}>{children}</code>
    )
  },
  pre: ({ children }) => (
    <pre style={{ margin: '8px 0', borderRadius: 8, overflow: 'auto' }}>{children}</pre>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '0 0 16px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FB, fontSize: 13 }}>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>{children}</tr>
  ),
  th: ({ children }) => (
    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#94A3B8', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: FM }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{ padding: '10px 12px', color: '#CBD5E1', verticalAlign: 'top' }}>{children}</td>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: '3px solid #F59E0B', margin: '0 0 14px',
      padding: '10px 16px', background: 'rgba(245,158,11,0.06)',
      borderRadius: '0 8px 8px 0',
    }}>{children}</blockquote>
  ),
  hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${BORDER}`, margin: '20px 0' }} />,
}

export default function PrdReviewClient({ projectId, projectTitle, section, approvedCount, totalCount }: Props) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState(section.contentMarkdown)
  const [currentContent, setCurrentContent] = useState(section.contentMarkdown)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [approving, setApproving] = useState(false)
  const [approveError, setApproveError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/build-ai/project/${projectId}/sections/${section.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentMarkdown: draft }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? `Save failed (${res.status})`)
      }
      setCurrentContent(draft)
      setEditMode(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function handleCancelEdit() {
    setDraft(currentContent)
    setEditMode(false)
    setSaveError(null)
  }

  async function handleApprove() {
    setApproving(true)
    setApproveError(null)
    try {
      const res = await fetch(`/api/build-ai/project/${projectId}/sections/${section.id}/approve`, {
        method: 'POST',
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? `Approve failed (${res.status})`)
      }
      const { allApproved } = await res.json()
      if (allApproved) {
        router.push(`/build-ai/project/${projectId}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : 'Something went wrong')
      setApproving(false)
    }
  }

  const progressPct = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#F8FAFC' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 56,
        background: 'rgba(13,13,26,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 28px',
      }}>
        <a
          href="/build-ai"
          style={{ fontFamily: FD, fontWeight: 600, fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F8FAFC' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8' }}
        >
          ← Build AI with AI
        </a>
        <span style={{ color: '#374151', fontSize: 11 }}>/</span>
        <span style={{ fontFamily: FD, fontSize: 13, color: '#F8FAFC', fontWeight: 600 }}>
          {projectTitle}
        </span>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{
              fontFamily: FM, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#9D5AF0',
              background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
              borderRadius: 4, padding: '2px 8px',
            }}>
              PRD Review
            </span>
            <span style={{ fontFamily: FM, fontSize: 12, color: '#4A5568' }}>
              {approvedCount} of {totalCount} sections approved
            </span>
          </div>

          {/* Progress bar */}
          <div style={{
            height: 4, background: 'rgba(255,255,255,0.06)',
            borderRadius: 4, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${VIOLET}, #9D5AF0)`,
              borderRadius: 4, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Section card */}
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: '28px 28px',
        }}>
          {/* Section heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{
              flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(124,58,237,0.15)', border: `1px solid ${VIOLET}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FM, fontSize: 11, fontWeight: 700, color: '#C4B5FD',
            }}>
              {section.sectionNumber}
            </span>
            <h2 style={{ fontFamily: FS, fontSize: 18, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
              {section.sectionName}
            </h2>
          </div>

          {/* Content: render or edit */}
          {editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={20}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: BG, border: `1px solid ${VIOLET}`,
                  borderRadius: 10, padding: '14px 16px',
                  fontFamily: FM, fontSize: 12, color: '#E2E8F0',
                  lineHeight: 1.7, outline: 'none', resize: 'vertical',
                }}
              />
              {saveError && (
                <p style={{ fontFamily: FB, fontSize: 13, color: '#F87171', margin: 0 }}>✗ {saveError}</p>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: VIOLET, color: '#fff', border: 'none',
                    borderRadius: 8, padding: '9px 20px',
                    fontFamily: FD, fontWeight: 600, fontSize: 13,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  style={{
                    background: 'none', color: '#94A3B8',
                    border: `1px solid ${BORDER}`, borderRadius: 8,
                    padding: '9px 20px', fontFamily: FD, fontWeight: 500,
                    fontSize: 13, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 24 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {currentContent}
                </ReactMarkdown>
              </div>
              <button
                onClick={() => { setDraft(currentContent); setEditMode(true) }}
                style={{
                  background: 'none', color: '#64748B',
                  border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 7,
                  padding: '6px 14px', fontFamily: FB, fontSize: 12,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B' }}
              >
                Edit this section
              </button>
            </div>
          )}
        </div>

        {/* Approve button */}
        {!editMode && (
          <div style={{ marginTop: 24 }}>
            {approveError && (
              <p style={{ fontFamily: FB, fontSize: 13, color: '#F87171', marginBottom: 12 }}>✗ {approveError}</p>
            )}
            <button
              onClick={handleApprove}
              disabled={approving}
              style={{
                width: '100%', background: approving ? 'rgba(124,58,237,0.5)' : VIOLET,
                color: '#fff', border: 'none', borderRadius: 12,
                padding: '14px 0', fontFamily: FD, fontWeight: 700, fontSize: 15,
                cursor: approving ? 'not-allowed' : 'pointer',
                boxShadow: approving ? 'none' : '0 4px 20px rgba(124,58,237,0.35)',
                transition: 'background 0.15s',
              }}
            >
              {approving
                ? '✦ Saving…'
                : approvedCount === totalCount - 1
                  ? 'Approve & Finish →'
                  : `Approve & Continue → (${totalCount - approvedCount - 1} left)`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
