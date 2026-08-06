import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

const INK = '#1B1533'
const INK_SOFT = '#5A536F'
const VIOLET = '#9B7FD1'
const GOLD = '#FFCB33'
const WINDOW_ALT = '#ECE9F5'
const BORDER = '#000000'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"
const FV = "var(--font-vt323,'VT323'),monospace"

const appearance = {
  variables: {
    colorPrimary: VIOLET,
    colorBackground: '#ffffff',
    colorInputBackground: WINDOW_ALT,
    colorText: INK,
    colorTextSecondary: INK_SOFT,
    colorInputText: INK,
    borderRadius: '10px',
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontSize: '14px',
  },
  elements: {
    card: {
      boxShadow: 'none',
      border: 'none',
      borderRadius: '0',
      padding: '24px 28px',
      background: '#ffffff',
    },
    headerTitle: {
      fontWeight: '800',
      fontSize: '20px',
      color: INK,
    },
    headerSubtitle: {
      color: INK_SOFT,
      fontSize: '13px',
    },
    formButtonPrimary: {
      background: GOLD,
      border: `2.5px solid ${BORDER}`,
      boxShadow: `3px 3px 0 ${BORDER}`,
      color: INK,
      fontWeight: '700',
      fontSize: '14px',
      borderRadius: '10px',
    },
    socialButtonsBlockButton: {
      border: `2px solid ${BORDER}`,
      boxShadow: `3px 3px 0 ${BORDER}`,
      background: '#ffffff',
      color: INK,
      fontWeight: '600',
      borderRadius: '10px',
    },
    formFieldInput: {
      border: `2px solid ${BORDER}`,
      background: WINDOW_ALT,
      borderRadius: '10px',
      color: INK,
      boxShadow: 'none',
    },
    footerActionLink: {
      color: VIOLET,
      fontWeight: '700',
    },
    dividerLine: {
      background: 'rgba(27,21,51,0.12)',
    },
    dividerText: {
      color: INK_SOFT,
    },
    identityPreviewText: {
      color: INK,
    },
    formFieldLabel: {
      color: INK,
      fontWeight: '600',
      fontSize: '13px',
    },
  },
}

export default function SignInPage() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>

      {/* Fixed background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: [
          'linear-gradient(180deg, #C9AEEA 0%, #9B7FD1 100%)',
          'linear-gradient(rgba(70,50,110,0.14) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(70,50,110,0.14) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '100% 100%, 40px 40px, 40px 40px',
      }} />

      {/* Nav */}
      <nav style={{
        background: '#241D42', borderBottom: `2px solid ${BORDER}`,
        padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 10,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28, background: VIOLET, border: `2px solid ${BORDER}`,
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: '#fff', fontWeight: 700,
          }}>&#9654;</div>
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: '#fff' }}>AI with AI</span>
        </Link>
        <Link href="/sign-up" style={{
          fontFamily: FD, fontWeight: 700, fontSize: 13.5, color: '#fff',
          background: VIOLET, padding: '10px 18px', border: `2.5px solid ${BORDER}`,
          borderRadius: 9, boxShadow: `3px 3px 0 ${BORDER}`, textDecoration: 'none',
        }}>Create account</Link>
      </nav>

      {/* Centered content */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', zIndex: 2,
      }}>
        {/* Retro OS window */}
        <div style={{
          width: '100%', maxWidth: 500,
          background: '#fff', border: `2.5px solid ${BORDER}`,
          borderRadius: 16, overflow: 'hidden', boxShadow: `8px 8px 0 ${BORDER}`,
        }}>
          {/* Titlebar */}
          <div style={{
            background: `linear-gradient(90deg, ${VIOLET} 0%, #7A5CC7 100%)`,
            borderBottom: `2.5px solid ${BORDER}`,
            padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: FV, fontWeight: 700, fontSize: 15, color: '#fff',
          }}>
            <div style={{ display: 'flex', gap: 7 }}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
            </div>
            SIGN_IN.EXE
          </div>

          {/* Browser bar */}
          <div style={{
            background: WINDOW_ALT, borderBottom: `2px solid ${BORDER}`,
            padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: FV, fontSize: 14, color: INK_SOFT,
          }}>
            <span>&#8592;</span><span>&#8594;</span><span>&#8635;</span>
            <div style={{
              flex: 1, background: '#fff', border: `1.5px solid ${BORDER}`,
              borderRadius: 100, padding: '4px 14px', display: 'flex', alignItems: 'center',
              gap: 6, maxWidth: 300, fontFamily: FV, fontSize: 12,
            }}>&#128274; build-ai-with-ai.app/sign-in</div>
          </div>

          {/* Clerk form */}
          <SignIn appearance={appearance} />
        </div>
      </div>
    </div>
  )
}
