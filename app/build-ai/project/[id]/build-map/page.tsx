import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { buildProjects, projectSteps } from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import BuildMapClient from '@/components/build-map-client'

export default async function BuildMapPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (project.status !== 'building') {
    redirect(`/build-ai/project/${id}`)
  }

  const steps = await db
    .select({ stepNumber: projectSteps.stepNumber, stepName: projectSteps.stepName })
    .from(projectSteps)
    .where(eq(projectSteps.projectId, projectId))
    .orderBy(asc(projectSteps.stepNumber))

  return (
    <BuildMapClient
      projectId={project.id}
      projectTitle={project.title}
      steps={steps}
    />
  )
}
