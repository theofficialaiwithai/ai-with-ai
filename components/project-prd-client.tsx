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

const BUILD_TOOL_LABELS: Record<string, string> = {
  claude_code: 'Claude Code',
  cursor: 'Cursor',
  replit: 'Replit',
  lovable: 'Lovable',
}

const PATH_LABELS: Record<string, string> = {
  from_scratch: 'From Scratch',
  agentify_existing: 'Enhance Existing',
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  prd_generated: { bg: 'rgba(124,58,237,0.15)', color: '#C4B5FD' },
  building:      { bg: 'rgba(245,158,11,0.15)', color: '#FCD34D' },
  completed:     { bg: 'rgba(16,185,129,0.15)',  color: '#6EE7B7' },
  discovery:     { bg: 'rgba(100,116,139,0.15)', color: '#94A3B8' },
}

type Project = {
  id: number
  title: string
  path: string
  buildTool: string
  status: string
  prdMarkdown: string
  domainRiskFlagged: boolean
  domainRiskAcknowledged: boolean
  existingAppUrl: string | null
  riskCategories: string[]
  createdAt: string
}

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectPrdClient({ project }: { project: Project }) {
  const router = useRouter()

  // copy
  const [copied, setCopied] = useState(false)

  // edit mode
  const [editMode, setEditMode] = useState(false)
  const [draftPrd, setDraftPrd] = useState(project.prdMarkdown)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // risk acknowledgment
  const [acknowledged, setAcknowledged] = useState(project.domainRiskAcknowledged)
  const [riskChecked, setRiskChecked] = useState(false)
  const [acknowledging, setAcknowledging] = useState(false)
  const [ackError, setAckError] = useState<string | null>(null)

  // start building
  const [building, setBuilding] = useState(false)
  const [buildError, setBuildError] = useState<string | null>(null)

  const statusStyle = STATUS_COLORS[project.status] ?? STATUS_COLORS.discovery
  const showRiskPanel = project.domainRiskFlagged && !acknowledged
  const canStartBuilding = project.status === 'prd_generated' && (!project.domainRiskFlagged || acknowledged)

  async function handleCopy() {
    await navigator.clipboard.writeText(editMode ? draftPrd : project.prdMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleEdit() {
    setDraftPrd(project.prdMarkdown)
    setSaveError(null)
    setEditMode(true)
  }

  function handleCancel() {
    setDraftPrd(project.prdMarkdown)
    setSaveError(null)
    setEditMode(false)
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/build-ai/project/${project.id}/update-prd`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prdMarkdown: draftPrd }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Save failed')
      }
      router.refresh()
      setEditMode(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleAcknowledge() {
    setAcknowledging(true)
    setAckError(null)
    try {
      const res = await fetch(`/api/build-ai/project/${project.id}/acknowledge-risk`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to acknowledge')
      }
      setAcknowledged(true)
    } catch (err) {
      setAckError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setAcknowledging(false)
    }
  }

  async function handleStartBuilding() {
    setBuilding(true)
    setBuildError(null)
    try {
      const res = await fetch(`/api/build-ai/project/${project.id}/generate-steps`, {
        method: 'POST',
      })
      if (!res.ok) {
        let msg = `Server error (${res.status})`
        try { const d = await res.json(); msg = d.error ?? msg } catch {}
        throw new Error(msg)
      }
      router.push(`/build-ai/project/${project.id}/coach`)
    } catch (err) {
      setBuildError(err instanceof Error ? err.message : 'Something went wrong')
      setBuilding(false)
    }
  }

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
        <button
          onClick={() => router.push('/build-ai')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: FD, fontWeight: 600, fontSize: 13,
            color: '#94A3B8', padding: 0, display: 'flex', alignItems: 'center', gap: 6,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#F8FAFC' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
        >
          ← Build AI with AI
        </button>
        <span style={{ fontFamily: FM, fontSize: 11, color: '#374151' }}>/</span>
        <span style={{
          fontFamily: FD, fontSize: 13, color: '#F8FAFC', fontWeight: 600,
          maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {project.title}
        </span>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: FS, fontSize: 24, fontWeight: 700, color: '#F8FAFC', marginBottom: 12, lineHeight: 1.3 }}>
            {project.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Status */}
            <span style={{
              fontFamily: FM, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '3px 10px', borderRadius: 4,
              background: statusStyle.bg, color: statusStyle.color,
              border: `1px solid ${statusStyle.color}30`,
            }}>
              {project.status.replace(/_/g, ' ')}
            </span>
            {/* Path badge */}
            <span style={{
              fontFamily: FM, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '3px 10px', borderRadius: 4,
              background: 'rgba(255,255,255,0.04)', color: '#64748B',
              border: `1px solid ${BORDER}`,
            }}>
              {PATH_LABELS[project.path] ?? project.path}
            </span>
            {/* Build tool */}
            <span style={{
              fontFamily: FM, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '3px 10px', borderRadius: 4,
              background: 'rgba(255,255,255,0.05)', color: '#94A3B8',
              border: `1px solid ${BORDER}`,
            }}>
              {BUILD_TOOL_LABELS[project.buildTool] ?? project.buildTool}
            </span>
            {/* Existing app URL */}
            {project.existingAppUrl && (
              <a
                href={project.existingAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: FM, fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.04em', color: '#7C3AED',
                  background: 'rgba(124,58,237,0.08)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  padding: '3px 10px', borderRadius: 4,
                  textDecoration: 'none',
                  maxWidth: 260, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)' }}
              >
                ↗ {project.existingAppUrl.replace(/^https?:\/\//, '')}
              </a>
            )}
            {/* Date */}
            {project.createdAt && (
              <span style={{ fontFamily: FB, fontSize: 12, color: '#64748B' }}>
                {formatDate(project.createdAt)}
              </span>
            )}
          </div>
        </div>

        {/* Domain risk panel */}
        {showRiskPanel && (
          <div style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1.5px solid #EF4444',
            borderRadius: 14,
            padding: '22px 24px',
            marginBottom: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>⚠️</span>
              <div>
                <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 14, color: '#FCA5A5', margin: '0 0 6px' }}>
                  Sensitive domain detected — review required before building
                </p>
                <p style={{ fontFamily: FB, fontSize: 13, color: '#CBD5E1', lineHeight: 1.6, margin: 0 }}>
                  This project touches areas that carry regulatory, compliance, or safety risk. You are responsible for meeting all applicable requirements before shipping.
                </p>
              </div>
            </div>

            {project.riskCategories.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                {project.riskCategories.map(cat => (
                  <span key={cat} style={{
                    fontFamily: FM, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                    textTransform: 'uppercase', padding: '3px 9px', borderRadius: 4,
                    background: 'rgba(239,68,68,0.12)', color: '#FCA5A5',
                    border: '1px solid rgba(239,68,68,0.3)',
                  }}>
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none', marginBottom: 14 }}>
              <input
                type="checkbox"
                checked={riskChecked}
                onChange={e => setRiskChecked(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#EF4444', cursor: 'pointer' }}
              />
              <span style={{ fontFamily: FB, fontSize: 13, color: '#F1F5F9' }}>
                I&apos;ve read this and understand the risk
              </span>
            </label>

            {ackError && (
              <p style={{ fontFamily: FB, fontSize: 12, color: '#F87171', margin: '0 0 10px' }}>✗ {ackError}</p>
            )}

            <button
              onClick={handleAcknowledge}
              disabled={!riskChecked || acknowledging}
              style={{
                background: !riskChecked || acknowledging ? 'rgba(239,68,68,0.2)' : '#EF4444',
                border: 'none', color: '#fff',
                fontFamily: FD, fontWeight: 700, fontSize: 13,
                padding: '9px 20px', borderRadius: 8,
                cursor: !riskChecked || acknowledging ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
                opacity: !riskChecked ? 0.5 : 1,
              }}
            >
              {acknowledging ? 'Confirming…' : 'Confirm & Unlock'}
            </button>
          </div>
        )}

        {/* PRD toolbar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 20 }}>
          {!editMode ? (
            <>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? 'rgba(16,185,129,0.15)' : SURFACE,
                  border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : BORDER}`,
                  color: copied ? '#6EE7B7' : '#94A3B8',
                  fontFamily: FM, fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? '✓ Copied' : 'Copy PRD'}
              </button>
              <button
                onClick={handleEdit}
                style={{
                  background: SURFACE, border: `1px solid ${BORDER}`,
                  color: '#94A3B8', fontFamily: FM, fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.color = '#F8FAFC' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = '#94A3B8' }}
              >
                Edit PRD
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                disabled={saving}
                style={{
                  background: SURFACE, border: `1px solid ${BORDER}`,
                  color: '#94A3B8', fontFamily: FM, fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '7px 14px', borderRadius: 8,
                  cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: saving ? 'rgba(124,58,237,0.5)' : VIOLET,
                  border: 'none', color: '#fff',
                  fontFamily: FM, fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '7px 18px', borderRadius: 8,
                  cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          )}
        </div>

        {saveError && (
          <p style={{ fontFamily: FB, fontSize: 13, color: '#F87171', marginBottom: 12, textAlign: 'right' }}>
            ✗ {saveError}
          </p>
        )}

        {/* PRD content */}
        {editMode ? (
          <textarea
            value={draftPrd}
            onChange={e => setDraftPrd(e.target.value)}
            spellCheck={false}
            style={{
              width: '100%', boxSizing: 'border-box',
              minHeight: 640, resize: 'vertical',
              background: SURFACE, border: `1px solid rgba(124,58,237,0.4)`,
              borderRadius: 16, padding: '28px 32px',
              fontFamily: FM, fontSize: 13, color: '#CBD5E1',
              lineHeight: 1.75, outline: 'none',
            }}
          />
        ) : (
          <div style={{
            background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: '36px 40px',
          }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 style={{ fontFamily: FS, fontSize: 22, fontWeight: 700, color: '#F8FAFC', marginTop: 0, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${BORDER}` }}>{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 style={{ fontFamily: FS, fontSize: 17, fontWeight: 700, color: '#F8FAFC', marginTop: 32, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` }}>{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{ fontFamily: FD, fontSize: 14, fontWeight: 700, color: '#E2E8F0', marginTop: 20, marginBottom: 8 }}>{children}</h3>
                ),
                p: ({ children }) => (
                  <p style={{ fontFamily: FB, fontSize: 14, color: '#CBD5E1', lineHeight: 1.75, marginBottom: 14, marginTop: 0 }}>{children}</p>
                ),
                ul: ({ children }) => (
                  <ul style={{ fontFamily: FB, fontSize: 14, color: '#CBD5E1', lineHeight: 1.75, marginBottom: 14, paddingLeft: 20 }}>{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol style={{ fontFamily: FB, fontSize: 14, color: '#CBD5E1', lineHeight: 1.75, marginBottom: 14, paddingLeft: 20 }}>{children}</ol>
                ),
                li: ({ children }) => (
                  <li style={{ marginBottom: 4 }}>{children}</li>
                ),
                strong: ({ children }) => (
                  <strong style={{ color: '#F1F5F9', fontWeight: 700 }}>{children}</strong>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.startsWith('language-')
                  return isBlock ? (
                    <code style={{
                      display: 'block', fontFamily: FM, fontSize: 12,
                      background: '#0D0D1A', color: '#A5F3FC',
                      padding: '14px 18px', borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      overflowX: 'auto', lineHeight: 1.7, whiteSpace: 'pre',
                    }}>{children}</code>
                  ) : (
                    <code style={{
                      fontFamily: FM, fontSize: 12, color: '#C4B5FD',
                      background: 'rgba(124,58,237,0.12)', padding: '2px 6px',
                      borderRadius: 4,
                    }}>{children}</code>
                  )
                },
                pre: ({ children }) => (
                  <pre style={{ marginBottom: 16, marginTop: 8, borderRadius: 8, overflow: 'hidden' }}>{children}</pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote style={{
                    borderLeft: `3px solid ${VIOLET}`,
                    margin: '0 0 16px', color: '#94A3B8',
                    background: 'rgba(124,58,237,0.06)', borderRadius: '0 8px 8px 0',
                    padding: '12px 16px',
                  }}>{children}</blockquote>
                ),
                table: ({ children }) => (
                  <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FB, fontSize: 13 }}>{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th style={{
                    textAlign: 'left', padding: '8px 12px',
                    fontFamily: FD, fontWeight: 700, fontSize: 12, color: '#94A3B8',
                    borderBottom: `1px solid ${BORDER}`, background: '#0D0D1A',
                  }}>{children}</th>
                ),
                td: ({ children }) => (
                  <td style={{
                    padding: '8px 12px', color: '#CBD5E1',
                    borderBottom: `1px solid ${BORDER}`,
                  }}>{children}</td>
                ),
                hr: () => (
                  <hr style={{ border: 'none', borderTop: `1px solid ${BORDER}`, margin: '24px 0' }} />
                ),
              }}
            >
              {project.prdMarkdown}
            </ReactMarkdown>
          </div>
        )}

        {/* Start Building / bottom actions */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Governance gate explainer when blocked */}
          {project.status === 'prd_generated' && project.domainRiskFlagged && !acknowledged && (
            <p style={{
              fontFamily: FB, fontSize: 13, color: '#64748B',
              textAlign: 'center', margin: 0,
            }}>
              Acknowledge the risk review above to unlock Start Building.
            </p>
          )}

          {/* Start Building button */}
          {project.status === 'prd_generated' && (
            <button
              onClick={handleStartBuilding}
              disabled={!canStartBuilding || building}
              style={{
                background: !canStartBuilding || building
                  ? 'rgba(124,58,237,0.25)'
                  : VIOLET,
                border: 'none', color: '#fff',
                fontFamily: FD, fontWeight: 700, fontSize: 16,
                padding: '16px 0', borderRadius: 12, width: '100%',
                cursor: !canStartBuilding || building ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: canStartBuilding && !building ? '0 6px 28px rgba(124,58,237,0.4)' : 'none',
                opacity: !canStartBuilding ? 0.5 : 1,
              }}
            >
              {building ? '✦ Generating your build plan…' : 'Start Building →'}
            </button>
          )}

          {buildError && (
            <p style={{ fontFamily: FB, fontSize: 13, color: '#F87171', margin: 0, textAlign: 'center' }}>
              ✗ {buildError}
            </p>
          )}

          {/* New Project link */}
          <button
            onClick={() => router.push('/build-ai/new')}
            style={{
              background: 'none', border: `1px solid ${BORDER}`,
              color: '#94A3B8', fontFamily: FD, fontWeight: 600, fontSize: 13,
              padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.color = '#F8FAFC' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = '#94A3B8' }}
          >
            + New Project
          </button>
        </div>
      </div>
    </div>
  )
}
