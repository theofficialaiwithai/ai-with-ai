import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { sessions, buildPlans } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

// Force dynamic so Next.js never caches this GET response.
export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, id) })
  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const plan = await db.query.buildPlans.findFirst({
    where: eq(buildPlans.sessionId, id),
  })

  console.log('[plan-status] raw result:', JSON.stringify(plan))

  if (!plan || !plan.contentMarkdown) {
    return NextResponse.json({
      contentMarkdown: null,
      platform: session.platform,
      buildType: session.buildType,
    })
  }

  return NextResponse.json({
    contentMarkdown: plan.contentMarkdown,
    platform: session.platform,
    buildType: session.buildType,
  })
}
