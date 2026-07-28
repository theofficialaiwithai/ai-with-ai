'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FB = "var(--font-inter,'Inter'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const FS = "var(--font-sora,'Sora'),sans-serif"

const BG = '#0F0F14'
const SURFACE = '#1A1A24'
const CODE_BG = '#13131a'
const BORDER = 'rgba(255,255,255,0.06)'
const VIOLET = '#7C3AED'

interface Step {
  id: number
  stepNumber: number
  stepName: string
  promptText: string
  verifyChecklist: string[]
}

interface Props {
  projectId: number
  projectTitle: string
  step: Step
  currentStepNumber: number
  totalSteps: number
  allComplete: false
  isLevelProject?: boolean
  levelBackLink?: string | null
}

interface CompleteProps {
  projectId: number
  projectTitle: string
  totalSteps: number
  allComplete: true
  isLevelProject?: boolean
  levelBackLink?: string | null
}

export default function BuildCoachClient(props: Props | CompleteProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [marking, setMarking] = useState(false)
  const [markError, setMarkError] = useState<string | null>(null)
  const [completionLevel, setCompletionLevel] = useState<number | null>(null)

  if (props.allComplete) {
    return (
      <CompletionScreen
        projectId={props.projectId}
        projectTitle={props.projectTitle}
        totalSteps={props.totalSteps}
        isLevelProject={props.isLevelProject}
        levelBackLink={props.levelBackLink}
        newLevel={completionLevel}
      />
    )
  }

  const { projectId, projectTitle, step, currentStepNumber, totalSteps } = props
  const progressPct = Math.round(((currentStepNumber - 1) / totalSteps) * 100)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(step.promptText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = step.promptText
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleMarkDone() {
    setMarking(true)
    setMarkError(null)
    try {
      const res = await fetch(`/api/build-ai/steps/${step.id}/complete`, { method: 'POST' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? `Failed (${res.status})`)
      }
      const data = await res.json()
      if (data.allComplete && data.newLevel != null) {
        setCompletionLevel(data.newLevel)
      }
      startTransition(() => { router.refresh() })
    } catch (err) {
      setMarkError(err instanceof Error ? err.message : 'Something went wrong')
      setMarking(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#F8FAFC' }}>

      {/* Progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 100, background: 'rgba(255,255,255,0.04)' }}>
        <div style={{
          height: '100%', width: `${progressPct}%`,
          background: `linear-gradient(90deg, ${VIOLET}, #9D5AF0)`,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 56,
        background: 'rgba(15,15,20,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a
            href={`/build-ai/project/${projectId}`}
            style={{ fontFamily: FD, fontWeight: 600, fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F8FAFC' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8' }}
          >
            ← {projectTitle}
          </a>
          <span style={{ color: '#374151', fontSize: 11 }}>/</span>
          <span style={{ fontFamily: FD, fontSize: 13, color: '#F8FAFC', fontWeight: 600 }}>Build Coach</span>
        </div>
        <span style={{ fontFamily: FM, fontSize: 11, color: '#4A5568' }}>
          Step {currentStepNumber} of {totalSteps}
        </span>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 100px' }}>

        {/* Step header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <span style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(124,58,237,0.15)', border: `1px solid rgba(124,58,237,0.4)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FM, fontSize: 13, fontWeight: 700, color: '#C4B5FD',
            }}>
              {currentStepNumber}
            </span>
            <h1 style={{ fontFamily: FS, fontSize: 22, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
              {step.stepName}
            </h1>
          </div>
        </div>

        {/* Prompt block */}
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 16, marginBottom: 20, overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 18px', borderBottom: `1px solid ${BORDER}`,
          }}>
            <span style={{ fontFamily: FM, fontSize: 10, fontWeight: 600, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Claude Code Prompt
            </span>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : BORDER}`,
                borderRadius: 6, padding: '4px 12px',
                fontFamily: FM, fontSize: 11, fontWeight: 600,
                color: copied ? '#10B981' : '#94A3B8',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {copied ? '✓ Copied!' : 'Copy Prompt'}
            </button>
          </div>
          <pre style={{
            background: CODE_BG, margin: 0,
            padding: '20px 20px', fontSize: 12.5, color: '#CBD5E1',
            fontFamily: FM, lineHeight: 1.8,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            maxHeight: 420, overflowY: 'auto',
          }}>
            {step.promptText}
          </pre>
        </div>

        {/* Verify checklist */}
        {step.verifyChecklist.length > 0 && (
          <div style={{
            background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: '20px 22px', marginBottom: 32,
          }}>
            <p style={{
              fontFamily: FM, fontSize: 10, fontWeight: 600, color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              margin: '0 0 14px',
            }}>
              Before marking done, verify:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {step.verifyChecklist.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{
                    flexShrink: 0, width: 18, height: 18, marginTop: 1,
                    border: `1.5px solid rgba(124,58,237,0.4)`, borderRadius: 4,
                    background: 'rgba(124,58,237,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: 1, background: 'rgba(124,58,237,0.3)' }} />
                  </span>
                  <span style={{ fontFamily: FB, fontSize: 13.5, color: '#94A3B8', lineHeight: 1.6 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {markError && (
          <p style={{ fontFamily: FB, fontSize: 13, color: '#F87171', marginBottom: 12 }}>✗ {markError}</p>
        )}
        <button
          onClick={handleMarkDone}
          disabled={marking || isPending}
          style={{
            width: '100%',
            background: (marking || isPending) ? 'rgba(124,58,237,0.45)' : VIOLET,
            color: '#fff', border: 'none', borderRadius: 12,
            padding: '15px 0',
            fontFamily: FD, fontWeight: 700, fontSize: 16,
            cursor: (marking || isPending) ? 'not-allowed' : 'pointer',
            boxShadow: (marking || isPending) ? 'none' : '0 4px 24px rgba(124,58,237,0.4)',
            transition: 'background 0.15s',
            letterSpacing: '-0.01em',
          }}
        >
          {(marking || isPending) ? '✦ Saving…' : currentStepNumber === totalSteps ? 'Mark Done & Finish →' : 'Mark Done & Continue →'}
        </button>
      </div>
    </div>
  )
}

function CompletionScreen({
  projectId,
  projectTitle,
  totalSteps,
  isLevelProject,
  levelBackLink,
  newLevel,
}: {
  projectId: number
  projectTitle: string
  totalSteps: number
  isLevelProject?: boolean
  levelBackLink?: string | null
  newLevel?: number | null
}) {
  const leveledUp = isLevelProject && newLevel != null

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        height: 56, background: 'rgba(15,15,20,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 28px',
      }}>
        <a
          href={`/build-ai/project/${projectId}`}
          style={{ fontFamily: FD, fontWeight: 600, fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F8FAFC' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8' }}
        >
          ← {projectTitle}
        </a>
        <span style={{ color: '#374151', fontSize: 11 }}>/</span>
        <span style={{ fontFamily: FD, fontSize: 13, color: '#F8FAFC', fontWeight: 600 }}>Build Coach</span>
      </nav>

      <div style={{ height: 3, background: 'rgba(255,255,255,0.04)' }}>
        <div style={{ height: '100%', width: '100%', background: `linear-gradient(90deg, ${VIOLET}, #10B981)` }} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>

          {/* Level-up banner — shown immediately when a level project's completion advances the level */}
          {leveledUp && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)',
              borderRadius: 20, padding: '6px 16px', marginBottom: 24,
            }}>
              <span style={{ fontFamily: FM, fontSize: 11, color: '#9D5AF0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Level up
              </span>
              <span style={{ fontFamily: FS, fontSize: 18, fontWeight: 800, color: '#C4B5FD' }}>
                → {newLevel}
              </span>
            </div>
          )}

          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 28px',
            background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32,
          }}>
            ✓
          </div>
          <h1 style={{ fontFamily: FS, fontSize: 28, fontWeight: 700, color: '#F8FAFC', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Build complete
          </h1>
          <p style={{ fontFamily: FB, fontSize: 15, color: '#94A3B8', lineHeight: 1.7, margin: '0 0 36px' }}>
            You shipped all {totalSteps} steps of {projectTitle}.{leveledUp ? ` That's Level ${newLevel} unlocked.` : ' Time to deploy, iterate, and make it real.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {levelBackLink && (
              <a
                href={levelBackLink}
                style={{
                  background: VIOLET, color: '#fff', border: 'none',
                  borderRadius: 10, padding: '11px 24px',
                  fontFamily: FD, fontWeight: 600, fontSize: 14,
                  textDecoration: 'none', display: 'inline-block',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                }}
              >
                Back to Level →
              </a>
            )}
            <a
              href={`/build-ai/project/${projectId}`}
              style={{
                background: levelBackLink ? 'rgba(255,255,255,0.05)' : VIOLET,
                color: levelBackLink ? '#94A3B8' : '#fff',
                border: `1px solid ${levelBackLink ? BORDER : 'transparent'}`,
                borderRadius: 10, padding: '11px 24px',
                fontFamily: FD, fontWeight: 600, fontSize: 14,
                textDecoration: 'none', display: 'inline-block',
                boxShadow: levelBackLink ? 'none' : '0 4px 20px rgba(124,58,237,0.35)',
              }}
            >
              View Project
            </a>
            <a
              href="/build-ai"
              style={{
                background: 'rgba(255,255,255,0.05)', color: '#94A3B8',
                border: `1px solid ${BORDER}`, borderRadius: 10,
                padding: '11px 24px', fontFamily: FD, fontWeight: 600,
                fontSize: 14, textDecoration: 'none', display: 'inline-block',
              }}
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
