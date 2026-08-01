'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import RetroShell from '@/components/retro-os/retro-shell'
import WindowCard, { RetroButton } from '@/components/retro-os/window-card'

const BORDER = '#000000'
const INK = '#1B1533'
const INK_SOFT = '#5A536F'
const GOLD = '#FFCB33'
const PINK = '#FF5FA8'
const BLUE = '#5C7CFA'
const VIOLET = '#9B7FD1'
const WINDOW = '#FFFFFF'
const WINDOW_ALT = '#ECE9F5'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"

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
    <h1 style={{ fontFamily: FD, fontSize: 18, fontWeight: 800, color: INK, marginTop: 0, marginBottom: 12, paddingBottom: 8, borderBottom: `1.5px solid ${WINDOW_ALT}` }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontFamily: FD, fontSize: 15, fontWeight: 700, color: INK, marginTop: 22, marginBottom: 8 }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontFamily: FD, fontSize: 13.5, fontWeight: 700, color: INK, marginTop: 16, marginBottom: 6 }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{ fontFamily: FB, fontSize: 13.5, color: INK_SOFT, lineHeight: 1.7, margin: '0 0 12px' }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: '0 0 12px', paddingLeft: 20, color: INK_SOFT }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: '0 0 12px', paddingLeft: 20, color: INK_SOFT }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ fontFamily: FB, fontSize: 13.5, lineHeight: 1.7, marginBottom: 4 }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 700, color: INK }}>{children}</strong>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-')
    if (isBlock) {
      return (
        <code style={{
          display: 'block', background: WINDOW_ALT, border: `1.5px solid ${BORDER}`,
          borderRadius: 8, padding: '12px 14px',
          fontFamily: FM, fontSize: 12, color: INK, lineHeight: 1.7,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          margin: '8px 0',
        }}>{children}</code>
      )
    }
    return (
      <code style={{
        fontFamily: FM, fontSize: 12, color: VIOLET,
        background: '#F3EDFB', borderRadius: 4,
        padding: '1px 6px', border: `1px solid ${WINDOW_ALT}`,
      }}>{children}</code>
    )
  },
  pre: ({ children }) => (
    <pre style={{ margin: '8px 0', borderRadius: 8, overflow: 'auto' }}>{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: `4px solid ${GOLD}`, margin: '0 0 12px',
      padding: '8px 14px', background: '#FFFDF0',
      borderRadius: '0 8px 8px 0',
    }}>{children}</blockquote>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '0 0 14px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FB, fontSize: 13 }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{ padding: '8px 12px', textAlign: 'left', color: WINDOW, fontWeight: 700, fontSize: 12, fontFamily: FD, background: INK, border: `1.5px solid ${BORDER}` }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{ padding: '9px 12px', color: INK_SOFT, verticalAlign: 'top', border: `1.5px solid #D8D0EE` }}>{children}</td>
  ),
  hr: () => <hr style={{ border: 'none', borderTop: `1.5px solid ${WINDOW_ALT}`, margin: '18px 0' }} />,
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

  const progressPct = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0

  const taskbarTabs = [
    { filename: 'prd_review.sys', color: VIOLET },
    { filename: 'dashboard', color: PINK },
  ]

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
      const res = await fetch(`/api/build-ai/project/${projectId}/sections/${section.id}/approve`, { method: 'POST' })
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

  return (
    <RetroShell activePath="build-ai" taskbarTabs={taskbarTabs}>
      {/* Breadcrumb */}
      <div style={{
        maxWidth: 800, margin: '0 auto', padding: '20px 32px 0',
        fontFamily: FV, fontSize: 16, color: INK,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button
          onClick={() => router.push('/build-ai')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FV, fontSize: 16, color: INK_SOFT, fontWeight: 700, padding: 0 }}
        >← Build AI with AI</button>
        <span style={{ color: INK_SOFT }}>/</span>
        <span style={{ fontWeight: 700, color: INK, fontFamily: FV, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
          {projectTitle}
        </span>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '22px 32px 40px' }}>

        {/* Progress header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <h1 style={{ fontFamily: FD, fontWeight: 800, fontSize: 26, color: INK, margin: 0 }}>
              Review Your PRD
            </h1>
            <span style={{
              fontFamily: FV, fontSize: 13, fontWeight: 700,
              background: WINDOW_ALT, color: INK_SOFT,
              border: `1.5px solid ${BORDER}`, borderRadius: 100,
              padding: '3px 11px',
            }}>
              {approvedCount}/{totalCount} sections
            </span>
          </div>

          {/* Retro progress bar */}
          <div style={{
            height: 10, background: WINDOW_ALT, border: `1.5px solid ${BORDER}`,
            borderRadius: 100, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${BLUE}, ${VIOLET})`,
              borderRadius: 100, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Section WindowCard */}
        <WindowCard
          bar={{ gradient: `linear-gradient(90deg, ${VIOLET} 0%, #C4AEED 100%)`, label: `section_${section.sectionNumber}.md` }}
          style={{ marginBottom: 22 }}
          borderRadius={16}
        >
          <div style={{ background: WINDOW, padding: '26px 30px', borderRadius: '0 0 14px 14px' }}>
            {/* Section heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <span style={{
                flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
                background: WINDOW_ALT, border: `2px solid ${BORDER}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FD, fontSize: 13, fontWeight: 800, color: INK,
              }}>
                {section.sectionNumber}
              </span>
              <h2 style={{ fontFamily: FD, fontSize: 18, fontWeight: 700, color: INK, margin: 0 }}>
                {section.sectionName}
              </h2>
            </div>

            {/* Content */}
            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  rows={20}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: WINDOW_ALT, border: `2px solid ${BORDER}`,
                    borderRadius: 10, padding: '14px 16px',
                    fontFamily: FM, fontSize: 12, color: INK,
                    lineHeight: 1.7, outline: 'none', resize: 'vertical',
                  }}
                />
                {saveError && <p style={{ fontFamily: FB, fontSize: 13, color: '#EF4444', margin: 0 }}>✗ {saveError}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <RetroButton onClick={handleSave} disabled={saving} variant="violet">
                    {saving ? 'Saving…' : 'Save'}
                  </RetroButton>
                  <RetroButton onClick={handleCancelEdit} disabled={saving} variant="secondary">
                    Cancel
                  </RetroButton>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {currentContent}
                  </ReactMarkdown>
                </div>
                <button
                  onClick={() => { setDraft(currentContent); setEditMode(true) }}
                  style={{
                    background: WINDOW_ALT, color: INK_SOFT,
                    border: `2px solid ${BORDER}`, borderRadius: 8,
                    padding: '6px 16px', fontFamily: FV, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', boxShadow: `2px 2px 0 ${BORDER}`,
                  }}
                >
                  Edit this section
                </button>
              </div>
            )}
          </div>
        </WindowCard>

        {/* Approve button */}
        {!editMode && (
          <div>
            {approveError && (
              <p style={{ fontFamily: FB, fontSize: 13, color: '#EF4444', marginBottom: 12 }}>✗ {approveError}</p>
            )}
            <button
              onClick={handleApprove}
              disabled={approving}
              style={{
                display: 'block', width: '100%', boxSizing: 'border-box',
                background: approving ? 'rgba(92,124,250,0.4)' : BLUE,
                color: '#fff', border: `2.5px solid ${BORDER}`,
                borderRadius: 14, padding: '16px 0',
                fontFamily: FD, fontWeight: 700, fontSize: 15,
                cursor: approving ? 'not-allowed' : 'pointer',
                boxShadow: approving ? 'none' : `6px 6px 0 ${BORDER}`,
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
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
    </RetroShell>
  )
}
