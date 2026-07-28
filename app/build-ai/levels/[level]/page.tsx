import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { levels } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { levelBandColor } from '@/lib/leveling'
import { LEVEL_LESSONS } from '@/lib/level-content'
import Link from 'next/link'

const BG = '#0F0F14'
const BORDER = 'rgba(255,255,255,0.06)'
const SURFACE = '#1A1A24'
const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FB = "var(--font-inter,'Inter'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"

export default async function LevelDetailPage({
  params,
}: {
  params: Promise<{ level: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { level: levelParam } = await params
  const levelNumber = parseInt(levelParam, 10)
  if (isNaN(levelNumber) || levelNumber < 0 || levelNumber > 10) notFound()

  const [levelRow] = await db
    .select()
    .from(levels)
    .where(eq(levels.levelNumber, levelNumber))

  if (!levelRow) notFound()

  const bandColor = levelBandColor(levelNumber)
  const lessonParagraphs = LEVEL_LESSONS[levelNumber] ?? []

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#F8FAFC' }}>
      <nav style={{
        height: 56, background: 'rgba(15,15,20,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 28px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link
          href="/build-ai/levels"
          style={{ fontFamily: FD, fontWeight: 600, fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}
        >
          ← Level Map
        </Link>
        <span style={{ color: '#374151', fontSize: 11 }}>/</span>
        <span style={{ fontFamily: FD, fontSize: 13, color: '#F8FAFC', fontWeight: 600 }}>
          Level {levelNumber}
        </span>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '56px 24px 100px' }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{
            fontFamily: FM, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: bandColor,
            display: 'block', marginBottom: 8,
          }}>
            Level {levelNumber}
          </span>
          <h1 style={{
            fontFamily: FD, fontSize: 26, fontWeight: 700,
            color: '#F8FAFC', margin: '0 0 16px', letterSpacing: '-0.02em',
          }}>
            {levelRow.name}
          </h1>
          <p style={{
            fontFamily: FB, fontSize: 14, color: '#94A3B8',
            margin: 0, lineHeight: 1.7,
            borderLeft: `3px solid ${bandColor}60`,
            paddingLeft: 14,
          }}>
            {levelRow.description}
          </p>
        </div>

        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 14, padding: '28px',
        }}>
          <span style={{
            fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: bandColor,
            display: 'block', marginBottom: 20,
          }}>
            Why this level matters
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {lessonParagraphs.map((p, i) => (
              <p key={i} style={{
                fontFamily: FB, fontSize: 15, color: '#CBD5E1',
                margin: 0, lineHeight: 1.75,
              }}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
