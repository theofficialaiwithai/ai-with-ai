import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { buildProjects, prdSections } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, sectionId } = await params
  const projectId = parseInt(id, 10)
  const secId = parseInt(sectionId, 10)
  if (isNaN(projectId) || isNaN(secId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const body = await req.json()
  const { contentMarkdown } = body
  if (typeof contentMarkdown !== 'string') {
    return NextResponse.json({ error: 'contentMarkdown required' }, { status: 400 })
  }

  const [project] = await db
    .select({ id: buildProjects.id })
    .from(buildProjects)
    .where(and(eq(buildProjects.id, projectId), eq(buildProjects.userId, userId)))

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const [updated] = await db
    .update(prdSections)
    .set({ contentMarkdown, updatedAt: new Date() })
    .where(and(eq(prdSections.id, secId), eq(prdSections.projectId, projectId)))
    .returning({ id: prdSections.id })

  if (!updated) return NextResponse.json({ error: 'Section not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
