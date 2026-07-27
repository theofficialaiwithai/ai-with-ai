'use client'

import { useRouter, usePathname } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FB = "var(--font-inter,'Inter'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const FS = "var(--font-sora,'Sora'),sans-serif"

const BG = '#0D0D1A'
const SURFACE = '#1A1A2E'
const BORDER = 'rgba(255,255,255,0.06)'
const VIOLET = '#7C3AED'

interface Project {
  id: number
  title: string
  path: string
  status: string
  updatedAt: string
}

interface Props {
  userName: string
  currentLevel: number
  projects: Project[]
}

const PATH_LABELS: Record<string, string> = {
  from_scratch: 'From Scratch',
  agentify_existing: 'Enhance Existing Build',
}

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  discovery:  { label: 'Discovery',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  planning:   { label: 'Planning',   color: '#9D5AF0', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.25)' },
  building:   { label: 'Building',   color: '#9D5AF0', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.25)' },
  complete:   { label: 'Complete',   color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { label: status, color: '#94A3B8', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' }
  return (
    <span style={{
      fontFamily: FM, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
      textTransform: 'uppercase', display: 'inline-block',
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 4, padding: '2px 8px',
    }}>
      {s.label}
    </span>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push(`/build-ai/project/${project.id}`)}
      style={{
        background: SURFACE, border: `1px solid ${BORDER}`,
        borderRadius: 14, padding: '22px 24px',
        cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,58,237,0.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = BORDER
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Path tag */}
      <span style={{
        fontFamily: FM, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', display: 'inline-block',
        color: '#94A3B8', background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${BORDER}`, borderRadius: 4, padding: '2px 8px',
        alignSelf: 'flex-start',
      }}>
        {PATH_LABELS[project.path] ?? project.path}
      </span>

      {/* Title */}
      <div style={{ fontFamily: FD, fontSize: 16, fontWeight: 600, color: '#F8FAFC', lineHeight: 1.35 }}>
        {project.title}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <StatusPill status={project.status} />
        <span style={{ fontFamily: FM, fontSize: 11, color: '#4A5568' }}>
          Updated {formatDate(project.updatedAt)}
        </span>
      </div>
    </div>
  )
}

export default function BuildAiClient({ userName, currentLevel, projects }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#F8FAFC' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 56,
        background: 'rgba(13,13,26,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, background: VIOLET,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0,
          }}>▸</div>
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: '#F8FAFC' }}>AI with AI</span>
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Build AI with AI', href: '/build-ai' },
          ].map(({ label, href }) => {
            const active = pathname === href
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                style={{
                  background: active ? 'rgba(124,58,237,0.12)' : 'none',
                  border: active ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                  borderRadius: 7, padding: '5px 14px',
                  fontFamily: FD, fontWeight: active ? 600 : 500, fontSize: 13,
                  color: active ? '#C4B5FD' : '#94A3B8',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#F8FAFC' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#94A3B8' }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* User + sign out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: FB, fontSize: 13, color: '#94A3B8' }}>{userName}</span>
          <SignOutButton>
            <button style={{
              background: 'none', border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 7, padding: '5px 12px',
              fontFamily: FB, fontSize: 12, color: '#94A3B8', cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F8FAFC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              Log out
            </button>
          </SignOutButton>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{
              fontFamily: FS, fontWeight: 700, fontSize: 28,
              color: VIOLET, margin: 0, letterSpacing: '-0.01em',
            }}>
              Build AI with AI
            </h1>
            {/* Level badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
              borderRadius: 20, padding: '4px 12px',
            }}>
              <span style={{ fontFamily: FM, fontSize: 10, color: '#9D5AF0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Level</span>
              <span style={{ fontFamily: FS, fontSize: 14, fontWeight: 700, color: '#C4B5FD' }}>{currentLevel}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/build-ai/new')}
            style={{
              background: VIOLET, color: '#fff', border: 'none',
              borderRadius: 10, padding: '10px 22px',
              fontFamily: FD, fontWeight: 600, fontSize: 14,
              cursor: 'pointer', transition: 'opacity 0.15s',
              boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            + New Project
          </button>
        </div>

        {/* Projects grid or empty state */}
        {projects.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 20,
          }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>🛠️</div>
            <h2 style={{ fontFamily: FS, fontSize: 20, fontWeight: 600, color: '#F8FAFC', margin: '0 0 10px' }}>
              No projects yet
            </h2>
            <p style={{ fontFamily: FB, fontSize: 14, color: '#94A3B8', maxWidth: 380, margin: '0 auto 28px', lineHeight: 1.7 }}>
              Start your first agentic build — from scratch or by enhancing an existing tool.
            </p>
            <button
              onClick={() => router.push('/build-ai/new')}
              style={{
                background: VIOLET, color: '#fff', border: 'none',
                borderRadius: 10, padding: '12px 28px',
                fontFamily: FD, fontWeight: 600, fontSize: 15,
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              + New Project
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {projects.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
