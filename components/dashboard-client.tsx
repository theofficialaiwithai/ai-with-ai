'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'

/* ── font tokens ── */
const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
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

function statusLabel(status: string): { label: string; color: string; bg: string; border: string } {
  switch (status) {
    case 'onboarding': return { label: 'Getting started', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' }
    case 'planning':   return { label: 'Planning', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' }
    case 'plan_review':return { label: 'Review plan', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' }
    case 'building':   return { label: 'Building', color: '#9D5AF0', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)' }
    case 'learning':   return { label: 'Learning', color: '#9D5AF0', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)' }
    case 'completed':  return { label: 'Complete', color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' }
    default:           return { label: status, color: '#94A3B8', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)' }
  }
}

const ACTIVE_STATUSES = new Set(['onboarding', 'planning', 'plan_review', 'building', 'learning'])

/* ── upgrade modal ── */
function UpgradeModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1A1A2E', border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 20, padding: '40px 36px', maxWidth: 420, width: '100%',
          textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 16 }}>🚀</div>
        <h2 style={{ fontFamily: FD, fontSize: 22, fontWeight: 700, color: '#F8FAFC', marginBottom: 10 }}>
          Upgrade to Pro
        </h2>
        <p style={{ fontFamily: FB, fontSize: 14, color: '#94A3B8', lineHeight: 1.7, marginBottom: 28 }}>
          You&apos;ve used your free session. Upgrade to Pro for unlimited builds and lessons.
        </p>
        <button
          onClick={() => { router.push('/settings'); onClose() }}
          style={{
            display: 'block', width: '100%', background: '#7C3AED', color: '#fff',
            border: 'none', borderRadius: 10, padding: '12px 0',
            fontFamily: FD, fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 10,
          }}
        >
          Upgrade to Pro →
        </button>
        <button
          onClick={onClose}
          style={{
            display: 'block', width: '100%', background: 'none', color: '#94A3B8',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 0',
            fontFamily: FD, fontWeight: 500, fontSize: 15, cursor: 'pointer',
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

/* ── mode card ── */
function ModeCard({
  icon, title, desc, onClick,
}: { icon: string; title: string; desc: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#1A1A2E',
        border: `1.5px solid ${hovered ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 18, padding: '28px 24px', cursor: 'pointer',
        textAlign: 'left', position: 'relative', overflow: 'hidden',
        transition: 'all 320ms cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 12px 40px rgba(124,58,237,0.12)' : 'none',
        flex: 1,
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: '#7C3AED',
        transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left',
        transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)',
      }} />
      <div style={{
        width: 44, height: 44, borderRadius: 10, marginBottom: 16,
        background: 'rgba(124,58,237,0.12)',
        border: '1px solid rgba(124,58,237,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>
        {icon}
      </div>
      <div style={{ fontFamily: FD, fontSize: 17, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontFamily: FB, fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
        {desc}
      </div>
    </button>
  )
}

/* ── session card ── */
function SessionCard({ s, dim = false }: { s: Session; dim?: boolean }) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const st = statusLabel(s.status)
  const isActive = ACTIVE_STATUSES.has(s.status)
  const pct = s.totalSteps ? Math.round((s.currentStep / s.totalSteps) * 100) : 0

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#1A1A2E',
        border: `1px solid ${hovered && !dim ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 14, padding: '20px 22px',
        transition: 'border-color 0.2s',
        opacity: dim ? 0.65 : 1,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Badge color="#9D5AF0" bg="rgba(124,58,237,0.12)" border="rgba(124,58,237,0.25)">
          {platformLabel(s.platform)}
        </Badge>
        <Badge color="#94A3B8" bg="rgba(255,255,255,0.05)" border="rgba(255,255,255,0.1)">
          {s.mode === 'learn' ? 'Learn' : 'Build'}
        </Badge>
        <div style={{ marginLeft: 'auto' }}>
          <Badge color={st.color} bg={st.bg} border={st.border}>{st.label}</Badge>
        </div>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: FD, fontSize: 16, fontWeight: 600,
        color: s.title ? '#F8FAFC' : '#4A5568', lineHeight: 1.35,
      }}>
        {s.title || 'Untitled session'}
      </div>

      {/* Progress */}
      {s.totalSteps ? (
        <div>
          <div style={{ height: 4, background: '#232340', borderRadius: 2, marginBottom: 6 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: '#10B981', borderRadius: 2, transition: 'width 0.4s' }} />
          </div>
          <span style={{ fontFamily: FM, fontSize: 11, color: '#4A5568' }}>
            {s.currentStep} of {s.totalSteps} {s.mode === 'learn' ? 'lessons' : 'steps'}
          </span>
        </div>
      ) : (
        <span style={{ fontFamily: FM, fontSize: 11, color: '#4A5568' }}>Getting started…</span>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontFamily: FM, fontSize: 11, color: '#4A5568' }}>
          {s.completedAt
            ? `Completed ${formatDate(s.completedAt)}`
            : `Last active ${relativeTime(s.lastActiveAt)}`}
        </span>

        {isActive && (
          <button
            onClick={() => router.push(continueUrl(s))}
            style={{
              background: 'none', color: '#9D5AF0',
              border: '1px solid rgba(124,58,237,0.35)',
              borderRadius: 8, padding: '5px 14px',
              fontFamily: FD, fontWeight: 600, fontSize: 12,
              cursor: 'pointer', transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(124,58,237,0.12)'
              e.currentTarget.style.borderColor = '#7C3AED'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'
            }}
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  )
}

function Badge({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <span style={{
      fontFamily: FM, fontSize: 10, fontWeight: 600,
      color, background: bg, border: `1px solid ${border}`,
      borderRadius: 4, padding: '2px 8px', letterSpacing: '0.04em',
      textTransform: 'uppercase', display: 'inline-block',
    }}>
      {children}
    </span>
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg,#0D0D1A)', color: '#F8FAFC' }}>
      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 56,
        background: 'rgba(13,13,26,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px',
      }}>
        {/* Left: logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: '#7C3AED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0,
          }}>
            ▸
          </div>
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: '#F8FAFC' }}>
            AI with AI
          </span>
        </div>

        {/* Right: name + sign out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: FB, fontSize: 13, color: '#94A3B8' }}>
            {profile.name}
          </span>
          <SignOutButton>
            <button style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 7, padding: '5px 12px',
              fontFamily: FB, fontSize: 12, color: '#94A3B8',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#F8FAFC' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94A3B8' }}
            >
              Log out
            </button>
          </SignOutButton>
        </div>
      </nav>

      {/* ── FREE BANNER ── */}
      {isGated && (
        <div style={{
          background: 'rgba(245,158,11,0.1)',
          borderTop: '1px solid rgba(245,158,11,0.3)',
          padding: '12px 28px',
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: FB, fontSize: 13, color: '#F59E0B', flex: 1 }}>
            You&apos;ve completed your free session. Upgrade to Pro for unlimited builds and lessons.
          </span>
          <button
            onClick={() => router.push('/settings')}
            style={{
              background: '#F59E0B', color: '#0D0D1A',
              border: 'none', borderRadius: 7, padding: '6px 14px',
              fontFamily: FD, fontWeight: 700, fontSize: 12,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Upgrade to Pro →
          </button>
        </div>
      )}

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        {/* Start section */}
        <section style={{ marginBottom: 52 }}>
          <SectionTitle>Start something new</SectionTitle>
          <div style={{ display: 'flex', gap: 16 }}>
            <ModeCard
              icon="🔨"
              title="Build with AI"
              desc="Describe what you want to build and get a step-by-step plan."
              onClick={handleModeCardClick}
            />
            <ModeCard
              icon="🧠"
              title="Learn with AI"
              desc="Learn a new AI tool through structured lessons and micro-tasks."
              onClick={handleModeCardClick}
            />
          </div>
        </section>

        {/* Active sessions */}
        {activeSessions.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <SectionTitle count={activeSessions.length}>Active sessions</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {activeSessions.map(s => <SessionCard key={s.id} s={s} />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!hasAnySessions && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✨</div>
            <p style={{ fontFamily: FD, fontSize: 16, color: '#4A5568' }}>
              No sessions yet. Start a build or lesson above.
            </p>
          </div>
        )}

        {/* Completed sessions (collapsible) */}
        {completedSessions.length > 0 && (
          <section>
            <button
              onClick={() => setCompletedOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 0 20px', width: '100%', textAlign: 'left',
              }}
            >
              <span style={{ fontFamily: FD, fontSize: 14, fontWeight: 600, color: '#94A3B8' }}>
                Completed sessions
              </span>
              <span style={{
                fontFamily: FM, fontSize: 10, color: '#4A5568',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4, padding: '1px 7px',
              }}>
                {completedSessions.length}
              </span>
              <span style={{
                marginLeft: 'auto', color: '#4A5568', fontSize: 12,
                transform: completedOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
                display: 'inline-block',
              }}>
                ▾
              </span>
            </button>

            {completedOpen && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {completedSessions.map(s => <SessionCard key={s.id} s={s} dim />)}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <h2 style={{ fontFamily: FD, fontSize: 14, fontWeight: 600, color: '#94A3B8', margin: 0 }}>
        {children}
      </h2>
      {count != null && (
        <span style={{
          fontFamily: FM, fontSize: 10, color: '#4A5568',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 4, padding: '1px 7px',
        }}>
          {count}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
    </div>
  )
}
