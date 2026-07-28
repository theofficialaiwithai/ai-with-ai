'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LevelProjectEntry } from '@/lib/leveling'

const FB = "var(--font-inter,'Inter'),sans-serif"
const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const BORDER = 'rgba(255,255,255,0.06)'
const SURFACE = '#1A1A24'

interface Props {
  levelNumber: number
  projects: LevelProjectEntry[]
  bandColor: string
}

export default function LevelProjectCards({ levelNumber, projects, bandColor }: Props) {
  const router = useRouter()
  const allComplete = projects.every(p => p.status === 'complete')
  const completeCount = projects.filter(p => p.status === 'complete').length

  const anyDeployedUrl = projects.find(p => p.deployedUrl)?.deployedUrl ?? null

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{
          fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: '#64748B',
        }}>
          Projects
        </span>
        <span style={{
          fontFamily: FB, fontSize: 12, fontWeight: 600,
          color: allComplete ? '#10B981' : '#94A3B8',
        }}>
          {completeCount} of {projects.length} complete
        </span>
      </div>

      {/* Project cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {projects.map(p => (
          <ProjectCard
            key={p.projectNumber}
            project={p}
            levelNumber={levelNumber}
            bandColor={bandColor}
            onStarted={() => router.refresh()}
          />
        ))}
      </div>

      {/* Deployed URL section — only when all complete */}
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
  onStarted,
}: {
  project: LevelProjectEntry
  levelNumber: number
  bandColor: string
  onStarted: () => void
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

  return (
    <div style={{
      background: SURFACE,
      border: `1px solid ${isComplete ? `${bandColor}30` : BORDER}`,
      borderRadius: 14, padding: '20px 22px',
      display: 'flex', alignItems: 'flex-start', gap: 16,
    }}>
      {/* Status indicator */}
      <div style={{
        width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 5,
        background: isComplete ? '#10B981' : isInProgress ? bandColor : 'rgba(255,255,255,0.15)',
        boxShadow: isInProgress ? `0 0 8px ${bandColor}80` : 'none',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{
            fontFamily: FM, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: isComplete ? '#10B981' : isInProgress ? bandColor : '#4B5563',
          }}>
            {isComplete ? 'Complete' : isInProgress ? 'In progress' : 'Not started'}
          </span>
        </div>
        <h3 style={{
          fontFamily: FD, fontSize: 15, fontWeight: 700,
          color: isComplete ? '#94A3B8' : '#F8FAFC',
          margin: '0 0 6px', letterSpacing: '-0.01em',
        }}>
          {project.projectTitle}
        </h3>
        <p style={{
          fontFamily: FB, fontSize: 13, color: '#64748B',
          margin: 0, lineHeight: 1.6,
        }}>
          {project.projectDescription}
        </p>

        {error && (
          <p style={{ fontFamily: FB, fontSize: 12, color: '#F87171', margin: '8px 0 0' }}>
            ✗ {error}
          </p>
        )}
      </div>

      {/* Action button */}
      <div style={{ flexShrink: 0 }}>
        {isComplete && project.projectId && (
          <a
            href={`/build-ai/project/${project.projectId}`}
            style={{
              display: 'inline-block',
              fontFamily: FD, fontSize: 13, fontWeight: 600,
              color: '#64748B',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${BORDER}`,
              borderRadius: 8, padding: '7px 14px',
              textDecoration: 'none',
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
              color: '#fff',
              background: bandColor,
              borderRadius: 8, padding: '7px 14px',
              textDecoration: 'none',
              boxShadow: `0 2px 12px ${bandColor}50`,
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
              color: '#fff',
              background: starting ? `${bandColor}80` : bandColor,
              border: 'none', borderRadius: 8, padding: '7px 14px',
              cursor: starting ? 'not-allowed' : 'pointer',
              boxShadow: starting ? 'none' : `0 2px 12px ${bandColor}50`,
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

  // Pick the first complete project to attach the URL to
  const targetProject = projects.find(p => p.status === 'complete' && p.projectId != null)

  if (!targetProject?.projectId) return null

  if (existingUrl && !saved) {
    return (
      <div style={{
        background: SURFACE, border: `1px solid ${bandColor}30`,
        borderRadius: 14, padding: '20px 22px',
      }}>
        <span style={{
          fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: bandColor,
          display: 'block', marginBottom: 12,
        }}>
          Deployed
        </span>
        <a
          href={existingUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: FB, fontSize: 14, color: '#93C5FD',
            wordBreak: 'break-all',
          }}
        >
          {existingUrl}
        </a>
      </div>
    )
  }

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

  if (saved) {
    return (
      <div style={{
        background: SURFACE, border: `1px solid ${bandColor}30`,
        borderRadius: 14, padding: '20px 22px',
      }}>
        <span style={{
          fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: bandColor,
          display: 'block', marginBottom: 8,
        }}>
          Deployed
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: FB, fontSize: 14, color: '#93C5FD', wordBreak: 'break-all' }}
        >
          {url}
        </a>
      </div>
    )
  }

  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`,
      borderRadius: 14, padding: '20px 22px',
    }}>
      <span style={{
        fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#64748B',
        display: 'block', marginBottom: 6,
      }}>
        Share what you built (optional)
      </span>
      <p style={{ fontFamily: FB, fontSize: 13, color: '#4B5563', margin: '0 0 14px', lineHeight: 1.5 }}>
        Add a link to what you deployed — it becomes part of your level record.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://your-deployed-app.com"
          style={{
            flex: 1, background: '#0F0F14', border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: 8, padding: '9px 14px',
            fontFamily: FB, fontSize: 13, color: '#F8FAFC',
            outline: 'none',
          }}
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
        />
        <button
          onClick={handleSave}
          disabled={saving || !url.trim()}
          style={{
            fontFamily: FD, fontSize: 13, fontWeight: 700,
            color: '#fff', background: saving ? `${bandColor}80` : bandColor,
            border: 'none', borderRadius: 8, padding: '9px 18px',
            cursor: (saving || !url.trim()) ? 'not-allowed' : 'pointer',
            flexShrink: 0,
          }}
        >
          {saving ? '…' : 'Save'}
        </button>
      </div>
      {error && (
        <p style={{ fontFamily: FB, fontSize: 12, color: '#F87171', margin: '8px 0 0' }}>✗ {error}</p>
      )}
    </div>
  )
}
