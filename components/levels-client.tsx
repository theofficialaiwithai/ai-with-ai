'use client'

import { useRouter } from 'next/navigation'
import RetroShell from '@/components/retro-os/retro-shell'
import WindowCard from '@/components/retro-os/window-card'

const BORDER = '#000000'
const INK = '#1B1533'
const INK_SOFT = '#5A536F'
const GOLD = '#FFCB33'
const BLUE = '#5C7CFA'
const PINK = '#FF5FA8'
const VIOLET = '#9B7FD1'
const CORAL = '#FF6B6B'
const WINDOW = '#FFFFFF'
const WINDOW_ALT = '#ECE9F5'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

export interface LevelItem {
  levelNumber: number
  name: string
  shortName: string
  done: number
  total: number
}

interface LevelsClientProps {
  email?: string
  currentLevel: number
  levelItems: LevelItem[]
}

function tierColor(n: number): string {
  if (n >= 9) return GOLD
  if (n >= 7) return CORAL
  if (n >= 5) return VIOLET
  return BLUE
}

function tierTextClass(n: number): React.CSSProperties {
  const color = tierColor(n)
  return { color, WebkitTextStroke: `0.4px ${BORDER}` }
}

function connectorGradient(n: number): string {
  if (n === 9) return `linear-gradient(180deg, ${GOLD}, ${CORAL})`
  if (n === 7) return `linear-gradient(180deg, ${CORAL}, ${VIOLET})`
  if (n === 4) return `linear-gradient(180deg, ${VIOLET}, ${BLUE})`
  return tierColor(n)
}

export default function LevelsClient({ email, currentLevel, levelItems }: LevelsClientProps) {
  const router = useRouter()

  const taskbarTabs = [
    { filename: `level_${String(currentLevel).padStart(2, '0')}.sys`, color: tierColor(currentLevel) },
    { filename: 'level_map.sys', color: VIOLET },
    { filename: 'dashboard', color: PINK },
  ]

  return (
    <RetroShell email={email} activePath="build-ai" taskbarTabs={taskbarTabs}>
      {/* Breadcrumb */}
      <div style={{
        maxWidth: 1000, margin: '0 auto', padding: '20px 32px 0',
        fontFamily: FV, fontSize: 16, color: INK,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button
          onClick={() => router.push('/build-ai')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FV, fontSize: 16, color: INK_SOFT, fontWeight: 700, padding: 0 }}
        >← Dashboard</button>
        <span style={{ color: INK_SOFT }}>/</span>
        <span style={{ fontWeight: 700, color: INK, fontFamily: FV, fontSize: 16 }}>Level Map</span>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '22px 32px 0' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 14 }}>
          <h1 style={{ fontFamily: FD, fontWeight: 800, fontSize: 32, color: INK, margin: 0 }}>Level Map</h1>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: WINDOW, border: `2px solid ${BORDER}`, borderRadius: 100,
            padding: '6px 14px', fontFamily: FV, fontSize: 15, color: INK_SOFT,
            boxShadow: `2px 2px 0 ${BORDER}`, marginTop: 4,
          }}>
            LEVEL{' '}
            <span style={{
              background: BLUE, color: '#fff', fontFamily: FD,
              fontWeight: 700, fontSize: 12, padding: '1px 9px', borderRadius: 100,
            }}>{currentLevel}</span>
          </span>
        </div>
        <p style={{ fontFamily: FB, fontSize: 14.5, color: INK, maxWidth: 620, marginBottom: 28, fontWeight: 500, lineHeight: 1.6 }}>
          Complete all mini-projects at each level to advance. You&apos;re currently at <strong>Level {currentLevel}</strong>.
        </p>

        {/* Map WindowCard */}
        <WindowCard
          bar={{ gradient: 'linear-gradient(180deg, #F7F6FA 0%, #DCD6EE 100%)', label: `LEVEL_MAP.SYS — ${levelItems.length} LEVELS` }}
          style={{ marginBottom: 30 }}
          borderRadius={16}
          bodyStyle={{ background: WINDOW_ALT, padding: '26px 26px 10px' }}
        >
          {/* Timeline */}
          {levelItems.map((item, idx) => {
            const isCurrentLevel = item.levelNumber === currentLevel
            const color = tierColor(item.levelNumber)
            const isLast = idx === levelItems.length - 1

            return (
              <div key={item.levelNumber} style={{ display: 'flex', gap: 20 }}>
                {/* Node column */}
                <div style={{ width: 44, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      background: isCurrentLevel ? BLUE : WINDOW,
                      border: `2.5px solid ${BORDER}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: FD, fontWeight: 700, fontSize: 15,
                      color: isCurrentLevel ? '#fff' : INK_SOFT,
                      boxShadow: isCurrentLevel
                        ? `0 0 0 4px rgba(92,124,250,0.28), 2px 2px 0 ${BORDER}`
                        : `2px 2px 0 ${BORDER}`,
                    }}
                  >
                    {item.levelNumber}
                  </div>
                  {!isLast && (
                    <div style={{
                      width: 4, flex: 1, minHeight: 26, margin: '2px 0', borderRadius: 4,
                      background: connectorGradient(item.levelNumber),
                    }} />
                  )}
                </div>

                {/* Level card */}
                <div
                  onClick={() => router.push(`/build-ai/levels/${item.levelNumber}`)}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
                    background: isCurrentLevel ? '#EEF1FF' : WINDOW,
                    border: `2px solid ${isCurrentLevel ? BLUE : BORDER}`,
                    borderRadius: 12,
                    padding: '14px 18px', marginBottom: 18, cursor: 'pointer',
                    boxShadow: isCurrentLevel ? `3px 3px 0 ${BLUE}` : `3px 3px 0 ${BORDER}`,
                    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translate(-2px, -2px)'
                    el.style.boxShadow = isCurrentLevel ? `5px 5px 0 ${BLUE}` : `5px 5px 0 ${BORDER}`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translate(0, 0)'
                    el.style.boxShadow = isCurrentLevel ? `3px 3px 0 ${BLUE}` : `3px 3px 0 ${BORDER}`
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: FV, fontSize: 13.5, fontWeight: 700, letterSpacing: '0.05em', ...tierTextClass(item.levelNumber) }}>
                        LEVEL {item.levelNumber}
                      </span>
                      {isCurrentLevel && (
                        <span style={{
                          fontFamily: FV, fontSize: 11.5, fontWeight: 700, color: BLUE,
                          border: `1.5px solid ${BLUE}`, borderRadius: 100,
                          padding: '1px 9px', background: WINDOW,
                        }}>CURRENT</span>
                      )}
                    </div>
                    <div style={{ fontFamily: FD, fontSize: 17, fontWeight: 700, color: INK, marginBottom: 4 }}>
                      {item.shortName}
                    </div>
                    <div style={{
                      fontFamily: FV, fontSize: 14, color: isCurrentLevel ? BLUE : INK_SOFT,
                    }}>
                      {item.done}/{item.total} projects complete
                    </div>
                  </div>
                  <span style={{ fontSize: 20, color: INK_SOFT, flexShrink: 0 }}>›</span>
                </div>
              </div>
            )
          })}
        </WindowCard>
      </div>
    </RetroShell>
  )
}
