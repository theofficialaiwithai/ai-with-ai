import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { profiles, levels, levelProjectTemplates, buildProjects } from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { getCurrentLevel } from '@/lib/leveling'
import LevelsClient, { type LevelItem } from '@/components/levels-client'

const LEVEL_SHORT: Record<number, string> = {
  0: 'First contact',
  1: 'Working basics',
  2: 'Live data',
  3: 'Repeatability',
  4: 'Context engineering',
  5: 'Chained systems',
  6: 'Headless & scripting',
  7: 'Browser control',
  8: 'Parallel agents',
  9: 'Scheduled agents',
  10: 'Autonomous loops',
}

export default async function LevelsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [allLevels, templates, completedProjects, currentLevel, profile] = await Promise.all([
    db.select().from(levels).orderBy(asc(levels.levelNumber)),
    db.select({ levelNumber: levelProjectTemplates.levelNumber, projectNumber: levelProjectTemplates.projectNumber })
      .from(levelProjectTemplates),
    db.select({ levelNumber: buildProjects.levelNumber, levelProjectNumber: buildProjects.levelProjectNumber })
      .from(buildProjects)
      .where(and(
        eq(buildProjects.userId, userId),
        eq(buildProjects.path, 'level_project'),
        eq(buildProjects.status, 'complete'),
      )),
    getCurrentLevel(userId),
    db.query.profiles.findFirst({ where: eq(profiles.id, userId) }),
  ])

  const templatesByLevel = new Map<number, number>()
  for (const t of templates) {
    templatesByLevel.set(t.levelNumber, (templatesByLevel.get(t.levelNumber) ?? 0) + 1)
  }

  const doneByLevel = new Map<number, number>()
  for (const p of completedProjects) {
    if (p.levelNumber != null) {
      doneByLevel.set(p.levelNumber, (doneByLevel.get(p.levelNumber) ?? 0) + 1)
    }
  }

  // Reverse order so highest level is at top (like the prototype)
  const ordered = [...allLevels].reverse()

  const levelItems: LevelItem[] = ordered.map(l => ({
    levelNumber: l.levelNumber,
    name: l.name,
    shortName: LEVEL_SHORT[l.levelNumber] ?? l.name,
    done: doneByLevel.get(l.levelNumber) ?? 0,
    total: templatesByLevel.get(l.levelNumber) ?? 0,
  }))

  return (
    <LevelsClient
      email={profile?.email}
      currentLevel={currentLevel}
      levelItems={levelItems}
    />
  )
}
