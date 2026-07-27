import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { buildProjects, projectSteps } from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import Link from 'next/link'

export default async function BuildMapPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (project.status !== 'building') {
    redirect(`/build-ai/project/${id}`)
  }

  const steps = await db
    .select({ stepNumber: projectSteps.stepNumber, stepName: projectSteps.stepName })
    .from(projectSteps)
    .where(eq(projectSteps.projectId, projectId))
    .orderBy(asc(projectSteps.stepNumber))

  const BG = '#0F0F14'
  const SURFACE = '#1A1A24'
  const BORDER = 'rgba(255,255,255,0.06)'
  const VIOLET = '#7C3AED'
  const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
  const FB = "var(--font-inter,'Inter'),sans-serif"
  const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
  const FS = "var(--font-sora,'Sora'),sans-serif"

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#F8FAFC' }}>

      {/* Nav */}
      <nav style={{
        height: 56, background: 'rgba(15,15,20,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 28px',
      }}>
        <Link
          href={`/build-ai/project/${id}`}
          style={{ fontFamily: FD, fontWeight: 600, fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}
        >
          ← {project.title}
        </Link>
        <span style={{ color: '#374151', fontSize: 11 }}>/</span>
        <span style={{ fontFamily: FD, fontSize: 13, color: '#F8FAFC', fontWeight: 600 }}>Build Map</span>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* Heading */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontFamily: FS, fontSize: 26, fontWeight: 700,
            color: '#F8FAFC', margin: '0 0 12px', letterSpacing: '-0.02em',
          }}>
            Here&apos;s your build map
          </h1>
          <p style={{ fontFamily: FB, fontSize: 14, color: '#94A3B8', margin: 0, lineHeight: 1.65 }}>
            You&apos;ll go through these {steps.length} steps one at a time — each with a ready-to-paste Claude Code prompt and a verify checklist.
          </p>
        </div>

        {/* Steps table */}
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 14, overflow: 'hidden', marginBottom: 36,
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '52px 1fr',
            padding: '10px 20px',
            borderBottom: `1px solid ${BORDER}`,
          }}>
            <span style={{ fontFamily: FM, fontSize: 10, fontWeight: 600, color: '#4A5568', letterSpacing: '0.08em', textTransform: 'uppercase' }}>#</span>
            <span style={{ fontFamily: FM, fontSize: 10, fontWeight: 600, color: '#4A5568', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Step</span>
          </div>

          {/* Rows */}
          {steps.map((step, i) => (
            <div
              key={step.stepNumber}
              style={{
                display: 'grid', gridTemplateColumns: '52px 1fr',
                padding: '14px 20px',
                borderBottom: i < steps.length - 1 ? `1px solid ${BORDER}` : 'none',
                alignItems: 'center',
              }}
            >
              <span style={{
                fontFamily: FM, fontSize: 12, fontWeight: 700,
                color: 'rgba(124,58,237,0.7)',
              }}>
                {step.stepNumber}
              </span>
              <span style={{ fontFamily: FB, fontSize: 14, color: '#CBD5E1', lineHeight: 1.5 }}>
                {step.stepName}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={`/build-ai/project/${id}/coach`}
          style={{
            display: 'block', width: '100%', boxSizing: 'border-box',
            background: VIOLET, color: '#fff', textDecoration: 'none',
            fontFamily: FD, fontWeight: 700, fontSize: 16,
            padding: '15px 0', borderRadius: 12, textAlign: 'center',
            boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
            letterSpacing: '-0.01em',
          }}
        >
          Continue Building →
        </Link>
      </div>
    </div>
  )
}
