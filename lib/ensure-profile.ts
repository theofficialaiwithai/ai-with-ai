import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { currentUser } from '@clerk/nextjs/server'

export async function ensureProfile() {
  const user = await currentUser()
  if (!user) return null

  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  })

  if (!existing) {
    await db.insert(profiles).values({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? '',
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      subscriptionStatus: 'free',
      freeSessionUsed: false,
      totalSessionsCompleted: 0,
    })
  }

  return existing ?? await db.query.profiles.findFirst({ where: eq(profiles.id, user.id) })
}
