import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { levelCheckpoints, userCheckpointProgress } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentLevel } from '@/lib/leveling'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const checkpointId = parseInt(id, 10)
  if (isNaN(checkpointId)) return NextResponse.json({ error: 'Invalid checkpoint ID' }, { status: 400 })

  // Verify checkpoint exists
  const [checkpoint] = await db
    .select({ id: levelCheckpoints.id })
    .from(levelCheckpoints)
    .where(eq(levelCheckpoints.id, checkpointId))

  if (!checkpoint) return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 })

  // Check if already completed
  const [existing] = await db
    .select({ id: userCheckpointProgress.id })
    .from(userCheckpointProgress)
    .where(and(
      eq(userCheckpointProgress.userId, userId),
      eq(userCheckpointProgress.checkpointId, checkpointId),
    ))

  let completed: boolean
  if (existing) {
    await db
      .delete(userCheckpointProgress)
      .where(and(
        eq(userCheckpointProgress.userId, userId),
        eq(userCheckpointProgress.checkpointId, checkpointId),
      ))
    completed = false
  } else {
    await db
      .insert(userCheckpointProgress)
      .values({ userId, checkpointId })
    completed = true
  }

  const currentLevel = await getCurrentLevel(userId)
  return NextResponse.json({ completed, currentLevel })
}
