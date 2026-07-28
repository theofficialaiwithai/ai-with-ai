import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { buildProjects, projectSteps } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentLevel } from '@/lib/leveling'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const stepId = parseInt(id, 10)
  if (isNaN(stepId)) return NextResponse.json({ error: 'Invalid step ID' }, { status: 400 })

  // Fetch the step and verify the project belongs to this user
  const [step] = await db
    .select()
    .from(projectSteps)
    .where(eq(projectSteps.id, stepId))

  if (!step) return NextResponse.json({ error: 'Step not found' }, { status: 404 })

  // Verify project ownership
  const [project] = await db
    .select()
    .from(buildProjects)
    .where(and(eq(buildProjects.id, step.projectId), eq(buildProjects.userId, userId)))

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  // Mark step complete
  await db
    .update(projectSteps)
    .set({ isComplete: true, completedAt: new Date() })
    .where(eq(projectSteps.id, stepId))

  // Check if all steps for this project are now complete
  const allSteps = await db
    .select({ isComplete: projectSteps.isComplete })
    .from(projectSteps)
    .where(eq(projectSteps.projectId, step.projectId))

  const allComplete = allSteps.every(s => s.isComplete)

  let newLevel: number | undefined
  if (allComplete) {
    await db
      .update(buildProjects)
      .set({ status: 'complete', updatedAt: new Date() })
      .where(eq(buildProjects.id, step.projectId))

    if (project.path === 'level_project') {
      newLevel = await getCurrentLevel(userId)
    }
  }

  return NextResponse.json({ ok: true, allComplete, newLevel })
}
