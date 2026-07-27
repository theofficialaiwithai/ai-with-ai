import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { buildProjects } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import ProjectPrdClient from '@/components/project-prd-client'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const projectId = parseInt(id, 10)
  if (isNaN(projectId)) notFound()

  const [project] = await db
    .select()
    .from(buildProjects)
    .where(and(eq(buildProjects.id, projectId), eq(buildProjects.userId, userId)))

  if (!project) notFound()

  return (
    <ProjectPrdClient
      project={{
        id: project.id,
        title: project.title,
        buildTool: project.buildTool,
        status: project.status,
        prdMarkdown: project.prdMarkdown ?? '',
        domainRiskFlagged: project.domainRiskFlagged,
        domainRiskAcknowledged: project.domainRiskAcknowledged,
        existingAppUrl: project.existingAppUrl ?? null,
        createdAt: project.createdAt?.toISOString() ?? '',
      }}
    />
  )
}
