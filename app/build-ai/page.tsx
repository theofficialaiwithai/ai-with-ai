import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { profiles, buildProjects } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import BuildAiClient from '@/components/build-ai-client'
import { getCurrentLevel } from '@/lib/leveling'

export default async function BuildAiPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [user, profile, projects, currentLevel] = await Promise.all([
    currentUser(),
    db.query.profiles.findFirst({ where: eq(profiles.id, userId) }),
    db.query.buildProjects.findMany({
      where: eq(buildProjects.userId, userId),
      orderBy: [desc(buildProjects.updatedAt)],
    }),
    getCurrentLevel(userId),
  ])

  if (!profile) redirect('/sign-in')

  const displayName =
    profile.name ||
    (user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '') ||
    profile.email

  return (
    <BuildAiClient
      userName={displayName}
      email={profile.email}
      currentLevel={currentLevel}
      projects={projects.map(p => ({
        id: p.id,
        title: p.title,
        path: p.path,
        status: p.status,
        updatedAt: p.updatedAt?.toISOString() ?? p.createdAt?.toISOString() ?? new Date().toISOString(),
      }))}
    />
  )
}
