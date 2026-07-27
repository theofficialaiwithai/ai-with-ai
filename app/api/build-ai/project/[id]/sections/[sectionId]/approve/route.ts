import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { buildProjects, prdSections } from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'

export async function POST(
  _req: Request,
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

  const [project] = await db
    .select()
    .from(buildProjects)
    .where(and(eq(buildProjects.id, projectId), eq(buildProjects.userId, userId)))

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  if (project.status !== 'reviewing_sections') {
    return NextResponse.json({ error: 'Project is not in review mode' }, { status: 409 })
  }

  const [updated] = await db
    .update(prdSections)
    .set({ isApproved: true, approvedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(prdSections.id, secId), eq(prdSections.projectId, projectId)))
    .returning({ id: prdSections.id })

  if (!updated) return NextResponse.json({ error: 'Section not found' }, { status: 404 })

  const allSections = await db
    .select()
    .from(prdSections)
    .where(eq(prdSections.projectId, projectId))
    .orderBy(asc(prdSections.sectionNumber))

  const allApproved = allSections.every(s => s.isApproved)

  if (allApproved) {
    const fullPrd = allSections
      .map(s => `## ${s.sectionName}\n\n${s.contentMarkdown}`)
      .join('\n\n')

    await db
      .update(buildProjects)
      .set({ prdMarkdown: fullPrd, status: 'prd_generated', updatedAt: new Date() })
      .where(eq(buildProjects.id, projectId))

    return NextResponse.json({ allApproved: true })
  }

  return NextResponse.json({ allApproved: false })
}
