'use client'

import { useState } from 'react'

const BORDER = '#000000'
const FV = "var(--font-vt323,'VT323'),monospace"
const FD = "var(--font-space-grotesk,'Space Grotesk'),sans-serif"

export function TrafficLights({ size = 9 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {(['#FF5F57', '#FEBC2E', '#28C840'] as const).map(c => (
        <div key={c} style={{ width: size, height: size, borderRadius: '50%', background: c, border: `1.5px solid ${BORDER}`, flexShrink: 0 }} />
      ))}
    </div>
  )
}

export interface WindowBarProps {
  gradient: string
  label: string
}

export function WindowBar({ gradient, label }: WindowBarProps) {
  return (
    <div style={{
      background: gradient,
      borderBottom: `2.5px solid ${BORDER}`,
      padding: '9px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      flexShrink: 0,
    }}>
      <TrafficLights size={9} />
      <span style={{ fontFamily: FV, fontSize: 15, color: '#1B1533', fontWeight: 700, marginLeft: 4 }}>
        {label}
      </span>
    </div>
  )
}

export function InfoBar({ label }: { label: string }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #F7F6FA 0%, #DCD6EE 100%)',
      borderBottom: `2.5px solid ${BORDER}`,
      padding: '10px 18px',
      display: 'flex', alignItems: 'center', gap: 10,
      flexShrink: 0,
    }}>
      <TrafficLights size={9} />
      <span style={{ fontFamily: FD, fontSize: 14, color: '#1B1533', fontWeight: 700, letterSpacing: '0.04em' }}>
        {label}
      </span>
    </div>
  )
}

interface WindowCardProps {
  bar?: WindowBarProps
  infoBar?: string
  children: React.ReactNode
  hoverable?: boolean
  onClick?: () => void
  style?: React.CSSProperties
  bodyStyle?: React.CSSProperties
  borderRadius?: number
}

export default function WindowCard({
  bar, infoBar, children, hoverable = false, onClick,
  style = {}, bodyStyle = {}, borderRadius = 14,
}: WindowCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={hoverable ? () => setHovered(true) : undefined}
      onMouseLeave={hoverable ? () => setHovered(false) : undefined}
      style={{
        background: '#FFFFFF',
        border: `2.5px solid ${BORDER}`,
        borderRadius,
        boxShadow: hoverable && hovered ? '7px 7px 0 #000' : '5px 5px 0 #000',
        overflow: 'hidden',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        transform: hoverable && hovered ? 'translate(-2px, -2px)' : 'translate(0, 0)',
        cursor: onClick ? 'pointer' : undefined,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {bar && <WindowBar {...bar} />}
      {infoBar && <InfoBar label={infoBar} />}
      <div style={{ flex: 1, ...bodyStyle }}>{children}</div>
    </div>
  )
}

export function RetroPill({
  children, bg, color, border,
}: { children: React.ReactNode; bg?: string; color?: string; border?: string }) {
  return (
    <span style={{
      fontFamily: FV,
      fontSize: 13, fontWeight: 700,
      display: 'inline-block',
      background: bg ?? '#ECE9F5',
      color: color ?? '#5A536F',
      border: `1.5px solid ${border ?? BORDER}`,
      borderRadius: 100,
      padding: '3px 11px',
    }}>
      {children}
    </span>
  )
}

export function RetroButton({
  children, onClick, variant = 'primary', disabled = false, type = 'button', style = {},
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'violet'
  disabled?: boolean
  type?: 'button' | 'submit'
  style?: React.CSSProperties
}) {
  const [hovered, setHovered] = useState(false)

  const variants = {
    primary:   { bg: '#FFCB33', color: '#000000' },
    secondary: { bg: '#FFFFFF', color: '#1B1533' },
    violet:    { bg: '#9B7FD1', color: '#FFFFFF' },
  }
  const v = variants[variant]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: disabled ? '#ccc' : v.bg,
        color: v.color,
        border: `2.5px solid ${BORDER}`,
        borderRadius: 10,
        fontFamily: FD,
        fontWeight: 700,
        fontSize: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : hovered ? '5px 5px 0 #000' : '3px 3px 0 #000',
        transform: !disabled && hovered ? 'translate(-2px, -2px)' : 'translate(0, 0)',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        padding: '10px 20px',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
