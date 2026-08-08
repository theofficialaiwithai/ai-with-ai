'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RetroShell from '@/components/retro-os/retro-shell'
import WindowCard, { RetroPill, RetroButton } from '@/components/retro-os/window-card'

const BORDER = '#000000'
const INK = '#1B1533'
const INK_SOFT = '#5A536F'
const GOLD = '#FFCB33'
const PINK = '#FF5FA8'
const PINK_SOFT = '#FF9BD0'
const VIOLET = '#9B7FD1'
const VIOLET_SOFT = '#C4AEED'
const LIME = '#5FD98A'
const WINDOW = '#FFFFFF'
const WINDOW_ALT = '#ECE9F5'

/* ── font tokens ── */
const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

/* ── types ── */
interface Profile {
  name: string
  email: string
  freeSessionUsed: boolean
  subscriptionStatus: string
}

interface Session {
  id: string
  mode: string
  platform: string
  buildType: string | null
  title: string | null
  status: string
  currentStep: number
  totalSteps: number | null
  lastActiveAt: string
  completedAt: string | null
}

interface Props {
  profile: Profile
  sessions: Session[]
}

/* ── helpers ── */
const PLATFORM_LABELS: Record<string, string> = {
  'claude-code': 'Claude Code',
  codex: 'Codex',
  zapier: 'Zapier',
  make: 'Make',
}

function platformLabel(p: string) {
  return PLATFORM_LABELS[p] ?? p
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function continueUrl(s: Session): string {
  switch (s.status) {
    case 'building': return `/sessions/${s.id}/build/${s.currentStep || 1}`
    case 'learning': return `/sessions/${s.id}/learn/${s.currentStep || 1}`
    case 'plan_review':
    case 'planning': return `/sessions/${s.id}/plan`
    default: return `/sessions/${s.id}`
  }
}

function statusTag(status: string): { label: string; bg: string; color: string } {
  switch (status) {
    case 'onboarding':  return { label: 'GETTING STARTED', bg: GOLD, color: INK }
    case 'planning':    return { label: 'PLANNING', bg: GOLD, color: INK }
    case 'plan_review': return { label: 'REVIEW PLAN', bg: GOLD, color: INK }
    case 'building':    return { label: 'BUILDING', bg: PINK, color: '#fff' }
    case 'learning':    return { label: 'LEARNING', bg: VIOLET, color: '#fff' }
    case 'completed':   return { label: 'COMPLETE', bg: LIME, color: INK }
    default:            return { label: status.toUpperCase().replace(/_/g, ' '), bg: WINDOW_ALT, color: INK_SOFT }
  }
}

function modeBar(mode: string): string {
  return mode === 'learn'
    ? `linear-gradient(90deg, ${VIOLET} 0%, ${VIOLET_SOFT} 100%)`
    : `linear-gradient(90deg, ${GOLD} 0%, #FFE08A 100%)`
}

const ACTIVE_STATUSES = new Set(['onboarding', 'planning', 'plan_review', 'building', 'learning'])

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

/* ── upgrade modal ── */
function UpgradeModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(27,21,51,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420 }}>
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
            You&apos;ve used your free session. Upgrade to Pro for unlimited builds and lessons.
          </p>
          <RetroButton
            variant="primary"
            style={{ width: '100%', marginBottom: 10 }}
            onClick={() => { router.push('/settings'); onClose() }}
          >
            Upgrade to Pro →
          </RetroButton>
          <RetroButton variant="secondary" style={{ width: '100%' }} onClick={onClose}>
            Maybe later
          </RetroButton>
        </WindowCard>
      </div>
    </div>
  )
}

/* ── mode card ── */
function ModeCard({
  icon, title, desc, filename, onClick,
}: { icon: React.ReactNode; title: string; desc: string; filename: string; onClick: () => void }) {
  return (
    <div style={{ flex: 1 }}>
      <WindowCard
        bar={{ gradient: modeBar(title.toLowerCase().includes('learn') ? 'learn' : 'build'), label: filename }}
        hoverable
        onClick={onClick}
        borderRadius={16}
        bodyStyle={{ padding: '24px 22px', background: WINDOW }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 10, marginBottom: 16,
          background: WINDOW_ALT, border: `2px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <div style={{ fontFamily: FD, fontSize: 17, fontWeight: 700, color: INK, marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontFamily: FB, fontSize: 13, color: INK_SOFT, lineHeight: 1.6 }}>
          {desc}
        </div>
      </WindowCard>
    </div>
  )
}

/* ── session card ── */
function SessionCard({ s, dim = false }: { s: Session; dim?: boolean }) {
  const router = useRouter()
  const tag = statusTag(s.status)
  const isActive = ACTIVE_STATUSES.has(s.status)
  const pct = s.totalSteps ? Math.round((s.currentStep / s.totalSteps) * 100) : 0
  const filename = `${(s.title || 'session').trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'session'}.log`

  return (
    <div style={{ opacity: dim ? 0.65 : 1 }}>
      <WindowCard
        bar={{ gradient: modeBar(s.mode), label: filename }}
        borderRadius={16}
        bodyStyle={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, background: WINDOW }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <RetroPill>{platformLabel(s.platform)}</RetroPill>
          <RetroPill>{s.mode === 'learn' ? 'Learn' : 'Build'}</RetroPill>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              fontFamily: FV, fontSize: 13, fontWeight: 700,
              background: tag.bg, color: tag.color,
              border: `1.5px solid ${BORDER}`, borderRadius: 100,
              padding: '3px 11px', display: 'inline-block',
            }}>{tag.label}</span>
          </div>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: FD, fontSize: 16, fontWeight: 700,
          color: s.title ? INK : INK_SOFT, lineHeight: 1.35,
        }}>
          {s.title || 'Untitled session'}
        </div>

        {/* Progress */}
        {s.totalSteps ? (
          <div>
            <div style={{ height: 8, border: `1.5px solid ${BORDER}`, borderRadius: 100, background: WINDOW_ALT, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ width: `${pct}%`, height: '100%', background: LIME, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontFamily: FV, fontSize: 13, color: INK_SOFT }}>
              {s.currentStep} of {s.totalSteps} {s.mode === 'learn' ? 'lessons' : 'steps'}
            </span>
          </div>
        ) : (
          <span style={{ fontFamily: FV, fontSize: 13, color: INK_SOFT }}>Getting started…</span>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ fontFamily: FV, fontSize: 13, color: INK_SOFT }}>
            {s.completedAt
              ? `Completed ${formatDate(s.completedAt)}`
              : `Last active ${relativeTime(s.lastActiveAt)}`}
          </span>

          {isActive && (
            <RetroButton variant="primary" style={{ padding: '5px 14px', fontSize: 12 }} onClick={() => router.push(continueUrl(s))}>
              Continue →
            </RetroButton>
          )}
        </div>
      </WindowCard>
    </div>
  )
}

function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span style={{ fontFamily: FV, fontSize: 16, color: INK, fontWeight: 700, letterSpacing: '0.04em' }}>
        &gt; {children}
      </span>
      {count != null && (
        <span style={{
          fontFamily: FV, fontSize: 13, color: INK_SOFT,
          background: WINDOW_ALT, border: `1.5px solid ${BORDER}`,
          borderRadius: 100, padding: '1px 10px',
        }}>
          {count}
        </span>
      )}
    </div>
  )
}

/* ── main dashboard ── */
export default function DashboardClient({ profile, sessions }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [completedOpen, setCompletedOpen] = useState(false)

  // Show banner for all free-plan users who have at least one session.
  // freeSessionUsed flag may be false for legacy sessions created before the fix.
  const isFree = profile.subscriptionStatus === 'free'
  const isGated = isFree && (profile.freeSessionUsed || sessions.length > 0)
  const activeSessions = sessions.filter(s => ACTIVE_STATUSES.has(s.status))
  const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'abandoned')
  const hasAnySessions = sessions.length > 0

  function handleModeCardClick() {
    if (isGated) {
      setShowModal(true)
    } else {
      router.push('/sessions/new')
    }
  }

  const taskbarTabs = [
    ...activeSessions.slice(0, 2).map(s => ({
      filename: `${(s.title || 'session').trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'session'}.log`,
      color: s.mode === 'learn' ? VIOLET : GOLD,
    })),
    { filename: 'build-ai.exe', color: PINK_SOFT },
  ]

  return (
    <RetroShell email={profile.email} activePath="dashboard" taskbarTabs={taskbarTabs}>
      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}

      {/* Free banner */}
      {isGated && (
        <div style={{
          background: GOLD, borderBottom: `2.5px solid ${BORDER}`,
          padding: '12px 32px',
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: FB, fontWeight: 600, fontSize: 13, color: INK, flex: 1 }}>
            You&apos;ve completed your free session. Upgrade to Pro for unlimited builds and lessons.
          </span>
          <RetroButton variant="secondary" style={{ padding: '6px 16px', fontSize: 12 }} onClick={() => router.push('/settings')}>
            Upgrade to Pro →
          </RetroButton>
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 32px 60px' }}>

        {/* Page header */}
        <h1 style={{ fontFamily: FD, fontWeight: 800, fontSize: 30, color: INK, margin: '0 0 26px' }}>
          Dashboard
        </h1>

        {/* Start section */}
        <section style={{ marginBottom: 44 }}>
          <SectionTitle>START_SOMETHING_NEW.SYS</SectionTitle>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <ModeCard
              icon={<WrenchIcon />}
              title="Build with AI"
              filename="build.exe"
              desc="Describe what you want to build and get a step-by-step plan."
              onClick={handleModeCardClick}
            />
            <ModeCard
              icon={<BookIcon />}
              title="Learn with AI"
              filename="learn.exe"
              desc="Learn a new AI tool through structured lessons and micro-tasks."
              onClick={handleModeCardClick}
            />
          </div>
        </section>

        {/* Active sessions */}
        {activeSessions.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <SectionTitle count={activeSessions.length}>ACTIVE_SESSIONS.SYS</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
              {activeSessions.map(s => <SessionCard key={s.id} s={s} />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!hasAnySessions && (
          <WindowCard borderRadius={16} bodyStyle={{ padding: '70px 24px', textAlign: 'center', background: WINDOW_ALT }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>✨</div>
            <p style={{ fontFamily: FD, fontSize: 15, fontWeight: 600, color: INK_SOFT, margin: 0 }}>
              No sessions yet. Start a build or lesson above.
            </p>
          </WindowCard>
        )}

        {/* Completed sessions (collapsible) */}
        {completedSessions.length > 0 && (
          <section>
            <button
              onClick={() => setCompletedOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 0 16px', width: '100%', textAlign: 'left',
              }}
            >
              <span style={{ fontFamily: FV, fontSize: 16, fontWeight: 700, color: INK, letterSpacing: '0.04em' }}>
                &gt; COMPLETED_SESSIONS.SYS
              </span>
              <span style={{
                fontFamily: FV, fontSize: 13, color: INK_SOFT,
                background: WINDOW_ALT, border: `1.5px solid ${BORDER}`,
                borderRadius: 100, padding: '1px 10px',
              }}>
                {completedSessions.length}
              </span>
              <span style={{
                marginLeft: 'auto', color: INK_SOFT, fontSize: 13, fontFamily: FV,
                transform: completedOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
                display: 'inline-block',
              }}>
                ▾
              </span>
            </button>

            {completedOpen && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
                {completedSessions.map(s => <SessionCard key={s.id} s={s} dim />)}
              </div>
            )}
          </section>
        )}
      </div>
    </RetroShell>
  )
}
