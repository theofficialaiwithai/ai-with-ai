import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { sessions, learnLessons, buildSteps } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FB = "var(--font-inter,'Inter'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"

export default async function CompletePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, id) })
  if (!session || session.userId !== userId) notFound()

  const isLearn = session.mode === 'learn'
  let completedCount = 0
  let totalCount = session.totalSteps ?? 0

  if (isLearn) {
    const lessons = await db.query.learnLessons.findMany({ where: eq(learnLessons.sessionId, id) })
    completedCount = lessons.filter(l => l.status === 'completed').length
    totalCount = lessons.length
  } else {
    const steps = await db.query.buildSteps.findMany({ where: eq(buildSteps.sessionId, id) })
    completedCount = steps.filter(s => s.status === 'completed').length
    totalCount = steps.length
  }

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg,#0D0D1A)', padding: '24px',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{
        background: 'var(--surface,#1A1A2E)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 24, padding: '52px 48px',
        maxWidth: 480, width: '100%', textAlign: 'center',
        boxShadow: '0 0 80px rgba(16,185,129,0.08)',
      }}>
        {/* Badge */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(16,185,129,0.12)',
          border: '2px solid rgba(16,185,129,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: 36,
        }}>
          {isLearn ? '🎓' : '🚀'}
        </div>

        <div style={{ fontFamily: FM, fontSize: 11, color: '#10B981', letterSpacing: '0.1em', marginBottom: 12 }}>
          {isLearn ? 'LEARNING COMPLETE' : 'BUILD COMPLETE'}
        </div>

        <h1 style={{
          fontFamily: FD, fontSize: 28, fontWeight: 700, color: '#F8FAFC',
          letterSpacing: '-0.02em', marginBottom: 12,
        }}>
          {isLearn ? 'You did it!' : 'Project complete!'}
        </h1>

        <p style={{
          fontFamily: FB, fontSize: 15, color: '#94A3B8',
          lineHeight: 1.7, marginBottom: 32,
        }}>
          {isLearn
            ? `You completed all ${totalCount} lessons${session.platform ? ` on ${session.platform}` : ''}. Keep practicing to deepen what you learned.`
            : `You completed all ${totalCount} build steps. Your project is ready.`}
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 36,
        }}>
          <Stat value={completedCount} label={isLearn ? 'Lessons' : 'Steps'} />
          {session.completedAt && (
            <Stat
              value={new Date(session.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              label="Completed"
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            href="/sessions/new"
            style={{
              display: 'block', background: '#7C3AED', color: '#fff',
              textDecoration: 'none', borderRadius: 10,
              padding: '13px 24px', fontFamily: FD, fontWeight: 600, fontSize: 15,
            }}
          >
            {isLearn ? 'Start a New Learning Session →' : 'Start a New Build →'}
          </Link>
          <Link
            href="/dashboard"
            style={{
              display: 'block', background: 'none', color: '#94A3B8',
              textDecoration: 'none', borderRadius: 10,
              padding: '13px 24px', fontFamily: FD, fontWeight: 500, fontSize: 15,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12, padding: '16px 24px', flex: 1,
    }}>
      <div style={{ fontFamily: FD, fontSize: 22, fontWeight: 700, color: '#F8FAFC', marginBottom: 2 }}>
        {value}
      </div>
      <div style={{ fontFamily: FB, fontSize: 12, color: '#4A5568' }}>
        {label}
      </div>
    </div>
  )
}
