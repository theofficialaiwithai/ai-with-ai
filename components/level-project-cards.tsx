'use client'

import { useState } from 'react'
import type { LevelProjectEntry } from '@/lib/leveling'

const BORDER = '#000000'
const INK = '#1B1533'
const INK_SOFT = '#5A536F'
const LIME = '#5FD98A'
const WINDOW = '#FFFFFF'
const WINDOW_ALT = '#ECE9F5'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

interface Props {
  levelNumber: number
  projects: LevelProjectEntry[]
  bandColor: string
}

export default function LevelProjectCards({ levelNumber, projects, bandColor }: Props) {
  const allComplete = projects.every(p => p.status === 'complete')
  const anyDeployedUrl = projects.find(p => p.deployedUrl)?.deployedUrl ?? null

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        {projects.map(p => (
          <ProjectCard
            key={p.projectNumber}
            project={p}
            levelNumber={levelNumber}
            bandColor={bandColor}
          />
        ))}
      </div>

      {allComplete && (
        <DeployedUrlSection
          projects={projects}
          existingUrl={anyDeployedUrl}
          bandColor={bandColor}
        />
      )}
    </div>
  )
}

function ProjectCard({
  project,
  levelNumber,
  bandColor,
}: {
  project: LevelProjectEntry
  levelNumber: number
  bandColor: string
}) {
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    setStarting(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/build-ai/levels/${levelNumber}/projects/${project.projectNumber}/start`,
        { method: 'POST' }
      )
      if (!res.ok) throw new Error('Failed to start project')
      const { projectId } = await res.json()
      window.location.href = `/build-ai/project/${projectId}/coach`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStarting(false)
    }
  }

  const isComplete = project.status === 'complete'
  const isInProgress = project.status === 'in_progress'

  const statusLabel = isComplete ? 'COMPLETE' : isInProgress ? 'IN_PROGRESS' : 'NOT_STARTED'
  const statusBg = isComplete ? LIME : isInProgress ? bandColor : WINDOW_ALT
  const statusColor = isComplete ? INK : isInProgress ? '#fff' : INK_SOFT

  return (
    <div style={{
      background: WINDOW, border: `2px solid ${BORDER}`,
      borderRadius: 14, padding: '20px 22px',
      boxShadow: `4px 4px 0 ${BORDER}`,
      display: 'flex', alignItems: 'flex-start', gap: 16,
    }}>
      {/* Left: status dot */}
      <div style={{
        width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 5,
        background: isComplete ? LIME : isInProgress ? bandColor : WINDOW_ALT,
        border: `1.5px solid ${BORDER}`,
        boxShadow: isInProgress ? `0 0 8px ${bandColor}80` : 'none',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Status pill */}
        <span style={{
          fontFamily: FV, fontSize: 12, fontWeight: 700,
          display: 'inline-block', background: statusBg, color: statusColor,
          border: `1.5px solid ${BORDER}`, borderRadius: 100,
          padding: '2px 10px', marginBottom: 8,
        }}>
          {statusLabel}
        </span>

        <h3 style={{ fontFamily: FD, fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>
          {project.projectTitle}
        </h3>
        <p style={{ fontFamily: FB, fontSize: 13, color: INK_SOFT, margin: 0, lineHeight: 1.6 }}>
          {project.projectDescription}
        </p>

        {error && (
          <p style={{ fontFamily: FB, fontSize: 12, color: '#EF4444', margin: '8px 0 0' }}>✗ {error}</p>
        )}
      </div>

      {/* Action */}
      <div style={{ flexShrink: 0 }}>
        {isComplete && project.projectId && (
          <a
            href={`/build-ai/project/${project.projectId}`}
            style={{
              display: 'inline-block',
              fontFamily: FV, fontSize: 13, fontWeight: 700,
              color: INK_SOFT,
              background: WINDOW_ALT,
              border: `2px solid ${BORDER}`,
              borderRadius: 8, padding: '7px 14px',
              textDecoration: 'none',
              boxShadow: `2px 2px 0 ${BORDER}`,
            }}
          >
            View build
          </a>
        )}
        {isInProgress && project.projectId && (
          <a
            href={`/build-ai/project/${project.projectId}/coach`}
            style={{
              display: 'inline-block',
              fontFamily: FD, fontSize: 13, fontWeight: 700,
              color: '#fff', background: bandColor,
              border: `2px solid ${BORDER}`,
              borderRadius: 8, padding: '7px 14px',
              textDecoration: 'none',
              boxShadow: `3px 3px 0 ${BORDER}`,
            }}
          >
            Continue →
          </a>
        )}
        {project.status === 'not_started' && (
          <button
            onClick={handleStart}
            disabled={starting}
            style={{
              fontFamily: FD, fontSize: 13, fontWeight: 700,
              color: '#fff', background: starting ? `${bandColor}80` : bandColor,
              border: `2px solid ${BORDER}`,
              borderRadius: 8, padding: '7px 14px',
              cursor: starting ? 'not-allowed' : 'pointer',
              boxShadow: starting ? 'none' : `3px 3px 0 ${BORDER}`,
            }}
          >
            {starting ? '…' : 'Start'}
          </button>
        )}
      </div>
    </div>
  )
}

function DeployedUrlSection({
  projects,
  existingUrl,
  bandColor,
}: {
  projects: LevelProjectEntry[]
  existingUrl: string | null
  bandColor: string
}) {
  const [url, setUrl] = useState(existingUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const targetProject = projects.find(p => p.status === 'complete' && p.projectId != null)
  if (!targetProject?.projectId) return null

  async function handleSave() {
    if (!url.trim() || !targetProject?.projectId) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/build-ai/project/${targetProject.projectId}/deployed-url`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deployedUrl: url.trim() }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if ((existingUrl && !saved) || saved) {
    const displayUrl = saved ? url : existingUrl!
    return (
      <div style={{
        background: WINDOW, border: `2px solid ${BORDER}`,
        borderRadius: 14, padding: '20px 22px',
        boxShadow: `4px 4px 0 ${BORDER}`,
      }}>
        <span style={{
          fontFamily: FV, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em',
          color: bandColor, display: 'block', marginBottom: 10,
          WebkitTextStroke: `0.4px ${BORDER}`,
        }}>
          DEPLOYED ✓
        </span>
        <a
          href={displayUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: FB, fontSize: 13, color: bandColor, wordBreak: 'break-all' }}
        >
          {displayUrl}
        </a>
      </div>
    )
  }

  return (
    <div style={{
      background: WINDOW, border: `2px solid ${BORDER}`,
      borderRadius: 14, padding: '20px 22px',
      boxShadow: `4px 4px 0 ${BORDER}`,
    }}>
      <span style={{
        fontFamily: FV, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em',
        color: INK_SOFT, display: 'block', marginBottom: 6,
      }}>
        SHARE WHAT YOU BUILT (OPTIONAL)
      </span>
      <p style={{ fontFamily: FB, fontSize: 13, color: INK_SOFT, margin: '0 0 14px', lineHeight: 1.5 }}>
        Add a link to what you deployed — it becomes part of your level record.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://your-deployed-app.com"
          style={{
            flex: 1, background: WINDOW_ALT, border: `2px solid ${BORDER}`,
            borderRadius: 8, padding: '9px 14px',
            fontFamily: FB, fontSize: 13, color: INK,
            outline: 'none',
          }}
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
        />
        <button
          onClick={handleSave}
          disabled={saving || !url.trim()}
          style={{
            fontFamily: FD, fontSize: 13, fontWeight: 700,
            color: '#fff', background: (saving || !url.trim()) ? `${bandColor}60` : bandColor,
            border: `2px solid ${BORDER}`, borderRadius: 8, padding: '9px 18px',
            cursor: (saving || !url.trim()) ? 'not-allowed' : 'pointer',
            flexShrink: 0, boxShadow: `3px 3px 0 ${BORDER}`,
          }}
        >
          {saving ? '…' : 'Save'}
        </button>
      </div>
      {error && (
        <p style={{ fontFamily: FB, fontSize: 12, color: '#EF4444', margin: '8px 0 0' }}>✗ {error}</p>
      )}
    </div>
  )
}
