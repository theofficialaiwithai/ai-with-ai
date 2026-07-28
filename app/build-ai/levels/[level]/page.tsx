import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { levels, levelCheckpoints, userCheckpointProgress } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { getCurrentLevel, levelBandColor } from '@/lib/leveling'
import { LEVEL_LESSONS } from '@/lib/level-content'
import Link from 'next/link'
import LevelDetailClient from '@/components/level-detail-client'

const BG = '#0F0F14'
const BORDER = 'rgba(255,255,255,0.06)'
const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"

export default async function LevelDetailPage({
  params,
}: {
  params: Promise<{ level: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { level: levelParam } = await params
  const levelNumber = parseInt(levelParam, 10)
  if (isNaN(levelNumber) || levelNumber < 0 || levelNumber > 10) notFound()

  const [levelRow, checkpointRows, progressRows, currentLevel] = await Promise.all([
    db.select().from(levels).where(eq(levels.levelNumber, levelNumber)).then(r => r[0]),
    db.select().from(levelCheckpoints)
      .where(eq(levelCheckpoints.levelNumber, levelNumber))
      .orderBy(asc(levelCheckpoints.sortOrder)),
    db.select({ checkpointId: userCheckpointProgress.checkpointId })
      .from(userCheckpointProgress)
      .where(eq(userCheckpointProgress.userId, userId)),
    getCurrentLevel(userId),
  ])

  if (!levelRow) notFound()

  const completedIds = new Set(progressRows.map(p => p.checkpointId))
  const checkpoints = checkpointRows.map(cp => ({
    id: cp.id,
    checkpointText: cp.checkpointText,
    sortOrder: cp.sortOrder,
    isCompleted: completedIds.has(cp.id),
  }))

  const bandColor = levelBandColor(levelNumber)
  const lessonParagraphs = LEVEL_LESSONS[levelNumber] ?? []

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#F8FAFC' }}>
      {/* Nav */}
      <nav style={{
        height: 56, background: 'rgba(15,15,20,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 28px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link
          href="/build-ai/levels"
          style={{ fontFamily: FD, fontWeight: 600, fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}
        >
          ← Level Map
        </Link>
        <span style={{ color: '#374151', fontSize: 11 }}>/</span>
        <span style={{ fontFamily: FD, fontSize: 13, color: '#F8FAFC', fontWeight: 600 }}>
          Level {levelNumber}
        </span>
      </nav>

      <LevelDetailClient
        levelNumber={levelNumber}
        levelName={levelRow.name}
        levelDescription={levelRow.description}
        lessonParagraphs={lessonParagraphs}
        checkpoints={checkpoints}
        initialCurrentLevel={currentLevel}
        bandColor={bandColor}
      />
    </div>
  )
}
