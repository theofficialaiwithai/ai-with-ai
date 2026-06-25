import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { sessions, learnLessons } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import LearnLessonClient from '@/components/learn-lesson-client'

export default async function LearnLessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonNum: string }>
}) {
  const { id, lessonNum } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, id) })
  if (!session || session.userId !== userId) notFound()

  const allLessons = await db.query.learnLessons.findMany({
    where: eq(learnLessons.sessionId, id),
    orderBy: [asc(learnLessons.lessonNumber)],
  })

  if (allLessons.length === 0) redirect(`/sessions/${id}`)

  const lessonNumber = parseInt(lessonNum, 10)
  const currentLesson = allLessons.find(l => l.lessonNumber === lessonNumber)
  if (!currentLesson) notFound()

  return (
    <LearnLessonClient
      sessionId={id}
      lesson={{
        id: currentLesson.id,
        lessonNumber: currentLesson.lessonNumber,
        title: currentLesson.title,
        conceptualFrame: currentLesson.conceptualFrame,
        demonstrationExample: currentLesson.demonstrationExample,
        microTask: currentLesson.microTask,
        microTaskType: currentLesson.microTaskType,
        quizQuestions: currentLesson.quizQuestions as QuizQuestion[] | null,
        resources: currentLesson.resources as Resource[] | null,
        status: currentLesson.status,
        completedAt: currentLesson.completedAt,
      }}
      allLessons={allLessons.map(l => ({
        lessonNumber: l.lessonNumber,
        title: l.title,
        status: l.status,
      }))}
      totalLessons={allLessons.length}
    />
  )
}

interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface Resource {
  title: string
  url: string
  type: 'docs' | 'video' | 'example'
}
