import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { buildProjects } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const projectId = parseInt(id, 10)
  if (isNaN(projectId)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })

  const [updated] = await db
    .update(buildProjects)
    .set({ domainRiskAcknowledged: true, updatedAt: new Date() })
    .where(and(eq(buildProjects.id, projectId), eq(buildProjects.userId, userId)))
    .returning({ id: buildProjects.id })

  if (!updated) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
