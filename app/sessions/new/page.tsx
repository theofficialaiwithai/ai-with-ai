'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import RetroShell from '@/components/retro-os/retro-shell'
import WindowCard, { RetroButton } from '@/components/retro-os/window-card'

const BORDER = '#000000'
const INK = '#1B1533'
const INK_SOFT = '#5A536F'
const GOLD = '#FFCB33'
const PINK = '#FF5FA8'
const VIOLET = '#9B7FD1'
const VIOLET_SOFT = '#C4AEED'
const WINDOW = '#FFFFFF'
const WINDOW_ALT = '#ECE9F5'
const ERROR = '#E1483F'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

/* ── types ── */
type Screen = 1 | 2 | 3
type Mode = 'build' | 'learn'
type BuildType = 'product' | 'workflow'

interface Platform {
  id: string
  name: string
  desc: string
}

/* ── data ── */
const PRODUCT_PLATFORMS: Platform[] = [
  { id: 'claude-code', name: 'Claude Code', desc: "Anthropic's agentic AI coding tool — build in your terminal" },
  { id: 'codex', name: 'Codex', desc: "OpenAI's cloud-based coding agent — no local setup needed" },
]

const WORKFLOW_PLATFORMS: Platform[] = [
  { id: 'zapier', name: 'Zapier', desc: 'Connect apps and automate workflows without code' },
  { id: 'make', name: 'Make', desc: 'Visual automation platform for complex, multi-step flows' },
]

const ALL_PLATFORMS: Platform[] = [...PRODUCT_PLATFORMS, ...WORKFLOW_PLATFORMS]

/* ── icons ── */
function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="#000" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="#000" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  )
}

function LaptopIcon() {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="#000" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="#000" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

/* ─────────────────────────────────── */
/*  Screen 1 — Mode selection          */
/* ─────────────────────────────────── */
function Screen1({ onSelect }: { onSelect: (mode: Mode) => void }) {
  const cards = [
    { id: 'build' as Mode, icon: <WrenchIcon />, gradient: `linear-gradient(90deg, ${GOLD} 0%, #FFE08A 100%)`, filename: 'build.exe', title: 'Build AI with AI', desc: "Jump in. Describe what you want to build and I'll walk you through it step by step." },
    { id: 'learn' as Mode, icon: <BookIcon />, gradient: `linear-gradient(90deg, ${VIOLET} 0%, ${VIOLET_SOFT} 100%)`, filename: 'learn.exe', title: 'Learn AI with AI', desc: 'Learn a new AI tool through deliberate practice — one lesson, one task at a time.' },
  ]

  return (
    <div style={{ textAlign: 'center', width: '100%', maxWidth: 800, padding: '0 24px' }}>
      <h1 style={{ fontFamily: FD, fontSize: 32, fontWeight: 800, color: INK, marginBottom: 8 }}>
        What do you want to do?
      </h1>
      <p style={{ fontFamily: FB, fontSize: 16, color: INK_SOFT, marginBottom: 36 }}>
        Choose your path — you can switch any time.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 800, width: '100%' }}>
        {cards.map(card => (
          <WindowCard
            key={card.id}
            bar={{ gradient: card.gradient, label: card.filename }}
            hoverable
            onClick={() => onSelect(card.id)}
            borderRadius={16}
            bodyStyle={{ padding: '24px 22px', textAlign: 'left', background: WINDOW }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 10, marginBottom: 16,
              background: WINDOW_ALT, border: `2px solid ${BORDER}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {card.icon}
            </div>
            <div style={{ fontFamily: FD, fontSize: 18, fontWeight: 700, color: INK, marginBottom: 8 }}>
              {card.title}
            </div>
            <div style={{ fontFamily: FB, fontSize: 13.5, color: INK_SOFT, lineHeight: 1.6 }}>
              {card.desc}
            </div>
          </WindowCard>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────── */
/*  Reusable platform card             */
/* ─────────────────────────────────── */
function PlatformCard({
  platform, selected, onSelect,
}: { platform: Platform; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        background: selected ? WINDOW_ALT : WINDOW,
        border: `${selected ? 2.5 : 1.5}px solid ${BORDER}`,
        borderRadius: 14,
        padding: 22,
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: selected ? `4px 4px 0 ${VIOLET}` : 'none',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ fontFamily: FD, fontSize: 16, fontWeight: 700, color: INK }}>
          {platform.name}
        </div>
        {selected && (
          <span style={{ fontFamily: FV, fontSize: 13, color: VIOLET, fontWeight: 700 }}>✓ SELECTED</span>
        )}
      </div>
      <div style={{ fontFamily: FB, fontSize: 13, color: INK_SOFT, lineHeight: 1.5 }}>
        {platform.desc}
      </div>
    </button>
  )
}

/* ─────────────────────────────────── */
/*  Screen 2 — Platform / sub-choice   */
/* ─────────────────────────────────── */
function Screen2({
  mode, onBack, onSelect,
}: {
  mode: Mode
  onBack: () => void
  onSelect: (platform: string, buildType?: BuildType) => void
}) {
  const [buildType, setBuildType] = useState<BuildType | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)

  const platforms = mode === 'learn'
    ? ALL_PLATFORMS
    : buildType === 'product'
    ? PRODUCT_PLATFORMS
    : buildType === 'workflow'
    ? WORKFLOW_PLATFORMS
    : null

  function handleBack() {
    if (mode === 'build' && buildType) {
      setBuildType(null)
      setSelectedPlatform(null)
    } else {
      onBack()
    }
  }

  function handlePlatformSelect(id: string) {
    setSelectedPlatform(id)
    // small delay so selection is visible
    setTimeout(() => {
      onSelect(id, buildType ?? undefined)
    }, 180)
  }

  const heading = mode === 'build'
    ? buildType ? 'Choose your tool' : 'What are you building?'
    : 'Which tool do you want to learn?'

  const subheading = mode === 'build'
    ? buildType ? 'Select the platform you want to build with.' : "Pick a category and I'll match you with the right tools."
    : "Pick a tool and we'll work through it together, one lesson at a time."

  const subChoices = [
    { id: 'product' as BuildType, icon: <LaptopIcon />, title: 'A product', desc: 'An app, site, or AI-powered tool' },
    { id: 'workflow' as BuildType, icon: <BoltIcon />, title: 'A workflow automation', desc: 'Connect apps, automate tasks, save hours' },
  ]

  return (
    <div style={{ width: '100%', maxWidth: 800, padding: '0 24px', position: 'relative' }}>
      {/* back button */}
      <button
        onClick={handleBack}
        style={{
          background: 'none', border: 'none', color: INK_SOFT, fontFamily: FV, fontSize: 16,
          fontWeight: 700, cursor: 'pointer', padding: '0 0 28px', display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        ← Back
      </button>

      <h2 style={{ fontFamily: FD, fontSize: 26, fontWeight: 800, color: INK, marginBottom: 8 }}>
        {heading}
      </h2>
      <p style={{ fontFamily: FB, fontSize: 14.5, color: INK_SOFT, marginBottom: 28 }}>
        {subheading}
      </p>

      {/* build mode — sub-choice */}
      {mode === 'build' && !buildType && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {subChoices.map(choice => (
            <WindowCard
              key={choice.id}
              hoverable
              onClick={() => setBuildType(choice.id)}
              borderRadius={14}
              bodyStyle={{ padding: 22, textAlign: 'left', background: WINDOW }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10, marginBottom: 14,
                background: WINDOW_ALT, border: `2px solid ${BORDER}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {choice.icon}
              </div>
              <div style={{ fontFamily: FD, fontSize: 16, fontWeight: 700, color: INK, marginBottom: 4 }}>
                {choice.title}
              </div>
              <div style={{ fontFamily: FB, fontSize: 13, color: INK_SOFT }}>{choice.desc}</div>
            </WindowCard>
          ))}
        </div>
      )}

      {/* platform cards */}
      {platforms && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {platforms.map(p => (
            <PlatformCard
              key={p.id}
              platform={p}
              selected={selectedPlatform === p.id}
              onSelect={() => handlePlatformSelect(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────── */
/*  Screen 3 — Creating session        */
/* ─────────────────────────────────── */
function Screen3({
  mode, platform, buildType,
}: {
  mode: Mode
  platform: string
  buildType?: BuildType
}) {
  const router = useRouter()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function create() {
      try {
        const res = await fetch('/api/sessions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, platform, buildType: buildType ?? null }),
        })
        const data = await res.json()

        if (res.status === 403 && data.reason === 'upgrade_required') {
          setShowUpgrade(true)
          return
        }
        if (!res.ok) {
          setError(data.error ?? 'Something went wrong.')
          return
        }
        router.push(`/sessions/${data.sessionId}`)
      } catch {
        setError('Network error. Please try again.')
      }
    }
    create()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (showUpgrade) {
    return (
      <div style={{ width: '100%', maxWidth: 420 }}>
        <WindowCard
          bar={{ gradient: `linear-gradient(90deg, ${VIOLET} 0%, #7A5CC7 100%)`, label: 'UPGRADE.EXE' }}
          borderRadius={16}
          bodyStyle={{ padding: '32px 28px', textAlign: 'center', background: WINDOW }}
        >
          <div style={{ fontSize: 34, marginBottom: 14 }}>🚀</div>
          <h2 style={{ fontFamily: FD, fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 10px' }}>
            Upgrade to Pro
          </h2>
          <p style={{ fontFamily: FB, fontSize: 13.5, color: INK_SOFT, lineHeight: 1.7, marginBottom: 24 }}>
            You&apos;ve used your free session. Upgrade to start unlimited builds and lessons.
          </p>
          <RetroButton variant="primary" style={{ width: '100%', marginBottom: 10 }} onClick={() => router.push('/settings')}>
            Upgrade to Pro →
          </RetroButton>
          <RetroButton variant="secondary" style={{ width: '100%' }} onClick={() => router.push('/')}>
            Maybe later
          </RetroButton>
        </WindowCard>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: ERROR, marginBottom: 16, fontFamily: FD, fontWeight: 700 }}>{error}</p>
        <RetroButton variant="secondary" onClick={() => window.location.reload()}>
          Try again
        </RetroButton>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 32, height: 32, margin: '0 auto 20px',
        border: `3px solid ${WINDOW_ALT}`,
        borderTopColor: VIOLET,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontFamily: FV, color: INK_SOFT, fontSize: 17 }}>
        Setting up your session...
      </p>
    </div>
  )
}

/* ─────────────────────────────────── */
/*  Page root                          */
/* ─────────────────────────────────── */
export default function NewSessionPage() {
  const { user } = useUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''

  const [screen, setScreen] = useState<Screen>(1)
  const [mode, setMode] = useState<Mode | null>(null)
  const [platform, setPlatform] = useState<string | null>(null)
  const [buildType, setBuildType] = useState<BuildType | null>(null)

  function handleModeSelect(m: Mode) {
    setMode(m)
    setScreen(2)
  }

  function handlePlatformSelect(p: string, bt?: BuildType) {
    setPlatform(p)
    if (bt) setBuildType(bt)
    setScreen(3)
  }

  const taskbarTabs = [
    { filename: 'new_session.sys', color: mode === 'learn' ? VIOLET : GOLD },
    { filename: 'dashboard', color: PINK },
  ]

  return (
    <RetroShell email={email} activePath="dashboard" taskbarTabs={taskbarTabs}>
      <div style={{
        minHeight: 'calc(100vh - 180px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 0',
      }}>
        {screen === 1 && <Screen1 onSelect={handleModeSelect} />}
        {screen === 2 && mode && (
          <Screen2
            mode={mode}
            onBack={() => setScreen(1)}
            onSelect={handlePlatformSelect}
          />
        )}
        {screen === 3 && mode && platform && (
          <Screen3
            mode={mode}
            platform={platform}
            buildType={buildType ?? undefined}
          />
        )}
      </div>
    </RetroShell>
  )
}
