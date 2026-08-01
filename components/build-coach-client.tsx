'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CurriculumNudge } from '@/lib/leveling'

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
  checkedItems: boolean[]
}

interface Props {
  projectId: number
  projectTitle: string
  step: Step
  completedSteps: Step[]
  currentStepNumber: number
  totalSteps: number
  allComplete: false
  isLevelProject?: boolean
  levelBackLink?: string | null
  curriculumNudge?: CurriculumNudge | null
  buildToolBanner?: string | null
}

interface CompleteProps {
  projectId: number
  projectTitle: string
  totalSteps: number
  allComplete: true
  isLevelProject?: boolean
  levelBackLink?: string | null
  buildToolBanner?: string | null
}

export default function BuildCoachClient(props: Props | CompleteProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [marking, setMarking] = useState(false)
  const [markError, setMarkError] = useState<string | null>(null)
  const [completionLevel, setCompletionLevel] = useState<number | null>(null)
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    props.allComplete ? [] : (props.step.checkedItems ?? [])
  )
  const [viewingStepNumber, setViewingStepNumber] = useState<number>(
    props.allComplete ? 0 : props.currentStepNumber
  )
  const [bannerDismissed, setBannerDismissed] = useState(false)

  if (props.allComplete) {
    return (
      <CompletionScreen
        projectId={props.projectId}
        projectTitle={props.projectTitle}
        totalSteps={props.totalSteps}
        isLevelProject={props.isLevelProject}
        levelBackLink={props.levelBackLink}
        newLevel={completionLevel}
        buildToolBanner={props.buildToolBanner}
        bannerDismissed={bannerDismissed}
        onDismissBanner={() => setBannerDismissed(true)}
      />
    )
  }

  const { projectId, projectTitle, step, completedSteps, currentStepNumber, totalSteps, curriculumNudge, buildToolBanner } = props

  const isViewingPastStep = viewingStepNumber < currentStepNumber
  const viewingStep: Step = isViewingPastStep
    ? (completedSteps.find(s => s.stepNumber === viewingStepNumber) ?? step)
    : step

  const progressPct = Math.round(((currentStepNumber - 1) / totalSteps) * 100)

  // Active-step checklist state
  const checklistLen = step.verifyChecklist.length
  const allItemsChecked = checklistLen === 0 || (
    checkedItems.length === checklistLen && checkedItems.every(v => v === true)
  )
  const canMarkDone = allItemsChecked && !marking && !isPending

  async function handleToggleItem(index: number, checked: boolean) {
    setCheckedItems(prev => {
      const next = step.verifyChecklist.map((_, i) => (i === index ? checked : (prev[i] ?? false)))
      return next
    })
    try {
      const res = await fetch(`/api/build-ai/steps/${step.id}/check-item`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIndex: index, checked }),
      })
      if (res.ok) {
        const data = await res.json()
        setCheckedItems(data.checkedItems)
      }
    } catch {
      // keep optimistic state; non-critical
    }
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
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

  // Reset copy state when switching steps
  function goToStep(n: number) {
    setCopied(false)
    setViewingStepNumber(n)
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

      {/* Build-tool compatibility banner */}
      {buildToolBanner && !bannerDismissed && (
        <div style={{
          background: 'rgba(251,191,36,0.08)', borderBottom: '1px solid rgba(251,191,36,0.2)',
          padding: '8px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span style={{ fontFamily: FB, fontSize: 12, color: '#FCD34D', lineHeight: 1.5 }}>
            {buildToolBanner}
          </span>
          <button
            onClick={() => setBannerDismissed(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#92400E', fontSize: 16, lineHeight: 1, padding: '0 2px', flexShrink: 0,
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 56,
        background: 'rgba(15,15,20,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', gap: 16,
      }}>
        {/* Left: breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
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

        {/* Right: step navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Dots for completed steps */}
          {completedSteps.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {completedSteps.map(s => {
                const isActive = viewingStepNumber === s.stepNumber
                return (
                  <button
                    key={s.stepNumber}
                    onClick={() => goToStep(s.stepNumber)}
                    title={`Step ${s.stepNumber}: ${s.stepName}`}
                    style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: isActive ? VIOLET : 'rgba(124,58,237,0.12)',
                      border: `1.5px solid ${isActive ? VIOLET : 'rgba(124,58,237,0.3)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: FM, fontSize: 10, fontWeight: 700,
                      color: isActive ? '#fff' : '#7C3AED',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      flexShrink: 0,
                    }}
                  >
                    {s.stepNumber}
                  </button>
                )
              })}
              <span style={{ color: '#374151', fontSize: 11, marginLeft: 2 }}>·</span>
            </div>
          )}

          {/* Current step indicator */}
          <span
            style={{
              fontFamily: FM, fontSize: 11,
              color: isViewingPastStep ? '#4A5568' : '#94A3B8',
              cursor: isViewingPastStep ? 'pointer' : 'default',
              textDecoration: isViewingPastStep ? 'underline' : 'none',
              textDecorationColor: '#4A5568',
            }}
            onClick={isViewingPastStep ? () => goToStep(currentStepNumber) : undefined}
            title={isViewingPastStep ? 'Back to current step' : undefined}
          >
            {isViewingPastStep
              ? `Step ${currentStepNumber} of ${totalSteps} ↩`
              : `Step ${currentStepNumber} of ${totalSteps}`}
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 100px' }}>

        {/* Past-step banner */}
        {isViewingPastStep && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(124,58,237,0.06)', border: `1px solid rgba(124,58,237,0.18)`,
            borderRadius: 10, padding: '10px 16px', marginBottom: 28,
          }}>
            <span style={{ fontFamily: FM, fontSize: 11, color: '#7C3AED', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Viewing completed step {viewingStepNumber}
            </span>
            <button
              onClick={() => goToStep(currentStepNumber)}
              style={{
                fontFamily: FD, fontSize: 12, fontWeight: 700, color: '#fff',
                background: VIOLET, border: 'none', borderRadius: 7,
                padding: '5px 12px', cursor: 'pointer',
              }}
            >
              Back to current step →
            </button>
          </div>
        )}

        {/* Step header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <span style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
              background: isViewingPastStep ? 'rgba(16,185,129,0.12)' : 'rgba(124,58,237,0.15)',
              border: `1px solid ${isViewingPastStep ? 'rgba(16,185,129,0.4)' : 'rgba(124,58,237,0.4)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FM, fontSize: 13, fontWeight: 700,
              color: isViewingPastStep ? '#10B981' : '#C4B5FD',
            }}>
              {viewingStep.stepNumber}
            </span>
            <h1 style={{ fontFamily: FS, fontSize: 22, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
              {viewingStep.stepName}
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
              onClick={() => handleCopy(viewingStep.promptText)}
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
            {viewingStep.promptText}
          </pre>
        </div>

        {/* Verify checklist */}
        {viewingStep.verifyChecklist.length > 0 && (
          isViewingPastStep ? (
            /* Read-only completed checklist */
            <div style={{
              background: SURFACE, border: `1px solid rgba(16,185,129,0.2)`,
              borderRadius: 16, padding: '20px 22px', marginBottom: 32,
            }}>
              <p style={{
                fontFamily: FM, fontSize: 10, fontWeight: 600, color: '#64748B',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                margin: '0 0 14px',
              }}>
                Verified:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {viewingStep.verifyChecklist.map((item, i) => {
                  const isChecked = viewingStep.checkedItems[i] !== false
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{
                        flexShrink: 0, width: 18, height: 18, marginTop: 2,
                        border: `1.5px solid ${isChecked ? '#10B981' : 'rgba(100,116,139,0.4)'}`,
                        borderRadius: 4,
                        background: isChecked ? 'rgba(16,185,129,0.15)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isChecked && (
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M2 5.5l2.5 2.5 4.5-5" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span style={{
                        fontFamily: FB, fontSize: 13.5, lineHeight: 1.6,
                        color: '#64748B',
                        textDecoration: isChecked ? 'line-through' : 'none',
                      }}>
                        {item}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Interactive checklist for active step */
            <div style={{
              background: SURFACE, border: `1px solid ${allItemsChecked ? 'rgba(16,185,129,0.25)' : BORDER}`,
              borderRadius: 16, padding: '20px 22px', marginBottom: 16,
              transition: 'border-color 0.2s',
            }}>
              <p style={{
                fontFamily: FM, fontSize: 10, fontWeight: 600, color: '#64748B',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                margin: '0 0 14px',
              }}>
                Before marking done, verify:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {step.verifyChecklist.map((item, i) => {
                  const isChecked = checkedItems[i] === true
                  return (
                    <label
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        cursor: 'pointer', userSelect: 'none',
                      }}
                    >
                      <span
                        role="checkbox"
                        aria-checked={isChecked}
                        onClick={() => handleToggleItem(i, !isChecked)}
                        style={{
                          flexShrink: 0, width: 18, height: 18, marginTop: 2,
                          border: `1.5px solid ${isChecked ? '#10B981' : 'rgba(124,58,237,0.4)'}`,
                          borderRadius: 4,
                          background: isChecked ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.06)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                          cursor: 'pointer',
                        }}
                      >
                        {isChecked && (
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M2 5.5l2.5 2.5 4.5-5" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span
                        onClick={() => handleToggleItem(i, !isChecked)}
                        style={{
                          fontFamily: FB, fontSize: 13.5, lineHeight: 1.6,
                          color: isChecked ? '#64748B' : '#94A3B8',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          transition: 'color 0.15s',
                        }}
                      >
                        {item}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        )}

        {/* Active-step only: hint + nudge + mark done */}
        {!isViewingPastStep && (
          <>
            {!allItemsChecked && step.verifyChecklist.length > 0 && (
              <p style={{
                fontFamily: FB, fontSize: 12, color: '#4B5563',
                margin: '0 0 16px', textAlign: 'center',
              }}>
                Check off each item to continue
              </p>
            )}

            {curriculumNudge && (
              <div style={{
                background: SURFACE,
                borderLeft: '3px solid rgba(124,58,237,0.45)',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 20,
              }}>
                <span style={{
                  fontFamily: FM, fontSize: 9, fontWeight: 700, letterSpacing: '0.09em',
                  textTransform: 'uppercase', color: '#7C3AED',
                  display: 'block', marginBottom: 6,
                }}>
                  Next in your curriculum
                </span>
                <p style={{
                  fontFamily: FD, fontSize: 14, fontWeight: 700,
                  color: '#F8FAFC', margin: '0 0 4px', letterSpacing: '-0.01em',
                }}>
                  Level {curriculumNudge.levelNumber} — {curriculumNudge.projectTitle}
                </p>
                <p style={{
                  fontFamily: FB, fontSize: 12, color: '#64748B',
                  margin: '0 0 14px', lineHeight: 1.5,
                }}>
                  {curriculumNudge.projectDescription}
                </p>
                <a
                  href={`/build-ai/levels/${curriculumNudge.levelNumber}`}
                  style={{
                    display: 'inline-block',
                    fontFamily: FD, fontSize: 12, fontWeight: 700,
                    color: '#fff',
                    background: VIOLET,
                    borderRadius: 7, padding: '6px 14px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 10px rgba(124,58,237,0.4)',
                  }}
                >
                  {curriculumNudge.status === 'in_progress' ? 'Continue →' : 'Start →'}
                </a>
              </div>
            )}

            {markError && (
              <p style={{ fontFamily: FB, fontSize: 13, color: '#F87171', marginBottom: 12 }}>✗ {markError}</p>
            )}
            <button
              onClick={canMarkDone ? handleMarkDone : undefined}
              disabled={!canMarkDone}
              style={{
                width: '100%',
                background: !canMarkDone ? 'rgba(255,255,255,0.05)' : VIOLET,
                color: !canMarkDone ? '#374151' : '#fff',
                border: `1px solid ${!canMarkDone ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
                borderRadius: 12,
                padding: '15px 0',
                fontFamily: FD, fontWeight: 700, fontSize: 16,
                cursor: !canMarkDone ? 'not-allowed' : 'pointer',
                boxShadow: !canMarkDone ? 'none' : '0 4px 24px rgba(124,58,237,0.4)',
                transition: 'all 0.2s',
                letterSpacing: '-0.01em',
              }}
            >
              {(marking || isPending) ? '✦ Saving…' : currentStepNumber === totalSteps ? 'Mark Done & Finish →' : 'Mark Done & Continue →'}
            </button>
          </>
        )}

        {/* Past-step: "back to current" footer button */}
        {isViewingPastStep && (
          <button
            onClick={() => goToStep(currentStepNumber)}
            style={{
              width: '100%',
              background: 'rgba(124,58,237,0.1)',
              color: '#C4B5FD',
              border: `1px solid rgba(124,58,237,0.25)`,
              borderRadius: 12,
              padding: '15px 0',
              fontFamily: FD, fontWeight: 700, fontSize: 16,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '-0.01em',
            }}
          >
            Back to current step →
          </button>
        )}

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
  buildToolBanner,
  bannerDismissed,
  onDismissBanner,
}: {
  projectId: number
  projectTitle: string
  totalSteps: number
  isLevelProject?: boolean
  levelBackLink?: string | null
  newLevel?: number | null
  buildToolBanner?: string | null
  bannerDismissed?: boolean
  onDismissBanner?: () => void
}) {
  const leveledUp = isLevelProject && newLevel != null

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {buildToolBanner && !bannerDismissed && (
        <div style={{
          background: 'rgba(251,191,36,0.08)', borderBottom: '1px solid rgba(251,191,36,0.2)',
          padding: '8px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span style={{ fontFamily: FB, fontSize: 12, color: '#FCD34D', lineHeight: 1.5 }}>
            {buildToolBanner}
          </span>
          <button
            onClick={onDismissBanner}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#92400E', fontSize: 16, lineHeight: 1, padding: '0 2px', flexShrink: 0,
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
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
