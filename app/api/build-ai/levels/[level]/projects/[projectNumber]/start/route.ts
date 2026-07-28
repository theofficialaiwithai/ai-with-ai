import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { levelProjectTemplates, buildProjects, projectSteps } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

type StepRow = {
  step_number: number
  step_name: string
  prompt_text: string
  verify_checklist: string[]
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ level: string; projectNumber: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { level, projectNumber: pnStr } = await params
  const levelNumber = parseInt(level, 10)
  const projectNumber = parseInt(pnStr, 10)

  if (isNaN(levelNumber) || isNaN(projectNumber)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  // Idempotent: if already started, return existing project
  const [existing] = await db
    .select({ id: buildProjects.id })
    .from(buildProjects)
    .where(and(
      eq(buildProjects.userId, userId),
      eq(buildProjects.path, 'level_project'),
      eq(buildProjects.levelNumber, levelNumber),
      eq(buildProjects.levelProjectNumber, projectNumber),
    ))

  if (existing) {
    return NextResponse.json({ projectId: existing.id })
  }

  const [template] = await db
    .select()
    .from(levelProjectTemplates)
    .where(and(
      eq(levelProjectTemplates.levelNumber, levelNumber),
      eq(levelProjectTemplates.projectNumber, projectNumber),
    ))

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  const [newProject] = await db
    .insert(buildProjects)
    .values({
      userId,
      title: template.projectTitle,
      path: 'level_project',
      levelNumber,
      levelProjectNumber: projectNumber,
      status: 'building',
    })
    .returning({ id: buildProjects.id })

  const steps = (template.stepsJson as StepRow[])
  for (const s of steps) {
    await db.insert(projectSteps).values({
      projectId: newProject.id,
      stepNumber: s.step_number,
      stepName: s.step_name,
      promptText: s.prompt_text,
      verifyChecklist: s.verify_checklist,
    })
  }

  return NextResponse.json({ projectId: newProject.id })
}
