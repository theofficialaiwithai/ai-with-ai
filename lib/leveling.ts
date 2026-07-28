import { db } from '@/db'
import { levelCheckpoints, userCheckpointProgress } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'

export function levelBandColor(level: number): string {
  if (level === 10) return '#CBFF4D'
  if (level >= 7) return '#FF4F70'
  if (level >= 4) return '#7C3AED'
  return '#1361E3'
}

export async function getCurrentLevel(userId: string): Promise<number> {
  const [checkpoints, progress] = await Promise.all([
    db.select({ id: levelCheckpoints.id, levelNumber: levelCheckpoints.levelNumber })
      .from(levelCheckpoints),
    db.select({ checkpointId: userCheckpointProgress.checkpointId })
      .from(userCheckpointProgress)
      .where(eq(userCheckpointProgress.userId, userId)),
  ])

  const completedIds = new Set(progress.map(p => p.checkpointId))

  const byLevel = new Map<number, number[]>()
  for (const cp of checkpoints) {
    if (!byLevel.has(cp.levelNumber)) byLevel.set(cp.levelNumber, [])
    byLevel.get(cp.levelNumber)!.push(cp.id)
  }

  // Walk 0-10; return the first level whose checkpoints aren't all done
  for (let n = 0; n <= 10; n++) {
    const cps = byLevel.get(n) ?? []
    const allDone = cps.length === 0 || cps.every(id => completedIds.has(id))
    if (!allDone) return n
  }
  return 10
}

export async function getNextCheckpoints(userId: string) {
  const currentLevel = await getCurrentLevel(userId)
  if (currentLevel >= 10) return []

  const [checkpoints, progress] = await Promise.all([
    db.select()
      .from(levelCheckpoints)
      .where(eq(levelCheckpoints.levelNumber, currentLevel))
      .orderBy(asc(levelCheckpoints.sortOrder)),
    db.select({ checkpointId: userCheckpointProgress.checkpointId })
      .from(userCheckpointProgress)
      .where(eq(userCheckpointProgress.userId, userId)),
  ])

  const completedIds = new Set(progress.map(p => p.checkpointId))
  return checkpoints.filter(cp => !completedIds.has(cp.id))
}
