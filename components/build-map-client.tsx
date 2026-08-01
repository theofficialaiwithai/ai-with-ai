'use client'

import { useRouter } from 'next/navigation'
import RetroShell from '@/components/retro-os/retro-shell'
import WindowCard from '@/components/retro-os/window-card'

const BORDER = '#000000'
const INK = '#1B1533'
const INK_SOFT = '#5A536F'
const GOLD = '#FFCB33'
const BLUE = '#5C7CFA'
const LIME = '#5FD98A'
const PINK = '#FF5FA8'
const VIOLET = '#9B7FD1'
const WINDOW = '#FFFFFF'
const WINDOW_ALT = '#ECE9F5'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

interface BuildMapClientProps {
  projectId: number
  projectTitle: string
  steps: { stepNumber: number; stepName: string }[]
}

export default function BuildMapClient({ projectId, projectTitle, steps }: BuildMapClientProps) {
  const router = useRouter()

  const filename = projectTitle.trim().split(/[\s—–\-]/)[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'project'
  const taskbarTabs = [
    { filename: `${filename}.map`, color: GOLD },
    { filename: 'dashboard', color: PINK },
  ]

  return (
    <RetroShell activePath="build-ai" taskbarTabs={taskbarTabs}>
      {/* Breadcrumb */}
      <div style={{
        maxWidth: 720, margin: '0 auto', padding: '20px 32px 0',
        fontFamily: FV, fontSize: 16, color: INK,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button
          onClick={() => router.push(`/build-ai/project/${projectId}`)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FV, fontSize: 16, color: INK_SOFT, fontWeight: 700, padding: 0 }}
        >← {projectTitle}</button>
        <span style={{ color: INK_SOFT }}>/</span>
        <span style={{ fontWeight: 700, color: INK, fontFamily: FV, fontSize: 16 }}>Build Map</span>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '22px 32px 40px' }}>

        <h1 style={{ fontFamily: FD, fontWeight: 800, fontSize: 28, color: INK, marginBottom: 10, lineHeight: 1.2 }}>
          Here&apos;s your build map
        </h1>
        <p style={{ fontFamily: FB, fontSize: 14.5, color: INK_SOFT, marginBottom: 28, fontWeight: 500, lineHeight: 1.6 }}>
          You&apos;ll go through these {steps.length} steps one at a time — each with a ready-to-paste Claude Code prompt and a verify checklist.
        </p>

        {/* Steps WindowCard */}
        <WindowCard
          bar={{ gradient: `linear-gradient(90deg, ${GOLD} 0%, #FFE08A 100%)`, label: `build_map.sys — ${steps.length} steps` }}
          style={{ marginBottom: 28 }}
          borderRadius={16}
          bodyStyle={{ background: WINDOW_ALT, padding: 0 }}
        >
          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '52px 1fr',
            padding: '10px 20px',
            borderBottom: `2px solid ${BORDER}`,
            background: 'linear-gradient(180deg, #F7F6FA 0%, #DCD6EE 100%)',
          }}>
            <span style={{ fontFamily: FV, fontSize: 13, fontWeight: 700, color: INK_SOFT, letterSpacing: '0.05em' }}>#</span>
            <span style={{ fontFamily: FV, fontSize: 13, fontWeight: 700, color: INK_SOFT, letterSpacing: '0.05em' }}>STEP</span>
          </div>

          {/* Step rows */}
          {steps.map((step, i) => (
            <div
              key={step.stepNumber}
              style={{
                display: 'grid', gridTemplateColumns: '52px 1fr',
                padding: '14px 20px',
                borderBottom: i < steps.length - 1 ? `1.5px solid #D8D0EE` : 'none',
                alignItems: 'center',
                background: WINDOW,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: WINDOW_ALT, border: `2px solid ${BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FD, fontWeight: 800, fontSize: 12, color: INK,
                  boxShadow: `1.5px 1.5px 0 ${BORDER}`, flexShrink: 0,
                }}>
                  {step.stepNumber}
                </span>
              </div>
              <span style={{ fontFamily: FB, fontSize: 14, color: INK, lineHeight: 1.5 }}>
                {step.stepName}
              </span>
            </div>
          ))}
        </WindowCard>

        {/* Continue button */}
        <button
          onClick={() => router.push(`/build-ai/project/${projectId}/coach`)}
          style={{
            display: 'block', width: '100%', boxSizing: 'border-box',
            background: BLUE, color: '#fff',
            fontFamily: FD, fontWeight: 700, fontSize: 16,
            padding: '16px 0', border: `2.5px solid ${BORDER}`,
            borderRadius: 14, textAlign: 'center',
            boxShadow: `6px 6px 0 ${BORDER}`,
            cursor: 'pointer',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translate(-2px, -2px)'
            e.currentTarget.style.boxShadow = `8px 8px 0 ${BORDER}`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translate(0, 0)'
            e.currentTarget.style.boxShadow = `6px 6px 0 ${BORDER}`
          }}
        >
          Continue Building →
        </button>
      </div>
    </RetroShell>
  )
}
