'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const BORDER = '#000000'
const BORDER_SOFT = '#3A3164'
const PANEL_DARK = '#241D42'
const PANEL_RAISED = '#2E2650'
const WINDOW = '#FFFFFF'
const WINDOW_ALT = '#ECE9F5'
const GOLD = '#FFCB33'
const BLUE = '#5C7CFA'
const LIME = '#5FD98A'
const PINK = '#FF5FA8'
const VIOLET = '#9B7FD1'
const INK = '#1B1533'
const INK_SOFT = '#5A536F'
const TEXT_DARK = '#ECE9F5'
const TEXT_DIM = '#A79FC9'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"
const FB = "var(--font-inter,'Inter'),sans-serif"
const FC = "'Caveat',cursive"

const MARQUEE_TEXT = 'BUILD AI WITH AI ✦ AGENTIC SYSTEMS ✦ SKILLS / ROUTINES / AGENTS / OS ✦ BUILT FOR YOUR NEXT LEVEL ✦ '
const BG_IMAGE = 'linear-gradient(180deg, #C9AEEA 0%, #9B7FD1 100%), linear-gradient(rgba(70,50,110,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(70,50,110,0.14) 1px, transparent 1px)'
const BG_SIZE = '100% 100%, 40px 40px, 40px 40px'

/* ── Icon helper ── */

function FeatureSVGIcon({ k }: { k: string }) {
  const p = { fill: 'none' as const, stroke: '#000', strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const L = { ...p }
  const icons: Record<string, React.ReactNode> = {
    chat: <path {...p} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,
    doc: <><path {...p} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline {...p} points="14 2 14 8 20 8"/><line {...L} x1="16" y1="13" x2="8" y2="13"/><line {...L} x1="16" y1="17" x2="8" y2="17"/><line {...L} x1="10" y1="9" x2="8" y2="9"/></>,
    bolt: <polygon {...p} points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    shield: <path {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    map: <><polygon {...p} points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line {...L} x1="8" y1="2" x2="8" y2="18"/><line {...L} x1="16" y1="6" x2="16" y2="22"/></>,
    target: <><circle {...p} cx="12" cy="12" r="10"/><circle {...p} cx="12" cy="12" r="6"/><circle {...p} cx="12" cy="12" r="2"/></>,
    wrench: <path {...p} d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>,
    book: <><path {...p} d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path {...p} d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></>,
    list: <><line {...L} x1="8" y1="6" x2="21" y2="6"/><line {...L} x1="8" y1="12" x2="21" y2="12"/><line {...L} x1="8" y1="18" x2="21" y2="18"/><line {...L} x1="3" y1="6" x2="3.01" y2="6"/><line {...L} x1="3" y1="12" x2="3.01" y2="12"/><line {...L} x1="3" y1="18" x2="3.01" y2="18"/></>,
    check: <><polyline {...p} points="9 11 12 14 22 4"/><path {...p} d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    bars: <><line {...L} x1="6" y1="20" x2="6" y2="14"/><line {...L} x1="12" y1="20" x2="12" y2="4"/><line {...L} x1="18" y1="20" x2="18" y2="10"/><line {...L} x1="2" y1="20" x2="22" y2="20"/></>,
    db: <><ellipse {...p} cx="12" cy="5" rx="9" ry="3"/><path {...p} d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path {...p} d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>,
    rocket: <><path {...p} d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path {...p} d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path {...p} d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path {...p} d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></>,
    upload: <><path {...p} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline {...p} points="17 8 12 3 7 8"/><line {...L} x1="12" y1="3" x2="12" y2="15"/></>,
    pin: <><path {...p} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle {...p} cx="12" cy="10" r="3"/></>,
    bell: <><path {...p} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path {...p} d="M13.73 21a2 2 0 01-3.46 0"/></>,
    creditcard: <><rect {...p} x="1" y="4" width="22" height="16" rx="2" ry="2"/><line {...L} x1="1" y1="10" x2="23" y2="10"/></>,
    grid: <><rect {...p} x="3" y="3" width="7" height="7"/><rect {...p} x="14" y="3" width="7" height="7"/><rect {...p} x="14" y="14" width="7" height="7"/><rect {...p} x="3" y="14" width="7" height="7"/></>,
  }
  return (
    <svg viewBox="0 0 24 24" width={38} height={38}>
      {icons[k] ?? <circle {...p} cx="12" cy="12" r="9"/>}
    </svg>
  )
}

/* ── Data ── */

const FEATURES = [
  { k: 'chat',       iconBg: BLUE,   name: 'Idea Intake Chat',           sub: 'PRD chat' },
  { k: 'doc',        iconBg: GOLD,   name: 'Auto-Generated PRD',         sub: 'Auto PRD' },
  { k: 'bolt',       iconBg: VIOLET, name: 'Agentify My App',            sub: 'App audit' },
  { k: 'shield',     iconBg: PINK,   name: 'Domain-Risk Check',          sub: 'Risk check' },
  { k: 'map',        iconBg: LIME,   name: 'Build Map',                  sub: 'Build steps' },
  { k: 'target',     iconBg: BLUE,   name: 'Build Coach',                sub: 'Step coach' },
  { k: 'wrench',     iconBg: GOLD,   name: 'Tool 101',                   sub: 'Tool setup' },
  { k: 'book',       iconBg: VIOLET, name: 'Living Documentation',       sub: 'Auto docs' },
  { k: 'list',       iconBg: PINK,   name: 'Decision-Rights Matrix',     sub: 'Governance doc' },
  { k: 'check',      iconBg: LIME,   name: 'Auto-Suggest Checkpoints',   sub: 'Checkpoints' },
  { k: 'bars',       iconBg: BLUE,   name: 'Level Map',                  sub: 'Skill levels' },
  { k: 'db',         iconBg: GOLD,   name: 'Persistent Project Memory',  sub: 'Project memory' },
  { k: 'rocket',     iconBg: VIOLET, name: 'Build Your Riskiest Page',   sub: 'Free trial' },
  { k: 'upload',     iconBg: PINK,   name: 'Multi-Editor Prompt Export', sub: 'Prompt export' },
  { k: 'pin',        iconBg: LIME,   name: 'Doc-Grounded Prompts',       sub: 'Grounded AI' },
  { k: 'bell',       iconBg: BLUE,   name: 'Stalled-Project Nudge',      sub: 'Re-engagement' },
  { k: 'creditcard', iconBg: GOLD,   name: 'Subscription & Billing',     sub: 'Paid tier' },
  { k: 'grid',       iconBg: VIOLET, name: 'Dashboard',                  sub: 'Project hub' },
]

// Free screenshot proxy for public sites — sends the URL to thum.io's servers
const BUILT_WITH = [
  {
    name: 'Skillpath',
    desc: 'Personalized learning-path app that turns any skill goal into a curated, trackable path of lessons and resources.',
    screenshot: '/screenshots/skillpath.png',
    filename: 'SKILLPATH.APP',
  },
  {
    name: 'Vibe Labs',
    desc: 'Scores your Vibe Quotient across five competencies, places you in a tier, and hands you a personalized build challenge.',
    screenshot: '/screenshots/vibe-labs.png',
    filename: 'VIBE_LABS.APP',
  },
  {
    name: 'Pigeon',
    desc: 'AI email-sequence generator that learns your brand voice and builds cohort-based drip campaigns you can export to ConvertKit.',
    screenshot: '/screenshots/pigeon.png',
    filename: 'PIGEON.APP',
  },
  {
    name: 'The Automated CMO',
    desc: 'AI marketing platform that packages strategy, brand, and content toolkits into nine ready-to-use agents.',
    screenshot: '/screenshots/automated-cmo.png',
    filename: 'AUTOMATED_CMO.APP',
  },
  {
    name: 'Persist',
    desc: 'Student engagement platform sending encouragement nudges and tracking independent progress.',
    screenshot: '/screenshots/persist.png',
    filename: 'PERSIST.APP',
  },
  {
    name: 'Bordermath',
    desc: 'Visa compliance tracker for stay limits and entry rules across the countries you move through.',
    screenshot: '/screenshots/bordermath.png',
    filename: 'BORDERMATH.APP',
  },
]

/* ── Sub-components ── */

function TrafficLights({ size }: { size: number }) {
  return (
    <div style={{ display: 'flex', gap: 7 }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: '#FF5F57' }} />
      <div style={{ width: size, height: size, borderRadius: '50%', background: '#FEBC2E' }} />
      <div style={{ width: size, height: size, borderRadius: '50%', background: '#28C840' }} />
    </div>
  )
}

function SectionHeader({ label, labelColor, title, accent, desc }: {
  label: string; labelColor: string; title: string; accent?: string; desc: string
}) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 34 }}>
      <span style={{
        display: 'inline-block', fontFamily: FV, fontSize: 14, fontWeight: 700,
        letterSpacing: '0.1em', color: labelColor, marginBottom: 12,
      }}>{label}</span>
      <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 32, lineHeight: 1.2, color: INK }}>
        {title}
        {accent && (
          <><br /><span style={{ color: INK_SOFT, fontStyle: 'italic', fontWeight: 700 }}>{accent}</span></>
        )}
      </div>
      <div style={{
        maxWidth: 560, margin: '16px auto 0',
        fontSize: 14, color: INK_SOFT, lineHeight: 1.6, fontFamily: FB,
      }}>{desc}</div>
    </div>
  )
}

function WhyCard({ question, desc, cta }: { question: string; desc: string; cta: string }) {
  return (
    <div style={{
      background: '#F0EEF8', border: `2.5px solid ${BORDER}`, borderRadius: 16,
      overflow: 'hidden', boxShadow: `6px 6px 0 ${BORDER}`, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        background: 'linear-gradient(90deg, #FF9EBD 0%, #FF5FA8 100%)',
        borderBottom: `2.5px solid ${BORDER}`,
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: FV, fontWeight: 700, fontSize: 13, color: '#fff', letterSpacing: '0.06em',
      }}>
        <TrafficLights size={9} />
        SYSTEM MESSAGE
      </div>
      <div style={{ padding: '22px 20px', display: 'flex', gap: 14, flex: 1 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: INK,
          border: `2px solid ${BORDER}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
          fontFamily: FD, fontWeight: 800, fontSize: 16, color: '#fff',
        }}>i</div>
        <div>
          <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 15.5, color: INK, marginBottom: 10, lineHeight: 1.3 }}>{question}</div>
          <div style={{ fontSize: 12.5, color: INK_SOFT, lineHeight: 1.55, fontFamily: FB }}>{desc}</div>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
        <div style={{
          background: INK, color: '#fff', fontFamily: FD, fontWeight: 700, fontSize: 11.5,
          padding: '8px 14px', border: `2px solid ${BORDER}`, borderRadius: 8,
          boxShadow: `2px 2px 0 ${BORDER}`, letterSpacing: '0.04em',
        }}>{cta}</div>
        <div style={{
          background: '#fff', color: INK_SOFT, fontFamily: FD, fontWeight: 600, fontSize: 11.5,
          padding: '8px 14px', border: `2px solid ${BORDER}`, borderRadius: 8,
        }}>CANCEL</div>
      </div>
    </div>
  )
}

function FeatureCard({ k, iconBg, name, sub }: { k: string; iconBg: string; name: string; sub: string }) {
  return (
    <div style={{
      background: WINDOW, border: `2px solid ${BORDER}`, borderRadius: 16,
      overflow: 'hidden', boxShadow: `4px 4px 0 ${BORDER}`,
      padding: 12,
    }}>
      <div style={{
        background: iconBg, height: 120, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        border: `2px solid ${BORDER}`, borderRadius: 10,
        marginBottom: 12,
      }}>
        <FeatureSVGIcon k={k} />
      </div>
      <div style={{ textAlign: 'center', paddingBottom: 6 }}>
        <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 13, color: INK, marginBottom: 3, lineHeight: 1.25 }}>{name}</div>
        <div style={{ fontFamily: FV, fontSize: 13, color: INK_SOFT, letterSpacing: '0.02em' }}>{sub}</div>
      </div>
    </div>
  )
}

function PaintCard({ name, desc, screenshot, filename, onPrev, onNext, current, total }: {
  name: string; desc: string; screenshot: string; filename: string;
  onPrev: () => void; onNext: () => void; current: number; total: number;
}) {
  return (
    <div style={{
      background: WINDOW, border: `2.5px solid ${BORDER}`, borderRadius: 16,
      overflow: 'hidden', boxShadow: `8px 8px 0 ${BORDER}`,
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #F0EEF8 0%, #D8D4EC 100%)',
        borderBottom: `2px solid ${BORDER}`,
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: FV, fontSize: 13, color: INK, fontWeight: 700, letterSpacing: '0.03em',
      }}>
        <TrafficLights size={10} />
        PAINT — {filename}
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{
          width: 44, flexShrink: 0, background: '#E8E4F0', borderRight: `2px solid ${BORDER}`,
          padding: '10px 6px', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center',
        }}>
          {[
            { bg: GOLD, label: '✏' },
            { bg: WINDOW, label: '◫' },
            { bg: WINDOW, label: '○' },
            { bg: WINDOW, label: '□' },
            { bg: WINDOW, label: '⧖' },
          ].map((t, i) => (
            <div key={i} style={{
              width: 28, height: 28, border: `2px solid ${BORDER}`, borderRadius: 5,
              background: t.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11, color: INK, fontWeight: 700,
              boxShadow: i === 0 ? `2px 2px 0 ${BORDER}` : 'none',
            }}>{t.label}</div>
          ))}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshot}
          alt={name}
          style={{ flex: 1, width: 0, display: 'block', objectFit: 'contain' }}
        />
      </div>
      <div style={{ padding: '18px 20px 14px', borderTop: `2px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 17, color: INK, marginBottom: 5 }}>{name}</div>
            <div style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.5, fontFamily: FB }}>{desc}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={onPrev} style={{
              width: 36, height: 36, border: `2px solid ${BORDER}`, borderRadius: 8, background: WINDOW,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FV, fontSize: 14, fontWeight: 700, color: INK, boxShadow: `2px 2px 0 ${BORDER}`,
            }}>&#9612;&#9664;</button>
            <button onClick={onNext} style={{
              width: 36, height: 36, border: `2px solid ${BORDER}`, borderRadius: 8, background: WINDOW,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FV, fontSize: 14, fontWeight: 700, color: INK, boxShadow: `2px 2px 0 ${BORDER}`,
            }}>&#9654;&#9612;</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              width: 9, height: 9, borderRadius: '50%',
              background: i === current ? INK : 'rgba(27,21,51,0.22)',
              border: `1.5px solid ${BORDER}`,
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
      </div>
      <div style={{
        borderTop: `2px solid ${BORDER}`, padding: '8px 14px',
        display: 'flex', gap: 5, background: '#F0EEF8',
      }}>
        {[PINK, GOLD, BLUE, LIME, '#C9AEEA', INK, WINDOW, VIOLET].map((c, i) => (
          <div key={i} style={{ width: 16, height: 16, background: c, border: `2px solid ${BORDER}`, borderRadius: 3 }} />
        ))}
      </div>
    </div>
  )
}

function FeatureTab({ active, label, desc, onClick }: {
  active: boolean; label: string; desc: string; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      background: active ? GOLD : WINDOW, border: `2px solid ${BORDER}`, borderRadius: 12,
      padding: '16px 18px', cursor: 'pointer',
      boxShadow: active ? `5px 5px 0 ${BORDER}` : `3px 3px 0 ${BORDER}`,
      textAlign: 'left', width: '100%',
    }}>
      <div style={{ fontFamily: FD, fontWeight: 700, fontSize: active ? 16 : 15, color: active ? INK : INK_SOFT, display: 'flex', alignItems: 'center', gap: 8 }}>
        {active && <span style={{ color: PINK, fontWeight: 800 }}>&#187;</span>}
        {label}
      </div>
      {active && <div style={{ fontSize: 12.5, color: INK, lineHeight: 1.55, marginTop: 8, paddingLeft: 18, fontFamily: FB }}>{desc}</div>}
    </button>
  )
}

function MockupTitlebar({ title }: { title: string }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #F7F6FA 0%, #DCD6EE 100%)',
      borderBottom: `2.5px solid ${BORDER}`,
      padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: FV, fontWeight: 700, fontSize: 13.5, color: INK,
    }}>
      <TrafficLights size={9} />
      {title}
    </div>
  )
}

function MockupSidebar({ activeItem }: { activeItem: string }) {
  const items = ['+ New Project', 'Build Map', 'Levels', 'Prompts', 'Integrations']
  return (
    <div style={{ width: 140, flexShrink: 0, background: WINDOW_ALT, borderRight: `2px solid ${BORDER}`, padding: '14px 12px' }}>
      <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 12.5, color: INK, marginBottom: 14 }}>&#9654; AI with AI</div>
      {items.map(item => (
        <div key={item} style={{
          fontFamily: FV, fontSize: 13, color: item === activeItem ? INK : INK_SOFT,
          padding: '5px 8px', borderRadius: 6, marginBottom: 4,
          background: item === activeItem ? GOLD : 'none',
          border: item === activeItem ? `1.5px solid ${BORDER}` : 'none',
          fontWeight: item === activeItem ? 700 : 400,
        }}>{item}</div>
      ))}
    </div>
  )
}

function StepBadge({ bg, textColor, children }: { bg?: string; textColor?: string; children: React.ReactNode }) {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      background: bg ?? WINDOW_ALT, border: `1.5px solid ${BORDER}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FD, fontWeight: 700, fontSize: 10, flexShrink: 0,
      color: textColor ?? INK,
    }}>{children}</div>
  )
}

function PriceCard({ plan, price, priceSub, features, cta, ctaHref, popular, filled }: {
  plan: string; price: string; priceSub: string; features: string[];
  cta: string; ctaHref: string; popular?: boolean; filled?: boolean
}) {
  return (
    <div style={{
      background: popular ? GOLD : WINDOW, border: `2.5px solid ${BORDER}`, borderRadius: 16,
      padding: '26px 22px', boxShadow: `6px 6px 0 ${BORDER}`, position: 'relative',
    }}>
      {popular && (
        <div style={{
          position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
          background: INK, color: '#fff', fontFamily: FV, fontSize: 12, fontWeight: 700,
          letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 100, border: `2px solid ${BORDER}`,
        }}>MOST POPULAR</div>
      )}
      <div style={{ fontFamily: FV, fontSize: 15, color: popular ? INK : INK_SOFT, marginBottom: 6, letterSpacing: '0.04em' }}>{plan}</div>
      <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 34, color: INK, marginBottom: 18 }}>
        {price}
        {priceSub && <span style={{ fontFamily: FB, fontWeight: 500, fontSize: 14, color: INK_SOFT }}>{priceSub}</span>}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px' }}>
        {features.map(f => (
          <li key={f} style={{ fontSize: 13.5, color: INK, marginBottom: 10, display: 'flex', gap: 8, alignItems: 'flex-start', fontFamily: FB }}>
            <span style={{ color: popular ? INK : LIME, fontWeight: 700, flexShrink: 0 }}>&#10003;</span>{f}
          </li>
        ))}
      </ul>
      <Link href={ctaHref} style={{
        display: 'block', width: '100%', textAlign: 'center',
        fontFamily: FD, fontWeight: 700, fontSize: 14,
        padding: '12px', border: `2.5px solid ${BORDER}`, borderRadius: 10,
        background: filled ? VIOLET : '#fff', color: filled ? '#fff' : INK,
        boxShadow: `3px 3px 0 ${BORDER}`, textDecoration: 'none', boxSizing: 'border-box' as const,
      }}>{cta}</Link>
    </div>
  )
}

function LandingNav() {
  return (
    <nav style={{
      background: PANEL_DARK, borderBottom: `2px solid ${BORDER}`,
      padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'relative', zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, background: VIOLET, border: `2px solid ${BORDER}`,
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: '#fff', fontWeight: 700,
        }}>&#9654;</div>
        <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: '#fff' }}>AI with AI</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/sign-in" style={{
          fontFamily: FB, fontWeight: 600, fontSize: 13.5, color: '#fff',
          padding: '9px 16px', border: `2px solid ${BORDER_SOFT}`, borderRadius: 9,
          textDecoration: 'none',
        }}>Sign in</Link>
        <Link href="/sign-up" style={{
          fontFamily: FD, fontWeight: 700, fontSize: 13.5, color: '#fff',
          background: VIOLET, padding: '10px 18px', border: `2.5px solid ${BORDER}`,
          borderRadius: 9, boxShadow: `3px 3px 0 ${BORDER}`, textDecoration: 'none',
        }}>Start Free</Link>
      </div>
    </nav>
  )
}

function FixedFooter({ marqueeFull, time }: { marqueeFull: string; time: string }) {
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50 }}>
      <div style={{
        background: PANEL_RAISED, borderTop: `2px solid ${BORDER}`, borderBottom: `2px solid ${BORDER}`,
        padding: '8px 0', overflow: 'hidden', whiteSpace: 'nowrap',
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
      <div style={{
        background: '#0F0A22', borderTop: `2px solid ${BORDER}`,
        padding: '10px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: PINK, border: `2px solid ${BORDER}`, borderRadius: 100,
          padding: '7px 16px', fontFamily: FD, fontWeight: 700, fontSize: 12.5, color: '#fff',
          boxShadow: `2.5px 2.5px 0 ${BORDER}`,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: LIME, border: `1.5px solid ${BORDER}` }} />
          Start
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { label: 'Hero', color: VIOLET },
            { label: 'Why', color: PINK },
            { label: 'Features', color: GOLD },
            { label: 'Guided Build', color: LIME },
            { label: 'How It Works', color: PINK },
            { label: 'Built With', color: BLUE },
            { label: 'Pricing', color: GOLD },
            { label: 'FAQ', color: VIOLET },
          ].map(tab => (
            <div key={tab.label} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: PANEL_DARK, border: `1.5px solid ${BORDER_SOFT}`, borderRadius: 100,
              padding: '5px 12px', fontSize: 11.5, fontWeight: 600, fontFamily: FD, color: TEXT_DIM,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: tab.color }} />
              {tab.label}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: FV, fontSize: 16, color: TEXT_DARK }}>{time}</div>
      </div>
    </div>
  )
}

/* ── Main component ── */

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState(1)
  const [activeProject, setActiveProject] = useState(0)
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

  const marqueeFull = MARQUEE_TEXT + MARQUEE_TEXT
  const prev = () => setActiveProject(i => (i - 1 + BUILT_WITH.length) % BUILT_WITH.length)
  const next = () => setActiveProject(i => (i + 1) % BUILT_WITH.length)

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 120, position: 'relative',
      backgroundImage: BG_IMAGE, backgroundSize: BG_SIZE, backgroundAttachment: 'fixed' }}>

      {/* Hides the dark globals.css body background */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: -1, pointerEvents: 'none',
        backgroundImage: BG_IMAGE, backgroundSize: BG_SIZE,
      }} />

      <LandingNav />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '46px 24px 0', position: 'relative', zIndex: 2 }}>

        {/* ── HERO ── */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: FV, fontSize: 14, fontWeight: 700, letterSpacing: '0.06em',
            color: GOLD, border: `1.5px solid ${GOLD}`, borderRadius: 100, padding: '4px 14px',
            background: 'rgba(255,203,51,0.08)',
          }}>AI WITH AI &#183; OPEN BETA</span>
        </div>

        <div style={{
          background: WINDOW, border: `2.5px solid ${BORDER}`, borderRadius: 16,
          overflow: 'hidden', boxShadow: `8px 8px 0 ${BORDER}`, marginTop: 8,
        }}>
          <div style={{
            background: `linear-gradient(90deg, ${VIOLET} 0%, #7A5CC7 100%)`,
            borderBottom: `2.5px solid ${BORDER}`,
            padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: FV, fontWeight: 700, fontSize: 15, color: '#fff',
          }}>
            <TrafficLights size={11} />
            build-ai-with-ai.app
          </div>
          <div style={{
            background: WINDOW_ALT, borderBottom: `2px solid ${BORDER}`,
            padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: FV, fontSize: 14, color: INK_SOFT,
          }}>
            <span>&#8592;</span><span>&#8594;</span><span>&#8635;</span>
            <div style={{
              flex: 1, background: '#fff', border: `1.5px solid ${BORDER}`, borderRadius: 100,
              padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6, maxWidth: 320,
            }}>&#128274; build-ai-with-ai.app</div>
          </div>
          <div style={{ padding: '40px 40px 44px', textAlign: 'center' }}>
            <h1 style={{ fontFamily: FD, fontWeight: 800, fontSize: 44, lineHeight: 1.12, color: INK, margin: '0 0 6px' }}>
              Your AI{' '}
              <em style={{ fontFamily: FC, fontWeight: 700, color: VIOLET, fontSize: '1.15em', fontStyle: 'normal' }}>co-builder.</em>
              <br />One step at a time.
            </h1>
            <p style={{ fontSize: 16, color: INK_SOFT, maxWidth: 500, margin: '14px auto 30px', lineHeight: 1.6, fontWeight: 500, fontFamily: FB }}>
              Describe what you want to build. Build AI with AI walks you through it — prompt by prompt, level by level — until it&apos;s actually shipped.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 26 }}>
              <Link href="/sign-up" style={{
                background: GOLD, color: '#000', fontFamily: FD, fontWeight: 700, fontSize: 14.5,
                padding: '14px 26px', border: `2.5px solid ${BORDER}`, borderRadius: 11,
                boxShadow: `4px 4px 0 ${BORDER}`, textDecoration: 'none', display: 'inline-block',
              }}>START_BUILDING.EXE &#8594;</Link>
              <a href="#how-it-works" style={{
                background: '#fff', color: INK, fontFamily: FD, fontWeight: 700, fontSize: 14.5,
                padding: '14px 26px', border: `2.5px solid ${BORDER}`, borderRadius: 11,
                boxShadow: `4px 4px 0 ${BORDER}`, textDecoration: 'none', display: 'inline-block',
              }}>SEE_HOW_IT_WORKS.EXE</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, flexWrap: 'wrap' }}>
              {['Claude Code', 'Codex', 'Zapier', 'Make'].map(tool => (
                <span key={tool} style={{
                  fontFamily: FV, fontSize: 14, fontWeight: 700, color: INK_SOFT,
                  border: `1.5px solid ${BORDER}`, borderRadius: 100, padding: '4px 13px',
                  background: WINDOW_ALT,
                }}>{tool}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: GOLD, border: `2px solid ${BORDER}`, borderRadius: 100,
            padding: '6px 16px', fontFamily: FV, fontSize: 13, fontWeight: 700, color: INK,
            boxShadow: `3px 3px 0 ${BORDER}`, marginTop: -14,
          }}>
            LEVEL_0
            <div style={{ width: 60, height: 7, border: `1.5px solid ${BORDER}`, borderRadius: 100, background: '#fff', overflow: 'hidden' }}>
              <span style={{ display: 'block', height: '100%', width: '22%', background: INK }} />
            </div>
            IN PROGRESS
          </span>
        </div>

        {/* ── WHY ── */}
        <div style={{ marginTop: 76 }}>
          <SectionHeader
            label="Why Build AI with AI"
            labelColor={PINK}
            title="A real co-builder,"
            accent="not a chat window in disguise"
            desc="Most AI tools answer questions. Build AI with AI takes initiative — planning your build, writing the exact prompts, and getting sharper about your project with every step."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            <WhyCard question="Is your context being remembered?" desc="It remembers your project, your stack, and your past decisions — so you never have to re-explain yourself at the start of every session." cta="YES, LOAD MY PROJECT →" />
            <WhyCard question="Does your AI actually do the work?" desc="Every step comes with the exact prompt to paste and a verification checklist — not just advice you have to translate yourself." cta="YES, BUILD WITH ME →" />
            <WhyCard question="Is it tuned for your specific tools?" desc="Plans are written for the tool you actually build in — Claude Code, Codex, Zapier, Make — no translating generic advice into your stack." cta="YES, USE MY STACK →" />
            <WhyCard question="Does it actually get better over time?" desc="11 levels, from 'type prompts and hope' to autonomous agents. Real skills, real builds, not synthetic busywork." cta="YES, LEVEL UP →" />
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div style={{ marginTop: 76 }}>
          <SectionHeader
            label="Everything inside"
            labelColor={GOLD}
            title="18 features."
            accent="One build system."
            desc="From your first idea intake to your final deploy — every tool you need to go from zero to shipped is already here."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
            {FEATURES.map(f => <FeatureCard key={f.name} {...f} />)}
          </div>
        </div>

        {/* ── GUIDED BUILDING ── */}
        <div style={{ marginTop: 76 }}>
          <SectionHeader
            label="Guided Building"
            labelColor={PINK}
            title="Describe it once."
            accent="It builds the rest."
            desc="Describe your build in plain language. Build AI with AI breaks it into levels, generates the exact prompts, and keeps you moving until it's shipped."
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 36, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <FeatureTab active={activeTab === 1} label="Natural language input" desc="Just describe it — 'a tracker for my Schengen visa days' or 'a Slack digest of stale PRs.' No forms, no jargon." onClick={() => setActiveTab(1)} />
              <FeatureTab active={activeTab === 2} label="Multi-step build plans" desc="Every build starts with a Build Map — the full list of steps, up front, before you commit to any of them." onClick={() => setActiveTab(2)} />
              <FeatureTab active={activeTab === 3} label="Human-in-the-loop checkpoints" desc="One step at a time, with the exact prompt to paste and a verification checklist — you mark it done, not the AI." onClick={() => setActiveTab(3)} />
              <FeatureTab active={activeTab === 4} label="Persistent project memory" desc="Your stack, your tool, your current level — remembered, so every session picks up exactly where the last one left off." onClick={() => setActiveTab(4)} />
            </div>
            <div style={{ background: WINDOW, border: `2.5px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', boxShadow: `6px 6px 0 ${BORDER}` }}>
              <MockupTitlebar title={['new_build.app', 'build_map.app', 'build_coach.app', 'project_memory.app'][activeTab - 1]} />
              {activeTab === 1 && (
                <div style={{ display: 'flex', minHeight: 250 }}>
                  <MockupSidebar activeItem="+ New Project" />
                  <div style={{ flex: 1, padding: '16px 18px' }}>
                    <div style={{ fontFamily: FV, fontSize: 12.5, color: INK_SOFT, marginBottom: 10 }}>Projects / New build</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${BORDER}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: INK, fontWeight: 600, marginBottom: 14 }}>
                      <span style={{ color: PINK, fontWeight: 700 }}>&#62;</span> build a Schengen visa day-tracker
                    </div>
                    <div style={{ fontFamily: FV, fontSize: 12, color: INK_SOFT, marginBottom: 12 }}>Understood: from-scratch build · web app · solo user</div>
                    {['Who is it for?', "What's the one core feature?", 'Which build tool?'].map((q, i) => (
                      <div key={q} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9, fontSize: 12.5, color: INK }}>
                        <StepBadge>{i + 1}</StepBadge>{q}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 2 && (
                <div style={{ display: 'flex', minHeight: 250 }}>
                  <MockupSidebar activeItem="Build Map" />
                  <div style={{ flex: 1, padding: '16px 18px' }}>
                    <div style={{ fontFamily: FV, fontSize: 12.5, color: INK_SOFT, marginBottom: 10 }}>Projects / Schengen Tracker / Build Map</div>
                    <div style={{ fontFamily: FV, fontSize: 12, color: INK_SOFT, marginBottom: 12 }}>6 steps · whole build at a glance</div>
                    {[
                      { n: '✓', label: 'Scaffold the Next.js app', bg: LIME },
                      { n: '✓', label: 'Set up the database schema', bg: LIME },
                      { n: '3', label: 'Build the day-counter logic', bg: GOLD },
                      { n: '4', label: 'Add the trip entry form', bg: undefined },
                      { n: '5', label: 'Wire up auth', bg: undefined },
                      { n: '6', label: 'Deploy & verify', bg: undefined },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9, fontSize: 12.5, color: INK }}>
                        <StepBadge bg={s.bg}>{s.n}</StepBadge>{s.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 3 && (
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ fontFamily: FV, fontSize: 12.5, color: INK_SOFT, marginBottom: 10 }}>Step 3 of 6 — Build the day-counter logic</div>
                  <div style={{ background: WINDOW_ALT, border: `1.5px solid ${BORDER}`, borderRadius: 8, padding: '10px 12px', fontFamily: FV, fontSize: 12.5, color: INK, marginBottom: 12, lineHeight: 1.5 }}>
                    &ldquo;Add a function that calculates rolling 90-day Schengen usage from an array of trip date ranges, and show the days remaining on the dashboard.&rdquo;
                  </div>
                  {[
                    { done: true, text: 'Function returns correct day count' },
                    { done: true, text: 'Dashboard shows days remaining' },
                    { done: false, text: 'Edge case: overlapping trips handled' },
                  ].map(s => (
                    <div key={s.text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9, fontSize: 12.5, color: INK }}>
                      <StepBadge bg={s.done ? LIME : undefined}>{s.done ? '✓' : '○'}</StepBadge>{s.text}
                    </div>
                  ))}
                  <button style={{ marginTop: 10, background: VIOLET, color: '#fff', border: `1.5px solid ${BORDER}`, borderRadius: 8, padding: '8px 18px', fontSize: 12.5, fontFamily: FD, fontWeight: 700, cursor: 'pointer' }}>Mark Done &#8594;</button>
                </div>
              )}
              {activeTab === 4 && (
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ fontFamily: FV, fontSize: 12.5, color: INK_SOFT, marginBottom: 10 }}>Schengen Tracker — remembered context</div>
                  {[
                    { bg: BLUE, text: 'Build tool: Claude Code' },
                    { bg: PINK, text: 'Stack: Next.js + Neon + Drizzle' },
                    { bg: GOLD, text: 'Current level: Level 3' },
                    { bg: LIME, text: 'Last session: 2 days ago, step 3 of 6' },
                  ].map(s => (
                    <div key={s.text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9, fontSize: 12.5, color: INK }}>
                      <StepBadge bg={s.bg} textColor="#fff">&#9654;</StepBadge>{s.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div id="how-it-works" style={{ marginTop: 76 }}>
          <div style={{ textAlign: 'center', fontFamily: FV, fontSize: 14, letterSpacing: '0.15em', color: INK, opacity: 0.65, marginBottom: 10, fontWeight: 700 }}>HOW IT WORKS</div>
          <div style={{ textAlign: 'center', fontFamily: FD, fontWeight: 800, fontSize: 30, color: INK, marginBottom: 34 }}>Describe it. Build it. Ship it.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 30 }}>
            {[
              { n: '01', title: 'Describe what you want', desc: "No forms, no jargon. Just tell it what you're trying to build or fix." },
              { n: '02', title: 'Get a full plan', desc: 'A build-ready PRD and step-by-step plan, generated in minutes.' },
              { n: '03', title: 'Build step by step', desc: 'Exact prompts, ready to paste into your tool — one step at a time.' },
              { n: '04', title: 'Ship it', desc: 'Verification checkpoints along the way, so nothing ships half-built.' },
            ].map(card => (
              <div key={card.n} style={{ background: WINDOW, border: `2.5px solid ${BORDER}`, borderRadius: 14, padding: '22px 18px', boxShadow: `5px 5px 0 ${BORDER}` }}>
                <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 26, color: PINK, marginBottom: 10 }}>{card.n}</div>
                <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 15.5, color: INK, marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.5, fontFamily: FB }}>{card.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background: WINDOW, border: `2.5px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: `6px 6px 0 ${BORDER}` }}>
            <div style={{ background: `linear-gradient(90deg, ${GOLD} 0%, #FFE08A 100%)`, borderBottom: `2.5px solid ${BORDER}`, padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 10, fontFamily: FV, fontWeight: 700, fontSize: 15, color: INK }}>
              <TrafficLights size={9} />
              SUPPORTED_TOOLS.EXE
            </div>
            <div style={{ background: WINDOW_ALT, padding: '26px 28px' }}>
              {[
                { name: 'CLAUDE_CODE.EXE', desc: 'Step-by-step prompts for building full apps in the terminal.' },
                { name: 'CODEX.EXE', desc: "Same guided build flow, tuned for OpenAI's coding agent." },
                { name: 'ZAPIER.EXE', desc: 'No-code automation plans for connecting your everyday tools.' },
                { name: 'MAKE.EXE', desc: 'Visual workflow builds, broken into steps you can actually follow.' },
              ].map((tool, i, arr) => (
                <div key={tool.name} style={{ marginBottom: i < arr.length - 1 ? 20 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontFamily: FV, fontWeight: 700, fontSize: 15, color: INK, letterSpacing: '0.03em' }}>{tool.name}</span>
                    <span style={{ fontFamily: FV, fontSize: 13, color: LIME, fontWeight: 700 }}>READY</span>
                  </div>
                  <div style={{ height: 9, border: `1.5px solid ${BORDER}`, borderRadius: 100, background: '#fff', overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ height: '100%', width: '100%', background: `linear-gradient(90deg, ${LIME}, ${GOLD})` }} />
                  </div>
                  <div style={{ fontSize: 12.5, color: INK_SOFT, fontFamily: FB }}>{tool.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BUILT WITH ── */}
        <div style={{ marginTop: 76 }}>
          <SectionHeader
            label="Built with Build AI with AI"
            labelColor={BLUE}
            title="Real apps,"
            accent="actually shipped."
            desc="Every project below was built using Build AI with AI — from idea intake to deployed app."
          />
          {/* Full-width carousel matches SUPPORTED_TOOLS.EXE container width */}
          <PaintCard
            {...BUILT_WITH[activeProject]}
            onPrev={prev}
            onNext={next}
            current={activeProject}
            total={BUILT_WITH.length}
          />
        </div>

        {/* ── PRICING ── */}
        <div style={{ marginTop: 76 }}>
          <div style={{ textAlign: 'center', fontFamily: FV, fontSize: 14, letterSpacing: '0.15em', color: INK, opacity: 0.65, marginBottom: 10, fontWeight: 700 }}>PRICING</div>
          <div style={{ textAlign: 'center', fontFamily: FD, fontWeight: 800, fontSize: 30, color: INK, marginBottom: 34 }}>Simple, honest pricing</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            <PriceCard plan="FREE.EXE" price="$0" priceSub="" features={['1 complete session', 'All supported tools', 'Build Mode, guided']} cta="Get Started Free" ctaHref="/sign-up" />
            <PriceCard plan="PRO.EXE" price="$19" priceSub="/month" features={['Unlimited sessions', 'All tools, all levels', 'Cancel anytime']} cta="Start Pro" ctaHref="/sign-up" popular />
            <PriceCard plan="LIFETIME.EXE" price="$149" priceSub=" once" features={['Everything in Pro', 'Pay once, keep forever', 'All future updates']} cta="Get Lifetime Access" ctaHref="/sign-up" filled />
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ marginTop: 76 }}>
          <div style={{ textAlign: 'center', fontFamily: FV, fontSize: 14, letterSpacing: '0.15em', color: INK, opacity: 0.65, marginBottom: 10, fontWeight: 700 }}>FREQUENTLY ASKED</div>
          <div style={{ textAlign: 'center', fontFamily: FD, fontWeight: 800, fontSize: 30, color: INK, marginBottom: 34 }}>FAQ.HLP</div>
          <div style={{ background: WINDOW, border: `2.5px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: `6px 6px 0 ${BORDER}` }}>
            <div style={{ background: 'linear-gradient(180deg, #F7F6FA 0%, #DCD6EE 100%)', borderBottom: `2.5px solid ${BORDER}`, padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 10, fontFamily: FV, fontWeight: 700, fontSize: 15, color: INK }}>
              <TrafficLights size={9} />
              FAQ.HLP
            </div>
            <div style={{ background: WINDOW_ALT, padding: '14px 18px' }}>
              {['What tools does this work with?', 'Do I need to know how to code?', 'What happens after I finish a level?', 'Can I cancel anytime?', 'Is my project data private?'].map(q => (
                <div key={q} style={{ background: '#fff', border: `2px solid ${BORDER}`, borderRadius: 10, padding: '15px 18px', margin: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontFamily: FD, fontWeight: 600, fontSize: 14.5, color: INK }}>
                  {q}
                  <span style={{ fontFamily: FD, fontWeight: 700, color: VIOLET, fontSize: 17, flexShrink: 0 }}>+</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FINAL CTA ── */}
        <div style={{ textAlign: 'center', background: PANEL_DARK, border: `2.5px solid ${BORDER}`, borderRadius: 18, padding: '46px 30px', marginTop: 76, boxShadow: `7px 7px 0 ${BORDER}` }}>
          <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 28, color: '#fff', marginBottom: 12 }}>Ready to build your next thing?</div>
          <div style={{ fontSize: 14.5, color: TEXT_DIM, marginBottom: 26, fontFamily: FB }}>Free to start. No credit card required.</div>
          <Link href="/sign-up" style={{ background: GOLD, color: '#000', fontFamily: FD, fontWeight: 700, fontSize: 14.5, padding: '14px 26px', border: `2.5px solid ${BORDER}`, borderRadius: 11, boxShadow: `4px 4px 0 ${BORDER}`, textDecoration: 'none', display: 'inline-block' }}>START_BUILDING.EXE &#8594;</Link>
        </div>

        <div style={{ height: 76 }} />
      </div>

      <FixedFooter marqueeFull={marqueeFull} time={time} />
    </div>
  )
}
