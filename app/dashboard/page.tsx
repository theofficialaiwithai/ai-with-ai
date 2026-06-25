import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { profiles, sessions } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import DashboardClient from '@/components/dashboard-client'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [user, profile] = await Promise.all([
    currentUser(),
    db.query.profiles.findFirst({ where: eq(profiles.id, userId) }),
  ])

  if (!profile) redirect('/sign-in')

  const allSessions = await db.query.sessions.findMany({
    where: eq(sessions.userId, userId),
    orderBy: [desc(sessions.lastActiveAt)],
  })

  const displayName =
    profile.name ||
    (user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '') ||
    profile.email

  return (
    <DashboardClient
      profile={{
        name: displayName,
        email: profile.email,
        freeSessionUsed: profile.freeSessionUsed,
        subscriptionStatus: profile.subscriptionStatus,
      }}
      sessions={allSessions.map(s => ({
        id: s.id,
        mode: s.mode,
        platform: s.platform,
        buildType: s.buildType,
        title: s.title,
        status: s.status,
        currentStep: s.currentStep,
        totalSteps: s.totalSteps,
        lastActiveAt: s.lastActiveAt.toISOString(),
        completedAt: s.completedAt?.toISOString() ?? null,
      }))}
    />
  )
}
