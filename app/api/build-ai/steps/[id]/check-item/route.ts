import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { buildProjects, projectSteps } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const stepId = parseInt(id, 10)
  if (isNaN(stepId)) return NextResponse.json({ error: 'Invalid step ID' }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (body == null || typeof body.itemIndex !== 'number' || typeof body.checked !== 'boolean') {
    return NextResponse.json({ error: 'itemIndex (number) and checked (boolean) are required' }, { status: 400 })
  }
  const { itemIndex, checked } = body as { itemIndex: number; checked: boolean }

  const [step] = await db
    .select()
    .from(projectSteps)
    .where(eq(projectSteps.id, stepId))

  if (!step) return NextResponse.json({ error: 'Step not found' }, { status: 404 })

  // Verify project ownership
  const [project] = await db
    .select({ id: buildProjects.id })
    .from(buildProjects)
    .where(and(eq(buildProjects.id, step.projectId), eq(buildProjects.userId, userId)))

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const checklist = (step.verifyChecklist as string[]) ?? []
  if (itemIndex < 0 || itemIndex >= checklist.length) {
    return NextResponse.json({ error: 'itemIndex out of range' }, { status: 400 })
  }

  // Build updated array — same length as checklist, filling missing positions with false
  const current = Array.isArray(step.checkedItems) ? (step.checkedItems as boolean[]) : []
  const updated = checklist.map((_, i) => (i === itemIndex ? checked : (current[i] ?? false)))

  await db
    .update(projectSteps)
    .set({ checkedItems: updated })
    .where(eq(projectSteps.id, stepId))

  return NextResponse.json({ checkedItems: updated })
}
