'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

/* ── shared token helpers ── */
const fontDisplay = "var(--font-space-grotesk, 'Space Grotesk'), sans-serif"

/* ─────────────────────────────────── */
/*  Reusable card hover hook           */
/* ─────────────────────────────────── */
function useHover() {
  const [hovered, setHovered] = useState<string | null>(null)
  return {
    hovered,
    bind: (id: string) => ({
      onMouseEnter: () => setHovered(id),
      onMouseLeave: () => setHovered(null),
    }),
  }
}

/* ─────────────────────────────────── */
/*  Screen 1 — Mode selection          */
/* ─────────────────────────────────── */
function Screen1({ onSelect }: { onSelect: (mode: Mode) => void }) {
  const { hovered, bind } = useHover()

  const cards = [
    { id: 'build' as Mode, icon: '🔨', title: 'Build AI with AI', desc: "Jump in. Describe what you want to build and I'll walk you through it step by step." },
    { id: 'learn' as Mode, icon: '🧠', title: 'Learn AI with AI', desc: 'Learn a new AI tool through deliberate practice \u2014 one lesson, one task at a time.' },
  ]

  return (
    <div style={{ textAlign: 'center', width: '100%', maxWidth: 800, padding: '0 24px' }}>
      <h1 style={{ fontFamily: fontDisplay, fontSize: 32, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>
        What do you want to do?
      </h1>
      <p style={{ fontSize: 16, color: '#94A3B8', marginBottom: 40 }}>
        Choose your path — you can switch any time.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 800, width: '100%' }}>
        {cards.map((card) => {
          const isHovered = hovered === card.id
          return (
            <button
              key={card.id}
              onClick={() => onSelect(card.id)}
              {...bind(card.id)}
              style={{
                background: '#1A1A2E',
                border: `1.5px solid ${isHovered ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 24,
                padding: '40px 32px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 380ms cubic-bezier(0.16,1,0.3,1)',
                textAlign: 'left',
                boxShadow: isHovered ? '0 16px 48px rgba(124,58,237,0.12)' : 'none',
                transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
              }}
            >
              {/* violet top line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 2,
                background: '#7C3AED',
                transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 380ms cubic-bezier(0.16,1,0.3,1)',
              }} />

              {/* icon */}
              <div style={{
                width: 52, height: 52,
                background: 'rgba(124,58,237,0.15)',
                borderRadius: 10,
                border: '1px solid rgba(124,58,237,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 20,
              }}>
                {card.icon}
              </div>

              <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.6 }}>
                {card.desc}
              </div>
            </button>
          )
        })}
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
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected ? '#232340' : '#1A1A2E',
        border: `1.5px solid ${selected ? '#7C3AED' : hovered ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 16,
        padding: 24,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 280ms cubic-bezier(0.16,1,0.3,1)',
        transform: hovered && !selected ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 32px rgba(124,58,237,0.1)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* violet top line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 2, background: '#7C3AED',
        transform: selected || hovered ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left',
        transition: 'transform 280ms cubic-bezier(0.16,1,0.3,1)',
      }} />
      <div style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 600, color: '#F8FAFC', marginBottom: 4 }}>
        {platform.name}
      </div>
      <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>
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
  const { hovered, bind } = useHover()

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
    { id: 'product' as BuildType, icon: '💻', title: 'A product', desc: 'An app, site, or AI-powered tool' },
    { id: 'workflow' as BuildType, icon: '⚡', title: 'A workflow automation', desc: 'Connect apps, automate tasks, save hours' },
  ]

  return (
    <div style={{ width: '100%', maxWidth: 800, padding: '0 24px', position: 'relative' }}>
      {/* back button */}
      <button
        onClick={handleBack}
        style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 14, cursor: 'pointer', padding: '0 0 32px', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        ← Back
      </button>

      <h2 style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>
        {heading}
      </h2>
      <p style={{ fontSize: 15, color: '#94A3B8', marginBottom: 32 }}>
        {subheading}
      </p>

      {/* build mode — sub-choice */}
      {mode === 'build' && !buildType && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {subChoices.map((choice) => {
            const isHovered = hovered === choice.id
            return (
              <button
                key={choice.id}
                onClick={() => setBuildType(choice.id)}
                {...bind(choice.id)}
                style={{
                  background: '#1A1A2E',
                  border: `1.5px solid ${isHovered ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 16,
                  padding: 24,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 280ms cubic-bezier(0.16,1,0.3,1)',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHovered ? '0 8px 32px rgba(124,58,237,0.1)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: '#7C3AED',
                  transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform 280ms cubic-bezier(0.16,1,0.3,1)',
                }} />
                <div style={{ fontSize: 28, marginBottom: 12 }}>{choice.icon}</div>
                <div style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 600, color: '#F8FAFC', marginBottom: 4 }}>
                  {choice.title}
                </div>
                <div style={{ fontSize: 13, color: '#94A3B8' }}>{choice.desc}</div>
              </button>
            )
          })}
        </div>
      )}

      {/* platform cards */}
      {platforms && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {platforms.map((p) => (
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
      <div style={{
        background: '#1A1A2E',
        border: '1.5px solid rgba(124,58,237,0.25)',
        borderRadius: 24,
        padding: '48px 40px',
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontSize: 40, marginBottom: 20 }}>🚀</div>
        <h2 style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>
          Upgrade to Pro
        </h2>
        <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.6, marginBottom: 32 }}>
          You've used your free session. Upgrade to start unlimited builds and lessons.
        </p>
        <button
          onClick={() => router.push('/settings')}
          style={{
            display: 'block', width: '100%',
            background: '#7C3AED', color: '#fff',
            border: 'none', borderRadius: 10,
            padding: '12px 24px', marginBottom: 12,
            fontFamily: fontDisplay, fontWeight: 600, fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Upgrade to Pro →
        </button>
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'block', width: '100%',
            background: 'none', color: '#94A3B8',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
            padding: '12px 24px',
            fontFamily: fontDisplay, fontWeight: 500, fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Maybe later
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#EF4444', marginBottom: 16, fontFamily: fontDisplay }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: 8, padding: '8px 20px', cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 32, height: 32, margin: '0 auto 20px',
        border: '2px solid rgba(124,58,237,0.2)',
        borderTopColor: '#7C3AED',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontFamily: fontDisplay, color: '#94A3B8', fontSize: 16 }}>
        Setting up your session...
      </p>
    </div>
  )
}

/* ─────────────────────────────────── */
/*  Page root                          */
/* ─────────────────────────────────── */
export default function NewSessionPage() {
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

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0D0D1A',
      position: 'relative',
      zIndex: 1,
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
    </main>
  )
}
