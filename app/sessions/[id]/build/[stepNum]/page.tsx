import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { sessions, buildSteps } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import BuildStepClient from '@/components/build-step-client'

export default async function BuildStepPage({
  params,
}: {
  params: Promise<{ id: string; stepNum: string }>
}) {
  const { id, stepNum } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, id) })
  if (!session || session.userId !== userId) notFound()

  const allSteps = await db.query.buildSteps.findMany({
    where: eq(buildSteps.sessionId, id),
    orderBy: [asc(buildSteps.stepNumber)],
  })

  const stepNumber = parseInt(stepNum, 10)
  const currentStep = allSteps.find(s => s.stepNumber === stepNumber)
  if (!currentStep) notFound()

  const totalSteps = session.totalSteps ?? allSteps.length

  return (
    <BuildStepClient
      sessionId={id}
      step={{
        stepNumber: currentStep.stepNumber,
        title: currentStep.title,
        whatItBuilds: currentStep.whatItBuilds,
        promptToPaste: currentStep.promptToPaste,
        verificationChecklist: currentStep.verificationChecklist,
        status: currentStep.status,
        completedAt: currentStep.completedAt,
      }}
      allSteps={allSteps.map(s => ({
        stepNumber: s.stepNumber,
        title: s.title,
        whatItBuilds: s.whatItBuilds,
        promptToPaste: s.promptToPaste,
        verificationChecklist: s.verificationChecklist,
        status: s.status,
        completedAt: s.completedAt,
      }))}
      totalSteps={totalSteps}
    />
  )
}
