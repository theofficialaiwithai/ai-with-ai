import { db } from '@/db'
import { levelProjectTemplates, buildProjects } from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'

export function levelBandColor(level: number): string {
  if (level === 10) return '#CBFF4D'
  if (level >= 7) return '#FF4F70'
  if (level >= 4) return '#7C3AED'
  return '#1361E3'
}

export async function getCurrentLevel(userId: string): Promise<number> {
  const [templates, completed] = await Promise.all([
    db.select({ levelNumber: levelProjectTemplates.levelNumber, projectNumber: levelProjectTemplates.projectNumber })
      .from(levelProjectTemplates),
    db.select({ levelNumber: buildProjects.levelNumber, levelProjectNumber: buildProjects.levelProjectNumber })
      .from(buildProjects)
      .where(and(
        eq(buildProjects.userId, userId),
        eq(buildProjects.path, 'level_project'),
        eq(buildProjects.status, 'complete'),
      )),
  ])

  const doneSet = new Set(
    completed
      .filter(p => p.levelNumber != null && p.levelProjectNumber != null)
      .map(p => `${p.levelNumber}:${p.levelProjectNumber}`)
  )

  const byLevel = new Map<number, number[]>()
  for (const t of templates) {
    if (!byLevel.has(t.levelNumber)) byLevel.set(t.levelNumber, [])
    byLevel.get(t.levelNumber)!.push(t.projectNumber)
  }

  // Walk 0→10; return the first level where not all projects are complete.
  // This is the "current level" — the one you're actively working on.
  // Completing all of level N's projects advances you to level N+1.
  for (let n = 0; n <= 10; n++) {
    const pns = byLevel.get(n) ?? []
    const allDone = pns.length === 0 || pns.every(pn => doneSet.has(`${n}:${pn}`))
    if (!allDone) return n
  }
  return 10
}

export type LevelProjectEntry = {
  projectNumber: number
  projectTitle: string
  projectDescription: string
  status: 'not_started' | 'in_progress' | 'complete'
  projectId: number | null
  deployedUrl: string | null
}

export type CurriculumNudge = {
  levelNumber: number
  projectTitle: string
  projectDescription: string
  status: 'not_started' | 'in_progress'
}

// Finds the first incomplete level project starting from the user's current level.
// Does exactly 2 DB queries regardless of how many levels exist.
export async function findNextCurriculumProject(userId: string): Promise<CurriculumNudge | null> {
  const [templates, userProjects] = await Promise.all([
    db.select()
      .from(levelProjectTemplates)
      .orderBy(asc(levelProjectTemplates.levelNumber), asc(levelProjectTemplates.projectNumber)),
    db.select({
      levelNumber: buildProjects.levelNumber,
      levelProjectNumber: buildProjects.levelProjectNumber,
      status: buildProjects.status,
    })
      .from(buildProjects)
      .where(and(
        eq(buildProjects.userId, userId),
        eq(buildProjects.path, 'level_project'),
      )),
  ])

  // "levelNumber:projectNumber" → status
  const statusMap = new Map<string, string>()
  for (const p of userProjects) {
    if (p.levelNumber != null && p.levelProjectNumber != null) {
      statusMap.set(`${p.levelNumber}:${p.levelProjectNumber}`, p.status)
    }
  }

  // Group templates by level
  const byLevel = new Map<number, typeof templates>()
  for (const t of templates) {
    if (!byLevel.has(t.levelNumber)) byLevel.set(t.levelNumber, [])
    byLevel.get(t.levelNumber)!.push(t)
  }

  // Find current level (first level where not all projects are complete)
  let currentLevel = 10
  for (let n = 0; n <= 10; n++) {
    const levelTemplates = byLevel.get(n) ?? []
    const allDone =
      levelTemplates.length === 0 ||
      levelTemplates.every(t => statusMap.get(`${n}:${t.projectNumber}`) === 'complete')
    if (!allDone) {
      currentLevel = n
      break
    }
  }

  // Walk from currentLevel upward; return the first non-complete project
  for (let n = currentLevel; n <= 10; n++) {
    const levelTemplates = byLevel.get(n) ?? []
    for (const t of levelTemplates) {
      const status = statusMap.get(`${n}:${t.projectNumber}`)
      if (status !== 'complete') {
        return {
          levelNumber: n,
          projectTitle: t.projectTitle,
          projectDescription: t.projectDescription,
          status: status != null ? 'in_progress' : 'not_started',
        }
      }
    }
  }

  return null
}

export async function getLevelProjectStatus(userId: string, levelNumber: number): Promise<LevelProjectEntry[]> {
  const [templates, projects] = await Promise.all([
    db.select()
      .from(levelProjectTemplates)
      .where(eq(levelProjectTemplates.levelNumber, levelNumber))
      .orderBy(asc(levelProjectTemplates.projectNumber)),
    db.select({
      levelProjectNumber: buildProjects.levelProjectNumber,
      id: buildProjects.id,
      status: buildProjects.status,
      deployedUrl: buildProjects.deployedUrl,
    })
      .from(buildProjects)
      .where(and(
        eq(buildProjects.userId, userId),
        eq(buildProjects.path, 'level_project'),
        eq(buildProjects.levelNumber, levelNumber),
      )),
  ])

  const projectMap = new Map<number, { id: number; status: string; deployedUrl: string | null }>()
  for (const p of projects) {
    if (p.levelProjectNumber != null) {
      projectMap.set(p.levelProjectNumber, { id: p.id, status: p.status, deployedUrl: p.deployedUrl })
    }
  }

  return templates.map(t => {
    const proj = projectMap.get(t.projectNumber)
    return {
      projectNumber: t.projectNumber,
      projectTitle: t.projectTitle,
      projectDescription: t.projectDescription,
      status: proj == null
        ? 'not_started'
        : proj.status === 'complete' ? 'complete' : 'in_progress',
      projectId: proj?.id ?? null,
      deployedUrl: proj?.deployedUrl ?? null,
    }
  })
}
