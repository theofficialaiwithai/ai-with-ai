import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { sessions, profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { ensureProfile } from '@/lib/ensure-profile'
import { checkSessionAccess } from '@/lib/gate'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Ensure profile exists (lazy creation)
  const profile = await ensureProfile()

  // Freemium gate check
  const access = await checkSessionAccess(userId)
  if (!access.allowed) {
    return NextResponse.json({ error: 'Upgrade required', reason: access.reason }, { status: 403 })
  }

  const { mode, platform, buildType } = await req.json()

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      mode,
      platform,
      buildType: buildType ?? null,
      status: 'onboarding',
    })
    .returning()

  // Mark free session as used so the gate blocks future sessions
  if (profile && profile.subscriptionStatus === 'free' && !profile.freeSessionUsed) {
    await db.update(profiles)
      .set({ freeSessionUsed: true })
      .where(eq(profiles.id, userId))
  }

  return NextResponse.json({ sessionId: session.id })
}
