import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { buildProjects, projectSteps } from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import BuildCoachClient from '@/components/build-coach-client'
import { findNextCurriculumProject, type CurriculumNudge } from '@/lib/leveling'

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

  const BUILD_TOOL_LABEL: Record<string, string> = {
    cursor: 'Cursor',
    replit: 'Replit',
    lovable: 'Lovable',
  }
  const buildToolBanner = project.buildTool !== 'claude_code'
    ? `Heads up — prompts are currently formatted for Claude Code. ${BUILD_TOOL_LABEL[project.buildTool] ?? project.buildTool} support is coming soon.`
    : null

  // Nudge card: only on step 1 of a non-level build
  let curriculumNudge: CurriculumNudge | null = null
  if (!allComplete && currentStep.stepNumber === 1 && !isLevelProject) {
    curriculumNudge = await findNextCurriculumProject(userId!)
  }

  if (allComplete) {
    return (
      <BuildCoachClient
        allComplete={true}
        projectId={project.id}
        projectTitle={project.title}
        totalSteps={steps.length}
        isLevelProject={isLevelProject}
        levelBackLink={levelBackLink}
        buildToolBanner={buildToolBanner}
      />
    )
  }

  const completedSteps = steps
    .filter(s => s.isComplete && s.stepNumber < currentStep.stepNumber)
    .map(s => ({
      id: s.id,
      stepNumber: s.stepNumber,
      stepName: s.stepName,
      promptText: s.promptText,
      verifyChecklist: (s.verifyChecklist as string[]) ?? [],
      checkedItems: (s.checkedItems as boolean[]) ?? [],
    }))

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
      completedSteps={completedSteps}
      currentStepNumber={currentStep.stepNumber}
      totalSteps={steps.length}
      isLevelProject={isLevelProject}
      levelBackLink={levelBackLink}
      curriculumNudge={curriculumNudge}
      buildToolBanner={buildToolBanner}
    />
  )
}
