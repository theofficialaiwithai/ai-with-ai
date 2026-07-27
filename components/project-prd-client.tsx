'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FB = "var(--font-inter,'Inter'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const FS = "var(--font-sora,'Sora'),sans-serif"

const BG = '#0D0D1A'
const SURFACE = '#1A1A2E'
const BORDER = 'rgba(255,255,255,0.06)'
const VIOLET = '#7C3AED'

const BUILD_TOOL_LABELS: Record<string, string> = {
  claude_code: 'Claude Code',
  cursor: 'Cursor',
  replit: 'Replit',
  lovable: 'Lovable',
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  prd_generated: { bg: 'rgba(124,58,237,0.15)', color: '#C4B5FD' },
  building:      { bg: 'rgba(245,158,11,0.15)', color: '#FCD34D' },
  completed:     { bg: 'rgba(16,185,129,0.15)',  color: '#6EE7B7' },
  discovery:     { bg: 'rgba(100,116,139,0.15)', color: '#94A3B8' },
}

type Project = {
  id: number
  title: string
  buildTool: string
  status: string
  prdMarkdown: string
  domainRiskFlagged: boolean
  domainRiskAcknowledged: boolean
  createdAt: string
}

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectPrdClient({ project }: { project: Project }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const statusStyle = STATUS_COLORS[project.status] ?? STATUS_COLORS.discovery

  async function handleCopy() {
    await navigator.clipboard.writeText(project.prdMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        <span style={{
          fontFamily: FD, fontSize: 13, color: '#F8FAFC', fontWeight: 600,
          maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {project.title}
        </span>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: FS, fontSize: 24, fontWeight: 700, color: '#F8FAFC', marginBottom: 12, lineHeight: 1.3 }}>
            {project.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: FM, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '3px 10px', borderRadius: 4,
              background: statusStyle.bg, color: statusStyle.color,
              border: `1px solid ${statusStyle.color}30`,
            }}>
              {project.status.replace(/_/g, ' ')}
            </span>
            <span style={{
              fontFamily: FM, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '3px 10px', borderRadius: 4,
              background: 'rgba(255,255,255,0.05)', color: '#94A3B8',
              border: `1px solid ${BORDER}`,
            }}>
              {BUILD_TOOL_LABELS[project.buildTool] ?? project.buildTool}
            </span>
            {project.createdAt && (
              <span style={{ fontFamily: FB, fontSize: 12, color: '#64748B' }}>
                {formatDate(project.createdAt)}
              </span>
            )}
          </div>
        </div>

        {/* Copy button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? 'rgba(16,185,129,0.15)' : SURFACE,
              border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : BORDER}`,
              color: copied ? '#6EE7B7' : '#94A3B8',
              fontFamily: FM, fontSize: 11, fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✓ Copied' : 'Copy PRD'}
          </button>
        </div>

        {/* PRD content */}
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: '36px 40px',
        }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 style={{ fontFamily: FS, fontSize: 22, fontWeight: 700, color: '#F8FAFC', marginTop: 0, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${BORDER}` }}>{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 style={{ fontFamily: FS, fontSize: 17, fontWeight: 700, color: '#F8FAFC', marginTop: 32, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` }}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 style={{ fontFamily: FD, fontSize: 14, fontWeight: 700, color: '#E2E8F0', marginTop: 20, marginBottom: 8 }}>{children}</h3>
              ),
              p: ({ children }) => (
                <p style={{ fontFamily: FB, fontSize: 14, color: '#CBD5E1', lineHeight: 1.75, marginBottom: 14, marginTop: 0 }}>{children}</p>
              ),
              ul: ({ children }) => (
                <ul style={{ fontFamily: FB, fontSize: 14, color: '#CBD5E1', lineHeight: 1.75, marginBottom: 14, paddingLeft: 20 }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={{ fontFamily: FB, fontSize: 14, color: '#CBD5E1', lineHeight: 1.75, marginBottom: 14, paddingLeft: 20 }}>{children}</ol>
              ),
              li: ({ children }) => (
                <li style={{ marginBottom: 4 }}>{children}</li>
              ),
              strong: ({ children }) => (
                <strong style={{ color: '#F1F5F9', fontWeight: 700 }}>{children}</strong>
              ),
              code: ({ children, className }) => {
                const isBlock = className?.startsWith('language-')
                return isBlock ? (
                  <code style={{
                    display: 'block', fontFamily: FM, fontSize: 12,
                    background: '#0D0D1A', color: '#A5F3FC',
                    padding: '14px 18px', borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    overflowX: 'auto', lineHeight: 1.7, whiteSpace: 'pre',
                  }}>{children}</code>
                ) : (
                  <code style={{
                    fontFamily: FM, fontSize: 12, color: '#C4B5FD',
                    background: 'rgba(124,58,237,0.12)', padding: '2px 6px',
                    borderRadius: 4,
                  }}>{children}</code>
                )
              },
              pre: ({ children }) => (
                <pre style={{ marginBottom: 16, marginTop: 8, borderRadius: 8, overflow: 'hidden' }}>{children}</pre>
              ),
              blockquote: ({ children }) => (
                <blockquote style={{
                  borderLeft: `3px solid ${VIOLET}`, paddingLeft: 16,
                  margin: '0 0 16px', color: '#94A3B8',
                  background: 'rgba(124,58,237,0.06)', borderRadius: '0 8px 8px 0',
                  padding: '12px 16px',
                }}>{children}</blockquote>
              ),
              table: ({ children }) => (
                <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FB, fontSize: 13 }}>{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th style={{
                  textAlign: 'left', padding: '8px 12px',
                  fontFamily: FD, fontWeight: 700, fontSize: 12, color: '#94A3B8',
                  borderBottom: `1px solid ${BORDER}`, background: '#0D0D1A',
                }}>{children}</th>
              ),
              td: ({ children }) => (
                <td style={{
                  padding: '8px 12px', color: '#CBD5E1',
                  borderBottom: `1px solid ${BORDER}`,
                }}>{children}</td>
              ),
              hr: () => (
                <hr style={{ border: 'none', borderTop: `1px solid ${BORDER}`, margin: '24px 0' }} />
              ),
            }}
          >
            {project.prdMarkdown}
          </ReactMarkdown>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button
            onClick={() => router.push('/build-ai/new')}
            style={{
              background: 'none', border: `1px solid ${BORDER}`,
              color: '#94A3B8', fontFamily: FD, fontWeight: 600, fontSize: 13,
              padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.color = '#F8FAFC' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = '#94A3B8' }}
          >
            + New Project
          </button>
        </div>
      </div>
    </div>
  )
}
