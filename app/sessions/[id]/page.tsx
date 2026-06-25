import { db } from '@/db'
import { sessions, messages } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import IntakeChat from '@/components/intake-chat'

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
  })
  if (!session || session.userId !== userId) notFound()

  const existing = await db.query.messages.findMany({
    where: eq(messages.sessionId, id),
    orderBy: [asc(messages.createdAt)],
  })

  const initialMessages = existing.map(m => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  if (session.status === 'onboarding') {
    return (
      <IntakeChat
        session={{
          id: session.id,
          mode: session.mode,
          platform: session.platform,
          buildType: session.buildType,
          status: session.status,
        }}
        initialMessages={initialMessages}
      />
    )
  }

  if (session.status === 'learning') {
    redirect(`/sessions/${session.id}/learn/${session.currentStep || 1}`)
  }

  /* placeholder for other statuses */
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D0D1A',
        color: '#F8FAFC',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "var(--font-space-grotesk,'Space Grotesk'),sans-serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Session
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#94A3B8' }}>
          {id}
        </p>
      </div>
    </main>
  )
}
