'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"

export default function PlanLoading() {
  const router = useRouter()

  // Poll: refresh the server component every 2s until the plan appears.
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 2000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      background: '#0D0D1A',
    }}>
      {/* spinner */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '3px solid rgba(124,58,237,0.2)',
        borderTopColor: '#7C3AED',
        animation: 'spin 0.9s linear infinite',
      }} />
      <p style={{
        fontFamily: FD,
        fontSize: 15,
        color: '#94A3B8',
        margin: 0,
      }}>
        Generating your plan…
      </p>
    </div>
  )
}
