import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FB = "var(--font-inter,'Inter'),sans-serif"
const FM = "var(--font-jetbrains-mono,'JetBrains Mono'),monospace"
const FI = "'Instrument Serif',Georgia,serif"

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  const PLATFORMS = ['Claude Code', 'Codex', 'Zapier', 'Make']

  return (
    <main style={{ minHeight: '100vh', background: '#0D0D1A', color: '#F8FAFC', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 56,
        background: 'rgba(13,13,26,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, background: '#7C3AED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0,
          }}>▸</div>
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: '#F8FAFC' }}>AI with AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/sign-in" style={{
            fontFamily: FD, fontSize: 14, fontWeight: 500, color: '#94A3B8',
            textDecoration: 'none', padding: '7px 16px',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
            transition: 'color 0.15s, border-color 0.15s',
          }}>
            Sign in
          </Link>
          <Link href="/sign-up" style={{
            fontFamily: FD, fontSize: 14, fontWeight: 600, color: '#fff',
            textDecoration: 'none', padding: '7px 18px',
            background: '#7C3AED', borderRadius: 8,
          }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        maxWidth: 900, margin: '0 auto',
        padding: 'clamp(64px,10vw,120px) 24px clamp(64px,8vw,100px)',
        textAlign: 'center',
      }}>
        {/* eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 9999, padding: '4px 14px',
          fontFamily: FM, fontSize: 11, fontWeight: 600,
          color: '#F59E0B', letterSpacing: '0.06em', marginBottom: 32,
        }}>
          AI with AI · Open Beta
        </div>

        {/* headline */}
        <h1 style={{
          fontFamily: FD, fontWeight: 700,
          fontSize: 'clamp(48px,7vw,80px)',
          lineHeight: 1.1, letterSpacing: '-0.03em',
          color: '#F8FAFC', margin: '0 0 24px',
        }}>
          Your AI{' '}
          <em style={{ fontFamily: FI, fontStyle: 'italic', color: '#9D5AF0' }}>
            co-builder.
          </em>
          <br />
          One step at a time.
        </h1>

        {/* subheading */}
        <p style={{
          fontFamily: FB, fontSize: 17, color: '#94A3B8',
          lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px',
        }}>
          Describe what you want to build or learn. AI with AI walks you through
          it — step by step, until it&apos;s done.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <Link href="/sign-up" style={{
            fontFamily: FD, fontSize: 16, fontWeight: 700, color: '#fff',
            textDecoration: 'none', padding: '14px 28px',
            background: '#7C3AED', borderRadius: 10,
            boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
          }}>
            Start Building Free
          </Link>
          <a href="#how-it-works" style={{
            fontFamily: FD, fontSize: 16, fontWeight: 500, color: '#94A3B8',
            textDecoration: 'none', padding: '14px 28px',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
          }}>
            See How It Works
          </a>
        </div>

        {/* platform pills */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {PLATFORMS.map(p => (
            <span key={p} style={{
              fontFamily: FB, fontSize: 12, color: '#64748B',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 9999, padding: '4px 14px',
            }}>
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{
        maxWidth: 960, margin: '0 auto',
        padding: 'clamp(48px,8vw,100px) 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            fontFamily: FM, fontSize: 11, letterSpacing: '0.1em', color: '#4A5568',
            textTransform: 'uppercase', marginBottom: 12,
          }}>How it works</div>
          <h2 style={{
            fontFamily: FD, fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700,
            color: '#F8FAFC', letterSpacing: '-0.02em', margin: 0,
          }}>
            Two ways to learn and ship
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
          {/* Build Mode */}
          <ModeColumn
            icon="🔨"
            title="Build Mode"
            accentColor="#7C3AED"
            steps={[
              { n: 1, text: 'Describe what you want to build' },
              { n: 2, text: 'Get a full plan in minutes' },
              { n: 3, text: 'Build step by step with prompts ready to paste' },
            ]}
          />
          {/* Learn Mode */}
          <ModeColumn
            icon="🧠"
            title="Learn Mode"
            accentColor="#F59E0B"
            steps={[
              { n: 1, text: 'Choose your tool and goal' },
              { n: 2, text: 'Get a personalized lesson plan' },
              { n: 3, text: 'Learn through tasks, not lectures' },
            ]}
          />
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{
        maxWidth: 1000, margin: '0 auto',
        padding: 'clamp(48px,8vw,100px) 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            fontFamily: FM, fontSize: 11, letterSpacing: '0.1em', color: '#4A5568',
            textTransform: 'uppercase', marginBottom: 12,
          }}>Pricing</div>
          <h2 style={{
            fontFamily: FD, fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700,
            color: '#F8FAFC', letterSpacing: '-0.02em', margin: 0,
          }}>
            Simple, honest pricing
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
          {/* Free */}
          <PricingCard
            tier="Free"
            price="$0"
            priceSub=""
            features={['1 complete session', 'All 4 platforms', 'Build & Learn modes']}
            cta="Get Started Free"
            ctaHref="/sign-up"
            variant="ghost"
          />
          {/* Pro */}
          <PricingCard
            tier="Pro"
            price="$19"
            priceSub="/month"
            features={['Unlimited sessions', 'All platforms', 'Cancel anytime']}
            cta="Start Pro"
            ctaHref="/sign-up"
            variant="primary"
            highlight
          />
          {/* Lifetime */}
          <PricingCard
            tier="Lifetime"
            price="$149"
            priceSub=" once"
            features={['Everything in Pro', 'Pay once, keep forever', 'All future updates']}
            cta="Get Lifetime Access"
            ctaHref="/sign-up"
            variant="amber"
          />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        maxWidth: 1200, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 18, height: 18, borderRadius: 5, background: '#7C3AED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#fff', fontWeight: 700,
          }}>▸</div>
          <span style={{ fontFamily: FD, fontSize: 14, color: '#4A5568' }}>AI with AI</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/sign-in" style={{ fontFamily: FB, fontSize: 12, color: '#4A5568', textDecoration: 'none' }}>
            Sign in
          </Link>
          <Link href="/sign-up" style={{ fontFamily: FB, fontSize: 12, color: '#4A5568', textDecoration: 'none' }}>
            Get started
          </Link>
        </div>
        <span style={{ fontFamily: FB, fontSize: 12, color: '#374151' }}>
          © {new Date().getFullYear()} AI with AI
        </span>
      </footer>
    </main>
  )
}

/* ── helpers ── */

function ModeColumn({ icon, title, accentColor, steps }: {
  icon: string
  title: string
  accentColor: string
  steps: { n: number; text: string }[]
}) {
  return (
    <div style={{
      background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 18, padding: '32px 28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h3 style={{ fontFamily: FD, fontSize: 18, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>{title}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {steps.map(s => (
          <div key={s.n} style={{ display: 'flex', gap: 14 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: `${accentColor}22`, border: `1px solid ${accentColor}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FM, fontSize: 11, fontWeight: 700, color: accentColor,
            }}>
              {s.n}
            </div>
            <p style={{ fontFamily: FB, fontSize: 14, color: '#94A3B8', margin: 0, lineHeight: 1.7 }}>
              {s.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PricingCard({ tier, price, priceSub, features, cta, ctaHref, variant, highlight }: {
  tier: string
  price: string
  priceSub: string
  features: string[]
  cta: string
  ctaHref: string
  variant: 'ghost' | 'primary' | 'amber'
  highlight?: boolean
}) {
  const borderColor = variant === 'primary'
    ? 'rgba(124,58,237,0.35)'
    : variant === 'amber'
    ? 'rgba(245,158,11,0.35)'
    : 'rgba(255,255,255,0.07)'

  const ctaStyle: React.CSSProperties = variant === 'primary'
    ? { background: '#7C3AED', color: '#fff', border: 'none' }
    : variant === 'amber'
    ? { background: 'none', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.5)' }
    : { background: 'none', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)' }

  return (
    <div style={{
      background: highlight ? 'rgba(124,58,237,0.06)' : '#1A1A2E',
      border: `1px solid ${borderColor}`,
      borderRadius: 18, padding: '32px 28px',
      position: 'relative', display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      {highlight && (
        <div style={{
          position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
          background: '#7C3AED', color: '#fff',
          fontFamily: FM, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          padding: '3px 12px', borderRadius: '0 0 8px 8px',
        }}>
          MOST POPULAR
        </div>
      )}

      <div>
        <div style={{ fontFamily: FD, fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{tier}</div>
        <div style={{ fontFamily: FD, fontSize: 36, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
          {price}
          <span style={{ fontSize: 15, fontWeight: 400, color: '#64748B' }}>{priceSub}</span>
        </div>
      </div>

      <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {features.map(f => (
          <li key={f} style={{ fontFamily: FB, fontSize: 14, color: '#94A3B8', display: 'flex', gap: 8 }}>
            <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span> {f}
          </li>
        ))}
      </ul>

      <Link href={ctaHref} style={{
        display: 'block', textAlign: 'center', textDecoration: 'none',
        borderRadius: 9, padding: '12px 0',
        fontFamily: FD, fontWeight: 600, fontSize: 14,
        marginTop: 'auto', ...ctaStyle,
      }}>
        {cta}
      </Link>
    </div>
  )
}
