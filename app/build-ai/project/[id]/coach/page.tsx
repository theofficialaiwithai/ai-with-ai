import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { buildProjects, projectSteps } from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'

export default async function CoachPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const projectId = parseInt(id, 10)
  if (isNaN(projectId)) notFound()

  const [project] = await db
    .select()
    .from(buildProjects)
    .where(and(eq(buildProjects.id, projectId), eq(buildProjects.userId, userId)))

  if (!project) notFound()

  const steps = await db
    .select()
    .from(projectSteps)
    .where(eq(projectSteps.projectId, projectId))
    .orderBy(asc(projectSteps.stepNumber))

  const BG = '#0D0D1A'
  const SURFACE = '#1A1A2E'
  const BORDER = 'rgba(255,255,255,0.06)'
  const VIOLET = '#7C3AED'

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#F8FAFC', fontFamily: 'Inter,sans-serif' }}>
      <nav style={{
        height: 56, background: 'rgba(13,13,26,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center',
        padding: '0 28px', gap: 16,
      }}>
        <a href={`/build-ai/project/${id}`} style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          ← {project.title}
        </a>
        <span style={{ color: '#374151', fontSize: 11 }}>/</span>
        <span style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 600 }}>Build Coach</span>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Build Coach</h1>
        <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 40 }}>
          {steps.length} step{steps.length !== 1 ? 's' : ''} · paste each prompt into Claude Code when you&apos;re ready
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {steps.map(step => (
            <div key={step.id} style={{
              background: SURFACE, border: `1px solid ${BORDER}`,
              borderRadius: 14, padding: '22px 24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                  background: `rgba(124,58,237,0.15)`, border: `1px solid ${VIOLET}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#C4B5FD', fontFamily: 'JetBrains Mono,monospace',
                }}>
                  {step.stepNumber}
                </span>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
                  {step.stepName}
                </h2>
              </div>

              <pre style={{
                background: BG, border: `1px solid ${BORDER}`, borderRadius: 10,
                padding: '16px 18px', fontSize: 12, color: '#CBD5E1',
                fontFamily: 'JetBrains Mono,monospace', lineHeight: 1.7,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: '0 0 16px',
              }}>
                {step.promptText}
              </pre>

              {Array.isArray(step.verifyChecklist) && (step.verifyChecklist as string[]).length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', fontFamily: 'JetBrains Mono,monospace' }}>
                    Verify
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18, color: '#94A3B8', fontSize: 13, lineHeight: 1.7 }}>
                    {(step.verifyChecklist as string[]).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {steps.length === 0 && (
          <p style={{ color: '#64748B', textAlign: 'center', marginTop: 60 }}>
            No steps found for this project.
          </p>
        )}
      </div>
    </div>
  )
}
