import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { profiles, buildProjects } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import BuildAiClient from '@/components/build-ai-client'

// Stub — returns 0 until real level logic is wired in Step 7
function getCurrentLevel(): number {
  return 0
}

export default async function BuildAiPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [user, profile, projects] = await Promise.all([
    currentUser(),
    db.query.profiles.findFirst({ where: eq(profiles.id, userId) }),
    db.query.buildProjects.findMany({
      where: eq(buildProjects.userId, userId),
      orderBy: [desc(buildProjects.updatedAt)],
    }),
  ])

  if (!profile) redirect('/sign-in')

  const displayName =
    profile.name ||
    (user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '') ||
    profile.email

  return (
    <BuildAiClient
      userName={displayName}
      currentLevel={getCurrentLevel()}
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
