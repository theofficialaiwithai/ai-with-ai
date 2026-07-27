import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { buildProjects, prdSections } from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import PrdReviewClient from '@/components/prd-review-client'

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
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

  // If review is done, send to the assembled PRD page
  if (project.status !== 'reviewing_sections') {
    redirect(`/build-ai/project/${id}`)
  }

  const sections = await db
    .select()
    .from(prdSections)
    .where(eq(prdSections.projectId, projectId))
    .orderBy(asc(prdSections.sectionNumber))

  const currentSection = sections.find(s => !s.isApproved)

  // All approved but status wasn't updated (edge case) — redirect to project
  if (!currentSection) {
    redirect(`/build-ai/project/${id}`)
  }

  const approvedCount = sections.filter(s => s.isApproved).length

  return (
    <PrdReviewClient
      projectId={project.id}
      projectTitle={project.title}
      section={{
        id: currentSection.id,
        sectionNumber: currentSection.sectionNumber,
        sectionName: currentSection.sectionName,
        contentMarkdown: currentSection.contentMarkdown,
      }}
      approvedCount={approvedCount}
      totalCount={sections.length}
    />
  )
}
