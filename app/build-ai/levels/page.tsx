import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { levels, levelCheckpoints, userCheckpointProgress } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { getCurrentLevel, levelBandColor } from '@/lib/leveling'
import Link from 'next/link'

const LEVEL_SHORT: Record<number, string> = {
  0: 'First contact',
  1: 'Working basics',
  2: 'Live data',
  3: 'Repeatability',
  4: 'Context engineering',
  5: 'Chained systems',
  6: 'Headless & scripting',
  7: 'Browser control',
  8: 'Parallel agents',
  9: 'Scheduled agents',
  10: 'Autonomous loops',
}

export default async function LevelsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [allLevels, checkpoints, progress, currentLevel] = await Promise.all([
    db.select().from(levels).orderBy(asc(levels.levelNumber)),
    db.select({ id: levelCheckpoints.id, levelNumber: levelCheckpoints.levelNumber })
      .from(levelCheckpoints),
    db.select({ checkpointId: userCheckpointProgress.checkpointId })
      .from(userCheckpointProgress)
      .where(eq(userCheckpointProgress.userId, userId)),
    getCurrentLevel(userId),
  ])

  const completedIds = new Set(progress.map(p => p.checkpointId))
  const byLevel = new Map<number, number[]>()
  for (const cp of checkpoints) {
    if (!byLevel.has(cp.levelNumber)) byLevel.set(cp.levelNumber, [])
    byLevel.get(cp.levelNumber)!.push(cp.id)
  }

  const BG = '#0F0F14'
  const SURFACE = '#1A1A24'
  const BORDER = 'rgba(255,255,255,0.06)'
  const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
  const FB = "var(--font-inter,'Inter'),sans-serif"
  const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
  const FS = "var(--font-sora,'Sora'),sans-serif"

  // Ordered top-to-bottom: level 10 first
  const ordered = [...allLevels].reverse()

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#F8FAFC' }}>
      {/* Nav */}
      <nav style={{
        height: 56, background: 'rgba(15,15,20,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 28px',
      }}>
        <Link
          href="/build-ai"
          style={{ fontFamily: FD, fontWeight: 600, fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}
        >
          ← Dashboard
        </Link>
        <span style={{ color: '#374151', fontSize: 11 }}>/</span>
        <span style={{ fontFamily: FD, fontSize: 13, color: '#F8FAFC', fontWeight: 600 }}>Level Map</span>
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '56px 24px 100px' }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{
            fontFamily: FS, fontSize: 28, fontWeight: 700,
            color: '#F8FAFC', margin: '0 0 10px', letterSpacing: '-0.02em',
          }}>
            Level Map
          </h1>
          <p style={{ fontFamily: FB, fontSize: 14, color: '#64748B', margin: 0, lineHeight: 1.6 }}>
            Complete the checkpoints at each level to advance. You&apos;re currently at{' '}
            <span style={{ color: '#F8FAFC', fontWeight: 600 }}>Level {currentLevel}</span>.
          </p>
        </div>

        {/* Ladder */}
        <div style={{ position: 'relative' }}>
          {/* Vertical connector line */}
          <div style={{
            position: 'absolute',
            left: 23,
            top: 24,
            bottom: 24,
            width: 2,
            background: 'linear-gradient(to bottom, rgba(203,255,77,0.3), rgba(255,79,112,0.3), rgba(124,58,237,0.3), rgba(19,97,227,0.3))',
            zIndex: 0,
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ordered.map((level) => {
              const n = level.levelNumber
              const color = levelBandColor(n)
              const cps = byLevel.get(n) ?? []
              const doneCount = cps.filter(id => completedIds.has(id)).length
              const isCurrentLevel = n === currentLevel
              const isComplete = n < currentLevel
              const shortName = LEVEL_SHORT[n] ?? level.name

              return (
                <Link
                  key={n}
                  href={`/build-ai/levels/${n}`}
                  style={{ textDecoration: 'none', display: 'block', position: 'relative', zIndex: 1 }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 20px 14px 0',
                    background: isCurrentLevel ? `${color}12` : 'transparent',
                    borderRadius: isCurrentLevel ? 12 : 0,
                    border: isCurrentLevel ? `1px solid ${color}35` : '1px solid transparent',
                    marginBottom: 4,
                    transition: 'background 0.15s',
                  }}>
                    {/* Circle node */}
                    <div style={{
                      width: 48, height: 48, flexShrink: 0,
                      borderRadius: '50%',
                      background: isComplete ? color : isCurrentLevel ? `${color}25` : '#1A1A24',
                      border: `2px solid ${isComplete ? color : isCurrentLevel ? color : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isCurrentLevel ? `0 0 20px ${color}50` : 'none',
                    }}>
                      {isComplete ? (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M4 9l4 4 6-7" stroke={n === 10 ? '#000' : '#fff'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span style={{
                          fontFamily: FM, fontSize: 13, fontWeight: 700,
                          color: isCurrentLevel ? color : '#4B5563',
                        }}>
                          {n}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{
                          fontFamily: FM, fontSize: 10, fontWeight: 700,
                          color: color, letterSpacing: '0.07em', textTransform: 'uppercase',
                        }}>
                          Level {n}
                        </span>
                        {isCurrentLevel && (
                          <span style={{
                            fontFamily: FB, fontSize: 10, fontWeight: 600,
                            color: color, background: `${color}20`,
                            borderRadius: 6, padding: '1px 7px',
                          }}>
                            current
                          </span>
                        )}
                        {isComplete && (
                          <span style={{
                            fontFamily: FB, fontSize: 10, fontWeight: 600,
                            color: '#10B981', background: 'rgba(16,185,129,0.12)',
                            borderRadius: 6, padding: '1px 7px',
                          }}>
                            complete
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontFamily: FD, fontSize: 14, fontWeight: 600,
                        color: isCurrentLevel ? '#F8FAFC' : isComplete ? '#94A3B8' : '#64748B',
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {shortName}
                      </div>
                    </div>

                    {/* Progress pips */}
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {cps.map((id) => (
                        <div key={id} style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: completedIds.has(id) ? color : 'rgba(255,255,255,0.12)',
                        }} />
                      ))}
                    </div>

                    {/* Chevron */}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
                      <path d="M6 4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
