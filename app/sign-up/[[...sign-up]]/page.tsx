import { SignUp } from '@clerk/nextjs'

const appearance = {
  variables: {
    colorBackground: '#1A1A2E',
    colorInputBackground: '#232340',
    colorText: '#F8FAFC',
    colorTextSecondary: '#94A3B8',
    colorPrimary: '#7C3AED',
    colorInputText: '#F8FAFC',
    colorNeutral: '#94A3B8',
    borderRadius: '0.5rem',
    fontFamily: 'Inter, sans-serif',
  },
  elements: {
    card: { backgroundColor: '#1A1A2E', border: '1px solid rgba(124,58,237,0.18)', boxShadow: 'none' },
    headerTitle: { color: '#F8FAFC' },
    headerSubtitle: { color: '#94A3B8' },
    formButtonPrimary: { backgroundColor: '#7C3AED', '&:hover': { backgroundColor: '#9D5AF0' } },
    footerActionLink: { color: '#7C3AED' },
    identityPreviewText: { color: '#F8FAFC' },
    formFieldLabel: { color: '#94A3B8' },
    dividerLine: { backgroundColor: 'rgba(255,255,255,0.06)' },
    dividerText: { color: '#4A5568' },
    socialButtonsBlockButton: {
      backgroundColor: '#232340',
      border: '1px solid rgba(255,255,255,0.06)',
      color: '#F8FAFC',
    },
  },
}

export default function SignUpPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#0D0D1A' }}
    >
      <div className="mb-8 text-center">
        <h1
          style={{
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#7C3AED',
            marginBottom: '0.5rem',
          }}
        >
          AI with AI
        </h1>
        <p style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem' }}>
          Build more. Get stuck less.
        </p>
      </div>
      <SignUp appearance={appearance} />
    </main>
  )
}
