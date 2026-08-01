import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { profiles, levels } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { levelBandColor, getLevelProjectStatus } from '@/lib/leveling'
import { LEVEL_LESSONS } from '@/lib/level-content'
import LevelDetailClient from '@/components/level-detail-client'

export default async function LevelDetailPage({
  params,
}: {
  params: Promise<{ level: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { level: levelParam } = await params
  const levelNumber = parseInt(levelParam, 10)
  if (isNaN(levelNumber) || levelNumber < 0 || levelNumber > 10) notFound()

  const [[levelRow], projects, profile] = await Promise.all([
    db.select().from(levels).where(eq(levels.levelNumber, levelNumber)),
    getLevelProjectStatus(userId, levelNumber),
    db.query.profiles.findFirst({ where: eq(profiles.id, userId) }),
  ])

  if (!levelRow) notFound()

  const bandColor = levelBandColor(levelNumber)
  const lessonParagraphs = LEVEL_LESSONS[levelNumber] ?? []

  return (
    <LevelDetailClient
      levelNumber={levelNumber}
      levelName={levelRow.name}
      levelDescription={levelRow.description}
      lessonParagraphs={lessonParagraphs}
      projects={projects}
      bandColor={bandColor}
      email={profile?.email}
    />
  )
}
