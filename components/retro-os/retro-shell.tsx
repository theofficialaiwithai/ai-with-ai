'use client'

import { useState, useEffect } from 'react'
import { SignOutButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const BORDER = '#000000'
const BLUE = '#5C7CFA'
const INK = '#1B1533'
const GOLD = '#FFCB33'
const PINK = '#FF5FA8'
const LIME = '#5FD98A'
const PANEL_RAISED = '#2E2650'
const PANEL_DARK = '#241D42'
const BORDER_SOFT = '#3A3164'
const TEXT_DARK = '#ECE9F5'
const TEXT_DIM = '#A79FC9'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"

export interface TaskbarTab {
  filename: string
  color: string
}

interface RetroShellProps {
  children: React.ReactNode
  email?: string
  activePath?: 'dashboard' | 'build-ai' | 'other'
  taskbarTabs?: TaskbarTab[]
}

export default function RetroShell({
  children,
  email,
  activePath = 'build-ai',
  taskbarTabs = [],
}: RetroShellProps) {
  const router = useRouter()
  const [time, setTime] = useState('')

  useEffect(() => {
    function tick() {
      const now = new Date()
      let h = now.getHours()
      const m = now.getMinutes().toString().padStart(2, '0')
      const ampm = h >= 12 ? 'PM' : 'AM'
      h = h % 12 || 12
      setTime(`${h}:${m} ${ampm}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const MARQUEE_TEXT = 'BUILD AI WITH AI ✦ AGENTIC SYSTEMS ✦ SKILLS / ROUTINES / AGENTS / OS ✦ BUILT FOR YOUR NEXT LEVEL ✦ '
  // Doubled so the seamless loop works
  const marqueeFull = MARQUEE_TEXT + MARQUEE_TEXT

  return (
    <div className="retro-page">
      {/* Blue app nav */}
      <nav style={{
        background: BLUE,
        borderBottom: `3px solid ${BORDER}`,
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: '#FFFFFF', border: `2px solid ${BORDER}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: INK, fontWeight: 700, flexShrink: 0,
          }}>▶</div>
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: '#fff' }}>AI with AI</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Dashboard', path: 'dashboard', href: '/dashboard' },
            { label: 'Build AI with AI', path: 'build-ai', href: '/build-ai' },
          ].map(tab => {
            const active = activePath === tab.path
            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.href)}
                style={{
                  padding: '7px 16px', borderRadius: 100,
                  fontSize: 13, fontWeight: 700, fontFamily: FD,
                  color: active ? INK : '#fff',
                  background: active ? '#FFFFFF' : 'none',
                  border: active ? `2px solid ${BORDER}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'none',
                }}
              >{tab.label}</button>
            )
          })}
        </div>

        {/* Email + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {email && (
            <span style={{ fontFamily: FV, fontSize: 15, color: '#fff', opacity: 0.9 }}>{email}</span>
          )}
          <SignOutButton>
            <button style={{
              background: '#FFFFFF', border: `2px solid ${BORDER}`, borderRadius: 8,
              padding: '6px 14px', fontSize: 12, fontWeight: 700, fontFamily: FD,
              color: INK, boxShadow: `2px 2px 0 ${BORDER}`, cursor: 'pointer',
            }}>Log out</button>
          </SignOutButton>
        </div>
      </nav>

      {/* Page content */}
      {children}

      {/* Fixed footer */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50 }}>
        {/* Scrolling marquee */}
        <div style={{
          background: PANEL_RAISED,
          borderTop: `2px solid ${BORDER}`,
          borderBottom: `2px solid ${BORDER}`,
          padding: '8px 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}>
          <div style={{
            display: 'inline-block',
            animation: 'retro-marquee 18s linear infinite',
            whiteSpace: 'nowrap',
            fontFamily: FV, fontSize: 15, color: GOLD, letterSpacing: '0.06em',
          }}>
            {marqueeFull}
          </div>
        </div>

        {/* Taskbar */}
        <div style={{
          background: '#0F0A22',
          borderTop: `2px solid ${BORDER}`,
          padding: '10px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10,
        }}>
          {/* Start button */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: PINK, border: `2px solid ${BORDER}`, borderRadius: 100,
            padding: '7px 16px', fontFamily: FD, fontWeight: 700, fontSize: 12.5, color: '#fff',
            boxShadow: `2.5px 2.5px 0 ${BORDER}`,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: LIME, border: `1.5px solid ${BORDER}` }} />
            Start
          </div>

          {/* Nav chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {taskbarTabs.map((tab, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: PANEL_DARK, border: `1.5px solid ${BORDER_SOFT}`, borderRadius: 100,
                padding: '5px 12px', fontSize: 11.5, fontWeight: 600, fontFamily: FD, color: TEXT_DIM,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: tab.color }} />
                {tab.filename}
              </div>
            ))}
          </div>

          {/* Clock */}
          <div style={{ fontFamily: FV, fontSize: 16, color: TEXT_DARK }}>{time}</div>
        </div>
      </div>
    </div>
  )
}
