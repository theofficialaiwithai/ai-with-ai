import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function checkSessionAccess(
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.id, userId) })
  if (!profile) return { allowed: false, reason: 'no_profile' }
  if (profile.subscriptionStatus === 'pro' || profile.subscriptionStatus === 'lifetime') {
    return { allowed: true }
  }
  if (!profile.freeSessionUsed) return { allowed: true }
  return { allowed: false, reason: 'upgrade_required' }
}
