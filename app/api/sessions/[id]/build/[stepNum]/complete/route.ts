import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { sessions, buildSteps } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; stepNum: string }> }
) {
  const { id, stepNum } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, id) })
  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const stepNumber = parseInt(stepNum, 10)
  const totalSteps = session.totalSteps ?? 0

  /* ── Mark current step complete ── */
  await db
    .update(buildSteps)
    .set({ status: 'completed', completedAt: new Date() })
    .where(and(eq(buildSteps.sessionId, id), eq(buildSteps.stepNumber, stepNumber)))

  const isLastStep = stepNumber >= totalSteps
  const nextStep = isLastStep ? null : stepNumber + 1

  /* ── Unlock the next step + advance session cursor ── */
  if (nextStep) {
    await db
      .update(buildSteps)
      .set({ status: 'active' })
      .where(and(eq(buildSteps.sessionId, id), eq(buildSteps.stepNumber, nextStep)))

    await db
      .update(sessions)
      .set({ currentStep: nextStep, lastActiveAt: new Date() })
      .where(eq(sessions.id, id))
  } else {
    // Final step — mark session complete
    await db
      .update(sessions)
      .set({
        status: 'completed',
        currentStep: stepNumber,
        completedAt: new Date(),
        lastActiveAt: new Date(),
      })
      .where(eq(sessions.id, id))
  }

  return NextResponse.json({ success: true, nextStep, isLastStep })
}
