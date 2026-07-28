'use client'

import { useState, useTransition } from 'react'

interface Checkpoint {
  id: number
  checkpointText: string
  sortOrder: number
  isCompleted: boolean
}

interface Props {
  levelNumber: number
  levelName: string
  levelDescription: string
  lessonParagraphs: string[]
  checkpoints: Checkpoint[]
  initialCurrentLevel: number
  bandColor: string
}

const FB = "var(--font-inter,'Inter'),sans-serif"
const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const BG = '#0F0F14'
const BORDER = 'rgba(255,255,255,0.06)'

export default function LevelDetailClient({
  levelNumber,
  levelName,
  levelDescription,
  lessonParagraphs,
  checkpoints: initialCheckpoints,
  initialCurrentLevel,
  bandColor,
}: Props) {
  const [checkpoints, setCheckpoints] = useState(initialCheckpoints)
  const [currentLevel, setCurrentLevel] = useState(initialCurrentLevel)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  const allDone = checkpoints.every(cp => cp.isCompleted)

  async function toggle(id: number) {
    if (loadingId !== null) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/build-ai/checkpoints/${id}/complete`, { method: 'POST' })
      if (!res.ok) return
      const { completed, currentLevel: newLevel } = await res.json()
      startTransition(() => {
        setCheckpoints(prev =>
          prev.map(cp => cp.id === id ? { ...cp, isCompleted: completed } : cp)
        )
        setCurrentLevel(newLevel)
      })
    } finally {
      setLoadingId(null)
    }
  }

  const SURFACE = '#1A1A24'

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '56px 24px 100px' }}>
      {/* Level header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
          <div>
            <span style={{
              fontFamily: FM, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: bandColor,
              display: 'block', marginBottom: 6,
            }}>
              Level {levelNumber}
            </span>
            <h1 style={{
              fontFamily: FD, fontSize: 26, fontWeight: 700,
              color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em',
            }}>
              {levelName}
            </h1>
          </div>

          {/* Live level badge */}
          <div style={{
            flexShrink: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: `${bandColor}15`, border: `1px solid ${bandColor}40`,
            borderRadius: 14, padding: '10px 18px',
            transition: 'all 0.3s',
          }}>
            <span style={{ fontFamily: FM, fontSize: 9, color: bandColor, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 2 }}>
              your level
            </span>
            <span style={{ fontFamily: FD, fontSize: 22, fontWeight: 800, color: bandColor, lineHeight: 1 }}>
              {currentLevel}
            </span>
          </div>
        </div>

        <p style={{
          fontFamily: FB, fontSize: 14, color: '#94A3B8',
          margin: 0, lineHeight: 1.7,
          borderLeft: `3px solid ${bandColor}60`,
          paddingLeft: 14,
        }}>
          {levelDescription}
        </p>
      </div>

      {/* Lesson */}
      <div style={{
        background: SURFACE, border: `1px solid ${BORDER}`,
        borderRadius: 14, padding: '28px 28px', marginBottom: 36,
      }}>
        <span style={{
          fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: bandColor,
          display: 'block', marginBottom: 18,
        }}>
          Why this level matters
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {lessonParagraphs.map((p, i) => (
            <p key={i} style={{
              fontFamily: FB, fontSize: 15, color: '#CBD5E1',
              margin: 0, lineHeight: 1.75,
            }}>
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Checkpoints */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{
            fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#64748B',
          }}>
            Checkpoints
          </span>
          {allDone && (
            <span style={{
              fontFamily: FB, fontSize: 12, fontWeight: 600,
              color: '#10B981', background: 'rgba(16,185,129,0.12)',
              borderRadius: 8, padding: '3px 10px',
            }}>
              All done ✓
            </span>
          )}
        </div>

        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 14, overflow: 'hidden',
        }}>
          {checkpoints.map((cp, i) => (
            <button
              key={cp.id}
              onClick={() => toggle(cp.id)}
              disabled={loadingId !== null}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                width: '100%', padding: '18px 20px',
                borderBottom: i < checkpoints.length - 1 ? `1px solid ${BORDER}` : 'none',
                background: cp.isCompleted ? `${bandColor}08` : 'transparent',
                border: 'none',
                cursor: loadingId === cp.id ? 'wait' : 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
                opacity: loadingId !== null && loadingId !== cp.id ? 0.6 : 1,
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: 22, height: 22, flexShrink: 0, marginTop: 1,
                borderRadius: 6,
                border: `2px solid ${cp.isCompleted ? bandColor : 'rgba(255,255,255,0.18)'}`,
                background: cp.isCompleted ? bandColor : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {cp.isCompleted && (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2.5 6.5l3 3 5-5.5"
                      stroke={levelNumber === 10 ? '#000' : '#fff'}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {loadingId === cp.id && (
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                )}
              </div>

              {/* Text */}
              <span style={{
                fontFamily: FB, fontSize: 14, lineHeight: 1.6,
                color: cp.isCompleted ? '#94A3B8' : '#E2E8F0',
                textDecoration: cp.isCompleted ? 'line-through' : 'none',
                flex: 1,
              }}>
                {cp.checkpointText}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
