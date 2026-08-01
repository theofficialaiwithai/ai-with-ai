'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import RetroShell from '@/components/retro-os/retro-shell'
import WindowCard, { RetroButton, RetroPill } from '@/components/retro-os/window-card'

const BORDER = '#000000'
const INK = '#1B1533'
const INK_SOFT = '#5A536F'
const GOLD = '#FFCB33'
const PINK = '#FF5FA8'
const PINK_SOFT = '#FF9BD0'
const VIOLET = '#9B7FD1'
const BLUE = '#5C7CFA'
const BLUE_SOFT = '#8DA3FC'
const WINDOW = '#FFFFFF'
const WINDOW_ALT = '#ECE9F5'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

const BUILD_TOOLS = [
  { value: 'claude_code', label: 'Claude Code' },
  { value: 'cursor',      label: 'Cursor' },
  { value: 'replit',      label: 'Replit' },
  { value: 'lovable',     label: 'Lovable' },
]

type PathChoice = 'from_scratch' | 'enhance' | 'curriculum' | null

const CARDS: {
  id: PathChoice
  gradient: string
  filename: string
  icon: string
  title: string
  description: string
  tag: string
}[] = [
  {
    id: 'from_scratch',
    gradient: `linear-gradient(90deg, ${GOLD} 0%, #FFE08A 100%)`,
    filename: 'from_scratch.exe',
    icon: '🔨',
    title: 'Build From Scratch',
    description: 'Start with a blank slate. Describe your idea and get a complete PRD and build plan.',
    tag: 'NEW_PROJECT',
  },
  {
    id: 'curriculum',
    gradient: `linear-gradient(90deg, ${VIOLET} 0%, #C4AEED 100%)`,
    filename: 'curriculum.exe',
    icon: '🎓',
    title: 'Learn with Guided Curriculum',
    description: 'Follow a structured path of real builds. Unlock levels as you ship.',
    tag: 'LEVEL_UP',
  },
  {
    id: 'enhance',
    gradient: `linear-gradient(90deg, ${BLUE} 0%, ${BLUE_SOFT} 100%)`,
    filename: 'enhance_build.exe',
    icon: '⚡',
    title: 'Enhance My Existing Build',
    description: 'Run an agentic audit on something you\'ve already started. Get a ranked list of enhancements.',
    tag: 'AGENTIC_AUDIT',
  },
]

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 14, color: INK, marginBottom: 9 }}>
      {children}
    </div>
  )
}

const fieldStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: `2px solid ${BORDER}`, borderRadius: 10,
  padding: '13px 14px', fontFamily: FB, fontSize: 14, color: INK,
  background: WINDOW_ALT, outline: 'none',
}

export default function NewProjectPage() {
  const router = useRouter()
  const { user } = useUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''

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
  const [existingAppUrl, setExistingAppUrl] = useState('')

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
      router.push(`/build-ai/project/${data.projectId}/review`)
    } catch (err) {
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
        body: JSON.stringify({ appDescription, stackDescription, manualTasksDescription, existingAppUrl: existingAppUrl.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Audit failed')
      if (!data.projectId) throw new Error('Audit created but no ID returned')
      router.push(`/build-ai/project/${data.projectId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const taskbarTabs = [
    { filename: 'new_project.sys', color: GOLD },
    { filename: 'dashboard', color: PINK },
  ]

  return (
    <RetroShell email={email} activePath="build-ai" taskbarTabs={taskbarTabs}>
      {/* Breadcrumb */}
      <div style={{
        maxWidth: 1000, margin: '0 auto', padding: '20px 32px 0',
        fontFamily: FV, fontSize: 16, color: INK,
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <button
          onClick={() => router.push('/build-ai')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FV, fontSize: 16, color: INK_SOFT, fontWeight: 700, padding: 0 }}
        >← Build AI with AI</button>
        <span style={{ color: INK_SOFT }}>/</span>
        <span style={{ fontWeight: 700, color: INK }}>New Project</span>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '22px 32px 0' }}>

        <h1 style={{ fontFamily: FD, fontWeight: 800, fontSize: 32, color: INK, marginBottom: 10, lineHeight: 1.2 }}>
          New Project
        </h1>
        <p style={{ fontFamily: FB, fontSize: 15, color: INK_SOFT, maxWidth: 520, marginBottom: 34, fontWeight: 500, lineHeight: 1.6 }}>
          Build from scratch with a full PRD, follow the curriculum, or audit an existing app for agentic improvements.
        </p>

        {/* Choice cards — 3-column grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 30,
        }}>
          {CARDS.map(card => {
            const selected = pathChoice === card.id
            const unselected = pathChoice !== null && !selected

            return (
              <WindowCard
                key={card.id}
                bar={{ gradient: card.gradient, label: card.filename }}
                hoverable
                onClick={() => {
                  if (card.id === 'curriculum') {
                    router.push('/build-ai/levels')
                    return
                  }
                  setPathChoice(selected ? null : card.id)
                  setError(null)
                }}
                style={{
                  borderColor: selected ? VIOLET : BORDER,
                  boxShadow: selected ? `5px 5px 0 ${VIOLET}` : '5px 5px 0 #000',
                  opacity: unselected ? 0.55 : 1,
                  transition: 'opacity 0.15s, box-shadow 0.12s ease, transform 0.12s ease',
                }}
                bodyStyle={{ padding: '20px 22px', background: WINDOW }}
                borderRadius={14}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 12, border: `2px solid ${BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, marginBottom: 18,
                  background: card.id === 'from_scratch' ? GOLD : card.id === 'curriculum' ? VIOLET : BLUE,
                }}>
                  {card.icon}
                </div>
                <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: INK, marginBottom: 10 }}>
                  {card.title}
                </div>
                <div style={{ fontFamily: FB, fontSize: 13.5, color: INK_SOFT, lineHeight: 1.55, marginBottom: 16 }}>
                  {card.description}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <RetroPill>{card.tag}</RetroPill>
                  {selected && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontFamily: FV, fontSize: 13, fontWeight: 700,
                      border: `1.5px solid ${VIOLET}`, borderRadius: 100,
                      padding: '3px 11px', color: VIOLET, background: '#F3EDFB',
                    }}>✓ SELECTED</span>
                  )}
                </div>
              </WindowCard>
            )
          })}
        </div>

        {/* From scratch form */}
        {pathChoice === 'from_scratch' && (
          <form onSubmit={handlePrdSubmit}>
            <WindowCard
              infoBar="new_build.form"
              style={{ marginBottom: 30 }}
              borderRadius={16}
              bodyStyle={{ padding: 28 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div>
                  <FieldLabel>What do you want to build?</FieldLabel>
                  <textarea
                    value={idea}
                    onChange={e => setIdea(e.target.value)}
                    placeholder="e.g. A tool that monitors my GitHub repos for stale PRs and sends me a Slack digest every morning…"
                    rows={4}
                    style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5, minHeight: 90 }}
                  />
                </div>
                <div>
                  <FieldLabel>Who is it for?</FieldLabel>
                  <input
                    type="text"
                    value={targetUser}
                    onChange={e => setTargetUser(e.target.value)}
                    placeholder="e.g. Solo developers managing multiple open-source projects"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <FieldLabel>What&apos;s the one core feature it needs to work?</FieldLabel>
                  <input
                    type="text"
                    value={coreFeature}
                    onChange={e => setCoreFeature(e.target.value)}
                    placeholder="e.g. Detecting PRs with no activity in 7+ days and surfacing them in a digest"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <FieldLabel>Which build tool will you use?</FieldLabel>
                  <select
                    value={buildTool}
                    onChange={e => setBuildTool(e.target.value)}
                    style={{ ...fieldStyle, cursor: 'pointer', appearance: 'none' }}
                  >
                    {BUILD_TOOLS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                {error && (
                  <p style={{ fontFamily: FB, fontSize: 13, color: '#EF4444', margin: 0 }}>✗ {error}</p>
                )}
                <RetroButton type="submit" variant="violet" disabled={loading} style={{ width: '100%', padding: '16px 0', fontSize: 15, borderRadius: 12 }}>
                  {loading ? '✦ Writing your PRD…' : 'Generate PRD →'}
                </RetroButton>
              </div>
            </WindowCard>
          </form>
        )}

        {/* Enhance form */}
        {pathChoice === 'enhance' && (
          <form onSubmit={handleAuditSubmit}>
            <WindowCard
              infoBar="agentic_audit.form"
              style={{ marginBottom: 30 }}
              borderRadius={16}
              bodyStyle={{ padding: 28 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div>
                  <FieldLabel>Describe your app — what does it do and who uses it?</FieldLabel>
                  <textarea
                    value={appDescription}
                    onChange={e => setAppDescription(e.target.value)}
                    placeholder="e.g. A Next.js dashboard that lets marketing teams schedule and publish social posts. Used by a 5-person agency managing 12 client accounts."
                    rows={4}
                    style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5, minHeight: 90 }}
                  />
                </div>
                <div>
                  <FieldLabel>What&apos;s your current tech stack?</FieldLabel>
                  <input
                    type="text"
                    value={stackDescription}
                    onChange={e => setStackDescription(e.target.value)}
                    placeholder="e.g. Next.js 14, Supabase, Clerk auth, deployed on Vercel"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <FieldLabel>What feels manual today — things you or your users do by hand that feel repetitive?</FieldLabel>
                  <textarea
                    value={manualTasksDescription}
                    onChange={e => setManualTasksDescription(e.target.value)}
                    placeholder="e.g. Every Monday we export a CSV of last week's posts and manually paste metrics into a Google Sheet."
                    rows={4}
                    style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5, minHeight: 90 }}
                  />
                </div>
                <div>
                  <FieldLabel>Link to your app (optional)</FieldLabel>
                  <input
                    type="url"
                    value={existingAppUrl}
                    onChange={e => setExistingAppUrl(e.target.value)}
                    placeholder="https://your-app.com"
                    style={fieldStyle}
                  />
                </div>
                {error && (
                  <p style={{ fontFamily: FB, fontSize: 13, color: '#EF4444', margin: 0 }}>✗ {error}</p>
                )}
                <RetroButton type="submit" variant="violet" disabled={loading} style={{ width: '100%', padding: '16px 0', fontSize: 15, borderRadius: 12 }}>
                  {loading ? '✦ Running the audit…' : 'Run Agentic Audit →'}
                </RetroButton>
              </div>
            </WindowCard>
          </form>
        )}

      </div>
    </RetroShell>
  )
}
