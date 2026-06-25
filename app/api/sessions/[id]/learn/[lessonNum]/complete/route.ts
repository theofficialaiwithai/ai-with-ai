import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { sessions, learnLessons } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; lessonNum: string }> }
) {
  const { id, lessonNum } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, id) })
  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const lessonNumber = parseInt(lessonNum, 10)
  const totalLessons = session.totalSteps ?? 0
  const { quizScore } = await req.json().catch(() => ({ quizScore: null }))

  await db
    .update(learnLessons)
    .set({
      status: 'completed',
      completedAt: new Date(),
      ...(quizScore != null ? { quizScore } : {}),
    })
    .where(and(eq(learnLessons.sessionId, id), eq(learnLessons.lessonNumber, lessonNumber)))

  const isLastLesson = lessonNumber >= totalLessons
  const nextLesson = isLastLesson ? null : lessonNumber + 1

  if (nextLesson) {
    await db
      .update(learnLessons)
      .set({ status: 'active' })
      .where(and(eq(learnLessons.sessionId, id), eq(learnLessons.lessonNumber, nextLesson)))

    await db
      .update(sessions)
      .set({ currentStep: nextLesson, lastActiveAt: new Date() })
      .where(eq(sessions.id, id))
  } else {
    await db
      .update(sessions)
      .set({
        status: 'completed',
        currentStep: lessonNumber,
        completedAt: new Date(),
        lastActiveAt: new Date(),
      })
      .where(eq(sessions.id, id))
  }

  return NextResponse.json({ success: true, nextLesson, isLastLesson })
}
