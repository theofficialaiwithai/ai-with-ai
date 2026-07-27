'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FB = "var(--font-inter,'Inter'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const FS = "var(--font-sora,'Sora'),sans-serif"

const BG = '#0D0D1A'
const SURFACE = '#1A1A2E'
const BORDER = 'rgba(255,255,255,0.06)'
const VIOLET = '#7C3AED'

type PathChoice = 'from_scratch' | 'enhance' | null

const BUILD_TOOLS = [
  { value: 'claude_code', label: 'Claude Code' },
  { value: 'cursor',      label: 'Cursor' },
  { value: 'replit',      label: 'Replit' },
  { value: 'lovable',     label: 'Lovable' },
]

function OptionCard({
  icon, title, description, selected, onClick,
}: {
  icon: string; title: string; description: string
  selected: boolean; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, minWidth: 240, textAlign: 'left',
        background: selected ? 'rgba(124,58,237,0.08)' : SURFACE,
        border: `1.5px solid ${selected ? VIOLET : hovered ? 'rgba(124,58,237,0.4)' : BORDER}`,
        borderRadius: 16, padding: '28px 26px',
        cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: selected ? '0 0 0 1px rgba(124,58,237,0.2)' : 'none',
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontFamily: FD, fontSize: 17, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontFamily: FB, fontSize: 13, color: '#94A3B8', lineHeight: 1.65 }}>
        {description}
      </div>
      {selected && (
        <div style={{
          display: 'inline-block', marginTop: 16,
          fontFamily: FM, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: '#C4B5FD',
          background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 4, padding: '2px 8px',
        }}>
          Selected
        </div>
      )}
    </button>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontFamily: FD, fontSize: 13, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 8 }}>
      {children}
    </label>
  )
}

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%', boxSizing: 'border-box',
    background: '#0D0D1A', border: `1px solid ${focused ? VIOLET : BORDER}`,
    borderRadius: 10, padding: '11px 14px',
    fontFamily: FB, fontSize: 14, color: '#F8FAFC',
    outline: 'none', transition: 'border-color 0.15s',
  }
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={inputStyle(focused)}
    />
  )
}

function TextArea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle(focused), resize: 'vertical', lineHeight: 1.65 }}
    />
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const [focused, setFocused] = useState(false)
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle(focused), cursor: 'pointer', appearance: 'none' }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: '#1A1A2E' }}>{o.label}</option>
      ))}
    </select>
  )
}

export default function NewProjectPage() {
  const router = useRouter()
  const [pathChoice, setPathChoice] = useState<PathChoice>(null)

  // from_scratch fields
  const [idea, setIdea] = useState('')
  const [targetUser, setTargetUser] = useState('')
  const [coreFeature, setCoreFeature] = useState('')
  const [buildTool, setBuildTool] = useState('claude_code')

  // enhance fields
  const [appDescription, setAppDescription] = useState('')
  const [stackDescription, setStackDescription] = useState('')
  const [manualTasksDescription, setManualTasksDescription] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePrdSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!idea.trim() || !targetUser.trim() || !coreFeature.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/build-ai/generate-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaDescription: idea, targetUser, coreFeature, buildTool }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      if (!data.projectId) throw new Error('Project created but no ID returned')
      router.push(`/build-ai/project/${data.projectId}`)
    } catch (err) {
      console.error('[new-project] client error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handleAuditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!appDescription.trim() || !stackDescription.trim() || !manualTasksDescription.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/build-ai/generate-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appDescription, stackDescription, manualTasksDescription }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Audit failed')
      if (!data.projectId) throw new Error('Audit created but no ID returned')
      router.push(`/build-ai/project/${data.projectId}`)
    } catch (err) {
      console.error('[new-project] audit error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#F8FAFC' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 56,
        background: 'rgba(13,13,26,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 28px',
      }}>
        <button
          onClick={() => router.push('/build-ai')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: FD, fontWeight: 600, fontSize: 13,
            color: '#94A3B8', padding: 0, display: 'flex', alignItems: 'center', gap: 6,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#F8FAFC' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
        >
          ← Build AI with AI
        </button>
        <span style={{ fontFamily: FM, fontSize: 11, color: '#374151' }}>/</span>
        <span style={{ fontFamily: FD, fontSize: 13, color: '#F8FAFC', fontWeight: 600 }}>New Project</span>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Page title */}
        <h1 style={{ fontFamily: FS, fontSize: 26, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>
          New Project
        </h1>
        <p style={{ fontFamily: FB, fontSize: 14, color: '#94A3B8', marginBottom: 40, lineHeight: 1.6 }}>
          Build from scratch with a full PRD, or audit an existing app for agentic improvements.
        </p>

        {/* Path choice */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
          <OptionCard
            icon="🔨"
            title="Build From Scratch"
            description="Start with a blank slate. Describe your idea and get a complete PRD and build plan."
            selected={pathChoice === 'from_scratch'}
            onClick={() => { setPathChoice('from_scratch'); setError(null) }}
          />
          <OptionCard
            icon="⚡"
            title="Enhance My Existing Build"
            description="Run an agentic audit on something you've already started. Get a ranked list of enhancements."
            selected={pathChoice === 'enhance'}
            onClick={() => { setPathChoice('enhance'); setError(null) }}
          />
        </div>

        {/* From scratch form */}
        {pathChoice === 'from_scratch' && (
          <form onSubmit={handlePrdSubmit}>
            <div style={{
              background: SURFACE, border: `1px solid ${BORDER}`,
              borderRadius: 16, padding: '32px 28px',
              display: 'flex', flexDirection: 'column', gap: 24,
            }}>
              <div>
                <Label>What do you want to build?</Label>
                <TextArea
                  value={idea}
                  onChange={setIdea}
                  placeholder="e.g. A tool that monitors my GitHub repos for stale PRs and sends me a Slack digest every morning…"
                  rows={4}
                />
              </div>
              <div>
                <Label>Who is it for?</Label>
                <TextInput
                  value={targetUser}
                  onChange={setTargetUser}
                  placeholder="e.g. Solo developers managing multiple open-source projects"
                />
              </div>
              <div>
                <Label>What&apos;s the one core feature it needs to work?</Label>
                <TextInput
                  value={coreFeature}
                  onChange={setCoreFeature}
                  placeholder="e.g. Detecting PRs with no activity in 7+ days and surfacing them in a digest"
                />
              </div>
              <div>
                <Label>Which build tool will you use?</Label>
                <Select value={buildTool} onChange={setBuildTool} options={BUILD_TOOLS} />
              </div>
              {error && (
                <p style={{ fontFamily: FB, fontSize: 13, color: '#F87171', margin: 0 }}>✗ {error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? 'rgba(124,58,237,0.5)' : VIOLET,
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '13px 0', width: '100%',
                  fontFamily: FD, fontWeight: 700, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.35)',
                }}
              >
                {loading ? '✦ Writing your PRD…' : 'Generate PRD →'}
              </button>
            </div>
          </form>
        )}

        {/* Enhance form */}
        {pathChoice === 'enhance' && (
          <form onSubmit={handleAuditSubmit}>
            <div style={{
              background: SURFACE, border: `1px solid ${BORDER}`,
              borderRadius: 16, padding: '32px 28px',
              display: 'flex', flexDirection: 'column', gap: 24,
            }}>
              <div>
                <Label>Describe your app — what does it do and who uses it?</Label>
                <TextArea
                  value={appDescription}
                  onChange={setAppDescription}
                  placeholder="e.g. A Next.js dashboard that lets marketing teams schedule and publish social posts across Twitter, LinkedIn, and Instagram. Used by a 5-person agency managing 12 client accounts."
                  rows={4}
                />
              </div>
              <div>
                <Label>What&apos;s your current tech stack?</Label>
                <TextInput
                  value={stackDescription}
                  onChange={setStackDescription}
                  placeholder="e.g. Next.js 14, Supabase, Clerk auth, deployed on Vercel"
                />
              </div>
              <div>
                <Label>What feels manual today — things you or your users do by hand that feel repetitive?</Label>
                <TextArea
                  value={manualTasksDescription}
                  onChange={setManualTasksDescription}
                  placeholder="e.g. Every Monday we export a CSV of last week's posts and manually paste metrics into a Google Sheet. Clients email us for status updates instead of seeing a live dashboard."
                  rows={4}
                />
              </div>
              {error && (
                <p style={{ fontFamily: FB, fontSize: 13, color: '#F87171', margin: 0 }}>✗ {error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? 'rgba(124,58,237,0.5)' : VIOLET,
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '13px 0', width: '100%',
                  fontFamily: FD, fontWeight: 700, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.35)',
                }}
              >
                {loading ? '✦ Running the audit…' : 'Run Agentic Audit →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
