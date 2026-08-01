'use client'

import { useRouter } from 'next/navigation'
import RetroShell from '@/components/retro-os/retro-shell'
import WindowCard from '@/components/retro-os/window-card'
import LevelProjectCards from '@/components/level-project-cards'
import type { LevelProjectEntry } from '@/lib/leveling'

const BORDER = '#000000'
const INK = '#1B1533'
const INK_SOFT = '#5A536F'
const BLUE = '#5C7CFA'
const PINK = '#FF5FA8'
const VIOLET = '#9B7FD1'
const WINDOW = '#FFFFFF'
const WINDOW_ALT = '#ECE9F5'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

interface LevelDetailClientProps {
  levelNumber: number
  levelName: string
  levelDescription: string
  lessonParagraphs: string[]
  projects: LevelProjectEntry[]
  bandColor: string
  email?: string
}

export default function LevelDetailClient({
  levelNumber,
  levelName,
  levelDescription,
  lessonParagraphs,
  projects,
  bandColor,
  email,
}: LevelDetailClientProps) {
  const router = useRouter()

  const taskbarTabs = [
    { filename: `level_${String(levelNumber).padStart(2, '0')}.sys`, color: bandColor },
    { filename: 'level_map.sys', color: VIOLET },
    { filename: 'dashboard', color: PINK },
  ]

  return (
    <RetroShell email={email} activePath="build-ai" taskbarTabs={taskbarTabs}>
      {/* Breadcrumb */}
      <div style={{
        maxWidth: 780, margin: '0 auto', padding: '20px 32px 0',
        fontFamily: FV, fontSize: 16, color: INK,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button
          onClick={() => router.push('/build-ai/levels')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FV, fontSize: 16, color: INK_SOFT, fontWeight: 700, padding: 0 }}
        >← Level Map</button>
        <span style={{ color: INK_SOFT }}>/</span>
        <span style={{ fontWeight: 700, color: INK, fontFamily: FV, fontSize: 16 }}>Level {levelNumber}</span>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '22px 32px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 30 }}>
          <span style={{
            fontFamily: FV, fontSize: 14, fontWeight: 700, letterSpacing: '0.08em',
            color: bandColor, display: 'block', marginBottom: 8,
            WebkitTextStroke: `0.4px ${BORDER}`,
          }}>
            LEVEL {levelNumber}
          </span>
          <h1 style={{ fontFamily: FD, fontSize: 28, fontWeight: 800, color: INK, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
            {levelName}
          </h1>
          <p style={{
            fontFamily: FB, fontSize: 14.5, color: INK_SOFT, margin: 0, lineHeight: 1.7,
            borderLeft: `4px solid ${bandColor}`, paddingLeft: 14,
          }}>
            {levelDescription}
          </p>
        </div>

        {/* Lesson WindowCard */}
        <WindowCard
          bar={{ gradient: `linear-gradient(90deg, ${bandColor} 0%, ${bandColor}99 100%)`, label: `level_${levelNumber}_lesson.md` }}
          style={{ marginBottom: 28 }}
          borderRadius={16}
          bodyStyle={{ background: WINDOW, padding: '24px 28px' }}
        >
          <div style={{
            fontFamily: FV, fontSize: 14, fontWeight: 700, letterSpacing: '0.08em',
            color: INK_SOFT, marginBottom: 18, textTransform: 'uppercase' as const,
          }}>
            Why this level matters
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {lessonParagraphs.map((p, i) => (
              <p key={i} style={{ fontFamily: FB, fontSize: 14.5, color: INK_SOFT, margin: 0, lineHeight: 1.75 }}>
                {p}
              </p>
            ))}
          </div>
        </WindowCard>

        {/* Project cards */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16,
          }}>
            <span style={{ fontFamily: FV, fontSize: 16, color: INK, fontWeight: 700, letterSpacing: '0.04em' }}>
              &gt; PROJECTS.SYS — {projects.length} file{projects.length !== 1 ? 's' : ''}
            </span>
          </div>
          <LevelProjectCards
            levelNumber={levelNumber}
            projects={projects}
            bandColor={bandColor}
          />
        </div>
      </div>
    </RetroShell>
  )
}
