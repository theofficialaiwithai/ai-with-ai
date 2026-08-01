import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { buildProjects, projectSteps } from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import BuildCoachClient from '@/components/build-coach-client'

export default async function CoachPage({ params }: { params: Promise<{ id: string }> }) {
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

  const steps = await db
    .select()
    .from(projectSteps)
    .where(eq(projectSteps.projectId, projectId))
    .orderBy(asc(projectSteps.stepNumber))

  if (steps.length === 0) notFound()

  const currentStep = steps.find(s => !s.isComplete) ?? null
  const allComplete = currentStep === null

  const isLevelProject = project.path === 'level_project'
  const levelBackLink = isLevelProject && project.levelNumber != null
    ? `/build-ai/levels/${project.levelNumber}`
    : null

  if (allComplete) {
    return (
      <BuildCoachClient
        allComplete={true}
        projectId={project.id}
        projectTitle={project.title}
        totalSteps={steps.length}
        isLevelProject={isLevelProject}
        levelBackLink={levelBackLink}
      />
    )
  }

  return (
    <BuildCoachClient
      allComplete={false}
      projectId={project.id}
      projectTitle={project.title}
      step={{
        id: currentStep.id,
        stepNumber: currentStep.stepNumber,
        stepName: currentStep.stepName,
        promptText: currentStep.promptText,
        verifyChecklist: (currentStep.verifyChecklist as string[]) ?? [],
        checkedItems: (currentStep.checkedItems as boolean[]) ?? [],
      }}
      currentStepNumber={currentStep.stepNumber}
      totalSteps={steps.length}
      isLevelProject={isLevelProject}
      levelBackLink={levelBackLink}
    />
  )
}
