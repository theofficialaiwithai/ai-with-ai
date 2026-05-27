import { ensureProfile } from '@/lib/ensure-profile'
import { UserButton } from '@clerk/nextjs'

export default async function DashboardPage() {
  const profile = await ensureProfile()

  return (
    <main className="min-h-screen" style={{ color: '#F8FAFC' }}>
      <nav
        className="flex items-center justify-between px-6 py-4"
        style={{
          background: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            fontWeight: 700,
            fontSize: '1.125rem',
            color: 'var(--violet)',
          }}
        >
          AI with AI
        </span>
        <UserButton />
      </nav>

      <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}
        >
          Dashboard
        </h1>
        {profile && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {profile.email} · {profile.subscriptionStatus}
          </p>
        )}
      </div>
    </main>
  )
}
