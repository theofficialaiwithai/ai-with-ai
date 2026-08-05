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

function WhyCard({ bubble, icon, iconBg, title, desc }: {
  bubble: string; icon: string; iconBg: string; title: string; desc: string
}) {
  return (
    <div style={{
      background: WINDOW, border: `2.5px solid ${BORDER}`, borderRadius: 14,
      overflow: 'hidden', boxShadow: `5px 5px 0 ${BORDER}`, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        background: WINDOW_ALT, borderBottom: `2.5px solid ${BORDER}`,
        padding: '20px 16px', position: 'relative', minHeight: 108,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', top: 14, left: 14, right: 14,
          background: '#fff', border: `1.5px solid ${BORDER}`, borderRadius: 8,
          padding: '7px 10px', fontSize: 11, color: INK, fontWeight: 600,
          boxShadow: `2px 2px 0 ${BORDER}`, fontFamily: FB,
        }}>{bubble}</div>
        <div style={{
          width: 26, height: 26, borderRadius: 6, background: iconBg,
          border: `1.5px solid ${BORDER}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 12, marginTop: 30,
        }}>{icon}</div>
      </div>
      <div style={{ padding: '18px 18px 20px' }}>
        <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: INK, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: INK_SOFT, lineHeight: 1.55, fontFamily: FB }}>{desc}</div>
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
      {active && (
        <div style={{ fontSize: 12.5, color: INK, lineHeight: 1.55, marginTop: 8, paddingLeft: 18, fontFamily: FB }}>{desc}</div>
      )}
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
      <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 12.5, color: INK, marginBottom: 14 }}>
        &#9654; AI with AI
      </div>
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
        boxShadow: `3px 3px 0 ${BORDER}`, textDecoration: 'none', boxSizing: 'border-box',
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
            { label: 'Guided Build', color: LIME },
            { label: 'How It Works', color: PINK },
            { label: 'Pricing', color: GOLD },
            { label: 'FAQ', color: BLUE },
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

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 120, position: 'relative' }}>

      {/* Fixed background pinned to viewport */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0, pointerEvents: 'none',
        backgroundImage: BG_IMAGE,
        backgroundSize: BG_SIZE,
      }} />

      {/* Nav */}
      <LandingNav />

      {/* Content */}
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
            <span>&#8592;</span>
            <span>&#8594;</span>
            <span>&#8635;</span>
            <div style={{
              flex: 1, background: '#fff', border: `1.5px solid ${BORDER}`, borderRadius: 100,
              padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6, maxWidth: 320,
            }}>&#128274; build-ai-with-ai.app</div>
          </div>
          <div style={{ padding: '40px 40px 44px', textAlign: 'center' }}>
            <h1 style={{
              fontFamily: FD, fontWeight: 800, fontSize: 44, lineHeight: 1.12,
              color: INK, margin: '0 0 6px',
            }}>
              Your AI{' '}
              <em style={{ fontFamily: FC, fontWeight: 700, color: VIOLET, fontSize: '1.15em', fontStyle: 'normal' }}>co-builder.</em>
              <br />One step at a time.
            </h1>
            <p style={{
              fontSize: 16, color: INK_SOFT, maxWidth: 500, margin: '14px auto 30px',
              lineHeight: 1.6, fontWeight: 500, fontFamily: FB,
            }}>
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

        {/* Uptime chip */}
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
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 30, marginBottom: 30, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 480 }}>
              <span style={{ display: 'inline-block', fontFamily: FV, fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: PINK, marginBottom: 10 }}>Why Build AI with AI</span>
              <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 28, lineHeight: 1.25, color: INK }}>
                A real co-builder,<br />
                <span style={{ color: INK_SOFT, fontStyle: 'italic', fontWeight: 700 }}>not a chat window in disguise</span>
              </div>
            </div>
            <div style={{ maxWidth: 290, fontSize: 13.5, color: INK_SOFT, lineHeight: 1.6, paddingBottom: 4, fontFamily: FB }}>
              Most AI tools answer questions. Build AI with AI takes initiative — planning your build, writing the exact prompts, and getting sharper about your project with every step.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <WhyCard bubble="Got your context. No need to repeat it." icon="🧠" iconBg={GOLD} title="Always context-aware" desc="It remembers your project, your stack, and your past decisions — so you never have to re-explain yourself." />
            <WhyCard bubble="Step 3 marked done ✓" icon="✅" iconBg={LIME} title="Takes real action" desc="Every step comes with the exact prompt to paste and a verification checklist — not just a document." />
            <WhyCard bubble="Claude Code · Codex · Zapier · Make" icon="🔌" iconBg={BLUE} title="Connects your tools" desc="Plans are written for the tool you actually build in — no translating generic advice into your own stack." />
            <WhyCard bubble="LEVEL 0 → LEVEL 10" icon="📶" iconBg={PINK} title="Gets better with every level" desc="11 levels, from 'type prompts and hope' to autonomous agents — real skill, not busywork." />
          </div>
        </div>

        {/* ── GUIDED BUILDING ── */}
        <div style={{ marginTop: 76 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 30, marginBottom: 30, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 480 }}>
              <span style={{ display: 'inline-block', fontFamily: FV, fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: PINK, marginBottom: 10 }}>Guided Building</span>
              <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 28, lineHeight: 1.25, color: INK }}>
                Describe it once.<br />
                <span style={{ color: INK_SOFT, fontStyle: 'italic', fontWeight: 700 }}>It builds the rest.</span>
              </div>
            </div>
            <div style={{ maxWidth: 290, fontSize: 13.5, color: INK_SOFT, lineHeight: 1.6, paddingBottom: 4, fontFamily: FB }}>
              Describe your build in plain language. Build AI with AI breaks it into levels, generates the exact prompts, and keeps you moving until it&apos;s shipped.
            </div>
          </div>

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
                  <div style={{ fontFamily: FV, fontSize: 10.5, letterSpacing: '0.08em', color: INK_SOFT, opacity: 0.7, margin: '0 0 6px' }}>VERIFY BEFORE MARKING DONE</div>
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
              {[
                'What tools does this work with?',
                'Do I need to know how to code?',
                'What happens after I finish a level?',
                'Can I cancel anytime?',
                'Is my project data private?',
              ].map(q => (
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
