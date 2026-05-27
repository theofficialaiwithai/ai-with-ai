import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { sessions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import PlanClient from '@/components/plan-client'

// Keep this as a server component so auth() + the session ownership check
// run server-side. We pass the minimal data down to the client component.
export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, id) })
  if (!session || session.userId !== userId) notFound()

  return (
    <main style={{ minHeight: '100vh', background: '#0D0D1A', color: '#F8FAFC' }}>
      <PlanClient
        sessionId={id}
        platform={session.platform}
        buildType={session.buildType}
      />
    </main>
  )
}
