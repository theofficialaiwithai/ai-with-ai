'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RetroShell from '@/components/retro-os/retro-shell'
import WindowCard, { RetroPill, RetroButton } from '@/components/retro-os/window-card'

const BORDER = '#000000'
const INK = '#1B1533'
const INK_SOFT = '#5A536F'
const GOLD = '#FFCB33'
const PINK = '#FF5FA8'
const PINK_SOFT = '#FF9BD0'
const VIOLET = '#9B7FD1'
const BLUE = '#5C7CFA'
const BLUE_SOFT = '#8DA3FC'
const LIME = '#5FD98A'
const WINDOW = '#FFFFFF'
const WINDOW_ALT = '#ECE9F5'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"

interface Project {
  id: number
  title: string
  path: string
  status: string
  updatedAt: string
}

interface Props {
  userName: string
  email: string
  currentLevel: number
  projects: Project[]
}

function deriveFilename(title: string): string {
  const word = title.trim().split(/[\s—–\-]/)[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${word || 'project'}.prd`
}

function barGradient(path: string): string {
  if (path === 'from_scratch') return `linear-gradient(90deg, ${GOLD} 0%, #FFE08A 100%)`
  if (path === 'agentify_existing') return `linear-gradient(90deg, ${PINK} 0%, ${PINK_SOFT} 100%)`
  if (path === 'level_project') return `linear-gradient(90deg, ${BLUE} 0%, ${BLUE_SOFT} 100%)`
  return `linear-gradient(90deg, ${VIOLET} 0%, #C4AEED 100%)`
}

function barColor(path: string): string {
  if (path === 'from_scratch') return GOLD
  if (path === 'agentify_existing') return PINK
  if (path === 'level_project') return BLUE
  return VIOLET
}

const PATH_LABELS: Record<string, string> = {
  from_scratch: 'FROM SCRATCH',
  agentify_existing: 'ENHANCE EXISTING BUILD',
  level_project: 'LEVEL PROJECT',
}

function statusTag(status: string): { label: string; bg: string; color: string } {
  if (status === 'building') return { label: 'BUILDING', bg: PINK, color: '#fff' }
  if (status === 'complete') return { label: 'COMPLETE', bg: LIME, color: INK }
  if (['reviewing_sections', 'prd_generated'].includes(status)) return { label: 'PRD_GENERATED', bg: WINDOW_ALT, color: INK_SOFT }
  return { label: status.toUpperCase().replace(/_/g, '_'), bg: WINDOW_ALT, color: INK_SOFT }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter()
  const filename = deriveFilename(project.title)
  const gradient = barGradient(project.path)
  const tag = statusTag(project.status)
  const pathLabel = PATH_LABELS[project.path] ?? project.path.toUpperCase()

  return (
    <WindowCard
      bar={{ gradient, label: filename }}
      hoverable
      onClick={() => router.push(`/build-ai/project/${project.id}`)}
    >
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <RetroPill>{pathLabel}</RetroPill>
        <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: INK, lineHeight: 1.35 }}>
          {project.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{
            fontFamily: FV, fontSize: 13, fontWeight: 700,
            background: tag.bg, color: tag.color,
            border: `1.5px solid ${BORDER}`, borderRadius: 100,
            padding: '3px 11px', display: 'inline-block',
          }}>{tag.label}</span>
          <span style={{ fontFamily: FV, fontSize: 13, color: INK_SOFT }}>
            Updated {formatDate(project.updatedAt)}
          </span>
        </div>
      </div>
    </WindowCard>
  )
}

export default function BuildAiClient({ userName, email, currentLevel, projects }: Props) {
  const router = useRouter()

  const totalProjects = projects.length
  const buildingCount = projects.filter(p => p.status === 'building').length
  const prdCount = projects.filter(p => ['reviewing_sections', 'prd_generated'].includes(p.status)).length

  // Build taskbar tabs from 2 most recent projects + dashboard
  const taskbarTabs = [
    ...projects.slice(0, 2).map(p => ({
      filename: deriveFilename(p.title),
      color: barColor(p.path),
    })),
    { filename: 'dashboard', color: BLUE },
  ]

  const stats = [
    { n: totalProjects, l: 'Projects' },
    { n: buildingCount, l: 'Building' },
    { n: prdCount, l: 'PRD Generated' },
    { n: currentLevel, l: 'Level Reached' },
  ]

  return (
    <RetroShell email={email} activePath="build-ai" taskbarTabs={taskbarTabs}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 32px 0' }}>

        {/* Page header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 26, flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h1 style={{ fontFamily: FD, fontWeight: 800, fontSize: 30, color: INK, margin: 0 }}>
              Build AI with AI
            </h1>
            <Link href="/build-ai/levels" style={{ textDecoration: 'none' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: WINDOW, border: `2px solid ${BORDER}`, borderRadius: 100,
                padding: '6px 14px', fontFamily: FV, fontSize: 15, color: INK_SOFT,
                boxShadow: `2px 2px 0 ${BORDER}`, cursor: 'pointer',
              }}>
                LEVEL{' '}
                <span style={{
                  background: BLUE, color: '#fff', fontFamily: FD,
                  fontWeight: 700, fontSize: 12, padding: '1px 9px', borderRadius: 100,
                }}>{currentLevel}</span>
              </span>
            </Link>
          </div>
          <RetroButton variant="primary" onClick={() => router.push('/build-ai/new')}>
            + New Project
          </RetroButton>
        </div>

        {/* Stats WindowCard */}
        <WindowCard
          infoBar="SYSTEM PROPERTIES — BUILD_STATS.LOG"
          style={{ marginBottom: 22 }}
          borderRadius={16}
        >
          <div style={{
            background: WINDOW_ALT,
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, padding: 20,
          }}>
            {stats.map(s => (
              <div key={s.l} style={{
                background: WINDOW, border: `2px solid ${BORDER}`, borderRadius: 12,
                padding: '20px 12px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 32, color: BLUE, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 11, color: INK_SOFT, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 8, fontWeight: 600, fontFamily: FB }}>{s.l}</div>
              </div>
            ))}
          </div>
        </WindowCard>

        {/* Projects section */}
        {projects.length === 0 ? (
          <WindowCard borderRadius={16} bodyStyle={{ padding: '80px 24px', textAlign: 'center', background: WINDOW_ALT }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>🛠️</div>
            <h2 style={{ fontFamily: FD, fontSize: 20, fontWeight: 700, color: INK, margin: '0 0 10px' }}>
              No projects yet
            </h2>
            <p style={{ fontFamily: FB, fontSize: 14, color: INK_SOFT, maxWidth: 380, margin: '0 auto 28px', lineHeight: 1.7 }}>
              Start your first agentic build — from scratch or by enhancing an existing tool.
            </p>
            <RetroButton variant="primary" onClick={() => router.push('/build-ai/new')}>
              + New Project
            </RetroButton>
          </WindowCard>
        ) : (
          <>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14,
            }}>
              <span style={{ fontFamily: FV, fontSize: 16, color: INK, fontWeight: 700, letterSpacing: '0.04em' }}>
                &gt; PROJECTS.SYS — {totalProjects} file{totalProjects !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
              {projects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          </>
        )}
      </div>
    </RetroShell>
  )
}
