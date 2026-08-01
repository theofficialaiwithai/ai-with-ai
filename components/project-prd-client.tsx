'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import RetroShell from '@/components/retro-os/retro-shell'
import WindowCard, { RetroButton, RetroPill } from '@/components/retro-os/window-card'

const BORDER = '#000000'
const INK = '#1B1533'
const INK_SOFT = '#5A536F'
const GOLD = '#FFCB33'
const PINK = '#FF5FA8'
const PINK_SOFT = '#FF9BD0'
const BLUE = '#5C7CFA'
const LIME = '#5FD98A'
const VIOLET = '#9B7FD1'
const WINDOW = '#FFFFFF'
const WINDOW_ALT = '#ECE9F5'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"

const BUILD_TOOL_LABELS: Record<string, string> = {
  claude_code: 'CLAUDE CODE',
  cursor: 'CURSOR',
  replit: 'REPLIT',
  lovable: 'LOVABLE',
}

const PATH_LABELS: Record<string, string> = {
  from_scratch: 'FROM SCRATCH',
  agentify_existing: 'ENHANCE EXISTING',
  level_project: 'LEVEL PROJECT',
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

function deriveFilename(title: string) {
  const word = title.trim().split(/[\s—–\-]/)[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${word || 'project'}.prd`
}

function statusTag(status: string): { label: string; bg: string; color: string } {
  if (status === 'building') return { label: 'BUILDING', bg: PINK, color: '#fff' }
  if (status === 'complete') return { label: 'COMPLETE', bg: LIME, color: INK }
  if (['reviewing_sections', 'prd_generated'].includes(status)) return { label: 'PRD_GENERATED', bg: WINDOW_ALT, color: INK_SOFT }
  return { label: status.toUpperCase().replace(/_/g, '_'), bg: WINDOW_ALT, color: INK_SOFT }
}

const mdComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: ({ children }) => (
    <h1 style={{ fontFamily: FD, fontSize: 20, fontWeight: 800, color: INK, marginTop: 0, marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${WINDOW_ALT}` }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontFamily: FD, fontSize: 16, fontWeight: 700, color: INK, marginTop: 26, marginBottom: 10, paddingBottom: 7, borderBottom: `1.5px solid ${WINDOW_ALT}` }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontFamily: FD, fontSize: 14, fontWeight: 700, color: INK, marginTop: 18, marginBottom: 7 }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{ fontFamily: FB, fontSize: 13.5, color: INK_SOFT, lineHeight: 1.7, marginBottom: 12, marginTop: 0 }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ fontFamily: FB, fontSize: 13.5, color: INK_SOFT, lineHeight: 1.7, marginBottom: 12, paddingLeft: 20 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ fontFamily: FB, fontSize: 13.5, color: INK_SOFT, lineHeight: 1.7, marginBottom: 12, paddingLeft: 20 }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: 4 }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong style={{ color: INK, fontWeight: 700 }}>{children}</strong>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-')
    return isBlock ? (
      <code style={{
        display: 'block', fontFamily: FM, fontSize: 12,
        background: WINDOW_ALT, color: INK,
        padding: '12px 16px', borderRadius: 8,
        border: `1.5px solid ${BORDER}`,
        overflowX: 'auto', lineHeight: 1.7, whiteSpace: 'pre',
      }}>{children}</code>
    ) : (
      <code style={{
        fontFamily: FM, fontSize: 12, color: VIOLET,
        background: '#F3EDFB', padding: '2px 6px',
        borderRadius: 4, border: `1px solid ${WINDOW_ALT}`,
      }}>{children}</code>
    )
  },
  pre: ({ children }) => (
    <pre style={{ marginBottom: 14, marginTop: 8, borderRadius: 8, overflow: 'hidden' }}>{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: `4px solid ${GOLD}`,
      margin: '0 0 14px', color: INK_SOFT,
      background: '#FFFDF0', borderRadius: '0 8px 8px 0',
      padding: '10px 14px',
    }}>{children}</blockquote>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', marginBottom: 14 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FB, fontSize: 13 }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{
      textAlign: 'left', padding: '8px 12px',
      fontFamily: FD, fontWeight: 700, fontSize: 12, color: WINDOW,
      borderBottom: `2px solid ${BORDER}`, background: INK,
      border: `1.5px solid ${BORDER}`,
    }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{
      padding: '9px 12px', color: INK_SOFT,
      border: `1.5px solid #D8D0EE`, verticalAlign: 'top', lineHeight: 1.55,
    }}>{children}</td>
  ),
  hr: () => (
    <hr style={{ border: 'none', borderTop: `2px solid ${WINDOW_ALT}`, margin: '22px 0' }} />
  ),
}

export default function ProjectPrdClient({ project }: { project: Project }) {
  const router = useRouter()
  const filename = deriveFilename(project.title)

  const [copied, setCopied] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [draftPrd, setDraftPrd] = useState(project.prdMarkdown)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [acknowledged, setAcknowledged] = useState(project.domainRiskAcknowledged)
  const [riskChecked, setRiskChecked] = useState(false)
  const [acknowledging, setAcknowledging] = useState(false)
  const [ackError, setAckError] = useState<string | null>(null)

  const [building, setBuilding] = useState(false)
  const [buildError, setBuildError] = useState<string | null>(null)

  const showRiskPanel = project.domainRiskFlagged && !acknowledged
  const canStartBuilding = project.status === 'prd_generated' && (!project.domainRiskFlagged || acknowledged)

  const tag = statusTag(project.status)
  const taskbarTabs = [
    { filename, color: PINK },
    { filename: 'dashboard', color: BLUE },
  ]

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
      const res = await fetch(`/api/build-ai/project/${project.id}/acknowledge-risk`, { method: 'POST' })
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
      const res = await fetch(`/api/build-ai/project/${project.id}/generate-steps`, { method: 'POST' })
      if (!res.ok) {
        let msg = `Server error (${res.status})`
        try { const d = await res.json(); msg = d.error ?? msg } catch {}
        throw new Error(msg)
      }
      router.push(`/build-ai/project/${project.id}/build-map`)
    } catch (err) {
      setBuildError(err instanceof Error ? err.message : 'Something went wrong')
      setBuilding(false)
    }
  }

  return (
    <RetroShell activePath="build-ai" taskbarTabs={taskbarTabs}>
      {/* Breadcrumb */}
      <div style={{
        maxWidth: 900, margin: '0 auto', padding: '20px 32px 0',
        fontFamily: FV, fontSize: 16, color: INK,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button
          onClick={() => router.push('/build-ai')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FV, fontSize: 16, color: INK_SOFT, fontWeight: 700, padding: 0 }}
        >← Build AI with AI</button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '18px 32px 40px' }}>

        {/* Page header */}
        <h1 style={{ fontFamily: FD, fontWeight: 800, fontSize: 26, color: INK, marginBottom: 12, lineHeight: 1.25 }}>
          {project.title}
        </h1>

        {/* Meta pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <span style={{
            fontFamily: FV, fontSize: 13, fontWeight: 700,
            background: tag.bg, color: tag.color,
            border: `1.5px solid ${BORDER}`, borderRadius: 100, padding: '3px 11px',
          }}>{tag.label}</span>
          <RetroPill>{PATH_LABELS[project.path] ?? project.path}</RetroPill>
          {project.buildTool && (
            <RetroPill>{BUILD_TOOL_LABELS[project.buildTool] ?? project.buildTool}</RetroPill>
          )}
          {project.existingAppUrl && (
            <a
              href={project.existingAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: FV, fontSize: 13, fontWeight: 700,
                color: VIOLET, border: `1.5px solid ${VIOLET}`,
                borderRadius: 100, padding: '3px 11px',
                textDecoration: 'none', background: '#F3EDFB',
              }}
            >
              ↗ {project.existingAppUrl.replace(/^https?:\/\//, '')}
            </a>
          )}
          {project.createdAt && (
            <span style={{ fontFamily: FV, fontSize: 14, color: INK_SOFT }}>{formatDate(project.createdAt)}</span>
          )}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 20 }}>
          {!editMode ? (
            <>
              <RetroButton variant="secondary" onClick={handleCopy}>
                {copied ? '✓ Copied' : 'Copy PRD'}
              </RetroButton>
              <RetroButton variant="secondary" onClick={handleEdit}>Edit PRD</RetroButton>
            </>
          ) : (
            <>
              <RetroButton variant="secondary" onClick={handleCancel} disabled={saving}>Cancel</RetroButton>
              <RetroButton variant="violet" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </RetroButton>
            </>
          )}
        </div>
        {saveError && (
          <p style={{ fontFamily: FB, fontSize: 13, color: '#EF4444', marginBottom: 12, textAlign: 'right' }}>✗ {saveError}</p>
        )}

        {/* Risk callout */}
        {showRiskPanel && (
          <div style={{
            background: '#FFFDF0', border: `2px solid ${GOLD}`,
            borderLeft: `5px solid ${GOLD}`, borderRadius: 12,
            padding: '18px 22px', marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>⚠</span>
              <div>
                <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 14, color: INK, margin: '0 0 6px' }}>
                  Domain risk detected — review required before building
                </p>
                <p style={{ fontFamily: FB, fontSize: 13, color: INK_SOFT, lineHeight: 1.6, margin: 0 }}>
                  This project touches sensitive categories:{' '}
                  <strong>{project.riskCategories.join(', ')}</strong>.
                  Review carefully before building.
                </p>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none', marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={riskChecked}
                onChange={e => setRiskChecked(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#000', cursor: 'pointer' }}
              />
              <span style={{ fontFamily: FB, fontSize: 13, color: INK }}>
                I&apos;ve read this and understand the risk
              </span>
            </label>
            {ackError && <p style={{ fontFamily: FB, fontSize: 12, color: '#EF4444', margin: '0 0 8px' }}>✗ {ackError}</p>}
            <RetroButton
              onClick={handleAcknowledge}
              disabled={!riskChecked || acknowledging}
              variant="primary"
            >
              {acknowledging ? 'Confirming…' : 'Confirm & Unlock'}
            </RetroButton>
          </div>
        )}

        {/* PRD Document */}
        <WindowCard
          bar={{ gradient: `linear-gradient(90deg, ${PINK} 0%, ${PINK_SOFT} 100%)`, label: filename }}
          style={{ marginBottom: 26 }}
          borderRadius={16}
        >
          {editMode ? (
            <textarea
              value={draftPrd}
              onChange={e => setDraftPrd(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%', boxSizing: 'border-box',
                minHeight: 640, resize: 'vertical',
                background: WINDOW, border: 'none', borderRadius: '0 0 14px 14px',
                padding: '28px 32px',
                fontFamily: FM, fontSize: 13, color: INK,
                lineHeight: 1.75, outline: 'none',
              }}
            />
          ) : (
            <div style={{ background: WINDOW, padding: '28px 32px', borderRadius: '0 0 14px 14px' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {project.prdMarkdown}
              </ReactMarkdown>
            </div>
          )}
        </WindowCard>

        {/* Bottom actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {project.status === 'prd_generated' && project.domainRiskFlagged && !acknowledged && (
            <p style={{ fontFamily: FV, fontSize: 14, color: INK_SOFT, textAlign: 'center', margin: 0 }}>
              Acknowledge the risk review above to unlock Start Building.
            </p>
          )}

          {project.status === 'prd_generated' && (
            <button
              onClick={handleStartBuilding}
              disabled={!canStartBuilding || building}
              style={{
                display: 'block', width: '100%', boxSizing: 'border-box',
                background: !canStartBuilding || building ? 'rgba(92,124,250,0.4)' : BLUE,
                color: '#fff', textDecoration: 'none',
                fontFamily: FD, fontWeight: 700, fontSize: 16,
                padding: '16px 0', border: `2.5px solid ${BORDER}`,
                borderRadius: 14, textAlign: 'center',
                boxShadow: canStartBuilding && !building ? `6px 6px 0 ${BORDER}` : 'none',
                cursor: !canStartBuilding || building ? 'not-allowed' : 'pointer',
                opacity: !canStartBuilding ? 0.55 : 1,
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
              }}
            >
              {building ? '✦ Generating your build plan…' : 'Continue Building →'}
            </button>
          )}

          {buildError && (
            <p style={{ fontFamily: FB, fontSize: 13, color: '#EF4444', margin: 0, textAlign: 'center' }}>✗ {buildError}</p>
          )}

          {(project.status === 'building' || project.status === 'complete') && (
            <button
              onClick={() => router.push(`/build-ai/project/${project.id}/${project.status === 'building' ? 'build-map' : 'coach'}`)}
              style={{
                display: 'block', width: '100%', boxSizing: 'border-box',
                background: project.status === 'complete' ? LIME : BLUE,
                color: project.status === 'complete' ? INK : '#fff',
                fontFamily: FD, fontWeight: 700, fontSize: 16,
                padding: '16px 0', border: `2.5px solid ${BORDER}`,
                borderRadius: 14, textAlign: 'center',
                boxShadow: `6px 6px 0 ${BORDER}`,
                cursor: 'pointer',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
              }}
            >
              {project.status === 'complete' ? '✓ View Completed Build' : 'Continue Building →'}
            </button>
          )}

          <button
            onClick={() => router.push('/build-ai/new')}
            style={{
              background: 'none', border: `2px solid ${BORDER}`,
              color: INK_SOFT, fontFamily: FV, fontWeight: 700, fontSize: 14,
              padding: '8px 18px', borderRadius: 10, cursor: 'pointer',
              alignSelf: 'flex-start', boxShadow: `2px 2px 0 ${BORDER}`,
            }}
          >
            + New Project
          </button>
        </div>
      </div>
    </RetroShell>
  )
}
