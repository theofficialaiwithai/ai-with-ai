import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 40px',
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: 'var(--violet)',
            letterSpacing: '-0.02em',
          }}
        >
          AI with AI
        </span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            href="/sign-in"
            style={{
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-body)',
              padding: '8px 16px',
              borderRadius: '8px',
            }}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            style={{
              background: 'var(--violet)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              padding: '8px 20px',
              borderRadius: '8px',
            }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px 24px 60px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--violet-dim)',
            border: '1px solid var(--border)',
            borderRadius: '999px',
            padding: '6px 16px',
            marginBottom: '32px',
            fontSize: '0.8rem',
            color: 'var(--violet-light)',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--emerald)',
              display: 'inline-block',
            }}
          />
          Now in beta — free to try
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: 'var(--text)',
            maxWidth: '820px',
            marginBottom: '24px',
          }}
        >
          Build AI tools —{' '}
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              color: 'var(--violet-light)',
            }}
          >
            guided by AI
          </span>
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-muted)',
            maxWidth: '560px',
            lineHeight: 1.7,
            marginBottom: '48px',
          }}
        >
          Describe your idea. Get a step-by-step build plan. Follow structured
          steps with a built-in AI assistant at every turn — from first line of
          code to working product.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/sign-up"
            style={{
              background: 'var(--violet)',
              color: '#fff',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '1rem',
              padding: '14px 32px',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Start building free →
          </Link>
          <Link
            href="/sign-in"
            style={{
              background: 'var(--surface)',
              color: 'var(--text)',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: '1rem',
              padding: '14px 32px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
            }}
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          padding: '80px 24px',
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}
        >
          How it works
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginBottom: '56px',
            fontSize: '1rem',
          }}
        >
          Three steps from idea to working AI tool.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {[
            {
              num: '01',
              title: 'Describe your idea',
              body: 'Chat with our AI to clarify what you want to build. It asks the right questions and turns your idea into a structured plan.',
              color: 'var(--violet)',
              dim: 'var(--violet-dim)',
            },
            {
              num: '02',
              title: 'Get a build plan',
              body: 'Receive a detailed, step-by-step blueprint broken into focused tasks — each with clear instructions and a verification checklist.',
              color: 'var(--emerald)',
              dim: 'var(--emerald-dim)',
            },
            {
              num: '03',
              title: 'Build with AI guidance',
              body: 'Work through each step with an AI assistant by your side. Stuck? Ask for help, share a screenshot, and keep moving forward.',
              color: 'var(--amber)',
              dim: 'var(--amber-dim)',
            },
          ].map((step) => (
            <div
              key={step.num}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '32px 28px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-10px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '5rem',
                  fontWeight: 800,
                  color: step.dim,
                  lineHeight: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {step.num}
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: step.dim,
                  border: `1px solid ${step.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color: step.color,
                }}
              >
                {step.num.replace('0', '')}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: '1.15rem',
                  marginBottom: '12px',
                  color: 'var(--text)',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--text-muted)',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section
        style={{
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
          padding: '40px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '32px 48px',
          }}
        >
          {[
            { icon: '🧠', label: 'AI-generated build plans' },
            { icon: '✅', label: 'Step-by-step verification' },
            { icon: '💬', label: 'Built-in chat assistant' },
            { icon: '📸', label: 'Screenshot debugging' },
            { icon: '🔑', label: 'Your own API keys' },
            { icon: '⚡', label: 'Powered by Claude' },
          ].map((f) => (
            <div
              key={f.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                color: 'var(--text-muted)',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
          }}
        >
          Ready to build your AI tool?
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--text-muted)',
            fontSize: '1rem',
            marginBottom: '40px',
          }}
        >
          No prior AI experience needed. Start with an idea.
        </p>
        <Link
          href="/sign-up"
          style={{
            background: 'var(--violet)',
            color: '#fff',
            textDecoration: 'none',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '1.05rem',
            padding: '16px 40px',
            borderRadius: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Get started free →
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--violet)',
          }}
        >
          AI with AI
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--text-faint)',
          }}
        >
          © {new Date().getFullYear()} AI with AI. All rights reserved.
        </span>
      </footer>
    </main>
  )
}
